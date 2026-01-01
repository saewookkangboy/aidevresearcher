# Role 기능 통합 가이드

## 개요

dev-agent-kit의 Role 기능을 Vibe Coding Navigator에 통합하여, 각 개발자 역할에 맞는 리소스를 추천하고 필터링할 수 있는 기능을 제공합니다.

## 지원하는 Role

1. **Frontend Developer** 🎨
   - React, Vue, Angular, TypeScript, JavaScript
   - UI 컴포넌트, CSS 프레임워크, 프론트엔드 라이브러리

2. **Backend Developer** ⚙️
   - Python, Node.js, Java, Go, Rust
   - API, 서버, 데이터베이스 관련 리소스

3. **Product Manager** 📋
   - 프로젝트 관리, 문서화, 워크플로우 도구
   - Spec-kit, CLI 확장도구

4. **Full Stack Developer** 🚀
   - 프론트엔드와 백엔드 모두
   - MERN, MEAN 스택 관련 리소스

5. **DevOps Engineer** 🔧
   - CI/CD, Docker, Kubernetes
   - 배포 및 인프라 관련 도구

6. **UI/UX Designer** ✨
   - 디자인 도구, 컴포넌트 라이브러리
   - Figma, CSS 프레임워크

## 주요 기능

### 1. Role 선택
- 헤더의 Role Selector를 통해 역할 선택
- 선택한 역할은 LocalStorage에 저장되어 다음 방문 시에도 유지

### 2. Role별 추천 리소스
- 선택한 Role에 맞는 리소스를 점수 기반으로 추천
- 추천 점수 계산 기준:
  - 플랫폼 일치: 30점
  - 타입 일치: 25점
  - 태그 일치: 태그당 10점
  - 키워드 일치: 키워드당 5점
  - 검증된 리소스: 10점 보너스
  - 인기 리소스 (1000+ stars): 5점 보너스

### 3. Role 기반 필터링
- Role이 선택되면 자동으로 해당 Role에 맞는 리소스가 우선 표시
- 검색 시에도 Role 기반 필터링이 적용됨

### 4. Role별 맞춤 메시지
- 각 Role에 맞는 안내 메시지 표시
- 예: "🎨 Frontend 개발자에게 최적화된 리소스"

## 사용 방법

### Role 선택
1. 헤더 우측의 "역할 선택" 버튼 클릭
2. 원하는 역할 선택 (Frontend, Backend, PM 등)
3. 선택한 역할이 즉시 적용됨

### Role별 추천 리소스 확인
- Role을 선택하면 상단에 "추천 리소스" 섹션이 표시됨
- 각 리소스 카드에 추천 점수와 이유가 표시됨

### Role 초기화
- Role Selector에서 "역할 초기화" 클릭
- 모든 Role 필터링이 해제됨

## 기술 구현

### 파일 구조
```
src/
├── contexts/
│   └── RoleContext.tsx          # Role 상태 관리
├── components/
│   └── role/
│       ├── RoleSelector.tsx      # Role 선택 UI
│       └── RoleRecommendations.tsx  # 추천 리소스 표시
├── hooks/
│   └── useRoleFilter.ts          # Role 기반 필터링 훅
└── utils/
    └── roleConfigs.ts            # Role별 설정 및 선호도
```

### Role 설정 구조
각 Role은 다음 정보를 포함:
- `preferredPlatforms`: 선호하는 플랫폼 목록
- `preferredTypes`: 선호하는 리소스 타입
- `preferredTags`: 선호하는 태그
- `keywords`: 검색 키워드

### 추천 알고리즘
1. 플랫폼 매칭 확인
2. 타입 매칭 확인
3. 태그 매칭 확인
4. 키워드 매칭 확인 (제목, 설명)
5. 보너스 점수 추가 (검증, 인기도)
6. 점수순 정렬

## 통합 예시

### Frontend Developer
- React, Vue, Angular 관련 라이브러리 우선 표시
- UI 컴포넌트, CSS 프레임워크 추천
- VS Code 확장도구 추천

### Backend Developer
- Python, Node.js 관련 라이브러리 우선 표시
- API, 서버 프레임워크 추천
- 데이터베이스 도구 추천

### Product Manager
- 프로젝트 관리 도구 추천
- 문서화 도구 추천
- 워크플로우 자동화 도구 추천

## Role별 할일 (향후 개선 사항)

### 🎨 Frontend Developer

1. **프론트엔드 전용 대시보드**
   - React/Vue/Angular별 리소스 통계
   - 최신 UI 컴포넌트 라이브러리 트렌드
   - CSS 프레임워크 비교 차트

2. **프론트엔드 워크플로우 추천**
   - 프로젝트 초기 설정 단계별 가이드
   - 빌드 도구 선택 가이드 (Vite, Webpack, Parcel)
   - 상태 관리 라이브러리 비교 (Redux, Zustand, Jotai)

3. **컴포넌트 라이브러리 추천 강화**
   - 디자인 시스템 통합 리소스
   - 접근성(a11y) 관련 리소스 우선 표시
   - 모바일 반응형 관련 리소스 필터링

4. **VS Code 확장도구 추천**
   - 프론트엔드 개발에 최적화된 확장도구 목록
   - 실시간 사용 통계 기반 추천

### ⚙️ Backend Developer

1. **백엔드 전용 대시보드**
   - 언어별(Python, Node.js, Java, Go, Rust) 리소스 분포
   - API 프레임워크 인기도 비교
   - 데이터베이스 도구 추천

2. **백엔드 아키텍처 워크플로우**
   - RESTful API 설계 가이드
   - GraphQL vs REST 비교 리소스
   - 마이크로서비스 아키텍처 패턴

3. **보안 및 성능 리소스 우선화**
   - 인증/인가 관련 리소스 강조
   - 성능 최적화 도구 추천
   - 로깅 및 모니터링 도구

4. **데이터베이스 통합 가이드**
   - ORM 라이브러리 비교
   - 데이터베이스 마이그레이션 도구
   - 캐싱 전략 관련 리소스

### 📋 Product Manager

1. **PM 전용 대시보드**
   - 프로젝트 관리 도구 통합 뷰
   - 문서화 도구 비교
   - 팀 협업 도구 추천

2. **프로젝트 관리 워크플로우**
   - 스프린트 계획 도구 추천
   - 이슈 트래킹 시스템 비교
   - 로드맵 관리 도구

3. **문서화 자동화 도구**
   - API 문서 자동 생성 도구
   - 스펙 문서 관리 시스템
   - 협업 문서 플랫폼 통합

4. **데이터 분석 및 인사이트**
   - 프로젝트 메트릭 수집 도구
   - 사용자 피드백 수집 도구
   - A/B 테스트 플랫폼

### 🚀 Full Stack Developer

1. **풀스택 전용 대시보드**
   - 프론트엔드/백엔드 리소스 통합 뷰
   - 스택별(MERN, MEAN, LAMP) 추천 리소스
   - 전체 스택 호환성 체크

2. **풀스택 프로젝트 템플릿**
   - 스택별 보일러플레이트 추천
   - 인증 시스템 통합 가이드
   - 배포 파이프라인 설정 가이드

3. **프론트엔드-백엔드 연동 가이드**
   - API 클라이언트 라이브러리 추천
   - 타입 안전성 보장 도구 (tRPC, GraphQL Codegen)
   - CORS 및 보안 설정 가이드

4. **통합 개발 환경**
   - 풀스택 개발에 최적화된 도구 체인
   - 코드 공유 및 재사용 전략
   - 모노레포 관리 도구

### 🔧 DevOps Engineer

1. **DevOps 전용 대시보드**
   - CI/CD 파이프라인 도구 비교
   - 인프라 관리 도구 통합 뷰
   - 모니터링 및 로깅 도구 대시보드

2. **인프라 자동화 워크플로우**
   - Infrastructure as Code (IaC) 도구 추천
   - 컨테이너 오케스트레이션 가이드
   - 클라우드 플랫폼별 배포 전략

3. **CI/CD 파이프라인 최적화**
   - 빌드/테스트/배포 자동화 도구
   - 멀티 환경 배포 전략
   - 롤백 및 재해 복구 도구

4. **보안 및 컴플라이언스**
   - 컨테이너 보안 스캔 도구
   - 시크릿 관리 시스템
   - 규정 준수 자동화 도구

### ✨ UI/UX Designer

1. **디자이너 전용 대시보드**
   - 디자인 도구 통합 뷰
   - 컴포넌트 라이브러리 갤러리
   - 디자인 시스템 리소스 모음

2. **디자인-개발 워크플로우**
   - 디자인 파일에서 코드 생성 도구
   - 디자인 토큰 관리 시스템
   - 디자인 시스템 문서화 도구

3. **컴포넌트 라이브러리 통합**
   - Figma 플러그인 추천
   - 디자인 시스템 빌더 도구
   - 스타일 가이드 생성 도구

4. **접근성 및 사용성 도구**
   - 색상 대비 검사 도구
   - 접근성 테스트 도구
   - 사용자 테스트 플랫폼

## 공통 개선 사항

1. **사용자 선호도 학습**
   - 사용자가 좋아요/북마크한 리소스 기반 학습
   - Role별 개인화된 추천 강화
   - 사용 패턴 분석 및 맞춤 추천

2. **팀 Role 관리**
   - 팀 단위 Role 설정
   - 팀원별 Role 공유 및 협업
   - 팀 대시보드 및 통계

3. **Role 간 전환 및 멀티 Role**
   - 여러 Role 동시 선택 기능
   - Role 간 리소스 비교
   - Role 전환 히스토리 관리

## 참고

- [dev-agent-kit GitHub](https://github.com/saewookkangboy/dev-agent-kit)
- [Role 기능 문서](../docs/dev-agent-kit-integration.md)

