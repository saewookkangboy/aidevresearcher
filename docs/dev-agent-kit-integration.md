# dev-agent-kit 통합 가이드

## 개요

[dev-agent-kit](https://github.com/saewookkangboy/dev-agent-kit)은 개발 워크플로우를 자동화하는 통합 CLI 도구입니다. Vibe Coding Navigator에서 이 도구를 리소스로 관리하고 활용할 수 있습니다.

## 주요 기능

### 1. To-do 리스트 관리
```bash
# To-do 추가
dev-agent todo add "작업 내용" -p high -m "Phase 1"

# To-do 목록 조회
dev-agent todo list
dev-agent todo list -s pending
```

### 2. Agent Role 설정
```bash
# 역할 설정
dev-agent role set --role frontend
dev-agent role set --role backend
dev-agent role set --role pm
```

### 3. Spec-kit 관리
```bash
# 사양 문서 생성
dev-agent spec create "사용자 인증 시스템"

# 사양 문서 검증
dev-agent spec validate
```

### 4. AI 강화학습
```bash
# 강화학습 시작
dev-agent train --agent my-agent --episodes 100
```

### 5. Skills 관리
```bash
# Claude Skills 목록
dev-agent skills list --type claude

# Agent Skills 활성화
dev-agent skills activate spec-kit --type claude
dev-agent skills activate web-search --type agent
```

### 6. SEO 최적화
```bash
# SEO 분석
dev-agent seo analyze https://example.com

# Sitemap 생성
dev-agent seo sitemap -u https://example.com

# Robots.txt 생성
dev-agent seo robots
```

### 7. AI SEO 최적화
```bash
# AI 키워드 리서치
dev-agent ai-seo keywords "웹 개발"

# 콘텐츠 최적화
dev-agent ai-seo optimize "콘텐츠 내용" -k "키워드1" "키워드2"
```

### 8. GEO (Generative Engine Optimization)
```bash
# GEO 분석
dev-agent geo analyze https://example.com

# FAQ 스키마 생성
dev-agent geo faq -q "질문1" "질문2"

# 생성형 엔진 최적화
dev-agent geo optimize https://example.com -e chatgpt claude perplexity
```

### 9. AIO 종합 최적화
```bash
# 종합 분석
dev-agent aio analyze https://example.com

# 자동 최적화
dev-agent aio optimize https://example.com
```

### 10. FastAPI 서버
```bash
# 서버 시작
dev-agent api:start

# 개발 모드
dev-agent api:start --reload --port 8080
```

### 11. API 키 관리
```bash
# API 키 저장
dev-agent api-key set openai -k "sk-..."

# 사용량 통계
dev-agent api-key stats
```

## Vibe Coding Navigator에서의 활용

### 리소스 등록
dev-agent-kit은 이미 Vibe Coding Navigator의 Mock 데이터에 포함되어 있습니다. 다음과 같이 확인할 수 있습니다:

- **타입**: CLI_EXTENSION
- **플랫폼**: Node.js, JavaScript, Python
- **태그**: cli, agent, workflow, automation, todo, spec-kit, seo, ai-seo, geo, aio, fastapi

### 검색 예시
- "CLI 도구" 검색 → dev-agent-kit 표시
- "워크플로우 자동화" 검색 → dev-agent-kit 표시
- "SEO 최적화 도구" 검색 → dev-agent-kit 표시

### URL 수집 기능 활용
dev-agent-kit의 GitHub URL을 직접 입력하여 리소스로 추가할 수 있습니다:

```
https://github.com/saewookkangboy/dev-agent-kit
```

## 통합 워크플로우

### 1. 프로젝트 초기화
```bash
# dev-agent-kit으로 프로젝트 초기화
dev-agent init

# Vibe Coding Navigator에서 관련 리소스 검색
# "프로젝트 초기화" 또는 "starter kit" 검색
```

### 2. 개발 워크플로우
```bash
# 1. 역할 설정
dev-agent role set --role frontend

# 2. 사양 문서 생성
dev-agent spec create "프로젝트 개요"

# 3. To-do 추가
dev-agent todo add "컴포넌트 설계" -p high -m "Phase 1"

# 4. Vibe Coding Navigator에서 필요한 라이브러리 검색
# 예: "React 컴포넌트 라이브러리" 검색
```

### 3. SEO/AI 최적화
```bash
# dev-agent-kit으로 최적화
dev-agent aio optimize https://example.com

# Vibe Coding Navigator에서 SEO 관련 리소스 검색
# 예: "SEO 도구" 또는 "AI SEO" 검색
```

## 관련 리소스

Vibe Coding Navigator에서 다음 키워드로 검색하면 관련 리소스를 찾을 수 있습니다:

- `cli` - CLI 도구들
- `agent` - AI 에이전트 프레임워크
- `workflow` - 워크플로우 자동화 도구
- `seo` - SEO 최적화 도구
- `automation` - 자동화 도구

## 참고 자료

- [dev-agent-kit GitHub](https://github.com/saewookkangboy/dev-agent-kit)
- [dev-agent-kit 사용 가이드](https://github.com/saewookkangboy/dev-agent-kit/blob/main/docs/USAGE.md)
- [아키텍처 문서](https://github.com/saewookkangboy/dev-agent-kit/blob/main/docs/ARCHITECTURE.md)

