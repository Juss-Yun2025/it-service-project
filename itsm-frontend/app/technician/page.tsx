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
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [showInfoSuccessModal, setShowInfoSuccessModal] = useState(false)
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
      requester: '김영자',
      department: '운영팀',
      stage: '배정',
      assignTime: '11:40',
      assignDate: '2025.08.31',
      assignee: '김기술',
      assigneeDepartment: 'IT팀',
      content: '모니터가 간헐적으로 꺼지는 현상이 발생합니다.',
      contact: '010-1234-5678',
      location: '3층 사무실',
      serviceType: '자산',
      completionDate: ''
    },
    {
      id: '2',
      requestNumber: 'SR-20250830-006',
      title: '이메일 첨부파일 다운로드 오류',
      status: '진행중',
      currentStatus: '정상작동',
      requestDate: '2025.08.30',
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
    setShowInfoModal(true)
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

  const closeModal = () => {
    setShowAssignmentModal(false)
    setShowInfoModal(false)
    setShowPasswordModal(false)
    setSelectedRequest(null)
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
                            ? 'bg-green-500 text-white border-green-500 shadow-lg' 
                            : 'bg-red-500 text-white border-red-500 shadow-lg'
                        }`}
                        style={{ borderColor: '#3B82F6' }}
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
                      onClick={() => window.location.reload()}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">배정확인</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">신청번호</label>
                <p className="text-sm text-gray-900">{selectedRequest.requestNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">신청제목</label>
                <p className="text-sm text-gray-900">{selectedRequest.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">신청자</label>
                <p className="text-sm text-gray-900">{selectedRequest.requester}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">신청소속</label>
                <p className="text-sm text-gray-900">{selectedRequest.department}</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAssignmentModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg font-medium transition-all duration-200"
              >
                취소
              </button>
              <button
                onClick={handleAssignmentConfirmSubmit}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-all duration-200"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 정보확인 모달 */}
      {showInfoModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">정보확인 및 작업정보등록</h3>
            
            {/* 서비스 신청 정보 조회 */}
            <div className="mb-6">
              <h4 className="text-md font-medium mb-3 text-gray-800">서비스 신청 정보</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">신청번호</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedRequest.requestNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">신청제목</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedRequest.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">신청자</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedRequest.requester}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">신청소속</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedRequest.department}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedRequest.contact}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">위치</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedRequest.location}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">신청내용</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded min-h-[60px]">{selectedRequest.content}</p>
                </div>
              </div>
            </div>

            {/* 작업정보등록 */}
            <div className="border-t pt-6">
              <h4 className="text-md font-medium mb-3 text-gray-800">작업정보등록</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">작업내용</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="작업 내용을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">완료상태</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">선택하세요</option>
                    <option value="완료">완료</option>
                    <option value="부분완료">부분완료</option>
                    <option value="미완료">미완료</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">비고</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="비고사항을 입력하세요"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowInfoModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg font-medium transition-all duration-200"
              >
                취소
              </button>
              <button
                onClick={handleInfoSubmit}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-all duration-200"
              >
                등록
              </button>
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
    </div>
  )
}
