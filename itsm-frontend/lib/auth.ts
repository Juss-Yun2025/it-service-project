// 권한 레벨 정의 (ITSM 개발 설명서 반영)
export const PermissionLevel = {
  SYSTEM_ADMIN: 1,     // 시스템관리 (최고관리자) - 모든 사용자 및 기술자 회원정보 관리
  SERVICE_MANAGER: 2,  // 서비스관리 (관리매니저) - 소속 조치담당자들의 업무 관리
  TECHNICIAN: 3,       // 기술자 (조치담당자) - 작업 업무 진행 및 완료
  ASSIGNMENT_MANAGER: 4, // 기술자 (배정담당자) - 조치 담당 배정
  USER: 5              // 일반사용자 - 서비스 신청
} as const

// 사용자 역할별 권한 레벨 매핑 (ITSM 개발 설명서 반영)
export const RolePermissionMap = {
  '시스템관리': PermissionLevel.SYSTEM_ADMIN,     // 시스템관리 - 모든 관리매니저의 업무 관리 권한
  '관리매니저': PermissionLevel.SERVICE_MANAGER, // 서비스관리 - 관리매니저
  '조치담당자': PermissionLevel.TECHNICIAN,         // 기술자 - 조치담당자
  '배정담당자': PermissionLevel.ASSIGNMENT_MANAGER, // 기술자 - 배정담당자
  '일반사용자': PermissionLevel.USER                     // 일반사용자
} as const

// 화면별 접근 권한 정의
export const ScreenPermissions = {
  // 일반사용자 화면
  '/': [PermissionLevel.USER, PermissionLevel.SYSTEM_ADMIN, PermissionLevel.SERVICE_MANAGER, PermissionLevel.TECHNICIAN, PermissionLevel.ASSIGNMENT_MANAGER],
  
  // 서비스 신청 화면
  '/service-request': [PermissionLevel.USER, PermissionLevel.SYSTEM_ADMIN, PermissionLevel.SERVICE_MANAGER],
  
  // 배정 담당자 화면
  '/technician-assignment': [PermissionLevel.ASSIGNMENT_MANAGER, PermissionLevel.SYSTEM_ADMIN, PermissionLevel.SERVICE_MANAGER],
  
  // 조치 담당자 화면
  '/technician-work': [PermissionLevel.TECHNICIAN, PermissionLevel.SYSTEM_ADMIN, PermissionLevel.SERVICE_MANAGER],
  
  // 시스템관리 대시보드 (사용자 및 기술자 회원정보 관리)
  '/system-admin': [PermissionLevel.SYSTEM_ADMIN],
  
  // 서비스관리 대시보드
  '/service-manager': [PermissionLevel.SERVICE_MANAGER, PermissionLevel.SYSTEM_ADMIN],
  
  // 사용자 관리 화면 (시스템관리 전용)
  '/user-management': [PermissionLevel.SYSTEM_ADMIN],
  
  // 기술자 관리 화면 (시스템관리 전용)
  '/technician-management': [PermissionLevel.SYSTEM_ADMIN]
} as const

// 권한 확인 함수
export function hasPermission(userRole: string, requiredLevel: number): boolean {
  const userLevel = RolePermissionMap[userRole as keyof typeof RolePermissionMap]
  return userLevel <= requiredLevel
}

// 화면 접근 권한 확인 함수
export function canAccessScreen(userRole: string, path: string): boolean {
  const userLevel = RolePermissionMap[userRole as keyof typeof RolePermissionMap]
  const allowedLevels = ScreenPermissions[path as keyof typeof ScreenPermissions]
  
  if (!allowedLevels || !userLevel) {
    return false // 권한이 정의되지 않은 화면은 접근 불가
  }
  
  return allowedLevels.includes(userLevel as any)
}

// 권한 레벨을 문자열로 변환
export function getPermissionLevelName(level: number): string {
  switch (level) {
    case PermissionLevel.SYSTEM_ADMIN:
      return '시스템관리'
    case PermissionLevel.SERVICE_MANAGER:
      return '서비스관리'
    case PermissionLevel.TECHNICIAN:
      return '기술자'
    case PermissionLevel.ASSIGNMENT_MANAGER:
      return '기술자'
    case PermissionLevel.USER:
      return '일반사용자'
    default:
      return '알 수 없음'
  }
}

// 사용자 역할을 권한 레벨로 변환
export function getRolePermissionLevel(role: string): number {
  return RolePermissionMap[role as keyof typeof RolePermissionMap] || PermissionLevel.USER
}

// 시스템관리 권한 확인 함수 (사용자 및 기술자 회원정보 관리)
export function canManageUsers(userRole: string): boolean {
  return userRole === 'system_admin'
}

// 기술자 관리 권한 확인 함수
export function canManageTechnicians(userRole: string): boolean {
  return userRole === 'system_admin'
}

// 서비스관리 권한 확인 함수
export function canManageServices(userRole: string): boolean {
  return userRole === 'system_admin' || userRole === 'service_manager'
}

// 기술자 권한 확인 함수 (배정담당자, 조치담당자)
export function isTechnician(userRole: string): boolean {
  return userRole === 'technician' || userRole === 'assignment_manager'
}
