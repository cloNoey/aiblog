import { useEffect } from 'react'
import { getRepositories, getCommits, getPullRequests } from '@/services/githubApi'

interface UseFetchDataProps {
  isAuthenticated: boolean
  repositoriesLength: number
  selectedRepository: boolean
  repositoryName: string
  repositoryOwner: string
  setRepositories: (data: any[]) => void
  setCommits: (data: any[]) => void
  setPullRequests: (data: any[]) => void
  setLoading: (loading: boolean) => void
}

export const useFetchData = ({
  isAuthenticated,
  repositoriesLength,
  selectedRepository,
  repositoryName,
  repositoryOwner,
  setRepositories,
  setCommits,
  setPullRequests,
  setLoading,
}: UseFetchDataProps) => {
  // 레포지토리 목록 조회
  useEffect(() => {
    if (isAuthenticated && repositoriesLength === 0) {
      fetchRepositories()
    }
  }, [isAuthenticated])

  // 레포지토리 선택 시 커밋과 PR 조회
  useEffect(() => {
    if (isAuthenticated && selectedRepository && repositoryName && repositoryOwner) {
      fetchCommitsAndPRs()
    }
  }, [selectedRepository, repositoryName, repositoryOwner, isAuthenticated])

  const fetchRepositories = async () => {
    try {
      setLoading(true)
      const data = await getRepositories()
      setRepositories(data)
    } catch (err) {
      console.error('Failed to fetch repositories:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCommitsAndPRs = async () => {
    try {
      setLoading(true)

      if (!repositoryName || !repositoryOwner) {
        return
      }

      const commitsData = await getCommits(repositoryOwner, repositoryName)
      const prsData = await getPullRequests(repositoryOwner, repositoryName)

      setCommits(commitsData)
      setPullRequests(prsData)
    } catch (err) {
      console.error('Failed to fetch commits and PRs:', err)
    } finally {
      setLoading(false)
    }
  }
}
