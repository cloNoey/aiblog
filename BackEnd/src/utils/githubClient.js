const { Octokit } = require('@octokit/core')

const GITHUB_API_VERSION = '2022-11-28'

/**
 * GitHub API 클라이언트 생성
 * @param {string} accessToken - GitHub access token
 * @returns {Octokit} Octokit 인스턴스
 */
const createGitHubClient = (accessToken) => {
  return new Octokit({
    auth: accessToken,
    userAgent: 'AIBlog/1.0.0',
  })
}

/**
 * GitHub API 공통 요청 함수
 * @param {Octokit} octokit - Octokit 인스턴스
 * @param {string} endpoint - GitHub API 엔드포인트
 * @param {object} params - 요청 파라미터
 * @returns {Promise} GitHub API 응답
 */
const makeGitHubRequest = async (octokit, endpoint, params = {}) => {
  return octokit.request(endpoint, {
    ...params,
    headers: {
      'X-GitHub-Api-Version': GITHUB_API_VERSION,
      ...params.headers,
    },
  })
}

module.exports = {
  createGitHubClient,
  makeGitHubRequest,
  GITHUB_API_VERSION,
}
