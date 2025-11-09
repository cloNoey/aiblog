const { verifyToken, extractBearerToken } = require('../utils/tokenUtils')
const { sendUnauthorized, handleError } = require('../utils/errorHandler')

/**
 * JWT 인증 미들웨어
 * Authorization 헤더에서 토큰을 추출하여 검증
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = extractBearerToken(authHeader)

    if (!token) {
      return sendUnauthorized(res, 'Missing or invalid authorization header')
    }

    const user = verifyToken(token)

    if (!user) {
      return sendUnauthorized(res, 'Invalid or expired token')
    }

    req.user = user
    next()
  } catch (error) {
    return handleError(error, res, 'Authentication error', 500)
  }
}

/**
 * GitHub 토큰 검증 미들웨어
 * X-GitHub-Token 헤더에서 GitHub 액세스 토큰을 검증
 */
const githubTokenMiddleware = (req, res, next) => {
  try {
    const githubToken = req.headers['x-github-token']

    if (!githubToken) {
      return sendUnauthorized(res, 'GitHub access token not found. Please provide X-GitHub-Token header')
    }

    // 토큰이 있으면 다음 미들웨어로 진행
    // 실제 검증은 GitHub API 호출 시 이루어짐
    next()
  } catch (error) {
    return handleError(error, res, 'GitHub token validation error', 500)
  }
}

module.exports = { authMiddleware, githubTokenMiddleware }
