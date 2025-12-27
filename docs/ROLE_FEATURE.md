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

## 향후 개선 사항

1. **Role별 대시보드**
   - 각 Role에 맞는 전용 대시보드 제공
   - Role별 통계 및 인사이트

2. **사용자 선호도 학습**
   - 사용자가 좋아요/북마크한 리소스 기반 학습
   - 개인화된 추천 강화

3. **Role별 워크플로우**
   - Role에 맞는 개발 워크플로우 제안
   - 단계별 리소스 추천

4. **팀 Role 관리**
   - 팀 단위 Role 설정
   - 팀원별 Role 공유

## 참고

- [dev-agent-kit GitHub](https://github.com/saewookkangboy/dev-agent-kit)
- [Role 기능 문서](../docs/dev-agent-kit-integration.md)

