import { STORAGE_KEYS } from './constants'

export const storage = {
  getAccessToken: () => localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
  getRefreshToken: () => localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
  getGithubToken: () => localStorage.getItem(STORAGE_KEYS.GITHUB_TOKEN),

  setAccessToken: (token: string) =>
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token),
  setRefreshToken: (token: string) =>
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token),
  setGithubToken: (token: string) =>
    localStorage.setItem(STORAGE_KEYS.GITHUB_TOKEN, token),

  setTokens: (accessToken: string, refreshToken: string, githubToken?: string) => {
    storage.setAccessToken(accessToken)
    storage.setRefreshToken(refreshToken)
    if (githubToken) {
      storage.setGithubToken(githubToken)
    }
  },

  isAuthenticated: () => {
    return !!storage.getAccessToken() && !!storage.getGithubToken()
  },

  clear: () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.GITHUB_TOKEN)
  },
}
