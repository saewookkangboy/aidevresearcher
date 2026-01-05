# Railway PostgreSQL 설정 완료 가이드

이 문서는 Railway에서 PostgreSQL을 설정하고 백엔드 서버를 배포하는 방법을 안내합니다.

## 구현 완료 사항

✅ Express.js + TypeScript 백엔드 서버
✅ PostgreSQL 연결 설정
✅ 데이터베이스 마이그레이션 스크립트
✅ API 라우터 (Resources, Interactions, History, Recommendations)
✅ Railway 설정 파일

## 빠른 시작

### 1. Railway에서 PostgreSQL 서비스 추가

1. [Railway](https://railway.app)에 로그인
2. 프로젝트에서 **"New"** → **"Database"** → **"Add PostgreSQL"** 선택
3. PostgreSQL 인스턴스가 생성되면 자동으로 `DATABASE_URL` 환경 변수가 설정됩니다

### 2. 백엔드 서비스 배포

#### 옵션 A: Railway CLI 사용 (권장)

```bash
# Railway CLI 설치
npm i -g @railway/cli

# 로그인
railway login

# 프로젝트 초기화
cd backend
railway init

# PostgreSQL 서비스 연결
railway link

# 환경 변수 확인
railway variables

# 배포
railway up
```

#### 옵션 B: Railway 대시보드 사용

1. Railway 프로젝트에서 **"New"** → **"GitHub Repo"** 선택
2. 저장소 선택
3. **"Root Directory"**를 `backend`로 설정
4. Railway가 자동으로 빌드 및 배포합니다

### 3. 데이터베이스 마이그레이션 실행

Railway PostgreSQL에 스키마를 생성합니다:

```bash
# Railway CLI 사용
railway run npm run migrate

# 또는 Railway 대시보드에서
# 1. PostgreSQL 서비스 선택
# 2. "Query" 탭 클릭
# 3. backend/src/migrations/schema.sql 파일 내용 복사하여 실행
```

### 4. 환경 변수 설정

Railway 대시보드에서 다음 환경 변수를 설정할 수 있습니다:

- `PORT`: 서버 포트 (Railway가 자동 설정, 기본값: 8000)
- `CORS_ORIGIN`: CORS 허용 오리진 (예: `https://your-frontend.vercel.app`)
- `NODE_ENV`: `production`

**참고**: `DATABASE_URL`은 PostgreSQL 서비스를 추가하면 자동으로 설정됩니다.

## 프로젝트 구조

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # PostgreSQL 연결 설정
│   ├── migrations/
│   │   ├── migrate.ts          # 마이그레이션 실행 스크립트
│   │   └── schema.sql          # 데이터베이스 스키마
│   ├── routes/
│   │   ├── resources.ts        # 리소스 API
│   │   ├── interactions.ts     # 사용자 상호작용 API
│   │   ├── resourceHistory.ts  # 리소스 이력 API
│   │   └── recommendations.ts  # 추천 로그 API
│   └── index.ts                # Express 서버
├── package.json
├── tsconfig.json
├── railway.json                # Railway 설정
└── nixpacks.toml              # 빌드 설정
```

## API 엔드포인트

### Resources (리소스)

- `GET /api/resources` - 리소스 목록 조회
- `GET /api/resources/:id` - 특정 리소스 조회
- `POST /api/resources` - 리소스 생성
- `PUT /api/resources/:id` - 리소스 업데이트
- `DELETE /api/resources/:id` - 리소스 삭제
- `GET /api/resources/search?q=...&type=...&platform=...` - 리소스 검색

### Interactions (사용자 상호작용)

- `POST /api/interactions` - 상호작용 기록
- `GET /api/interactions/resource/:resourceId` - 리소스별 상호작용 조회

### Resource History (리소스 이력)

- `POST /api/resource-history` - 리소스 이력 기록
- `GET /api/resource-history/:resourceId` - 리소스별 이력 조회

### Recommendations (추천)

- `POST /api/recommendations` - 추천 로그 기록

### Health Check

- `GET /health` - 서버 및 데이터베이스 연결 상태 확인

## 로컬 개발

```bash
# 백엔드 디렉토리로 이동
cd backend

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 로컬 PostgreSQL 연결 정보 입력

# 개발 서버 실행
npm run dev

# 데이터베이스 마이그레이션
npm run migrate
```

## 프론트엔드 연결

프론트엔드에서 백엔드 API를 사용하려면:

1. `env.example` 파일에 백엔드 URL 추가:
   ```env
   VITE_API_BASE_URL=https://your-backend.railway.app
   ```

2. `src/services/database/databaseService.ts`에서 `VITE_API_BASE_URL`이 설정되어 있으면 자동으로 API를 사용합니다.

## 데이터베이스 스키마

주요 테이블:

- **resources**: 리소스 정보 및 메타데이터
- **user_interactions**: 사용자 상호작용 기록
- **resource_history**: 리소스 변경 이력
- **recommendation_models**: AI 추천 모델
- **recommendation_log**: 추천 로그
- **feedback**: 사용자 피드백
- **activity_log**: 활동 로그

자세한 스키마는 `backend/src/migrations/schema.sql` 파일을 참조하세요.

## 문제 해결

### 연결 오류

- Railway PostgreSQL의 `DATABASE_URL` 확인
- SSL 연결이 필요한 경우 Railway가 자동으로 처리합니다

### 마이그레이션 오류

- `schema.sql` 파일이 올바른지 확인
- Railway PostgreSQL에 직접 연결하여 수동 실행 가능

### CORS 오류

- `CORS_ORIGIN` 환경 변수에 프론트엔드 도메인 설정
- 개발 환경에서는 `*` 허용 가능 (프로덕션에서는 특정 도메인만 허용 권장)

### 빌드 오류

- Node.js 버전 확인 (20.x 이상 필요)
- `npm ci` 실행하여 의존성 재설치

## 다음 단계

1. ✅ Railway PostgreSQL 서비스 추가
2. ✅ 백엔드 서비스 배포
3. ✅ 데이터베이스 마이그레이션 실행
4. ⏭️ 프론트엔드에서 API 연결 테스트
5. ⏭️ 프로덕션 환경 변수 설정

## 참고 자료

- [Railway 문서](https://docs.railway.app)
- [PostgreSQL 문서](https://www.postgresql.org/docs)
- [Express.js 문서](https://expressjs.com)

