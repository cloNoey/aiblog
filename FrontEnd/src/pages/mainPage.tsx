'use client'

import { useState } from 'react'
import LoginButton from '@/components/LoginButton'

export default function MainPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleAuthClick = () => {
    setIsAuthenticated(!isAuthenticated)
  }

  return (
    <div className="flex justify-center items-center w-[1440px] p-[45px] bg-primary-bg mx-auto min-h-screen">
      <div className="w-full rounded-outer border-thick border-primary-line bg-primary-header p-[45px]" aria-label="main-page-body">
        <header className="w-full h-[100px] flex" aria-label="header">
          <div className="w-[320px] h-full flex gap-[8px]">
            <div className="w-[150px] font-bold text-header flex items-center">Smart Blog</div>
            <div className="font-regular text-caption flex mt-[35px]">with</div>
            <img src={'/assets/GitHub_Logo.png'} alt="logo" className="w-[56px] h-[23px] mt-[32px] -translate-x-[8px]" />
          </div>
          <div className="w-full h-full flex justify-end mr-[30px] items-center gap-[8px]">
            <LoginButton isAuthenticated={isAuthenticated} onClick={handleAuthClick} />
          </div>
        </header>

        <main className="w-full h-[1000px]" aria-label="main">
          <div className="text-title font-bold ">aiBlog</div>
        </main>
      </div>
    </div>
  )
}
