const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRE_IN = process.env.JWT_EXPIRE_IN
const JWT_REFRESH_EXPIRE_IN = process.env.JWT_REFRESH_EXPIRE_IN

/**
 * 액세스 토큰 생성
 */
const generateAccessToken = (payload) => {
  const options = {
    expiresIn: JWT_EXPIRE_IN,
  }
  return jwt.sign(payload, JWT_SECRET, options)
}

/**
 * 리프레시 토큰 생성
 */
const generateRefreshToken = (githubId) => {
  const options = {
    expiresIn: JWT_REFRESH_EXPIRE_IN,
  }
  return jwt.sign({ githubId }, JWT_SECRET, options)
}

/**
 * 토큰 검증 및 디코딩
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded
  } catch (error) {
    return null
  }
}

/**
 * 리프레시 토큰 검증
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded
  } catch (error) {
    return null
  }
}

/**
 * 토큰에서 만료 시간 가져오기 (초 단위)
 */
const getTokenExpiry = (token) => {
  try {
    const decoded = jwt.decode(token)
    if (decoded && decoded.exp) {
      return decoded.exp - Math.floor(Date.now() / 1000)
    }
    return 0
  } catch (error) {
    return 0
  }
}

/**
 * Authorization 헤더에서 Bearer 토큰 추출
 * @param {string} authHeader - Authorization 헤더 값
 * @returns {string|null} 추출된 토큰 또는 null
 */
const extractBearerToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  getTokenExpiry,
  extractBearerToken,
}
