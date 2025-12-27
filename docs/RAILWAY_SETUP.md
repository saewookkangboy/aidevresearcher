# Railway PostgreSQL 설정 가이드

## 개요

Railway의 PostgreSQL 데이터베이스를 사용하여 프로덕션 환경을 구축하는 가이드입니다.

## 아키텍처

```
Frontend (React/Vite)
  ↓ HTTP 요청
Backend API (FastAPI/Express/Django)
  ↓ SQL 쿼리
Railway PostgreSQL Database
```

## 1단계: Railway PostgreSQL 설정

### Railway 프로젝트 생성
1. [Railway](https://railway.app) 가입/로그인
2. "New Project" 클릭
3. "Database" → "Add PostgreSQL" 선택
4. PostgreSQL 인스턴스 생성 완료

### 연결 정보 확인
Railway 대시보드에서 다음 정보를 확인:
- `DATABASE_URL` (전체 연결 문자열)
- `PGHOST`
- `PGPORT`
- `PGUSER`
- `PGPASSWORD`
- `PGDATABASE`

## 2단계: 백엔드 서버 선택

### 옵션 A: FastAPI (Python) - 추천

**장점:**
- 빠른 개발 속도
- 자동 API 문서 생성 (Swagger)
- 비동기 지원
- 타입 힌팅

**설정:**

```bash
# backend/ 디렉토리 생성
mkdir backend
cd backend

# 가상환경 생성
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv pydantic
```

**프로젝트 구조:**
```
backend/
├── main.py
├── models.py
├── database.py
├── schemas.py
├── routers/
│   └── resources.py
├── .env
└── requirements.txt
```

### 옵션 B: Express.js (Node.js)

**장점:**
- JavaScript/TypeScript 통일
- 풍부한 생태계
- 빠른 개발

**설정:**

```bash
# backend/ 디렉토리 생성
mkdir backend
cd backend

# 프로젝트 초기화
npm init -y
npm install express pg dotenv cors
npm install -D @types/node @types/express @types/pg typescript ts-node nodemon
```

### 옵션 C: Django (Python)

**장점:**
- 강력한 ORM
- 관리자 패널 자동 생성
- 보안 기능 내장

## 3단계: 데이터베이스 스키마

### PostgreSQL 테이블 생성

Railway PostgreSQL에 연결하여 다음 SQL 실행:

```sql
-- resources 테이블
CREATE TABLE resources (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  platforms TEXT[],
  tags TEXT[],
  command TEXT,
  url TEXT NOT NULL,
  stars INTEGER,
  is_verified BOOLEAN DEFAULT false,
  source VARCHAR(100),
  source_type VARCHAR(50),
  link_status VARCHAR(20) DEFAULT 'checking',
  social_metrics JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_checked_at TIMESTAMP
);

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_resources_tags ON resources USING GIN(tags);
CREATE INDEX idx_resources_platforms ON resources USING GIN(platforms);
CREATE INDEX idx_resources_url ON resources(url);
CREATE INDEX idx_resources_created_at ON resources(created_at DESC);

-- activity_log 테이블 (활동 로그)
CREATE TABLE activity_log (
  id VARCHAR(255) PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  resource_id VARCHAR(255),
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

CREATE INDEX idx_activity_log_timestamp ON activity_log(timestamp DESC);
```

## 4단계: FastAPI 백엔드 구현 예시

### backend/database.py

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### backend/models.py

```python
from sqlalchemy import Column, String, Integer, Boolean, Text, ARRAY, DateTime, JSON
from sqlalchemy.sql import func
from database import Base

class Resource(Base):
    __tablename__ = "resources"

    id = Column(String(255), primary_key=True)
    title = Column(String(500), nullable=False)
    type = Column(String(50), nullable=False)
    description = Column(Text)
    platforms = Column(ARRAY(String))
    tags = Column(ARRAY(String))
    command = Column(Text)
    url = Column(Text, nullable=False)
    stars = Column(Integer)
    is_verified = Column(Boolean, default=False)
    source = Column(String(100))
    source_type = Column(String(50))
    link_status = Column(String(20), default='checking')
    social_metrics = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    last_checked_at = Column(DateTime)

class ActivityLog(Base):
    __tablename__ = "activity_log"

    id = Column(String(255), primary_key=True)
    type = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, server_default=func.now())
    resource_id = Column(String(255))
```

### backend/schemas.py

```python
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime

class ResourceBase(BaseModel):
    title: str
    type: str
    description: str
    platforms: List[str]
    tags: List[str]
    command: str
    url: str
    stars: Optional[int] = None
    is_verified: bool = False
    source: str
    source_type: str
    link_status: str = 'checking'
    social_metrics: Optional[Dict] = None

class ResourceCreate(ResourceBase):
    id: str

class ResourceUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    description: Optional[str] = None
    platforms: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    command: Optional[str] = None
    url: Optional[str] = None
    stars: Optional[int] = None
    is_verified: Optional[bool] = None
    source: Optional[str] = None
    source_type: Optional[str] = None
    link_status: Optional[str] = None
    social_metrics: Optional[Dict] = None
    last_checked_at: Optional[datetime] = None

class Resource(ResourceBase):
    id: str
    created_at: datetime
    updated_at: datetime
    last_checked_at: Optional[datetime] = None

    class Config:
        from_attributes = True
```

### backend/routers/resources.py

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import Resource, ActivityLog
from schemas import ResourceCreate, ResourceUpdate, Resource
from datetime import datetime

router = APIRouter(prefix="/api/resources", tags=["resources"])

@router.get("/", response_model=List[Resource])
def get_resources(
    skip: int = 0,
    limit: int = 100,
    type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Resource)
    if type:
        query = query.filter(Resource.type == type)
    return query.order_by(Resource.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/{resource_id}", response_model=Resource)
def get_resource(resource_id: str, db: Session = Depends(get_db)):
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource

@router.post("/", response_model=Resource)
def create_resource(resource: ResourceCreate, db: Session = Depends(get_db)):
    db_resource = Resource(**resource.dict())
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    return db_resource

@router.put("/{resource_id}", response_model=Resource)
def update_resource(
    resource_id: str,
    resource_update: ResourceUpdate,
    db: Session = Depends(get_db)
):
    db_resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not db_resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    update_data = resource_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_resource, field, value)
    
    db_resource.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_resource)
    return db_resource

@router.delete("/{resource_id}")
def delete_resource(resource_id: str, db: Session = Depends(get_db)):
    db_resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not db_resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    db.delete(db_resource)
    db.commit()
    return {"message": "Resource deleted successfully"}

@router.get("/search", response_model=List[Resource])
def search_resources(
    q: Optional[str] = None,
    type: Optional[str] = None,
    platform: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Resource)
    
    if q:
        query = query.filter(
            Resource.title.ilike(f"%{q}%") |
            Resource.description.ilike(f"%{q}%")
        )
    if type:
        query = query.filter(Resource.type == type)
    if platform:
        query = query.filter(Resource.platforms.contains([platform]))
    
    return query.order_by(Resource.created_at.desc()).all()
```

### backend/main.py

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import resources

# 테이블 생성
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Vibe Coding Navigator API",
    description="AI Dev. Researcher Backend API",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://your-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(resources.router)

@app.get("/")
def root():
    return {"message": "Vibe Coding Navigator API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
```

### backend/.env

```env
DATABASE_URL=postgresql://user:password@host:port/database
# Railway에서 제공하는 DATABASE_URL 사용
```

### backend/requirements.txt

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
python-dotenv==1.0.0
pydantic==2.5.0
```

## 5단계: Railway에 백엔드 배포

### Railway에 백엔드 서비스 추가
1. Railway 프로젝트에서 "New" → "GitHub Repo" 선택
2. 백엔드 코드가 있는 디렉토리 선택
3. 환경 변수 설정:
   - `DATABASE_URL`: Railway PostgreSQL 연결 문자열
4. 빌드 명령: `pip install -r requirements.txt`
5. 시작 명령: `uvicorn main:app --host 0.0.0.0 --port $PORT`

## 6단계: 프론트엔드 수정

### API 서비스 생성

```typescript
// src/services/api/resourceApiService.ts
import { Resource } from '../../utils/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export class ResourceApiService {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async loadResources(): Promise<Resource[]> {
    return this.request<Resource[]>('/api/resources/');
  }

  async getResource(id: string | number): Promise<Resource> {
    return this.request<Resource>(`/api/resources/${id}`);
  }

  async addResource(resource: Resource): Promise<Resource> {
    return this.request<Resource>('/api/resources/', {
      method: 'POST',
      body: JSON.stringify(resource),
    });
  }

  async updateResource(
    id: string | number,
    updates: Partial<Resource>
  ): Promise<Resource> {
    return this.request<Resource>(`/api/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteResource(id: string | number): Promise<void> {
    await this.request(`/api/resources/${id}`, {
      method: 'DELETE',
    });
  }

  async searchResources(query: {
    q?: string;
    type?: string;
    platform?: string;
  }): Promise<Resource[]> {
    const params = new URLSearchParams();
    if (query.q) params.append('q', query.q);
    if (query.type) params.append('type', query.type);
    if (query.platform) params.append('platform', query.platform);

    return this.request<Resource[]>(`/api/resources/search?${params}`);
  }
}
```

### ResourceContext 수정

```typescript
// src/contexts/ResourceContext.tsx
// LocalStorageService 대신 ResourceApiService 사용
import { ResourceApiService } from '../services/api/resourceApiService';

const storageService = new ResourceApiService();
```

### 환경 변수 설정

```bash
# .env
VITE_API_URL=https://your-backend.railway.app
```

## 7단계: 배포 체크리스트

- [ ] Railway PostgreSQL 데이터베이스 생성
- [ ] 데이터베이스 스키마 생성 (SQL 실행)
- [ ] 백엔드 서버 코드 작성
- [ ] Railway에 백엔드 배포
- [ ] 환경 변수 설정 (DATABASE_URL)
- [ ] 프론트엔드 API 서비스 구현
- [ ] 프론트엔드 환경 변수 설정 (VITE_API_URL)
- [ ] CORS 설정 확인
- [ ] API 테스트

## 문제 해결

### 연결 오류
- Railway PostgreSQL의 `DATABASE_URL` 확인
- 방화벽 설정 확인
- SSL 모드 필요 시 `?sslmode=require` 추가

### CORS 오류
- 백엔드 `main.py`에서 `allow_origins`에 프론트엔드 도메인 추가

### 성능 최적화
- 인덱스 추가 확인
- 쿼리 최적화
- 연결 풀링 설정

## 참고 자료

- [Railway 문서](https://docs.railway.app)
- [FastAPI 문서](https://fastapi.tiangolo.com)
- [SQLAlchemy 문서](https://docs.sqlalchemy.org)
- [PostgreSQL 문서](https://www.postgresql.org/docs)

