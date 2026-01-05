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

2. **Role 기반 맞춤 추천** 🎯
   - **6가지 개발자 Role 지원**: Frontend, Backend, PM, Full Stack, DevOps, UI/UX Designer
   - Role별 맞춤 리소스 추천 (점수 기반 스마트 추천)
   - Role 기반 자동 필터링 및 우선순위 정렬
   - 선택한 Role은 자동 저장되어 다음 방문 시에도 유지
   - 자세한 내용은 [Role 기능 가이드](./docs/ROLE_FEATURE.md) 참고

3. **소셜 트렌드 오토 리서치**
   - X (Twitter), Threads에서 #aiagent, #vibecoding 해시태그 모니터링
   - 유효한 도구 자동 추출 및 리스트업

4. **링크 헬스 가드**
   - 등록된 리소스의 URL 유효성 실시간 감지
   - Broken Link 자동 복구 (Self-Healing)

5. **사용자 주도 학습**
   - GitHub/문서 URL 입력 시 AI가 내용 분석하여 즉시 등록

6. **성능 최적화 및 자동화** ⚡
   - **인덱싱 기반 빠른 검색**: 플랫폼/타입/태그/키워드별 인덱스 활용
   - **스마트 캐싱**: Role별 추천 결과 자동 캐싱 (5분 TTL)
   - **성능 모니터링**: 실시간 성능 추적 및 자동 경고
   - **자동 최적화**: 1분마다 자동 성능 체크 및 최적화 적용
   - **지연 로딩**: 초기 12개만 렌더링, 무한 스크롤 지원
   - 성능 개선: 추천 계산 150-300ms → < 1ms (캐시 히트) / 20-50ms (캐시 미스)
   - 자세한 내용은 [성능 최적화 가이드](./docs/PERFORMANCE_OPTIMIZATION.md) 참고

## 🛠 기술 스택

- **Frontend:** React 18, Vite, TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **State Management:** React Context API
- **Storage:** LocalStorage (MVP)

## 📁 프로젝트 구조

```
src/
├── components/              # React 컴포넌트
│   ├── role/               # Role 관련 컴포넌트
│   ├── resource/           # 리소스 표시 컴포넌트
│   ├── optimization/       # 최적화 관련 컴포넌트
│   └── ...
├── contexts/               # Context API
│   ├── RoleContext.tsx     # Role 상태 관리
│   └── ...
├── hooks/                  # 커스텀 훅
│   ├── useRoleFilter.ts    # Role 기반 필터링
│   └── ...
├── services/              # 비즈니스 로직
│   ├── optimization/      # 성능 최적화 서비스
│   │   ├── rolePerformanceOptimizer.ts  # Role 성능 최적화
│   │   ├── performanceMonitor.ts        # 성능 모니터링
│   │   └── autoOptimizer.ts             # 자동 최적화
│   └── ...
├── utils/                 # 유틸리티 함수
│   ├── roleConfigs.ts     # Role 설정
│   └── ...
├── data/                  # Mock 데이터
└── styles/                # 전역 스타일
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
- [x] Phase 5: Role 기능 통합 (6개 Role 지원)
- [x] Phase 6: 성능 최적화 및 자동화

## 📚 문서

- [Role 기능 가이드](./docs/ROLE_FEATURE.md) - Role별 맞춤 추천 기능 상세 설명
- [성능 최적화 가이드](./docs/PERFORMANCE_OPTIMIZATION.md) - 성능 최적화 및 모니터링 시스템
- [배포 가이드](./docs/VERCEL_RAILWAY_SETUP.md) - Vercel/Railway 배포 방법

## 📄 라이선스

Copyright (c) 2025 Park Chunghyo

MIT License

This software was developed with assistance from Cursor AI and Codex.

