"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/ui/Icon'

interface Inquiry {
  id: string
  inquiryDate: string
  content: string
  inquirer: string
  answerDate?: string
  isSecret: boolean
  answer?: string
  answerer?: string
}

export default function InquiryPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [showWriteModal, setShowWriteModal] = useState(false)
  const [showAnswerModal, setShowAnswerModal] = useState(false)
  const [showWriteSuccessModal, setShowWriteSuccessModal] = useState(false)
  const [showMyPostsOnly, setShowMyPostsOnly] = useState(false)
  // 기본값: 당일 기준 1개월 전
  const today = new Date()
  const oneMonthAgo = new Date(today)
  oneMonthAgo.setMonth(today.getMonth() - 1)
  
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }
  
  const [startDate, setStartDate] = useState(formatDate(oneMonthAgo))
  const [endDate, setEndDate] = useState(formatDate(today))
  const [inquiryContent, setInquiryContent] = useState('')
  const [isSecret, setIsSecret] = useState(false)
  const router = useRouter()

  // 현재 사용자 (실제로는 로그인 정보에서 가져와야 함)
  const currentUser = '홍길순'

  // 더미 데이터
  const [inquiries] = useState<Inquiry[]>([
    {
      id: '1',
      inquiryDate: '2025-08-31 14:00',
      content: '모니터 전원 문의',
      inquirer: '홍길순',
      answerDate: '2025-08-31 15:00',
      isSecret: false,
      answer: '모니터 전원 케이블을 한번 더 꼽아 주세요!\n모니터 전원 버튼을 켜 주십시요\n이상과 같이 조치가 되지 않을 따는 서비스 신청 해 주세요!',
      answerer: '관리자'
    },
    {
      id: '2',
      inquiryDate: '2025-08-31 13:00',
      content: '네트워크 문의',
      inquirer: '김**',
      isSecret: true
    },
    {
      id: '3',
      inquiryDate: '2025-08-31 12:00',
      content: '프린터 드라이버 업데이트',
      inquirer: '이**',
      isSecret: true
    },
    {
      id: '4',
      inquiryDate: '2025-08-31 11:00',
      content: '이메일 문의',
      inquirer: '박**',
      answerDate: '2025-08-31 12:00',
      isSecret: false,
      answer: '이메일 서버 점검 중입니다. 오후 3시 이후에 다시 시도해 주세요.',
      answerer: '관리자'
    },
    {
      id: '5',
      inquiryDate: '2025-08-31 10:00',
      content: '컴퓨터 속도 문의',
      inquirer: '최**',
      answerDate: '2025-08-31 11:00',
      isSecret: false,
      answer: '불필요한 프로그램을 종료해주세요.',
      answerer: '김기술'
    },
    {
      id: '6',
      inquiryDate: '2025-08-31 09:00',
      content: '보안 프로그램 문의',
      inquirer: '정**',
      isSecret: true
    },
    {
      id: '7',
      inquiryDate: '2025-08-30 16:00',
      content: '데이터베이스 접속 문의',
      inquirer: '한**',
      answerDate: '2025-08-30 17:00',
      isSecret: false,
      answer: '데이터베이스 서버를 재시작했습니다.',
      answerer: '최기술'
    },
    {
      id: '8',
      inquiryDate: '2025-08-30 15:00',
      content: '웹사이트 접속 문의',
      inquirer: '윤**',
      isSecret: true
    },
    {
      id: '9',
      inquiryDate: '2025-08-30 14:00',
      content: '파일 복구 문의',
      inquirer: '서**',
      answerDate: '2025-08-30 15:00',
      isSecret: false,
      answer: '휴지통에서 복구 가능합니다.',
      answerer: '한기술'
    },
    {
      id: '10',
      inquiryDate: '2025-08-30 13:00',
      content: '소프트웨어 설치 문의',
      inquirer: '강**',
      isSecret: true
    },
    {
      id: '11',
      inquiryDate: '2025-08-30 12:00',
      content: '시스템 업데이트 문의',
      inquirer: '조**',
      answerDate: '2025-08-30 13:00',
      isSecret: false,
      answer: '시스템 업데이트를 진행했습니다.',
      answerer: '윤기술'
    },
    {
      id: '12',
      inquiryDate: '2025-08-30 11:00',
      content: '백업 문의',
      inquirer: '임**',
      isSecret: true
    },
    {
      id: '13',
      inquiryDate: '2025-08-30 10:00',
      content: '네트워크 속도 문의',
      inquirer: '오**',
      answerDate: '2025-08-30 11:00',
      isSecret: false,
      answer: '네트워크 설정을 확인했습니다.',
      answerer: '박기술'
    },
    {
      id: '14',
      inquiryDate: '2025-08-30 09:00',
      content: '프린터 용지 문의',
      inquirer: '남**',
      isSecret: true
    }
  ])

  // 검색 조건이 변경될 때 페이지를 1로 리셋
  useEffect(() => {
    setCurrentPage(1)
  }, [startDate, endDate, showMyPostsOnly])

  // 필터링된 문의 목록
  const filteredInquiries = inquiries.filter(inquiry => {
    // 작성글만 보기 필터
    if (showMyPostsOnly && inquiry.inquirer !== currentUser) return false
    
    // 날짜 범위 필터
    if (startDate && endDate) {
      // 날짜 형식 변환 (YYYY-MM-DD -> YYYY.MM.DD)
      const inquiryDate = inquiry.inquiryDate.split(' ')[0].replace(/\./g, '-')
      const startDateFormatted = startDate
      const endDateFormatted = endDate
      
      return inquiryDate >= startDateFormatted && inquiryDate <= endDateFormatted
    }
    
    return true
  })

  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedInquiries = filteredInquiries.slice(startIndex, startIndex + itemsPerPage)

  const handleWriteInquiry = () => {
    setShowWriteModal(true)
  }

  const handleSubmitInquiry = () => {
    // 문의 내용 유효성 검사
    if (!inquiryContent.trim()) {
      alert('문의 내용을 입력해주세요.')
      return
    }
    
    if (inquiryContent.trim().length < 10) {
      alert('문의 내용을 10자 이상 입력해주세요.')
      return
    }
    
    // 실제로는 API 호출
    console.log('문의 등록:', { content: inquiryContent, isSecret })
    setShowWriteModal(false)
    setShowWriteSuccessModal(true)
    setInquiryContent('')
    setIsSecret(false)
  }

  const handleViewAnswer = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry)
    setShowAnswerModal(true)
  }

  const handleRefresh = () => {
    setCurrentPage(1)
    setShowMyPostsOnly(false)
    setStartDate('2025-08-31')
    setEndDate('2025-08-31')
  }

  const formatInquirerName = (name: string) => {
    if (name === currentUser) return name
    return name.charAt(0) + '**'
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 배경 이미지 */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/image/배경_일반문의사항_페이지.jpg')",
          filter: 'blur(0px)'
        }}
      />

      {/* 배경 오버레이 - 텍스트 가독성 향상 */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      {/* 배경 그리드 패턴 - 추가 텍스처 */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      {/* 메인 콘텐츠 */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* 헤더 */}
        <div className="relative z-20">
          <div className="flex justify-between items-center p-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Icon name="laptop" size={24} className="text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-3xl font-bold text-white truncate">IT Service Management</h1>
                <p className="text-gray-300 text-sm">통합 IT 서비스 관리 시스템</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/')}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-out button-smooth"
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* 사용자 정보 및 네비게이션 */}
        <div className="max-w-7xl mx-auto px-6 py-6 w-full">
          {/* 사용자 정보 및 네비게이션 */}
          <div className="flex items-center justify-between mb-12">
            <div className="bg-white px-20 py-0 rounded-full -ml-74 smooth-hover animate-fade-in shadow-lg" style={{marginLeft: '-310px'}}>
              <span className="text-black font-medium" style={{fontSize: '14px'}}>일반사용자 (이영희)</span>
            </div>
            <div className="flex absolute" style={{left: '50%', transform: 'translateX(-350px)', gap: '170px'}}>
              <button 
                onClick={() => router.push('/progress')}
                className="text-white/70 hover:text-white transition-all duration-500 ease-out relative group button-smooth"
              >
                <span className="flex items-center space-x-2">
                  <Icon name="bar-chart" size={20} className="text-white/70 group-hover:text-white" />
                  <span className="group-hover:text-[#00C950]">요청 진행사항</span>
                </span>
                <div className="absolute bottom-[-4px] left-0 w-0 h-1 bg-[#00C950] transition-all duration-500 ease-out group-hover:w-full"></div>
              </button>
              <button 
                onClick={() => router.push('/service-request')}
                className="text-white/70 hover:text-white transition-all duration-500 ease-out relative group button-smooth"
              >
                <span className="flex items-center space-x-2">
                  <Icon name="document" size={20} className="text-white/70 group-hover:text-white" />
                  <span className="group-hover:text-[#AD46FF]">서비스신청</span>
                </span>
                <div className="absolute bottom-[-4px] left-0 w-0 h-1 bg-[#AD46FF] transition-all duration-500 ease-out group-hover:w-full"></div>
              </button>
              <button 
                onClick={() => router.push('/faq')}
                className="text-white/70 hover:text-white transition-all duration-500 ease-out relative group button-smooth"
              >
                <span className="flex items-center space-x-2">
                  <Icon name="help-circle" size={20} className="text-white/70 group-hover:text-white" />
                  <span className="group-hover:text-[#FF6900]">자주하는 질문</span>
                </span>
                <div className="absolute bottom-[-4px] left-0 w-0 h-1 bg-[#FF6900] transition-all duration-500 ease-out group-hover:w-full"></div>
              </button>
            </div>
          </div>


        {/* 메인 콘텐츠 */}
        <div className="max-w-7xl mx-auto px-6 py-0 w-full animate-fade-in-delayed" style={{marginTop: '-30px'}}>
          <div className="bg-white/80 rounded-lg shadow-xl p-6 relative">
            {/* 새로고침 버튼 - 테이블 박스 좌측 상단 */}
            <button
              onClick={handleRefresh}
              className="absolute top-4 left-4 w-8 h-8 text-gray-600 rounded-lg transition-all duration-300 ease-out button-smooth flex items-center justify-center"
            >
              <img src="/icons/refresh.svg" alt="새로고침" className="w-4 h-4 text-green-500" />
            </button>

            {/* 제목 및 설명 */}
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">일반 문의사항</h2>
              <p className="text-gray-600">일반적인 묻고 답변 하기 형식의 문의 입니다.</p>
            </div>

            {/* 컨트롤 패널 */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleWriteInquiry}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                  style={{ fontFamily: 'var(--figma-font-family)' }}
                >
                  문의 글쓰기
                </button>
                <button
                  onClick={() => setShowMyPostsOnly(!showMyPostsOnly)}
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                    showMyPostsOnly 
                      ? 'bg-blue-500 text-white shadow-md transform scale-95' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200 hover:shadow-sm'
                  }`}
                  style={{ fontFamily: 'var(--figma-font-family)' }}
                >
                  {showMyPostsOnly ? '전체글 보기' : '작성글만 보기'}
                </button>
              </div>
              
              <div className="flex items-center space-x-4">
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
            </div>

            {/* 테이블 */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full border-collapse bg-white">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border-b border-gray-200 px-6 py-4 text-center text-sm font-semibold text-gray-700">문의 일시</th>
                    <th className="border-b border-gray-200 px-6 py-4 text-center text-sm font-semibold text-gray-700">문의 내용</th>
                    <th className="border-b border-gray-200 px-6 py-4 text-center text-sm font-semibold text-gray-700">문의자</th>
                    <th className="border-b border-gray-200 px-6 py-4 text-center text-sm font-semibold text-gray-700">답변일시</th>
                    <th className="border-b border-gray-200 px-6 py-4 text-center text-sm font-semibold text-gray-700">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedInquiries.map((inquiry) => (
                    <tr key={inquiry.id} className="hover:bg-gray-50">
                      <td className="border-b border-gray-200 px-6 py-2 text-center text-sm text-gray-900">
                        {inquiry.inquiryDate}
                      </td>
                      <td className="border-b border-gray-200 px-6 py-2 text-center text-sm text-gray-900">
                        {inquiry.content}
                      </td>
                      <td className="border-b border-gray-200 px-6 py-2 text-center text-sm text-gray-900">
                        {formatInquirerName(inquiry.inquirer)}
                      </td>
                      <td className="border-b border-gray-200 px-6 py-2 text-center text-sm text-gray-900">
                        {inquiry.answerDate || '-'}
                      </td>
                      <td className="border-b border-gray-200 px-6 py-2 text-center text-sm text-gray-900">
                        {inquiry.isSecret ? (
                          <img src="/icons/lock.svg" alt="비밀글" className="w-4 h-4 text-gray-400 mx-auto" />
                        ) : inquiry.answerDate ? (
                          <button
                            onClick={() => handleViewAnswer(inquiry)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            답변 보기
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-600">
                총 {filteredInquiries.length}건 중 {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredInquiries.length)}건 표시
              </div>
              {totalPages > 1 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-out button-smooth flex items-center space-x-1"
                  >
                    <img src="/icons/chevron-left.svg" alt="이전" className="w-4 h-4 text-gray-600" />
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
                    <img src="/icons/chevron-right.svg" alt="다음" className="w-4 h-4 text-white" />
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

      </div>

      {/* 문의글쓰기 모달 */}
      {showWriteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">문의글쓰기</h2>
              <button
                onClick={() => setShowWriteModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <img src="/icons/close.svg" alt="닫기" className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">문의일시</label>
                <input
                  type="text"
                  value="2025-08-31 오후 03:00"
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">문의자</label>
                <input
                  type="text"
                  value={currentUser}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">문의내용</label>
                <textarea
                  value={inquiryContent}
                  onChange={(e) => setInquiryContent(e.target.value)}
                  placeholder="일반적인 묻고 답하기로 작성해 주세요! (최소 10자 이상)"
                  className={`w-full px-3 py-2 border rounded-lg h-32 resize-none ${
                    inquiryContent.trim().length > 0 && inquiryContent.trim().length < 10
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                />
                <div className="flex justify-between items-center mt-1">
                  <span className={`text-xs ${
                    inquiryContent.trim().length > 0 && inquiryContent.trim().length < 10
                      ? 'text-red-500'
                      : 'text-gray-500'
                  }`}>
                    {inquiryContent.trim().length > 0 && inquiryContent.trim().length < 10
                      ? '최소 10자 이상 입력해주세요.'
                      : '문의 내용을 자세히 작성해주세요.'
                    }
                  </span>
                  <span className="text-xs text-gray-400">
                    {inquiryContent.length}/500
                  </span>
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isSecret"
                  checked={isSecret}
                  onChange={(e) => setIsSecret(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isSecret" className="ml-2 block text-sm text-gray-700">
                  비밀글 여부
                </label>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 flex justify-end">
              <button
                onClick={handleSubmitInquiry}
                disabled={!inquiryContent.trim() || inquiryContent.trim().length < 10}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  !inquiryContent.trim() || inquiryContent.trim().length < 10
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                문의 등록
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 답변보기 모달 */}
      {showAnswerModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">답변 보기</h2>
              <button
                onClick={() => setShowAnswerModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <img src="/icons/close.svg" alt="닫기" className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">문의 일시</label>
                  <input
                    type="text"
                    value={selectedInquiry.inquiryDate}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">문의자</label>
                  <input
                    type="text"
                    value={formatInquirerName(selectedInquiry.inquirer)}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">문의 내용</label>
                <input
                  type="text"
                  value={selectedInquiry.content}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">답변내용</label>
                <textarea
                  value={selectedInquiry.answer || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-green-50 text-gray-700 h-32 resize-none"
                />
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-end py-4 px-6 border-t border-gray-200">
              <button
                onClick={() => setShowAnswerModal(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                나가기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 등록 완료 메시지 모달 */}
      {showWriteSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-bounce-in">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <img src="/icons/check-circle.svg" alt="완료" className="w-12 h-12" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2 animate-fade-in-up">등록 완료</h2>
              <p className="text-gray-600 mb-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                문의글이 성공적으로 등록되었습니다.
              </p>
              <button
                onClick={() => setShowWriteSuccessModal(false)}
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