"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/ui/Icon'

export default function ServiceRequestPage() {
  const [formData, setFormData] = useState({
    requestDate: '2025-09-01 오후 12:00',
    currentStatus: '정상작동',
    managementNumber: 'Desktop-20250101-123456',
    location: '',
    requester: '홍길동',
    requesterContact: '010-1234-5678',
    requesterDept: 'IT운영팀',
    isProxyRequest: false,
    actualRequester: '',
    actualContact: '',
    actualDept: '',
    title: '',
    content: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    router.push('/')
  }

  const statusOptions = [
    { value: '정상작동', label: '정상작동' },
    { value: '오류발생', label: '오류발생' },
    { value: '메시지창', label: '메시지창' },
    { value: '부분불능', label: '부분불능' },
    { value: '전체불능', label: '전체불능' },
    { value: '점검요청', label: '점검요청' },
    { value: '기타상태', label: '기타상태' }
  ]

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // 폼 유효성 검사
    if (!formData.currentStatus || !formData.title || !formData.content) {
      alert('필수 항목을 모두 입력해주세요.')
      setIsSubmitting(false)
      return
    }

    // 대리신청인 경우 실제신청자 정보 필수
    if (formData.isProxyRequest && (!formData.actualRequester || !formData.actualContact || !formData.actualDept)) {
      alert('대리신청인 경우 실제신청자 정보를 모두 입력해주세요.')
      setIsSubmitting(false)
      return
    }

    try {
      // 서비스 신청 처리 로직
      const requestData = {
        ...formData,
        requestNumber: `SR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        stage: '접수'
      }

      console.log('서비스 신청 데이터:', requestData)
      
      // 성공 처리
      setShowModal(true)
      setTimeout(() => {
        router.push('/progress')
      }, 2000)

    } catch (error) {
      console.error('서비스 신청 오류:', error)
      alert('서비스 신청 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 배경 이미지 */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/image/배경_서비스신청_페이지.jpg')",
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
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#00C950] group-hover:w-full transition-all duration-300 ease-out"></div>
              </button>
              <button 
                onClick={() => router.push('/faq')}
                className="text-white/70 hover:text-white transition-all duration-500 ease-out relative group button-smooth"
              >
                <span className="flex items-center space-x-2">
                  <Icon name="message-square" size={20} className="text-white/70 group-hover:text-white" />
                  <span className="group-hover:text-[#2B7FFF]">자주하는 질문</span>
                </span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2B7FFF] group-hover:w-full transition-all duration-300 ease-out"></div>
              </button>
              <button 
                onClick={() => router.push('/inquiry')}
                className="text-white/70 hover:text-white transition-all duration-500 ease-out relative group button-smooth"
              >
                <span className="flex items-center space-x-2">
                  <Icon name="help-circle" size={20} className="text-white/70 group-hover:text-white" />
                  <span className="group-hover:text-[#FF6900]">일반 문의사항</span>
                </span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FF6900] group-hover:w-full transition-all duration-300 ease-out"></div>
              </button>
            </div>
          </div>
        </div>

        {/* 좌측 구석 설명 영역 */}
        <div className="absolute left-8 top-1/2 transform -translate-y-1/2 z-10">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg max-w-xs smooth-hover animate-fade-in text-center">
            <h2 className="text-2xl font-bold text-white mb-3">서비스 신청</h2>
            <p className="text-gray-200 leading-relaxed text-sm text-left">
              IT 서비스 관련 요청, 장애신고, 변경 요청 등을 제출할 수 있습니다.
            </p>
          </div>
        </div>

        {/* 메인 콘텐츠 - 모달 */}
        <div className="w-full mx-auto py-8" style={{marginTop: '-80px', paddingLeft: '380px', paddingRight: '380px'}}>
          <div className="flex justify-center">
            <div className="w-full" style={{maxWidth: '1160px'}}>
              <div className="bg-white rounded-lg shadow-2xl p-1 smooth-hover animate-fade-in" style={{paddingLeft: '30px', paddingRight: '30px'}}>
                <div className="flex items-center justify-end mb-6">
                  <button
                    onClick={() => router.push('/progress')}
                    className="text-gray-400 hover:text-gray-600 transition-colors text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* 1열: 기본 정보 - 4컬럼 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        신청일시
                      </label>
                      <input
                        type="text"
                        value={formData.requestDate}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        현재상태
                      </label>
                      <select
                        value={formData.currentStatus}
                        onChange={(e) => handleInputChange('currentStatus', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        관리번호
                      </label>
                      <input
                        type="text"
                        value={formData.managementNumber}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        신청 위치
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="예: 본사 3층 NOC"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* 2열: 신청자 정보 - 4컬럼 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        신청자
                      </label>
                      <input
                        type="text"
                        value={formData.requester}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        신청 연락처
                      </label>
                      <input
                        type="text"
                        value={formData.requesterContact}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        신청 소속
                      </label>
                      <input
                        type="text"
                        value={formData.requesterDept}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        대리신청 여부
                      </label>
                      <div className="flex items-center h-10">
                        <input
                          type="checkbox"
                          id="isProxyRequest"
                          checked={formData.isProxyRequest}
                          onChange={(e) => handleInputChange('isProxyRequest', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isProxyRequest" className="ml-2 block text-sm font-medium text-gray-700">
                          대리신청 여부
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* 3열: 대리신청 상세 정보 */}
                  {formData.isProxyRequest && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4 bg-blue-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          실제신청자
                        </label>
                        <input
                          type="text"
                          value={formData.actualRequester}
                          onChange={(e) => handleInputChange('actualRequester', e.target.value)}
                          placeholder="실제 신청자명을 입력하세요"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          실제연락처
                        </label>
                        <input
                          type="text"
                          value={formData.actualContact}
                          onChange={(e) => handleInputChange('actualContact', e.target.value)}
                          placeholder="실제 연락처를 입력하세요"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          실제소속
                        </label>
                        <input
                          type="text"
                          value={formData.actualDept}
                          onChange={(e) => handleInputChange('actualDept', e.target.value)}
                          placeholder="실제 소속을 입력하세요"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div></div>
                    </div>
                  )}

                  {/* 5열: 신청 내용 */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        신청 제목
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="예: 이메일 서비스 장애 신고"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        신청 내용
                      </label>
                      <textarea
                        value={formData.content}
                        onChange={(e) => handleInputChange('content', e.target.value)}
                        placeholder="증상, 발생 시각, 영향 범위 등을 자세히 작성해 주세요!"
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* 제출 버튼 */}
                  <div className="flex justify-end pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          신청 중...
                        </>
                      ) : (
                        '신청하기'
                      )}
                    </button>
                  </div>
                </form>
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

      {/* 성공 모달 */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[60]" style={{backgroundColor: 'rgba(0, 0, 0, 0.8)'}}>
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md mx-4 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <img src="/icons/check-circle.svg" alt="완료" className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">신청이 완료되었습니다!</h2>
            <p className="text-gray-600 mb-4">
              서비스 신청이 성공적으로 접수되었습니다.<br />
              요청진행사항 페이지로 이동합니다.
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        </div>
      )}
    </div>
  )
}