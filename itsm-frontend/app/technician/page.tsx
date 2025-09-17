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
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

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

  // 검색 기간 기본값 설정
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setSearchStartDate(today)
    setSearchEndDate(today)
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
      requestNumber: 'SR-20250831-006',
      title: '이메일 첨부파일 다운로드 오류',
      status: '진행중',
      currentStatus: '정상작동',
      requestDate: '2025.08.31',
      requester: '김철수',
      department: '관리부',
      stage: '확인',
      assignTime: '10:40',
      assignee: '김기술',
      assigneeDepartment: 'IT팀',
      content: '이메일 첨부파일을 다운로드할 수 없습니다.',
      contact: '010-2345-6789',
      location: '2층 사무실',
      serviceType: '문제',
      completionDate: '2025.08.31 11:30'
    },
    {
      id: '3',
      requestNumber: 'SR-20250831-005',
      title: 'VPN 접속 불가',
      status: '진행중',
      currentStatus: '점검요청',
      requestDate: '2025.08.31',
      requester: '이영희',
      department: '생산부',
      stage: '예정',
      assignTime: '10:10',
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
      requestNumber: 'SR-20250831-004',
      title: '모니터 이상',
      status: '진행중',
      currentStatus: '전체불능',
      requestDate: '2025.08.31',
      requester: '강감찬',
      department: '구매팀',
      stage: '작업',
      assignTime: '09:50',
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
      requestNumber: 'SR-20250831-003',
      title: '프린터 인쇄 안됨',
      status: '진행중',
      currentStatus: '메시지창',
      requestDate: '2025.08.31',
      requester: '이율곡',
      department: '관리부',
      stage: '완료',
      assignTime: '09:20',
      assignee: '김기술',
      assigneeDepartment: 'IT팀',
      content: '프린터에서 인쇄가 되지 않습니다.',
      contact: '010-5678-9012',
      location: '2층 사무실',
      serviceType: '자산',
      completionDate: '2025.08.31 10:10'
    },
    {
      id: '6',
      requestNumber: 'SR-20250831-002',
      title: '마우스 오류',
      status: '진행중',
      currentStatus: '부분불능',
      requestDate: '2025.08.31',
      requester: '이목이',
      department: '재무팀',
      stage: '미결',
      assignTime: '09:00',
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
      requestNumber: 'SR-20250831-001',
      title: '키보드 입력 오류',
      status: '진행중',
      currentStatus: '정상작동',
      requestDate: '2025.08.31',
      requester: '박민수',
      department: '영업팀',
      stage: '배정',
      assignTime: '08:30',
      assignee: '김기술',
      assigneeDepartment: 'IT팀',
      content: '키보드에서 일부 키가 입력되지 않습니다.',
      contact: '010-7890-1234',
      location: '5층 사무실',
      serviceType: '자산',
      completionDate: ''
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
    if (showIncompleteOnly && request.completionDate) {
      return false
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
              style={{marginRight: '-12px'}}
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
            <div className="px-20 py-0 rounded-full -ml-72 smooth-hover animate-fade-in shadow-lg" style={{backgroundColor: '#DBEAFE', marginLeft: '-304px'}}>
              <span className="text-blue-600 font-medium" style={{fontSize: '14px'}}>조치담당자 (김기술)</span>
            </div>
          </div>
        </div>

        {/* 완전히 분리된 정보변경 버튼 */}
        <div className="absolute z-50" style={{top: '14px', right: '100px'}}>
          <button 
            onClick={() => setShowPasswordModal(true)}
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
              <div className="bg-white rounded-lg shadow-lg p-6" style={{height: '652px'}}>
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-2">
                    {currentDate} {currentTime} 현재
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">금일 작업 여부 등록</h2>
                  
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="workStatus"
                        checked={isWorking}
                        onChange={() => setIsWorking(true)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-700">서비스 가능</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="workStatus"
                        checked={!isWorking}
                        onChange={() => setIsWorking(false)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-700">서비스 불가</span>
                    </label>
                  </div>
                  </div>
                </div>
              </div>
            </div>

          {/* 프레임 2: 조치담당자 작업 List */}
          <div className="mb-6" style={{marginLeft: '3px', marginTop: '-676px'}}>
            <div className="w-full" style={{maxWidth: '1224px'}}>
              <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col" style={{height: '652px'}}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">조치 담당자 작업 List</h2>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="date"
                        value={searchStartDate}
                        onChange={(e) => setSearchStartDate(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded text-sm"
                      />
                      <span className="text-gray-500">~</span>
                      <input
                        type="date"
                        value={searchEndDate}
                        onChange={(e) => setSearchEndDate(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <button
                      onClick={() => setShowIncompleteOnly(!showIncompleteOnly)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        showIncompleteOnly 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      미 완료 조회
                    </button>
                    <button className="p-2 text-gray-500 hover:text-gray-700 transition-all duration-200">
                      <Icon name="refresh" className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden">
                  <div className="overflow-x-auto h-full">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">신청번호</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">신청제목</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">현재상태</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">신청자</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">신청소속</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">배정시간</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">단계</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">유형</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">완료일시</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">관리</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {paginatedRequests.map((request) => (
                          <tr key={request.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-gray-900">{request.requestNumber}</td>
                            <td className="px-3 py-2 text-gray-900">{request.title}</td>
                            <td className="px-3 py-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                request.currentStatus === '정상작동' ? 'bg-green-100 text-green-800' :
                                request.currentStatus === '부분불능' ? 'bg-yellow-100 text-yellow-800' :
                                request.currentStatus === '전체불능' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {request.currentStatus}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-gray-900">{request.requester}</td>
                            <td className="px-3 py-2 text-gray-900">{request.department}</td>
                            <td className="px-3 py-2 text-gray-900">{request.assignTime}</td>
                            <td className="px-3 py-2">
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
                            <td className="px-3 py-2 text-gray-900">{request.serviceType}</td>
                            <td className="px-3 py-2 text-gray-900">{request.completionDate || '-'}</td>
                            <td className="px-3 py-2">
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
                  <div className="flex items-center justify-center space-x-2 mt-4">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-all duration-200"
                    >
                      이전
                    </button>
                    <span className="px-3 py-1 bg-blue-500 text-white rounded">
                      {currentPage}/{totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-all duration-200"
                    >
                      다음
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 프레임 3: 작업미결현황 */}
          <div className="absolute" style={{left: '1596px', top: '84px'}}>
            <div className="w-80" style={{width: '306px'}}>
              <div className="bg-white rounded-lg shadow-lg p-6" style={{height: '654px'}}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">작업 미결 현황</h2>
                  <div className="flex items-center">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700">토글</span>
                    </label>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">조치 담당자</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">전주 미결</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">장기미결</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pendingWorks.map((work) => (
                        <tr key={work.id}>
                          <td className="px-3 py-2 text-gray-900">{work.technician}</td>
                          <td className="px-3 py-2 text-gray-900">{work.lastWeekPending}</td>
                          <td className="px-3 py-2 text-gray-900">{work.longTermPending}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="relative z-10 bg-gray-800 text-white py-4">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">비밀번호 변경</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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

            <div className="flex gap-3 py-4 px-6 border-t border-gray-200">
            <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setCurrentPassword('')
                  setNewPassword('')
                  setConfirmPassword('')
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg font-medium transition-all duration-200 button-smooth"
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
    </div>
  )
}
