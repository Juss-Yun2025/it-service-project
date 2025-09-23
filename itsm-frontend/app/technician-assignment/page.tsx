"use client"

import TechnicianAssignment from '@/components/TechnicianAssignment'
import { PermissionGuard } from '@/components/PermissionGuard'
import { useSearchParams } from 'next/navigation'

export default function TechnicianAssignmentPage() {
  const searchParams = useSearchParams()
  const userRole = searchParams.get('role') || 'assignment' // 기본값은 배정담당자

  return (
    <PermissionGuard userRole={userRole} requiredPath="/technician-assignment">
      <TechnicianAssignment />
    </PermissionGuard>
  )
}
