# 피그마 색상 추출 가이드

## 피그마에서 색상 추출하는 방법

### 1. 피그마 파일 열기
1. https://figma.com 접속
2. ITSM-Design.fig 파일 업로드
3. 파일이 로드될 때까지 대기

### 2. 색상 정보 확인 방법

#### A. 왼쪽 패널에서 확인
```
1. 왼쪽 패널에서 "Assets" 또는 "Styles" 탭 클릭
2. 색상 스타일 목록 확인
3. 각 색상의 HEX 코드 복사
```

#### B. 요소를 직접 선택하여 확인
```
1. 색상이 적용된 요소 선택
2. 우측 패널에서 "Fill" 또는 "Stroke" 확인
3. 색상 값 복사
```

### 3. 추출해야 할 색상들

#### Primary Colors (주 색상)
- Primary: #____ (예: #3b82f6)
- Primary Hover: #____ (예: #2563eb)
- Primary Light: #____ (예: #dbeafe)

#### Secondary Colors (보조 색상)
- Secondary: #____ (예: #6b7280)
- Secondary Hover: #____ (예: #4b5563)

#### Status Colors (상태 색상)
- Success: #____ (예: #10b981)
- Success Light: #____ (예: #dcfce7)
- Warning: #____ (예: #f59e0b)
- Warning Light: #____ (예: #fef3c7)
- Error: #____ (예: #ef4444)
- Error Light: #____ (예: #fee2e2)

#### Neutral Colors (중성 색상)
- Background: #____ (예: #ffffff)
- Surface: #____ (예: #f9fafb)
- Text Primary: #____ (예: #111827)
- Text Secondary: #____ (예: #6b7280)
- Text Disabled: #____ (예: #9ca3af)
- Border: #____ (예: #e5e7eb)

### 4. 폰트 정보 확인

#### A. 텍스트 요소 선택
```
1. 텍스트가 있는 요소 선택
2. 우측 패널에서 "Text" 섹션 확인
3. 다음 정보 복사:
   - Font Family
   - Font Size
   - Font Weight
   - Line Height
```

#### B. 추출해야 할 폰트 정보
```
- Font Family: ____ (예: Inter, Roboto, etc.)
- Font Sizes: 
  - XS: ____px
  - SM: ____px  
  - Base: ____px
  - LG: ____px
  - XL: ____px
  - 2XL: ____px
  - 3XL: ____px
- Font Weights:
  - Normal: ____
  - Medium: ____
  - Semibold: ____
  - Bold: ____
```

### 5. 간격 정보 확인

#### A. 요소 간격 확인
```
1. 여러 요소가 나란히 있는 레이아웃 선택
2. 요소들 사이의 간격 확인
3. 일반적으로 사용되는 간격 값들 기록
```

#### B. 추출해야 할 간격 정보
```
- XS: ____px (예: 4px)
- SM: ____px (예: 8px)
- MD: ____px (예: 16px)
- LG: ____px (예: 24px)
- XL: ____px (예: 32px)
- 2XL: ____px (예: 48px)
```

### 6. 정보 정리

위에서 추출한 정보를 아래 형식으로 정리하세요:

```
## 색상 정보
Primary: #____
Secondary: #____
Success: #____
Warning: #____
Error: #____
Background: #____
Text Primary: #____

## 폰트 정보
Font Family: ____
Font Sizes: XS=__px, SM=__px, Base=__px, LG=__px, XL=__px, 2XL=__px, 3XL=__px
Font Weights: Normal=__, Medium=__, Semibold=__, Bold=__

## 간격 정보
Spacing: XS=__px, SM=__px, MD=__px, LG=__px, XL=__px, 2XL=__px
```

이 정보를 알려주시면 CSS 변수를 자동으로 업데이트해드리겠습니다!


