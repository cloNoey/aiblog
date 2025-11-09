import { useState } from 'react'
import type { CommitData, PullRequestData } from '@/components/List'

export interface Repository {
  id: string
  name: string
  owner: string
  private?: boolean
}

export const useRepository = () => {
  const [selectedRepository, setSelectedRepository] = useState(false)
  const [repositoryName, setRepositoryName] = useState<string>('')
  const [repositoryOwner, setRepositoryOwner] = useState<string>('')
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [commits, setCommits] = useState<CommitData[]>([])
  const [pullRequests, setPullRequests] = useState<PullRequestData[]>([])
  const [loading, setLoading] = useState(false)

  const selectRepository = (repository: Repository) => {
    setRepositoryName(repository.name)
    setRepositoryOwner(repository.owner)
    setSelectedRepository(true)
  }

  const resetRepository = () => {
    setCommits([])
    setPullRequests([])
    setSelectedRepository(false)
    setRepositoryName('')
    setRepositoryOwner('')
  }

  const clearRepositories = () => {
    setRepositories([])
    resetRepository()
  }

  return {
    selectedRepository,
    repositoryName,
    repositoryOwner,
    repositories,
    commits,
    pullRequests,
    loading,
    setRepositories,
    setCommits,
    setPullRequests,
    setLoading,
    selectRepository,
    resetRepository,
    clearRepositories,
  }
}
