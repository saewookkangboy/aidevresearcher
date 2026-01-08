# 데이터베이스 설정 가이드

## 로컬 개발 환경 설정

### 1. PostgreSQL 설치

macOS:
```bash
brew install postgresql@15
brew services start postgresql@15
```

Linux (Ubuntu):
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. 환경 변수 설정

`backend/.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# PostgreSQL 설정 (개발 환경)
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=vibe_coding_navigator

# 또는 Railway를 사용하는 경우
# DATABASE_URL=postgresql://user:password@host:port/database

# 기타 설정
NODE_ENV=development
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:5173
```

### 3. 데이터베이스 생성 및 마이그레이션

#### 방법 1: 한 번에 설정
```bash
cd backend
npm run db:setup
```

#### 방법 2: 단계별 설정
```bash
# 1. 데이터베이스 생성
npm run db:create

# 2. 스키마 마이그레이션
npm run migrate
```

### 4. 서버 실행

```bash
npm run dev
```

## Railway PostgreSQL 사용 (프로덕션)

Railway를 사용하는 경우:

1. Railway에서 PostgreSQL 서비스를 생성
2. `DATABASE_URL` 환경 변수가 자동으로 제공됨
3. 마이그레이션 실행:
   ```bash
   npm run migrate
   ```

## 문제 해결

### 데이터베이스가 존재하지 않는 경우

에러: `database "vibe_coding_navigator" does not exist`

해결:
```bash
npm run db:create
npm run migrate
```

### PostgreSQL이 실행되지 않는 경우

macOS:
```bash
brew services start postgresql@15
```

Linux:
```bash
sudo systemctl start postgresql
```

### 권한 오류

PostgreSQL 사용자에 데이터베이스 생성 권한이 없는 경우:

```bash
# psql로 접속
psql -U postgres

# 또는 sudo 사용
sudo -u postgres psql

# 데이터베이스 생성 권한 부여 (PostgreSQL 콘솔에서)
ALTER USER postgres CREATEDB;
```

## 스키마 확인

데이터베이스 테이블이 제대로 생성되었는지 확인:

```bash
psql -U postgres -d vibe_coding_navigator -c "\dt"
```

또는 PostgreSQL 콘솔에서:
```sql
\c vibe_coding_navigator
\dt
```

## 마이그레이션 재실행

테이블을 삭제하고 다시 생성하려면:

```bash
# 주의: 모든 데이터가 삭제됩니다!
psql -U postgres -d vibe_coding_navigator -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npm run migrate
```
