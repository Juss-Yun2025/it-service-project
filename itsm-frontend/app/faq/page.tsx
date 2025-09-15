"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/ui/Icon'

interface FAQ {
  id: string
  icon: string
  summary: string
  content: string
  category: string
  solution: string
  persistentIssue: string
  isLocked: boolean
  createdAt: string
  updatedAt: string
}

export default function FAQPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null)
  const [isManager, setIsManager] = useState(false) // 관리매니저 권한 확인
  const router = useRouter()

  // Figma 디자인에 맞춘 FAQ 데이터
  const [faqs] = useState<FAQ[]>([
    {
      id: '1',
      icon: '📧',
      summary: '이메일 접속 불가',
      content: '이메일 서비스에 접속할 수 없는 경우 발생하는 문제입니다.',
      category: '이메일',
      solution: '1. 브라우저 캐시 및 쿠키 삭제\n2. 다른 브라우저로 시도\n3. 네트워크 연결 상태 확인',
      persistentIssue: '위 방법으로 해결되지 않으면 IT팀에 문의하세요.',
      isLocked: false,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: '2',
      icon: '📤',
      summary: '파일 업로드 오류',
      content: '파일 업로드 시 오류가 발생하는 경우입니다.',
      category: '파일서버',
      solution: '1. 파일 크기 확인 (최대 100MB)\n2. 파일 형식 확인\n3. 브라우저 새로고침',
      persistentIssue: '문제가 지속되면 파일서버 관리팀에 문의하세요.',
      isLocked: false,
      createdAt: '2024-01-14',
      updatedAt: '2024-01-14'
    },
    {
      id: '3',
      icon: '🔒',
      summary: '네트워크 연결 오류',
      content: '네트워크 연결이 되지 않은 경우 발생하는 문제입니다.',
      category: '네트워크',
      solution: '1. 네트워크 케이블 연결 확인\n2. Wi-Fi 연결 상태 확인\n3. 라우터 재시작',
      persistentIssue: '문제가 지속되면 네트워크 관리팀에 문의하세요.',
      isLocked: false,
      createdAt: '2024-01-13',
      updatedAt: '2024-01-13'
    },
    {
      id: '4',
      icon: '🌐',
      summary: '웹사이트 접속 불가',
      content: '내부 웹사이트에 접속할 수 없는 경우입니다.',
      category: '웹서비스',
      solution: '1. URL 주소 확인\n2. 브라우저 캐시 삭제\n3. DNS 설정 확인',
      persistentIssue: '문제가 지속되면 웹서비스 관리팀에 문의하세요.',
      isLocked: false,
      createdAt: '2024-01-12',
      updatedAt: '2024-01-12'
    },
    {
      id: '5',
      icon: '🖨️',
      summary: '프린터 인쇄 오류',
      content: '프린터 인쇄가 되지 않는 경우입니다.',
      category: '하드웨어',
      solution: '1. 프린터 전원 및 연결 상태 확인\n2. 프린터 드라이버 재설치\n3. 인쇄 큐 초기화',
      persistentIssue: '문제가 지속되면 하드웨어 지원팀에 문의하세요.',
      isLocked: false,
      createdAt: '2024-01-11',
      updatedAt: '2024-01-11'
    },
    {
      id: '6',
      icon: '💻',
      summary: '소프트웨어 설치',
      content: '새로운 소프트웨어 설치 요청입니다.',
      category: '소프트웨어',
      solution: '1. 관리자 권한 확인\n2. 시스템 요구사항 확인\n3. 설치 파일 무결성 확인',
      persistentIssue: '설치가 불가능한 경우 소프트웨어 지원팀에 문의하세요.',
      isLocked: false,
      createdAt: '2024-01-10',
      updatedAt: '2024-01-10'
    },
    {
      id: '7',
      icon: '🖥️',
      summary: '컴퓨터 느림 현상',
      content: '컴퓨터가 갑자기 느려지는 현상입니다.',
      category: '성능',
      solution: '1. 불필요한 프로그램 종료\n2. 디스크 정리 실행\n3. 재부팅 시도',
      persistentIssue: '문제가 지속되면 시스템 관리팀에 문의하세요.',
      isLocked: false,
      createdAt: '2024-01-09',
      updatedAt: '2024-01-09'
    },
    {
      id: '8',
      icon: '🔐',
      summary: '비밀번호 초기화',
      content: '시스템 로그인 비밀번호를 잊어버린 경우입니다.',
      category: '보안',
      solution: '1. 비밀번호 찾기 기능 사용\n2. IT팀에 초기화 요청\n3. 보안 정책 확인',
      persistentIssue: '보안상의 이유로 직접 초기화는 불가능합니다.',
      isLocked: false,
      createdAt: '2024-01-08',
      updatedAt: '2024-01-08'
    },
    {
      id: '9',
      icon: '📱',
      summary: '모바일 앱 오류',
      content: '모바일 애플리케이션에서 오류가 발생하는 경우입니다.',
      category: '모바일',
      solution: '1. 앱 재시작\n2. 앱 업데이트 확인\n3. 디바이스 재부팅',
      persistentIssue: '문제가 지속되면 모바일 지원팀에 문의하세요.',
      isLocked: false,
      createdAt: '2024-01-07',
      updatedAt: '2024-01-07'
    }
  ])

  const itemsPerPage = 6
  const totalPages = Math.ceil(faqs.length / itemsPerPage)
  const currentFAQs = faqs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleFAQClick = (faq: FAQ) => {
    setSelectedFAQ(faq)
  }

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    router.push('/');
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 메인 배경 이미지 */}
      <div 
        className="absolute inset-0 bg-no-repeat"
        style={{
          backgroundImage: `url('/image/배경_자주하는질문_페이지.jpg')`,
          backgroundSize: '1920px 1080px',
          backgroundPosition: 'center center'
        }}
      ></div>
      
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
              onClick={handleLogout}
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
            <div className="bg-white px-20 py-0 rounded-full -ml-74 smooth-hover animate-fade-in shadow-lg">
              <span className="text-black font-medium">일반사용자 (이영희)</span>
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
                onClick={() => router.push('/inquiry')}
                className="text-white/70 hover:text-white transition-all duration-500 ease-out relative group button-smooth"
              >
                <span className="flex items-center space-x-2">
                  <Icon name="help-circle" size={20} className="text-white/70 group-hover:text-white" />
                  <span className="group-hover:text-[#FF6900]">일반 문의사항</span>
                </span>
                          <div className="absolute bottom-[-4px] left-0 w-0 h-1 bg-[#FF6900] transition-all duration-500 ease-out group-hover:w-full"></div>
              </button>
            </div>
          </div>

          {/* 좌측 구석 설명 영역 */}
          <div className="absolute left-8 top-1/2 transform -translate-y-1/2 z-10">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg max-w-xs smooth-hover animate-fade-in text-center">
              <h2 className="text-2xl font-bold text-white mb-3">자주하는 질문</h2>
              <p className="text-gray-200 leading-relaxed text-sm text-left">
                자주 발생하는 IT 문제에 대한 빠른 해결책을 제공합니다. 
                문제 유형을 선택하면 즉시 대응 방안을 확인할 수 있습니다.
              </p>
            </div>
          </div>

          {/* 중간 FAQ 카드 그리드 */}
          <div className="w-full max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* FAQ 카드들 */}
              {currentFAQs.map((faq) => (
                <div
                  key={faq.id}
                  onClick={() => handleFAQClick(faq)}
                  className="bg-white rounded-xl cursor-pointer hover:shadow-2xl transition-all duration-500 ease-out transform hover:scale-105 flex flex-col h-full smooth-hover animate-fade-in"
                  style={{padding: '20px 30px'}}
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
                  <div className="flex justify-start items-center mt-auto">
                    <span className="text-sm px-4 rounded-full bg-blue-100 text-blue-800 font-medium" style={{paddingTop: '0px', paddingBottom: '0px'}}>
                      {faq.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white/20 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/30 transition-all duration-300 ease-out button-smooth"
            >
              이전
            </button>
            <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white/20 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/30 transition-all duration-300 ease-out button-smooth"
            >
              다음
            </button>
          </div>
        )}
      </div>

      {/* 푸터 */}
      <div className="absolute bottom-4 left-4 right-4 text-center">
        <span className="text-sm text-gray-400">
          © 2025 IT 서비스 관리 시스템. 모든 권리는 Juss 가 보유
        </span>
      </div>

      {/* FAQ 상세보기 모달 */}
      {selectedFAQ && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full smooth-hover animate-fade-in">
            {/* 헤더 */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">자주하는 질문</h2>
              <button
                onClick={() => setSelectedFAQ(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 메인 콘텐츠 */}
            <div className="p-6">
              {/* 아이콘과 제목 */}
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">{selectedFAQ.icon}</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {selectedFAQ.summary}
                </h3>
                <p className="text-gray-600">
                  {selectedFAQ.content}
                </p>
              </div>

              {/* 즉시 해결방법 */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">즉시 해결방법</h4>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <ul className="space-y-2 text-gray-700">
                    {selectedFAQ.solution.split('\n').map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>{item.replace(/^\d+\.\s*/, '')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 문제가 지속될 경우 */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">문제가 지속될 경우</h4>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-gray-700">
                    위 방법으로 해결되지 않으면 아래 서비스 신청 해 주세요!
                  </p>
                </div>
              </div>

              {/* 서비스 신청 버튼 */}
              <button 
                className="w-full bg-black text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-colors"
                onClick={() => {
                  // 서비스 신청 페이지로 이동
                  router.push('/service-request');
                }}
              >
                서비스 신청
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
