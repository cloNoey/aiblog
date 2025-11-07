# aiblog

## 1주차 미션 : GitHub 작업 목록 가져오기
- 메인 화면에서 GitHub Repo 입력하면 최근 작업(커밋/PR) 목록 보여주기
- 데이터 로딩 중에 간단한 로딩처리 UI 표현

## Tech Stack
- FE : Vite + React 
    - 컴포넌트가 하나의 역할을 하도록 하고, 너무 크지 않게
    - useState, useEffect, Context API 잘 활용
    - 상태관리 라이브러리(클라이언트 상태, 서버상태용 라이브러리 활용) 사용 가능
    - 재사용 util 별도 파일로 분리
- BE : Express 
- Style : tailwindCSS

## Feature
- OAuth 인증
- GitHub API 요청
- 메인화면 구성
    - GitHub Repo 입력창
        - [GET] /user/repos
    - 커밋 목록창
        - [GET] /repos/{owner}/{repo}/commits
    - PR 목록창
        - [GET] /repos/{owner}/{repo}/pulls
    - 선택된 목록 확인
- 로딩처리 UI 표현

## PRD
1. Figma 제작 
    https://www.figma.com/design/HIf6A1AAdYKW0E5OWhfrLG/aiBlog?node-id=1-2&t=zb6LRT7rINBH7oZx-1 
2. FE/BE initial setting
3. GitHub API connect
4. BE CRUD 작업
5. FE 작업
    - 헤더 구성 (로그인/로그아웃 연결)
    - 검색창 구성
        - 검색창 클릭 시 모든 레포 목록이 하단 모달로 나옴
        - 검색어와 매칭되는 레포 목록이 하단 모달로 나옴
        - 검색어와 매칭되는 레포가 없으면 "존재하지 않는 레포지토리입니다" 하단 모달로 나옴
    - 커밋 목록창 구성
    - PR 목록창 구성