"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/ui/Icon'
import { apiClient, User, UserUpdateRequest } from '@/lib/api'
import PermissionGuard from '@/components/PermissionGuard'

// 데이터 타입 정의
interface ServiceRequest {
  id: string
  requestNumber: string
  title: string
  status: string
  currentStatus: string
  requestDate: string
  requestTime?: string
  requester: string
  department: string
  stage: string
  assignTime?: string
  assignDate?: string
  assignee?: string
  assigneeDepartment?: string
  content: string
  contact: string
  location: string
  actualRequester?: string
  actualContact?: string
  serviceType: string
  completionDate?: string
  // 배정 관련 필드들
  assignmentOpinion?: string
  previousAssignDate?: string
  previousAssignee?: string
  previousAssignmentOpinion?: string
  rejectionDate?: string
  rejectionOpinion?: string
  // 작업정보등록 관련 필드들
  scheduledDate?: string
  workStartDate?: string
  workContent?: string
  workCompleteDate?: string
  problemIssue?: string
  isUnresolved?: boolean
  currentWorkStage?: string
}

interface PendingWork {
  id: string
  technician: string
  lastWeekPending: number
  longTermPending: number
}

function SystemAdminPageContent() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState('')
  const [currentTime, setCurrentTime] = useState('')
  const [isWorking, setIsWorking] = useState(true)
  const [searchStartDate, setSearchStartDate] = useState('')
  const [searchEndDate, setSearchEndDate] = useState('')
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(false)
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [showInfoSuccessModal, setShowInfoSuccessModal] = useState(false)
  const [showApprovalSuccessModal, setShowApprovalSuccessModal] = useState(false)
  const [showRejectionSuccessModal, setShowRejectionSuccessModal] = useState(false)
  const [showRejectionInAssignment, setShowRejectionInAssignment] = useState(false)
  const [showInfoViewModal, setShowInfoViewModal] = useState(false)
  const [showWorkRegistrationModal, setShowWorkRegistrationModal] = useState(false)
  const [showWorkRegistrationInInfo, setShowWorkRegistrationInInfo] = useState(false)
  const [showWorkCompleteModal, setShowWorkCompleteModal] = useState(false)
  const [rejectionOpinion, setRejectionOpinion] = useState('')
  
  // 작업정보등록 관련 상태
  const [scheduledDate, setScheduledDate] = useState('')
  const [workStartDate, setWorkStartDate] = useState('')
  const [workContent, setWorkContent] = useState('')
  const [workCompleteDate, setWorkCompleteDate] = useState('')
  const [problemIssue, setProblemIssue] = useState('')
  const [isUnresolved, setIsUnresolved] = useState(false)
  const [currentStage, setCurrentStage] = useState('예정')
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // 서비스작업 List 관리 관련 상태
  const [showServiceWorkList, setShowServiceWorkList] = useState(false)
  const [showUserManagement, setShowUserManagement] = useState(false)
  
  // 서비스현황 리포트 관련 상태
  const [showServiceReport, setShowServiceReport] = useState(false)
  const [serviceReportCurrentPage, setServiceReportCurrentPage] = useState(1)
  const [serviceReportSearchStartDate, setServiceReportSearchStartDate] = useState(new Date().toISOString().split('T')[0])
  const [serviceReportSearchEndDate, setServiceReportSearchEndDate] = useState(new Date().toISOString().split('T')[0])
  const [serviceReportStatusFilter, setServiceReportStatusFilter] = useState('전체')
  const [serviceReportDepartmentFilter, setServiceReportDepartmentFilter] = useState('전체')
  const [serviceReportStageFilter, setServiceReportStageFilter] = useState('전체')
  
  // 사용자관리 관련 상태
  const [userManagementCurrentPage, setUserManagementCurrentPage] = useState(1)
  const [userManagementSearchDepartment, setUserManagementSearchDepartment] = useState('전체')
  const [userManagementSearchRole, setUserManagementSearchRole] = useState('전체')
  const [userManagementSearchStartDate, setUserManagementSearchStartDate] = useState(() => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    return oneWeekAgo.toISOString().split('T')[0]
  })
  const [userManagementSearchEndDate, setUserManagementSearchEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [userManagementSearchName, setUserManagementSearchName] = useState('')
  const [showUserEditModal, setShowUserEditModal] = useState(false)
  const [showUserResetModal, setShowUserResetModal] = useState(false)
  const [showPasswordResetSuccessModal, setShowPasswordResetSuccessModal] = useState(false)
  const [resetPasswordResult, setResetPasswordResult] = useState<{temporaryPassword: string} | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editUserData, setEditUserData] = useState<UserUpdateRequest>({})
  const [users, setUsers] = useState<User[]>([])
  const [userTotalPages, setUserTotalPages] = useState(1)
  const [userLoading, setUserLoading] = useState(false)
  const [userError, setUserError] = useState('')
  
  // 드래그 관련 상태
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  
  // 드래그 이벤트 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.pageX - e.currentTarget.offsetLeft)
    setScrollLeft(e.currentTarget.scrollLeft)
  }
  
  const handleMouseLeave = () => {
    setIsDragging(false)
  }
  
  const handleMouseUp = () => {
    setIsDragging(false)
  }
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - e.currentTarget.offsetLeft
    const walk = (x - startX) * 2
    e.currentTarget.scrollLeft = scrollLeft - walk
  }
  
  // 카드 클릭 핸들러 (드래그와 구분)
  const handleCardClick = (e: React.MouseEvent, action: () => void) => {
    if (isDragging) {
      e.preventDefault()
      return
    }
    action()
  }
  
  
  // 일반문의 List 관리 관련 상태
  const [showGeneralInquiryList, setShowGeneralInquiryList] = useState(false)
  const [showGeneralInquiryReplyModal, setShowGeneralInquiryReplyModal] = useState(false)
  const [showGeneralInquiryEditModal, setShowGeneralInquiryEditModal] = useState(false)
  const [showGeneralInquiryDeleteModal, setShowGeneralInquiryDeleteModal] = useState(false)
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null)
  const [generalInquiryCurrentPage, setGeneralInquiryCurrentPage] = useState(1)
  const [generalInquirySearchStartDate, setGeneralInquirySearchStartDate] = useState(() => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    return oneWeekAgo.toISOString().split('T')[0]
  })
  const [generalInquirySearchEndDate, setGeneralInquirySearchEndDate] = useState(new Date().toISOString().split('T')[0])
  const [showUnansweredOnly, setShowUnansweredOnly] = useState(false)
  const [showServiceAssignmentModal, setShowServiceAssignmentModal] = useState(false)
  const [showServiceReassignmentModal, setShowServiceReassignmentModal] = useState(false)
  const [showServiceWorkInfoModal, setShowServiceWorkInfoModal] = useState(false)
  const [showServiceWorkDeleteModal, setShowServiceWorkDeleteModal] = useState(false)
  const [selectedWorkRequest, setSelectedWorkRequest] = useState<ServiceRequest | null>(null)
  const [serviceWorkSearchStartDate, setServiceWorkSearchStartDate] = useState('')
  const [serviceWorkSearchEndDate, setServiceWorkSearchEndDate] = useState('')
  const [showServiceIncompleteOnly, setShowServiceIncompleteOnly] = useState(false)
  const [serviceWorkSelectedDepartment, setServiceWorkSelectedDepartment] = useState('전체')
  const [serviceWorkCurrentPage, setServiceWorkCurrentPage] = useState(1)
  
  // 작업정보등록 관련 상태
  const [serviceWorkScheduledDate, setServiceWorkScheduledDate] = useState('')
  const [serviceWorkStartDate, setServiceWorkStartDate] = useState('')
  const [serviceWorkContent, setServiceWorkContent] = useState('')
  const [serviceWorkCompleteDate, setServiceWorkCompleteDate] = useState('')
  const [serviceWorkProblemIssue, setServiceWorkProblemIssue] = useState('')
  const [serviceWorkIsUnresolved, setServiceWorkIsUnresolved] = useState(false)
  const [serviceWorkCurrentStage, setServiceWorkCurrentStage] = useState('예정')
  const [showServiceWorkCompleteModal, setShowServiceWorkCompleteModal] = useState(false)
  const [showServiceWorkDeleteCompleteModal, setShowServiceWorkDeleteCompleteModal] = useState(false)
  
  // 시스템 관리자 정보 상태
  const [managerInfo, setManagerInfo] = useState({
    name: '김시스템',
    email: 'admin@itsm.com',
    fullName: '김시스템',
    position: '대리',
    department: 'IT팀',
    phone: '010-1234-5678',
    createDate: '2024-01-15 09:00:00'
  })
  const [showPendingWork, setShowPendingWork] = useState(true)
  const [showServiceAggregation, setShowServiceAggregation] = useState(true)
  const [showGeneralInquiryStatus, setShowGeneralInquiryStatus] = useState(true)
  const [selectedDepartment, setSelectedDepartment] = useState('전체')
  const [currentDepartment, setCurrentDepartment] = useState('전체')
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [inquirySelectedDepartment, setInquirySelectedDepartment] = useState('')
  const [inquiryCurrentDepartment, setInquiryCurrentDepartment] = useState('전체 부서')
  const [inquiryStartDate, setInquiryStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0])
  const [inquiryEndDate, setInquiryEndDate] = useState(new Date().toISOString().split('T')[0])
  const [chartData, setChartData] = useState({
    received: 5,
    assigned: 10,
    working: 6,
    completed: 5,
    failed: 2
  })
  const [inquiryData, setInquiryData] = useState({
    answered: 15,
    unanswered: 10,
    total: 25,
    completionRate: 60.0,
    avgResponseTime: 2.3
  })

  // 현재 날짜와 시간 설정
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      const dateStr = now.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\./g, '.').replace(/\s/g, '')
      const timeStr = now.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
      setCurrentDate(dateStr)
      setCurrentTime(timeStr)
    }

    updateDateTime()
    const interval = setInterval(updateDateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // 검색 기간 기본값 설정 (2025.08.25 ~ 2025.08.31)
  useEffect(() => {
    // 현재시점 기준 1주일 설정
    const today = new Date()
    const oneWeekAgo = new Date(today)
    oneWeekAgo.setDate(today.getDate() - 7)
    
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0]
    }
    
    setSearchStartDate(formatDate(oneWeekAgo))
    setSearchEndDate(formatDate(today))
    setServiceWorkSearchStartDate(formatDate(oneWeekAgo))
    setServiceWorkSearchEndDate(formatDate(today))
  }, [])
  
  // 검색 조건 변경 시 페이지 리셋
  useEffect(() => {
    setServiceWorkCurrentPage(1)
  }, [serviceWorkSearchStartDate, serviceWorkSearchEndDate, showServiceIncompleteOnly, serviceWorkSelectedDepartment])

  // 서비스현황 리포트 검색 조건 변경 시 페이지 리셋
  useEffect(() => {
    setServiceReportCurrentPage(1)
  }, [serviceReportSearchStartDate, serviceReportSearchEndDate, serviceReportStatusFilter, serviceReportDepartmentFilter, serviceReportStageFilter])

  // 사용자관리 검색 조건 변경 시 페이지 리셋
  useEffect(() => {
    setUserManagementCurrentPage(1)
  }, [userManagementSearchDepartment, userManagementSearchRole, userManagementSearchStartDate, userManagementSearchEndDate, userManagementSearchName])

  // 서비스 요청 데이터
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([
    {
      id: '1',
      requestNumber: 'SR-20250831-007',
      title: '모니터 전원 불량',
      status: '진행중',
      currentStatus: '오류발생',
      requestDate: '2025.08.31',
      requestTime: '09:30',
      requester: '김영자',
      department: '운영팀',
      stage: '확인',
      assignTime: '11:40',
      assignDate: '2025.08.31 11:10',
      assignee: '김기술',
      assigneeDepartment: 'IT팀',
      content: '모니터에 전원이 들어 오지 않습니다.',
      contact: '010-6543-9874',
      location: '본사 2층 운영팀',
      serviceType: '자산',
      completionDate: '',
      assignmentOpinion: '업무에 적합하여 배정',
      actualRequester: '',
      actualContact: ''
    },
    {
      id: '2',
      requestNumber: 'SR-20250830-006',
      title: '이메일 첨부파일 다운로드 오류',
      status: '진행중',
      currentStatus: '정상작동',
      requestDate: '2025.08.30',
      requestTime: '14:15',
      requester: '김철수',
      department: '관리부',
      stage: '확인',
      assignTime: '10:40',
      assignDate: '2025.08.30',
      assignee: '김기술',
      assigneeDepartment: 'IT팀',
      content: '이메일 첨부파일을 다운로드할 수 없습니다.',
      contact: '010-2345-6789',
      location: '2층 사무실',
      serviceType: '문제',
      completionDate: '2025.01.15 11:30'
    },
    {
      id: '3',
      requestNumber: 'SR-20250829-005',
      title: 'VPN 접속 불가',
      status: '진행중',
      currentStatus: '점검요청',
      requestDate: '2025.08.29',
      requester: '이영희',
      department: '생산부',
      stage: '예정',
      assignTime: '10:10',
      assignDate: '2025.08.29',
      assignee: '김기술',
      assigneeDepartment: 'IT팀',
      content: 'VPN에 접속이 되지 않습니다.',
      contact: '010-3456-7890',
      location: '1층 사무실',
      serviceType: '요청',
      completionDate: ''
    },
    {
      id: '4',
      requestNumber: 'SR-20250828-004',
      title: '모니터 이상',
      status: '진행중',
      currentStatus: '전체불능',
      requestDate: '2025.08.28',
      requester: '강감찬',
      department: '구매팀',
      stage: '작업',
      assignTime: '09:50',
      assignDate: '2025.08.28',
      assignee: '김기술',
      assigneeDepartment: 'IT팀',
      content: '모니터 화면이 깨져서 보입니다.',
      contact: '010-4567-8901',
      location: '4층 사무실',
      serviceType: '적용',
      completionDate: ''
    },
    {
      id: '5',
      requestNumber: 'SR-20250827-003',
      title: '프린터 인쇄 안됨',
      status: '진행중',
      currentStatus: '메시지창',
      requestDate: '2025.08.27',
      requester: '이율곡',
      department: '관리부',
      stage: '완료',
      assignTime: '09:20',
      assignDate: '2025.08.27',
      assignee: '김기술',
      assigneeDepartment: 'IT팀',
      content: '프린터에서 인쇄가 되지 않습니다.',
      contact: '010-5678-9012',
      location: '2층 사무실',
      serviceType: '자산',
      completionDate: '2025.01.12 10:10'
    },
    {
      id: '6',
      requestNumber: 'SR-20250826-002',
      title: '마우스 오류',
      status: '진행중',
      currentStatus: '부분불능',
      requestDate: '2025.08.26',
      requester: '이목이',
      department: '재무팀',
      stage: '미결',
      assignTime: '09:00',
      assignDate: '2025.08.26',
      assignee: '김기술',
      assigneeDepartment: 'IT팀',
      content: '마우스가 제대로 작동하지 않습니다.',
      contact: '010-6789-0123',
      location: '3층 사무실',
      serviceType: '자산',
      completionDate: ''
    },
    {
      id: '7',
      requestNumber: 'SR-20250825-001',
      title: '키보드 입력 오류',
      status: '진행중',
      currentStatus: '정상작동',
      requestDate: '2025.08.25',
      requester: '박민수',
      department: '영업팀',
      stage: '예정',
      assignTime: '08:30',
      assignDate: '2025.08.25',
      assignee: '김기술',
      assigneeDepartment: 'IT팀',
      content: '키보드에서 일부 키가 입력되지 않습니다.',
      contact: '010-7890-1234',
      location: '5층 사무실',
      serviceType: '자산',
      completionDate: ''
    },
    {
      id: '8',
      requestNumber: 'SR-20250824-008',
      title: '네트워크 속도 저하',
      status: '진행중',
      currentStatus: '부분불능',
      requestDate: '2025.08.24',
      requester: '최수진',
      department: '마케팅팀',
      stage: '확인',
      assignTime: '13:45',
      assignDate: '2025.08.24',
      assignee: '김기술',
      assigneeDepartment: 'IT팀',
      content: '인터넷 속도가 매우 느려졌습니다.',
      contact: '010-8901-2345',
      location: '6층 사무실',
      serviceType: '문제',
      completionDate: ''
    },
    {
      id: '9',
      requestNumber: 'SR-20250823-009',
      title: '스캐너 연결 오류',
      status: '진행중',
      currentStatus: '전체불능',
      requestDate: '2025.08.23',
      requester: '한지영',
      department: '인사팀',
      stage: '작업',
      assignTime: '12:30',
      assignDate: '2025.08.23',
      assignee: '김기술',
      assigneeDepartment: 'IT팀',
      content: '스캐너가 컴퓨터에 인식되지 않습니다.',
      contact: '010-9012-3456',
      location: '7층 사무실',
      serviceType: '자산',
      completionDate: ''
    },
    {
      id: '10',
      requestNumber: 'SR-20250822-010',
      title: '웹캠 작동 불량',
      status: '진행중',
      currentStatus: '점검요청',
      requestDate: '2025.08.22',
      requester: '송민호',
      department: '영업팀',
      stage: '예정',
      assignTime: '11:15',
      assignDate: '2025.08.22',
      assignee: '김기술',
      assigneeDepartment: 'IT팀',
      content: '웹캠이 제대로 작동하지 않습니다.',
      contact: '010-0123-4567',
      location: '8층 사무실',
      serviceType: '자산',
      completionDate: ''
    },
    {
      id: '11',
      requestNumber: 'SR-20250821-011',
      title: '소프트웨어 설치 오류',
      status: '진행중',
      currentStatus: '메시지창',
      requestDate: '2025.08.21',
      requester: '윤서연',
      department: '재무팀',
      stage: '완료',
      assignTime: '10:50',
      assignDate: '2025.08.21',
      assignee: '김기술',
      assigneeDepartment: 'IT팀',
      content: '새로운 소프트웨어 설치 중 오류가 발생했습니다.',
      contact: '010-1234-5678',
      location: '9층 사무실',
      serviceType: '적용',
      completionDate: '2025.01.06 11:20'
    },
    {
      id: '12',
      requestNumber: 'SR-20250820-012',
      title: '데이터베이스 연결 실패',
      status: '진행중',
      currentStatus: '기타상태',
      requestDate: '2025.08.20',
      requester: '김태현',
      department: '개발팀',
      stage: '작업',
      assignTime: '15:10',
      assignDate: '2025.08.20',
      assignee: '김기술',
      assigneeDepartment: 'IT팀',
      content: '데이터베이스에 연결할 수 없습니다.',
      contact: '010-2345-6789',
      location: '10층 사무실',
      serviceType: '문제',
      completionDate: ''
    },
    {
      id: '13',
      requestNumber: 'SR-20250831-013',
      title: '백업 시스템 오류',
      status: '진행중',
      currentStatus: '부분불능',
      requestDate: '2025.08.31',
      requester: '이수정',
      department: '운영팀',
      stage: '확인',
      assignTime: '14:35',
      assignDate: '2025.08.31',
      assignee: '김기술',
      assigneeDepartment: 'IT팀',
      content: '자동 백업이 실행되지 않습니다.',
      contact: '010-3456-7890',
      location: '서버실',
      serviceType: '자산',
      completionDate: ''
    },
    {
      id: '14',
      requestNumber: 'SR-20250830-014',
      title: '보안 프로그램 업데이트',
      status: '진행중',
      currentStatus: '정상작동',
      requestDate: '2025.08.30',
      requester: '박준호',
      department: '보안팀',
      stage: '작업',
      assignTime: '13:20',
      assignDate: '2025.08.30',
      assignee: '김기술',
      assigneeDepartment: 'IT팀',
      content: '보안 프로그램을 최신 버전으로 업데이트해야 합니다.',
      contact: '010-4567-8901',
      location: '보안실',
      serviceType: '적용',
      completionDate: ''
    },
    {
      id: '15',
      requestNumber: 'SR-20250829-015',
      title: '서버 성능 모니터링',
      status: '진행중',
      currentStatus: '전체불능',
      requestDate: '2025.08.29',
      requester: '최영수',
      department: '운영팀',
      stage: '예정',
      assignTime: '12:45',
      assignee: '김기술',
      assigneeDepartment: 'IT팀',
      content: '서버 성능이 저하되어 모니터링이 필요합니다.',
      contact: '010-5678-9012',
      location: '서버실',
      serviceType: '문제',
      completionDate: ''
    },
    {
      id: '16',
      requestNumber: 'SR-20250831-016',
      title: '오늘 신청된 긴급 작업',
      status: '진행중',
      currentStatus: '메시지창',
      requestDate: '2025.08.31',
      requester: '오늘신청',
      department: '긴급팀',
      stage: '미결',
      assignTime: '14:30',
      assignee: '김기술',
      assigneeDepartment: 'IT팀',
      content: '오늘 신청된 긴급 작업입니다.',
      contact: '010-9999-9999',
      location: '긴급실',
      serviceType: '긴급',
      completionDate: ''
    },
    {
      id: '17',
      requestNumber: 'SR-20250831-017',
      title: '오늘 완료된 작업',
      status: '완료',
      currentStatus: '정상작동',
      requestDate: '2025.08.31',
      requester: '완료자',
      department: '완료팀',
      stage: '완료',
      assignTime: '09:00',
      assignee: '김기술',
      assigneeDepartment: 'IT팀',
      content: '오늘 완료된 작업입니다.',
      contact: '010-8888-8888',
      location: '완료실',
      serviceType: '완료',
      completionDate: '2025.08.31 15:30'
    },
    {
      id: '18',
      requestNumber: 'SR-20250831-018',
      title: '운영팀 서버 점검',
      status: '진행중',
      currentStatus: '정상작동',
      requestDate: '2025.08.31',
      requestTime: '14:00',
      requester: '김운영',
      department: '운영팀',
      stage: '작업',
      assignTime: '14:30',
      assignDate: '2025.08.31 14:15',
      assignee: '박운영',
      assigneeDepartment: '운영팀',
      content: '운영팀 서버 정기 점검 작업입니다.',
      contact: '010-1111-2222',
      location: '운영팀 사무실',
      serviceType: '서버',
      completionDate: ''
    },
    {
      id: '19',
      requestNumber: 'SR-20250830-019',
      title: '개발팀 코드 리뷰',
      status: '완료',
      currentStatus: '정상작동',
      requestDate: '2025.08.30',
      requestTime: '13:30',
      requester: '이개발',
      department: '개발팀',
      stage: '완료',
      assignTime: '13:45',
      assignDate: '2025.08.30 13:40',
      assignee: '최개발',
      assigneeDepartment: '개발팀',
      content: '새로운 기능 개발 코드 리뷰 요청입니다.',
      contact: '010-3333-4444',
      location: '개발팀 사무실',
      serviceType: '개발',
      completionDate: '2025.08.30 16:00'
    },
    {
      id: '20',
      requestNumber: 'SR-20250829-020',
      title: '보안팀 보안 점검',
      status: '진행중',
      currentStatus: '점검요청',
      requestDate: '2025.08.29',
      requestTime: '12:00',
      requester: '정보안',
      department: '보안팀',
      stage: '작업',
      assignTime: '12:15',
      assignDate: '2025.08.29 12:10',
      assignee: '한보안',
      assigneeDepartment: '보안팀',
      content: '시스템 보안 점검 및 취약점 분석 작업입니다.',
      contact: '010-5555-6666',
      location: '보안팀 사무실',
      serviceType: '보안',
      completionDate: ''
    },
    {
      id: '21',
      requestNumber: 'SR-20250828-021',
      title: '인사팀 시스템 업데이트',
      status: '완료',
      currentStatus: '정상작동',
      requestDate: '2025.08.28',
      requestTime: '11:00',
      requester: '김인사',
      department: '인사팀',
      stage: '완료',
      assignTime: '11:30',
      assignDate: '2025.08.28 11:20',
      assignee: '박인사',
      assigneeDepartment: '인사팀',
      content: '인사 관리 시스템 업데이트 작업입니다.',
      contact: '010-7777-8888',
      location: '인사팀 사무실',
      serviceType: '시스템',
      completionDate: '2025.08.28 15:00'
    },
    {
      id: '22',
      requestNumber: 'SR-20250827-022',
      title: '재무팀 데이터 백업',
      status: '진행중',
      currentStatus: '정상작동',
      requestDate: '2025.08.27',
      requestTime: '10:30',
      requester: '이재무',
      department: '재무팀',
      stage: '작업',
      assignTime: '10:45',
      assignDate: '2025.08.27 10:40',
      assignee: '최재무',
      assigneeDepartment: '재무팀',
      content: '재무 데이터 정기 백업 작업입니다.',
      contact: '010-9999-0000',
      location: '재무팀 사무실',
      serviceType: '데이터',
      completionDate: ''
    },
    {
      id: '23',
      requestNumber: 'SR-20250826-023',
      title: '시스템 장애 신고',
      status: '접수',
      currentStatus: '전체불능',
      requestDate: '2025.08.26',
      requestTime: '09:15',
      requester: '김신고',
      department: '영업팀',
      stage: '접수',
      assignTime: '',
      assignDate: '',
      assignee: '',
      assigneeDepartment: '',
      content: '영업팀 시스템이 완전히 작동하지 않습니다. 긴급 조치가 필요합니다.',
      contact: '010-1234-5678',
      location: '영업팀 사무실',
      serviceType: '긴급',
      completionDate: ''
    },
    {
      id: '24',
      requestNumber: 'SR-20250825-024',
      title: '네트워크 연결 불안정',
      status: '접수',
      currentStatus: '부분불능',
      requestDate: '2025.08.25',
      requestTime: '14:30',
      requester: '박네트워크',
      department: '마케팅팀',
      stage: '접수',
      assignTime: '',
      assignDate: '',
      assignee: '',
      assigneeDepartment: '',
      content: '마케팅팀 네트워크 연결이 불안정하여 업무에 지장이 있습니다.',
      contact: '010-2345-6789',
      location: '마케팅팀 사무실',
      serviceType: '네트워크',
      completionDate: ''
    },
    {
      id: '27',
      requestNumber: 'SR-20250824-027',
      title: '프린터 오류 재발',
      status: '재배정',
      currentStatus: '부분불능',
      requestDate: '2025.08.24',
      requestTime: '11:20',
      requester: '이프린터',
      department: '구매팀',
      stage: '재배정',
      assignTime: '',
      assignDate: '',
      assignee: '',
      assigneeDepartment: '',
      content: '이전에 수리했던 프린터에서 동일한 오류가 재발했습니다. 다른 담당자 배정이 필요합니다.',
      contact: '010-3456-7890',
      location: '구매팀 사무실',
      serviceType: '하드웨어',
      completionDate: ''
    },
    {
      id: '28',
      requestNumber: 'SR-20250823-028',
      title: '소프트웨어 라이선스 갱신',
      status: '접수',
      currentStatus: '정상작동',
      requestDate: '2025.08.23',
      requestTime: '16:45',
      requester: '최라이선스',
      department: '법무팀',
      stage: '접수',
      assignTime: '',
      assignDate: '',
      assignee: '',
      assigneeDepartment: '',
      content: '법무팀에서 사용하는 소프트웨어 라이선스 갱신이 필요합니다.',
      contact: '010-4567-8901',
      location: '법무팀 사무실',
      serviceType: '소프트웨어',
      completionDate: ''
    },
    {
      id: '31',
      requestNumber: 'SR-20250822-031',
      title: '데이터베이스 성능 저하',
      status: '재배정',
      currentStatus: '기타상태',
      requestDate: '2025.08.22',
      requestTime: '13:10',
      requester: '한데이터',
      department: '연구개발팀',
      stage: '재배정',
      assignTime: '',
      assignDate: '',
      assignee: '',
      assigneeDepartment: '',
      content: '연구개발팀 데이터베이스 성능이 저하되어 쿼리 실행이 매우 느립니다. 전문가 배정이 필요합니다.',
      contact: '010-5678-9012',
      location: '연구개발팀 사무실',
      serviceType: '데이터베이스',
      completionDate: ''
    },
    {
      id: '29',
      requestNumber: 'SR-20250831-029',
      title: '테스트용 완료 단계 작업',
      status: '진행중',
      currentStatus: '정상작동',
      requestDate: '2025.08.31',
      requestTime: '10:00',
      requester: '테스트사용자',
      department: 'IT팀',
      stage: '완료',
      assignTime: '10:30',
      assignDate: '2025.08.31 10:30',
      assignee: '김기술',
      assigneeDepartment: 'IT팀',
      content: '테스트를 위한 완료 단계 작업입니다. 작업정보등록 모달에서 완료 단계 테스트를 진행할 수 있습니다.',
      contact: '010-1234-5678',
      location: 'IT팀 사무실',
      serviceType: '문제',
      completionDate: '',
      assignmentOpinion: '테스트용 배정 의견입니다.',
      // 작업정보등록 관련 테스트 데이터
      scheduledDate: '2025-08-31T10:30',
      workStartDate: '2025-08-31T11:00',
      workContent: '테스트용 작업내역입니다. 모니터 전원 문제를 해결하기 위해 전원 공급 장치를 점검하고 교체했습니다.',
      workCompleteDate: '2025-08-31T12:00',
      problemIssue: '',
      isUnresolved: false,
      currentWorkStage: '완료'
    },
    {
      id: '30',
      requestNumber: 'SR-20250831-030',
      title: '테스트용 미결 단계 작업',
      status: '진행중',
      currentStatus: '부분불능',
      requestDate: '2025.08.31',
      requestTime: '14:00',
      requester: '테스트사용자2',
      department: '운영팀',
      stage: '미결',
      assignTime: '14:30',
      assignDate: '2025.08.31 14:30',
      assignee: '김기술',
      assigneeDepartment: 'IT팀',
      content: '테스트를 위한 미결 단계 작업입니다. 작업정보등록 모달에서 미결 단계 테스트를 진행할 수 있습니다.',
      contact: '010-9876-5432',
      location: '운영팀 사무실',
      serviceType: '자산',
      completionDate: '',
      assignmentOpinion: '테스트용 미결 배정 의견입니다.',
      // 작업정보등록 관련 테스트 데이터
      scheduledDate: '2025-08-31T14:30',
      workStartDate: '2025-08-31T15:00',
      workContent: '테스트용 작업내역입니다. 네트워크 장비 점검을 진행했습니다.',
      workCompleteDate: '2025-08-31T16:00',
      problemIssue: '테스트용 문제사항입니다. 일부 네트워크 포트에서 연결 불안정 현상이 발견되었습니다.',
      isUnresolved: true,
      currentWorkStage: '미결'
    }
  ])

  // 서비스현황 리포트 데이터 생성 (서비스 요청 데이터를 기반으로)
  const serviceReportData = serviceRequests.map(request => {
    // 배정(h) 계산: 신청시간 - 배정시간
    const assignmentHours = request.assignTime && request.requestTime ? 
      Math.round((new Date(`2025-08-31 ${request.assignTime}`).getTime() - new Date(`2025-08-31 ${request.requestTime}`).getTime()) / (1000 * 60 * 60) * 10) / 10 : 0.2;
    
    // 작업(h) 계산: 작업시작시간 - 작업완료시간 (임시로 0.2h 설정)
    const workHours = request.stage === '완료' ? 0.5 : 0.2;

    return {
      id: request.id,
      requestNumber: request.requestNumber,
      title: request.title,
      currentStatus: request.currentStatus,
      requester: request.requester,
      requesterDepartment: request.department,
      stage: request.stage,
      assignmentHours: assignmentHours,
      serviceType: request.serviceType,
      assignee: request.assignee || '',
      assigneeDepartment: request.assigneeDepartment || '',
      workHours: workHours,
      requestDateTime: `${request.requestDate} ${request.requestTime}`,
      assignDateTime: request.assignDate || '',
      scheduledDateTime: request.scheduledDate || '',
      workStartDateTime: request.workStartDate || '',
      workCompleteDateTime: request.workCompleteDate || ''
    }
  });

  // 서비스현황 리포트 필터링
  const filteredServiceReports = serviceReportData.filter(report => {
    // 날짜 필터
    if (serviceReportSearchStartDate && serviceReportSearchEndDate) {
      const reportDate = new Date(report.requestDateTime.split(' ')[0].replace(/\./g, '-'));
      const startDate = new Date(serviceReportSearchStartDate);
      const endDate = new Date(serviceReportSearchEndDate);
      if (reportDate < startDate || reportDate > endDate) return false;
    }
    
    // 현재상태 필터
    if (serviceReportStatusFilter !== '전체' && report.currentStatus !== serviceReportStatusFilter) return false;
    
    // 부서 필터
    if (serviceReportDepartmentFilter !== '전체' && report.requesterDepartment !== serviceReportDepartmentFilter) return false;
    
    // 단계 필터
    if (serviceReportStageFilter !== '전체' && report.stage !== serviceReportStageFilter) return false;
    
    return true;
  });

  // 서비스현황 리포트 페이지네이션
  const serviceReportItemsPerPage = 10;
  const serviceReportTotalPages = Math.ceil(filteredServiceReports.length / serviceReportItemsPerPage);
  const paginatedServiceReports = filteredServiceReports.slice(
    (serviceReportCurrentPage - 1) * serviceReportItemsPerPage,
    serviceReportCurrentPage * serviceReportItemsPerPage
  );

  // 엑셀 다운로드 함수
  const generateServiceReportExcel = (data: any[]) => {
    const XLSX = require('xlsx');
    
    // 헤더 정의
    const headers = ['신청번호', '신청제목', '현재상태', '신청자', '신청소속', '단계', '배정(h)', '서비스유형', '조치담당자', '조치담당자소속', '작업(h)', '신청일시', '배정일', '예상조율일시', '작업시작일시', '작업완료일시'];
    
    // 데이터 배열 생성
    const excelData = [
      headers,
      ...data.map(report => [
        report.requestNumber,
        report.title,
        report.currentStatus,
        report.requester,
        report.requesterDepartment,
        report.stage,
        report.assignmentHours,
        report.serviceType,
        report.assignee,
        report.assigneeDepartment,
        report.workHours,
        report.requestDateTime,
        report.assignDateTime,
        report.scheduledDateTime,
        report.workStartDateTime,
        report.workCompleteDateTime
      ])
    ];
    
    // 워크시트 생성
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    
    // 컬럼 너비 설정
    const colWidths = [
      { wch: 15 }, // 신청번호
      { wch: 25 }, // 신청제목
      { wch: 12 }, // 현재상태
      { wch: 10 }, // 신청자
      { wch: 12 }, // 신청소속
      { wch: 8 },  // 단계
      { wch: 8 },  // 배정(h)
      { wch: 12 }, // 서비스유형
      { wch: 10 }, // 조치담당자
      { wch: 12 }, // 조치담당자소속
      { wch: 8 },  // 작업(h)
      { wch: 20 }, // 신청일시
      { wch: 20 }, // 배정일
      { wch: 20 }, // 예상조율일시
      { wch: 20 }, // 작업시작일시
      { wch: 20 }  // 작업완료일시
    ];
    ws['!cols'] = colWidths;
    
    // 워크북 생성
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '서비스현황리포트');
    
    return wb;
  };

  const downloadExcel = (data: any[], filename: string) => {
    const XLSX = require('xlsx');
    const wb = generateServiceReportExcel(data);
    XLSX.writeFile(wb, filename);
  };

  // 사용자 데이터 로드 함수
  const loadUsers = async () => {
    setUserLoading(true)
    setUserError('')
    
    try {
      const params: any = {
        page: userManagementCurrentPage,
        limit: 10  // 페이지네이션을 위해 limit을 10으로 설정
      }
      
      if (userManagementSearchDepartment !== '전체') {
        params.department = userManagementSearchDepartment
      }
      
      if (userManagementSearchRole !== '전체') {
        params.role = userManagementSearchRole
      }
      
      if (userManagementSearchName) {
        params.name = userManagementSearchName
      }
      
      if (userManagementSearchStartDate && userManagementSearchEndDate) {
        params.startDate = userManagementSearchStartDate
        params.endDate = userManagementSearchEndDate
      }
      
      console.log('사용자 데이터 로드 시도:', params)
      const response = await apiClient.getUsers(params)
      console.log('API 응답:', response)
      
      if (response.success && response.data) {
        console.log('사용자 데이터 설정:', response.data.users)
        setUsers(response.data.users)
        setUserTotalPages(response.data.totalPages)
      } else {
        console.error('API 응답 실패:', response)
        setUserError(response.error || '사용자 데이터를 불러오는데 실패했습니다.')
      }
    } catch (error) {
      console.error('사용자 데이터 로드 오류:', error)
      setUserError('사용자 데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setUserLoading(false)
    }
  }

  // 컴포넌트 마운트 시 사용자 데이터 로드
  useEffect(() => {
    console.log('useEffect triggered - loading users')
    loadUsers()
  }, [userManagementCurrentPage, userManagementSearchDepartment, userManagementSearchRole, userManagementSearchName, userManagementSearchStartDate, userManagementSearchEndDate])

  // 컴포넌트 마운트 시 한 번만 사용자 데이터 로드
  useEffect(() => {
    console.log('Initial load - loading users')
    loadUsers()
  }, [])

  // 사용자관리 필터링 (API 데이터 사용)
  const filteredUsers = (users || []).filter(user => {
    // 부서 필터
    if (userManagementSearchDepartment !== '전체' && user.department !== userManagementSearchDepartment) return false;
    
    // 권한 필터
    if (userManagementSearchRole !== '전체' && user.role !== userManagementSearchRole) return false;
    
    // 성명 검색
    if (userManagementSearchName && !user.name.includes(userManagementSearchName)) return false;
    
    // 기간 필터 (기간이 설정된 경우에만)
    if (userManagementSearchStartDate && userManagementSearchEndDate) {
      // API 데이터의 날짜 형식: "2025-01-01T00:00:00.000Z" -> "2025-01-01"
      const userDate = new Date(user.created_at);
      const startDate = new Date(userManagementSearchStartDate);
      // endDate에 23:59:59를 추가하여 해당 날짜의 끝까지 포함
      const endDate = new Date(userManagementSearchEndDate);
      endDate.setHours(23, 59, 59, 999);
      
      // 날짜 범위 확인
      if (userDate < startDate || userDate > endDate) return false;
    }
    
    return true;
  });

  // 사용자관리 페이지네이션 (API 기반 페이지네이션 사용)
  const userManagementTotalPages = userTotalPages; // API에서 받은 총 페이지 수 사용
  const paginatedUsers = filteredUsers; // API에서 이미 페이지네이션된 데이터 사용

  // 서비스 작업 목록 필터링 및 페이지네이션
  const filteredServiceRequests = serviceRequests.filter(request => {
    console.log('필터링 체크:', request)
    
    // 날짜 필터 (현재시점 기준 1주일)
    if (serviceWorkSearchStartDate && serviceWorkSearchEndDate) {
      const requestDate = new Date(request.requestDate.replace(/\./g, '-'))
      const startDate = new Date(serviceWorkSearchStartDate)
      const endDate = new Date(serviceWorkSearchEndDate)
      if (requestDate < startDate || requestDate > endDate) return false
    }
    
    // 미결 완료 조회 필터
    if (showServiceIncompleteOnly) {
      return request.stage !== '완료'
    }
    
    // 시스템 관리자 권한 필터링 로직
    // 시스템 관리자는 모든 데이터에 접근 가능 (전체 권한)
    if (serviceWorkSelectedDepartment !== '전체') {
      return request.assigneeDepartment === serviceWorkSelectedDepartment
    }
    
    // 전체 선택 시 모든 데이터 표시
    return true
  })
  
  // 페이지네이션 계산
  const serviceWorkItemsPerPage = 10
  const serviceWorkTotalPages = Math.ceil(filteredServiceRequests.length / serviceWorkItemsPerPage)
  const serviceWorkStartIndex = (serviceWorkCurrentPage - 1) * serviceWorkItemsPerPage
  const serviceWorkEndIndex = serviceWorkStartIndex + serviceWorkItemsPerPage
  const paginatedServiceRequests = filteredServiceRequests.slice(serviceWorkStartIndex, serviceWorkEndIndex)
  
  // 디버깅용 로그
  console.log('전체 서비스 요청 수:', serviceRequests.length)
  console.log('필터링된 요청 수:', filteredServiceRequests.length)
  console.log('페이지네이션된 요청 수:', paginatedServiceRequests.length)
  console.log('현재 페이지:', serviceWorkCurrentPage, '/', serviceWorkTotalPages)
  console.log('필터 조건들:', {
    serviceWorkSearchStartDate,
    serviceWorkSearchEndDate,
    showServiceIncompleteOnly,
    serviceWorkSelectedDepartment
  })

  // 미결 현황 데이터
  const [pendingWorks, setPendingWorks] = useState<PendingWork[]>([
    {
      id: '1',
      technician: '김기술',
      lastWeekPending: 0,
      longTermPending: 1
    }
  ])

  // 필터링된 서비스 요청 목록
  const filteredRequests = serviceRequests.filter(request => {
    // 미완료 조회 필터
    if (showIncompleteOnly && request.completionDate) {
      return false
    }
    
    // 날짜 범위 필터 (배정일자 기준)
    if (searchStartDate && searchEndDate) {
      // assignDate가 있으면 assignDate 사용, 없으면 requestDate 사용
      const dateToCheck = request.assignDate || request.requestDate
      const formattedDate = dateToCheck.replace(/\./g, '-')
      
      // 디버깅용 로그
      console.log('필터링 체크:', {
        requestNumber: request.requestNumber,
        assignDate: request.assignDate,
        requestDate: request.requestDate,
        dateToCheck,
        formattedDate,
        searchStartDate,
        searchEndDate,
        isInRange: formattedDate >= searchStartDate && formattedDate <= searchEndDate
      })
      
      // 문자열 비교로 날짜 범위 체크
      if (formattedDate < searchStartDate || formattedDate > searchEndDate) {
        return false
      }
    }
    
    return true
  })

  // 페이지네이션 (이미 위에서 정의됨)
  const totalPages = Math.ceil(filteredRequests.length / serviceWorkItemsPerPage)
  const startIndex = (currentPage - 1) * serviceWorkItemsPerPage
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + serviceWorkItemsPerPage)

  const handleAssignmentConfirm = (request: ServiceRequest) => {
    setSelectedRequest(request)
    setShowAssignmentModal(true)
  }

  const handleInfoView = (request: ServiceRequest) => {
    setSelectedRequest(request)
    setShowInfoViewModal(true)
  }

  // 작업정보등록 모달 열기
  const handleWorkRegistration = () => {
    setShowInfoViewModal(false)
    setShowWorkRegistrationModal(true)
  }

  // 정보확인 모달에서 작업정보등록 열기
  const handleWorkRegistrationInInfo = () => {
    setShowWorkRegistrationInInfo(true)
    // 예정조율일시에 현재 시점 자동 설정 (한국 시간)
    const now = new Date()
    const kstOffset = 9 * 60 // 한국은 UTC+9
    const kstTime = new Date(now.getTime() + (kstOffset * 60 * 1000))
    const formattedNow = kstTime.toISOString().slice(0, 16)
    setScheduledDate(formattedNow)
  }

  // 단계별 처리 함수들
  const handleScheduledProcess = () => {
    if (scheduledDate) {
      setCurrentStage('작업') // 예정 → 작업으로 변경
      // 작업시작일시에 현재 시점 자동 설정 (한국 시간)
      const now = new Date()
      const kstOffset = 9 * 60 // 한국은 UTC+9
      const kstTime = new Date(now.getTime() + (kstOffset * 60 * 1000))
      const formattedNow = kstTime.toISOString().slice(0, 16)
      setWorkStartDate(formattedNow)
      console.log('예정 단계 처리:', scheduledDate)
      alert('예정조율일시가 등록되었습니다. 작업 단계로 진행합니다.')
    } else {
      alert('예정조율일시를 입력해주세요.')
    }
  }

  const handleWorkStartProcess = () => {
    if (workStartDate) {
      setCurrentStage('완료') // 작업 → 완료로 변경
      // 작업완료일시에 현재 시점 자동 설정 (한국 시간)
      const now = new Date()
      const kstOffset = 9 * 60 // 한국은 UTC+9
      const kstTime = new Date(now.getTime() + (kstOffset * 60 * 1000))
      const formattedNow = kstTime.toISOString().slice(0, 16)
      setWorkCompleteDate(formattedNow)
      console.log('작업 시작:', workStartDate)
      alert('작업이 시작되었습니다. 완료 단계로 진행합니다.')
    } else {
      alert('작업시작일시를 입력해주세요.')
    }
  }

  const handleWorkCompleteProcess = () => {
    if (workCompleteDate && workContent) {
      setCurrentStage('미결') // 완료 → 미결로 변경
      console.log('작업 완료:', workCompleteDate, workContent)
      alert('작업이 완료되었습니다. 미결 처리 단계로 진행합니다.')
    } else {
      alert('작업내역과 작업완료일시를 모두 입력해주세요.')
    }
  }

  const handleUnresolvedProcess = () => {
    if (problemIssue) {
      setCurrentStage('미결')
      // 데이터 업데이트만 수행
      console.log('미결 처리:', problemIssue)
      alert('미결 처리가 완료되었습니다.')
    } else {
      alert('문제사항을 입력해주세요.')
    }
  }

  const handleAssignmentConfirmSubmit = () => {
    if (selectedRequest) {
      // 배정확인 로직
      setServiceRequests(prev => 
        prev.map(req => 
          req.id === selectedRequest.id 
            ? { ...req, stage: '확인' }
            : req
        )
      )
    }
    setShowAssignmentModal(false)
    setSelectedRequest(null)
  }

  const handleInfoSubmit = () => {
    if (selectedRequest) {
      // 작업정보등록 로직
      setServiceRequests(prev => 
        prev.map(req => 
          req.id === selectedRequest.id 
            ? { ...req, stage: '작업', completionDate: new Date().toLocaleString('ko-KR') }
            : req
        )
      )
    }
    setShowInfoModal(false)
    setSelectedRequest(null)
  }

  const handleInfoChange = () => {
    setShowInfoModal(true)
  }

  // 차트 데이터 업데이트 함수
  const updateChartData = () => {
    // 부서와 날짜에 따른 데이터 시뮬레이션
    const departmentData = {
      'IT팀': { received: 5, assigned: 10, working: 6, completed: 5, failed: 2 },
      '운영팀': { received: 8, assigned: 12, working: 4, completed: 8, failed: 1 },
      '개발팀': { received: 3, assigned: 6, working: 8, completed: 3, failed: 0 },
      '인사팀': { received: 2, assigned: 4, working: 2, completed: 2, failed: 1 },
      '': { received: 18, assigned: 32, working: 20, completed: 18, failed: 4 } // 전체 부서
    }
    
    const selectedDept = selectedDepartment || ''
    const data = departmentData[selectedDept] || departmentData['IT팀']
    
    // 날짜에 따른 가중치 적용 (예시)
    const daysDiff = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
    const dateMultiplier = Math.max(0.5, Math.min(2, daysDiff / 30)) // 30일 기준으로 가중치 계산
    
    setChartData({
      received: Math.round(data.received * dateMultiplier),
      assigned: Math.round(data.assigned * dateMultiplier),
      working: Math.round(data.working * dateMultiplier),
      completed: Math.round(data.completed * dateMultiplier),
      failed: Math.round(data.failed * dateMultiplier)
    })
  }

  // 일반문의현황 데이터 업데이트 함수
  const updateInquiryData = () => {
    // 부서와 날짜에 따른 일반문의 데이터 시뮬레이션 (답변/미답변만)
    const departmentInquiryData = {
      'IT팀': { answered: 15, unanswered: 10, total: 25, completionRate: 60.0, avgResponseTime: 2.3 },
      '운영팀': { answered: 20, unanswered: 8, total: 28, completionRate: 71.4, avgResponseTime: 1.8 },
      '개발팀': { answered: 12, unanswered: 15, total: 27, completionRate: 44.4, avgResponseTime: 3.2 },
      '인사팀': { answered: 8, unanswered: 5, total: 13, completionRate: 61.5, avgResponseTime: 2.1 },
      '': { answered: 55, unanswered: 38, total: 93, completionRate: 59.1, avgResponseTime: 2.4 } // 전체 부서
    }
    
    const selectedDept = inquirySelectedDepartment || ''
    const data = departmentInquiryData[selectedDept] || departmentInquiryData['']
    
    // 날짜에 따른 가중치 적용 (1주일 기준)
    const daysDiff = Math.ceil((new Date(inquiryEndDate) - new Date(inquiryStartDate)) / (1000 * 60 * 60 * 24))
    const dateMultiplier = Math.max(0.5, Math.min(2, daysDiff / 7)) // 7일 기준으로 가중치 계산
    
    const newData = {
      answered: Math.round(data.answered * dateMultiplier),
      unanswered: Math.round(data.unanswered * dateMultiplier),
      total: Math.round(data.total * dateMultiplier),
      completionRate: Math.round((data.completionRate * dateMultiplier) * 10) / 10,
      avgResponseTime: Math.round((data.avgResponseTime * dateMultiplier) * 10) / 10
    }
    
    setInquiryData(newData)
  }

  // 부서나 날짜 변경 시 차트 데이터 업데이트
  useEffect(() => {
    updateChartData()
  }, [selectedDepartment, startDate, endDate])

  // 일반문의현황 부서나 날짜 변경 시 데이터 업데이트
  useEffect(() => {
    updateInquiryData()
  }, [inquirySelectedDepartment, inquiryStartDate, inquiryEndDate])

  // 데이터 새로고침 함수 (검색 조건 유지)
  const handleRefresh = () => {
    // 현재 검색 조건을 유지하면서 데이터만 새로고침
    console.log('데이터 새로고침 - 검색 조건 유지:', {
      searchStartDate,
      searchEndDate,
      showIncompleteOnly
    })
    
    // 실제 환경에서는 여기서 API 호출을 수행
    // 예: fetchServiceRequests(searchStartDate, searchEndDate, showIncompleteOnly)
    
    // 현재는 더미 데이터이므로 검색 조건에 따른 필터링만 수행
    // 실제로는 서버에서 새로운 데이터를 가져와야 함
    console.log('검색 조건으로 데이터 필터링 중...')
    
    // 차트 데이터도 업데이트
    updateChartData()
    
    // 시각적 피드백을 위한 간단한 알림 (선택사항)
    // alert('데이터가 새로고침되었습니다.')
  }

  const closeModal = () => {
    setShowAssignmentModal(false)
    setShowRejectionModal(false)
    setShowRejectionInAssignment(false)
    setShowInfoModal(false)
    setShowInfoViewModal(false)
    setShowWorkRegistrationModal(false)
    setShowWorkCompleteModal(false)
    setShowPasswordModal(false)
    setShowWorkRegistrationInInfo(false)
    setSelectedRequest(null)
    setRejectionOpinion('')
    // 작업정보등록 상태 초기화
    setScheduledDate('')
    setWorkStartDate('')
    setWorkContent('')
    setWorkCompleteDate('')
    setProblemIssue('')
    setIsUnresolved(false)
    setCurrentStage('예정')
  }

  // 배정승인 처리
  const handleAssignmentApprove = () => {
    if (selectedRequest) {
      setServiceRequests(prev => 
        prev.map(req => 
          req.id === selectedRequest.id 
            ? { ...req, stage: '확인' }
            : req
        )
      )
    }
    setShowAssignmentModal(false)
    setShowApprovalSuccessModal(true)
    setSelectedRequest(null)
  }

  // 배정반려 처리
  const handleAssignmentReject = () => {
    setShowRejectionInAssignment(true)
  }

  // 최종반려 처리
  const handleFinalReject = () => {
    if (selectedRequest) {
      const now = new Date()
      const currentDateTime = now.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace(/\./g, '.').replace(/\s/g, ' ')

      setServiceRequests(prev =>
        prev.map(req =>
          req.id === selectedRequest.id
            ? {
                ...req,
                // 현재 배정 정보를 전) 배정 정보로 이동
                previousAssignDate: req.assignDate,
                previousAssignee: req.assignee,
                previousAssignmentOpinion: req.assignmentOpinion,
                // 현재 배정 정보 초기화
                assignDate: '',
                assignee: '',
                assignmentOpinion: '',
                // 반려 정보 설정
                rejectionDate: currentDateTime,
                rejectionOpinion: rejectionOpinion,
                stage: '반려'
              }
            : req
        )
      )
    }
    setShowRejectionInAssignment(false)
    setShowAssignmentModal(false)
    setShowRejectionSuccessModal(true) // Show rejection success modal
    setSelectedRequest(null)
    setRejectionOpinion('')
  }

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* 배경 이미지 */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/image/배경_시스템관리_페이지.jpg')",
          opacity: 1.0
        }}
      />

        {/* 헤더 */}
      <div className="relative z-20">
        <div className="flex justify-between items-center p-8">
              <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Icon name="laptop" size={24} className="text-black" />
                </div>
            <div>
              <h1 className="text-3xl font-bold text-black">IT System Administration</h1>
              <p className="text-gray-800 text-sm">통합 IT 서비스 관리 시스템</p>
            </div>
              </div>
              <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/')}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-out"
              style={{marginRight: '0px'}}
                >
                  로그아웃
                    </button>
              </div>
            </div>
          </div>

      {/* 메인 컨텐츠 */}
      <main className="relative z-10">
        {/* 사용자 정보 및 네비게이션 */}
        <div className="max-w-7xl mx-auto px-6 py-6 w-full">
          <div className="flex items-center justify-between mb-12">
            <div className="px-20 py-0 rounded-full -ml-72 smooth-hover animate-fade-in shadow-lg" style={{backgroundColor: '#FFD4D4', marginLeft: '-310px'}}>
              <span className="text-red-600 font-medium" style={{fontSize: '14px'}}>시스템관리 ({managerInfo.name})</span>
            </div>
          </div>
        </div>

        {/* 완전히 분리된 정보변경 버튼 */}
        <div className="absolute z-50" style={{top: '14px', right: '116px'}}>
                <button
            onClick={handleInfoChange}
            className="text-black/70 hover:text-black transition-all duration-300 ease-out flex items-center space-x-2 button-smooth px-4 py-2 rounded-lg"
          >
            <Icon name="settings-gray" size={20} className="text-black hover:text-black" />
            <span>정보 변경</span>
                    </button>
        </div>

        {/* 분리된 3개 프레임 */}
        <div className="max-w-7xl mx-auto px-6 py-6">
            
          {/* 프레임 1: 서비스 집계현황 */}
          <div className="mb-6" style={{marginLeft: '-315px', marginTop: '-60px'}}>
            <div className="w-80" style={{width: '306px'}}>
              <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col" style={{height: '650px', backgroundColor: 'rgba(255, 255, 255, 0.5)'}}>
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <button
                      onClick={() => {/* 새로고침 로직 */}}
                      className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <Icon name="refresh" size={16} />
                    </button>
                    <h3 className="text-lg font-bold text-gray-800">서비스 집계현황</h3>
                  </div>
                  <div className="flex justify-end" style={{marginTop: '30px'}}>
                    <button
                      onClick={() => setShowServiceAggregation(!showServiceAggregation)}
                      className={`w-8 h-4 rounded-full transition-colors ${
                        showServiceAggregation ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    >
                      <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                        showServiceAggregation ? 'translate-x-4' : 'translate-x-0.5'
                      }`} />
                </button>
                  </div>
                </div>

                {showServiceAggregation && (
                  <>
                    {/* 부서 선택 */}
                    <div className="mb-4">
                      <select
                        value={selectedDepartment}
                        onChange={(e) => {
                          setSelectedDepartment(e.target.value)
                          setCurrentDepartment(e.target.value || 'IT팀')
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="">전체 부서</option>
                        <option value="IT팀">IT팀</option>
                        <option value="운영팀">운영팀</option>
                        <option value="개발팀">개발팀</option>
                        <option value="인사팀">인사팀</option>
                      </select>
                    </div>


                    {/* 검색 기간 선택 (현재시점 1개월) */}
                    <div className="mb-4">
                      <div className="flex items-center space-x-1">
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-2 py-2 border border-gray-300 rounded-lg text-xs"
                        />
                        <span className="text-gray-500 text-sm">~</span>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-2 py-2 border border-gray-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    {/* 반원 호 차트 */}
                    <div className="flex items-center h-40" style={{marginTop: '100px'}}>
                      <div className="w-[400px] h-[400px] relative">
                        <svg viewBox="0 0 200 200" className="w-full h-full">
                          {(() => {
                            const total = chartData.received + chartData.assigned + chartData.working + chartData.completed + chartData.failed
                            const radius = 120
                            const centerX = 150
                            const centerY = 100
                            
                            // 각 섹션의 각도 계산 (180도 반원)
                            const receivedAngle = (chartData.received / total) * 180
                            const assignedAngle = (chartData.assigned / total) * 180
                            const workingAngle = (chartData.working / total) * 180
                            const completedAngle = (chartData.completed / total) * 180
                            const failedAngle = (chartData.failed / total) * 180
                            
                            // 호 그리기 함수
                            const createArc = (startAngle, endAngle, color, strokeWidth = 48) => {
                              const start = polarToCartesian(centerX, centerY, radius, endAngle)
                              const end = polarToCartesian(centerX, centerY, radius, startAngle)
                              const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"
                              const d = [
                                "M", start.x, start.y,
                                "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
                              ].join(" ")
                              
                              return (
                                <path
                                  d={d}
                                  fill="none"
                                  stroke={color}
                                  strokeWidth={strokeWidth}
                                  strokeLinecap="round"
                                />
                              )
                            }
                            
                            // 극좌표를 직교좌표로 변환 (180도 회전)
                            const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
                              const angleInRadians = (angleInDegrees + 90) * Math.PI / 180.0
                              return {
                                x: centerX + (radius * Math.cos(angleInRadians)),
                                y: centerY + (radius * Math.sin(angleInRadians))
                              }
                            }
                            
                            let currentAngle = 0
                            
                            return (
                              <>
                                {/* 접수대기 (보라색) */}
                                {createArc(currentAngle, currentAngle + receivedAngle, "#8B5CF6")}
                                {currentAngle += receivedAngle}
                                
                                {/* 배정진행 (주황색) */}
                                {createArc(currentAngle, currentAngle + assignedAngle, "#F59E0B")}
                                {currentAngle += assignedAngle}
                                
                                {/* 작업진행 (파란색) */}
                                {createArc(currentAngle, currentAngle + workingAngle, "#3B82F6")}
                                {currentAngle += workingAngle}
                                
                                {/* 처리완료 (초록색) */}
                                {createArc(currentAngle, currentAngle + completedAngle, "#10B981")}
                                {currentAngle += completedAngle}
                                
                                {/* 처리불가 (빨간색) */}
                                {createArc(currentAngle, currentAngle + failedAngle, "#EF4444")}
                              </>
                            )
                          })()}
                        </svg>
                        
                        {/* 범례 오버레이 */}
                        <div className="absolute top-36 right-4 space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full" style={{backgroundColor: '#EF4444'}}></div>
                            <span className="text-gray-700 font-medium text-xs">불가: {chartData.failed}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full" style={{backgroundColor: '#10B981'}}></div>
                            <span className="text-gray-700 font-medium text-xs">완료: {chartData.completed}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full" style={{backgroundColor: '#3B82F6'}}></div>
                            <span className="text-gray-700 font-medium text-xs">작업: {chartData.working}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full" style={{backgroundColor: '#F59E0B'}}></div>
                            <span className="text-gray-700 font-medium text-xs">배정: {chartData.assigned}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full" style={{backgroundColor: '#8B5CF6'}}></div>
                            <span className="text-gray-700 font-medium text-xs">접수: {chartData.received}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </>
                )}
              </div>
              </div>
            </div>

          {/* 프레임 2: 서비스선택 */}
          <div className="mb-6" style={{marginLeft: '34px', marginTop: '-676px'}}>
            <div className="w-full" style={{maxWidth: '1170px'}}>
                <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col" style={{
                  height: '652px', 
                  backgroundColor: 'rgba(255, 255, 255, 0)'
                }}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-red-600">시스템 관리</h3>
                  <h3 className="text-sm text-red-600">(선택항목 슬라이드를 좌←→우 드레그 하세요!)</h3>
                </div>

                {/* 4가지 관리 항목 - 슬라이드 가능한 컨테이너 */}
                <div 
                  className="overflow-x-auto overflow-y-hidden h-full scrollbar-hide select-none" 
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitScrollbar: { display: 'none' },
                    cursor: isDragging ? 'grabbing' : 'grab'
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseLeave={handleMouseLeave}
                  onMouseUp={handleMouseUp}
                  onMouseMove={handleMouseMove}
                >
                  <div className="flex gap-4 h-full" style={{width: 'max-content'}}>
                  {/* 서비스 작업 List 관리 */}
                  <div 
                    onClick={(e) => handleCardClick(e, () => setShowServiceWorkList(true))}
                    className="bg-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-700 hover:scale-105 transition-all duration-300 ease-in-out flex flex-col items-start justify-start flex-shrink-0"
                    style={{
                      backgroundImage: `url('/image/슬라이드_선택_서비스작업List관리.jpg')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      width: '320px',
                      height: '400px',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 10px 20px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    <div className="text-left">
                      <Icon name="laptop-white" size={48} className="mb-4" />
                      <h4 className="text-white font-bold text-lg">서비스 작업 List 관리</h4>
                    </div>
                  </div>

                  {/* 서비스 현황 리포트 */}
                  <div 
                    onClick={(e) => handleCardClick(e, () => setShowServiceReport(true))}
                    className="bg-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-700 hover:scale-105 transition-all duration-300 ease-in-out flex flex-col items-start justify-start flex-shrink-0"
                    style={{
                      backgroundImage: `url('/image/슬라이드_선택_서비스현황리포트.jpg')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      width: '320px',
                      height: '400px',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 10px 20px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    <div className="text-left">
                      <Icon name="bar-chart" size={48} className="text-white mb-4" />
                      <h4 className="text-white font-bold text-lg">서비스 현황 리포트</h4>
                    </div>
                  </div>

                  {/* 일반문의 List 관리 */}
                  <div 
                    onClick={(e) => handleCardClick(e, () => setShowGeneralInquiryList(true))}
                    className="bg-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-700 hover:scale-105 transition-all duration-300 ease-in-out flex flex-col items-start justify-start flex-shrink-0"
                    style={{
                      backgroundImage: `url('/image/선택_일반문의List관리.jpg')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      width: '320px',
                      height: '400px',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 10px 20px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    <div className="text-left">
                      <Icon name="message-square" size={48} className="text-white mb-4" />
                      <h4 className="text-white font-bold text-lg">일반문의 List 관리</h4>
                    </div>
                  </div>

                  {/* 사용자 관리 */}
                  <div 
                    onClick={(e) => handleCardClick(e, () => {
                      setShowUserManagement(true)
                      loadUsers() // 사용자 관리 프레임 열 때 데이터 로드
                    })}
                    className="bg-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-700 hover:scale-105 transition-all duration-300 ease-in-out flex flex-col items-start justify-start flex-shrink-0"
                    style={{
                      backgroundImage: `url('/image/슬라이드_선택_사용자관리.jpg')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      width: '320px',
                      height: '400px',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 10px 20px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    <div className="text-left">
                      <Icon name="user" size={48} className="text-white mb-4" />
                      <h4 className="text-white font-bold text-lg">사용자 관리</h4>
                    </div>
                  </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* 서비스작업 List 관리 프레임 */}
          {showServiceWorkList && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
              <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-hidden">
                {/* 모달 헤더 */}
                <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200">
                  <div className="flex items-center space-x-4">
                <button
                      onClick={() => {/* 새로고침 로직 */}}
                      className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <Icon name="refresh" size={16} />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">서비스 작업 처리 현황</h2>
                  </div>
                  <button
                    onClick={() => setShowServiceWorkList(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Icon name="close" size={24} />
                  </button>
                </div>

                {/* 검색 및 필터 영역 */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      {/* 날짜 선택 */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="date"
                          value={serviceWorkSearchStartDate}
                          onChange={(e) => setServiceWorkSearchStartDate(e.target.value)}
                          className="px-3 py-2 border-2 border-gray-400 rounded-lg text-sm font-medium bg-white shadow-sm focus:border-blue-500 focus:outline-none"
                        />
                        <span className="text-gray-600 font-medium">~</span>
                        <input
                          type="date"
                          value={serviceWorkSearchEndDate}
                          onChange={(e) => setServiceWorkSearchEndDate(e.target.value)}
                          className="px-3 py-2 border-2 border-gray-400 rounded-lg text-sm font-medium bg-white shadow-sm focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      
                      {/* 부서 선택 */}
                      <select
                        value={serviceWorkSelectedDepartment}
                        onChange={(e) => setServiceWorkSelectedDepartment(e.target.value)}
                        className="px-3 py-2 border-2 border-gray-400 rounded-lg text-sm font-medium bg-white shadow-sm focus:border-blue-500 focus:outline-none"
                      >
                        <option value="전체">전체</option>
                        <option value="IT팀">IT팀</option>
                        <option value="운영팀">운영팀</option>
                        <option value="개발팀">개발팀</option>
                        <option value="보안팀">보안팀</option>
                        <option value="인사팀">인사팀</option>
                        <option value="재무팀">재무팀</option>
                      </select>
                    </div>
                    
                    {/* 미결완료조회 토글 - 우측 끝 배치 */}
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-700">미결완료조회</span>
                      <button
                        onClick={() => setShowServiceIncompleteOnly(!showServiceIncompleteOnly)}
                        className={`w-8 h-4 rounded-full transition-colors ${
                          showServiceIncompleteOnly ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      >
                        <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                          showServiceIncompleteOnly ? 'translate-x-4' : 'translate-x-0.5'
                        }`} />
                </button>
                    </div>
                  </div>
                </div>

                {/* 테이블 영역 */}
                <div className="flex-1 overflow-hidden">
                  <div className="overflow-x-auto overflow-y-auto px-4" style={{height: '450px'}}>
                    <table className="w-full text-sm">
                      <thead className="sticky top-0" style={{backgroundColor: '#FFD4D4'}}>
                        <tr>
                          <th className="px-2 py-2 text-center text-sm font-bold text-red-600">신청번호</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-red-600">신청시간</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-red-600">신청제목</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-red-600">현재상태</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-red-600">신청자</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-red-600">신청소속</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-red-600">배정시간</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-red-600">단계</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-red-600">조치자</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-red-600">조치소속</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-red-600">관리</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {paginatedServiceRequests.map((request) => (
                          <tr key={request.id} className="hover:bg-gray-50">
                            <td className="px-2 py-2 text-gray-900 text-center">{request.requestNumber}</td>
                            <td className="px-2 py-2 text-gray-900 text-center">{request.requestTime || '13:00'}</td>
                            <td className="px-2 py-2 text-gray-900">{request.title}</td>
                            <td className="px-2 py-2 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                request.currentStatus === '정상작동' ? 'bg-green-100 text-green-800' :
                                request.currentStatus === '오류발생' ? 'bg-red-100 text-red-800' :
                                request.currentStatus === '메시지창' ? 'bg-blue-100 text-blue-800' :
                                request.currentStatus === '부분불능' ? 'bg-yellow-100 text-yellow-800' :
                                request.currentStatus === '전체불능' ? 'bg-red-200 text-red-900' :
                                request.currentStatus === '점검요청' ? 'bg-purple-100 text-purple-800' :
                                request.currentStatus === '기타상태' ? 'bg-gray-100 text-gray-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {request.currentStatus}
                              </span>
                            </td>
                            <td className="px-2 py-2 text-gray-900 text-center">{request.requester}</td>
                            <td className="px-2 py-2 text-gray-900 text-center">{request.department}</td>
                            <td className="px-2 py-2 text-gray-900 text-center">{request.assignTime || '13:10'}</td>
                            <td className="px-2 py-2 text-center">
                              <div className="flex items-center justify-center">
                                {request.stage === '접수' && <Icon name="user" size={16} className="text-blue-600" />}
                                {request.stage === '배정' && <Icon name="check" size={16} className="text-green-600" />}
                                {request.stage === '재배정' && <Icon name="refresh-cw" size={16} className="text-orange-600" />}
                                {request.stage === '확인' && <Icon name="eye" size={16} className="text-purple-600" />}
                                {request.stage === '예정' && <Icon name="calendar" size={16} className="text-indigo-600" />}
                                {request.stage === '작업' && <Icon name="settings" size={16} className="text-yellow-600" />}
                                {request.stage === '완료' && <Icon name="check-circle" size={16} className="text-green-600" />}
                                {request.stage === '미결' && <Icon name="x-circle" size={16} className="text-red-600" />}
                                <span className="ml-1 text-gray-900">{request.stage}</span>
                              </div>
                            </td>
                            <td className="px-2 py-2 text-gray-900 text-center">{request.assignee || '-'}</td>
                            <td className="px-2 py-2 text-gray-900 text-center">{request.assigneeDepartment || '-'}</td>
                            <td className="px-2 py-2 text-center">
                              <div className="flex space-x-1 justify-center">
                                {/* 접수 단계: 조치담당자 미확정 - 배정작업 버튼 */}
                                {request.stage === '접수' && (
                <button
                                    onClick={() => {
                                      setSelectedWorkRequest(request);
                                      setShowServiceAssignmentModal(true);
                                    }}
                                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                                  >
                                    배정작업
                                  </button>
                                )}

                                {/* 재배정 단계: 조치담당자 미확정 - 재배정작업 버튼 */}
                                {request.stage === '재배정' && (
                                  <button
                                    onClick={() => {
                                      setSelectedWorkRequest(request);
                                      setShowServiceReassignmentModal(true);
                                    }}
                                    className="px-2 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600 transition-colors"
                                  >
                                    재배정작업
                                  </button>
                                )}

                                {/* 배정/확인/예정/작업/완료/미결 단계: 조치담당자 확정 - 수정/삭제 버튼 (시스템 관리자 전체 권한) */}
                                {(request.stage === '배정' || request.stage === '확인' || request.stage === '예정' || 
                                  request.stage === '작업' || request.stage === '완료' || request.stage === '미결') && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setSelectedWorkRequest(request);
                                        
                                        // 기존 데이터가 있으면 불러오기, 없으면 현재 시점으로 설정
                                        if (request.scheduledDate) {
                                          setServiceWorkScheduledDate(request.scheduledDate)
                                          setServiceWorkStartDate(request.workStartDate || '')
                                          setServiceWorkContent(request.workContent || '')
                                          setServiceWorkCompleteDate(request.workCompleteDate || '')
                                          setServiceWorkProblemIssue(request.problemIssue || '')
                                          setServiceWorkIsUnresolved(request.isUnresolved || false)
                                          setServiceWorkCurrentStage(request.currentWorkStage || '예정')
                                        } else {
                                          // 현재 시점으로 자동 설정 (한국 시간)
                                          const now = new Date()
                                          const kstOffset = 9 * 60 // 한국은 UTC+9
                                          const kstTime = new Date(now.getTime() + (kstOffset * 60 * 1000))
                                          const formattedNow = kstTime.toISOString().slice(0, 16)
                                          setServiceWorkScheduledDate(formattedNow)
                                          setServiceWorkStartDate('')
                                          setServiceWorkContent('')
                                          setServiceWorkCompleteDate('')
                                          setServiceWorkProblemIssue('')
                                          setServiceWorkIsUnresolved(false)
                                          setServiceWorkCurrentStage('예정')
                                        }
                                        
                                        setShowServiceWorkInfoModal(true);
                                      }}
                                      className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                                    >
                                      수정
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedWorkRequest(request);
                                        setShowServiceWorkDeleteModal(true);
                                      }}
                                      className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                                    >
                                      삭제
                                    </button>
                                  </>
                                )}

                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 페이지네이션 */}
                {serviceWorkTotalPages > 1 && (
                  <div className="flex justify-center mt-4 pt-4 pb-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setServiceWorkCurrentPage(Math.max(1, serviceWorkCurrentPage - 1))}
                        disabled={serviceWorkCurrentPage === 1}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        이전
                      </button>
                      <span className="px-2 py-1 bg-blue-500 text-white rounded text-xs">
                        {serviceWorkCurrentPage}/{serviceWorkTotalPages}
                      </span>
                      <button 
                        onClick={() => setServiceWorkCurrentPage(Math.min(serviceWorkTotalPages, serviceWorkCurrentPage + 1))}
                        disabled={serviceWorkCurrentPage >= serviceWorkTotalPages}
                        className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        다음
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 서비스현황 리포트 프레임 */}
          {showServiceReport && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
              <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-hidden">
                {/* 모달 헤더 */}
                <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => {
                        setServiceReportCurrentPage(1);
                        const today = new Date().toISOString().split('T')[0];
                        setServiceReportSearchStartDate(today);
                        setServiceReportSearchEndDate(today);
                        setServiceReportStatusFilter('전체');
                        setServiceReportDepartmentFilter('전체');
                        setServiceReportStageFilter('전체');
                      }}
                      className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <Icon name="refresh" size={16} />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">서비스 현황 Report</h2>
                  </div>
                  <button
                    onClick={() => setShowServiceReport(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Icon name="close" size={24} />
                  </button>
                </div>

                {/* 검색 및 필터 영역 */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      {/* 날짜 선택 */}
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">Q 검색 조건:</label>
                        <input
                          type="date"
                          value={serviceReportSearchStartDate}
                          onChange={(e) => setServiceReportSearchStartDate(e.target.value)}
                          className="px-3 py-2 border-2 border-gray-400 rounded-lg text-sm font-medium bg-white shadow-sm focus:border-blue-500 focus:outline-none"
                        />
                        <span className="text-gray-600 font-medium">~</span>
                        <input
                          type="date"
                          value={serviceReportSearchEndDate}
                          onChange={(e) => setServiceReportSearchEndDate(e.target.value)}
                          className="px-3 py-2 border-2 border-gray-400 rounded-lg text-sm font-medium bg-white shadow-sm focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      
                      {/* 현재상태 선택 */}
                      <select
                        value={serviceReportStatusFilter}
                        onChange={(e) => setServiceReportStatusFilter(e.target.value)}
                        className="px-3 py-2 border-2 border-gray-400 rounded-lg text-sm font-medium bg-white shadow-sm focus:border-blue-500 focus:outline-none"
                      >
                        <option value="전체">전체</option>
                        <option value="정상작동">정상작동</option>
                        <option value="부분불능">부분불능</option>
                        <option value="전체불능">전체불능</option>
                        <option value="기타상태">기타상태</option>
                        <option value="메시지창">메시지창</option>
                        <option value="오류발생">오류발생</option>
                        <option value="점검요청">점검요청</option>
                      </select>
                      
                      {/* 부서 선택 */}
                      <select
                        value={serviceReportDepartmentFilter}
                        onChange={(e) => setServiceReportDepartmentFilter(e.target.value)}
                        className="px-3 py-2 border-2 border-gray-400 rounded-lg text-sm font-medium bg-white shadow-sm focus:border-blue-500 focus:outline-none"
                      >
                        <option value="전체">전체</option>
                        <option value="IT팀">IT팀</option>
                        <option value="운영팀">운영팀</option>
                        <option value="관리부">관리부</option>
                        <option value="생산부">생산부</option>
                        <option value="구매팀">구매팀</option>
                        <option value="마케팅팀">마케팅팀</option>
                        <option value="재무팀">재무팀</option>
                        <option value="인사팀">인사팀</option>
                        <option value="법무팀">법무팀</option>
                        <option value="연구개발팀">연구개발팀</option>
                      </select>
                      
                      {/* 단계 선택 */}
                      <select
                        value={serviceReportStageFilter}
                        onChange={(e) => setServiceReportStageFilter(e.target.value)}
                        className="px-3 py-2 border-2 border-gray-400 rounded-lg text-sm font-medium bg-white shadow-sm focus:border-blue-500 focus:outline-none"
                      >
                        <option value="전체">전체</option>
                        <option value="접수">접수</option>
                        <option value="배정">배정</option>
                        <option value="확인">확인</option>
                        <option value="예정">예정</option>
                        <option value="작업">작업</option>
                        <option value="완료">완료</option>
                        <option value="미결">미결</option>
                        <option value="재배정">재배정</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 테이블 영역 */}
                <div className="flex-1 overflow-hidden">
                  <div className="overflow-x-auto overflow-y-auto px-4" style={{height: '450px'}}>
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 sticky top-0">
                        <tr>
                          <th className="px-2 py-2 text-center text-sm font-bold text-gray-800">신청번호</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-gray-800">신청제목</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-gray-800">현재상태</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-gray-800">신청자</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-gray-800">신청소속</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-gray-800">단계</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-gray-800">배정(h)</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-gray-800">서비스유형</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-gray-800">조치담당자</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-gray-800">조치담당자소속</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-gray-800">작업(h)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {paginatedServiceReports.map((report) => (
                          <tr key={report.id} className="hover:bg-gray-50">
                            <td className="px-2 py-2 text-gray-900 text-center">{report.requestNumber}</td>
                            <td className="px-2 py-2 text-gray-900 text-center">{report.title}</td>
                            <td className="px-2 py-2 text-gray-900 text-center">{report.currentStatus}</td>
                            <td className="px-2 py-2 text-gray-900 text-center">{report.requester}</td>
                            <td className="px-2 py-2 text-gray-900 text-center">{report.requesterDepartment}</td>
                            <td className="px-2 py-2 text-gray-900 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                report.stage === '접수' ? 'bg-purple-100 text-purple-800' :
                                report.stage === '배정' ? 'bg-blue-100 text-blue-800' :
                                report.stage === '확인' ? 'bg-green-100 text-green-800' :
                                report.stage === '예정' ? 'bg-yellow-100 text-yellow-800' :
                                report.stage === '작업' ? 'bg-blue-100 text-blue-800' :
                                report.stage === '완료' ? 'bg-green-100 text-green-800' :
                                report.stage === '미결' ? 'bg-red-100 text-red-800' :
                                report.stage === '재배정' ? 'bg-orange-100 text-orange-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {report.stage}
                              </span>
                            </td>
                            <td className="px-2 py-2 text-gray-900 text-center">{report.assignmentHours}h</td>
                            <td className="px-2 py-2 text-gray-900 text-center">{report.serviceType}</td>
                            <td className="px-2 py-2 text-gray-900 text-center">{report.assignee}</td>
                            <td className="px-2 py-2 text-gray-900 text-center">{report.assigneeDepartment}</td>
                            <td className="px-2 py-2 text-gray-900 text-center">{report.workHours}h</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 하단 버튼 영역 */}
                <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={() => {
                      // 엑셀 파일 다운로드 로직
                      const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
                      const filename = `서비스현황리포트_${today}.xlsx`;
                      downloadExcel(filteredServiceReports, filename);
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    자료 다운로드 (Excel)
                  </button>
                  
                  {/* 페이지네이션 */}
                  {serviceReportTotalPages > 1 && (
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setServiceReportCurrentPage(Math.max(1, serviceReportCurrentPage - 1))}
                        disabled={serviceReportCurrentPage === 1}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        이전
                      </button>
                      <span className="px-2 py-1 bg-blue-500 text-white rounded text-xs">
                        {serviceReportCurrentPage}/{serviceReportTotalPages}
                      </span>
                      <button 
                        onClick={() => setServiceReportCurrentPage(Math.min(serviceReportTotalPages, serviceReportCurrentPage + 1))}
                        disabled={serviceReportCurrentPage >= serviceReportTotalPages}
                        className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        다음
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 사용자관리 프레임 */}
          {showUserManagement && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
              <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-hidden">
                {/* 모달 헤더 */}
                <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => {
                        setUserManagementCurrentPage(1);
                        setUserManagementSearchDepartment('전체');
                        setUserManagementSearchRole('전체');
                        setUserManagementSearchName('');
                        const oneWeekAgo = new Date();
                        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                        setUserManagementSearchStartDate(oneWeekAgo.toISOString().split('T')[0]);
                        setUserManagementSearchEndDate(new Date().toISOString().split('T')[0]);
                        loadUsers(); // 새로고침 시 데이터 로드
                      }}
                      className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <Icon name="refresh" size={16} />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">사용자 관리</h2>
                  </div>
                  <button
                    onClick={() => setShowUserManagement(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Icon name="close" size={24} />
                  </button>
                </div>

                {/* 검색 및 필터 영역 */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      {/* 부서 선택 */}
                      <select
                        value={userManagementSearchDepartment}
                        onChange={(e) => setUserManagementSearchDepartment(e.target.value)}
                        className="px-3 py-2 border-2 border-gray-400 rounded-lg text-sm font-medium bg-white shadow-sm focus:border-blue-500 focus:outline-none"
                      >
                        <option value="전체">전체</option>
                        <option value="IT팀">IT팀</option>
                        <option value="운영팀">운영팀</option>
                        <option value="관리팀">관리팀</option>
                        <option value="생산팀">생산팀</option>
                        <option value="총무팀">총무팀</option>
                        <option value="운송부">운송부</option>
                        <option value="관리부">관리부</option>
                        <option value="구매팀">구매팀</option>
                        <option value="마케팅팀">마케팅팀</option>
                      </select>
                      
                      {/* 권한 선택 */}
                      <select
                        value={userManagementSearchRole}
                        onChange={(e) => setUserManagementSearchRole(e.target.value)}
                        className="px-3 py-2 border-2 border-gray-400 rounded-lg text-sm font-medium bg-white shadow-sm focus:border-blue-500 focus:outline-none"
                      >
                        <option value="전체">전체</option>
                        <option value="시스템관리">시스템관리</option>
                        <option value="관리매니저">관리매니저</option>
                        <option value="배정담당자">배정담당자</option>
                        <option value="조치담당자">조치담당자</option>
                        <option value="일반사용자">일반사용자</option>
                      </select>
                      
                      {/* 성명 찾기 */}
                      <div className="flex items-center space-x-2">
                        <Icon name="search" size={16} className="text-gray-500" />
                        <input
                          type="text"
                          placeholder="성명 찾기"
                          value={userManagementSearchName}
                          onChange={(e) => setUserManagementSearchName(e.target.value)}
                          className="px-3 py-2 border-2 border-gray-400 rounded-lg text-sm font-medium bg-white shadow-sm focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      
                      {/* 기간 선택 */}
                      <div className="flex items-center space-x-2">
                        <Icon name="calendar" size={16} className="text-gray-500" />
                        <input
                          type="date"
                          value={userManagementSearchStartDate}
                          onChange={(e) => setUserManagementSearchStartDate(e.target.value)}
                          className="px-3 py-2 border-2 border-gray-400 rounded-lg text-sm font-medium bg-white shadow-sm focus:border-blue-500 focus:outline-none"
                        />
                        <span className="text-gray-600 font-medium">~</span>
                        <input
                          type="date"
                          value={userManagementSearchEndDate}
                          onChange={(e) => setUserManagementSearchEndDate(e.target.value)}
                          className="px-3 py-2 border-2 border-gray-400 rounded-lg text-sm font-medium bg-white shadow-sm focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 테이블 영역 */}
                <div className="flex-1 overflow-hidden">
                  <div className="overflow-x-auto overflow-y-auto px-4" style={{height: '450px'}}>
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-gray-100">
                        <tr>
                          <th className="px-2 py-2 text-center text-sm font-bold text-gray-800">이메일/ID</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-gray-800">성명</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-gray-800">소속</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-gray-800">직급</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-gray-800">권한</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-gray-800">생성일시</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-gray-800">상태</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-gray-800">관리</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {userLoading ? (
                          <tr>
                            <td colSpan={8} className="px-2 py-8 text-center text-gray-500">
                              <div className="flex items-center justify-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span>사용자 데이터를 불러오는 중...</span>
                              </div>
                            </td>
                          </tr>
                        ) : userError ? (
                          <tr>
                            <td colSpan={8} className="px-2 py-8 text-center text-red-500">
                              <div className="flex items-center justify-center space-x-2">
                                <span>❌</span>
                                <span>{userError}</span>
                                <button
                                  onClick={loadUsers}
                                  className="ml-2 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                                >
                                  다시 시도
                                </button>
                              </div>
                            </td>
                          </tr>
                        ) : paginatedUsers.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="px-2 py-8 text-center text-gray-500">
                              <div className="flex flex-col items-center justify-center space-y-2">
                                <div className="flex items-center space-x-2">
                                  <span>🔍</span>
                                  <span className="font-medium">검색 결과가 없습니다</span>
                                </div>
                                <div className="text-sm text-gray-400">
                                  검색 조건을 변경하거나 새로고침 버튼을 클릭해보세요
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          paginatedUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                              <td className="px-2 py-2 text-gray-900 text-center">{user.email}</td>
                              <td className="px-2 py-2 text-gray-900 text-center">{user.name}</td>
                              <td className="px-2 py-2 text-gray-900 text-center">{user.department}</td>
                              <td className="px-2 py-2 text-gray-900 text-center">{user.position}</td>
                              <td className="px-2 py-2 text-gray-900 text-center">{user.role}</td>
                              <td className="px-2 py-2 text-gray-900 text-center">
                                {(() => {
                                  const date = new Date(user.created_at);
                                  const year = date.getFullYear();
                                  const month = String(date.getMonth() + 1).padStart(2, '0');
                                  const day = String(date.getDate()).padStart(2, '0');
                                  return `${year}.${month}.${day}.`;
                                })()}
                              </td>
                              <td className="px-2 py-2 text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  user.status === 'active' ? 'bg-green-100 text-green-800' : 
                                  user.status === 'inactive' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {user.status === 'active' ? '정상' : user.status === 'inactive' ? '정지' : user.status}
                                </span>
                              </td>
                              <td className="px-2 py-2 text-center">
                                <div className="flex justify-center space-x-2">
                                  <button
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setEditUserData({
                                        email: user.email,
                                        name: user.name,
                                        department: user.department,
                                        position: user.position,
                                        role: user.role,
                                        status: user.status
                                      });
                                      setShowUserEditModal(true);
                                    }}
                                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                                  >
                                    수정
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setShowUserResetModal(true);
                                    }}
                                    className="px-2 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600 transition-colors"
                                  >
                                    초기화
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 페이지네이션 */}
                {userManagementTotalPages > 1 && (
                  <div className="flex justify-center mt-4 pt-4 pb-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setUserManagementCurrentPage(Math.max(1, userManagementCurrentPage - 1))}
                        disabled={userManagementCurrentPage === 1}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        이전
                      </button>
                      <span className="px-2 py-1 bg-blue-500 text-white rounded text-xs">
                        {userManagementCurrentPage}/{userManagementTotalPages}
                      </span>
                      <button 
                        onClick={() => setUserManagementCurrentPage(Math.min(userManagementTotalPages, userManagementCurrentPage + 1))}
                        disabled={userManagementCurrentPage >= userManagementTotalPages}
                        className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        다음
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 프레임 3: 일반문의 현황 */}
          <div className="absolute" style={{left: '1590px', top: '84px'}}>
            <div className="w-80" style={{width: '306px'}}>
              <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col" style={{height: '650px', backgroundColor: 'rgba(255, 255, 255, 0.5)'}}>
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <button
                      onClick={() => {/* 새로고침 로직 */}}
                      className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <Icon name="refresh" size={16} />
                    </button>
                    <h3 className="text-lg font-bold text-gray-800">일반문의 현황</h3>
                  </div>
                  <div className="flex justify-end" style={{marginTop: '30px'}}>
                    <button
                      onClick={() => setShowGeneralInquiryStatus(!showGeneralInquiryStatus)}
                      className={`w-8 h-4 rounded-full transition-colors ${
                        showGeneralInquiryStatus ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    >
                      <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                        showGeneralInquiryStatus ? 'translate-x-4' : 'translate-x-0.5'
                      }`} />
                </button>
                  </div>
                </div>

                {showGeneralInquiryStatus && (
                  <>
                    {/* 부서 선택 */}
                    <div className="mb-4">
                      <select
                        value={inquirySelectedDepartment}
                        onChange={(e) => {
                          setInquirySelectedDepartment(e.target.value)
                          setInquiryCurrentDepartment(e.target.value || '전체 부서')
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="">전체 부서</option>
                        <option value="IT팀">IT팀</option>
                        <option value="운영팀">운영팀</option>
                        <option value="개발팀">개발팀</option>
                        <option value="인사팀">인사팀</option>
                      </select>
                    </div>

                    {/* 검색 기간 선택 */}
                    <div className="mb-4">
                      <div className="flex items-center space-x-1">
                        <input
                          type="date"
                          value={inquiryStartDate}
                          onChange={(e) => setInquiryStartDate(e.target.value)}
                          className="w-full px-2 py-2 border border-gray-300 rounded-lg text-xs"
                        />
                        <span className="text-gray-500 text-sm">~</span>
                        <input
                          type="date"
                          value={inquiryEndDate}
                          onChange={(e) => setInquiryEndDate(e.target.value)}
                          className="w-full px-2 py-2 border border-gray-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    {/* 스택 막대 차트 */}
                    <div className="flex justify-center items-center h-96">
                      <div className="w-full h-80 relative">
                        <div className="flex justify-center h-full">
                          {/* 스택 막대 */}
                          <div className="flex flex-col items-center">
                            <div className="w-20 h-64 relative">
                              {/* 미답변 (주황색) - 상단 */}
                              <div 
                                className="w-full bg-orange-500 rounded-t absolute top-0 flex items-center justify-center"
                                style={{height: `${(inquiryData.unanswered / (inquiryData.answered + inquiryData.unanswered)) * 100}%`}}
                              >
                                <span className="text-white text-sm font-bold">{inquiryData.unanswered}</span>
                              </div>
                              
                              {/* 답변 (초록색) - 하단 */}
                              <div 
                                className="w-full bg-green-500 rounded-b absolute bottom-0 flex items-center justify-center"
                                style={{height: `${(inquiryData.answered / (inquiryData.answered + inquiryData.unanswered)) * 100}%`}}
                              >
                                <span className="text-white text-sm font-bold">{inquiryData.answered}</span>
                              </div>
                            </div>
                            
                            {/* 라벨 */}
                            <div className="mt-3 text-center">
                              <div className="flex items-center space-x-3 text-sm">
                                <div className="flex items-center space-x-1">
                                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                                  <span>미답변</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                                  <span>답변</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="relative z-10 text-white py-4">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm">ⓒ 2025 시스템 관리 시스템. 모든권리는 Juss 가 보유</p>
        </div>
      </footer>

      {/* 사용자 정보 수정 모달 */}
      {showUserEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="user" size={24} className="mr-2" />
                회원정보 수정
              </h2>
                <button
                onClick={() => setShowUserEditModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 왼쪽 컬럼 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">이메일/ID</label>
                    <input
                      type="email"
                      defaultValue={selectedUser.email}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">성명</label>
                    <input
                      type="text"
                      value={editUserData.name || ''}
                      onChange={(e) => setEditUserData({...editUserData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">소속</label>
                    <select 
                      value={editUserData.department || ''}
                      onChange={(e) => setEditUserData({...editUserData, department: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="IT팀">IT팀</option>
                      <option value="운영팀">운영팀</option>
                      <option value="관리팀">관리팀</option>
                      <option value="생산팀">생산팀</option>
                      <option value="총무팀">총무팀</option>
                      <option value="운송부">운송부</option>
                      <option value="관리부">관리부</option>
                      <option value="구매팀">구매팀</option>
                      <option value="마케팅팀">마케팅팀</option>
                    </select>
                  </div>
                </div>

                {/* 오른쪽 컬럼 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">직급</label>
                    <select 
                      value={editUserData.position || ''}
                      onChange={(e) => setEditUserData({...editUserData, position: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="부장">부장</option>
                      <option value="과장">과장</option>
                      <option value="차장">차장</option>
                      <option value="대리">대리</option>
                      <option value="사원">사원</option>
                      <option value="촉탁">촉탁</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">권한</label>
                    <select 
                      value={editUserData.role || ''}
                      onChange={(e) => setEditUserData({...editUserData, role: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="시스템관리">시스템관리</option>
                      <option value="관리매니저">관리매니저</option>
                      <option value="배정담당자">배정담당자</option>
                      <option value="조치담당자">조치담당자</option>
                      <option value="일반사용자">일반사용자</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">상태</label>
                    <select 
                      value={editUserData.status || ''}
                      onChange={(e) => setEditUserData({...editUserData, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">정상</option>
                      <option value="inactive">정지</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-end py-4 px-6 border-t border-gray-200">
              <button
                onClick={async () => {
                  if (!selectedUser) return;
                  
                  try {
                    const updateData: UserUpdateRequest = {
                      email: editUserData.email,
                      name: editUserData.name,
                      department: editUserData.department,
                      position: editUserData.position,
                      role: editUserData.role,
                      status: editUserData.status
                    };
                    
                    const response = await apiClient.updateUser(selectedUser.id, updateData);
                    
                    if (response.success) {
                      setShowUserEditModal(false);
                      alert('회원정보가 수정되었습니다.');
                      loadUsers(); // 사용자 목록 새로고침
                    } else {
                      alert(response.error || '회원정보 수정에 실패했습니다.');
                    }
                  } catch (error) {
                    console.error('사용자 수정 오류:', error);
                    alert('회원정보 수정 중 오류가 발생했습니다.');
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
              >
                수정 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 비밀번호 초기화 성공 모달 */}
      {showPasswordResetSuccessModal && resetPasswordResult && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="check-circle" size={24} className="mr-2 text-green-600" />
                비밀번호 초기화 완료
              </h2>
              <button
                onClick={() => {
                  setShowPasswordResetSuccessModal(false);
                  setResetPasswordResult(null);
                  loadUsers(); // 사용자 목록 새로고침
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="py-6 px-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="check-circle" size={32} className="text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  비밀번호가 성공적으로 초기화되었습니다
                </h3>
                <p className="text-gray-600 mb-4">
                  <strong>{selectedUser.name}</strong> ({selectedUser.email})<br/>
                  사용자에게 새 임시 비밀번호를 안전하게 전달해 주세요.
                </p>
              </div>

              {/* 임시 비밀번호 표시 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  임시 비밀번호
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={resetPasswordResult.temporaryPassword}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-lg font-bold"
                    readOnly
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(resetPasswordResult.temporaryPassword);
                      alert('임시 비밀번호가 클립보드에 복사되었습니다.');
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    복사
                  </button>
                </div>
              </div>

              {/* 경고 메시지 */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-yellow-800">
                  ⚠️ 보안을 위해 임시 비밀번호를 안전하게 전달하고, 사용자가 로그인 후 새 비밀번호로 변경하도록 안내해 주세요.
                </p>
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-end py-4 px-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowPasswordResetSuccessModal(false);
                  setResetPasswordResult(null);
                  loadUsers(); // 사용자 목록 새로고침
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 비밀번호 초기화 확인 모달 */}
      {showUserResetModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="lock" size={24} className="mr-2" />
                비밀번호 초기화
              </h2>
              <button
                onClick={() => setShowUserResetModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-600 mb-2">다음 사용자의 비밀번호를 초기화하시겠습니까?</p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-800">{selectedUser.name} ({selectedUser.email})</p>
                  <p className="text-sm text-gray-600">{selectedUser.department} - {selectedUser.position}</p>
                </div>
              </div>
              
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ 비밀번호 초기화 후 임시 비밀번호가 발급됩니다.<br/>
                  사용자에게 새 비밀번호를 안전하게 전달해 주세요.
                </p>
              </div>

              {/* 임시 비밀번호 필드 제거 - 초기화 실행 후에만 표시 */}
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-end space-x-3 py-4 px-6 border-t border-gray-200">
              <button
                onClick={() => setShowUserResetModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                취소
              </button>
              <button
                onClick={async () => {
                  if (!selectedUser) return;
                  
                  try {
                    const response = await apiClient.resetUserPassword(selectedUser.id);
                    
                    if (response.success && response.data) {
                      setResetPasswordResult(response.data);
                      setShowUserResetModal(false);
                      setShowPasswordResetSuccessModal(true);
                    } else {
                      alert(response.error || '비밀번호 초기화에 실패했습니다.');
                    }
                  } catch (error) {
                    console.error('비밀번호 초기화 오류:', error);
                    alert('비밀번호 초기화 중 오류가 발생했습니다.');
                  }
                }}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                초기화 실행
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 배정확인 모달 */}
      {showAssignmentModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="assignment-confirm" size={24} className="mr-2" />
                배정 확인
              </h2>
                <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 - 2열 레이아웃 */}
            <div className="py-4 px-6">
              <div className="grid grid-cols-2 gap-6">
                {/* 왼쪽: 서비스신청정보 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="user" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">시스템 관리 정보</h3>
                  </div>
                  
                  <div className="space-y-0">
                    <div>
                      <span className="text-sm font-medium text-gray-600">신청 번호 : </span>
                      <span className="text-sm font-bold text-red-600">{selectedRequest.requestNumber}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">신청 제목 : </span>
                      <span className="text-sm">{selectedRequest.title}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">신청 내용 </span>
                      <div className="text-sm mt-1 p-3 bg-gray-50 rounded text-gray-700 min-h-24 max-h-48 overflow-y-auto whitespace-pre-wrap">
                        {selectedRequest.content}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="user" size={14} className="mr-1" />
                        신청자 : <span className="text-sm ml-1 text-black">{selectedRequest.requester} ({selectedRequest.department})</span>
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="mail" size={14} className="mr-1" />
                        신청 연락처 : <span className="text-sm ml-1 text-black">{selectedRequest.contact}</span>
                      </span>                    
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="briefcase" size={14} className="mr-1" />
                        신청 위치 
                      </span>
                      <span className="text-sm ml-5">{selectedRequest.location}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="calendar" size={14} className="mr-1" />
                        신청 일시 : <span className="text-sm ml-1 text-black">{selectedRequest.requestDate} {selectedRequest.requestTime}</span>
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="message-square" size={14} className="mr-1" />
                        현재 상태 : <span className="text-sm ml-1 text-red-600 font-semibold">{selectedRequest.currentStatus}</span>
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">실제 신청자 : </span>
                      <span className="text-sm ml-1">{selectedRequest.actualRequester || selectedRequest.requester}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">실제 연락처 : </span>
                      <span className="text-sm ml-1">{selectedRequest.actualContact || selectedRequest.contact}</span>
                    </div>
                  </div>
                </div>

                {/* 오른쪽: 배정 반려 (반려 버튼 클릭 시에만 표시) */}
                {showRejectionInAssignment && (
                  <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center space-x-2 mb-4">
                      <Icon name="assignment-reject" size={20} className="text-orange-600" />
                      <h3 className="text-lg font-semibold text-gray-800">배정 반려</h3>
                    </div>
                    
                    <div className="space-y-0">
                      <div>
                        <span className="text-sm font-medium text-gray-600">배정 일시 : </span>
                        <span className="text-sm">{selectedRequest.assignDate || '2025.08.31 11:10'}</span>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-600">배정 담당자 : </span>
                        <span className="text-sm">{selectedRequest.assignee || '이배정'}</span>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-600">배정 의견 : </span>
                        <span className="text-sm">{selectedRequest.assignmentOpinion || '업무에 적합하여 배정'}</span>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-600">서비스 조치유형 → </span>
                        <span className="text-sm">{selectedRequest.serviceType}</span>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-600">조치 담당자 : </span>
                        <span className="text-sm">김기술</span>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-600">반려 의견 : </span>
                        <textarea
                          value={rejectionOpinion}
                          onChange={(e) => setRejectionOpinion(e.target.value)}
                          placeholder="배정 담당자 의견"
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex gap-3 py-4 px-6 border-t border-gray-200">
              {!showRejectionInAssignment ? (
                <>
                  <button
                    onClick={handleAssignmentApprove}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-all duration-200 button-smooth"
                  >
                    승인
                  </button>
                  <button
                    onClick={handleAssignmentReject}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium transition-all duration-200 button-smooth"
                  >
                    반려
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowRejectionInAssignment(false)}
                    className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 button-smooth"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleFinalReject}
                    className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-all duration-200 button-smooth"
                  >
                    최종 반려
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}


      {/* 정보확인 모달 */}
      {showInfoViewModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="assignment-confirm" size={24} className="mr-2" />
                정보 확인
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 - 2열 레이아웃 */}
            <div className="py-4 px-6">
              <div className="grid grid-cols-2 gap-6">
                {/* 왼쪽: 서비스신청정보 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="user" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">서비스신청정보</h3>
                  </div>
                  
                  <div className="space-y-0">
                    <div>
                      <span className="text-sm font-medium text-gray-600">신청번호: </span>
                      <span className="text-sm font-bold text-red-600">{selectedRequest.requestNumber}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">신청제목: </span>
                      <span className="text-sm">{selectedRequest.title}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">신청내용: </span>
                      <div className="text-sm mt-1 p-3 bg-gray-50 rounded text-gray-700 min-h-24 max-h-48 overflow-y-auto whitespace-pre-wrap">
                        {selectedRequest.content}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="user" size={14} className="mr-1" />
                        신청자: 
                      </span>
                      <span className="text-sm ml-5">{selectedRequest.requester} ({selectedRequest.department})</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="mail" size={14} className="mr-1" />
                        신청연락처: 
                      </span>
                      <span className="text-sm ml-5">{selectedRequest.contact}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="briefcase" size={14} className="mr-1" />
                        신청위치: 
                      </span>
                      <span className="text-sm ml-5">{selectedRequest.location}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="calendar" size={14} className="mr-1" />
                        신청일시: <span className="text-sm ml-1 text-black">{selectedRequest.requestDate} {selectedRequest.requestTime}</span>
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="message-square" size={14} className="mr-1" />
                        현재상태: 
                      </span>
                      <span className="text-sm ml-5 text-red-600 font-semibold">{selectedRequest.currentStatus}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">실제신청자: </span>
                      <span className="text-sm ml-5">{selectedRequest.actualRequester || selectedRequest.requester}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">실제연락처: </span>
                      <span className="text-sm ml-5">{selectedRequest.actualContact || selectedRequest.contact}</span>
                    </div>
                  </div>
                </div>

                {/* 오른쪽: 작업정보등록 (작업정보등록 버튼 클릭 시에만 표시) */}
                {showWorkRegistrationInInfo && (
                  <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center space-x-2 mb-4">
                      <Icon name="settings" size={20} className="text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-800">작업정보등록</h3>
                    </div>
                    
                    <div className="space-y-0 py-0">
                      {/* 배정 정보 */}
                      <div className="bg-gray-50 px-4 py-0 rounded-lg">
              <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium text-gray-600">배정일시 :</span>
                            <span className="text-sm text-gray-800 ml-2">{selectedRequest.assignDate || '2025.08.31 10:40'}</span>
                </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600">배정 담당자 :</span>
                            <span className="text-sm text-gray-800 ml-2">{selectedRequest.assignee || '이배정'}</span>
                </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600">서비스 조치 정보 :</span>
                            <span className="text-sm text-gray-800 ml-2">{selectedRequest.serviceType || '문제'}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600">조치담당자 :</span>
                            <span className="text-sm text-gray-800 ml-2">김기술</span>
              </div>
            </div>
          </div>


                      {/* 예정 조율 일시 */}
                      <div className={`px-4 py-0 rounded-lg border-2 ${currentStage === '예정' ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-600 mb-2">예정 조율 일시</label>
                            <input
                              type="datetime-local"
                              value={scheduledDate}
                              onChange={(e) => setScheduledDate(e.target.value)}
                              disabled={currentStage !== '예정'}
                              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                currentStage !== '예정' ? 'bg-gray-100 cursor-not-allowed' : ''
                              }`}
                            />
                          </div>
                          {currentStage === '예정' && (
                            <div className="flex items-center gap-2">
                              <Icon name="calendar" className="w-5 h-5 text-gray-400" />
            <button
                                onClick={handleScheduledProcess}
                                disabled={!scheduledDate}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                  scheduledDate
                                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                처리
                </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 작업 시작 일시 */}
                      <div className={`px-4 py-0 rounded-lg border-2 ${currentStage === '작업' ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-600 mb-2">작업 시작 일시</label>
                            <input
                              type="datetime-local"
                              value={workStartDate}
                              onChange={(e) => setWorkStartDate(e.target.value)}
                              disabled={currentStage !== '작업'}
                              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                currentStage !== '작업' ? 'bg-gray-100 cursor-not-allowed' : ''
                              }`}
                            />
                          </div>
                          {currentStage === '작업' && (
                            <div className="flex items-center gap-2">
                              <Icon name="calendar" className="w-5 h-5 text-gray-400" />
                <button
                                onClick={handleWorkStartProcess}
                                disabled={!workStartDate}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                  workStartDate
                                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                처리
                </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 작업 내역 및 완료 일시 */}
                      <div className={`px-4 py-0 rounded-lg border-2 ${currentStage === '완료' ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="space-y-0">
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">작업 내역</label>
                            <textarea
                              value={workContent}
                              onChange={(e) => setWorkContent(e.target.value)}
                              disabled={currentStage !== '완료'}
                              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                currentStage !== '완료' ? 'bg-gray-100 cursor-not-allowed' : ''
                              }`}
                              rows={3}
                              placeholder="작업 내용 입력"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">작업 완료 일시</label>
                            <input
                              type="datetime-local"
                              value={workCompleteDate}
                              onChange={(e) => setWorkCompleteDate(e.target.value)}
                              disabled={currentStage !== '완료'}
                              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                currentStage !== '완료' ? 'bg-gray-100 cursor-not-allowed' : ''
                              }`}
                            />
                          </div>
                          {currentStage === '완료' && (
                            <div className="flex justify-end">
                <button
                                onClick={handleWorkCompleteProcess}
                                disabled={!workContent || !workCompleteDate}
                                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                                  workContent && workCompleteDate
                                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                처리
                </button>
                            </div>
                          )}
                        </div>
            </div>

                      {/* 문제 사항 */}
                      <div className={`px-4 py-0 rounded-lg border-2 ${currentStage === '미결' ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-600 mb-2">문제 사항</label>
                            <textarea
                              value={problemIssue}
                              onChange={(e) => setProblemIssue(e.target.value)}
                              disabled={currentStage !== '미결'}
                              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                                currentStage !== '미결' ? 'bg-gray-100 cursor-not-allowed' : ''
                              }`}
                              rows={3}
                              placeholder="작업 중 발견 된 문제점 입력"
                            />
                        </div>
                          {currentStage === '미결' && (
                            <div className="flex items-start gap-2">
                              <button
                                onClick={handleUnresolvedProcess}
                                className="px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-pink-500 hover:bg-pink-600 text-white"
                              >
                                등재
                              </button>
                        </div>
                          )}
                      </div>
                        <div className="mt-3 flex items-center">
                          <input
                            type="checkbox"
                            id="unresolved"
                            checked={isUnresolved}
                            onChange={(e) => setIsUnresolved(e.target.checked)}
                            disabled={currentStage !== '미결'}
                            className={`mr-2 ${currentStage !== '미결' ? 'cursor-not-allowed' : ''}`}
                          />
                          <label htmlFor="unresolved" className={`text-sm font-medium ${
                            currentStage !== '미결' ? 'text-gray-400' : 'text-gray-700'
                          }`}>
                            미결 완료
                          </label>
                    </div>
                      </div>

                        </div>
                        </div>
                )}

                {/* 오른쪽: 빈 공간 (작업정보등록 버튼 클릭 전) */}
                {!showWorkRegistrationInInfo && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="settings" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">작업정보등록</h3>
                      </div>
                  
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">작업정보등록을 시작하려면</p>
                    <p className="text-gray-500 mb-6">하단 버튼을 클릭하세요</p>
                    </div>
                </div>
                )}
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex gap-3 py-4 px-6 border-t border-gray-200">
              {!showWorkRegistrationInInfo ? (
                <>
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                취소
              </button>
              <button
                    onClick={handleWorkRegistrationInInfo}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                작업 정보 등록
              </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowWorkRegistrationInInfo(false)}
                    className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 button-smooth"
                  >
                    뒤로가기
            </button>
            <button
              onClick={() => {
                      closeModal()
                      setShowWorkCompleteModal(true)
              }}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 button-smooth"
            >
                    작업 확인 완료
            </button>
                </>
              )}
                        </div>
                        </div>
                      </div>
      )}

      {/* 비밀번호 변경 모달 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="lock" size={24} className="mr-2" />
                비밀번호 변경
              </h2>
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setCurrentPassword('')
                  setNewPassword('')
                  setConfirmPassword('')
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
                    </div>

            {/* 모달 내용 */}
            <div className="py-4 px-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <Icon name="lock" size={16} className="mr-2" />
                  현재 비밀번호
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="현재 비밀번호를 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <Icon name="lock" size={16} className="mr-2" />
                  새 비밀번호
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="새 비밀번호를 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <Icon name="lock" size={16} className="mr-2" />
                  비밀번호 확인
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="새 비밀번호를 다시 입력하세요"
                />
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex gap-3 py-4 px-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setCurrentPassword('')
                  setNewPassword('')
                  setConfirmPassword('')
                }}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                취소
              </button>
              <button
                onClick={() => {
                  // 비밀번호 변경 로직
                  if (newPassword !== confirmPassword) {
                    alert('새 비밀번호가 일치하지 않습니다.')
                    return
                  }
                  if (newPassword.length < 8) {
                    alert('비밀번호는 8자 이상이어야 합니다.')
                    return
                  }
                  alert('비밀번호가 변경되었습니다.')
                  setShowPasswordModal(false)
                  setCurrentPassword('')
                  setNewPassword('')
                  setConfirmPassword('')
                }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                변경
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 정보변경 모달 */}
      {showInfoModal && !showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="user" size={24} className="mr-2" />
                회원 정보 수정
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="py-4 px-6 space-y-4">
              {/* 이메일 */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <Icon name="mail" size={16} className="mr-2" />
                  이메일
                </label>
                <input
                  type="email"
                  value={managerInfo.email}
                  onChange={(e) => setManagerInfo({...managerInfo, email: e.target.value})}
                  className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 성명 */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <Icon name="user" size={16} className="mr-2" />
                  성명
                </label>
                <input
                  type="text"
                  value={managerInfo.fullName}
                  onChange={(e) => setManagerInfo({...managerInfo, fullName: e.target.value})}
                  className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 직급 */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <Icon name="briefcase" size={16} className="mr-2" />
                  직급
                </label>
                <input
                  type="text"
                  value={managerInfo.position}
                  onChange={(e) => setManagerInfo({...managerInfo, position: e.target.value})}
                  className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 소속 */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <Icon name="briefcase" size={16} className="mr-2" />
                  소속
                </label>
                <input
                  type="text"
                  value={managerInfo.department}
                  onChange={(e) => setManagerInfo({...managerInfo, department: e.target.value})}
                  className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 연락처 */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <Icon name="mail" size={16} className="mr-2" />
                  연락처
                </label>
                <input
                  type="tel"
                  value={managerInfo.phone}
                  onChange={(e) => setManagerInfo({...managerInfo, phone: e.target.value})}
                  className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 비밀번호 변경 버튼 */}
              <div className="pt-4">
                <button 
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-all duration-200 button-smooth"
                >
                  비밀번호 변경
                </button>
              </div>

              {/* 생성일시 (읽기 전용) */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <Icon name="calendar" size={16} className="mr-2" />
                  생성일시
                </label>
                <input
                  type="text"
                  value={managerInfo.createDate}
                  readOnly
                  className="w-full px-3 py-1 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-end py-4 px-6 border-t border-gray-200">
              <button
                onClick={() => { 
                  setShowInfoModal(false); 
                  setShowInfoSuccessModal(true);
                  // 시스템 관리자 이름 업데이트 (성명에서 추출)
                  setManagerInfo({...managerInfo, name: managerInfo.fullName});
                }}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                회원정보 수정
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 정보수정 성공 모달 */}
      {showInfoSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="check-circle" size={24} className="mr-2 text-green-600" />
                수정 완료
              </h2>
              <button
                onClick={() => setShowInfoSuccessModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="py-6 px-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="check-circle" size={32} className="text-green-600" />
              </div>
              <p className="text-gray-600 mb-6">회원정보가 성공적으로 수정되었습니다.</p>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-end py-4 px-6 border-t border-gray-200">
              <button
                onClick={() => setShowInfoSuccessModal(false)}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 배정승인 성공 모달 */}
      {showApprovalSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="check-circle" size={24} className="mr-2 text-green-600" />
                승인 완료
              </h2>
              <button
                onClick={() => setShowApprovalSuccessModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="py-6 px-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="check-circle" size={32} className="text-green-600" />
              </div>
              <p className="text-gray-600 mb-6">배정 승인 되었습니다.</p>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-end py-4 px-6 border-t border-gray-200">
              <button
                onClick={() => setShowApprovalSuccessModal(false)}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 최종반려 성공 모달 */}
      {showRejectionSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="assignment-reject" size={24} className="mr-2 text-orange-600" />
                반려 완료
              </h2>
              <button
                onClick={() => setShowRejectionSuccessModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="py-6 px-6 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="assignment-reject" size={32} className="text-orange-600" />
              </div>
              <p className="text-gray-600 mb-6">배정 반려가 되었습니다.</p>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-end py-4 px-6 border-t border-gray-200">
              <button
                onClick={() => setShowRejectionSuccessModal(false)}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 작업정보등록 모달 */}
      {showWorkRegistrationModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="settings" size={24} className="mr-2" />
                작업정보등록
              </h2>
              <button
                onClick={() => setShowWorkRegistrationModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 - 2열 레이아웃 */}
            <div className="py-4 px-6">
              <div className="grid grid-cols-2 gap-6">
                {/* 왼쪽: 서비스신청정보 (읽기전용) */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="user" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">서비스신청정보</h3>
                  </div>
                  
                  <div className="space-y-0">
                    <div>
                      <span className="text-sm font-medium text-gray-600">신청번호: </span>
                      <span className="text-sm font-bold text-red-600">{selectedRequest.requestNumber}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">신청제목: </span>
                      <span className="text-sm">{selectedRequest.title}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">신청내용: </span>
                      <div className="text-sm mt-1 p-3 bg-gray-50 rounded text-gray-700 min-h-24 max-h-48 overflow-y-auto whitespace-pre-wrap">
                        {selectedRequest.content}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="user" size={14} className="mr-1" />
                        신청자: 
                      </span>
                      <span className="text-sm ml-5">{selectedRequest.requester} ({selectedRequest.department})</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="mail" size={14} className="mr-1" />
                        신청연락처: 
                      </span>
                      <span className="text-sm ml-5">{selectedRequest.contact}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="briefcase" size={14} className="mr-1" />
                        신청위치: 
                      </span>
                      <span className="text-sm ml-5">{selectedRequest.location}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="calendar" size={14} className="mr-1" />
                        신청일시: <span className="text-sm ml-1 text-black">{selectedRequest.requestDate} {selectedRequest.requestTime}</span>
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="message-square" size={14} className="mr-1" />
                        현재상태: 
                      </span>
                      <span className="text-sm ml-5 text-red-600 font-semibold">{selectedRequest.currentStatus}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">실제신청자: </span>
                      <span className="text-sm ml-5">{selectedRequest.actualRequester || selectedRequest.requester}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">실제연락처: </span>
                      <span className="text-sm ml-5">{selectedRequest.actualContact || selectedRequest.contact}</span>
                    </div>
                  </div>
                </div>

                {/* 오른쪽: 작업정보등록 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="settings" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">작업정보등록</h3>
                  </div>
                  
                  <div className="space-y-0">
                    {/* 배정정보 (읽기전용) */}
                    <div className="mb-4 p-3 bg-gray-50 rounded">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">배정정보</h4>
                      <div className="space-y-1 text-xs">
                        <div><span className="font-medium">배정일시:</span> {selectedRequest.assignDate || '2025.08.31 11:10'}</div>
                        <div><span className="font-medium">배정담당자:</span> {selectedRequest.assignee || '이배정'}</div>
                        <div><span className="font-medium">배정의견:</span> {selectedRequest.assignmentOpinion || '업무에 적합하여 배정'}</div>
                        <div><span className="font-medium">서비스유형:</span> {selectedRequest.serviceType}</div>
                        <div><span className="font-medium">조치담당자:</span> 김기술</div>
                      </div>
                    </div>

                    {/* 현재 단계 표시 */}
                    <div className="mb-4 p-2 bg-blue-50 rounded text-center">
                      <span className="text-sm font-medium text-blue-600">현재 단계: {currentStage}</span>
                    </div>

                    {/* 예정 단계 */}
                    {currentStage === '예정' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">예정조율일시</label>
                          <input
                            type="datetime-local"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <button
                          onClick={handleScheduledProcess}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-all duration-200"
                        >
                          처리
                        </button>
                      </div>
                    )}

                    {/* 작업 단계 */}
                    {currentStage === '작업' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">작업시작일시</label>
                          <input
                            type="datetime-local"
                            value={workStartDate}
                            onChange={(e) => setWorkStartDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <button
                          onClick={handleWorkStartProcess}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-all duration-200"
                        >
                          처리
                        </button>
                      </div>
                    )}

                    {/* 완료 단계 */}
                    {currentStage === '완료' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">작업내역</label>
                          <textarea
                            value={workContent}
                            onChange={(e) => setWorkContent(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="작업 내용을 입력하세요"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">작업완료일시</label>
                          <input
                            type="datetime-local"
                            value={workCompleteDate}
                            onChange={(e) => setWorkCompleteDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <button
                          onClick={handleWorkCompleteProcess}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-all duration-200"
                        >
                          처리
                        </button>
                      </div>
                    )}

                    {/* 미결 단계 */}
                    {currentStage === '미결' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">문제사항</label>
                          <textarea
                            value={problemIssue}
                            onChange={(e) => setProblemIssue(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="문제사항을 입력하세요"
                          />
                        </div>
                      <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="unresolved"
                            checked={isUnresolved}
                            onChange={(e) => setIsUnresolved(e.target.checked)}
                            className="mr-2"
                          />
                          <label htmlFor="unresolved" className="text-sm font-medium text-gray-700">
                            미해결완료
                          </label>
                        </div>
                        <button
                          onClick={handleUnresolvedProcess}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium transition-all duration-200"
                        >
                          등재
                        </button>
                        </div>
                    )}
                      </div>
                    </div>
              </div>
                </div>

            {/* 모달 하단 버튼 */}
            <div className="flex gap-3 py-4 px-6 border-t border-gray-200">
              <button
                onClick={() => setShowWorkRegistrationModal(false)}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 작업완료 모달 */}
      {showWorkCompleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="check-circle" size={24} className="mr-2 text-green-600" />
                작업 확인
              </h2>
              <button
                onClick={() => setShowWorkCompleteModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="py-6 px-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="check-circle" size={32} className="text-green-600" />
              </div>
              <p className="text-gray-600 mb-6">작업을 확인 하셨습니다.</p>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-end py-4 px-6 border-t border-gray-200">
              <button
                onClick={() => setShowWorkCompleteModal(false)}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 배정작업 모달 */}
      {showServiceAssignmentModal && selectedWorkRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="user" size={24} className="mr-2" />
                배정작업
              </h2>
              <button
                onClick={() => setShowServiceAssignmentModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="py-4 px-6">
              <div className="grid grid-cols-2 gap-6">
                {/* 서비스신청정보 */}
                      <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="user" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">서비스신청정보</h3>
                        </div>
                  
                  <div className="space-y-0">
                    <div>
                      <span className="text-sm font-medium text-gray-600">신청번호: </span>
                      <span className="text-sm font-bold text-red-600">{selectedWorkRequest.requestNumber}</span>
                        </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">신청제목: </span>
                      <span className="text-sm">{selectedWorkRequest.title}</span>
                        </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">신청내용: </span>
                      <div className="text-sm mt-1 p-2 bg-gray-50 rounded text-gray-700">
                        {selectedWorkRequest.content}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="user" size={14} className="mr-1" />
                        신청자: 
                      </span>
                      <span className="text-sm ml-5">{selectedWorkRequest.requester} ({selectedWorkRequest.department})</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="mail" size={14} className="mr-1" />
                        신청연락처: 
                      </span>
                      <span className="text-sm ml-5">{selectedWorkRequest.contact}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="briefcase" size={14} className="mr-1" />
                        신청위치: 
                      </span>
                      <span className="text-sm ml-5">{selectedWorkRequest.location}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="calendar" size={14} className="mr-1" />
                        신청일시: 
                      </span>
                      <span className="text-sm ml-5">{selectedWorkRequest.requestDate}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="message-square" size={14} className="mr-1" />
                        현재상태: 
                      </span>
                      <span className="text-sm ml-5">{selectedWorkRequest.currentStatus}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">실제신청자: </span>
                      <span className="text-sm ml-5">{selectedWorkRequest.requester}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">실제연락처: </span>
                      <span className="text-sm ml-5">{selectedWorkRequest.contact}</span>
                    </div>
                  </div>
                </div>

                {/* 배정정보 */}
                      <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="settings" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">배정정보</h3>
                        </div>
                  
                  <div className="space-y-0">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">조치담당 소속</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">부서를 선택하세요</option>
                        <option value="IT팀">IT팀</option>
                        <option value="운영팀">운영팀</option>
                        <option value="개발팀">개발팀</option>
                        <option value="보안팀">보안팀</option>
                        <option value="인사팀">인사팀</option>
                        <option value="재무팀">재무팀</option>
                      </select>
                        </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">조치담당자</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">담당자를 선택하세요</option>
                        <option value="김기술">김기술</option>
                        <option value="박기술">박기술</option>
                        <option value="홍기술">홍기술</option>
                        <option value="최기술">최기술</option>
                        <option value="정기술">정기술</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">배정의견</label>
                      <textarea 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                        placeholder="배정 담당자 의견"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                        <Icon name="calendar" size={16} className="mr-1" />
                        배정일시(현재)
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm">
                        {new Date().toLocaleString('ko-KR', { 
                          year: 'numeric', 
                          month: '2-digit', 
                          day: '2-digit', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">서비스 조치 유형</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="요청">요청</option>
                        <option value="장애">장애</option>
                        <option value="변경">변경</option>
                        <option value="문제">문제</option>
                        <option value="적용">적용</option>
                        <option value="구성">구성</option>
                        <option value="자산">자산</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-end py-4 px-6 border-t border-gray-200 space-x-3">
              <button
                onClick={() => setShowServiceAssignmentModal(false)}
                className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-all duration-200"
              >
                취소
              </button>
              <button
                onClick={() => {
                  alert('배정이 완료되었습니다.')
                  setShowServiceAssignmentModal(false)
                }}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200"
              >
                배정하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 재배정작업 모달 */}
      {showServiceReassignmentModal && selectedWorkRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="refresh" size={24} className="mr-2" />
                재배정작업
              </h2>
              <button
                onClick={() => setShowServiceReassignmentModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="py-4 px-6">
              <div className="grid grid-cols-2 gap-6">
                {/* 서비스신청정보 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="user" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">서비스신청정보</h3>
                  </div>
                  
                  <div className="space-y-0">
                    <div>
                      <span className="text-sm font-medium text-gray-600">신청번호: </span>
                      <span className="text-sm font-bold text-blue-600">{selectedWorkRequest.requestNumber}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">신청제목: </span>
                      <span className="text-sm">{selectedWorkRequest.title}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">신청내용: </span>
                      <div className="text-sm mt-1 p-2 bg-gray-50 rounded text-gray-700">
                        {selectedWorkRequest.content}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="user" size={14} className="mr-1" />
                        신청자: 
                          </span>
                      <span className="text-sm ml-5">{selectedWorkRequest.requester} ({selectedWorkRequest.department})</span>
                        </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="mail" size={14} className="mr-1" />
                        신청연락처: 
                      </span>
                      <span className="text-sm ml-5">{selectedWorkRequest.contact}</span>
                      </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="briefcase" size={14} className="mr-1" />
                        신청위치: 
                      </span>
                      <span className="text-sm ml-5">{selectedWorkRequest.location}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="calendar" size={14} className="mr-1" />
                        신청일시: 
                      </span>
                      <span className="text-sm ml-5">{selectedWorkRequest.requestDate}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="message-square" size={14} className="mr-1" />
                        현재상태: 
                      </span>
                      <span className="text-sm ml-5">{selectedWorkRequest.currentStatus}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">실제신청자: </span>
                      <span className="text-sm ml-5">{selectedWorkRequest.requester}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">실제연락처: </span>
                      <span className="text-sm ml-5">{selectedWorkRequest.contact}</span>
                    </div>
                  </div>
                </div>

                {/* 재배정정보 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="settings" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">재배정정보</h3>
                  </div>
                  
                  <div className="space-y-0">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">조치담당 소속</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">부서를 선택하세요</option>
                        <option value="IT팀">IT팀</option>
                        <option value="운영팀">운영팀</option>
                        <option value="개발팀">개발팀</option>
                        <option value="보안팀">보안팀</option>
                        <option value="인사팀">인사팀</option>
                        <option value="재무팀">재무팀</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">조치담당자</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">담당자를 선택하세요</option>
                        <option value="김기술">김기술</option>
                        <option value="박기술">박기술</option>
                        <option value="홍기술">홍기술</option>
                        <option value="최기술">최기술</option>
                        <option value="정기술">정기술</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">재배정의견</label>
                      <textarea 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                        placeholder="배정 담당자 의견"
                      />
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="calendar" size={14} className="mr-1" />
                        재배정일시(현재): 
                      </span>
                      <span className="text-sm ml-5">
                        {new Date().toLocaleString('ko-KR', { 
                          year: 'numeric', 
                          month: '2-digit', 
                          day: '2-digit', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">서비스 조치 유형</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="구성">구성</option>
                        <option value="요청">요청</option>
                        <option value="장애">장애</option>
                        <option value="변경">변경</option>
                        <option value="문제">문제</option>
                        <option value="적용">적용</option>
                        <option value="자산">자산</option>
                      </select>
                    </div>
                    
                    {/* 이전 배정 정보 */}
                    <div className="border-t pt-3 mt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">이전 배정 정보</h4>
                      
                      <div className="space-y-0">
                        <div>
                          <span className="text-xs font-medium text-gray-500">전) 배정일시: </span>
                          <span className="text-xs ml-2">{selectedWorkRequest.assignTime || '2025.08.31 11:40'}</span>
                        </div>
                        
                        <div>
                          <span className="text-xs font-medium text-gray-500">전) 배정담당자: </span>
                          <span className="text-xs ml-2">이배정 (관리팀)</span>
                        </div>
                        
                        <div>
                          <span className="text-xs font-medium text-gray-500">전) 배정의견: </span>
                          <span className="text-xs ml-2">업무에 적합하여 배정</span>
                        </div>
                        
                        <div>
                          <span className="text-xs font-medium text-gray-500">전) 조치담당자: </span>
                          <span className="text-xs ml-2">{selectedWorkRequest.assignee || '홍기술'}</span>
                        </div>
                        
                        <div>
                          <span className="text-xs font-medium text-red-600">반려의견: </span>
                          <span className="text-xs ml-2 text-red-600">금일 휴가 입니다.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-end py-4 px-6 border-t border-gray-200 space-x-3">
              <button
                onClick={() => setShowServiceReassignmentModal(false)}
                className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-all duration-200"
              >
                취소
              </button>
              <button
                onClick={() => {
                  alert('재배정이 완료되었습니다.')
                  setShowServiceReassignmentModal(false)
                }}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-all duration-200"
              >
                재배정하기
              </button>
            </div>
                </div>
              </div>
            )}

      {/* 작업정보관리 모달 */}
      {showServiceWorkInfoModal && selectedWorkRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="settings" size={24} className="mr-2" />
                작업정보관리
              </h2>
              <button
                onClick={() => setShowServiceWorkInfoModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 - 2열 레이아웃 */}
            <div className="py-4 px-6">
              <div className="grid grid-cols-2 gap-6">
                {/* 왼쪽: 서비스신청정보 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="user" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">서비스신청정보</h3>
                  </div>
                  
                  <div className="space-y-0">
                    <div>
                      <span className="text-sm font-medium text-gray-600">신청번호: </span>
                      <span className="text-sm font-bold text-red-600">{selectedWorkRequest.requestNumber}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">신청제목: </span>
                      <span className="text-sm">{selectedWorkRequest.title}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">신청내용: </span>
                      <div className="text-sm mt-1 p-3 bg-gray-50 rounded text-gray-700 min-h-24 max-h-48 overflow-y-auto whitespace-pre-wrap">
                        {selectedWorkRequest.content}
                    </div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="user" size={14} className="mr-1" />
                        신청자: 
                      </span>
                      <span className="text-sm ml-5">{selectedWorkRequest.requester} ({selectedWorkRequest.department})</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="mail" size={14} className="mr-1" />
                        신청연락처: 
                      </span>
                      <span className="text-sm ml-5">{selectedWorkRequest.contact}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="briefcase" size={14} className="mr-1" />
                        신청위치: 
                      </span>
                      <span className="text-sm ml-5">{selectedWorkRequest.location}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="calendar" size={14} className="mr-1" />
                        신청일시: <span className="text-sm ml-1 text-black">{selectedWorkRequest.requestDate} {selectedWorkRequest.requestTime}</span>
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="message-square" size={14} className="mr-1" />
                        현재상태: 
                      </span>
                      <span className="text-sm ml-5 text-red-600 font-semibold">{selectedWorkRequest.currentStatus}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">실제신청자: </span>
                      <span className="text-sm ml-5">{selectedWorkRequest.actualRequester || selectedWorkRequest.requester}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">실제연락처: </span>
                      <span className="text-sm ml-5">{selectedWorkRequest.actualContact || selectedWorkRequest.contact}</span>
                    </div>
                  </div>
                </div>

                {/* 오른쪽: 작업정보등록 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="settings" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">작업정보등록</h3>
                    </div>
                  
                  <div className="space-y-0 py-0">
                    {/* 배정 정보 */}
                    <div className="bg-gray-50 px-4 py-0 rounded-lg">
                      <div className="space-y-2">
                    <div>
                          <span className="text-sm font-medium text-gray-600">배정일시 :</span>
                          <span className="text-sm text-gray-800 ml-2">{selectedWorkRequest.assignDate || '2025.08.31 10:40'}</span>
                    </div>
                    <div>
                          <span className="text-sm font-medium text-gray-600">배정 담당자 :</span>
                          <span className="text-sm text-gray-800 ml-2">{selectedWorkRequest.assignee || '이배정'}</span>
                    </div>
                    <div>
                          <span className="text-sm font-medium text-gray-600">서비스 조치 정보 :</span>
                          <span className="text-sm text-gray-800 ml-2">{selectedWorkRequest.serviceType || '문제'}</span>
                    </div>
                    <div>
                          <span className="text-sm font-medium text-gray-600">조치담당자 :</span>
                          <span className="text-sm text-gray-800 ml-2">김기술</span>
                    </div>
                      </div>
                    </div>

                    {/* 예정 조율 일시 */}
                    <div className={`px-4 py-0 rounded-lg border-2 ${(serviceWorkCurrentStage === '예정' || serviceWorkCurrentStage === '완료' || serviceWorkCurrentStage === '미결') ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-center gap-4">
                      <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-600 mb-2">예정 조율 일시</label>
                      <input
                        type="datetime-local"
                            value={serviceWorkScheduledDate}
                            onChange={(e) => setServiceWorkScheduledDate(e.target.value)}
                            disabled={serviceWorkCurrentStage !== '예정' && serviceWorkCurrentStage !== '완료' && serviceWorkCurrentStage !== '미결'}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              (serviceWorkCurrentStage !== '예정' && serviceWorkCurrentStage !== '완료' && serviceWorkCurrentStage !== '미결') ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                        />
                      </div>
                        {serviceWorkCurrentStage === '예정' && (
                          <div className="flex items-center gap-2">
                            <Icon name="calendar" className="w-5 h-5 text-gray-400" />
                            <button
                              onClick={() => {
                                if (serviceWorkScheduledDate) {
                                  setServiceWorkCurrentStage('작업')
                                  // 작업시작일시에 현재 시점 자동 설정 (한국 시간)
                                  const now = new Date()
                                  const kstOffset = 9 * 60 // 한국은 UTC+9
                                  const kstTime = new Date(now.getTime() + (kstOffset * 60 * 1000))
                                  const formattedNow = kstTime.toISOString().slice(0, 16)
                                  setServiceWorkStartDate(formattedNow)
                                  alert('예정조율일시가 등록되었습니다. 작업 단계로 진행합니다.')
                                } else {
                                  alert('예정조율일시를 입력해주세요.')
                                }
                              }}
                              disabled={!serviceWorkScheduledDate}
                              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                serviceWorkScheduledDate
                                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              처리
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 작업 시작 일시 */}
                    <div className={`px-4 py-0 rounded-lg border-2 ${(serviceWorkCurrentStage === '작업' || serviceWorkCurrentStage === '완료' || serviceWorkCurrentStage === '미결') ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-600 mb-2">작업 시작 일시</label>
                      <input
                        type="datetime-local"
                            value={serviceWorkStartDate}
                            onChange={(e) => setServiceWorkStartDate(e.target.value)}
                            disabled={serviceWorkCurrentStage !== '작업' && serviceWorkCurrentStage !== '완료' && serviceWorkCurrentStage !== '미결'}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              (serviceWorkCurrentStage !== '작업' && serviceWorkCurrentStage !== '완료' && serviceWorkCurrentStage !== '미결') ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                      />
                    </div>
                        {serviceWorkCurrentStage === '작업' && (
                          <div className="flex items-center gap-2">
                            <Icon name="calendar" className="w-5 h-5 text-gray-400" />
                            <button
                          onClick={() => {
                                if (serviceWorkStartDate) {
                                  setServiceWorkCurrentStage('완료')
                                  // 작업완료일시에 현재 시점 자동 설정 (한국 시간)
                                  const now = new Date()
                                  const kstOffset = 9 * 60 // 한국은 UTC+9
                                  const kstTime = new Date(now.getTime() + (kstOffset * 60 * 1000))
                                  const formattedNow = kstTime.toISOString().slice(0, 16)
                                  setServiceWorkCompleteDate(formattedNow)
                                  alert('작업이 시작되었습니다. 완료 단계로 진행합니다.')
                                } else {
                                  alert('작업시작일시를 입력해주세요.')
                                }
                              }}
                              disabled={!serviceWorkStartDate}
                              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                serviceWorkStartDate
                                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              처리
                            </button>
                      </div>
                        )}
                    </div>
                  </div>

                    {/* 작업 내역 및 완료 일시 */}
                    <div className={`px-4 py-0 rounded-lg border-2 ${(serviceWorkCurrentStage === '완료' || serviceWorkCurrentStage === '미결') ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="space-y-0">
                    <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2">작업 내역</label>
                      <textarea
                            value={serviceWorkContent}
                            onChange={(e) => setServiceWorkContent(e.target.value)}
                            disabled={serviceWorkCurrentStage !== '완료' && serviceWorkCurrentStage !== '미결'}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              (serviceWorkCurrentStage !== '완료' && serviceWorkCurrentStage !== '미결') ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                        rows={3}
                            placeholder="작업 내용 입력"
                          />
                    </div>
                    <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2">작업 완료 일시</label>
                      <input
                        type="datetime-local"
                            value={serviceWorkCompleteDate}
                            onChange={(e) => setServiceWorkCompleteDate(e.target.value)}
                            disabled={serviceWorkCurrentStage !== '완료' && serviceWorkCurrentStage !== '미결'}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              (serviceWorkCurrentStage !== '완료' && serviceWorkCurrentStage !== '미결') ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                      />
                    </div>
                        {serviceWorkCurrentStage === '완료' && (
                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                if (serviceWorkContent && serviceWorkCompleteDate) {
                                  setServiceWorkCurrentStage('미결')
                                  alert('작업이 완료되었습니다. 미결 처리 단계로 진행합니다.')
                                } else {
                                  alert('작업내역과 작업완료일시를 모두 입력해주세요.')
                                }
                              }}
                              disabled={!serviceWorkContent || !serviceWorkCompleteDate}
                              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                                serviceWorkContent && serviceWorkCompleteDate
                                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              처리
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* 문제 사항 */}
                    <div className={`px-4 py-0 rounded-lg border-2 ${serviceWorkCurrentStage === '미결' ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-600 mb-2">문제 사항</label>
                      <textarea
                            value={serviceWorkProblemIssue}
                            onChange={(e) => setServiceWorkProblemIssue(e.target.value)}
                            disabled={serviceWorkCurrentStage !== '미결'}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                              serviceWorkCurrentStage !== '미결' ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                        rows={3}
                            placeholder="작업 중 발견 된 문제점 입력"
                          />
                    </div>
                        {serviceWorkCurrentStage === '미결' && (
                          <div className="flex items-start gap-2">
                            <button
                              onClick={() => {
                                if (serviceWorkProblemIssue) {
                                  alert('미결 처리가 완료되었습니다.')
                                  setServiceWorkCurrentStage('미결완료')
                                } else {
                                  alert('문제사항을 입력해주세요.')
                                }
                              }}
                              className="px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-pink-500 hover:bg-pink-600 text-white"
                            >
                              등재
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 flex items-center">
                      <input
                        type="checkbox"
                          id="serviceWorkUnresolved"
                          checked={serviceWorkIsUnresolved}
                          onChange={(e) => setServiceWorkIsUnresolved(e.target.checked)}
                          disabled={serviceWorkCurrentStage !== '미결'}
                          className={`mr-2 ${serviceWorkCurrentStage !== '미결' ? 'cursor-not-allowed' : ''}`}
                        />
                        <label htmlFor="serviceWorkUnresolved" className={`text-sm font-medium ${
                          serviceWorkCurrentStage !== '미결' ? 'text-gray-400' : 'text-gray-700'
                        }`}>
                          미결 완료
                        </label>
                    </div>
                      
                    </div>

                  </div>
                  </div>
                </div>
              </div>

              {/* 모달 하단 버튼 */}
            <div className="flex gap-3 py-4 px-6 border-t border-gray-200">
                <button
                  onClick={() => setShowServiceWorkInfoModal(false)}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 button-smooth"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    setShowServiceWorkInfoModal(false);
                  setShowServiceWorkCompleteModal(true);
                  }}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 button-smooth"
                >
                  수정완료
                </button>
            </div>
          </div>
        </div>
      )}

      {/* 작업정보삭제 모달 */}
      {showServiceWorkDeleteModal && selectedWorkRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="trash" size={24} className="mr-2 text-red-600" />
                작업정보삭제
              </h2>
              <button
                onClick={() => setShowServiceWorkDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="py-6 px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 시스템 관리 정보 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="user" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">서비스신청정보</h3>
                  </div>
                  
                  <div className="space-y-0">
                    <div>
                      <span className="text-sm font-medium text-gray-600">신청번호: </span>
                      <span className="text-sm font-bold text-red-600">{selectedWorkRequest.requestNumber}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">신청제목: </span>
                      <span className="text-sm">{selectedWorkRequest.title}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">신청내용: </span>
                      <div className="text-sm mt-1 p-3 bg-gray-50 rounded text-gray-700 min-h-24 max-h-48 overflow-y-auto whitespace-pre-wrap">
                        {selectedWorkRequest.content}
                    </div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="user" size={14} className="mr-1" />
                        신청자: 
                                </span>
                      <span className="text-sm ml-5">{selectedWorkRequest.requester} ({selectedWorkRequest.department})</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="mail" size={14} className="mr-1" />
                        신청연락처: 
                      </span>
                      <span className="text-sm ml-5">{selectedWorkRequest.contact}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="briefcase" size={14} className="mr-1" />
                        신청위치: 
                      </span>
                      <span className="text-sm ml-5">{selectedWorkRequest.location}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="calendar" size={14} className="mr-1" />
                        신청일시: <span className="text-sm ml-1 text-black">{selectedWorkRequest.requestDate} {selectedWorkRequest.requestTime}</span>
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="message-square" size={14} className="mr-1" />
                        현재상태: 
                      </span>
                      <span className="text-sm ml-5 text-red-600 font-semibold">{selectedWorkRequest.currentStatus}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">실제신청자: </span>
                      <span className="text-sm ml-5">{selectedWorkRequest.actualRequester || selectedWorkRequest.requester}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">실제연락처: </span>
                      <span className="text-sm ml-5">{selectedWorkRequest.actualContact || selectedWorkRequest.contact}</span>
                    </div>
                  </div>
                </div>

                {/* 작업정보등록 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="settings" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">작업정보등록</h3>
                  </div>
                  
                  <div className="space-y-0 py-0">
                    {/* 배정 정보 */}
                    <div className="bg-gray-50 px-4 py-0 rounded-lg">
                      <div className="space-y-2">
                    <div>
                          <span className="text-sm font-medium text-gray-600">배정일시 :</span>
                          <span className="text-sm ml-2">{selectedWorkRequest.assignDate || '2025.08.31 10:40'}</span>
                    </div>
                    <div>
                          <span className="text-sm font-medium text-gray-600">배정담당자 :</span>
                          <span className="text-sm ml-2">{selectedWorkRequest.assignee || '이배정'}</span>
                    </div>
                    <div>
                          <span className="text-sm font-medium text-gray-600">배정의견 :</span>
                          <span className="text-sm ml-2">{selectedWorkRequest.assignmentOpinion || '업무에 적합하여 배정'}</span>
                    </div>
                    <div>
                          <span className="text-sm font-medium text-gray-600">서비스유형 :</span>
                          <span className="text-sm ml-2">{selectedWorkRequest.serviceType}</span>
                    </div>
                    <div>
                          <span className="text-sm font-medium text-gray-600">조치담당자 :</span>
                          <span className="text-sm ml-2">김기술</span>
                    </div>
                      </div>
                    </div>

                    {/* 예정 조율 일시 */}
                    <div className="bg-gray-50 px-4 py-0 rounded-lg">
                      <div className="space-y-2">
                    <div>
                          <span className="text-sm font-medium text-gray-600">예정조율일시 :</span>
                          <span className="text-sm ml-2">{selectedWorkRequest.scheduledDate || '2025.08.31 15:00'}</span>
                    </div>
                      </div>
                    </div>

                    {/* 작업 시작 일시 */}
                    <div className="bg-gray-50 px-4 py-0 rounded-lg">
                      <div className="space-y-2">
                    <div>
                          <span className="text-sm font-medium text-gray-600">작업시작일시 :</span>
                          <span className="text-sm ml-2">{selectedWorkRequest.workStartDate || '2025.09.01 15:00'}</span>
                    </div>
                      </div>
                    </div>

                    {/* 작업 내역 및 완료 일시 */}
                    <div className="bg-gray-50 px-4 py-0 rounded-lg">
                      <div className="space-y-2">
                    <div>
                          <span className="text-sm font-medium text-gray-600">작업내역 :</span>
                          <div className="text-sm mt-1 p-2 bg-white rounded border text-gray-700 min-h-16 max-h-32 overflow-y-auto whitespace-pre-wrap">
                            {selectedWorkRequest.workContent || '작업 내용 수정'}
                          </div>
                    </div>
                    <div>
                          <span className="text-sm font-medium text-gray-600">작업완료일시 :</span>
                          <span className="text-sm ml-2">{selectedWorkRequest.workCompleteDate || '2025.08.31 15:00'}</span>
                    </div>
                      </div>
                    </div>

                    {/* 문제 사항 */}
                    <div className="bg-gray-50 px-4 py-0 rounded-lg">
                      <div className="space-y-2">
                    <div>
                          <span className="text-sm font-medium text-gray-600">문제사항 :</span>
                          <div className="text-sm mt-1 p-2 bg-white rounded border text-gray-700 min-h-16 max-h-32 overflow-y-auto whitespace-pre-wrap">
                            {selectedWorkRequest.problemIssue || '작업 중 발견된 문제점 수정'}
                          </div>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                            id="unresolved-delete-display"
                        className="mr-2"
                            checked={selectedWorkRequest.isUnresolved || false}
                        readOnly
                      />
                          <label htmlFor="unresolved-delete-display" className="text-sm font-medium text-gray-600">
                            미결완료
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 삭제 확인 메시지 */}
              <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <div className="text-red-800">
                    <p className="font-medium">⚠️ 작업정보를 삭제하시겠습니까?</p>
                    <p className="text-sm mt-1">삭제된 작업정보는 복구할 수 없습니다.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 모달 하단 버튼 */}
            <div className="flex gap-3 py-4 px-6 border-t border-gray-200">
                <button
                  onClick={() => setShowServiceWorkDeleteModal(false)}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 button-smooth"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    if (confirm('정말로 삭제하시겠습니까?')) {
                      setShowServiceWorkDeleteModal(false);
                    setShowServiceWorkDeleteCompleteModal(true);
                      // 삭제 완료 로직
                    }
                  }}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200 button-smooth"
                >
                  삭제하기
                </button>
              </div>
          </div>
        </div>
      )}

      {/* 작업정보수정 완료 모달 */}
      {showServiceWorkCompleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="check-circle" size={24} className="mr-2 text-green-600" />
                수정 완료
              </h2>
              <button
                onClick={() => setShowServiceWorkCompleteModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="py-6 px-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="check-circle" size={32} className="text-green-600" />
              </div>
              <p className="text-gray-600 mb-6">작업정보가 성공적으로 수정되었습니다.</p>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-end py-4 px-6 border-t border-gray-200">
              <button
                onClick={() => setShowServiceWorkCompleteModal(false)}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 작업정보삭제 완료 모달 */}
      {showServiceWorkDeleteCompleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="check-circle" size={24} className="mr-2 text-green-600" />
                삭제 완료
              </h2>
              <button
                onClick={() => setShowServiceWorkDeleteCompleteModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="py-6 px-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="check-circle" size={32} className="text-green-600" />
              </div>
              <p className="text-gray-600 mb-6">작업정보가 성공적으로 삭제되었습니다.</p>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-end py-4 px-6 border-t border-gray-200">
              <button
                onClick={() => setShowServiceWorkDeleteCompleteModal(false)}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 자주하는 질문 관리 프레임 - 시스템관리에서는 제거됨 */}
      {false && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-hidden">
            {/* 프레임 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="help-circle" size={24} className="mr-2 text-blue-600" />
                자주하는 질문 관리
              </h2>
              <button
                onClick={() => setShowFAQManagement(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 프레임 내용 */}
            <div className="p-6 overflow-y-auto" style={{maxHeight: 'calc(90vh - 120px)'}}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* FAQ 카드들 */}
                {(() => {
                  // FAQ 데이터 (일반사용자 페이지와 동일)
                  const faqs = [
                    {
                      id: '1',
                      icon: '📧',
                      summary: '이메일 접속 불가',
                      content: '이메일 서비스에 접속할 수 없는 경우 발생하는 문제입니다.',
                      category: '이메일',
                      solution: '1. 브라우저 캐시 및 쿠키 삭제\n2. 다른 브라우저로 시도\n3. 네트워크 연결 상태 확인',
                      persistentIssue: '위 방법으로 해결되지 않으면 IT팀에 문의해 주세요!'
                    },
                    {
                      id: '2',
                      icon: '📤',
                      summary: '파일 업로드 오류',
                      content: '파일 업로드 시 오류가 발생하는 경우입니다.',
                      category: '파일서버'
                    },
                    {
                      id: '3',
                      icon: '🔒',
                      summary: '네트워크 연결 오류',
                      content: '네트워크 연결이 되지 않은 경우 발생하는 문제입니다.',
                      category: '네트워크'
                    },
                    {
                      id: '4',
                      icon: '🌐',
                      summary: '웹사이트 접속 불가',
                      content: '내부 웹사이트에 접속할 수 없는 경우입니다.',
                      category: '웹서비스'
                    },
                    {
                      id: '5',
                      icon: '🖨️',
                      summary: '프린터 인쇄 오류',
                      content: '프린터 인쇄가 되지 않는 경우입니다.',
                      category: '하드웨어',
                      solution: '1. 프린터 전원 및 연결 상태 확인\n2. 프린터 드라이버 재설치\n3. 프린터 큐 초기화',
                      persistentIssue: '위 방법으로 해결되지 않으면 하드웨어 담당자에게 연락해 주세요!'
                    },
                    {
                      id: '6',
                      icon: '💻',
                      summary: '소프트웨어 설치',
                      content: '새로운 소프트웨어 설치 요청입니다.',
                      category: '소프트웨어'
                    },
                    {
                      id: '7',
                      icon: '🖥️',
                      summary: '컴퓨터 느림 현상',
                      content: '컴퓨터가 갑자기 느려지는 현상입니다.',
                      category: '성능'
                    },
                    {
                      id: '8',
                      icon: '🔐',
                      summary: '비밀번호 초기화',
                      content: '시스템 로그인 비밀번호를 잊어버린 경우입니다.',
                      category: '보안'
                    },
                    {
                      id: '9',
                      icon: '📱',
                      summary: '모바일 앱 오류',
                      content: '모바일 애플리케이션에서 오류가 발생하는 경우입니다.',
                      category: '모바일'
                    },
                    {
                      id: '10',
                      icon: '🔧',
                      summary: '시스템 오류',
                      content: '시스템에서 예상치 못한 오류가 발생하는 경우입니다.',
                      category: '시스템'
                    },
                    {
                      id: '11',
                      icon: '💾',
                      summary: '데이터 백업',
                      content: '중요한 데이터를 백업하는 방법입니다.',
                      category: '데이터'
                    },
                    {
                      id: '12',
                      icon: '🌍',
                      summary: '원격 접속 오류',
                      content: '원격 접속 시 발생하는 문제입니다.',
                      category: '원격접속'
                    }
                  ]

                  // 페이지네이션 로직
                  const faqItemsPerPage = 6
                  const totalPages = Math.ceil(faqs.length / faqItemsPerPage)
                  const currentFAQs = faqs.slice(
                    (faqCurrentPage - 1) * faqItemsPerPage,
                    faqCurrentPage * faqItemsPerPage
                  )

                  return (
                    <>
                      {currentFAQs.map((faq) => (
                        <div
                          key={faq.id}
                          className="bg-white rounded-xl cursor-pointer hover:shadow-2xl transition-all duration-500 ease-out transform hover:scale-105 flex flex-col h-full border-2 border-gray-200 hover:border-blue-300"
                          style={{padding: '20px 30px'}}
                          onClick={() => {
                            setSelectedFAQ(faq)
                            setShowFAQEditModal(true)
                          }}
                        >
                          <div className="text-left mb-5 flex-1" style={{paddingTop: '15px'}}>
                            <div className="mb-3 text-center" style={{fontSize: '36px'}}>{faq.icon}</div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">
                              {faq.summary}
                            </h3>
                            <p className="text-gray-600 leading-relaxed mb-4 line-clamp-2 overflow-hidden">
                              {faq.content}
                            </p>
                          </div>
                          <div className="flex justify-between items-center mt-auto">
                            <span className="text-sm px-4 rounded-full bg-blue-100 text-blue-800 font-medium" style={{paddingTop: '0px', paddingBottom: '0px'}}>
                              {faq.category}
                            </span>
                                <div className="flex space-x-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation(); // 이벤트 버블링 방지
                                  setSelectedFAQ(faq);
                                  setShowFAQEditModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                수정
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation(); // 이벤트 버블링 방지
                                  if (confirm('이 FAQ를 삭제하시겠습니까?')) {
                                    // 삭제 로직 추가
                                    alert('FAQ가 삭제되었습니다.');
                                    // FAQ 관리 프레임은 유지 (닫지 않음)
                                  }
                                }}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                삭제
                              </button>
                                </div>
                          </div>
                        </div>
                          ))}
                    </>
                  )
                })()}
                    </div>

              {/* 페이지네이션 */}
              {(() => {
                const faqs = [
                  { id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }, { id: '6' },
                  { id: '7' }, { id: '8' }, { id: '9' }, { id: '10' }, { id: '11' }, { id: '12' }
                ]
                const faqItemsPerPage = 6
                const totalPages = Math.ceil(faqs.length / faqItemsPerPage)
                
                return totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-4 mt-8">
                    <button
                      onClick={() => setFaqCurrentPage(Math.max(1, faqCurrentPage - 1))}
                      disabled={faqCurrentPage === 1}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-all duration-300 ease-out button-smooth"
                    >
                      이전
                    </button>
                    <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                      {faqCurrentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setFaqCurrentPage(Math.min(totalPages, faqCurrentPage + 1))}
                      disabled={faqCurrentPage === totalPages}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-all duration-300 ease-out button-smooth"
                    >
                      다음
                    </button>
                  </div>
                )
              })()}
            </div>

            {/* 프레임 하단 버튼 */}
            <div className="flex justify-between items-center py-4 px-6 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowFAQAddModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-out button-smooth flex items-center space-x-2"
                >
                  <Icon name="plus" size={16} />
                  <span>질문 추가</span>
                </button>
              </div>
              <div className="flex items-center space-x-4">
                {(() => {
                  const faqs = [
                    { id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }, { id: '6' },
                    { id: '7' }, { id: '8' }, { id: '9' }, { id: '10' }, { id: '11' }, { id: '12' }
                  ]
                  const faqItemsPerPage = 6
                  const totalPages = Math.ceil(faqs.length / faqItemsPerPage)
                  return (
                    <span className="text-sm text-gray-500">{faqCurrentPage} / {totalPages} 페이지</span>
                  )
                })()}
                <button
                  onClick={() => setShowFAQManagement(false)}
                  className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 button-smooth"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
              </div>
            )}

      {/* FAQ 수정 모달 - 시스템관리에서는 제거됨 */}
      {false && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-2xl font-bold text-gray-800">자주하는 질문-수정</h2>
              <button
                onClick={() => setShowFAQEditModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
                  </div>
                  
            {/* 모달 내용 */}
            <div className="p-6 overflow-y-auto" style={{maxHeight: 'calc(90vh - 120px)'}}>
              {/* 아이콘 섹션 */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex flex-col items-center space-y-4">
                  <div className="text-6xl">{selectedFAQ?.icon || '📧'}</div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-out button-smooth">
                    Icon 변경
                  </button>
                </div>
              </div>

              {/* 입력 필드들 */}
              <div className="space-y-6">
                {/* 발생 원인 요약 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-0">
                    발생 원인 요약
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedFAQ?.summary || ''}
                    className="w-full px-4 py-0 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="발생 원인 요약을 입력하세요"
                  />
                </div>

                {/* 발생 원인 내용 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-0">
                    발생 원인 내용
                  </label>
                  <textarea
                    defaultValue={selectedFAQ?.content || ''}
                    rows={3}
                    className="w-full px-4 py-0 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="발생 원인 내용을 입력하세요"
                  />
                </div>

                {/* 즉시 해결방법 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-0">
                    즉시 해결방법
                  </label>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <textarea
                      defaultValue={selectedFAQ?.solution || "1. 브라우저 캐시 및 쿠키 삭제\n2. 다른 브라우저로 시도\n3. 네트워크 연결 상태 확인"}
                      rows={4}
                      className="w-full px-4 py-0 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                      placeholder="즉시 해결방법을 입력하세요"
                    />
                  </div>
                </div>

                {/* 문제가 지속될 경우 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-0">
                    문제가 지속될 경우
                  </label>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <textarea
                      defaultValue={selectedFAQ?.persistentIssue || "위 방법으로 해결되지 않으면 아래 서비스 신청 해 주세요!"}
                      rows={2}
                      className="w-full px-4 py-0 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 bg-white"
                      placeholder="문제가 지속될 경우 안내를 입력하세요"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-center items-center py-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowFAQEditModal(false)
                  setShowFAQCompleteModal(true)
                  // 수정 로직 추가
                }}
                className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 ease-out button-smooth"
              >
                수정
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ 추가 모달 - 시스템관리에서는 제거됨 */}
      {false && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-2xl font-bold text-gray-800">자주하는 질문-추가</h2>
              <button
                onClick={() => setShowFAQAddModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="p-6 overflow-y-auto" style={{maxHeight: 'calc(90vh - 120px)'}}>
              {/* 아이콘 섹션 */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex flex-col items-center space-y-4">
                  <div className="text-6xl">📧</div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-out button-smooth">
                    Icon 변경
                  </button>
                </div>
              </div>

              {/* 입력 필드들 */}
              <div className="space-y-6">
                {/* 발생 원인 요약 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-0">
                    발생 원인 요약
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-0 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="발생 원인 요약을 입력하세요"
                  />
                </div>

                {/* 발생 원인 내용 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-0">
                    발생 원인 내용
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-0 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="발생 원인 내용을 입력하세요"
                  />
                </div>

                {/* 즉시 해결방법 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-0">
                    즉시 해결방법
                  </label>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <textarea
                      rows={4}
                      className="w-full px-4 py-0 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                      placeholder="즉시 해결방법을 입력하세요"
                    />
                  </div>
                </div>

                {/* 문제가 지속될 경우 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-0">
                    문제가 지속될 경우
                  </label>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <textarea
                      rows={2}
                      className="w-full px-4 py-0 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 bg-white"
                      placeholder="문제가 지속될 경우 안내를 입력하세요"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-center items-center py-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowFAQAddModal(false)
                  setShowFAQCompleteModal(true)
                  // 추가 로직 추가
                }}
                className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 ease-out button-smooth"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ 완료 모달 - 시스템관리에서는 제거됨 */}
      {false && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="check-circle" size={24} className="mr-2 text-green-600" />
                완료
              </h2>
              <button
                onClick={() => setShowFAQCompleteModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="py-6 px-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="check-circle" size={32} className="text-green-600" />
              </div>
              <p className="text-gray-600 mb-6">FAQ가 성공적으로 처리되었습니다.</p>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-end py-4 px-6 border-t border-gray-200">
              <button
                onClick={() => setShowFAQCompleteModal(false)}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 일반문의 List 관리 프레임 */}
      {showGeneralInquiryList && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-hidden">
            {/* 프레임 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    setGeneralInquiryCurrentPage(1);
                    setShowUnansweredOnly(false);
                    const oneWeekAgo = new Date()
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
                    setGeneralInquirySearchStartDate(oneWeekAgo.toISOString().split('T')[0]);
                    setGeneralInquirySearchEndDate(new Date().toISOString().split('T')[0]);
                  }}
                  className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <Icon name="refresh" size={16} />
                </button>
                <h2 className="text-xl font-bold text-gray-800">일반 문의 답변</h2>
              </div>
              <button
                onClick={() => setShowGeneralInquiryList(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 검색 및 필터 영역 */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  {/* 날짜 선택 */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="date"
                      value={generalInquirySearchStartDate}
                      onChange={(e) => setGeneralInquirySearchStartDate(e.target.value)}
                      className="px-3 py-2 border-2 border-gray-400 rounded-lg text-sm font-medium bg-white shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                    <span className="text-gray-600 font-medium">~</span>
                    <input
                      type="date"
                      value={generalInquirySearchEndDate}
                      onChange={(e) => setGeneralInquirySearchEndDate(e.target.value)}
                      className="px-3 py-2 border-2 border-gray-400 rounded-lg text-sm font-medium bg-white shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                
                {/* 미답변만조회 토글 - 우측 끝 배치 */}
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700">미답변만조회</span>
                  <button
                    onClick={() => setShowUnansweredOnly(!showUnansweredOnly)}
                    className={`w-8 h-4 rounded-full transition-colors ${
                      showUnansweredOnly ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  >
                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                      showUnansweredOnly ? 'translate-x-4' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* 테이블 영역 */}
            <div className="flex-1 overflow-hidden">
              <div className="overflow-x-auto overflow-y-auto px-4" style={{height: '450px'}}>
                <table className="w-full text-sm">
                  <thead className="sticky top-0" style={{backgroundColor: '#FFD4D4'}}>
                    <tr>
                      <th className="px-2 py-2 text-center text-sm font-bold text-red-600">문의일시</th>
                      <th className="px-2 py-2 text-center text-sm font-bold text-red-600">문의제목</th>
                      <th className="px-2 py-2 text-center text-sm font-bold text-red-600">문의자</th>
                      <th className="px-2 py-2 text-center text-sm font-bold text-red-600">답변일시</th>
                      <th className="px-2 py-2 text-center text-sm font-bold text-red-600">답변자</th>
                      <th className="px-2 py-2 text-center text-sm font-bold text-red-600">관리</th>
                        </tr>
                      </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(() => {
                      // 일반문의 데이터 (페이지네이션 테스트를 위해 더 많은 데이터 추가)
                      const inquiries = [
                        {
                          id: '1',
                          inquiryDate: '2025.08.31 14:00',
                          title: '모니터 전원 문의',
                          inquirer: '홍길순',
                          answerDate: '2025.08.31 15:00',
                          answerer: '이배정',
                          content: '모니터에 전원이 들어오지 않습니다.',
                          answerContent: '모니터 전원 케이블를 한번 더 꼽아 주세요! 모니터 전원 버튼을 켜 주십시요 이상과 같이 조치가 되지 않을 따는 서비스 신청 해 주세요!'
                        },
                        {
                          id: '2',
                          inquiryDate: '2025.08.31 13:00',
                          title: '네트워크 문의',
                          inquirer: '김영자',
                          answerDate: '',
                          answerer: '',
                          content: '네트워크 연결이 안 됩니다.'
                        },
                        {
                          id: '3',
                          inquiryDate: '2025.08.31 12:00',
                          title: '프린터 드라이버 업데이트',
                          inquirer: '이영희',
                          answerDate: '',
                          answerer: '',
                          content: '프린터 드라이버를 최신 버전으로 업데이트하고 싶습니다.'
                        },
                        {
                          id: '4',
                          inquiryDate: '2025.08.31 11:00',
                          title: '이메일 문의',
                          inquirer: '박달자',
                          answerDate: '2025.08.31 12:00',
                          answerer: '이배정',
                          content: '이메일 접속이 안 됩니다.',
                          answerContent: '이메일 계정 설정을 확인해 주세요. 비밀번호를 재설정하고 다시 시도해 보세요.'
                        },
                        {
                          id: '5',
                          inquiryDate: '2025.08.31 10:00',
                          title: '소프트웨어 설치 요청',
                          inquirer: '최민수',
                          answerDate: '',
                          answerer: '',
                          content: '새로운 소프트웨어를 설치하고 싶습니다.'
                        },
                        {
                          id: '6',
                          inquiryDate: '2025.08.31 09:30',
                          title: '키보드 고장 문의',
                          inquirer: '정수진',
                          answerDate: '2025.08.31 10:30',
                          answerer: '김기술',
                          content: '키보드가 작동하지 않습니다.',
                          answerContent: '키보드 연결을 확인하고, 다른 포트에 연결해 보세요. 문제가 지속되면 교체가 필요합니다.'
                        },
                        {
                          id: '7',
                          inquiryDate: '2025.08.31 09:00',
                          title: '웹사이트 접속 불가',
                          inquirer: '강지훈',
                          answerDate: '',
                          answerer: '',
                          content: '내부 웹사이트에 접속할 수 없습니다.'
                        },
                        {
                          id: '8',
                          inquiryDate: '2025.08.30 16:30',
                          title: '마우스 반응 지연',
                          inquirer: '윤서연',
                          answerDate: '2025.08.30 17:00',
                          answerer: '이배정',
                          content: '마우스가 느리게 반응합니다.',
                          answerContent: '마우스 드라이버를 업데이트하고, USB 포트를 변경해 보세요.'
                        },
                        {
                          id: '9',
                          inquiryDate: '2025.08.30 15:00',
                          title: '폴더 권한 문의',
                          inquirer: '송현우',
                          answerDate: '',
                          answerer: '',
                          content: '특정 폴더에 접근할 수 없습니다.'
                        },
                        {
                          id: '10',
                          inquiryDate: '2025.08.30 14:00',
                          title: '인쇄 대기열 오류',
                          inquirer: '임지영',
                          answerDate: '2025.08.30 14:30',
                          answerer: '김기술',
                          content: '프린터 대기열에 오류가 발생했습니다.',
                          answerContent: '인쇄 대기열을 초기화하고 프린터를 재시작해 주세요.'
                        },
                        {
                          id: '11',
                          inquiryDate: '2025.08.30 13:00',
                          title: '시스템 업데이트 문의',
                          inquirer: '박준호',
                          answerDate: '',
                          answerer: '',
                          content: '시스템 업데이트가 필요한지 확인하고 싶습니다.'
                        },
                        {
                          id: '12',
                          inquiryDate: '2025.08.30 12:00',
                          title: '백업 시스템 문의',
                          inquirer: '한소영',
                          answerDate: '2025.08.30 12:30',
                          answerer: '이배정',
                          content: '백업 시스템이 정상 작동하는지 확인해 주세요.',
                          answerContent: '백업 시스템을 점검한 결과 정상 작동하고 있습니다. 일정한 시간에 자동 백업이 진행됩니다.'
                        }
                      ];

                      // 필터링된 데이터
                      let filteredInquiries = inquiries;
                      
                      // 미 답변만 조회 필터
                      if (showUnansweredOnly) {
                        filteredInquiries = inquiries.filter(inquiry => !inquiry.answerDate);
                      }

                      // 날짜 필터링 (간단한 예시)
                      const startDate = new Date(generalInquirySearchStartDate);
                      const endDate = new Date(generalInquirySearchEndDate);
                      filteredInquiries = filteredInquiries.filter(inquiry => {
                        const inquiryDate = new Date(inquiry.inquiryDate);
                        return inquiryDate >= startDate && inquiryDate <= endDate;
                      });

                      // 페이지네이션
                      const inquiryItemsPerPage = 10;
                      const totalPages = Math.ceil(filteredInquiries.length / inquiryItemsPerPage);
                      const startIndex = (generalInquiryCurrentPage - 1) * inquiryItemsPerPage;
                      const endIndex = startIndex + inquiryItemsPerPage;
                      const currentInquiries = filteredInquiries.slice(startIndex, endIndex);

                      return (
                        <>
                          {currentInquiries.map((inquiry) => (
                            <tr key={inquiry.id} className="hover:bg-gray-50">
                              <td className="px-2 py-2 text-gray-900 text-center">{inquiry.inquiryDate}</td>
                              <td className="px-2 py-2 text-gray-900">{inquiry.title}</td>
                              <td className="px-2 py-2 text-gray-900 text-center">{inquiry.inquirer}</td>
                              <td className="px-2 py-2 text-gray-900 text-center">{inquiry.answerDate || '-'}</td>
                              <td className="px-2 py-2 text-gray-900 text-center">
                                <div className="flex items-center justify-center">
                                  {inquiry.answerer && <Icon name="lock" size={16} className="text-gray-400 mr-1" />}
                                  {inquiry.answerer || '-'}
                                </div>
                            </td>
                              <td className="px-2 py-2 text-center">
                                <div className="flex justify-center space-x-2">
                                  {inquiry.answerDate ? (
                                    <>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedInquiry(inquiry);
                                          setShowGeneralInquiryEditModal(true);
                                        }}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                      >
                                        수정
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedInquiry(inquiry);
                                          setShowGeneralInquiryDeleteModal(true);
                                        }}
                                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                                      >
                                        삭제
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedInquiry(inquiry);
                                        setShowGeneralInquiryReplyModal(true);
                                      }}
                                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                                    >
                                      답변하기
                                    </button>
                                  )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        </>
                      );
                    })()}
                      </tbody>
                    </table>
                  </div>

              {/* 페이지네이션 */}
              {(() => {
                // 동일한 데이터와 필터링 로직 사용
                const inquiries = [
                  { id: '1', inquiryDate: '2025.08.31 14:00', title: '모니터 전원 문의', inquirer: '홍길순', answerDate: '2025.08.31 15:00', answerer: '이배정' },
                  { id: '2', inquiryDate: '2025.08.31 13:00', title: '네트워크 문의', inquirer: '김영자', answerDate: '', answerer: '' },
                  { id: '3', inquiryDate: '2025.08.31 12:00', title: '프린터 드라이버 업데이트', inquirer: '이영희', answerDate: '', answerer: '' },
                  { id: '4', inquiryDate: '2025.08.31 11:00', title: '이메일 문의', inquirer: '박달자', answerDate: '2025.08.31 12:00', answerer: '이배정' },
                  { id: '5', inquiryDate: '2025.08.31 10:00', title: '소프트웨어 설치 요청', inquirer: '최민수', answerDate: '', answerer: '' },
                  { id: '6', inquiryDate: '2025.08.31 09:30', title: '키보드 고장 문의', inquirer: '정수진', answerDate: '2025.08.31 10:30', answerer: '김기술' },
                  { id: '7', inquiryDate: '2025.08.31 09:00', title: '웹사이트 접속 불가', inquirer: '강지훈', answerDate: '', answerer: '' },
                  { id: '8', inquiryDate: '2025.08.30 16:30', title: '마우스 반응 지연', inquirer: '윤서연', answerDate: '2025.08.30 17:00', answerer: '이배정' },
                  { id: '9', inquiryDate: '2025.08.30 15:00', title: '폴더 권한 문의', inquirer: '송현우', answerDate: '', answerer: '' },
                  { id: '10', inquiryDate: '2025.08.30 14:00', title: '인쇄 대기열 오류', inquirer: '임지영', answerDate: '2025.08.30 14:30', answerer: '김기술' },
                  { id: '11', inquiryDate: '2025.08.30 13:00', title: '시스템 업데이트 문의', inquirer: '박준호', answerDate: '', answerer: '' },
                  { id: '12', inquiryDate: '2025.08.30 12:00', title: '백업 시스템 문의', inquirer: '한소영', answerDate: '2025.08.30 12:30', answerer: '이배정' }
                ];
                
                let filteredInquiries = inquiries;
                if (showUnansweredOnly) {
                  filteredInquiries = inquiries.filter(inquiry => !inquiry.answerDate);
                }
                
                // 날짜 필터링
                const startDate = new Date(generalInquirySearchStartDate);
                const endDate = new Date(generalInquirySearchEndDate);
                filteredInquiries = filteredInquiries.filter(inquiry => {
                  const inquiryDate = new Date(inquiry.inquiryDate);
                  return inquiryDate >= startDate && inquiryDate <= endDate;
                });
                
                const totalPages = Math.ceil(filteredInquiries.length / 10);
                
                return totalPages > 1 ? (
                  <div className="flex justify-center mt-4 pt-4 pb-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setGeneralInquiryCurrentPage(Math.max(1, generalInquiryCurrentPage - 1))}
                        disabled={generalInquiryCurrentPage === 1}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        이전
                      </button>
                      <span className="px-2 py-1 bg-blue-500 text-white rounded text-xs">
                        {generalInquiryCurrentPage}/{totalPages}
                      </span>
                      <button 
                        onClick={() => setGeneralInquiryCurrentPage(Math.min(totalPages, generalInquiryCurrentPage + 1))}
                        disabled={generalInquiryCurrentPage >= totalPages}
                        className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        다음
                      </button>
                </div>
                  </div>
                ) : null;
              })()}
            </div>
          </div>
        </div>
      )}

      {/* 답변하기 프레임 */}
      {showGeneralInquiryReplyModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="message-square" size={24} className="mr-2 text-green-600" />
                답변 하기
              </h2>
              <button
                onClick={() => setShowGeneralInquiryReplyModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
                  </div>
                  
            {/* 모달 내용 */}
            <div className="py-6 px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 문의 정보 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="user" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">문의 정보</h3>
                    </div>
                  
                  <div className="space-y-0">
                    <div>
                      <span className="text-sm font-medium text-gray-600">문의 일시: </span>
                      <span className="text-sm">{selectedInquiry.inquiryDate}</span>
                  </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">문의자: </span>
                      <span className="text-sm">{selectedInquiry.inquirer}</span>
                </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">문의 내용: </span>
                      <div className="text-sm mt-1 p-3 bg-gray-50 rounded text-gray-700 min-h-24 max-h-48 overflow-y-auto whitespace-pre-wrap">
                        {selectedInquiry.content}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 답변 작성 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="edit" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">답변 하기</h3>
                  </div>
                  
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                        답변 내용
                        </label>
                      <textarea
                        rows={8}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="답변 내용을 입력하세요"
                        defaultValue="네트워크 케이블이 정확히 꼽혀 있는지 확인 해 주세요!"
                      />
                          </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">답변자: </span>
                      <span className="text-sm">이배정 (관리팀)</span>
                          </div>
                          </div>
                        </div>
                      </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex gap-3 py-4 px-6 border-t border-gray-200">
              <button
                onClick={() => setShowGeneralInquiryReplyModal(false)}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setShowGeneralInquiryReplyModal(false);
                  // 답변 완료 로직 추가
                  alert('답변이 완료되었습니다.');
                }}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                답변 하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 답변수정하기 프레임 */}
      {showGeneralInquiryEditModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="edit" size={24} className="mr-2 text-blue-600" />
                답변 수정하기
              </h2>
              <button
                onClick={() => setShowGeneralInquiryEditModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="py-6 px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 문의 정보 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="user" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">문의 정보</h3>
                  </div>
                  
                  <div className="space-y-0">
                      <div>
                      <span className="text-sm font-medium text-gray-600">문의 일시: </span>
                      <span className="text-sm">{selectedInquiry.inquiryDate}</span>
                      </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">문의자: </span>
                      <span className="text-sm">{selectedInquiry.inquirer}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">문의 내용: </span>
                      <div className="text-sm mt-1 p-3 bg-gray-50 rounded text-gray-700 min-h-24 max-h-48 overflow-y-auto whitespace-pre-wrap">
                        {selectedInquiry.content}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 답변 수정 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="edit" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">답변 수정</h3>
                  </div>
                  
                  <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                        답변 내용
                        </label>
                      <textarea
                        rows={8}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="답변 내용을 입력하세요"
                        defaultValue={selectedInquiry.answerContent || "모니터 전원 케이블를 한번 더 꼽아 주세요! 모니터 전원 버튼을 켜 주십시요 이상과 같이 조치가 되지 않을 따는 서비스 신청 해 주세요!"}
                      />
                      </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">답변자: </span>
                      <span className="text-sm">이배정 (관리팀)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex gap-3 py-4 px-6 border-t border-gray-200">
              <button
                onClick={() => setShowGeneralInquiryEditModal(false)}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setShowGeneralInquiryEditModal(false);
                  // 수정 완료 로직 추가
                  alert('답변이 수정되었습니다.');
                }}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                수정 하기
              </button>
            </div>
          </div>
              </div>
            )}

      {/* 답변삭제하기 프레임 */}
      {showGeneralInquiryDeleteModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="trash" size={24} className="mr-2 text-red-600" />
                답변 삭제하기
              </h2>
              <button
                onClick={() => setShowGeneralInquiryDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="py-6 px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 문의 정보 */}
                    <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="user" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">문의 정보</h3>
                  </div>
                  
                  <div className="space-y-0">
                      <div>
                      <span className="text-sm font-medium text-gray-600">문의 일시: </span>
                      <span className="text-sm">{selectedInquiry.inquiryDate}</span>
                      </div>
                    
                      <div>
                      <span className="text-sm font-medium text-gray-600">문의자: </span>
                      <span className="text-sm">{selectedInquiry.inquirer}</span>
                      </div>
                    
                      <div>
                      <span className="text-sm font-medium text-gray-600">문의 내용: </span>
                      <div className="text-sm mt-1 p-3 bg-gray-50 rounded text-gray-700 min-h-24 max-h-48 overflow-y-auto whitespace-pre-wrap">
                        {selectedInquiry.content}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 답변 정보 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="edit" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">답변 정보</h3>
                  </div>
                  
                  <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                        답변 내용
                        </label>
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 min-h-32 max-h-48 overflow-y-auto whitespace-pre-wrap">
                        {selectedInquiry.answerContent || "모니터 전원 케이블를 한번 더 꼽아 주세요! 모니터 전원 버튼을 켜 주십시요 이상과 같이 조치가 되지 않을 따는 서비스 신청 해 주세요!"}
                          </div>
                          </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">답변자: </span>
                      <span className="text-sm">이배정 (관리팀)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

            {/* 모달 하단 버튼 */}
            <div className="flex gap-3 py-4 px-6 border-t border-gray-200">
              <button
                onClick={() => setShowGeneralInquiryDeleteModal(false)}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setShowGeneralInquiryDeleteModal(false);
                  // 삭제 완료 로직 추가
                  alert('답변이 삭제되었습니다.');
                }}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                삭제 하기
              </button>
            </div>
          </div>
              </div>
            )}

      {/* 애니메이션 스타일 */}
      <style jsx>{`
        @keyframes slideInLeft {
          0% {
            opacity: 0;
            transform: translateX(-100px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInBottom {
          0% {
            opacity: 0;
            transform: translateY(100px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInRight {
          0% {
            opacity: 0;
            transform: translateX(100px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
          </div>
  )
}

export default function SystemAdminPage() {
  return (
    <PermissionGuard requiredPath="/system-admin">
      <SystemAdminPageContent />
    </PermissionGuard>
  )
}
