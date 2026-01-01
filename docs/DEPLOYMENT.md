# 배포 가이드

## 개요

Vibe Coding Navigator를 프로덕션 환경에 배포하기 위한 가이드입니다.

## 사전 요구사항

- Node.js 18 이상
- npm 또는 yarn
- 배포 플랫폼 계정 (Vercel, Netlify, AWS 등)

## 빌드

### 로컬 빌드 테스트

```bash
# 의존성 설치
npm install

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

빌드 결과물은 `dist` 디렉토리에 생성됩니다.

## 배포 옵션

### 1. Vercel 배포 (권장)

Vercel은 Vite 프로젝트를 자동으로 인식하고 최적화합니다.

#### 자동 배포

1. [Vercel](https://vercel.com)에 GitHub 저장소 연결
2. 프로젝트 가져오기
3. 빌드 설정 자동 감지 (Vite)
   - Build Command: `npm run build` (자동 감지)
   - Output Directory: `dist` (자동 감지)
   - Install Command: `npm install` (자동 감지)
4. 환경 변수 설정 (필요시)
5. 배포 완료

#### 수동 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 배포
vercel --prod
```

#### Vercel 설정 파일

프로젝트 루트의 `vercel.json` 파일이 자동으로 적용됩니다:
- SPA 라우팅 설정 (rewrites)
- 보안 헤더 설정
- 캐싱 전략
- 정적 자산 최적화

#### 환경 변수 설정

Vercel 대시보드에서 환경 변수 설정:
1. 프로젝트 → Settings → Environment Variables
2. 필요한 변수 추가 (예: `VITE_API_URL`)
3. 환경별로 다르게 설정 가능 (Production, Preview, Development)

### 2. Netlify 배포

1. [Netlify](https://www.netlify.com)에 GitHub 저장소 연결
2. 빌드 설정:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. 배포 완료

### 3. GitHub Pages 배포

```bash
# gh-pages 설치
npm install -D gh-pages

# package.json에 배포 스크립트 추가
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}

# 배포 실행
npm run deploy
```

### 4. AWS S3 + CloudFront

```bash
# AWS CLI 설치 및 설정
aws configure

# S3 버킷 생성
aws s3 mb s3://vibe-coding-navigator

# 빌드 및 업로드
npm run build
aws s3 sync dist/ s3://vibe-coding-navigator --delete

# CloudFront 배포 (선택사항)
# AWS Console에서 CloudFront 배포 생성
```

## 환경 변수

프로덕션 환경에서 필요한 환경 변수가 있다면 배포 플랫폼의 환경 변수 설정에서 추가하세요.

## 성능 최적화

### 이미 적용된 최적화

- ✅ 코드 스플리팅 (vendor, icons)
- ✅ Tree shaking
- ✅ Minification
- ✅ Source maps (프로덕션에서는 제거 권장)

### 추가 최적화 권장사항

1. **이미지 최적화**: 필요시 `vite-imagetools` 플러그인 사용
2. **CDN 사용**: 정적 자산을 CDN으로 제공
3. **캐싱 전략**: 적절한 Cache-Control 헤더 설정

## 모니터링

배포 후 다음 항목을 모니터링하세요:

- 페이지 로드 시간
- 에러 로그
- 사용자 피드백
- SEO 성능

## 롤백 계획

문제 발생 시 이전 버전으로 롤백:

- **Vercel**: 대시보드에서 이전 배포 선택
- **Netlify**: Deploys 탭에서 이전 배포 재배포
- **GitHub Pages**: 이전 커밋으로 되돌리기

## 보안 체크리스트

배포 전 확인:

- [ ] 환경 변수에 민감한 정보 없음
- [ ] HTTPS 사용
- [ ] 보안 헤더 설정 확인
- [ ] CORS 설정 확인
- [ ] API 키 노출 여부 확인

## 문제 해결

### 빌드 실패

```bash
# 캐시 클리어
rm -rf node_modules dist
npm install
npm run build
```

### 라우팅 문제 (SPA)

배포 플랫폼에서 모든 경로를 `index.html`로 리다이렉트하도록 설정:

- **Vercel**: `vercel.json`에 rewrites 설정 (이미 포함됨)
- **Netlify**: `public/_redirects` 파일 생성 (이미 포함됨)
- **Railway**: 정적 파일 서빙 설정 확인
- **Apache**: `.htaccess` 설정
- **Nginx**: `try_files` 설정

### 5. Railway 배포

Railway는 정적 사이트와 서버리스 함수를 모두 지원합니다.

#### 정적 사이트 배포

1. [Railway](https://railway.app)에 GitHub 저장소 연결
2. "New Project" → "GitHub Repo" 선택
3. 프로젝트 선택
4. Railway가 자동으로 감지:
   - Build Command: `npm run build`
   - Start Command: `npm run preview` (또는 정적 파일 서빙)
5. 환경 변수 설정 (필요시)
6. 배포 완료

#### Railway 설정 파일

프로젝트 루트의 `railway.json`과 `nixpacks.toml` 파일이 자동으로 적용됩니다:
- 빌드 설정
- 시작 명령어
- 정적 자산 경로

#### Railway 환경 변수

Railway 대시보드에서 환경 변수 설정:
1. 프로젝트 → Variables 탭
2. 필요한 변수 추가
3. 환경별로 다르게 설정 가능

#### Railway 정적 파일 서빙

Railway는 `dist` 디렉토리를 정적 파일로 자동 서빙합니다.
`nixpacks.toml`에서 정적 자산 경로가 설정되어 있습니다.

## 참고 자료

- [Vite 배포 가이드](https://vitejs.dev/guide/static-deploy.html)
- [Vercel 문서](https://vercel.com/docs)
- [Netlify 문서](https://docs.netlify.com)

