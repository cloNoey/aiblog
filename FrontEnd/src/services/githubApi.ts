import apiClient from './api'

interface User {
  id: number
  login: string
  email?: string
  avatar_url?: string
}

interface Repository {
  id: string
  name: string
  owner: string
  private?: boolean
}

interface Commit {
  id: string
  message: string
  author: string
  date: string
  sha?: string
}

interface PullRequest {
  id: string
  title: string
  author: string
  date: string
  number?: number
  status?: 'open' | 'closed' | 'merged'
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

/**
 * 현재 로그인한 사용자 정보 조회
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me')
    return response.data.data || null
  } catch (error) {
    return null
  }
}

/**
 * 사용자의 GitHub 저장소 목록 조회
 */
export const getRepositories = async (): Promise<Repository[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Repository[]>>('/github/repositories')
    return response.data.data || []
  } catch (error) {
    throw error
  }
}

/**
 * 저장소의 커밋 목록 조회
 * 커밋이 없는 레포는 빈 배열을 반환 (에러 아님)
 */
export const getCommits = async (owner: string, repo: string): Promise<Commit[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Commit[]>>('/github/commits', {
      params: {
        owner,
        repo,
      },
    })
    return response.data.data || []
  } catch (error) {
    // 커밋이 없는 경우는 정상이므로 빈 배열 반환
    // 실제 에러(401, 403, 404 등)는 api.ts의 인터셉터에서 처리됨
    return []
  }
}

/**
 * 저장소의 Pull Requests 목록 조회
 * PR이 없는 레포는 빈 배열을 반환 (에러 아님)
 */
export const getPullRequests = async (owner: string, repo: string): Promise<PullRequest[]> => {
  try {
    const response = await apiClient.get<ApiResponse<PullRequest[]>>('/github/pulls', {
      params: {
        owner,
        repo,
      },
    })
    return response.data.data || []
  } catch (error) {
    // PR이 없는 경우는 정상이므로 빈 배열 반환
    // 실제 에러(401, 403, 404 등)는 api.ts의 인터셉터에서 처리됨
    return []
  }
}
