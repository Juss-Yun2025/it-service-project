# ITSM Backend API Documentation

## 개요

ITSM (IT Service Management) 시스템의 백엔드 API 문서입니다.

**Base URL**: `http://localhost:3001/api`

## 인증

대부분의 API는 JWT 토큰 기반 인증이 필요합니다. 요청 헤더에 다음을 포함하세요:

```
Authorization: Bearer <your_jwt_token>
```

## 응답 형식

모든 API 응답은 다음 형식을 따릅니다:

```json
{
  "success": true|false,
  "data": {}, // 성공 시 데이터
  "message": "string", // 응답 메시지
  "error": "string", // 오류 시 오류 메시지
  "pagination": { // 페이지네이션 정보 (해당하는 경우)
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## 사용자 권한

- `user`: 일반 사용자
- `technician`: 조치담당자
- `assignment_manager`: 배정담당자
- `service_manager`: 관리매니저
- `system_admin`: 시스템관리자

---

## 1. 인증 API (`/api/auth`)

### 1.1 로그인
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@itsm.com",
  "password": "admin123"
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "admin@itsm.com",
      "name": "시스템관리자",
      "department": "IT팀",
      "position": "대리",
      "role": "system_admin"
    }
  },
  "message": "Login successful"
}
```

### 1.2 회원가입
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동",
  "department": "인사팀",
  "position": "사원",
  "role": "user",
  "phone": "010-1234-5678"
}
```

### 1.3 프로필 조회
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### 1.4 프로필 수정
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "홍길동",
  "department": "인사팀",
  "position": "대리",
  "phone": "010-1234-5678"
}
```

---

## 2. 사용자 관리 API (`/api/users`)

### 2.1 모든 사용자 조회 (관리자만)
```http
GET /api/users?page=1&limit=10&search=홍&department=인사팀&role=user
Authorization: Bearer <token>
```

**쿼리 파라미터:**
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 10)
- `search`: 검색어 (이름, 이메일)
- `status`: 사용자 상태 (active, inactive, suspended)
- `department`: 부서
- `role`: 권한
- `startDate`: 생성일 시작
- `endDate`: 생성일 종료

### 2.2 특정 사용자 조회
```http
GET /api/users/{id}
Authorization: Bearer <token>
```

### 2.3 사용자 정보 수정 (관리자만)
```http
PUT /api/users/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "홍길동",
  "department": "인사팀",
  "position": "대리",
  "role": "user",
  "phone": "010-1234-5678",
  "status": "active"
}
```

### 2.4 사용자 삭제 (관리자만)
```http
DELETE /api/users/{id}
Authorization: Bearer <token>
```

### 2.5 사용자 비밀번호 재설정 (관리자만)
```http
POST /api/users/{id}/reset-password
Authorization: Bearer <token>
```

**응답:**
```json
{
  "success": true,
  "data": {
    "temporaryPassword": "TempPass123!",
    "resetToken": "abc123...",
    "expiresAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Password reset successfully"
}
```

---

## 3. 서비스 요청 API (`/api/services`)

### 3.1 서비스 카테고리 조회
```http
GET /api/services/categories
Authorization: Bearer <token>
```

### 3.2 서비스 요청 생성
```http
POST /api/services
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "컴퓨터 수리 요청",
  "description": "컴퓨터가 부팅되지 않습니다.",
  "category_id": "uuid",
  "priority": "high",
  "service_type": "하드웨어 문제"
}
```

### 3.3 서비스 요청 목록 조회
```http
GET /api/services?page=1&limit=10&status=pending&stage=신청&department=인사팀
Authorization: Bearer <token>
```

**쿼리 파라미터:**
- `page`, `limit`: 페이지네이션
- `search`: 검색어 (제목, 설명, 요청번호)
- `status`: 상태 (pending, assigned, in_progress, completed, cancelled)
- `stage`: 단계 (신청, 배정, 확인, 예정, 작업, 완료, 미결)
- `department`: 부서
- `priority`: 우선순위 (low, medium, high, urgent)
- `startDate`, `endDate`: 요청일 범위

### 3.4 특정 서비스 요청 조회
```http
GET /api/services/{id}
Authorization: Bearer <token>
```

### 3.5 서비스 요청 수정
```http
PUT /api/services/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "수정된 제목",
  "description": "수정된 설명",
  "priority": "medium",
  "status": "assigned",
  "stage": "배정",
  "estimated_completion_date": "2024-01-01T00:00:00.000Z",
  "work_start_date": "2024-01-01T00:00:00.000Z",
  "work_completion_date": "2024-01-01T00:00:00.000Z",
  "technician_id": "uuid",
  "resolution_notes": "해결 완료"
}
```

### 3.6 서비스 요청 배정 (배정담당자 이상)
```http
POST /api/services/{id}/assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "technician_id": "uuid",
  "estimated_completion_date": "2024-01-01T00:00:00.000Z"
}
```

---

## 4. 일반문의 API (`/api/inquiries`)

### 4.1 일반문의 생성
```http
POST /api/inquiries
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "문의 제목",
  "content": "문의 내용"
}
```

### 4.2 일반문의 목록 조회
```http
GET /api/inquiries?page=1&limit=10&status=pending&unansweredOnly=true
Authorization: Bearer <token>
```

**쿼리 파라미터:**
- `page`, `limit`: 페이지네이션
- `search`: 검색어 (제목, 내용, 문의번호)
- `status`: 상태 (pending, answered, closed)
- `department`: 부서
- `startDate`, `endDate`: 문의일 범위
- `unansweredOnly`: 미답변만 조회 (true/false)

### 4.3 특정 일반문의 조회
```http
GET /api/inquiries/{id}
Authorization: Bearer <token>
```

### 4.4 일반문의 수정
```http
PUT /api/inquiries/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "수정된 제목",
  "content": "수정된 내용"
}
```

### 4.5 일반문의 답변 (조치담당자 이상)
```http
POST /api/inquiries/{id}/answer
Authorization: Bearer <token>
Content-Type: application/json

{
  "answer_content": "답변 내용"
}
```

### 4.6 일반문의 삭제
```http
DELETE /api/inquiries/{id}
Authorization: Bearer <token>
```

---

## 5. FAQ API (`/api/faqs`)

### 5.1 FAQ 목록 조회
```http
GET /api/faqs?page=1&limit=10&search=비밀번호&category=계정관리
Authorization: Bearer <token>
```

**쿼리 파라미터:**
- `page`, `limit`: 페이지네이션
- `search`: 검색어 (질문, 답변)
- `category`: 카테고리
- `is_active`: 활성 상태 (true/false)

### 5.2 특정 FAQ 조회
```http
GET /api/faqs/{id}
Authorization: Bearer <token>
```

### 5.3 FAQ 생성 (관리자 이상)
```http
POST /api/faqs
Authorization: Bearer <token>
Content-Type: application/json

{
  "question": "자주 묻는 질문",
  "answer": "답변 내용",
  "category": "계정관리"
}
```

### 5.4 FAQ 수정 (관리자 이상)
```http
PUT /api/faqs/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "question": "수정된 질문",
  "answer": "수정된 답변",
  "category": "계정관리",
  "is_active": true
}
```

### 5.5 FAQ 삭제 (관리자 이상)
```http
DELETE /api/faqs/{id}
Authorization: Bearer <token>
```

### 5.6 FAQ 카테고리 조회
```http
GET /api/faqs/categories
Authorization: Bearer <token>
```

### 5.7 인기 FAQ 조회
```http
GET /api/faqs/popular?limit=5
Authorization: Bearer <token>
```

---

## 6. 리포트 API (`/api/reports`)

### 6.1 대시보드 데이터 조회
```http
GET /api/reports/dashboard
Authorization: Bearer <token>
```

### 6.2 서비스 현황 리포트 (관리자 이상)
```http
GET /api/reports/service?page=1&limit=10&status=completed&department=인사팀
Authorization: Bearer <token>
```

### 6.3 서비스 통계 (관리자 이상)
```http
GET /api/reports/service-statistics?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

**응답:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_requests": 100,
      "pending_requests": 10,
      "assigned_requests": 20,
      "in_progress_requests": 15,
      "completed_requests": 50,
      "cancelled_requests": 5,
      "avg_assignment_hours": 2.5,
      "avg_work_hours": 4.2
    },
    "by_department": [
      {
        "requester_department": "인사팀",
        "request_count": 30,
        "completed_count": 25
      }
    ],
    "by_service_type": [
      {
        "service_type": "시스템 오류",
        "request_count": 40,
        "completed_count": 35
      }
    ]
  }
}
```

### 6.4 일반문의 통계 (관리자 이상)
```http
GET /api/reports/inquiry-statistics?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

---

## 오류 코드

| HTTP 상태 코드 | 설명 |
|---|---|
| 200 | 성공 |
| 201 | 생성 성공 |
| 400 | 잘못된 요청 |
| 401 | 인증 필요 |
| 403 | 권한 부족 |
| 404 | 리소스 없음 |
| 500 | 서버 오류 |

## 예제 사용법

### 1. 로그인 및 토큰 저장
```javascript
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'admin@itsm.com',
    password: 'admin123'
  })
});

const { data } = await loginResponse.json();
const token = data.token;
localStorage.setItem('token', token);
```

### 2. 인증이 필요한 API 호출
```javascript
const token = localStorage.getItem('token');

const response = await fetch('/api/services', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
```

### 3. 페이지네이션 처리
```javascript
const getServices = async (page = 1, limit = 10) => {
  const response = await fetch(`/api/services?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  
  console.log('Data:', data.data);
  console.log('Pagination:', data.pagination);
};
```
