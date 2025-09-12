/**
 * 피그마 디자인 시스템 통합 관리
 * ITSM-Design.fig 파일에서 추출한 디자인 토큰들을 관리합니다.
 */

// 색상 팔레트 (피그마에서 추출 예정)
export const figmaColors = {
  // Primary Colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe', 
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // 메인 프라이머리
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554'
  },
  
  // Secondary Colors
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617'
  },
  
  // Status Colors
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981', // 메인 성공 색상
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22'
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // 메인 경고 색상
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03'
  },
  
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // 메인 오류 색상
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a'
  },
  
  // Neutral Colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712'
  }
}

// 타이포그래피 시스템 (피그마에서 추출 예정)
export const figmaTypography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Consolas', 'monospace']
  },
  
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem'  // 60px
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800'
  },
  
  lineHeight: {
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2'
  }
}

// 간격 시스템 (피그마에서 추출 예정)
export const figmaSpacing = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
  32: '8rem'     // 128px
}

// 그림자 시스템 (피그마에서 추출 예정)
export const figmaShadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)'
}

// 테두리 반지름 시스템
export const figmaBorderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px'
}

// 컴포넌트별 디자인 토큰
export const figmaComponents = {
  button: {
    primary: {
      background: figmaColors.primary[500],
      backgroundHover: figmaColors.primary[600],
      backgroundActive: figmaColors.primary[700],
      text: '#ffffff',
      border: 'transparent',
      borderRadius: figmaBorderRadius.lg,
      padding: `${figmaSpacing[2]} ${figmaSpacing[4]}`,
      fontSize: figmaTypography.fontSize.sm,
      fontWeight: figmaTypography.fontWeight.medium,
      boxShadow: figmaShadows.sm
    },
    secondary: {
      background: 'transparent',
      backgroundHover: figmaColors.gray[100],
      backgroundActive: figmaColors.gray[200],
      text: figmaColors.gray[700],
      border: `1px solid ${figmaColors.gray[300]}`,
      borderRadius: figmaBorderRadius.lg,
      padding: `${figmaSpacing[2]} ${figmaSpacing[4]}`,
      fontSize: figmaTypography.fontSize.sm,
      fontWeight: figmaTypography.fontWeight.medium,
      boxShadow: figmaShadows.sm
    }
  },
  
  card: {
    background: '#ffffff',
    border: `1px solid ${figmaColors.gray[200]}`,
    borderRadius: figmaBorderRadius.lg,
    boxShadow: figmaShadows.sm,
    padding: figmaSpacing[6]
  },
  
  input: {
    background: '#ffffff',
    border: `1px solid ${figmaColors.gray[300]}`,
    borderFocus: figmaColors.primary[500],
    borderRadius: figmaBorderRadius.md,
    padding: `${figmaSpacing[2]} ${figmaSpacing[3]}`,
    fontSize: figmaTypography.fontSize.sm,
    boxShadow: figmaShadows.sm
  },
  
  modal: {
    overlay: 'rgba(0, 0, 0, 0.5)',
    background: '#ffffff',
    borderRadius: figmaBorderRadius.xl,
    boxShadow: figmaShadows['2xl'],
    padding: figmaSpacing[6]
  }
}

// 상태별 색상 매핑
export const figmaStatusColors = {
  info: figmaColors.primary[500],
  success: figmaColors.success[500],
  warning: figmaColors.warning[500],
  error: figmaColors.error[500],
  neutral: figmaColors.gray[500]
}

// 피그마 디자인 토큰을 CSS 변수로 변환하는 함수
export function generateFigmaCSSVariables() {
  const cssVariables: Record<string, string> = {}
  
  // 색상 변수 생성
  Object.entries(figmaColors).forEach(([colorName, colorValues]) => {
    Object.entries(colorValues).forEach(([shade, value]) => {
      cssVariables[`--figma-${colorName}-${shade}`] = value
    })
  })
  
  // 타이포그래피 변수 생성
  Object.entries(figmaTypography.fontSize).forEach(([size, value]) => {
    cssVariables[`--figma-font-size-${size}`] = value
  })
  
  Object.entries(figmaTypography.fontWeight).forEach(([weight, value]) => {
    cssVariables[`--figma-font-weight-${weight}`] = value
  })
  
  // 간격 변수 생성
  Object.entries(figmaSpacing).forEach(([size, value]) => {
    cssVariables[`--figma-spacing-${size}`] = value
  })
  
  // 그림자 변수 생성
  Object.entries(figmaShadows).forEach(([shadow, value]) => {
    cssVariables[`--figma-shadow-${shadow}`] = value
  })
  
  // 테두리 반지름 변수 생성
  Object.entries(figmaBorderRadius).forEach(([radius, value]) => {
    cssVariables[`--figma-border-radius-${radius}`] = value
  })
  
  return cssVariables
}

// 피그마 디자인 토큰을 Tailwind CSS 클래스로 변환하는 함수
export function generateFigmaTailwindConfig() {
  return {
    colors: figmaColors,
    fontFamily: figmaTypography.fontFamily,
    fontSize: figmaTypography.fontSize,
    fontWeight: figmaTypography.fontWeight,
    lineHeight: figmaTypography.lineHeight,
    spacing: figmaSpacing,
    boxShadow: figmaShadows,
    borderRadius: figmaBorderRadius
  }
}

// 컴포넌트 스타일 생성기
export function createFigmaComponentStyles(componentName: keyof typeof figmaComponents) {
  const component = figmaComponents[componentName]
  const styles: Record<string, string> = {}
  
  Object.entries(component).forEach(([variant, properties]) => {
    const className = `.figma-${componentName}-${variant}`
    const cssProperties = Object.entries(properties)
      .map(([prop, value]) => `${prop.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
      .join('; ')
    
    styles[className] = cssProperties
  })
  
  return styles
}

export default {
  colors: figmaColors,
  typography: figmaTypography,
  spacing: figmaSpacing,
  shadows: figmaShadows,
  borderRadius: figmaBorderRadius,
  components: figmaComponents,
  statusColors: figmaStatusColors,
  generateCSSVariables: generateFigmaCSSVariables,
  generateTailwindConfig: generateFigmaTailwindConfig,
  createComponentStyles: createFigmaComponentStyles
}
