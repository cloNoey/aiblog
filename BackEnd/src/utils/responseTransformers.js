/**
 * 저장소 데이터 변환
 * GitHub API 응답 → 클라이언트 응답 포맷
 */
const transformRepository = (repo) => ({
  id: repo.id.toString(),
  name: repo.name,
  owner: repo.owner?.login || '',
  private: repo.private === true,
})

/**
 * 커밋 데이터 변환
 * GitHub API 응답 → 클라이언트 응답 포맷
 * 데이터가 없는 경우 안전하게 처리
 */
const transformCommit = (commit) => {
  try {
    const messageText = commit.commit?.message || ''
    const authorName = commit.commit?.author?.name || 'Unknown'
    const authorDate = commit.commit?.author?.date || new Date().toISOString()

    return {
      id: commit.sha,
      message: messageText.split('\n')[0] || '(no message)', // 첫 줄만
      author: authorName,
      date: new Date(authorDate).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      sha: commit.sha,
    }
  } catch (error) {
    // 변환 실패 시 기본값 반환
    return {
      id: commit.sha || 'unknown',
      message: '(unable to parse)',
      author: 'Unknown',
      date: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      sha: commit.sha || 'unknown',
    }
  }
}

/**
 * Pull Request 데이터 변환
 * GitHub API 응답 → 클라이언트 응답 포맷
 * 데이터가 없는 경우 안전하게 처리
 */
const transformPullRequest = (pr) => {
  try {
    const title = pr.title || '(no title)'
    const author = pr.user?.login || 'Unknown'
    const updatedAt = pr.updated_at || new Date().toISOString()
    const status = pr.state || 'unknown'
    const description = pr.body || ''

    return {
      id: pr.id.toString(),
      title,
      author,
      date: new Date(updatedAt).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      number: pr.number,
      status, // 'open', 'closed', 'merged'
      description,
    }
  } catch (error) {
    // 변환 실패 시 기본값 반환
    return {
      id: pr.id?.toString() || 'unknown',
      title: '(unable to parse)',
      author: 'Unknown',
      date: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      number: pr.number || 0,
      status: 'unknown',
      description: '',
    }
  }
}

/**
 * 저장소 배열 변환
 */
const transformRepositories = (repos) => repos.map(transformRepository)

/**
 * 커밋 배열 변환
 */
const transformCommits = (commits) => commits.map(transformCommit)

/**
 * Pull Request 배열 변환
 */
const transformPullRequests = (prs) => prs.map(transformPullRequest)

module.exports = {
  transformRepository,
  transformCommit,
  transformPullRequest,
  transformRepositories,
  transformCommits,
  transformPullRequests,
}
