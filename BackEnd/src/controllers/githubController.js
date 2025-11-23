const {
  createGitHubClient,
  makeGitHubRequest,
  fetchPullRequestFiles,
  fetchPullRequestComments,
  fetchRepositoryReadme,
  fetchCommitFileDiffs,
  GITHUB_PER_PAGE,
} = require('../utils/githubClient')
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
        per_page: GITHUB_PER_PAGE,
        sort: 'updated',
        direction: 'desc',
      })

      // 2단계: Collaborator 리포지토리 조회
      const collaboratorResponse = await makeGitHubRequest(octokit, 'GET /user/repos', {
        type: 'member',
        per_page: GITHUB_PER_PAGE,
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
        per_page: GITHUB_PER_PAGE,
      })

      // 응답이 없거나 빈 배열인 경우 처리
      if (!response || !response.data || response.data.length === 0) {
        return res.json({
          success: true,
          data: [],
        })
      }

      // 응답 데이터 형식 변환
      const commits = transformCommits(response.data)

      res.json({
        success: true,
        data: commits,
      })
    } catch (apiError) {
      // 커밋이 없는 경우(204, 빈 배열, 또는 특정 에러)는 정상으로 처리
      if (apiError.status === 204 || apiError.status === 404 ||
          (apiError.response && apiError.response.status === 409)) {
        return res.json({
          success: true,
          data: [],
        })
      }
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
        per_page: GITHUB_PER_PAGE,
        sort: 'updated',
        direction: 'desc',
      })

      // 응답이 없거나 빈 배열인 경우 처리
      if (!response || !response.data || response.data.length === 0) {
        return res.json({
          success: true,
          data: [],
        })
      }

      // 응답 데이터 형식 변환
      const pullRequests = transformPullRequests(response.data)

      res.json({
        success: true,
        data: pullRequests,
      })
    } catch (apiError) {
      // PR이 없는 경우(204, 빈 배열, 또는 특정 에러)는 정상으로 처리
      if (apiError.status === 204 || apiError.status === 404 ||
          (apiError.response && apiError.response.status === 409)) {
        return res.json({
          success: true,
          data: [],
        })
      }
      return handleGitHubError(apiError, res, 'Get pull requests')
    }
  } catch (error) {
    return handleGitHubError(error, res, 'Get pull requests')
  }
}

/**
 * PR 상세 정보 조회 (본문, 코멘트, README 포함)
 * GET /api/github/pull/:owner/:repo/:number/details
 * 헤더: X-GitHub-Token: <GitHub Access Token>
 */
const getPullRequestDetails = async (req, res) => {
  try {
    if (!req.user) {
      return sendUnauthorized(res, 'Not authenticated')
    }

    const { owner, repo, number } = req.params
    const accessToken = req.headers['x-github-token']

    if (!owner || !repo || !number) {
      return sendBadRequest(res, 'owner, repo, and number parameters are required')
    }

    if (!accessToken) {
      return sendUnauthorized(res, 'GitHub access token not found. Please provide X-GitHub-Token header')
    }

    try {
      const octokit = createGitHubClient(accessToken)

      // PR 상세 정보 조회
      const prResponse = await makeGitHubRequest(
        octokit,
        'GET /repos/{owner}/{repo}/pulls/{pull_number}',
        {
          owner,
          repo,
          pull_number: number,
        }
      )

      // 병렬로 모든 상세 정보 조회 (파일, 코멘트, README)
      const [files, comments, readme] = await Promise.all([
        fetchPullRequestFiles(octokit, owner, repo, number),
        fetchPullRequestComments(octokit, owner, repo, number),
        fetchRepositoryReadme(octokit, owner, repo),
      ])

      const details = {
        body: prResponse.data.body || '',
        comments,
        readme,
        files,
      }

      res.json({
        success: true,
        data: details,
      })
    } catch (apiError) {
      return handleGitHubError(apiError, res, 'Get pull request details')
    }
  } catch (error) {
    return handleGitHubError(error, res, 'Get pull request details')
  }
}

/**
 * Commit 상세 정보 조회 (파일 diff 포함)
 * GET /api/github/commit/:owner/:repo/:sha/details
 * 헤더: X-GitHub-Token: <GitHub Access Token>
 */
const getCommitDetails = async (req, res) => {
  try {
    if (!req.user) {
      return sendUnauthorized(res, 'Not authenticated')
    }

    const { owner, repo, sha } = req.params
    const accessToken = req.headers['x-github-token']

    if (!owner || !repo || !sha) {
      return sendBadRequest(res, 'owner, repo, and sha parameters are required')
    }

    if (!accessToken) {
      return sendUnauthorized(res, 'GitHub access token not found. Please provide X-GitHub-Token header')
    }

    try {
      const octokit = createGitHubClient(accessToken)

      // Commit 상세 정보 조회
      const commitResponse = await makeGitHubRequest(
        octokit,
        'GET /repos/{owner}/{repo}/commits/{ref}',
        {
          owner,
          repo,
          ref: sha,
        }
      )

      const commit = commitResponse.data
      const details = {
        message: commit.commit.message || '',
        author: commit.commit.author.name || '',
        date: commit.commit.author.date || '',
        files: '',
      }

      // 파일 변경사항 조회 (부모 commit과 현재 commit 비교)
      if (commit.parents && commit.parents.length > 0) {
        const parentSha = commit.parents[0].sha
        details.files = await fetchCommitFileDiffs(octokit, owner, repo, parentSha, sha)
      }

      res.json({
        success: true,
        data: details,
      })
    } catch (apiError) {
      return handleGitHubError(apiError, res, 'Get commit details')
    }
  } catch (error) {
    return handleGitHubError(error, res, 'Get commit details')
  }
}

module.exports = {
  getRepositories,
  getCommits,
  getPullRequests,
  getPullRequestDetails,
  getCommitDetails,
}
