# 프로덕션 환경 데이터 저장 옵션

## 현재 상태

현재 프로젝트는 **localStorage**를 사용하여 클라이언트 측에만 데이터를 저장합니다. 프로덕션 환경에서는 다음 옵션을 고려할 수 있습니다.

## 옵션 비교

### 1. 서버리스 옵션 (권장 - 빠른 시작)

#### Supabase (PostgreSQL 기반)
- ✅ **SQL 기반** (PostgreSQL)
- ✅ 백엔드 서버 불필요
- ✅ 실시간 동기화 지원
- ✅ 인증/권한 관리 내장
- ✅ 무료 티어 제공
- ✅ REST API 자동 생성

**설정 난이도**: ⭐⭐ (쉬움)

```typescript
// 예시: Supabase 클라이언트
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
)

// 리소스 저장
await supabase.from('resources').insert(resource)
```

#### Firebase Firestore (NoSQL)
- ✅ **NoSQL 기반**
- ✅ 백엔드 서버 불필요
- ✅ 실시간 동기화 지원
- ✅ 인증/권한 관리 내장
- ✅ 무료 티어 제공

**설정 난이도**: ⭐⭐ (쉬움)

#### Vercel KV (Redis 기반)
- ✅ **Key-Value 저장소**
- ✅ 백엔드 서버 불필요
- ✅ 빠른 읽기/쓰기
- ⚠️ 복잡한 쿼리 제한적

**설정 난이도**: ⭐⭐ (쉬움)

### 2. 전통적인 SQL 데이터베이스

#### PostgreSQL + 백엔드 서버
- ✅ **SQL 기반** (관계형 데이터베이스)
- ✅ 복잡한 쿼리 지원
- ✅ 트랜잭션 지원
- ✅ 확장성 우수
- ⚠️ 백엔드 서버 필요 (FastAPI, Express, Django 등)
- ⚠️ 서버 관리 필요

**설정 난이도**: ⭐⭐⭐⭐ (어려움)

**필요한 구성:**
```
Frontend (React) 
  ↓ HTTP 요청
Backend API (FastAPI/Express/Django)
  ↓ SQL 쿼리
PostgreSQL Database
```

#### MySQL + 백엔드 서버
- ✅ **SQL 기반**
- ✅ PostgreSQL과 유사한 특징
- ⚠️ 백엔드 서버 필요

**설정 난이도**: ⭐⭐⭐⭐ (어려움)

### 3. NoSQL 데이터베이스

#### MongoDB + 백엔드 서버
- ✅ **NoSQL 기반**
- ✅ 유연한 스키마
- ✅ JSON 형태로 저장
- ⚠️ 백엔드 서버 필요

**설정 난이도**: ⭐⭐⭐⭐ (어려움)

## 추천 옵션

### 단기 (MVP → 프로덕션)
**Supabase** 또는 **Firebase Firestore** 추천
- 빠른 설정 (1-2시간)
- 백엔드 서버 불필요
- 무료 티어로 시작 가능
- 현재 코드 구조와 쉽게 통합

### 장기 (확장성 고려)
**PostgreSQL + FastAPI/Express 백엔드**
- 더 세밀한 제어
- 복잡한 쿼리 및 비즈니스 로직 처리
- 대규모 트래픽 대응

## 마이그레이션 전략

### 1단계: 서버리스로 전환 (Supabase 권장)

```typescript
// src/services/storage/supabaseService.ts
import { createClient } from '@supabase/supabase-js'
import { Resource } from '../../utils/types'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export class SupabaseService {
  async saveResources(resources: Resource[]): Promise<void> {
    const { error } = await supabase
      .from('resources')
      .upsert(resources, { onConflict: 'id' })
    
    if (error) throw error
  }

  async loadResources(): Promise<Resource[]> {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('createdAt', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  async addResource(resource: Resource): Promise<void> {
    const { error } = await supabase
      .from('resources')
      .insert(resource)
    
    if (error) throw error
  }

  async updateResource(id: string | number, updates: Partial<Resource>): Promise<void> {
    const { error } = await supabase
      .from('resources')
      .update(updates)
      .eq('id', id)
    
    if (error) throw error
  }

  async deleteResource(id: string | number): Promise<void> {
    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}
```

### 2단계: 환경 변수 설정

```bash
# .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3단계: 서비스 교체

```typescript
// src/contexts/ResourceContext.tsx
// LocalStorageService 대신 SupabaseService 사용
import { SupabaseService } from '../services/storage/supabaseService'

const storageService = new SupabaseService()
```

## Supabase 설정 가이드

### 1. Supabase 프로젝트 생성
1. [supabase.com](https://supabase.com) 가입
2. 새 프로젝트 생성
3. Database → Tables에서 `resources` 테이블 생성

### 2. 테이블 스키마

```sql
CREATE TABLE resources (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  platforms TEXT[],
  tags TEXT[],
  command TEXT,
  url TEXT NOT NULL,
  stars INTEGER,
  is_verified BOOLEAN DEFAULT false,
  source TEXT,
  source_type TEXT,
  link_status TEXT DEFAULT 'checking',
  social_metrics JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_checked_at TIMESTAMP
);

-- 인덱스 추가 (검색 성능 향상)
CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_resources_tags ON resources USING GIN(tags);
CREATE INDEX idx_resources_platforms ON resources USING GIN(platforms);
```

### 3. Row Level Security (RLS) 설정

```sql
-- 모든 사용자가 읽기 가능
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON resources
  FOR SELECT USING (true);

-- 인증된 사용자만 쓰기 가능 (선택사항)
CREATE POLICY "Authenticated write access" ON resources
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

## 결론

**답변: SQL 기반 서버가 필수는 아닙니다.**

1. **빠른 시작**: Supabase (PostgreSQL 기반, 서버리스) 추천
2. **전통적인 접근**: PostgreSQL + 백엔드 서버 (더 많은 제어 필요)
3. **NoSQL 선호**: Firebase Firestore 또는 MongoDB

현재 프로젝트 규모와 요구사항을 고려하면, **Supabase**가 가장 적합한 선택입니다:
- SQL 기반이지만 서버 관리 불필요
- 무료 티어로 시작 가능
- 현재 코드 구조와 쉽게 통합
- 나중에 백엔드 서버로 마이그레이션 가능

