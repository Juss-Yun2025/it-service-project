# 피그마 디자인 적용 가이드

## 개요
ITSM-Design.fig 파일의 디자인을 현재 ITSM 애플리케이션에 적용하는 방법을 안내합니다.

## 1단계: 피그마 파일 분석

### 1.1 피그마 파일 열기
1. [Figma 웹사이트](https://figma.com) 접속
2. ITSM-Design.fig 파일 업로드 또는 열기

### 1.2 디자인 토큰 추출
다음 정보들을 피그마에서 추출하여 `itsm-frontend/lib/figma-design-system.ts` 파일을 업데이트하세요:

#### A. 색상 팔레트
```
1. 왼쪽 패널에서 "Assets" 또는 "Styles" 탭 클릭
2. 또는 색상이 적용된 요소를 선택하여 우측 패널에서 "Fill" 확인
3. 다음 색상들의 HEX 코드를 복사:

Primary Colors:
- Primary 50: #____
- Primary 100: #____
- Primary 200: #____
- Primary 300: #____
- Primary 400: #____
- Primary 500: #____ (메인)
- Primary 600: #____
- Primary 700: #____
- Primary 800: #____
- Primary 900: #____
- Primary 950: #____

Secondary Colors:
- Secondary 50: #____
- Secondary 100: #____
- ... (동일한 패턴)

Status Colors:
- Success: #____
- Warning: #____
- Error: #____
- Info: #____

Neutral Colors:
- Gray 50: #____
- Gray 100: #____
- ... (동일한 패턴)
```

#### B. 타이포그래피
```
1. 텍스트 요소를 선택
2. 우측 패널에서 "Text" 섹션 확인
3. 다음 정보를 복사:

Font Family:
- Sans: ____ (예: Inter, Roboto, etc.)
- Mono: ____ (예: JetBrains Mono, Consolas, etc.)

Font Sizes:
- XS: ____px
- SM: ____px
- Base: ____px
- LG: ____px
- XL: ____px
- 2XL: ____px
- 3XL: ____px
- 4XL: ____px
- 5XL: ____px
- 6XL: ____px

Font Weights:
- Normal: ____
- Medium: ____
- Semibold: ____
- Bold: ____
- Extrabold: ____

Line Heights:
- Tight: ____
- Snug: ____
- Normal: ____
- Relaxed: ____
- Loose: ____
```

#### C. 간격 시스템
```
1. 여러 요소가 나란히 있는 레이아웃 선택
2. 요소들 사이의 간격 확인
3. 다음 간격 값들을 복사:

Spacing:
- 0: 0px
- 1: ____px
- 2: ____px
- 3: ____px
- 4: ____px
- 5: ____px
- 6: ____px
- 8: ____px
- 10: ____px
- 12: ____px
- 16: ____px
- 20: ____px
- 24: ____px
- 32: ____px
```

#### D. 그림자 시스템
```
1. 카드나 버튼 같은 요소 선택
2. 우측 패널에서 "Effects" 섹션 확인
3. 다음 그림자 값들을 복사:

Shadows:
- SM: ____
- Base: ____
- MD: ____
- LG: ____
- XL: ____
- 2XL: ____
- Inner: ____
```

#### E. 테두리 반지름
```
1. 버튼이나 카드 같은 요소 선택
2. 우측 패널에서 "Corner radius" 확인
3. 다음 반지름 값들을 복사:

Border Radius:
- None: 0px
- SM: ____px
- Base: ____px
- MD: ____px
- LG: ____px
- XL: ____px
- 2XL: ____px
- 3XL: ____px
- Full: 9999px
```

## 2단계: 디자인 시스템 파일 업데이트

### 2.1 figma-design-system.ts 업데이트
추출한 정보를 `itsm-frontend/lib/figma-design-system.ts` 파일에 반영:

```typescript
// 색상 팔레트 업데이트
export const figmaColors = {
  primary: {
    50: '#eff6ff',    // 피그마에서 추출한 값으로 교체
    100: '#dbeafe',   // 피그마에서 추출한 값으로 교체
    // ... 나머지 색상들
  },
  // ... 다른 색상들
}

// 타이포그래피 업데이트
export const figmaTypography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'], // 피그마에서 추출한 폰트로 교체
  },
  fontSize: {
    xs: '0.75rem',    // 피그마에서 추출한 값으로 교체
    // ... 나머지 크기들
  },
  // ... 다른 타이포그래피 속성들
}
```

### 2.2 CSS 변수 자동 생성
```bash
# 터미널에서 실행
cd itsm-frontend
npm run generate-figma-css
```

또는 수동으로 `itsm-frontend/app/globals.css` 파일의 `:root` 섹션을 업데이트:

```css
:root {
  /* 피그마 디자인 시스템 - 색상 */
  --figma-primary-50: #eff6ff;
  --figma-primary-100: #dbeafe;
  /* ... 모든 색상 변수들 */
  
  /* 피그마 디자인 시스템 - 타이포그래피 */
  --figma-font-family-sans: 'Inter', system-ui, sans-serif;
  --figma-font-size-xs: 0.75rem;
  /* ... 모든 타이포그래피 변수들 */
}
```

## 3단계: 컴포넌트 스타일 적용

### 3.1 기존 컴포넌트 업데이트
각 컴포넌트 파일에서 피그마 디자인 토큰을 사용하도록 업데이트:

```typescript
// 예: Button 컴포넌트
import { figmaComponents } from '@/lib/figma-design-system'

const buttonStyles = figmaComponents.button.primary
// 또는 CSS 클래스 사용
className="figma-button-primary"
```

### 3.2 CSS 클래스 적용
`itsm-frontend/app/globals.css`에 피그마 기반 유틸리티 클래스 추가:

```css
/* 피그마 버튼 스타일 */
.figma-button-primary {
  background-color: var(--figma-primary-500);
  color: var(--figma-white);
  border-radius: var(--figma-border-radius-lg);
  padding: var(--figma-spacing-2) var(--figma-spacing-4);
  font-size: var(--figma-font-size-sm);
  font-weight: var(--figma-font-weight-medium);
  box-shadow: var(--figma-shadow-sm);
}

.figma-button-primary:hover {
  background-color: var(--figma-primary-600);
}

/* 피그마 카드 스타일 */
.figma-card {
  background-color: var(--figma-white);
  border: 1px solid var(--figma-gray-200);
  border-radius: var(--figma-border-radius-lg);
  box-shadow: var(--figma-shadow-sm);
  padding: var(--figma-spacing-6);
}
```

## 4단계: 페이지별 디자인 적용

### 4.1 메인 페이지
- 헤더 스타일링
- 4가지 메뉴 카드 디자인
- 로그인 모달 디자인

### 4.2 서비스 신청 페이지
- 폼 레이아웃 개선
- 입력 필드 스타일링
- 버튼 디자인

### 4.3 요청 진행사항 페이지
- 테이블 디자인
- 상태 표시 스타일
- 모달 디자인

### 4.4 일반 문의사항 페이지
- 문의 목록 디자인
- 비밀글 표시 스타일
- 답변 모달 디자인

## 5단계: 반응형 디자인 적용

### 5.1 브레이크포인트 설정
```css
/* 피그마에서 추출한 브레이크포인트 */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### 5.2 모바일 최적화
- 터치 친화적 버튼 크기
- 모바일 네비게이션
- 반응형 테이블

## 6단계: 테스트 및 검증

### 6.1 시각적 검증
- [ ] 모든 페이지가 피그마 디자인과 일치하는지 확인
- [ ] 색상이 정확히 적용되었는지 확인
- [ ] 타이포그래피가 일치하는지 확인
- [ ] 간격과 레이아웃이 정확한지 확인

### 6.2 반응형 테스트
- [ ] 모바일 화면에서 정상 작동하는지 확인
- [ ] 태블릿 화면에서 정상 작동하는지 확인
- [ ] 데스크톱 화면에서 정상 작동하는지 확인

### 6.3 접근성 테스트
- [ ] 색상 대비가 충분한지 확인
- [ ] 키보드 네비게이션이 가능한지 확인
- [ ] 스크린 리더 호환성 확인

## 7단계: 최적화

### 7.1 성능 최적화
- CSS 번들 크기 최적화
- 사용하지 않는 스타일 제거
- Critical CSS 인라인화

### 7.2 유지보수성 향상
- 디자인 토큰 중앙 관리
- 컴포넌트 재사용성 향상
- 문서화 업데이트

## 도구 및 리소스

### 유용한 도구
- [Figma Dev Mode](https://www.figma.com/dev-mode) - 디자인 토큰 추출
- [Figma Tokens](https://www.figma.com/community/plugin/843461159747178946/Figma-Tokens) - 디자인 토큰 관리
- [Figma to Code](https://www.figma.com/community/plugin/747985167520967365/Figma-to-Code) - 자동 코드 생성

### 참고 자료
- [Figma Design System 가이드](https://www.figma.com/design-systems/)
- [CSS 변수 사용법](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Tailwind CSS 커스터마이징](https://tailwindcss.com/docs/configuration)

## 문제 해결

### 자주 발생하는 문제
1. **색상이 일치하지 않는 경우**: HEX 코드를 정확히 복사했는지 확인
2. **폰트가 적용되지 않는 경우**: 폰트 파일이 올바르게 로드되었는지 확인
3. **간격이 맞지 않는 경우**: px 값을 rem으로 정확히 변환했는지 확인
4. **반응형이 작동하지 않는 경우**: 브레이크포인트가 올바르게 설정되었는지 확인

### 지원
문제가 발생하면 다음을 확인하세요:
1. 브라우저 개발자 도구에서 CSS가 올바르게 로드되었는지 확인
2. 콘솔에 오류 메시지가 있는지 확인
3. 피그마 파일의 디자인 토큰이 정확히 추출되었는지 확인
