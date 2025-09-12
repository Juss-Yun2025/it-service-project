// 피그마 파일 분석을 위한 유틸리티 함수들

export interface FigmaDesign {
  colors: {
    primary: string
    secondary: string
    success: string
    warning: string
    error: string
    background: string
    surface: string
    text: {
      primary: string
      secondary: string
      disabled: string
    }
  }
  typography: {
    fontFamily: string
    fontSize: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
      '2xl': string
      '3xl': string
    }
    fontWeight: {
      normal: number
      medium: number
      semibold: number
      bold: number
    }
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
  }
  borderRadius: {
    sm: string
    md: string
    lg: string
    xl: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
    xl: string
  }
  components: {
    button: {
      primary: string
      secondary: string
      outline: string
    }
    card: {
      default: string
      elevated: string
    }
    input: {
      default: string
      error: string
      success: string
    }
  }
}

// 피그마 디자인을 분석하고 CSS 변수로 변환하는 함수
export function analyzeFigmaDesign(figmaData: any): FigmaDesign {
  // 실제 피그마 API 응답을 분석하는 로직
  // 여기서는 기본 구조만 제공
  
  return {
    colors: {
      primary: '#3b82f6',
      secondary: '#6b7280',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#ffffff',
      surface: '#f9fafb',
      text: {
        primary: '#111827',
        secondary: '#6b7280',
        disabled: '#9ca3af'
      }
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem'
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      }
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem'
    },
    borderRadius: {
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem'
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
    },
    components: {
      button: {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg',
        secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded-lg',
        outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg'
      },
      card: {
        default: 'bg-white rounded-lg shadow-md border border-gray-200 p-6',
        elevated: 'bg-white rounded-lg shadow-lg border border-gray-200 p-6'
      },
      input: {
        default: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
        error: 'w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500',
        success: 'w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
      }
    }
  }
}

// CSS 변수로 변환하는 함수
export function generateCSSVariables(design: FigmaDesign): string {
  return `
:root {
  /* Colors */
  --color-primary: ${design.colors.primary};
  --color-secondary: ${design.colors.secondary};
  --color-success: ${design.colors.success};
  --color-warning: ${design.colors.warning};
  --color-error: ${design.colors.error};
  --color-background: ${design.colors.background};
  --color-surface: ${design.colors.surface};
  --color-text-primary: ${design.colors.text.primary};
  --color-text-secondary: ${design.colors.text.secondary};
  --color-text-disabled: ${design.colors.text.disabled};
  
  /* Typography */
  --font-family: ${design.typography.fontFamily};
  --font-size-xs: ${design.typography.fontSize.xs};
  --font-size-sm: ${design.typography.fontSize.sm};
  --font-size-base: ${design.typography.fontSize.base};
  --font-size-lg: ${design.typography.fontSize.lg};
  --font-size-xl: ${design.typography.fontSize.xl};
  --font-size-2xl: ${design.typography.fontSize['2xl']};
  --font-size-3xl: ${design.typography.fontSize['3xl']};
  --font-weight-normal: ${design.typography.fontWeight.normal};
  --font-weight-medium: ${design.typography.fontWeight.medium};
  --font-weight-semibold: ${design.typography.fontWeight.semibold};
  --font-weight-bold: ${design.typography.fontWeight.bold};
  
  /* Spacing */
  --spacing-xs: ${design.spacing.xs};
  --spacing-sm: ${design.spacing.sm};
  --spacing-md: ${design.spacing.md};
  --spacing-lg: ${design.spacing.lg};
  --spacing-xl: ${design.spacing.xl};
  --spacing-2xl: ${design.spacing['2xl']};
  
  /* Border Radius */
  --border-radius-sm: ${design.borderRadius.sm};
  --border-radius-md: ${design.borderRadius.md};
  --border-radius-lg: ${design.borderRadius.lg};
  --border-radius-xl: ${design.borderRadius.xl};
  
  /* Shadows */
  --shadow-sm: ${design.shadows.sm};
  --shadow-md: ${design.shadows.md};
  --shadow-lg: ${design.shadows.lg};
  --shadow-xl: ${design.shadows.xl};
}
  `
}

// 피그마 컴포넌트를 React 컴포넌트로 변환하는 함수
export function convertFigmaToReact(figmaComponent: any): string {
  // 실제 구현에서는 피그마 컴포넌트 데이터를 분석하여 React 컴포넌트 코드를 생성
  // 여기서는 기본 구조만 제공
  
  return `
import React from 'react'

interface Props {
  // props 정의
}

export default function Component({ }: Props) {
  return (
    <div className="itsm-component">
      {/* 컴포넌트 내용 */}
    </div>
  )
}
  `
}

// 피그마 파일에서 색상 팔레트 추출
export function extractColorPalette(figmaData: any): Record<string, string> {
  // 피그마 API 응답에서 색상 정보 추출
  // 실제 구현에서는 figmaData를 분석하여 색상 팔레트를 생성
  
  return {
    'blue-50': '#eff6ff',
    'blue-100': '#dbeafe',
    'blue-200': '#bfdbfe',
    'blue-300': '#93c5fd',
    'blue-400': '#60a5fa',
    'blue-500': '#3b82f6',
    'blue-600': '#2563eb',
    'blue-700': '#1d4ed8',
    'blue-800': '#1e40af',
    'blue-900': '#1e3a8a',
    // ... 더 많은 색상
  }
}

// 피그마 파일에서 타이포그래피 스타일 추출
export function extractTypography(figmaData: any): Record<string, any> {
  // 피그마 API 응답에서 타이포그래피 정보 추출
  
  return {
    'heading-1': {
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: '2.5rem',
      letterSpacing: '-0.025em'
    },
    'heading-2': {
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: '2.25rem',
      letterSpacing: '-0.025em'
    },
    'body-large': {
      fontSize: '1.125rem',
      fontWeight: 400,
      lineHeight: '1.75rem'
    },
    'body-medium': {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: '1.5rem'
    },
    'body-small': {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: '1.25rem'
    }
  }
}
