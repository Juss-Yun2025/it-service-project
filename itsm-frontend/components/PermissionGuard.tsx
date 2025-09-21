"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { canAccessScreen } from '@/lib/auth'
import { apiClient } from '@/lib/api'

interface PermissionGuardProps {
  children: React.ReactNode
  requiredPath: string
  fallbackComponent?: React.ReactNode
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  children, 
  requiredPath,
  fallbackComponent 
}) => {
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // localStorage에서 사용자 정보 확인
    const user = apiClient.getCurrentUser()
    
    if (user && user.role) {
      setUserRole(user.role)
    } else {
      // 토큰이 없거나 사용자 정보가 없으면 메인 페이지로 리다이렉트
      router.push('/')
      return
    }
    
    setIsLoading(false)
  }, [router])

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">권한을 확인하는 중...</p>
        </div>
      </div>
    )
  }

  // 권한 확인
  if (!userRole || !canAccessScreen(userRole, requiredPath)) {
    // 커스텀 fallback 컴포넌트가 있으면 사용
    if (fallbackComponent) {
      return <>{fallbackComponent}</>
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">접근 권한이 없습니다</h1>
          <p className="text-gray-600 mb-4">
            이 페이지에 접근할 권한이 없습니다.<br />
            현재 권한: {userRole || '없음'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            메인 페이지로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default PermissionGuard
