"use client"

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ArrowLeft, UserPlus, Check, Eye, EyeOff } from 'lucide-react'
import { apiClient } from '@/lib/api'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    position: '',
    department: '',
    phone: '',
    role: 'user'
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const positionOptions = [
    { value: '사원', label: '사원' },
    { value: '대리', label: '대리' },
    { value: '과장', label: '과장' },
    { value: '차장', label: '차장' },
    { value: '부장', label: '부장' },
    { value: '이사', label: '이사' },
    { value: '상무', label: '상무' },
    { value: '전무', label: '전무' },
    { value: '사장', label: '사장' }
  ]

  const departmentOptions = [
    { value: '개발팀', label: '개발팀' },
    { value: '기획팀', label: '기획팀' },
    { value: '마케팅팀', label: '마케팅팀' },
    { value: '영업팀', label: '영업팀' },
    { value: '인사팀', label: '인사팀' },
    { value: '재무팀', label: '재무팀' },
    { value: '총무팀', label: '총무팀' },
    { value: 'IT팀', label: 'IT팀' },
    { value: '고객지원팀', label: '고객지원팀' }
  ]

  const roleOptions = [
    { value: 'user', label: '일반사용자' },
    { value: 'technician', label: '조치담당자' },
    { value: 'assignment_manager', label: '배정담당자' },
    { value: 'service_manager', label: '관리매니저' },
    { value: 'system_admin', label: '시스템관리' }
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // 에러 메시지 초기화
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // 이메일 검증
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.'
    }

    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.'
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다.'
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = '비밀번호는 영문과 숫자를 포함해야 합니다.'
    }

    // 비밀번호 확인 검증
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.'
    }

    // 이름 검증
    if (!formData.name) {
      newErrors.name = '이름을 입력해주세요.'
    }

    // 직급 검증
    if (!formData.position) {
      newErrors.position = '직급을 선택해주세요.'
    }

    // 부서 검증
    if (!formData.department) {
      newErrors.department = '부서를 선택해주세요.'
    }

    // 연락처 검증
    if (!formData.phone) {
      newErrors.phone = '연락처를 입력해주세요.'
    } else if (!/^010-\d{4}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = '연락처는 010-0000-0000 형식으로 입력해주세요.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // API 호출을 위한 데이터 준비
      const signupData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        department: formData.department,
        position: formData.position,
        role: formData.role,
        phone: formData.phone
      }

      console.log('회원가입 데이터:', signupData)
      
      // API 호출
      const response = await apiClient.register(signupData)
      
      if (response.success) {
        // 성공 처리
        setSubmitSuccess(true)
        setTimeout(() => {
          window.location.href = '/?signup=success'
        }, 2000)
      } else {
        // API 오류 처리
        setErrors({ submit: response.error || '회원가입에 실패했습니다.' })
      }

    } catch (error) {
      console.error('회원가입 오류:', error)
      setErrors({ submit: '회원가입 중 오류가 발생했습니다.' })
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">회원가입이 완료되었습니다!</h2>
          <p className="text-gray-600 mb-4">
            관리자 승인 후 로그인이 가능합니다.<br />
            승인 완료 시 이메일로 알려드리겠습니다.
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
              <h1 className="text-2xl font-bold text-gray-900">회원가입</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => window.location.href = '/'}
                className="text-gray-600 hover:text-gray-900"
              >
                홈으로
              </Button>
              <Button
                onClick={() => window.location.href = '/?login=true'}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                로그인
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="itsm-main-content">
        <Card className="p-8 max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">ITSM 회원가입</h2>
            <p className="text-gray-600">IT 서비스 관리 시스템에 오신 것을 환영합니다</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 계정 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                계정 정보
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@company.com"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    역할 <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className={errors.role ? 'border-red-500' : ''}
                  >
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                  {errors.role && (
                    <p className="text-red-500 text-sm mt-1">{errors.role}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    비밀번호 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="8자 이상, 영문+숫자"
                      className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    비밀번호 확인 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="비밀번호를 다시 입력하세요"
                      className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 개인 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                개인 정보
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="홍길동"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    직급 <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    className={errors.position ? 'border-red-500' : ''}
                  >
                    <option value="">직급을 선택하세요</option>
                    {positionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                  {errors.position && (
                    <p className="text-red-500 text-sm mt-1">{errors.position}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    부서 <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className={errors.department ? 'border-red-500' : ''}
                  >
                    <option value="">부서를 선택하세요</option>
                    {departmentOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                  {errors.department && (
                    <p className="text-red-500 text-sm mt-1">{errors.department}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    연락처 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="010-0000-0000"
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 약관 동의 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                약관 동의
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    required
                  />
                  <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                    <span className="text-red-500">*</span> 서비스 이용약관에 동의합니다.
                    <a href="#" className="text-blue-600 hover:text-blue-500 ml-1">자세히 보기</a>
                  </label>
                </div>
                
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="privacy"
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    required
                  />
                  <label htmlFor="privacy" className="ml-2 text-sm text-gray-700">
                    <span className="text-red-500">*</span> 개인정보 처리방침에 동의합니다.
                    <a href="#" className="text-blue-600 hover:text-blue-500 ml-1">자세히 보기</a>
                  </label>
                </div>
                
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="marketing"
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="marketing" className="ml-2 text-sm text-gray-700">
                    마케팅 정보 수신에 동의합니다. (선택)
                  </label>
                </div>
              </div>
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
                className="itsm-button-primary px-6 py-2 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    가입 중...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    회원가입
                  </>
                )}
              </Button>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-center">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">회원가입 오류</span>
                </div>
                <p className="text-sm">{errors.submit}</p>
              </div>
            )}
          </form>
        </Card>
      </main>
    </div>
  )
}
