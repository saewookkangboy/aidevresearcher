# AI Dev. Researcher

바이브 코딩(AI Native Coding) 입문자를 위한 개발 리소스 네비게이션 허브

> **"Don't search, Just Vibe."** - 헤매지 말고, 흐름을 타라.

## 🚀 시작하기

### 필수 요구사항

- Node.js 18+ 
- npm 또는 yarn

### 설치

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

## ✨ 주요 기능

1. **통합 리소스 검색**
   - GitHub 라이브러리, API, CLI 확장도구, 에이전트 스킬, 스타터 키트 통합 검색
   - 자연어 처리 기반 의도 파악
   - **50개 이상의 Gemini CLI Extensions 통합** (MCP 서버, 데이터베이스, 브라우저 자동화, 클라우드 서비스 등)

2. **소셜 트렌드 오토 리서치**
   - X (Twitter), Threads에서 #aiagent, #vibecoding 해시태그 모니터링
   - 유효한 도구 자동 추출 및 리스트업

3. **링크 헬스 가드**
   - 등록된 리소스의 URL 유효성 실시간 감지
   - Broken Link 자동 복구 (Self-Healing)

4. **사용자 주도 학습**
   - GitHub/문서 URL 입력 시 AI가 내용 분석하여 즉시 등록

## 🛠 기술 스택

- **Frontend:** React 18, Vite, TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **State Management:** React Context API
- **Storage:** LocalStorage (MVP)

## 📁 프로젝트 구조

```
src/
├── components/      # React 컴포넌트
├── contexts/        # Context API
├── hooks/          # 커스텀 훅
├── services/       # 비즈니스 로직
├── utils/          # 유틸리티 함수
├── data/           # Mock 데이터
└── styles/         # 전역 스타일
```

## 🚀 배포

### Vercel 배포 (권장)

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

또는 [Vercel 대시보드](https://vercel.com)에서 GitHub 저장소를 연결하여 자동 배포할 수 있습니다.

### Railway 배포

```bash
# Railway CLI 설치
npm i -g @railway/cli

# 배포
railway up
```

또는 [Railway 대시보드](https://railway.app)에서 GitHub 저장소를 연결하여 자동 배포할 수 있습니다.

자세한 배포 가이드는 [docs/VERCEL_RAILWAY_SETUP.md](./docs/VERCEL_RAILWAY_SETUP.md)를 참고하세요.

## 📝 개발 로드맵

- [x] Phase 1: MVP (기본 기능)
- [x] Phase 2: Auto-Research
- [x] Phase 3: Link Health Guard
- [x] Phase 4: Polish & Deploy

## 📄 라이선스

Copyright (c) 2025 Park Chunghyo

MIT License

This software was developed with assistance from Cursor AI and Codex.

