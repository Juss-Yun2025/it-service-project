"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/ui/Icon'

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
}

interface PendingWork {
  id: string
  technician: string
  lastWeekPending: number
  longTermPending: number
}

export default function ServiceManagerPage() {
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
  const [showServiceAssignmentModal, setShowServiceAssignmentModal] = useState(false)
  const [showServiceReassignmentModal, setShowServiceReassignmentModal] = useState(false)
  const [showServiceWorkInfoModal, setShowServiceWorkInfoModal] = useState(false)
  const [showServiceWorkDeleteModal, setShowServiceWorkDeleteModal] = useState(false)
  const [selectedWorkRequest, setSelectedWorkRequest] = useState<ServiceRequest | null>(null)
  const [serviceWorkSearchStartDate, setServiceWorkSearchStartDate] = useState('')
  const [serviceWorkSearchEndDate, setServiceWorkSearchEndDate] = useState('')
  const [showServiceIncompleteOnly, setShowServiceIncompleteOnly] = useState(false)
  const [serviceWorkSelectedDepartment, setServiceWorkSelectedDepartment] = useState('IT팀')
  const [serviceWorkCurrentPage, setServiceWorkCurrentPage] = useState(1)
  
  // 관리매니저 정보 상태
  const [managerInfo, setManagerInfo] = useState({
    name: '황매니저',
    email: 'service@itsm.com',
    fullName: '황기술',
    position: '대리',
    department: 'IT팀',
    phone: '010-1234-5678',
    createDate: '2024-01-15 09:00:00'
  })
  const [showPendingWork, setShowPendingWork] = useState(true)
  const [showServiceAggregation, setShowServiceAggregation] = useState(true)
  const [showGeneralInquiryStatus, setShowGeneralInquiryStatus] = useState(true)
  const [selectedDepartment, setSelectedDepartment] = useState('IT팀')
  const [currentDepartment, setCurrentDepartment] = useState('IT팀')
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

  // 검색 기간 기본값 설정 (2025-08-31)
  useEffect(() => {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    setSearchStartDate(todayStr)
    setSearchEndDate(todayStr)
  }, [])

  // 서비스 요청 데이터
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([
    {
      id: '1',
      requestNumber: 'SR-20250831-007',
      title: '모니터 전원 불량',
      status: '진행중',
      currentStatus: '부분불능',
      requestDate: '2025.08.31',
      requestTime: '09:30',
      requester: '김영자',
      department: '운영팀',
      stage: '배정',
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
      stage: '배정',
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
      stage: '배정',
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
      currentStatus: '부분불능',
      requestDate: '2025.08.31',
      requester: '오늘신청',
      department: '긴급팀',
      stage: '배정',
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
    }
  ])

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

  // 페이지네이션
  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage)

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
          backgroundImage: "url('/image/배경_관리매니저_페이지.jpg')",
          opacity: 1.0
        }}
      />

      {/* 헤더 */}
      <div className="relative z-20">
        <div className="flex justify-between items-center p-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Icon name="laptop" size={24} className="text-white" />
                </div>
            <div>
              <h1 className="text-3xl font-bold text-white">IT Service Management</h1>
              <p className="text-gray-300 text-sm">통합 IT 서비스 관리 시스템</p>
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
            <div className="px-20 py-0 rounded-full -ml-72 smooth-hover animate-fade-in shadow-lg" style={{backgroundColor: '#D4B8F9', marginLeft: '-310px'}}>
              <span className="text-purple-800 font-medium" style={{fontSize: '14px'}}>관리매니저 ({managerInfo.name})</span>
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
                  <h3 className="text-lg font-bold text-gray-800">서비스선택</h3>
                </div>

                {/* 3가지 관리 항목 */}
                <div className="flex justify-center items-center gap-4 h-full">
                  {/* 서비스 작업 List 관리 - 좌측에서 날아오는 애니메이션 */}
                  <div 
                    onClick={() => setShowServiceWorkList(true)}
                    className="bg-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-700 hover:scale-105 transition-all duration-300 ease-in-out flex flex-col items-start justify-start animate-slide-in-left"
                    style={{
                      backgroundImage: `url('/image/선택_서비스작업List관리.jpg')`,
                      backgroundSize: '400px',
                      backgroundPosition: 'center',
                      width: '300px',
                      height: '400px',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 10px 20px rgba(0, 0, 0, 0.3), 0 0 0 3px rgba(255, 255, 255, 0.3)',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      animation: 'slideInLeft 0.8s ease-out forwards',
                      opacity: 0,
                      transform: 'translateX(-100px)'
                    }}
                  >
                    <div className="text-left">
                      <Icon name="laptop" size={48} className="text-white mb-4" />
                      <h4 className="text-white font-bold text-lg">서비스 작업 List 관리</h4>
                    </div>
                  </div>

                  {/* 자주하는 질문 관리 - 아래쪽에서 날아오는 애니메이션 */}
                  <div 
                    className="bg-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-700 hover:scale-105 transition-all duration-300 ease-in-out flex flex-col items-start justify-start animate-slide-in-bottom"
                    style={{
                      backgroundImage: `url('/image/선택_자주하는질문관리.jpg')`,
                      backgroundSize: '750px',
                      backgroundPosition: 'center',
                      width: '300px',
                      height: '400px',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 10px 20px rgba(0, 0, 0, 0.3), 0 0 0 3px rgba(255, 255, 255, 0.3)',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      animation: 'slideInBottom 0.8s ease-out 0.2s forwards',
                      opacity: 0,
                      transform: 'translateY(100px)'
                    }}
                  >
                    <div className="text-left">
                      <Icon name="help-circle" size={48} className="text-white mb-4" />
                      <h4 className="text-white font-bold text-lg">자주하는 질문 관리</h4>
                    </div>
                  </div>

                  {/* 일반문의 List 관리 - 우측에서 날아오는 애니메이션 */}
                  <div 
                    className="bg-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-700 hover:scale-105 transition-all duration-300 ease-in-out flex flex-col items-start justify-start animate-slide-in-right"
                    style={{
                      backgroundImage: `url('/image/선택_일반문의List관리.jpg')`,
                      backgroundSize: '600px',
                      backgroundPosition: 'center',
                      width: '300px',
                      height: '400px',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 10px 20px rgba(0, 0, 0, 0.3), 0 0 0 3px rgba(255, 255, 255, 0.3)',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      animation: 'slideInRight 0.8s ease-out 0.4s forwards',
                      opacity: 0,
                      transform: 'translateX(100px)'
                    }}
                  >
                    <div className="text-left">
                      <Icon name="message-square" size={48} className="text-white mb-4" />
                      <h4 className="text-white font-bold text-lg">일반문의 List 관리</h4>
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
                      <button
                        onClick={() => setShowServiceIncompleteOnly(!showServiceIncompleteOnly)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          showServiceIncompleteOnly 
                            ? 'bg-pink-500 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        미결 완료 조회
                      </button>
                      
                      <select
                        value={serviceWorkSelectedDepartment}
                        onChange={(e) => setServiceWorkSelectedDepartment(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="IT팀">IT팀</option>
                        <option value="운영팀">운영팀</option>
                        <option value="개발팀">개발팀</option>
                        <option value="인사팀">인사팀</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="date"
                        value={serviceWorkSearchStartDate}
                        onChange={(e) => setServiceWorkSearchStartDate(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-500">~</span>
                      <input
                        type="date"
                        value={serviceWorkSearchEndDate}
                        onChange={(e) => setServiceWorkSearchEndDate(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 테이블 영역 */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">신청번호</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">신청시간</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">신청제목</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">현재상태</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">신청자</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">신청소속</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">배정시간</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">단계</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">조치자</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">조치소속</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">관리</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {serviceRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-blue-600 font-medium">{request.requestNumber}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{request.requestTime || '13:00'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{request.title}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.currentStatus === '정상작동' ? 'bg-green-100 text-green-800' :
                              request.currentStatus === '부분장애' ? 'bg-yellow-100 text-yellow-800' :
                              request.currentStatus === '전체장애' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {request.currentStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{request.requester}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{request.department}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{request.assignTime || '13:10'}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center">
                              {request.stage === '접수' && <Icon name="user" size={16} className="text-blue-500" />}
                              {request.stage === '배정' && <Icon name="check" size={16} className="text-green-500" />}
                              {request.stage === '진행중' && <Icon name="settings" size={16} className="text-yellow-500" />}
                              {request.stage === '완료' && <Icon name="check-circle" size={16} className="text-green-500" />}
                              {request.stage === '재배정' && <Icon name="x" size={16} className="text-red-500" />}
                              <span className="ml-1 text-gray-900">{request.stage}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{request.assignee || '김기술'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{request.assigneeDepartment || 'IT팀'}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex space-x-2">
                              {request.stage === '접수' && (
                                <button
                                  onClick={() => {
                                    setSelectedWorkRequest(request);
                                    setShowServiceAssignmentModal(true);
                                  }}
                                  className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                                >
                                  배정작업
                                </button>
                              )}
                              {request.stage === '재배정' && (
                                <button
                                  onClick={() => {
                                    setSelectedWorkRequest(request);
                                    setShowServiceReassignmentModal(true);
                                  }}
                                  className="px-3 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600 transition-colors"
                                >
                                  재배정작업
                                </button>
                              )}
                              {(request.stage === '배정' || request.stage === '진행중' || request.stage === '완료') && (
                                <>
                                  <button
                                    onClick={() => {
                                      setSelectedWorkRequest(request);
                                      setShowServiceWorkInfoModal(true);
                                    }}
                                    className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                                  >
                                    수정
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedWorkRequest(request);
                                      setShowServiceWorkDeleteModal(true);
                                    }}
                                    className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
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

                {/* 페이징 */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setServiceWorkCurrentPage(Math.max(1, serviceWorkCurrentPage - 1))}
                      disabled={serviceWorkCurrentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      이전
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-700">
                      {serviceWorkCurrentPage}/1
                    </span>
                    <button
                      onClick={() => setServiceWorkCurrentPage(serviceWorkCurrentPage + 1)}
                      className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                    >
                      다음
                    </button>
                  </div>
                </div>
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
          <p className="text-sm">ⓒ 2025 IT 서비스 관리 시스템. 모든권리는 Juss 가 보유</p>
        </div>
      </footer>

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
                    <h3 className="text-lg font-semibold text-gray-800">서비스 신청 정보</h3>
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
                  // 관리매니저 이름 업데이트 (성명에서 추출)
                  setManagerInfo({...managerInfo, name: managerInfo.fullName.replace('기술', '매니저')});
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
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="user-plus" size={24} className="mr-2" />
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
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 서비스 신청 정보 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">서비스 신청 정보</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">신청번호</label>
                      <div className="text-blue-600 font-medium">{selectedWorkRequest.requestNumber}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">신청제목</label>
                      <div className="text-gray-900">{selectedWorkRequest.title}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">신청내용</label>
                      <div className="text-gray-900">{selectedWorkRequest.content}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">신청자</label>
                      <div className="text-gray-900">{selectedWorkRequest.requester} ({selectedWorkRequest.department})</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">신청연락처</label>
                      <div className="text-gray-900">{selectedWorkRequest.contact}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">신청위치</label>
                      <div className="text-gray-900">{selectedWorkRequest.location}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">신청일시</label>
                      <div className="text-gray-900">{selectedWorkRequest.requestDate}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">현재상태</label>
                      <div className="text-gray-900">{selectedWorkRequest.currentStatus}</div>
                    </div>
                  </div>
                </div>

                {/* 배정정보 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">배정정보</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">부서</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="IT팀">IT팀</option>
                        <option value="운영팀">운영팀</option>
                        <option value="개발팀">개발팀</option>
                        <option value="인사팀">인사팀</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">담당자</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="김기술">김기술</option>
                        <option value="이배정">이배정</option>
                        <option value="박담당">박담당</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">배정 의견</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="배정 의견을 입력하세요"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">배정 일시(현재)</label>
                      <div className="text-gray-900">{new Date().toLocaleString('ko-KR')}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">서비스 조치 유형</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="요청">요청</option>
                        <option value="문제">문제</option>
                        <option value="변경">변경</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* 모달 하단 버튼 */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowServiceAssignmentModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    setShowServiceAssignmentModal(false);
                    // 배정 완료 로직
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  배정하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 재배정작업 모달 */}
      {showServiceReassignmentModal && selectedWorkRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="refresh-cw" size={24} className="mr-2" />
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
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 서비스 신청 정보 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">서비스 신청 정보</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">신청번호</label>
                      <div className="text-blue-600 font-medium">{selectedWorkRequest.requestNumber}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">신청제목</label>
                      <div className="text-gray-900">{selectedWorkRequest.title}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">신청내용</label>
                      <div className="text-gray-900">{selectedWorkRequest.content}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">신청자</label>
                      <div className="text-gray-900">{selectedWorkRequest.requester} ({selectedWorkRequest.department})</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">신청연락처</label>
                      <div className="text-gray-900">{selectedWorkRequest.contact}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">신청위치</label>
                      <div className="text-gray-900">{selectedWorkRequest.location}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">신청일시</label>
                      <div className="text-gray-900">{selectedWorkRequest.requestDate}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">현재상태</label>
                      <div className="text-gray-900">{selectedWorkRequest.currentStatus}</div>
                    </div>
                  </div>
                </div>

                {/* 재배정정보 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">재배정정보</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">부서</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="IT팀">IT팀</option>
                        <option value="운영팀">운영팀</option>
                        <option value="개발팀">개발팀</option>
                        <option value="인사팀">인사팀</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">담당자</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="김기술">김기술</option>
                        <option value="이배정">이배정</option>
                        <option value="박담당">박담당</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">재배정 의견</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="재배정 의견을 입력하세요"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">재배정 일시(현재)</label>
                      <div className="text-gray-900">{new Date().toLocaleString('ko-KR')}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">서비스 조치 유형</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="요청">요청</option>
                        <option value="문제">문제</option>
                        <option value="변경">변경</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* 모달 하단 버튼 */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowServiceReassignmentModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    setShowServiceReassignmentModal(false);
                    // 재배정 완료 로직
                  }}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  재배정하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 작업정보관리 모달 */}
      {showServiceWorkInfoModal && selectedWorkRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200">
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

            {/* 모달 내용 */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 서비스 신청 정보 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">서비스 신청 정보</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">신청번호</label>
                      <div className="text-blue-600 font-medium">{selectedWorkRequest.requestNumber}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">신청제목</label>
                      <div className="text-gray-900">{selectedWorkRequest.title}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">신청내용</label>
                      <div className="text-gray-900">{selectedWorkRequest.content}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">신청자</label>
                      <div className="text-gray-900">{selectedWorkRequest.requester} ({selectedWorkRequest.department})</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">신청연락처</label>
                      <div className="text-gray-900">{selectedWorkRequest.contact}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">신청위치</label>
                      <div className="text-gray-900">{selectedWorkRequest.location}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">신청일시</label>
                      <div className="text-gray-900">{selectedWorkRequest.requestDate}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">현재상태</label>
                      <div className="text-gray-900">{selectedWorkRequest.currentStatus}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">실제신청자</label>
                      <div className="text-gray-900">{selectedWorkRequest.actualRequester || selectedWorkRequest.requester}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">실제연락처</label>
                      <div className="text-gray-900">{selectedWorkRequest.actualContact || selectedWorkRequest.contact}</div>
                    </div>
                  </div>
                </div>

                {/* 작업정보등록 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">작업정보등록</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">배정일시</label>
                      <div className="text-gray-900">{selectedWorkRequest.assignDate || '2025.08.31 10:40'}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">배정담당자</label>
                      <div className="text-gray-900">{selectedWorkRequest.assignee || '이배정'}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">배정의견</label>
                      <div className="text-gray-900">{selectedWorkRequest.assignmentOpinion || '업무에 적합하여 배정'}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">서비스유형</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="요청">요청</option>
                        <option value="문제">문제</option>
                        <option value="변경">변경</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">조치담당자</label>
                      <div className="text-gray-900">김기술</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">예정 조율 일시</label>
                      <input
                        type="datetime-local"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">작업 시작 일시</label>
                      <input
                        type="datetime-local"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">작업 내역</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="작업 내역을 입력하세요"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">작업 완료 일시</label>
                      <input
                        type="datetime-local"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">문제 사항</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="문제 사항을 입력하세요"
                      ></textarea>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="unresolved"
                        className="mr-2"
                      />
                      <label htmlFor="unresolved" className="text-sm font-medium text-gray-600">미결 완료</label>
                    </div>
                  </div>
                </div>
              </div>

              {/* 모달 하단 버튼 */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowServiceWorkInfoModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    setShowServiceWorkInfoModal(false);
                    // 수정 완료 로직
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  수정완료
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 작업정보삭제 모달 */}
      {showServiceWorkDeleteModal && selectedWorkRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="trash-2" size={24} className="mr-2" />
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
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 서비스 신청 정보 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">서비스 신청 정보</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">신청번호</label>
                      <div className="text-blue-600 font-medium">{selectedWorkRequest.requestNumber}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">신청제목</label>
                      <div className="text-gray-900">{selectedWorkRequest.title}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">신청내용</label>
                      <div className="text-gray-900">{selectedWorkRequest.content}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">신청자</label>
                      <div className="text-gray-900">{selectedWorkRequest.requester} ({selectedWorkRequest.department})</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">신청연락처</label>
                      <div className="text-gray-900">{selectedWorkRequest.contact}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">신청위치</label>
                      <div className="text-gray-900">{selectedWorkRequest.location}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">신청일시</label>
                      <div className="text-gray-900">{selectedWorkRequest.requestDate}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">현재상태</label>
                      <div className="text-gray-900">{selectedWorkRequest.currentStatus}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">실제신청자</label>
                      <div className="text-gray-900">{selectedWorkRequest.actualRequester || selectedWorkRequest.requester}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">실제연락처</label>
                      <div className="text-gray-900">{selectedWorkRequest.actualContact || selectedWorkRequest.contact}</div>
                    </div>
                  </div>
                </div>

                {/* 작업정보등록 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">작업정보등록</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">배정일시</label>
                      <div className="text-gray-900">{selectedWorkRequest.assignDate || '2025.08.31 10:40'}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">배정담당자</label>
                      <div className="text-gray-900">{selectedWorkRequest.assignee || '이배정'}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">배정의견</label>
                      <div className="text-gray-900">{selectedWorkRequest.assignmentOpinion || '업무에 적합하여 배정'}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">서비스유형</label>
                      <div className="text-gray-900">{selectedWorkRequest.serviceType}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">조치담당자</label>
                      <div className="text-gray-900">김기술</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">예정 조율 일시</label>
                      <div className="text-gray-900">2025.08.31 15:00</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">작업 시작 일시</label>
                      <div className="text-gray-900">2025.09.01 15:00</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">작업 내역</label>
                      <div className="text-gray-900">작업 내용 수정</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">작업 완료 일시</label>
                      <div className="text-gray-900">2025.08.31 15:00</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">문제 사항</label>
                      <div className="text-gray-900">작업 중 발견된 문제점 수정</div>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="unresolved-delete"
                        className="mr-2"
                        checked={true}
                        readOnly
                      />
                      <label htmlFor="unresolved-delete" className="text-sm font-medium text-gray-600">미결 완료</label>
                    </div>
                  </div>
                </div>
              </div>

              {/* 모달 하단 버튼 */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowServiceWorkDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    if (confirm('정말로 삭제하시겠습니까?')) {
                      setShowServiceWorkDeleteModal(false);
                      // 삭제 완료 로직
                    }
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  삭제하기
                </button>
              </div>
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
