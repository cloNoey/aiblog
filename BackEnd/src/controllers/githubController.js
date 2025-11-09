const { createGitHubClient, makeGitHubRequest } = require('../utils/githubClient')
const { transformRepositories, transformCommits, transformPullRequests } = require('../utils/responseTransformers')
const { sendUnauthorized, sendBadRequest, handleGitHubError } = require('../utils/errorHandler')

/**
 * 사용자의 GitHub 저장소 목록 조회 (소유 + Collaborator 포함)
 * GET /api/github/repositories
 * 헤더: X-GitHub-Token: <GitHub Access Token>
 */
const getRepositories = async (req, res) => {
  try {
    if (!req.user) {
      return sendUnauthorized(res, 'Not authenticated')
    }

    const accessToken = req.headers['x-github-token']

    if (!accessToken) {
      return sendUnauthorized(res, 'GitHub access token not found. Please provide X-GitHub-Token header')
    }

    try {
      // GitHub 클라이언트 생성
      const octokit = createGitHubClient(accessToken)

      // 1단계: 사용자가 소유한 리포지토리 조회
      const ownedResponse = await makeGitHubRequest(octokit, 'GET /user/repos', {
        type: 'owner',
        per_page: 100,
        sort: 'updated',
        direction: 'desc',
      })

      // 2단계: Collaborator 리포지토리 조회
      const collaboratorResponse = await makeGitHubRequest(octokit, 'GET /user/repos', {
        type: 'member',
        per_page: 100,
        sort: 'updated',
        direction: 'desc',
      })

      // 리포지토리 합치기 (중복 제거)
      const allRepos = [...ownedResponse.data, ...collaboratorResponse.data]
      const uniqueReposMap = new Map()

      allRepos.forEach((repo) => {
        if (!uniqueReposMap.has(repo.id)) {
          uniqueReposMap.set(repo.id, repo)
        }
      })

      // 응답 데이터 형식 변환
      const repositories = transformRepositories(Array.from(uniqueReposMap.values()))

      res.json({
        success: true,
        data: repositories,
      })
    } catch (apiError) {
      return handleGitHubError(apiError, res, 'Get repositories')
    }
  } catch (error) {
    return handleGitHubError(error, res, 'Get repositories')
  }
}

/**
 * 저장소의 커밋 목록 조회
 * GET /api/github/commits?owner=username&repo=repository-name
 * 헤더: X-GitHub-Token: <GitHub Access Token>
 */
const getCommits = async (req, res) => {
  try {
    if (!req.user) {
      return sendUnauthorized(res, 'Not authenticated')
    }

    const { owner, repo } = req.query
    const accessToken = req.headers['x-github-token']

    if (!owner || !repo) {
      return sendBadRequest(res, 'owner and repo parameters are required')
    }

    if (!accessToken) {
      return sendUnauthorized(res, 'GitHub access token not found. Please provide X-GitHub-Token header')
    }

    try {
      // GitHub 클라이언트 생성
      const octokit = createGitHubClient(accessToken)

      // GitHub API로 커밋 목록 조회
      const response = await makeGitHubRequest(octokit, 'GET /repos/{owner}/{repo}/commits', {
        owner,
        repo,
        per_page: 100,
      })

      // 응답 데이터 형식 변환
      const commits = transformCommits(response.data)

      res.json({
        success: true,
        data: commits,
      })
    } catch (apiError) {
      return handleGitHubError(apiError, res, 'Get commits')
    }
  } catch (error) {
    return handleGitHubError(error, res, 'Get commits')
  }
}

/**
 * 저장소의 Pull Requests 목록 조회
 * GET /api/github/pulls?owner=username&repo=repository-name
 * 헤더: X-GitHub-Token: <GitHub Access Token>
 */
const getPullRequests = async (req, res) => {
  try {
    if (!req.user) {
      return sendUnauthorized(res, 'Not authenticated')
    }

    const { owner, repo } = req.query
    const accessToken = req.headers['x-github-token']

    if (!owner || !repo) {
      return sendBadRequest(res, 'owner and repo parameters are required')
    }

    if (!accessToken) {
      return sendUnauthorized(res, 'GitHub access token not found. Please provide X-GitHub-Token header')
    }

    try {
      // GitHub 클라이언트 생성
      const octokit = createGitHubClient(accessToken)

      // GitHub API로 PR 목록 조회 (모든 상태)
      const response = await makeGitHubRequest(octokit, 'GET /repos/{owner}/{repo}/pulls', {
        owner,
        repo,
        state: 'all',
        per_page: 100,
        sort: 'updated',
        direction: 'desc',
      })

      // 응답 데이터 형식 변환
      const pullRequests = transformPullRequests(response.data)

      res.json({
        success: true,
        data: pullRequests,
      })
    } catch (apiError) {
      return handleGitHubError(apiError, res, 'Get pull requests')
    }
  } catch (error) {
    return handleGitHubError(error, res, 'Get pull requests')
  }
}

module.exports = {
  getRepositories,
  getCommits,
  getPullRequests,
}
