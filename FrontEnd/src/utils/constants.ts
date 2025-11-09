export const API_BASE_URL = 'http://localhost:8000'
export const AUTH_GITHUB_URL = `${API_BASE_URL}/api/auth/github`

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  GITHUB_TOKEN: 'githubToken',
} as const

export const ROUTES = {
  HOME: '/',
  CALLBACK: '/callback',
} as const
