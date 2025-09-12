# 피그마 파일 분석 단계별 가이드

## 1단계: 피그마 파일 열기

### A. 피그마 웹사이트 접속
1. https://figma.com 접속
2. 로그인 (필요시)
3. "Import file" 또는 "Import" 버튼 클릭
4. ITSM-Design.fig 파일 선택하여 업로드

### B. 파일 구조 확인
1. 왼쪽 패널에서 페이지 구조 확인
2. 컴포넌트 라이브러리 확인
3. 디자인 시스템 요소들 확인

## 2단계: 색상 팔레트 추출

### A. 색상 확인 방법
1. **왼쪽 패널에서 확인**
   - "Assets" 또는 "Styles" 탭 클릭
   - 색상 스타일 목록 확인

2. **요소를 직접 선택하여 확인**
   - 색상이 적용된 요소 선택
   - 우측 패널에서 "Fill" 또는 "Stroke" 확인

### B. 추출해야 할 색상들
```
Primary Color (주 색상): #____
Secondary Color (보조 색상): #____
Success Color (성공 색상): #____
Warning Color (경고 색상): #____
Error Color (오류 색상): #____
Background Color (배경 색상): #____
Surface Color (표면 색상): #____
Text Primary (주 텍스트): #____
Text Secondary (보조 텍스트): #____
Border Color (테두리 색상): #____
```

## 3단계: 타이포그래피 정보 추출

### A. 폰트 정보 확인
1. 텍스트 요소 선택
2. 우측 패널에서 "Text" 섹션 확인
3. 다음 정보 복사:
   - Font Family
   - Font Size
   - Font Weight
   - Line Height

### B. 추출해야 할 폰트 정보
```
Font Family: ____ (예: Inter, Roboto, etc.)
Font Sizes:
  - XS: ____px
  - SM: ____px
  - Base: ____px
  - LG: ____px
  - XL: ____px
  - 2XL: ____px
  - 3XL: ____px
Font Weights:
  - Normal: ____
  - Medium: ____
  - Semibold: ____
  - Bold: ____
```

## 4단계: 간격 시스템 추출

### A. 간격 확인 방법
1. 여러 요소가 나란히 있는 레이아웃 선택
2. 요소들 사이의 간격 확인
3. 일반적으로 사용되는 간격 값들 기록

### B. 추출해야 할 간격 정보
```
XS: ____px (예: 4px)
SM: ____px (예: 8px)
MD: ____px (예: 16px)
LG: ____px (예: 24px)
XL: ____px (예: 32px)
2XL: ____px (예: 48px)
```

## 5단계: 컴포넌트 스타일 확인

### A. 버튼 스타일
1. 버튼 요소 선택
2. 색상, 크기, 모양 확인
3. Hover 상태 확인

### B. 카드 스타일
1. 카드 요소 선택
2. 배경색, 테두리, 그림자 확인
3. 패딩, 마진 확인

### C. 입력 필드 스타일
1. 입력 필드 선택
2. 테두리, 포커스 상태 확인
3. 플레이스홀더 스타일 확인

## 6단계: 레이아웃 구조 확인

### A. 헤더 구조
1. 헤더 영역 확인
2. 로고, 네비게이션, 사용자 메뉴 확인
3. 높이, 배경색, 테두리 확인

### B. 사이드바 구조
1. 사이드바 영역 확인
2. 메뉴 아이템, 아이콘 확인
3. 너비, 배경색 확인

### C. 메인 콘텐츠 구조
1. 메인 콘텐츠 영역 확인
2. 그리드 레이아웃 확인
3. 카드 배치, 간격 확인

## 7단계: 정보 정리

위에서 추출한 정보를 아래 형식으로 정리하세요:

```
## 색상 정보
Primary: #____
Secondary: #____
Success: #____
Warning: #____
Error: #____
Background: #____
Surface: #____
Text Primary: #____
Text Secondary: #____
Border: #____

## 폰트 정보
Font Family: ____
Font Sizes: XS=__px, SM=__px, Base=__px, LG=__px, XL=__px, 2XL=__px, 3XL=__px
Font Weights: Normal=__, Medium=__, Semibold=__, Bold=__

## 간격 정보
Spacing: XS=__px, SM=__px, MD=__px, LG=__px, XL=__px, 2XL=__px

## 컴포넌트 스타일
Button Primary: 배경색=#____, 텍스트색=#____, 패딩=__px
Button Secondary: 배경색=#____, 텍스트색=#____, 패딩=__px
Card: 배경색=#____, 테두리=#____, 그림자=____, 패딩=__px
Input: 테두리=#____, 포커스=#____, 패딩=__px
```

이 정보를 알려주시면 CSS 변수를 자동으로 업데이트해드리겠습니다!
