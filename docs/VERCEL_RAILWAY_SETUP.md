# Vercel & Railway 배포 설정 가이드

## 개요

Vibe Coding Navigator를 Vercel과 Railway에서 정상적으로 배포하기 위한 상세 가이드입니다.

## 🚀 Vercel 배포

### 사전 준비

1. [Vercel 계정 생성](https://vercel.com/signup)
2. GitHub 저장소 준비
3. 프로젝트 빌드 테스트

### 배포 방법

#### 방법 1: GitHub 연동 (권장)

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard

2. **새 프로젝트 추가**
   - "Add New..." → "Project" 클릭
   - GitHub 저장소 선택
   - 프로젝트 선택

3. **프로젝트 설정**
   - Framework Preset: Vite (자동 감지)
   - Root Directory: `./` (기본값)
   - Build Command: `npm run build` (자동 감지)
   - Output Directory: `dist` (자동 감지)
   - Install Command: `npm install` (자동 감지)

4. **환경 변수 설정** (필요시)
   - Environment Variables 섹션에서 추가
   - 예: `VITE_API_URL`, `VITE_API_KEY` 등

5. **배포 실행**
   - "Deploy" 버튼 클릭
   - 배포 완료까지 약 1-2분 소요

#### 방법 2: Vercel CLI

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 프로젝트 디렉토리에서 배포
vercel

# 프로덕션 배포
vercel --prod
```

### Vercel 설정 파일 (`vercel.json`)

프로젝트 루트의 `vercel.json` 파일이 자동으로 적용됩니다:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

### Vercel 기능

- ✅ 자동 HTTPS
- ✅ 글로벌 CDN
- ✅ 자동 빌드 및 배포
- ✅ 프리뷰 배포 (Pull Request마다)
- ✅ 환경 변수 관리
- ✅ 커스텀 도메인
- ✅ 분석 및 모니터링

### Vercel 환경 변수

Vercel 대시보드에서 설정:
1. 프로젝트 → Settings → Environment Variables
2. 변수 추가:
   - Key: `VITE_API_URL`
   - Value: `https://api.example.com`
   - Environment: Production, Preview, Development 선택

## 🚂 Railway 배포

### 사전 준비

1. [Railway 계정 생성](https://railway.app/signup)
2. GitHub 저장소 준비
3. 프로젝트 빌드 테스트

### 배포 방법

#### 방법 1: GitHub 연동 (권장)

1. **Railway 대시보드 접속**
   - https://railway.app/dashboard

2. **새 프로젝트 생성**
   - "New Project" 클릭
   - "Deploy from GitHub repo" 선택
   - 저장소 선택

3. **서비스 설정**
   - Railway가 자동으로 감지:
     - Build Command: `npm run build` (railway.json에서)
     - Start Command: `npm run preview` (nixpacks.toml에서)
   - 또는 수동 설정 가능

4. **환경 변수 설정** (필요시)
   - Variables 탭에서 추가
   - 예: `VITE_API_URL`, `NODE_ENV` 등

5. **배포 실행**
   - 자동으로 배포 시작
   - 배포 완료까지 약 2-3분 소요

#### 방법 2: Railway CLI

```bash
# Railway CLI 설치
npm i -g @railway/cli

# 로그인
railway login

# 프로젝트 초기화
railway init

# 배포
railway up
```

### Railway 설정 파일

#### `railway.json`

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm run preview",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### `nixpacks.toml`

```toml
[phases.setup]
nixPkgs = ["nodejs-18_x", "npm-9_x"]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm run preview"

[staticAssets]
"dist" = "/"
```

### Railway 기능

- ✅ 자동 HTTPS
- ✅ 글로벌 CDN
- ✅ 자동 빌드 및 배포
- ✅ 환경 변수 관리
- ✅ 커스텀 도메인
- ✅ 로그 모니터링
- ✅ 데이터베이스 통합 (PostgreSQL, MySQL 등)

### Railway 환경 변수

Railway 대시보드에서 설정:
1. 프로젝트 → Variables 탭
2. "New Variable" 클릭
3. 변수 추가:
   - Name: `VITE_API_URL`
   - Value: `https://api.example.com`

## 🔧 공통 설정

### 환경 변수 관리

#### 로컬 개발

```bash
# .env.local 파일 생성 (git에 커밋하지 않음)
VITE_API_URL=http://localhost:8000
NODE_ENV=development
```

#### 프로덕션

Vercel과 Railway 대시보드에서 환경 변수 설정:
- `VITE_API_URL`: 백엔드 API URL
- `NODE_ENV`: `production`
- 기타 필요한 변수들

### 빌드 최적화

#### 이미 적용된 최적화

- ✅ 코드 스플리팅
- ✅ Tree shaking
- ✅ Minification
- ✅ Asset 최적화
- ✅ 캐싱 전략

#### 추가 최적화 권장사항

1. **이미지 최적화**
   ```bash
   npm install -D vite-imagetools
   ```

2. **번들 분석**
   ```bash
   npm install -D rollup-plugin-visualizer
   ```

### 성능 모니터링

#### Vercel Analytics

```bash
npm install @vercel/analytics
```

```typescript
// src/main.tsx
import { Analytics } from '@vercel/analytics/react';

// ...
<Analytics />
```

#### Railway 로그

Railway 대시보드에서 실시간 로그 확인:
- 배포 로그
- 런타임 로그
- 에러 로그

## 🐛 문제 해결

### 빌드 실패

#### Vercel

1. 빌드 로그 확인
2. Node.js 버전 확인 (package.json에 `engines` 필드 추가)
3. 캐시 클리어 후 재배포

```json
// package.json
{
  "engines": {
  "node": ">=18.0.0",
  "npm": ">=9.0.0"
  }
}
```

#### Railway

1. 빌드 로그 확인
2. `nixpacks.toml` 설정 확인
3. Node.js 버전 확인

### 라우팅 문제

SPA 라우팅이 작동하지 않는 경우:

#### Vercel
- `vercel.json`의 `rewrites` 설정 확인

#### Railway
- 정적 파일 서빙 설정 확인
- `nixpacks.toml`의 `staticAssets` 설정 확인

### 환경 변수 문제

1. 변수명 확인 (`VITE_` 접두사 필요)
2. 대시보드에서 변수 값 확인
3. 재배포 필요 (환경 변수 변경 후)

### CORS 문제

백엔드 API가 있는 경우:
- 백엔드에서 프론트엔드 도메인을 CORS 허용 목록에 추가
- Vercel/Railway 배포 URL을 허용

## 📊 배포 체크리스트

### 배포 전

- [ ] 로컬에서 빌드 성공 확인 (`npm run build`)
- [ ] 환경 변수 목록 정리
- [ ] `.env.example` 파일 업데이트
- [ ] `README.md` 배포 섹션 확인
- [ ] 보안 헤더 설정 확인

### 배포 후

- [ ] 사이트 접속 확인
- [ ] 모든 페이지 라우팅 확인
- [ ] API 연결 확인 (있는 경우)
- [ ] 환경 변수 작동 확인
- [ ] 성능 확인 (Lighthouse)
- [ ] 모바일 반응형 확인

## 🔗 참고 자료

- [Vercel 문서](https://vercel.com/docs)
- [Railway 문서](https://docs.railway.app)
- [Vite 배포 가이드](https://vitejs.dev/guide/static-deploy.html)
- [React 배포 가이드](https://react.dev/learn/start-a-new-react-project#production-deployment)

