"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/ui/Icon'

// 서비스 요청 데이터 타입 정의
interface ServiceRequest {
  id: string
  requestNumber: string
  title: string
  status: string
  currentStatus: string  // 장비의 현재 상태
  requestDate: string
  assignee?: string
  completionDate?: string
  content: string
  requester: string
  contact: string
  location: string
  actualRequester?: string
  actualContact?: string
}

export default function ProgressPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false)
  const [showEditSuccessModal, setShowEditSuccessModal] = useState(false)
  const [showInfoSuccessModal, setShowInfoSuccessModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const router = useRouter()

  // 컴포넌트 마운트 시 한 달 전부터 오늘까지로 초기화
  useEffect(() => {
    const today = new Date()
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(today.getMonth() - 1)
    
    const todayString = today.toISOString().split('T')[0]
    const oneMonthAgoString = oneMonthAgo.toISOString().split('T')[0]
    
    setStartDate(oneMonthAgoString)
    setEndDate(todayString)
  }, [])

  // 검색 조건이 변경될 때 페이지를 1로 리셋
  useEffect(() => {
    setCurrentPage(1)
  }, [startDate, endDate])

  // 진행 상태 매칭 함수
  const getProgressStatus = (dbStatus: string) => {
    const statusMap: { [key: string]: string } = {
      '접수': '정상접수',
      '배정': '담당배정',
      '재배정': '담당배정',
      '확인': '담당배정',
      '예정': '시간조율',
      '작업': '작업진행',
      '완료': '처리완료',
      '미결': '미결처리'
    }
    return statusMap[dbStatus] || dbStatus
  }

  // 진행 상태별 색상
  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      '정상접수': 'bg-purple-100 text-purple-800',
      '담당배정': 'bg-green-100 text-green-800',
      '시간조율': 'bg-yellow-100 text-yellow-800',
      '작업진행': 'bg-orange-100 text-orange-800',
      '처리완료': 'bg-blue-100 text-blue-800',
      '미결처리': 'bg-red-100 text-red-800'
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  // 샘플 데이터 (15건)
  const [serviceRequests] = useState<ServiceRequest[]>([
    {
      id: '1',
      requestNumber: 'SR-20250831-009',
      title: '네트워크 연결 문제',
      status: '접수',
      currentStatus: '부분불능',
      requestDate: '2025.08.31 13:00',
      content: '사무실에서 인터넷 연결이 자주 끊어지는 문제가 발생하고 있습니다.',
      requester: '이영희 (생산부)',
      contact: '010-9870-1234',
      location: '제1공장 생산본부 사무실'
    },
    {
      id: '2',
      requestNumber: 'SR-20250831-005',
      title: 'VPN 접속 불가',
      status: '작업',
      currentStatus: '정상작동',
      requestDate: '2025.08.31 10:00',
      assignee: '김기술',
      content: 'VPN 접속이 되지 않아 원격 업무가 불가능합니다.',
      requester: '이영희 (생산부)',
      contact: '010-9870-1234',
      location: '제1공장 생산본부 사무실'
    },
    {
      id: '3',
      requestNumber: 'SR-20250831-003',
      title: '프린터 드라이버 업데이트',
      status: '예정',
      currentStatus: '점검요청',
      requestDate: '2025.08.31 09:30',
      assignee: '박기술',
      content: '프린터 드라이버 업데이트가 필요합니다.',
      requester: '이영희 (생산부)',
      contact: '010-9870-1234',
      location: '제1공장 생산본부 사무실'
    },
    {
      id: '4',
      requestNumber: 'SR-20250830-010',
      title: '마우스 불량',
      status: '배정',
      currentStatus: '오류발생',
      requestDate: '2025.08.30 13:00',
      assignee: '홍기술',
      content: '마우스가 제대로 작동하지 않습니다.',
      requester: '이영희 (생산부)',
      contact: '010-9870-1234',
      location: '제1공장 생산본부 사무실'
    },
    {
      id: '5',
      requestNumber: 'SR-20250829-010',
      title: '모니터 전원 불량',
      status: '완료',
      currentStatus: '정상작동',
      requestDate: '2025.08.09 13:00',
      assignee: '박기술',
      completionDate: '2025.06.01 15:00',
      content: '모니터 전원이 켜지지 않습니다.',
      requester: '이영희 (생산부)',
      contact: '010-9870-1234',
      location: '제1공장 생산본부 사무실'
    },
    {
      id: '6',
      requestNumber: 'SR-20250828-008',
      title: '키보드 일부 키 불량',
      status: '접수',
      currentStatus: '정상작동',
      requestDate: '2025.08.28 14:30',
      content: '키보드의 일부 키가 작동하지 않습니다.',
      requester: '이영희 (생산부)',
      contact: '010-9870-1234',
      location: '제1공장 생산본부 사무실'
    },
    {
      id: '7',
      requestNumber: 'SR-20250827-007',
      title: '소프트웨어 설치 요청',
      status: '작업',
      currentStatus: '점검요청',
      requestDate: '2025.08.27 11:00',
      assignee: '최기술',
      content: '새로운 소프트웨어 설치가 필요합니다.',
      requester: '이영희 (생산부)',
      contact: '010-9870-1234',
      location: '제1공장 생산본부 사무실'
    },
    {
      id: '8',
      requestNumber: 'SR-20250826-006',
      title: '시스템 백업 요청',
      status: '예정',
      currentStatus: '정상작동',
      requestDate: '2025.08.26 16:00',
      assignee: '이기술',
      content: '시스템 백업을 요청합니다.',
      requester: '이영희 (생산부)',
      contact: '010-9870-1234',
      location: '제1공장 생산본부 사무실'
    },
    {
      id: '9',
      requestNumber: 'SR-20250825-005',
      title: '이메일 계정 문제',
      status: '배정',
      currentStatus: '오류발생',
      requestDate: '2025.08.25 09:00',
      assignee: '정기술',
      content: '이메일 계정에 접속할 수 없습니다.',
      requester: '이영희 (생산부)',
      contact: '010-9870-1234',
      location: '제1공장 생산본부 사무실'
    },
    {
      id: '10',
      requestNumber: 'SR-20250824-004',
      title: '컴퓨터 속도 저하',
      status: '완료',
      currentStatus: '정상작동',
      requestDate: '2025.08.24 13:30',
      assignee: '한기술',
      completionDate: '2025.08.25 10:00',
      content: '컴퓨터 속도가 현저히 느려졌습니다.',
      requester: '이영희 (생산부)',
      contact: '010-9870-1234',
      location: '제1공장 생산본부 사무실'
    },
    {
      id: '11',
      requestNumber: 'SR-20250823-003',
      title: '파일 복구 요청',
      status: '미결',
      currentStatus: '기타상태',
      requestDate: '2025.08.23 15:00',
      assignee: '조기술',
      content: '실수로 삭제된 파일 복구가 필요합니다.',
      requester: '이영희 (생산부)',
      contact: '010-9870-1234',
      location: '제1공장 생산본부 사무실'
    },
    {
      id: '12',
      requestNumber: 'SR-20250822-002',
      title: '네트워크 프린터 설정',
      status: '접수',
      currentStatus: '메시지창',
      requestDate: '2025.08.22 10:00',
      content: '네트워크 프린터 설정이 필요합니다.',
      requester: '이영희 (생산부)',
      contact: '010-9870-1234',
      location: '제1공장 생산본부 사무실'
    },
    {
      id: '13',
      requestNumber: 'SR-20250821-001',
      title: '보안 프로그램 업데이트',
      status: '작업',
      currentStatus: '전체불능',
      requestDate: '2025.08.21 14:00',
      assignee: '강기술',
      content: '보안 프로그램 업데이트가 필요합니다.',
      requester: '이영희 (생산부)',
      contact: '010-9870-1234',
      location: '제1공장 생산본부 사무실'
    },
    {
      id: '14',
      requestNumber: 'SR-20250820-015',
      title: '데이터베이스 접속 오류',
      status: '예정',
      currentStatus: '오류발생',
      requestDate: '2025.08.20 11:30',
      assignee: '윤기술',
      content: '데이터베이스에 접속할 수 없습니다.',
      requester: '이영희 (생산부)',
      contact: '010-9870-1234',
      location: '제1공장 생산본부 사무실'
    },
    {
      id: '15',
      requestNumber: 'SR-20250819-014',
      title: '웹사이트 접속 불가',
      status: '완료',
      currentStatus: '정상작동',
      requestDate: '2025.08.19 09:00',
      assignee: '서기술',
      completionDate: '2025.08.19 16:00',
      content: '특정 웹사이트에 접속할 수 없습니다.',
      requester: '이영희 (생산부)',
      contact: '010-9870-1234',
      location: '제1공장 생산본부 사무실'
    }
  ])

  // 검색 조건에 따른 데이터 필터링
  const filteredRequests = serviceRequests.filter(request => {
    if (!startDate || !endDate) return true
    
    // 날짜 형식 변환 (YYYY-MM-DD -> YYYY.MM.DD)
    const requestDate = request.requestDate.split(' ')[0].replace(/\./g, '-')
    const startDateFormatted = startDate
    const endDateFormatted = endDate
    
    return requestDate >= startDateFormatted && requestDate <= endDateFormatted
  })

  // 현재 페이지 데이터
  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage)
  const currentRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // 새로고침 함수
  const handleRefresh = () => {
    setCurrentPage(1)
    const today = new Date()
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(today.getMonth() - 1)
    
    const todayString = today.toISOString().split('T')[0]
    const oneMonthAgoString = oneMonthAgo.toISOString().split('T')[0]
    
    setStartDate(oneMonthAgoString)
    setEndDate(todayString)
  }

  // 모달 핸들러 함수들
  const handleViewDetails = (request: ServiceRequest) => {
    setSelectedRequest(request)
    setShowDetailModal(true)
  }

  const handleEditRequest = (request: ServiceRequest) => {
    setSelectedRequest(request)
    setShowEditModal(true)
  }

  const handleDeleteRequest = (request: ServiceRequest) => {
    setSelectedRequest(request)
    setShowDeleteModal(true)
  }

  const handleInfoChange = () => {
    setShowInfoModal(true)
  }

  const closeModal = () => {
    setShowDetailModal(false)
    setShowEditModal(false)
    setShowDeleteModal(false)
    setShowInfoModal(false)
    setSelectedRequest(null)
  }

  // 로그아웃 함수
  const handleLogout = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 배경 이미지 */}
      <div 
        className="absolute inset-0 bg-no-repeat"
        style={{
          backgroundImage: `url('/image/배경_요청진행사항_페이지.jpg')`
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
          <div className="relative">
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-out button-smooth"
            >
              로그아웃
            </button>
            <button 
              onClick={handleInfoChange}
              className="absolute top-0 left-0 text-white/70 hover:text-white transition-all duration-300 ease-out flex items-center space-x-2 button-smooth"
              style={{marginTop: '100px', marginLeft: '-100px'}}
            >
              <Icon name="settings" size={20} className="text-white hover:text-white" />
              <span>정보 변경</span>
            </button>
          </div>
        </div>

        {/* 사용자 정보 및 네비게이션 */}
        <div className="max-w-7xl mx-auto px-6 py-6 w-full">
          <div className="flex items-center justify-between mb-12">
            <div className="bg-white px-20 py-0 rounded-full -ml-74 smooth-hover animate-fade-in shadow-lg">
              <span className="text-black font-medium">일반사용자 (이영희)</span>
            </div>
            <div className="flex absolute" style={{left: '50%', transform: 'translateX(-350px)', gap: '170px'}}>
              <button 
                onClick={() => router.push('/service-request')}
                className="text-white/70 hover:text-white transition-all duration-500 ease-out relative group button-smooth"
              >
                <span className="flex items-center space-x-2">
                  <Icon name="document" size={20} className="text-white group-hover:text-white" />
                  <span className="group-hover:text-[#AD46FF]">서비스신청</span>
                </span>
                <div className="absolute bottom-[-4px] left-0 w-0 h-1 bg-[#AD46FF] transition-all duration-500 ease-out group-hover:w-full"></div>
              </button>
              <button 
                onClick={() => router.push('/faq')}
                className="text-white hover:text-white transition-all duration-500 ease-out relative group button-smooth"
              >
                <span className="flex items-center space-x-2">
                  <Icon name="message-square" size={20} className="text-white group-hover:text-white" />
                  <span className="group-hover:text-[#2B7FFF]">자주하는질문</span>
                </span>
                <div className="absolute bottom-[-4px] left-0 w-0 h-1 bg-[#2B7FFF] transition-all duration-500 ease-out group-hover:w-full"></div>
              </button>
              <button 
                onClick={() => router.push('/inquiry')}
                className="text-white/70 hover:text-white transition-all duration-500 ease-out relative group button-smooth"
              >
                <span className="flex items-center space-x-2">
                  <Icon name="help-circle" size={20} className="text-white group-hover:text-white" />
                  <span className="group-hover:text-[#FF6900]">일반문의사항</span>
                </span>
                <div className="absolute bottom-[-4px] left-0 w-0 h-1 bg-[#FF6900] transition-all duration-500 ease-out group-hover:w-full"></div>
              </button>
            </div>
          </div>
        </div>

      {/* 메인 콘텐츠 */}
        <div className="max-w-7xl mx-auto px-6 py-0 w-full animate-fade-in-delayed" style={{marginTop: '-40px'}}>
          <div className="bg-white/80 rounded-lg shadow-xl p-6 relative">
            {/* 새로고침 버튼 - 테이블 박스 좌측 상단 */}
            <button
              onClick={handleRefresh}
              className="absolute top-4 left-4 w-8 h-8 text-gray-600 rounded-lg transition-all duration-300 ease-out button-smooth flex items-center justify-center"
            >
              <Icon name="refresh" size={16} className="text-green-500" />
            </button>

            {/* 제목 및 설명 */}
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">요청 진행사항</h2>
              <p className="text-gray-600">제출한 서비스 요청의 진행 상황을 확인하실 수 있습니다.</p>
            </div>

            {/* 검색 기간 */}
            <div className="flex items-center justify-start mb-6">
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border-2 border-gray-400 rounded-lg text-sm font-medium bg-white shadow-sm focus:border-blue-500 focus:outline-none"
                />
                <span className="text-gray-600 font-medium">~</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border-2 border-gray-400 rounded-lg text-sm font-medium bg-white shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* 테이블 */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full border-collapse bg-white">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border-b border-gray-200 px-6 py-4 text-center text-sm font-semibold text-gray-700">신청번호</th>
                    <th className="border-b border-gray-200 px-6 py-4 text-center text-sm font-semibold text-gray-700">신청제목</th>
                    <th className="border-b border-gray-200 px-6 py-4 text-center text-sm font-semibold text-gray-700">진행</th>
                    <th className="border-b border-gray-200 px-6 py-4 text-center text-sm font-semibold text-gray-700">신청일시</th>
                    <th className="border-b border-gray-200 px-6 py-4 text-center text-sm font-semibold text-gray-700">담당자</th>
                    <th className="border-b border-gray-200 px-6 py-4 text-center text-sm font-semibold text-gray-700">완료일시</th>
                    <th className="border-b border-gray-200 px-6 py-4 text-center text-sm font-semibold text-gray-700">관리</th>
                </tr>
              </thead>
              <tbody>
                  {currentRequests.map((request, index) => (
                    <tr key={request.id} className={`hover:bg-blue-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="border-b border-gray-100 px-6 py-1 text-sm text-blue-600 font-medium">
                        {request.requestNumber}
                      </td>
                      <td className="border-b border-gray-100 px-6 py-1 text-sm text-gray-900 font-medium max-w-xs truncate" title={request.title}>
                        {request.title}
                      </td>
                      <td className="border-b border-gray-100 px-6 py-1 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(getProgressStatus(request.status))}`}>
                          {getProgressStatus(request.status)}
                        </span>
                      </td>
                      <td className="border-b border-gray-100 px-6 py-1 text-sm text-gray-600">
                        {request.requestDate}
                      </td>
                      <td className="border-b border-gray-100 px-6 py-1 text-sm text-gray-600">
                        {request.assignee || '-'}
                      </td>
                      <td className="border-b border-gray-100 px-6 py-1 text-sm text-gray-600">
                        {request.completionDate || '-'}
                      </td>
                      <td className="border-b border-gray-100 px-6 py-1 text-sm">
                        <div className="flex justify-center space-x-2">
                          {getProgressStatus(request.status) === '정상접수' ? (
                            <>
                              <button 
                                onClick={() => handleEditRequest(request)}
                                className="bg-blue-500/80 hover:bg-blue-600/80 text-white px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 button-smooth flex items-center space-x-1"
                              >
                                <Icon name="edit" size={14} className="text-white" />
                                <span>수정</span>
                              </button>
                              <button 
                                onClick={() => handleDeleteRequest(request)}
                                className="bg-red-500/80 hover:bg-red-600/80 text-white px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 button-smooth flex items-center space-x-1"
                              >
                                <Icon name="trash" size={14} className="text-white" />
                                <span>삭제</span>
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={() => handleViewDetails(request)}
                              className="bg-white hover:bg-gray-50 text-black px-9 py-1 rounded-md text-xs font-medium transition-all duration-200 button-smooth flex items-center space-x-1 border border-gray-300 hover:border-gray-400"
                            >
                              <Icon name="eye" size={14} className="text-black" />
                              <span>상세보기</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-600">
                총 {filteredRequests.length}건 중 {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredRequests.length)}건 표시
              </div>
          {totalPages > 1 && (
                <div className="flex items-center space-x-2">
                  <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-out button-smooth flex items-center space-x-1"
                  >
                    <Icon name="chevron-left" size={16} className="text-gray-600" />
                    <span>이전</span>
                  </button>
                  <span className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium">
                    {currentPage}/{totalPages}
                  </span>
                  <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-out button-smooth flex items-center space-x-1"
                  >
                    <span>다음</span>
                    <Icon name="chevron-right" size={16} className="text-white" />
                  </button>
        </div>
      )}
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

      {/* 서비스상세보기 모달 */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">상세보기</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="py-4 px-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 좌측: 서비스 신청 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">서비스 신청 정보</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">신청 번호</label>
                    <p className="text-blue-600 font-medium">{selectedRequest.requestNumber}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">신청 제목</label>
                    <p className="text-gray-800">{selectedRequest.title}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">신청 내용</label>
                    <p className="text-gray-800">{selectedRequest.description}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">신청자</label>
                    <p className="text-gray-800">{selectedRequest.requester} ({selectedRequest.department})</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">신청 연락처</label>
                    <p className="text-gray-800">{selectedRequest.contact}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">신청 위치</label>
                    <p className="text-gray-800">{selectedRequest.location}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">신청 일시</label>
                    <p className="text-gray-800">{selectedRequest.requestDate}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">현재 상태</label>
                    <p className="text-gray-800">{selectedRequest.currentStatus}</p>
                  </div>

                  {/* 대리 신청 정보 */}
                  <div className="bg-yellow-50 py-1 pl-8 pr-8 rounded-lg">
                    <label className="block text-sm font-medium text-gray-600 mb-2">대리 신청</label>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-gray-500">실제 신청자</label>
                        <p className="text-gray-800">{selectedRequest.actualRequester || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">실제 연락처</label>
                        <p className="text-gray-800">{selectedRequest.actualContact || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 우측: 작업 진행 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">작업 진행 정보</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">배정 일시</label>
                    <p className="text-gray-800">{selectedRequest.requestDate}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">서비스 유형</label>
                    <p className="text-gray-800">장애</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">조치 담당자</label>
                    <p className="text-gray-800">{selectedRequest.assignee || '-'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">예정 조율 일시</label>
                    <p className="text-gray-800">-</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">작업 시작 일시</label>
                    <p className="text-gray-800">-</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">작업 내역</label>
                    <p className="text-gray-800">-</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">작업 완료 일시</label>
                    <p className="text-gray-800">{selectedRequest.completionDate || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-end py-4 px-6 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                나가기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 신청정보수정 모달 */}
      {showEditModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800">서비스 신청 정보</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="py-4 px-6 space-y-0">
              {/* 신청 번호 (읽기 전용) */}
              <div>
                <label className="block text-sm font-bold text-blue-600 mb-1 underline">신청 번호</label>
                <p className="text-blue-600 font-medium">{selectedRequest.requestNumber}</p>
              </div>

              {/* 신청 제목 (수정 가능) */}
              <div>
                <label className="block text-sm font-bold text-blue-600 mb-1 underline">신청 제목</label>
                <input
                  type="text"
                  defaultValue={selectedRequest.title}
                  className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 신청 내용 (수정 가능) */}
              <div>
                <label className="block text-sm font-bold text-blue-600 mb-1 underline">신청 내용</label>
                <textarea
                  defaultValue={selectedRequest.description}
                  rows={4}
                  className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 신청자 (읽기 전용) */}
              <div>
                <label className="block text-sm font-bold text-blue-600 mb-1 underline">신청자</label>
                <p className="text-gray-800">{selectedRequest.requester} ({selectedRequest.department})</p>
              </div>

              {/* 신청 연락처 (읽기 전용) */}
              <div>
                <label className="block text-sm font-bold text-blue-600 mb-1 underline">신청 연락처</label>
                <p className="text-gray-800">{selectedRequest.contact}</p>
              </div>

              {/* 신청 위치 (읽기 전용) */}
              <div>
                <label className="block text-sm font-bold text-blue-600 mb-1 underline">신청 위치</label>
                <p className="text-gray-800">{selectedRequest.location}</p>
              </div>

              {/* 신청 일시 (읽기 전용) */}
              <div>
                <label className="block text-sm font-bold text-blue-600 mb-1 underline">신청 일시</label>
                <p className="text-gray-800">{selectedRequest.requestDate}</p>
              </div>

              {/* 현재 상태 (수정 가능) */}
              <div>
                <label className="block text-sm font-bold text-blue-600 mb-1 underline">현재 상태</label>
                <select 
                  defaultValue={selectedRequest.currentStatus}
                  className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="정상작동">정상작동</option>
                  <option value="오류발생">오류발생</option>
                  <option value="메시지창">메시지창</option>
                  <option value="부분불능">부분불능</option>
                  <option value="전체불능">전체불능</option>
                  <option value="점검요청">점검요청</option>
                  <option value="기타상태">기타상태</option>
                </select>
              </div>

              {/* 대리 신청 정보 */}
              <div className="bg-yellow-50 py-1 pl-8 pr-8 rounded-lg">
                <label className="block text-sm font-medium text-gray-600 mb-2">대리 신청</label>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-500">실제 신청자</label>
                    <p className="text-gray-800">{selectedRequest.actualRequester || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">실제 연락처</label>
                    <p className="text-gray-800">{selectedRequest.actualContact || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-end py-4 px-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setShowEditSuccessModal(true)
                }}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                수정 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 신청정보삭제 모달 */}
      {showDeleteModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800">서비스 신청 정보</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="py-4 px-6 space-y-0">
              {/* 신청 번호 */}
              <div>
                <label className="block text-sm font-bold text-blue-600 mb-1 underline">신청 번호</label>
                <p className="text-blue-600 font-medium">{selectedRequest.requestNumber}</p>
              </div>

              {/* 신청 제목 */}
              <div>
                <label className="block text-sm font-bold text-blue-600 mb-1 underline">신청 제목</label>
                <p className="text-gray-800">{selectedRequest.title}</p>
              </div>

              {/* 신청 내용 */}
              <div>
                <label className="block text-sm font-bold text-blue-600 mb-1 underline">신청 내용</label>
                <p className="text-gray-800">{selectedRequest.description}</p>
              </div>

              {/* 신청자 */}
              <div>
                <label className="block text-sm font-bold text-blue-600 mb-1 underline">신청자</label>
                <p className="text-gray-800">{selectedRequest.requester} ({selectedRequest.department})</p>
              </div>

              {/* 신청 연락처 */}
              <div>
                <label className="block text-sm font-bold text-blue-600 mb-1 underline">신청 연락처</label>
                <p className="text-gray-800">{selectedRequest.contact}</p>
              </div>

              {/* 신청 위치 */}
              <div>
                <label className="block text-sm font-bold text-blue-600 mb-1 underline">신청 위치</label>
                <p className="text-gray-800">{selectedRequest.location}</p>
              </div>

              {/* 신청 일시 */}
              <div>
                <label className="block text-sm font-bold text-blue-600 mb-1 underline">신청 일시</label>
                <p className="text-gray-800">{selectedRequest.requestDate}</p>
              </div>

              {/* 현재 상태 */}
              <div>
                <label className="block text-sm font-bold text-blue-600 mb-1 underline">현재 상태</label>
                <p className="text-gray-800">{selectedRequest.currentStatus}</p>
              </div>

              {/* 대리 신청 정보 */}
              <div className="bg-yellow-50 py-1 pl-8 pr-8 rounded-lg">
                <label className="block text-sm font-medium text-gray-600 mb-2">대리 신청</label>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-500">실제 신청자</label>
                    <p className="text-gray-800">{selectedRequest.actualRequester || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">실제 연락처</label>
                    <p className="text-gray-800">{selectedRequest.actualContact || '-'}</p>
                  </div>
                </div>
              </div>

              {/* 삭제 확인 메시지 */}
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="text-red-700 font-medium text-center">
                  정말로 이 서비스 신청을 삭제하시겠습니까?
                </p>
                <p className="text-red-600 text-sm text-center mt-1">
                  삭제된 데이터는 복구할 수 없습니다.
                </p>
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-end py-4 px-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setShowDeleteSuccessModal(true)
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                삭제 완료
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
                  defaultValue="user@itsm.com"
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
                  defaultValue="이영희"
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
                  defaultValue="사원"
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
                  defaultValue="생산부"
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
                  defaultValue="010-9870-1234"
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
                  <Icon name="mail" size={16} className="mr-2" />
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

      {/* 비밀번호 변경 모달 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800">비밀번호 변경</h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="py-4 px-6 space-y-3">
              {/* 현재 비밀번호 */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
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

              {/* 새 비밀번호 */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
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

              {/* 비밀번호 확인 */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
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
                onClick={() => setShowPasswordModal(false)}
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

      {/* 삭제 완료 메시지 모달 */}
      {showDeleteSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-bounce-in">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <img src="/icons/check-circle.svg" alt="완료" className="w-12 h-12" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2 animate-fade-in-up">삭제 완료</h2>
              <p className="text-gray-600 mb-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                서비스 신청이 성공적으로 삭제되었습니다.
              </p>
              <button
                onClick={() => {
                  setShowDeleteSuccessModal(false)
                  setSelectedRequest(null)
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 button-smooth animate-fade-in-up"
                style={{animationDelay: '0.4s'}}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 수정 완료 메시지 모달 */}
      {showEditSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-bounce-in">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <img src="/icons/check-circle.svg" alt="완료" className="w-12 h-12" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2 animate-fade-in-up">수정 완료</h2>
              <p className="text-gray-600 mb-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                서비스 신청이 성공적으로 수정되었습니다.
              </p>
              <button
                onClick={() => {
                  setShowEditSuccessModal(false)
                  setSelectedRequest(null)
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 button-smooth animate-fade-in-up"
                style={{animationDelay: '0.4s'}}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 회원정보 수정 완료 메시지 모달 */}
      {showInfoSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-bounce-in">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <img src="/icons/check-circle.svg" alt="완료" className="w-12 h-12" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2 animate-fade-in-up">변경 완료</h2>
              <p className="text-gray-600 mb-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                회원정보가 성공적으로 변경되었습니다.
              </p>
              <button
                onClick={() => setShowInfoSuccessModal(false)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 button-smooth animate-fade-in-up"
                style={{animationDelay: '0.4s'}}
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