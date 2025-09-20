# ITSM Backend API

ITSM (IT Service Management) 시스템의 백엔드 API 서버입니다.

## 기술 스택

- **Node.js** - 런타임 환경
- **Express.js** - 웹 프레임워크
- **TypeScript** - 타입 안전성
- **PostgreSQL** - 데이터베이스
- **JWT** - 인증 토큰
- **bcryptjs** - 패스워드 해싱

## 프로젝트 구조

```
itsm-backend/
├── src/
│   ├── config/
│   │   ├── database.ts      # 데이터베이스 연결 설정
│   │   └── database.sql     # 데이터베이스 스키마
│   ├── controllers/         # 컨트롤러 (비즈니스 로직)
│   ├── middleware/          # 미들웨어 (인증, 검증 등)
│   ├── models/             # 데이터 모델 (향후 ORM 사용 시)
│   ├── routes/             # API 라우트
│   ├── types/              # TypeScript 타입 정의
│   ├── utils/              # 유틸리티 함수
│   └── index.ts            # 메인 애플리케이션 파일
├── package.json
├── tsconfig.json
└── README.md
```

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`env.local` 파일을 `.env`로 복사하고 실제 값으로 수정:

```bash
cp env.local .env
```

`.env` 파일에서 다음 값들을 설정:

```env
# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=5432
DB_NAME=itsm_db
DB_USER=your_username
DB_PASSWORD=your_password

# JWT 설정
JWT_SECRET=your_jwt_secret_key_here_make_it_very_long_and_secure
JWT_EXPIRES_IN=24h

# 서버 설정
PORT=3001
NODE_ENV=development

# CORS 설정
CORS_ORIGIN=http://localhost:3000
```

### 3. 데이터베이스 설정

PostgreSQL에서 데이터베이스를 생성하고 스키마를 실행:

```sql
-- 데이터베이스 생성
CREATE DATABASE itsm_db;

-- 스키마 실행
\i src/config/database.sql
```

### 4. 개발 서버 실행

```bash
npm run dev
```

### 5. 프로덕션 빌드

```bash
npm run build
npm start
```

## API 엔드포인트

### 인증 (Authentication)

- `POST /api/auth/login` - 로그인
- `POST /api/auth/register` - 회원가입
- `GET /api/auth/profile` - 프로필 조회
- `PUT /api/auth/profile` - 프로필 수정

### 사용자 관리 (User Management)

- `GET /api/users` - 모든 사용자 조회 (관리자만)
- `GET /api/users/:id` - 특정 사용자 조회
- `PUT /api/users/:id` - 사용자 정보 수정 (관리자만)
- `DELETE /api/users/:id` - 사용자 삭제 (관리자만)
- `POST /api/users/:id/reset-password` - 비밀번호 재설정 (관리자만)

## 데이터베이스 스키마

### 주요 테이블

1. **users** - 사용자 정보
2. **service_requests** - 서비스 요청
3. **general_inquiries** - 일반문의
4. **faqs** - 자주하는 질문
5. **service_categories** - 서비스 카테고리
6. **system_logs** - 시스템 로그
7. **password_reset_tokens** - 비밀번호 재설정 토큰

### 사용자 권한

- `user` - 일반 사용자
- `technician` - 조치담당자
- `assignment_manager` - 배정담당자
- `service_manager` - 관리매니저
- `system_admin` - 시스템관리자

## 보안 기능

- JWT 토큰 기반 인증
- bcryptjs를 사용한 패스워드 해싱
- CORS 설정
- Helmet을 통한 보안 헤더 설정
- 입력 데이터 검증

## 개발 가이드

### 새로운 API 추가

1. `src/types/index.ts`에 타입 정의 추가
2. `src/controllers/`에 컨트롤러 생성
3. `src/routes/`에 라우트 정의
4. `src/index.ts`에 라우트 등록

### 미들웨어 사용

- `authenticateToken` - JWT 토큰 검증
- `requireRole` - 특정 권한 필요
- `validateRequired` - 필수 필드 검증

## 테스트

```bash
# 단위 테스트 (향후 추가 예정)
npm test

# API 테스트 (Postman 또는 curl 사용)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@itsm.com","password":"admin123"}'
```

## 배포

### Docker (향후 추가 예정)

```bash
# Docker 이미지 빌드
docker build -t itsm-backend .

# 컨테이너 실행
docker run -p 3001:3001 itsm-backend
```

### 환경별 설정

- `development` - 개발 환경
- `production` - 프로덕션 환경
- `test` - 테스트 환경

## 문제 해결

### 일반적인 문제

1. **데이터베이스 연결 실패**
   - PostgreSQL 서비스가 실행 중인지 확인
   - 환경 변수 설정 확인
   - 방화벽 설정 확인

2. **JWT 토큰 오류**
   - JWT_SECRET 환경 변수 확인
   - 토큰 만료 시간 확인

3. **CORS 오류**
   - CORS_ORIGIN 환경 변수 확인
   - 프론트엔드 URL 확인

## 기여하기

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 라이선스

ISC License
