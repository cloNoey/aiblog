interface LoginButtonProps {
  isAuthenticated: boolean
  onClick: () => void
}

export default function LoginButton({ isAuthenticated, onClick }: LoginButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-[100px] h-[40px] bg-primary-login rounded-inner text-white font-bold text-contents flex items-center justify-center"
    >
      {isAuthenticated ? 'Log Out' : 'Log In'}
    </button>
  )
}
