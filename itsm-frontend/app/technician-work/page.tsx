"use client"

import TechnicianWorkScreen from '@/components/TechnicianWorkScreen'
import PermissionGuard from '@/components/PermissionGuard'
import { useSearchParams } from 'next/navigation'

export default function TechnicianWorkPage() {
  const searchParams = useSearchParams()
  const userRole = searchParams.get('role') || 'technician' // 기본값은 조치담당자

  return (
    <PermissionGuard userRole={userRole} requiredPath="/technician-work">
      <TechnicianWorkScreen />
    </PermissionGuard>
  )
}
