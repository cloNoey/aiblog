/**
 * GitHub API 에러 처리
 * @param {Error} error - GitHub API 에러
 * @param {object} res - Express 응답 객체
 * @param {string} context - 에러 컨텍스트 (로깅용)
 */
const handleGitHubError = (error, res, context = 'GitHub API') => {
  console.error(`${context} error:`, error.message)

  if (error.status === 401) {
    return res.status(401).json({
      success: false,
      message: 'Invalid GitHub access token',
    })
  }

  if (error.status === 403) {
    return res.status(403).json({
      success: false,
      message: 'GitHub API rate limit exceeded',
    })
  }

  if (error.status === 404) {
    return res.status(404).json({
      success: false,
      message: 'Repository not found',
    })
  }

  // 기본 에러 응답
  return res.status(500).json({
    success: false,
    message: `Failed to fetch data from ${context}`,
  })
}

/**
 * 일반 에러 처리
 * @param {Error} error - 에러 객체
 * @param {object} res - Express 응답 객체
 * @param {string} message - 에러 메시지
 * @param {number} statusCode - HTTP 상태 코드 (기본: 500)
 */
const handleError = (error, res, message = 'Internal server error', statusCode = 500) => {
  console.error(message, error)
  return res.status(statusCode).json({
    success: false,
    message,
  })
}

/**
 * 인증 에러 응답
 * @param {object} res - Express 응답 객체
 * @param {string} message - 에러 메시지
 */
const sendUnauthorized = (res, message = 'Not authenticated') => {
  return res.status(401).json({
    success: false,
    message,
  })
}

/**
 * 검증 에러 응답
 * @param {object} res - Express 응답 객체
 * @param {string} message - 에러 메시지
 */
const sendBadRequest = (res, message = 'Bad request') => {
  return res.status(400).json({
    success: false,
    message,
  })
}

module.exports = {
  handleGitHubError,
  handleError,
  sendUnauthorized,
  sendBadRequest,
}
