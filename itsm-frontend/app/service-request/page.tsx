"use client"

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { ArrowLeft, Save, Check } from 'lucide-react'

export default function ServiceRequestPage() {
  const [formData, setFormData] = useState({
    currentStatus: '',
    managementNumber: '',
    location: '',
    isProxyRequest: false,
    actualRequester: '',
    actualContact: '',
    actualDept: '',
    title: '',
    content: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

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
        requestDate: new Date().toISOString(),
        requestNumber: `SR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        requester: '김사용자', // 로그인한 사용자 정보
        requesterContact: '010-1234-5678',
        requesterDept: '개발팀',
        stage: '접수'
      }

      console.log('서비스 신청 데이터:', requestData)
      
      // 성공 처리
      setSubmitSuccess(true)
      setTimeout(() => {
        window.location.href = '/progress'
      }, 2000)

    } catch (error) {
      console.error('서비스 신청 오류:', error)
      alert('서비스 신청 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">신청이 완료되었습니다!</h2>
          <p className="text-gray-600 mb-4">
            서비스 신청이 성공적으로 접수되었습니다.<br />
            요청진행사항 페이지로 이동합니다.
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="itsm-header">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => window.history.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                뒤로가기
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">서비스 신청</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => window.location.href = '/progress'}
                className="text-gray-600 hover:text-gray-900"
              >
                요청진행사항
              </Button>
              <Button
                onClick={() => window.location.href = '/faq'}
                className="text-gray-600 hover:text-gray-900"
              >
                자주하는질문
              </Button>
              <Button
                onClick={() => window.location.href = '/inquiry'}
                className="text-gray-600 hover:text-gray-900"
              >
                일반문의사항
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="itsm-main-content">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1열: 기본 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  신청일시 <span className="text-red-500">*</span>
                </label>
                <Input
                  value={new Date().toLocaleString('ko-KR')}
                  readOnly
                  className="bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  신청번호 <span className="text-red-500">*</span>
                </label>
                <Input
                  value="자동생성"
                  readOnly
                  className="bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  현재상태 <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.currentStatus}
                  onChange={(e) => handleInputChange('currentStatus', e.target.value)}
                  required
                >
                  <option value="">선택하세요</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  관리번호
                </label>
                <Input
                  value={formData.managementNumber}
                  onChange={(e) => handleInputChange('managementNumber', e.target.value)}
                  placeholder="관리번호를 입력하세요"
                />
              </div>
            </div>

            {/* 2열: 위치 및 신청자 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  신청위치 <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="신청 위치를 입력하세요"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  신청자 <span className="text-red-500">*</span>
                </label>
                <Input
                  value="김사용자"
                  readOnly
                  className="bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  신청연락처 <span className="text-red-500">*</span>
                </label>
                <Input
                  value="010-1234-5678"
                  readOnly
                  className="bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  신청소속 <span className="text-red-500">*</span>
                </label>
                <Input
                  value="개발팀"
                  readOnly
                  className="bg-gray-100"
                />
              </div>
            </div>

            {/* 3열: 대리신청 여부 */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isProxyRequest"
                  checked={formData.isProxyRequest}
                  onChange={(e) => handleInputChange('isProxyRequest', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isProxyRequest" className="ml-2 block text-sm font-medium text-gray-700">
                  대리신청여부
                </label>
              </div>

              {formData.isProxyRequest && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-blue-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      실제신청자 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.actualRequester}
                      onChange={(e) => handleInputChange('actualRequester', e.target.value)}
                      placeholder="실제 신청자명을 입력하세요"
                      required={formData.isProxyRequest}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      실제연락처 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.actualContact}
                      onChange={(e) => handleInputChange('actualContact', e.target.value)}
                      placeholder="실제 연락처를 입력하세요"
                      required={formData.isProxyRequest}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      실제소속 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.actualDept}
                      onChange={(e) => handleInputChange('actualDept', e.target.value)}
                      placeholder="실제 소속을 입력하세요"
                      required={formData.isProxyRequest}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 4열: 신청 내용 */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  신청제목 <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="신청 제목을 입력하세요"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  신청내용 <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="신청 내용을 상세히 입력하세요"
                  rows={6}
                  required
                />
              </div>
            </div>

            {/* 5열: 단계 (자동생성) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                단계
              </label>
              <Input
                value="접수 (자동생성)"
                readOnly
                className="bg-gray-100"
              />
            </div>

            {/* 제출 버튼 */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                onClick={() => window.history.back()}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    신청 중...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    신청하기
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
