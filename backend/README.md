# Vibe Coding Navigator Backend API

Express.js + TypeScript + PostgreSQL 백엔드 서버

## Railway PostgreSQL 설정 가이드

### 1. Railway에서 PostgreSQL 서비스 추가

1. [Railway](https://railway.app)에 로그인
2. 프로젝트에서 "New" → "Database" → "Add PostgreSQL" 선택
3. PostgreSQL 인스턴스 생성 완료

Railway는 자동으로 다음 환경 변수를 제공합니다:
- `DATABASE_URL`: 전체 연결 문자열
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`

### 2. 데이터베이스 마이그레이션 실행

Railway PostgreSQL에 스키마를 생성합니다:

```bash
# 로컬에서 실행 (Railway CLI 사용)
railway run npm run migrate

# 또는 Railway 대시보드에서 직접 SQL 실행
# backend/src/migrations/schema.sql 파일의 내용을 복사하여 실행
```

### 3. 백엔드 서비스 배포

1. Railway 프로젝트에서 "New" → "GitHub Repo" 선택
2. 저장소 선택 후 `backend` 디렉토리를 루트로 설정
3. 환경 변수는 자동으로 PostgreSQL 서비스와 연결됩니다
4. 빌드 및 배포 자동 시작

### 4. 환경 변수 설정

Railway 대시보드에서 다음 환경 변수를 설정할 수 있습니다:

- `PORT`: 서버 포트 (기본값: 8000, Railway가 자동 설정)
- `CORS_ORIGIN`: CORS 허용 오리진 (기본값: *)
- `NODE_ENV`: 환경 설정 (production)

### 5. 로컬 개발

```bash
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

### 6. API 엔드포인트

- `GET /health`: 헬스 체크
- `GET /api/resources`: 리소스 목록 조회
- `GET /api/resources/:id`: 특정 리소스 조회
- `POST /api/resources`: 리소스 생성
- `PUT /api/resources/:id`: 리소스 업데이트
- `DELETE /api/resources/:id`: 리소스 삭제
- `GET /api/resources/search`: 리소스 검색
- `POST /api/interactions`: 사용자 상호작용 기록
- `GET /api/interactions/resource/:resourceId`: 리소스별 상호작용 조회
- `POST /api/resource-history`: 리소스 이력 기록
- `GET /api/resource-history/:resourceId`: 리소스별 이력 조회
- `POST /api/recommendations`: 추천 로그 기록

### 7. 데이터베이스 스키마

자세한 스키마 정보는 `src/migrations/schema.sql` 파일을 참조하세요.

주요 테이블:
- `resources`: 리소스 정보
- `user_interactions`: 사용자 상호작용
- `resource_history`: 리소스 변경 이력
- `recommendation_models`: 추천 모델
- `recommendation_log`: 추천 로그
- `feedback`: 사용자 피드백
- `activity_log`: 활동 로그

### 문제 해결

#### 연결 오류
- Railway PostgreSQL의 `DATABASE_URL` 확인
- SSL 모드 필요 시 `?sslmode=require` 추가 (Railway는 자동 처리)

#### 마이그레이션 오류
- `schema.sql` 파일이 올바른지 확인
- Railway PostgreSQL에 직접 연결하여 수동 실행 가능

#### CORS 오류
- `CORS_ORIGIN` 환경 변수에 프론트엔드 도메인 설정

