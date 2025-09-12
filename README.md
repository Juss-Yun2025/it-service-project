# ITSM 프로젝트

IT Service Management (ITSM) 시스템의 Next.js 기반 프론트엔드 애플리케이션입니다.

## 🚀 주요 기능

### 사용자 역할별 대시보드
- **시스템관리자**: 전체 시스템 관리, 사용자/기술자 관리
- **서비스관리자**: 서비스 요청 관리, 기술자 배정
- **기술자**: 작업 수행, 진행상황 업데이트
- **배정담당자**: 기술자 배정 관리
- **일반사용자**: 서비스 요청, 문의사항, FAQ

### 주요 페이지
- 📋 **서비스 신청**: IT 서비스 요청 및 대리 신청
- 📊 **요청 진행사항**: 신청한 서비스의 진행상황 조회
- ❓ **자주하는 질문**: FAQ 및 검색 기능
- 💬 **일반문의사항**: 문의 작성 및 답변 조회
- 👤 **회원가입**: 사용자 등록

## 🛠 기술 스택

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Custom UI Components
- **Authentication**: Role-based Access Control
- **Design System**: Figma Integration Ready

## 📁 프로젝트 구조

```
itsm-project/
├── itsm-frontend/          # Next.js 프론트엔드 애플리케이션
│   ├── app/               # Next.js App Router 페이지
│   ├── components/        # React 컴포넌트
│   ├── lib/              # 유틸리티 및 설정
│   └── public/           # 정적 파일
├── cursor-talk-to-figma-mcp-main/  # Figma 연동 MCP
└── README.md
```

## 🚀 시작하기

### 1. 저장소 클론
```bash
git clone https://github.com/Juss-Yun/itsm-project.git
cd itsm-project
```

### 2. 의존성 설치
```bash
cd itsm-frontend
npm install
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 브라우저에서 확인
- `http://localhost:3000`으로 접속

## 🔐 테스트 계정

| 역할 | 이메일 | 비밀번호 |
|------|--------|----------|
| 시스템관리자 | system@itsm.com | system123 |
| 서비스관리자 | service@itsm.com | service123 |
| 기술자 | tech@itsm.com | tech123 |
| 배정담당자 | assign@itsm.com | assign123 |
| 일반사용자 | user@itsm.com | user123 |

## 🎨 디자인 시스템

- **Figma 연동 준비**: 디자인 토큰 추출 및 적용 시스템 구축
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원
- **접근성**: WCAG 가이드라인 준수

## 📝 개발 가이드

### 권한 시스템
- 역할 기반 접근 제어 (RBAC)
- 화면별 권한 관리
- 동적 라우팅

### 컴포넌트 개발
- 재사용 가능한 UI 컴포넌트
- TypeScript 타입 안정성
- Tailwind CSS 유틸리티 클래스

## 🔧 스크립트

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# 린트 검사
npm run lint

# Figma 토큰 추출
npm run extract-figma-tokens
```

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.
