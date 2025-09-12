# 피그마 디자인 통합 가이드

## 1. 피그마 파일 분석 단계

### A. 피그마에서 확인해야 할 항목들

1. **디자인 시스템**
   - 색상 팔레트 (Primary, Secondary, Success, Warning, Error)
   - 타이포그래피 (폰트 패밀리, 크기, 굵기)
   - 간격 시스템 (Spacing)
   - 그림자 (Shadows)
   - 테두리 반지름 (Border Radius)

2. **컴포넌트 스타일**
   - 버튼 (Primary, Secondary, Outline, Ghost)
   - 카드 (Default, Elevated, Interactive)
   - 입력 필드 (Input, Select, Textarea)
   - 모달 (Overlay, Content, Header, Footer)
   - 테이블 (Header, Body, Row, Cell)

3. **레이아웃 구조**
   - 헤더 (Navigation, Logo, User Menu)
   - 사이드바 (Menu Items, Icons)
   - 메인 콘텐츠 (Grid, Cards, Lists)
   - 푸터 (Links, Copyright)

## 2. 현재 프로젝트에 적용된 디자인 시스템

### A. 색상 시스템
```css
/* Primary Colors */
--color-primary: #3b82f6
--color-primary-foreground: #ffffff

/* Secondary Colors */
--color-secondary: #6b7280
--color-secondary-foreground: #ffffff

/* Status Colors */
--color-success: #10b981
--color-warning: #f59e0b
--color-error: #ef4444
```

### B. 타이포그래피
```css
/* Font Family */
--font-family: Inter, system-ui, sans-serif

/* Font Sizes */
--font-size-xs: 0.75rem
--font-size-sm: 0.875rem
--font-size-base: 1rem
--font-size-lg: 1.125rem
--font-size-xl: 1.25rem
```

### C. 간격 시스템
```css
/* Spacing */
--spacing-xs: 0.25rem
--spacing-sm: 0.5rem
--spacing-md: 1rem
--spacing-lg: 1.5rem
--spacing-xl: 2rem
```

## 3. 피그마 디자인 적용 방법

### A. 단계별 적용 과정

1. **피그마 파일 열기**
   ```bash
   # 피그마 웹사이트에서 ITSM-Design.fig 파일 열기
   https://figma.com
   ```

2. **디자인 토큰 추출**
   - 색상 팔레트 스크린샷
   - 타이포그래피 스펙 확인
   - 컴포넌트 스타일 분석

3. **CSS 변수 업데이트**
   ```css
   /* globals.css에 피그마 디자인 반영 */
   :root {
     --figma-primary: #피그마에서_추출한_색상;
     --figma-secondary: #피그마에서_추출한_색상;
   }
   ```

4. **컴포넌트 스타일 업데이트**
   ```tsx
   // 기존 컴포넌트에 피그마 디자인 적용
   <Button className="figma-button-primary">
     버튼 텍스트
   </Button>
   ```

### B. 자동화 도구 사용 (선택사항)

1. **피그마 API 연동**
   ```bash
   npm install @figma/rest-api-spec
   ```

2. **디자인 토큰 자동 추출**
   ```typescript
   import { analyzeFigmaDesign } from '@/lib/figma-analyzer'
   
   const figmaDesign = analyzeFigmaDesign(figmaData)
   ```

## 4. 현재 구현된 페이지들

### A. 완료된 페이지
- ✅ 메인 페이지 (4가지 메뉴 배치)
- ✅ 자주하는질문 페이지
- 🔄 요청진행사항 페이지 (구현 중)

### B. 구현 예정 페이지
- 📋 서비스신청 페이지
- 📋 일반문의사항 페이지
- 📋 관리매니저 페이지
- 📋 시스템관리 페이지 확장

## 5. 피그마 디자인 반영 체크리스트

### A. 디자인 시스템
- [ ] 색상 팔레트 적용
- [ ] 타이포그래피 스타일 적용
- [ ] 간격 시스템 적용
- [ ] 그림자 및 테두리 반지름 적용

### B. 컴포넌트 스타일
- [ ] 버튼 스타일 통일
- [ ] 카드 컴포넌트 스타일 적용
- [ ] 입력 필드 스타일 적용
- [ ] 모달 스타일 적용

### C. 레이아웃 구조
- [ ] 헤더 디자인 적용
- [ ] 네비게이션 스타일 적용
- [ ] 그리드 레이아웃 적용
- [ ] 반응형 디자인 적용

## 6. 다음 단계

1. **피그마 파일 분석**
   - ITSM-Design.fig 파일을 피그마에서 열어서 디자인 확인
   - 주요 화면들의 스크린샷 캡처
   - 디자인 시스템 요소들 추출

2. **디자인 토큰 업데이트**
   - 피그마에서 추출한 색상, 폰트, 간격을 CSS 변수로 추가
   - 기존 디자인 시스템과 비교하여 업데이트

3. **컴포넌트 스타일 적용**
   - 각 페이지의 컴포넌트에 피그마 디자인 적용
   - 일관성 있는 디자인 시스템 구축

4. **반응형 디자인 확인**
   - 모바일, 태블릿, 데스크톱에서의 디자인 확인
   - 피그마의 반응형 디자인과 비교

## 7. 참고 자료

- [피그마 API 문서](https://www.figma.com/developers/api)
- [Tailwind CSS 디자인 시스템](https://tailwindcss.com/docs/design-system)
- [Next.js 스타일링 가이드](https://nextjs.org/docs/basic-features/built-in-css-support)
