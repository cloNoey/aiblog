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
 */
const transformCommit = (commit) => ({
  id: commit.sha,
  message: commit.commit.message.split('\n')[0], // 첫 줄만
  author: commit.commit.author.name,
  date: new Date(commit.commit.author.date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }),
  sha: commit.sha,
})

/**
 * Pull Request 데이터 변환
 * GitHub API 응답 → 클라이언트 응답 포맷
 */
const transformPullRequest = (pr) => ({
  id: pr.id.toString(),
  title: pr.title,
  author: pr.user.login,
  date: new Date(pr.updated_at).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }),
  number: pr.number,
  status: pr.state, // 'open', 'closed'
})

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
