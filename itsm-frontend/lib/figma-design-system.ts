/**
 * Figma 디자인 시스템 - TypeScript 정의
 * 실제 Figma에서 추출한 디자인 토큰을 기반으로 생성
 */

export const figmaColors = {
  primary: {
    main: '#3b82f6',
    hover: '#2563eb',
    light: '#dbeafe',
    dark: '#1d4ed8'
  },
  secondary: {
    main: '#6b7280',
    hover: '#4b5563',
    light: '#f3f4f6',
    dark: '#374151'
  },
  success: {
    main: '#10b981',
    hover: '#059669',
    light: '#d1fae5',
    dark: '#047857'
  },
  warning: {
    main: '#f59e0b',
    hover: '#d97706',
    light: '#fef3c7',
    dark: '#b45309'
  },
  error: {
    main: '#ef4444',
    hover: '#dc2626',
    light: '#fee2e2',
    dark: '#b91c1c'
  },
  neutral: {
    background: '#ffffff',
    surface: '#f9fafb',
    surfaceHover: '#f3f4f6',
    border: '#e5e7eb',
    borderHover: '#d1d5db',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',
    textInverse: '#ffffff'
  }
} as const

export const figmaTypography = {
  fontFamily: {
    primary: "'Inter', system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace"
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
    '5xl': '3rem'     // 48px
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800'
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75'
  }
} as const

export const figmaSpacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '6rem'    // 96px
} as const

export const figmaShadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)'
} as const

export const figmaBorderRadius = {
  sm: '0.25rem',   // 4px
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  full: '9999px'   // 완전한 원
} as const

export const figmaTransitions = {
  fast: '150ms ease-in-out',
  normal: '250ms ease-in-out',
  slow: '350ms ease-in-out'
} as const

export const figmaZIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070
} as const

// 디자인 토큰을 CSS 변수로 변환하는 함수
export function generateCSSVariables() {
  const cssVars: Record<string, string> = {}
  
  // 색상 변수 생성
  Object.entries(figmaColors).forEach(([category, colors]) => {
    Object.entries(colors).forEach(([variant, value]) => {
      cssVars[`--figma-${category}-${variant}`] = value
    })
  })
  
  // 타이포그래피 변수 생성
  Object.entries(figmaTypography.fontSize).forEach(([size, value]) => {
    cssVars[`--figma-font-size-${size}`] = value
  })
  
  // 간격 변수 생성
  Object.entries(figmaSpacing).forEach(([size, value]) => {
    cssVars[`--figma-spacing-${size}`] = value
  })
  
  return cssVars
}

// Tailwind CSS 클래스로 변환하는 함수
export function getTailwindClasses() {
  return {
    colors: {
      primary: 'bg-blue-500 hover:bg-blue-600',
      secondary: 'bg-gray-500 hover:bg-gray-600',
      success: 'bg-green-500 hover:bg-green-600',
      warning: 'bg-yellow-500 hover:bg-yellow-600',
      error: 'bg-red-500 hover:bg-red-600'
    },
    spacing: {
      xs: 'p-1',
      sm: 'p-2',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8'
    },
    shadows: {
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl'
    }
  }
}