import { useRef } from 'react'
import LoginButton from '@/components/LoginButton'
import SearchBar from '@/components/SearchBar'
import List from '@/components/List'
import { useAuth } from '@/hooks/useAuth'
import { useRepository } from '@/hooks/useRepository'
import { useFetchData } from '@/hooks/useFetchData'
import { AUTH_GITHUB_URL } from '@/utils/constants'

export default function MainPage() {
  const resetSearchRef = useRef<(() => void) | null>(null)

  // Auth hook
  const { isAuthenticated, logout } = useAuth()

  // Repository hook
  const {
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
  } = useRepository()

  // Fetch data hook
  useFetchData({
    isAuthenticated,
    repositoriesLength: repositories.length,
    selectedRepository,
    repositoryName,
    repositoryOwner,
    setRepositories,
    setCommits,
    setPullRequests,
    setLoading,
  })

  const handleAuthClick = () => {
    if (isAuthenticated) {
      logout()
      clearRepositories()
    } else {
      window.location.href = AUTH_GITHUB_URL
    }
  }

  const handleSearch = (repository: any) => {
    selectRepository(repository)
  }

  const handleReset = () => {
    resetRepository()
    if (resetSearchRef.current) {
      resetSearchRef.current()
    }
  }

  return (
    <div className="flex w-full p-[45px] bg-primary-bg mx-auto min-h-screen">
      <div className="pb-[30px] w-full rounded-outer border-thick border-primary-line bg-primary-header" aria-label="main-page-body">
        <header className="w-full h-[100px] flex border-b border-primary-line" aria-label="header">
          <div className="w-full h-full flex gap-[8px] pl-[45px] cursor-pointer" onClick={handleReset}>
            <div className="w-[150px] font-bold text-header flex items-center">Smart Blog</div>
            <div className="font-regular text-caption flex mt-[35px]">with</div>
            <img src={'/assets/GitHub_Logo.png'} alt="logo" className="w-[56px] h-[23px] mt-[32px] -translate-x-[8px]" />
          </div>
          <div className="w-full h-full flex justify-end mr-[30px] items-center gap-[8px]">
            <LoginButton isAuthenticated={isAuthenticated} onClick={handleAuthClick} />
          </div>
        </header>

        <main className="w-full h-full" aria-label="main">
          <div className="w-full h-full flex flex-col gap-[5px]">
            <SearchBar
              isAuthenticated={isAuthenticated}
              repositories={repositories}
              onSearch={handleSearch}
              onReset={handleReset}
              resetSearchRef={resetSearchRef}
            />
            {loading && selectedRepository ? (
              <div className="w-full h-[200px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-[20px]">
                  <div className="animate-spin">
                    <div className="w-[40px] h-[40px] border-4 border-primary-line border-t-primary-login rounded-full"></div>
                  </div>
                  <span className="text-contents text-primary-line">로딩 중...</span>
                </div>
              </div>
            ) : (
              <>
                <List
                  type="commit"
                  isAuthenticated={isAuthenticated}
                  selectedRepository={selectedRepository}
                  repositoryName={repositoryName}
                  commits={commits}
                />
                <List
                  type="pr"
                  isAuthenticated={isAuthenticated}
                  selectedRepository={selectedRepository}
                  repositoryName={repositoryName}
                  pullRequests={pullRequests}
                />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
