/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 색상 팔레트 정의
      colors: {
        primary: {
          bg: '#E8E8E8',
          header: '#FFFFFF',
          line: '#828282',
          contents: '#F8F8F8',
          login: '#24292F'
        },
      },

      // 폰트 설정
      fontFamily: {
        sans: ['Pretendard', 'sans-serif'],
        mono: ['Inter', 'sans-serif'],
      },

      // 폰트 두께 설정
      fontWeight: {
        regular: 400,
        bold: 700,
      },

      // 폰트 크기 커스터마이징
      fontSize: {
        header: ['30px', { lineHeight: 'normal' }],
        title: ['20px', { lineHeight: 'normal' }],
        caption: ['16px', { lineHeight: 'normal' }],
        contents: ['14px', { lineHeight: 'normal' }],
      },

      // 테두리 반경 커스터마이징
      borderRadius: {
        outer: '30px',
        inner: '15px',
      },

      // 테두리 두께 커스터마이징
      borderWidth: {
        thin: '1px',
        thick: '3px',
      },
    },
  },
  plugins: [],
}
