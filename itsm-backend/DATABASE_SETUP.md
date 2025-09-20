# ITSM Database Setup Guide

## PostgreSQL 설치 및 설정

### 1. PostgreSQL 설치

#### Windows
1. [PostgreSQL 공식 웹사이트](https://www.postgresql.org/download/windows/)에서 다운로드
2. 설치 시 비밀번호 설정 (기억해두세요!)
3. 기본 포트 5432 사용

#### macOS
```bash
# Homebrew 사용
brew install postgresql
brew services start postgresql
```

#### Ubuntu/Linux
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. PostgreSQL 설정

#### 2.1 PostgreSQL 접속
```bash
# Windows (Command Prompt)
psql -U postgres

# macOS/Linux
sudo -u postgres psql
```

#### 2.2 데이터베이스 생성
```sql
-- 데이터베이스 생성
CREATE DATABASE itsm_db;

-- 사용자 생성 (선택사항)
CREATE USER itsm_user WITH PASSWORD 'your_password';

-- 권한 부여
GRANT ALL PRIVILEGES ON DATABASE itsm_db TO itsm_user;
```

#### 2.3 데이터베이스 연결
```sql
-- 데이터베이스에 연결
\c itsm_db
```

### 3. 스키마 실행

#### 3.1 스키마 파일 실행
```bash
# Windows
psql -U postgres -d itsm_db -f src/config/database.sql

# macOS/Linux
psql -U postgres -d itsm_db -f src/config/database.sql
```

#### 3.2 또는 psql 내에서 실행
```sql
\c itsm_db
\i src/config/database.sql
```

### 4. 환경 변수 설정

`env.local` 파일을 `.env`로 복사하고 실제 값으로 수정:

```bash
cp env.local .env
```

`.env` 파일 내용:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=itsm_db
DB_USER=postgres
DB_PASSWORD=your_actual_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_make_it_very_long_and_secure
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### 5. 테이블 확인

스키마 실행 후 다음 명령으로 테이블이 생성되었는지 확인:

```sql
-- 테이블 목록 확인
\dt

-- 특정 테이블 구조 확인
\d users
\d service_requests
\d general_inquiries
\d faqs
```

### 6. 초기 데이터 확인

```sql
-- 사용자 데이터 확인
SELECT * FROM users;

-- 서비스 카테고리 확인
SELECT * FROM service_categories;

-- FAQ 데이터 확인
SELECT * FROM faqs;
```

## 기본 계정 정보

스키마 실행 후 다음 기본 계정들이 생성됩니다:

| 역할 | 이메일 | 비밀번호 | 설명 |
|---|---|---|---|
| 시스템관리자 | admin@itsm.com | admin123 | 전체 시스템 관리 |
| 서비스매니저 | service@itsm.com | service123 | 서비스 관리 |
| 배정담당자 | assignment@itsm.com | assignment123 | 작업 배정 |
| 조치담당자 | tech@itsm.com | tech123 | 실제 작업 수행 |
| 일반사용자 | user@itsm.com | user123 | 서비스 요청 |

## 문제 해결

### 1. 연결 오류
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**해결방법:**
- PostgreSQL 서비스가 실행 중인지 확인
- 포트 번호가 5432인지 확인
- 방화벽 설정 확인

### 2. 인증 오류
```
Error: password authentication failed for user "postgres"
```
**해결방법:**
- 비밀번호가 올바른지 확인
- 사용자명이 올바른지 확인
- pg_hba.conf 파일에서 인증 방법 확인

### 3. 권한 오류
```
Error: permission denied for database "itsm_db"
```
**해결방법:**
- 사용자에게 데이터베이스 권한 부여
- 관리자 권한으로 실행

### 4. 스키마 실행 오류
```
Error: relation "users" already exists
```
**해결방법:**
- 기존 테이블 삭제 후 재실행
- 또는 스키마에서 `CREATE TABLE IF NOT EXISTS` 사용

## 데이터베이스 백업 및 복원

### 백업
```bash
# 전체 데이터베이스 백업
pg_dump -U postgres -h localhost itsm_db > itsm_backup.sql

# 특정 테이블만 백업
pg_dump -U postgres -h localhost -t users itsm_db > users_backup.sql
```

### 복원
```bash
# 백업 파일로부터 복원
psql -U postgres -h localhost itsm_db < itsm_backup.sql
```

## 성능 최적화

### 1. 인덱스 확인
```sql
-- 인덱스 목록 확인
SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';

-- 인덱스 사용 통계 확인
SELECT schemaname, tablename, indexname, idx_tup_read, idx_tup_fetch 
FROM pg_stat_user_indexes;
```

### 2. 테이블 크기 확인
```sql
-- 테이블 크기 확인
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 보안 설정

### 1. 사용자 권한 최소화
```sql
-- 읽기 전용 사용자 생성
CREATE USER itsm_readonly WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE itsm_db TO itsm_readonly;
GRANT USAGE ON SCHEMA public TO itsm_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO itsm_readonly;
```

### 2. 연결 제한
```sql
-- 사용자별 연결 수 제한
ALTER USER itsm_user CONNECTION LIMIT 10;
```

### 3. SSL 연결 강제 (프로덕션)
```bash
# postgresql.conf에서 설정
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'
```
