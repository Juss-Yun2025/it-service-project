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

export default function TechnicianPage() {
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
  const [showPendingWork, setShowPendingWork] = useState(true)

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
          backgroundImage: "url('/image/배경_조치담당자_페이지.jpg')",
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
            <div className="px-20 py-0 rounded-full -ml-72 smooth-hover animate-fade-in shadow-lg" style={{backgroundColor: '#DBEAFE', marginLeft: '-310px'}}>
              <span className="text-blue-600 font-medium" style={{fontSize: '14px'}}>조치담당자 (김기술)</span>
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
            
          {/* 프레임 1: 금일작업여부등록 */}
          <div className="mb-6" style={{marginLeft: '-315px', marginTop: '-60px'}}>
            <div className="w-80" style={{width: '292px'}}>
              <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col" style={{height: '650px', backgroundColor: 'rgba(255, 255, 255, 0.8)'}}>
                <div className="text-right mb-4">
                  <div className="text-sm text-gray-500 font-bold">
                    {currentDate} {currentTime} 현재
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col justify-center items-center">
                  <div className="text-center">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">금일 작업 여부 등록</h2>
                    
                    <div className="flex justify-center">
                      <button
                        onClick={() => setIsWorking(!isWorking)}
            className={`px-8 py-4 rounded-lg border-2 transition-all duration-200 ${
              isWorking
                ? 'bg-blue-500 text-white border-blue-500 shadow-lg'
                : 'bg-red-500 text-white border-red-500 shadow-lg'
            }`}
                      >
                        <span className="text-xl font-bold">
                          {isWorking ? '서비스 가능' : '서비스 불가'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </div>

          {/* 프레임 2: 조치담당자 작업 List */}
          <div className="mb-6" style={{marginLeft: '3px', marginTop: '-676px'}}>
            <div className="w-full" style={{maxWidth: '1224px'}}>
                <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col" style={{height: '652px', backgroundColor: 'rgba(255, 255, 255, 0.8)'}}>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleRefresh}
                      className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <Icon name="refresh" size={16} />
                    </button>
                    <h3 className="text-lg font-bold text-gray-800">조치담당자 작업 List</h3>
                  </div>
                </div>

                {/* 검색 조건 */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="date"
                      value={searchStartDate}
                      onChange={(e) => setSearchStartDate(e.target.value)}
                      className="px-3 py-2 border-2 border-gray-400 rounded-lg text-sm font-medium bg-white shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                    <span className="text-gray-600 font-medium">~</span>
                    <input
                      type="date"
                      value={searchEndDate}
                      onChange={(e) => setSearchEndDate(e.target.value)}
                      className="px-3 py-2 border-2 border-gray-400 rounded-lg text-sm font-medium bg-white shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700">미 완료 조회</span>
                    <button
                      onClick={() => setShowIncompleteOnly(!showIncompleteOnly)}
                      className={`w-8 h-4 rounded-full transition-colors ${
                        showIncompleteOnly ? 'bg-blue-500' : 'bg-gray-400'
                      }`}
                    >
                      <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                        showIncompleteOnly ? 'translate-x-4' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden">
                  <div className="overflow-x-auto h-full">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0" style={{backgroundColor: '#DBEAFE'}}>
                        <tr>
                          <th className="px-2 py-2 text-center text-sm font-bold text-blue-600">신청번호</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-blue-600">신청제목</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-blue-600">현재상태</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-blue-600">신청자</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-blue-600">신청소속</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-blue-600">배정시간</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-blue-600">단계</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-blue-600">유형</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-blue-600">완료일시</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-blue-600">관리</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {paginatedRequests.map((request) => (
                          <tr key={request.id} className="hover:bg-gray-50">
                            <td className="px-2 py-2 text-gray-900 text-center">{request.requestNumber}</td>
                            <td className="px-2 py-2 text-gray-900">{request.title}</td>
                            <td className="px-2 py-2 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                request.currentStatus === '정상작동' ? 'bg-green-100 text-green-800' :
                                request.currentStatus === '부분불능' ? 'bg-yellow-100 text-yellow-800' :
                                request.currentStatus === '전체불능' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {request.currentStatus}
                              </span>
                            </td>
                            <td className="px-2 py-2 text-gray-900 text-center">{request.requester}</td>
                            <td className="px-2 py-2 text-gray-900 text-center">{request.department}</td>
                            <td className="px-2 py-2 text-gray-900 text-center">{request.assignTime}</td>
                            <td className="px-2 py-2 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                request.stage === '배정' ? 'bg-blue-100 text-blue-800' :
                                request.stage === '확인' ? 'bg-yellow-100 text-yellow-800' :
                                request.stage === '작업' ? 'bg-orange-100 text-orange-800' :
                                request.stage === '완료' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {request.stage}
                              </span>
                            </td>
                            <td className="px-2 py-2 text-gray-900 text-center">{request.serviceType}</td>
                            <td className="px-2 py-2 text-gray-900 text-center">{request.completionDate || '-'}</td>
                            <td className="px-2 py-2 text-center">
                              {request.stage === '배정' ? (
                                <button
                                  onClick={() => handleAssignmentConfirm(request)}
                                  className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-all duration-200"
                                >
                                  배정확인
                                </button>
                              ) : !request.completionDate ? (
                                <button
                                  onClick={() => handleInfoView(request)}
                                  className="px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-all duration-200"
                                >
                                  정보확인
                                </button>
                              ) : null}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        이전
                      </button>
                      <span className="px-2 py-1 bg-blue-500 text-white rounded text-xs">
                        {currentPage}/{totalPages}
                      </span>
                      <button 
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage >= totalPages}
                        className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        다음
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 프레임 3: 작업미결현황 */}
          <div className="absolute" style={{left: '1596px', top: '84px'}}>
            <div className="w-80" style={{width: '306px'}}>
              <div className="bg-white rounded-lg shadow-lg p-6" style={{height: '650px', backgroundColor: 'rgba(255, 255, 255, 0.8)'}}>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">작업 미결 현황</h2>
                </div>
                
                <div className="flex justify-end mb-4" style={{marginTop: '30px'}}>
                  <button
                    onClick={() => setShowPendingWork(!showPendingWork)}
                    className={`w-8 h-4 rounded-full transition-colors ${
                      showPendingWork ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  >
                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                      showPendingWork ? 'translate-x-4' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                {showPendingWork && (
                  <div className="overflow-x-auto overflow-y-auto" style={{height: 'calc(100vh - 360px)'}}>
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{backgroundColor: '#DBEAFE'}}>
                          <th className="px-2 py-1.5 text-center font-semibold text-blue-600">조치담당자</th>
                          <th className="px-2 py-1.5 text-center font-semibold text-blue-600">전주미결</th>
                          <th className="px-2 py-1.5 text-center font-semibold text-blue-600">장기미결</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingWorks.map((work) => (
                          <tr key={work.id} className="border-b border-gray-100">
                            <td className="px-2 py-1 text-center text-gray-800">{work.technician}</td>
                            <td className="px-2 py-1 text-center text-gray-800">{work.lastWeekPending}</td>
                            <td className="px-2 py-1 text-center text-gray-800">{work.longTermPending}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
                  defaultValue="tech@itsm.com"
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
                  defaultValue="김기술"
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
                  defaultValue="대리"
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
                  defaultValue="IT팀"
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
                  defaultValue="010-1234-5678"
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
                  defaultValue="2025.08.01 13:00"
                  readOnly
                  className="w-full px-3 py-1 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-end py-4 px-6 border-t border-gray-200">
              <button
                onClick={() => { setShowInfoModal(false); setShowInfoSuccessModal(true); }}
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
    </div>
  )
}
