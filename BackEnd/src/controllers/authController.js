const { generateAccessToken, generateRefreshToken, verifyRefreshToken, getTokenExpiry } = require('../utils/tokenUtils')
const { tokenStore } = require('../services/tokenService')
const { sendUnauthorized, sendBadRequest, handleError } = require('../utils/errorHandler')
const { add } = require('date-fns')

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

/**
 * GitHub OAuth 콜백 핸들러
 * GitHub에서 인증 후 리다이렉트되는 엔드포인트
 */
const githubCallback = (req, res) => {
  try {
    if (!req.user) {
      return sendUnauthorized(res, 'Authentication failed')
    }

    const user = req.user

    // 액세스 토큰 생성
    const accessToken = generateAccessToken(user)

    // 리프레시 토큰 생성
    const refreshToken = generateRefreshToken(user.id)

    // 리프레시 토큰 저장 (30일 유효)
    const refreshTokenExpiry = add(new Date(), { days: 30 })
    tokenStore.saveRefreshToken(refreshToken, {
      githubId: user.id,
      expiresAt: refreshTokenExpiry,
    })

    // 액세스 토큰 만료 시간 (초)
    const expiresIn = getTokenExpiry(accessToken)

    // 프론트엔드로 리다이렉트 (토큰 전달)
    const redirectUrl = new URL(`${FRONTEND_URL}/auth/callback`)
    redirectUrl.searchParams.append('accessToken', accessToken)
    redirectUrl.searchParams.append('refreshToken', refreshToken)
    redirectUrl.searchParams.append('expiresIn', expiresIn.toString())
    redirectUrl.searchParams.append('githubAccessToken', user.githubAccessToken)

    res.redirect(redirectUrl.toString())
  } catch (error) {
    return handleError(error, res, 'Authentication error', 500)
  }
}

/**
 * 토큰 갱신
 * 리프레시 토큰으로 새 액세스 토큰 발급
 */
const refreshTokenHandler = (req, res) => {
  try {
    const { refreshToken: token } = req.body

    if (!token) {
      return sendBadRequest(res, 'Refresh token is required')
    }

    // 리프레시 토큰 검증
    const decoded = verifyRefreshToken(token)

    if (!decoded) {
      return sendUnauthorized(res, 'Invalid or expired refresh token')
    }

    // 저장된 리프레시 토큰 확인
    const tokenData = tokenStore.getRefreshToken(token)

    if (!tokenData) {
      return sendUnauthorized(res, 'Refresh token not found')
    }

    // 새 액세스 토큰 생성
    const newAccessToken = generateAccessToken({
      id: decoded.githubId,
      login: '', // GitHub ID만 가지고 있으므로 빈값으로 설정
      email: null,
      avatar_url: '',
    })

    const expiresIn = getTokenExpiry(newAccessToken)

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        expiresIn,
      },
    })
  } catch (error) {
    return handleError(error, res, 'Token refresh error', 500)
  }
}

/**
 * 로그아웃
 * 리프레시 토큰 삭제
 */
const logout = (req, res) => {
  try {
    const { refreshToken: token } = req.body

    if (token) {
      tokenStore.deleteRefreshToken(token)
    }

    if (req.user) {
      // 해당 사용자의 모든 토큰 삭제 (완전 로그아웃)
      tokenStore.deleteUserTokens(req.user.id)
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    })
  } catch (error) {
    return handleError(error, res, 'Logout error', 500)
  }
}

/**
 * 현재 사용자 정보 조회
 */
const getCurrentUser = (req, res) => {
  try {
    if (!req.user) {
      return sendUnauthorized(res, 'Not authenticated')
    }

    res.json({
      success: true,
      data: req.user,
    })
  } catch (error) {
    return handleError(error, res, 'Error fetching user information', 500)
  }
}

module.exports = {
  githubCallback,
  refreshTokenHandler,
  logout,
  getCurrentUser,
}
