import { useState, useEffect } from 'react'
import { storage } from '@/utils/storage'

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // GitHub OAuth 콜백 처리
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const accessToken = params.get('accessToken')
    const refreshToken = params.get('refreshToken')
    const githubAccessToken = params.get('githubAccessToken')

    if (accessToken && refreshToken) {
      storage.setTokens(accessToken, refreshToken, githubAccessToken || undefined)
      setIsAuthenticated(true)
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (storage.isAuthenticated()) {
      setIsAuthenticated(true)
    }
  }, [])

  const logout = () => {
    storage.clear()
    setIsAuthenticated(false)
  }

  return { isAuthenticated, setIsAuthenticated, logout }
}
