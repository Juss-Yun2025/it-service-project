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
  assignee?: string
  assigneeDepartment?: string
  content: string
  contact: string
  location: string
  actualRequester?: string
  actualContact?: string
}

interface Technician {
  id: string
  name: string
  department: string
  isWorking: boolean
  assignedCount: number
}

interface Inquiry {
  id: string
  inquiryDate: string
  content: string
  inquirer: string
  answerDate?: string
  isLocked?: boolean
}

interface PendingWork {
  id: string
  technician: string
  lastWeekPending: number
  longTermPending: number
}

export default function AssignmentManagerPage() {
  const router = useRouter()
  
  // 상태 관리
  const [realTimeUpdate, setRealTimeUpdate] = useState(false)
  const [showTechnicianStatus, setShowTechnicianStatus] = useState(true)
  const [showPendingWork, setShowPendingWork] = useState(true)
  
  // 서비스 신청 관련 상태
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([])
  const [serviceRequestPage, setServiceRequestPage] = useState(1)
  const [serviceRequestStartDate, setServiceRequestStartDate] = useState('')
  const [serviceRequestEndDate, setServiceRequestEndDate] = useState('')
  const [showUnassignedOnly, setShowUnassignedOnly] = useState(false)
  
  // 일반 문의 관련 상태
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [inquiryPage, setInquiryPage] = useState(1)
  const [inquiryStartDate, setInquiryStartDate] = useState('')
  const [inquiryEndDate, setInquiryEndDate] = useState('')
  const [showUnansweredOnly, setShowUnansweredOnly] = useState(false)
  
  // 조치담당자 관련 상태
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [technicianPage, setTechnicianPage] = useState(1)
  const [selectedDepartment, setSelectedDepartment] = useState('')
  
  // 작업미결 관련 상태
  const [pendingWorks, setPendingWorks] = useState<PendingWork[]>([])
  const [pendingWorkPage, setPendingWorkPage] = useState(1)
  const [selectedPendingDepartment, setSelectedPendingDepartment] = useState('')
  
  // 모달 상태
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [showReassignmentModal, setShowReassignmentModal] = useState(false)
  const [showAnswerModal, setShowAnswerModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    const today = new Date()
    const todayString = today.toISOString().split('T')[0]
    setServiceRequestStartDate(todayString)
    setServiceRequestEndDate(todayString)
    setInquiryStartDate(todayString)
    setInquiryEndDate(todayString)
    
    // 샘플 데이터 로드
    loadSampleData()
  }, [])

  // 샘플 데이터 로드
  const loadSampleData = () => {
    // 서비스 신청 샘플 데이터
    setServiceRequests([
      {
        id: '1',
        requestNumber: 'SR-20250831-009',
        title: '네트워크 연결 문제',
        status: '접수',
        currentStatus: '메시지창',
        requestDate: '2025.08.31 13:00',
        requester: '이영희',
        department: '생산부',
        stage: '접수',
        content: '사무실에서 인터넷 연결이 자주 끊어지는 문제가 발생하고 있습니다.',
        contact: '010-9870-1234',
        location: '제1공장 생산본부 사무실'
      },
      {
        id: '2',
        requestNumber: 'SR-20250831-008',
        title: '프린터 드라이버 업데이트',
        status: '재배정',
        currentStatus: '기타상태',
        requestDate: '2025.08.31 11:30',
        requester: '박달자',
        department: '운송부',
        stage: '재배정',
        assignTime: '11:40',
        assignee: '홍기술',
        assigneeDepartment: 'IT팀',
        content: '프린터 드라이버 업데이트가 필요합니다.',
        contact: '010-9870-5678',
        location: '제2공장 운송부 사무실'
      },
      {
        id: '3',
        requestNumber: 'SR-20250831-007',
        title: '모니터 전원 불량',
        status: '배정',
        currentStatus: '부분불능',
        requestDate: '2025.08.31 11:00',
        requester: '김영자',
        department: '운영팀',
        stage: '배정',
        assignTime: '11:10',
        assignee: '김기술',
        assigneeDepartment: '운영팀',
        content: '모니터 전원이 켜지지 않습니다.',
        contact: '010-9870-9012',
        location: '본사 운영팀 사무실'
      },
      {
        id: '4',
        requestNumber: 'SR-20250831-006',
        title: '이메일 첨부파일 다운로드 문제',
        status: '확인',
        currentStatus: '정상작동',
        requestDate: '2025.08.31 10:30',
        requester: '김철수',
        department: '관리부',
        stage: '확인',
        assignTime: '10:40',
        assignee: '김기술',
        assigneeDepartment: '운영팀',
        content: '이메일 첨부파일을 다운로드할 수 없습니다.',
        contact: '010-9870-3456',
        location: '본사 관리부 사무실'
      },
      {
        id: '5',
        requestNumber: 'SR-20250831-005',
        title: 'VPN 접속 불가',
        status: '작업',
        currentStatus: '점검요청',
        requestDate: '2025.08.31 10:00',
        requester: '이영희',
        department: '생산부',
        stage: '작업',
        assignTime: '10:10',
        assignee: '김기술',
        assigneeDepartment: '운영팀',
        content: 'VPN 접속이 되지 않아 원격 업무가 불가능합니다.',
        contact: '010-9870-1234',
        location: '제1공장 생산본부 사무실'
      }
    ])

    // 일반 문의 샘플 데이터
    setInquiries([
      {
        id: '1',
        inquiryDate: '2025.08.31 14:00',
        content: '모니터 전원 문의',
        inquirer: '홍길순',
        answerDate: '2025.08.01 13:00',
        isLocked: true
      },
      {
        id: '2',
        inquiryDate: '2025.08.31 13:00',
        content: '네트워크 문의',
        inquirer: '김영자'
      },
      {
        id: '3',
        inquiryDate: '2025.08.31 12:00',
        content: '프린터 드라이버 업데이트',
        inquirer: '이영희'
      },
      {
        id: '4',
        inquiryDate: '2025.08.31 11:00',
        content: '이메일 문의',
        inquirer: '박달자'
      }
    ])

    // 조치담당자 샘플 데이터
    setTechnicians([
      {
        id: '1',
        name: '김기술',
        department: '운영팀',
        isWorking: true,
        assignedCount: 5
      },
      {
        id: '2',
        name: '박기술',
        department: 'IT팀',
        isWorking: true,
        assignedCount: 10
      },
      {
        id: '3',
        name: '홍기술',
        department: 'IT팀',
        isWorking: false,
        assignedCount: 0
      }
    ])

    // 작업미결 샘플 데이터
    setPendingWorks([
      {
        id: '1',
        technician: '김기술',
        lastWeekPending: 0,
        longTermPending: 1
      },
      {
        id: '2',
        technician: '박기술',
        lastWeekPending: 1,
        longTermPending: 2
      },
      {
        id: '3',
        technician: '홍기술',
        lastWeekPending: 0,
        longTermPending: 1
      }
    ])
  }

  // 실시간 업데이트 (10분마다)
  useEffect(() => {
    if (!realTimeUpdate) return

    const interval = setInterval(() => {
      // 실제로는 API 호출로 데이터 새로고침
      console.log('실시간 업데이트 실행')
    }, 10 * 60 * 1000) // 10분

    return () => clearInterval(interval)
  }, [realTimeUpdate])

  // 로그아웃 함수
  const handleLogout = () => {
    router.push('/')
  }

  // 새로고침 함수들
  const handleServiceRequestRefresh = () => {
    setServiceRequestPage(1)
    const today = new Date()
    const todayString = today.toISOString().split('T')[0]
    setServiceRequestStartDate(todayString)
    setServiceRequestEndDate(todayString)
  }

  const handleInquiryRefresh = () => {
    setInquiryPage(1)
    const today = new Date()
    const todayString = today.toISOString().split('T')[0]
    setInquiryStartDate(todayString)
    setInquiryEndDate(todayString)
  }

  const handleTechnicianRefresh = () => {
    setTechnicianPage(1)
    setSelectedDepartment('')
  }

  const handlePendingWorkRefresh = () => {
    setPendingWorkPage(1)
    setSelectedPendingDepartment('')
  }

  // 모달 핸들러들
  const handleAssignment = (request: ServiceRequest) => {
    setSelectedRequest(request)
    setShowAssignmentModal(true)
  }

  const handleReassignment = (request: ServiceRequest) => {
    setSelectedRequest(request)
    setShowReassignmentModal(true)
  }

  const handleAnswer = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry)
    setShowAnswerModal(true)
  }

  const handleInfoChange = () => {
    setShowInfoModal(true)
  }

  const closeModal = () => {
    setShowAssignmentModal(false)
    setShowReassignmentModal(false)
    setShowAnswerModal(false)
    setShowInfoModal(false)
    setSelectedRequest(null)
    setSelectedInquiry(null)
  }

  // 필터링된 데이터
  const filteredServiceRequests = serviceRequests.filter(request => {
    if (showUnassignedOnly && !['접수', '재배정'].includes(request.stage)) {
      return false
    }
    return true
  })

  const filteredInquiries = inquiries.filter(inquiry => {
    if (showUnansweredOnly && inquiry.answerDate) {
      return false
    }
    return true
  })

  const filteredTechnicians = technicians.filter(technician => {
    if (selectedDepartment && technician.department !== selectedDepartment) {
      return false
    }
    return true
  })

  const filteredPendingWorks = pendingWorks.filter(work => {
    if (selectedPendingDepartment) {
      const technician = technicians.find(t => t.name === work.technician)
      if (technician && technician.department !== selectedPendingDepartment) {
        return false
      }
    }
    return true
  })

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 배경 이미지 */}
      <div 
        className="absolute inset-0 bg-no-repeat bg-cover"
        style={{
          backgroundImage: `url('/image/배경_배정담당자_페이지.jpg')`
        }}
      />
      
      {/* 배경 오버레이 */}
      <div className="fixed inset-0 bg-black/40" />

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
            {/* 실시간 업데이트 토글 */}
            <div className="flex items-center space-x-2">
              <span className="text-white text-sm">실시간 업데이트</span>
              <button
                onClick={() => setRealTimeUpdate(!realTimeUpdate)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  realTimeUpdate ? 'bg-green-500' : 'bg-gray-400'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  realTimeUpdate ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-out"
            >
              로그아웃
            </button>
            <button 
              onClick={handleInfoChange}
              className="text-white/70 hover:text-white transition-all duration-300 ease-out flex items-center space-x-2"
            >
              <Icon name="settings" size={20} />
              <span>정보변경</span>
            </button>
          </div>
        </div>

        {/* 사용자 정보 */}
        <div className="max-w-7xl mx-auto px-6 py-6 w-full">
          <div className="flex items-center justify-center">
            <div className="bg-white px-20 py-2 rounded-full shadow-lg">
              <span className="text-black font-medium">배정담당자 (김배정)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 - 4개 프레임 */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          
          {/* 좌측: 조치담당자 작업현황 */}
          {showTechnicianStatus && (
            <div className="col-span-3 bg-white/80 rounded-lg shadow-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">조치담당자 작업현황</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleTechnicianRefresh}
                    className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <Icon name="refresh" size={16} />
                  </button>
                  <button
                    onClick={() => setShowTechnicianStatus(!showTechnicianStatus)}
                    className={`w-8 h-4 rounded-full transition-colors ${
                      showTechnicianStatus ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  >
                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                      showTechnicianStatus ? 'translate-x-4' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>

              {/* 부서 선택 */}
              <div className="mb-4">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">전체 부서</option>
                  <option value="IT팀">IT팀</option>
                  <option value="운영팀">운영팀</option>
                </select>
              </div>

              {/* 현재 시간 */}
              <div className="text-sm text-gray-600 mb-4">
                2025.08.31 18:00 현재
              </div>

              {/* 조치담당자 테이블 */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-2 py-2 text-left font-semibold text-gray-700">조치담당자</th>
                      <th className="px-2 py-2 text-center font-semibold text-gray-700">작업</th>
                      <th className="px-2 py-2 text-center font-semibold text-gray-700">배정건수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTechnicians.map((technician) => (
                      <tr key={technician.id} className="border-b border-gray-100">
                        <td className="px-2 py-2 text-gray-800">{technician.name}</td>
                        <td className="px-2 py-2 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            technician.isWorking ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {technician.isWorking ? 'Y' : 'N'}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-center text-gray-800">{technician.assignedCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 페이지네이션 */}
              <div className="flex justify-center mt-4">
                <div className="flex items-center space-x-2">
                  <button className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs">이전</button>
                  <span className="px-2 py-1 bg-blue-500 text-white rounded text-xs">1/1</span>
                  <button className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs">다음</button>
                </div>
              </div>
            </div>
          )}

          {/* 중앙: 서비스신청현황 */}
          <div className="col-span-6 bg-white/80 rounded-lg shadow-xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">서비스신청현황</h3>
              <button
                onClick={handleServiceRequestRefresh}
                className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Icon name="refresh" size={16} />
              </button>
            </div>

            {/* 검색 조건 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={serviceRequestStartDate}
                  onChange={(e) => setServiceRequestStartDate(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                />
                <span className="text-gray-600">~</span>
                <input
                  type="date"
                  value={serviceRequestEndDate}
                  onChange={(e) => setServiceRequestEndDate(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">미 배정만 조회</span>
                <button
                  onClick={() => setShowUnassignedOnly(!showUnassignedOnly)}
                  className={`w-8 h-4 rounded-full transition-colors ${
                    showUnassignedOnly ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                    showUnassignedOnly ? 'translate-x-4' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>

            {/* 서비스신청 테이블 */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-2 py-2 text-left font-semibold text-gray-700">신청번호</th>
                    <th className="px-2 py-2 text-left font-semibold text-gray-700">신청일시</th>
                    <th className="px-2 py-2 text-left font-semibold text-gray-700">신청제목</th>
                    <th className="px-2 py-2 text-center font-semibold text-gray-700">현재상태</th>
                    <th className="px-2 py-2 text-left font-semibold text-gray-700">신청자</th>
                    <th className="px-2 py-2 text-left font-semibold text-gray-700">신청소속</th>
                    <th className="px-2 py-2 text-center font-semibold text-gray-700">단계</th>
                    <th className="px-2 py-2 text-center font-semibold text-gray-700">배정시간</th>
                    <th className="px-2 py-2 text-left font-semibold text-gray-700">조치자</th>
                    <th className="px-2 py-2 text-left font-semibold text-gray-700">조치소속</th>
                    <th className="px-2 py-2 text-center font-semibold text-gray-700">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServiceRequests.map((request) => (
                    <tr key={request.id} className="border-b border-gray-100 hover:bg-blue-50">
                      <td className="px-2 py-2 text-blue-600 font-medium">{request.requestNumber}</td>
                      <td className="px-2 py-2 text-gray-800">{request.requestDate.split(' ')[1]}</td>
                      <td className="px-2 py-2 text-gray-800 max-w-xs truncate" title={request.title}>
                        {request.title}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          request.currentStatus === '정상작동' ? 'bg-green-100 text-green-800' :
                          request.currentStatus === '오류발생' ? 'bg-red-100 text-red-800' :
                          request.currentStatus === '부분불능' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {request.currentStatus}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-gray-800">{request.requester}</td>
                      <td className="px-2 py-2 text-gray-800">{request.department}</td>
                      <td className="px-2 py-2 text-center">
                        {request.stage === '접수' && <Icon name="check-circle" size={16} className="text-green-500 mx-auto" />}
                        {request.stage === '재배정' && <Icon name="refresh" size={16} className="text-orange-500 mx-auto" />}
                        {request.stage === '배정' && <Icon name="user" size={16} className="text-blue-500 mx-auto" />}
                        {request.stage === '확인' && <Icon name="eye" size={16} className="text-purple-500 mx-auto" />}
                        {request.stage === '작업' && <Icon name="settings" size={16} className="text-indigo-500 mx-auto" />}
                      </td>
                      <td className="px-2 py-2 text-gray-800">{request.assignTime || '-'}</td>
                      <td className="px-2 py-2 text-gray-800">{request.assignee || '-'}</td>
                      <td className="px-2 py-2 text-gray-800">{request.assigneeDepartment || '-'}</td>
                      <td className="px-2 py-2 text-center">
                        {request.stage === '접수' && (
                          <button
                            onClick={() => handleAssignment(request)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                          >
                            배정작업
                          </button>
                        )}
                        {request.stage === '재배정' && (
                          <button
                            onClick={() => handleReassignment(request)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded text-xs"
                          >
                            재배정작업
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            <div className="flex justify-center mt-4">
              <div className="flex items-center space-x-2">
                <button className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs">이전</button>
                <span className="px-2 py-1 bg-blue-500 text-white rounded text-xs">1/1</span>
                <button className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs">다음</button>
              </div>
            </div>
          </div>

          {/* 우측: 작업미결현황 */}
          {showPendingWork && (
            <div className="col-span-3 bg-white/80 rounded-lg shadow-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">작업미결현황</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePendingWorkRefresh}
                    className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <Icon name="refresh" size={16} />
                  </button>
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
              </div>

              {/* 부서 선택 */}
              <div className="mb-4">
                <select
                  value={selectedPendingDepartment}
                  onChange={(e) => setSelectedPendingDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">전체 부서</option>
                  <option value="IT팀">IT팀</option>
                  <option value="운영팀">운영팀</option>
                </select>
              </div>

              {/* 작업미결 테이블 */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-2 py-2 text-left font-semibold text-gray-700">조치담당자</th>
                      <th className="px-2 py-2 text-center font-semibold text-gray-700">전주미결</th>
                      <th className="px-2 py-2 text-center font-semibold text-gray-700">장기미결</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPendingWorks.map((work) => (
                      <tr key={work.id} className="border-b border-gray-100">
                        <td className="px-2 py-2 text-gray-800">{work.technician}</td>
                        <td className="px-2 py-2 text-center text-gray-800">{work.lastWeekPending}</td>
                        <td className="px-2 py-2 text-center text-gray-800">{work.longTermPending}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 페이지네이션 */}
              <div className="flex justify-center mt-4">
                <div className="flex items-center space-x-2">
                  <button className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs">이전</button>
                  <span className="px-2 py-1 bg-blue-500 text-white rounded text-xs">1/1</span>
                  <button className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs">다음</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 하단: 일반문의답변현황 */}
        <div className="mt-6 bg-white/80 rounded-lg shadow-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">일반문의답변현황</h3>
            <button
              onClick={handleInquiryRefresh}
              className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Icon name="refresh" size={16} />
            </button>
          </div>

          {/* 검색 조건 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={inquiryStartDate}
                onChange={(e) => setInquiryStartDate(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              />
              <span className="text-gray-600">~</span>
              <input
                type="date"
                value={inquiryEndDate}
                onChange={(e) => setInquiryEndDate(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">미 답변만 조회</span>
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

          {/* 일반문의 테이블 */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-2 py-2 text-left font-semibold text-gray-700">문의일시</th>
                  <th className="px-2 py-2 text-left font-semibold text-gray-700">문의내용</th>
                  <th className="px-2 py-2 text-left font-semibold text-gray-700">문의자</th>
                  <th className="px-2 py-2 text-left font-semibold text-gray-700">답변일시</th>
                  <th className="px-2 py-2 text-center font-semibold text-gray-700">관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredInquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="border-b border-gray-100 hover:bg-blue-50">
                    <td className="px-2 py-2 text-gray-800">{inquiry.inquiryDate}</td>
                    <td className="px-2 py-2 text-gray-800 max-w-xs truncate" title={inquiry.content}>
                      {inquiry.content}
                    </td>
                    <td className="px-2 py-2 text-gray-800">{inquiry.inquirer}</td>
                    <td className="px-2 py-2 text-gray-800">{inquiry.answerDate || '-'}</td>
                    <td className="px-2 py-2 text-center">
                      {inquiry.isLocked ? (
                        <Icon name="lock" size={16} className="text-gray-400 mx-auto" />
                      ) : inquiry.answerDate ? (
                        <button
                          onClick={() => handleAnswer(inquiry)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                        >
                          답변하기
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAnswer(inquiry)}
                          className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                        >
                          답변하기
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          <div className="flex justify-center mt-4">
            <div className="flex items-center space-x-2">
              <button className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs">이전</button>
              <span className="px-2 py-1 bg-blue-500 text-white rounded text-xs">1/1</span>
              <button className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs">다음</button>
            </div>
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <div className="absolute bottom-4 left-4 right-4 text-center">
        <span className="text-sm text-gray-400">
          © 2025 IT 서비스 관리 시스템. 모든 권리는 Juss 가 보유
        </span>
      </div>

      {/* 배정작업 모달 */}
      {showAssignmentModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">배정작업</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 좌측: 서비스신청정보 (조회 전용) */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">서비스신청정보</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">신청번호</label>
                    <p className="text-blue-600 font-medium">{selectedRequest.requestNumber}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">신청제목</label>
                    <p className="text-gray-800">{selectedRequest.title}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">신청내용</label>
                    <p className="text-gray-800">{selectedRequest.content}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">신청자</label>
                    <p className="text-gray-800">{selectedRequest.requester}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">신청연락처</label>
                    <p className="text-gray-800">{selectedRequest.contact}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">신청위치</label>
                    <p className="text-gray-800">{selectedRequest.location}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">신청일시</label>
                    <p className="text-gray-800">{selectedRequest.requestDate}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">현재상태</label>
                    <p className="text-gray-800">{selectedRequest.currentStatus}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">실제신청자</label>
                    <p className="text-gray-800">{selectedRequest.actualRequester || '-'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">실제연락처</label>
                    <p className="text-gray-800">{selectedRequest.actualContact || '-'}</p>
                  </div>
                </div>
              </div>

              {/* 우측: 배정정보 (입력 가능) */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">배정정보</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">단계</label>
                    <p className="text-gray-800">배정 (자동생성)</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">조치담당 소속</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">선택하세요</option>
                      <option value="IT팀">IT팀</option>
                      <option value="운영팀">운영팀</option>
                      <option value="개발팀">개발팀</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">조치담당자</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">선택하세요</option>
                      <option value="김기술">김기술</option>
                      <option value="박기술">박기술</option>
                      <option value="홍기술">홍기술</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">배정시간</label>
                    <p className="text-gray-800">{new Date().toLocaleString('ko-KR')}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">배정담당자</label>
                    <p className="text-gray-800">김배정 (자동생성)</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">배정의견</label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="배정 의견을 입력하세요"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">서비스 조치 유형</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">선택하세요</option>
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

            {/* 모달 하단 버튼 */}
            <div className="flex justify-end py-4 px-6 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 mr-2"
              >
                취소
              </button>
              <button
                onClick={() => {
                  // 배정 완료 로직
                  alert('배정이 완료되었습니다.')
                  closeModal()
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
              >
                배정완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 재배정작업 모달 */}
      {showReassignmentModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">재배정작업</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 좌측: 서비스신청정보 (조회 전용) */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">서비스신청정보</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">신청번호</label>
                    <p className="text-blue-600 font-medium">{selectedRequest.requestNumber}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">신청제목</label>
                    <p className="text-gray-800">{selectedRequest.title}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">신청내용</label>
                    <p className="text-gray-800">{selectedRequest.content}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">신청자</label>
                    <p className="text-gray-800">{selectedRequest.requester}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">신청연락처</label>
                    <p className="text-gray-800">{selectedRequest.contact}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">신청위치</label>
                    <p className="text-gray-800">{selectedRequest.location}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">신청일시</label>
                    <p className="text-gray-800">{selectedRequest.requestDate}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">현재상태</label>
                    <p className="text-gray-800">{selectedRequest.currentStatus}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">실제신청자</label>
                    <p className="text-gray-800">{selectedRequest.actualRequester || '-'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">실제연락처</label>
                    <p className="text-gray-800">{selectedRequest.actualContact || '-'}</p>
                  </div>
                </div>
              </div>

              {/* 우측: 재배정정보 (입력 가능) */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">재배정정보</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">단계</label>
                    <p className="text-gray-800">재배정 → 배정 (자동생성)</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">조치담당 소속</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">선택하세요</option>
                      <option value="IT팀">IT팀</option>
                      <option value="운영팀">운영팀</option>
                      <option value="개발팀">개발팀</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">조치담당자</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">선택하세요</option>
                      <option value="김기술">김기술</option>
                      <option value="박기술">박기술</option>
                      <option value="홍기술">홍기술</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">배정일시</label>
                    <p className="text-gray-800">{new Date().toLocaleString('ko-KR')}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">배정담당자</label>
                    <p className="text-gray-800">김배정 (자동생성)</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">배정의견</label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="재배정 의견을 입력하세요"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">서비스 조치 유형</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">선택하세요</option>
                      <option value="요청">요청</option>
                      <option value="장애">장애</option>
                      <option value="변경">변경</option>
                      <option value="문제">문제</option>
                      <option value="적용">적용</option>
                      <option value="구성">구성</option>
                      <option value="자산">자산</option>
                    </select>
                  </div>

                  {/* 이전 배정 정보 (조회 전용) */}
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">이전 배정 정보</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-gray-500">전)배정일시</label>
                        <p className="text-sm text-gray-800">2025.08.31 11:40</p>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">전)배정담당자</label>
                        <p className="text-sm text-gray-800">김배정</p>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">전)배정의견</label>
                        <p className="text-sm text-gray-800">초기 배정</p>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">전)조치담당자</label>
                        <p className="text-sm text-gray-800">홍기술</p>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">반려의견</label>
                        <p className="text-sm text-gray-800">업무 과다로 인한 재배정 요청</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-end py-4 px-6 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 mr-2"
              >
                취소
              </button>
              <button
                onClick={() => {
                  // 재배정 완료 로직
                  alert('재배정이 완료되었습니다.')
                  closeModal()
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
              >
                재배정완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 답변하기 모달 */}
      {showAnswerModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">답변하기</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* 일반문의사항 정보 (조회 전용) */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">일반문의사항 정보</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">문의일시</label>
                    <p className="text-gray-800">{selectedInquiry.inquiryDate}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">문의자</label>
                    <p className="text-gray-800">{selectedInquiry.inquirer}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">문의내용</label>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-800">{selectedInquiry.content}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 답변하기 정보 (입력 가능) */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">답변하기 정보</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">답변자</label>
                    <p className="text-gray-800">김배정 (자동생성)</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">답변내용</label>
                    <textarea
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="답변 내용을 입력하세요"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">답변일시</label>
                    <p className="text-gray-800 text-sm">답변 완료 시 현재시간이 자동으로 반영됩니다.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-end py-4 px-6 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 mr-2"
              >
                취소
              </button>
              <button
                onClick={() => {
                  // 답변 완료 로직
                  alert('답변이 완료되었습니다.')
                  closeModal()
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
              >
                답변완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 정보변경 모달 */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200">
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
            
            <div className="p-6 space-y-4">
              {/* 이메일 */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <Icon name="mail" size={16} className="mr-2" />
                  이메일
                </label>
                <input
                  type="email"
                  defaultValue="assign@itsm.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  defaultValue="김배정"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  defaultValue="IT서비스팀"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 비밀번호 변경 버튼 */}
              <div className="pt-4">
                <button 
                  onClick={() => {
                    const currentPassword = prompt('현재 비밀번호를 입력하세요:')
                    if (currentPassword) {
                      const newPassword = prompt('새 비밀번호를 입력하세요:')
                      if (newPassword) {
                        const confirmPassword = prompt('새 비밀번호를 다시 입력하세요:')
                        if (newPassword === confirmPassword) {
                          alert('비밀번호가 변경되었습니다.')
                        } else {
                          alert('새 비밀번호가 일치하지 않습니다.')
                        }
                      }
                    }
                  }}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-all duration-200"
                >
                  비밀번호 변경
                </button>
              </div>

              {/* 생성일시 (읽기 전용) */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <Icon name="mail" size={16} className="mr-2" />
                  생성일시
                </label>
                <input
                  type="text"
                  defaultValue="2025.08.01 13:00"
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-end py-4 px-6 border-t border-gray-200">
              <button
                onClick={() => {
                  alert('회원정보가 수정되었습니다.')
                  closeModal()
                }}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
              >
                회원정보 수정
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}