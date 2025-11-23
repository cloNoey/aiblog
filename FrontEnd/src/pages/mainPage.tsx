import { useRef } from 'react'
import Header from '@/components/Header'
import SearchBar from '@/components/SearchBar'
import List from '@/components/List'
import SelectedContents from '@/components/SelectedContents'
import { useAuth } from '@/hooks/useAuth'
import { useRepository } from '@/hooks/useRepository'
import { useFetchData } from '@/hooks/useFetchData'
import { CommitData, PullRequestData } from '@/components/List'
import { useSummaryContext } from '@/hooks/useSummaryContext'
import { generateSummary } from '@/services/geminiService'
import { summaryCache } from '@/utils/summaryCache'
import { AUTH_GITHUB_URL } from '@/utils/constants'
import api from '@/services/api'

interface MainPageProps {
  onNavigateToPosts?: () => void
}

export default function MainPage({ onNavigateToPosts }: MainPageProps) {
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

  // Summary Context
  const {
    state: summaryState,
    setSelectedItem,
    startGenerate,
    setSummary,
    setGenerateError,
    clearSummary,
  } = useSummaryContext()

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
    // 새로운 레포지토리 선택 시 이전 선택 항목 초기화
    clearSummary()
  }

  const handleReset = () => {
    resetRepository()
    clearSummary()
    if (resetSearchRef.current) {
      resetSearchRef.current()
    }
  }

  const handleItemSelect = async (data: CommitData | PullRequestData, type: 'commit' | 'pr') => {
    let selectedData = data

    // Commit인 경우 상세 정보(files) 로드
    if (type === 'commit') {
      const commitData = data as CommitData
      try {
        const requestUrl = `/github/commit/${repositoryOwner}/${repositoryName}/${commitData.sha}/details`
        const response = await api.get(requestUrl)
        if (response.data?.data) {
          selectedData = {
            ...data,
            files: response.data.data.files || '',
          }
        }
      } catch (error) {
        // 오류가 나도 계속 진행
      }
    }

    // PR인 경우 상세 정보(comments, files, readme) 로드
    if (type === 'pr') {
      const prData = data as PullRequestData
      try {
        const requestUrl = `/github/pull/${repositoryOwner}/${repositoryName}/${prData.number}/details`
        const response = await api.get(requestUrl)
        if (response.data?.data) {
          selectedData = {
            ...data,
            body: response.data.data.body || '',
            files: response.data.data.files || '',
            comments: response.data.data.comments || '',
            readme: response.data.data.readme || '',
          }
        }
      } catch (error) {
        // 오류가 나도 계속 진행
      }
    }

    // Context에 선택한 항목 저장
    setSelectedItem(type, selectedData)

    // 캐시된 요약이 있는지 확인
    const cacheKey = summaryCache.generateCacheKey(type, selectedData)
    const cachedSummary = summaryCache.getFromCache(cacheKey)

    if (cachedSummary) {
      // 캐시된 요약이 있으면 자동으로 표시
      setSummary(cachedSummary)
    } else {
      // 캐시된 요약이 없으면 초기화
      setSummary('')
    }
    setGenerateError('')
  }

  const handleGenerateSummary = async (data?: CommitData | PullRequestData, type?: 'commit' | 'pr') => {
    // summaryState의 데이터가 업데이트된 데이터이므로 항상 우선 사용
    const targetData = summaryState.data.selectedData || data
    const targetType = summaryState.data.selectedType || type

    if (!targetData || !targetType) return

    startGenerate()

    try {
      // 캐시 키 생성
      const cacheKey = summaryCache.generateCacheKey(targetType, targetData)

      // Generate Summary 버튼 클릭 시 항상 새로운 요약 생성
      const result = await generateSummary({
        type: targetType,
        data: targetData
      })

      // 결과를 캐시에 저장
      summaryCache.saveToCache(cacheKey, result)
      setSummary(result)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '요약 생성 중 오류가 발생했습니다'
      setGenerateError(errorMessage)
    }
  }

  return (
    <div className="flex w-full p-[45px] bg-primary-bg mx-auto min-h-screen">
      <div className="pb-[30px] w-full rounded-outer border-thick border-primary-line bg-primary-header" aria-label="main-page-body">
        <Header
          onLogoClick={handleReset}
          navigationButtonText="Saved Posts"
          navigationButtonOnClick={onNavigateToPosts}
          isAuthenticated={isAuthenticated}
          onAuthClick={handleAuthClick}
        />

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
              <div className="w-full h-full flex gap-[5px]">
                <div className="flex flex-col gap-[5px]">
                  <List
                    type="commit"
                    isAuthenticated={isAuthenticated}
                    selectedRepository={selectedRepository}
                    repositoryName={repositoryName}
                    commits={commits}
                    selectedType={summaryState.data.selectedType}
                    selectedData={summaryState.data.selectedData}
                    onItemSelect={handleItemSelect}
                    onGenerateSummary={handleGenerateSummary}
                  />
                  <List
                    type="pr"
                    isAuthenticated={isAuthenticated}
                    selectedRepository={selectedRepository}
                    repositoryName={repositoryName}
                    pullRequests={pullRequests}
                    selectedType={summaryState.data.selectedType}
                    selectedData={summaryState.data.selectedData}
                    onItemSelect={handleItemSelect}
                    onGenerateSummary={handleGenerateSummary}
                  />
                </div>
                <SelectedContents
                  type={summaryState.data.selectedType}
                  data={summaryState.data.selectedData}
                  summary={summaryState.data.summary}
                  summaryLoading={summaryState.status === 'loading'}
                  summaryError={summaryState.error}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
