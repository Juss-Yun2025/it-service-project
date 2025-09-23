"use client"

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select } from './ui/select'
import { Textarea } from './ui/textarea'
import { User, Wrench, MessageSquare, Users, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ServiceRequest {
  id: string
  title: string
  content: string
  requester: string
  requesterEmail: string
  requestDate: string
  requestType: string
  requestStatus: string
  requestContact: string
  requestDept: string
  requestLocation: string
  isProxyRequest: boolean
  actualRequester: string
  actualContact: string
  actualDept: string
  priority: string
  status: string
  createdAt: string
}

interface Technician {
  id: string
  name: string
  department: string
  skills: string[]
  currentWorkload: number
}

const TechnicianAssignment: React.FC = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const requestId = searchParams.get('requestId')
  
  const [selectedRequestType, setSelectedRequestType] = useState('')
  const [assignmentOpinion, setAssignmentOpinion] = useState('')
  const [selectedTechnician, setSelectedTechnician] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serviceRequest, setServiceRequest] = useState<ServiceRequest | null>(null)

  // 실제 서비스 요청 데이터 (메인 페이지에서 전달받은 데이터와 동일)
  const sampleServiceRequests: ServiceRequest[] = [
    {
      id: "SR-2024-001",
      title: "이메일 첨부파일 다운로드 오류",
      content: "이메일에서 첨부파일을 다운로드할 때 오류가 발생합니다. 파일이 손상되었다는 메시지가 나타납니다.",
      requester: "김사용자",
      requesterEmail: "user@itsm.com",
      requestDate: "2024-01-22T09:30",
      requestType: "장애",
      requestStatus: "오류발생",
      requestContact: "010-1234-5678",
      requestDept: "영업팀",
      requestLocation: "본사 2층 영업실",
      isProxyRequest: false,
      actualRequester: "",
      actualContact: "",
      actualDept: "",
      priority: "높음",
      status: "배정 대기",
      createdAt: "2024-01-22T09:30:00Z"
    },
    {
      id: "SR-2024-002",
      title: "VPN 접속 불가",
      content: "재택근무 중 VPN에 접속할 수 없습니다. 연결 시도 시 타임아웃 오류가 발생합니다.",
      requester: "박사용자",
      requesterEmail: "user2@itsm.com",
      requestDate: "2024-01-22T13:45",
      requestType: "장애",
      requestStatus: "전체불능",
      requestContact: "010-9876-5432",
      requestDept: "개발팀",
      requestLocation: "재택근무",
      isProxyRequest: false,
      actualRequester: "",
      actualContact: "",
      actualDept: "",
      priority: "높음",
      status: "배정 대기",
      createdAt: "2024-01-22T13:45:00Z"
    }
  ]

  // 요청 유형 매핑 (일반사용자 요청 유형 → 기술자 요청 유형)
  const requestTypeMapping: { [key: string]: string } = {
    '요청': 'software',
    '장애': 'hardware',
    '변경': 'system',
    '문제': 'hardware',
    '적용': 'software',
    '구성': 'system',
    '자산': 'hardware'
  }

  const requestTypes = [
    { value: 'hardware', label: '하드웨어 문제' },
    { value: 'software', label: '소프트웨어 문제' },
    { value: 'network', label: '네트워크 문제' },
    { value: 'system', label: '시스템 문제' },
    { value: 'printer', label: '프린터 문제' },
    { value: 'other', label: '기타' }
  ]

  const technicians: Technician[] = [
    {
      id: 'tech-001',
      name: '박기술',
      department: 'IT지원팀',
      skills: ['네트워크', '하드웨어', '시스템'],
      currentWorkload: 3
    },
    {
      id: 'tech-002',
      name: '이전문',
      department: 'IT지원팀',
      skills: ['소프트웨어', '데이터베이스'],
      currentWorkload: 1
    },
    {
      id: 'tech-003',
      name: '최전문',
      department: 'IT지원팀',
      skills: ['네트워크', '보안', '클라우드'],
      currentWorkload: 2
    },
    {
      id: 'tech-004',
      name: '정프린터',
      department: 'IT지원팀',
      skills: ['프린터', '하드웨어', '네트워크'],
      currentWorkload: 0
    }
  ]

  // URL 파라미터의 requestId에 따라 서비스 요청 데이터 설정
  useEffect(() => {
    if (requestId) {
      const foundRequest = sampleServiceRequests.find(req => req.id === requestId)
      if (foundRequest) {
        setServiceRequest(foundRequest)
        // 요청 유형에 따라 기본값 설정
        if (foundRequest.requestType) {
          // 1차: 일반사용자가 선택한 요청 유형을 기반으로 매핑
          let mappedType = requestTypeMapping[foundRequest.requestType]
          
          // 2차: 제목과 내용을 분석하여 더 정확한 유형 추천
          if (foundRequest.title.includes('네트워크') || foundRequest.content.includes('네트워크')) {
            mappedType = 'network'
          } else if (foundRequest.title.includes('프린터') || foundRequest.content.includes('프린터')) {
            mappedType = 'printer'
          } else if (foundRequest.title.includes('소프트웨어') || foundRequest.content.includes('소프트웨어') || 
                     foundRequest.title.includes('프로그램') || foundRequest.content.includes('프로그램')) {
            mappedType = 'software'
          } else if (foundRequest.title.includes('시스템') || foundRequest.content.includes('시스템')) {
            mappedType = 'system'
          }
          
          setSelectedRequestType(mappedType || 'hardware')
        }
      }
    } else {
      // 기본값으로 첫 번째 요청 설정
      setServiceRequest(sampleServiceRequests[0])
      if (sampleServiceRequests[0].requestType) {
        setSelectedRequestType(requestTypeMapping[sampleServiceRequests[0].requestType] || 'hardware')
      }
    }
  }, [requestId])

  // 뒤로가기 함수
  const handleGoBack = () => {
    // 폼에 데이터가 입력되어 있는지 확인
    if (selectedRequestType || assignmentOpinion || selectedTechnician) {
      const confirmed = window.confirm('입력된 배정 정보가 있습니다. 정말로 나가시겠습니까?')
      if (!confirmed) {
        return
      }
    }
    
    // 기술자 대시보드로 이동
    router.push('/')
  }

  // 브라우저 뒤로가기 버튼 처리
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (selectedRequestType || assignmentOpinion || selectedTechnician) {
        e.preventDefault()
        e.returnValue = '입력된 배정 정보가 있습니다. 정말로 나가시겠습니까?'
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [selectedRequestType, assignmentOpinion, selectedTechnician])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // 실제 구현에서는 API 호출
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)) // API 호출 시뮬레이션
      
      // 선택된 기술자 정보 가져오기
      const selectedTech = technicians.find(t => t.id === selectedTechnician)
      
      // 배정 완료 메시지
      const assignmentMessage = `
배정이 완료되었습니다!

요청번호: ${serviceRequest?.id}
요청제목: ${serviceRequest?.title}
배정된 담당자: ${selectedTech?.name} (${selectedTech?.department})
요청 유형: ${requestTypes.find(t => t.value === selectedRequestType)?.label}
배정 의견: ${assignmentOpinion}

조치 담당자 작업 화면으로 이동하시겠습니까?
      `.trim()
      
      const confirmed = window.confirm(assignmentMessage)
      if (confirmed) {
        // 배정 정보를 URL 파라미터로 전달
        const assignmentData = {
          requestId: serviceRequest?.id,
          technicianId: selectedTechnician,
          technicianName: selectedTech?.name || '',
          requestType: selectedRequestType,
          opinion: assignmentOpinion,
          role: 'technician' // 조치담당자 역할 전달
        }
        const queryString = new URLSearchParams(assignmentData as any).toString()
        router.push(`/technician-work?${queryString}`)
      } else {
        // 폼 초기화
        setSelectedRequestType('')
        setAssignmentOpinion('')
        setSelectedTechnician('')
        alert('배정이 완료되었습니다!')
      }
    } catch (error) {
      alert('배정 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '높음': return 'text-red-600 bg-red-100'
      case '보통': return 'text-yellow-600 bg-yellow-100'
      case '낮음': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case '배정 대기': return 'text-blue-600 bg-blue-100'
      case '처리 중': return 'text-orange-600 bg-orange-100'
      case '완료': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRequestTypeColor = (type: string) => {
    switch (type) {
      case '장애': return 'text-red-600 bg-red-100'
      case '요청': return 'text-blue-600 bg-blue-100'
      case '변경': return 'text-purple-600 bg-purple-100'
      case '문제': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (!serviceRequest) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">서비스 요청을 찾을 수 없습니다</h1>
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              메인 페이지로 돌아가기
            </Link>
          </div>
        </div>
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
                onClick={handleGoBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                뒤로가기
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">기술자 배정</h1>
            </div>
            <div className="flex items-center space-x-4">
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
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* 4가지 프레임 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* 프레임 1: 서비스 요청 정보 */}
            <Card className="itsm-card">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  서비스 요청 정보
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">요청 ID</label>
                    <p className="text-lg font-semibold text-blue-600">{serviceRequest.id}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">요청 제목</label>
                    <p className="text-gray-900 font-medium">{serviceRequest.title}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">요청 내용</label>
                    <p className="text-gray-700 text-sm leading-relaxed">{serviceRequest.content}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">요청자</label>
                    <p className="text-gray-900">{serviceRequest.requester} ({serviceRequest.requestDept})</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">연락처</label>
                    <p className="text-gray-900">{serviceRequest.requestContact}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">위치</label>
                    <p className="text-gray-900">{serviceRequest.requestLocation}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">현재 상태</label>
                    <p className="text-gray-900">{serviceRequest.requestStatus}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">요청일시</label>
                    <p className="text-gray-900">{new Date(serviceRequest.requestDate).toLocaleString('ko-KR')}</p>
                  </div>

                  {serviceRequest.isProxyRequest && (
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800 mb-1">대리신청</p>
                      <div className="space-y-2 text-xs text-yellow-700">
                        <p><strong>실제 신청자:</strong> {serviceRequest.actualRequester}</p>
                        <p><strong>실제 소속:</strong> {serviceRequest.actualDept}</p>
                        <p><strong>실제 연락처:</strong> {serviceRequest.actualContact}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(serviceRequest.priority)}`}>
                      우선순위: {serviceRequest.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(serviceRequest.currentStatus)}`}>
                      {serviceRequest.currentStatus}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRequestTypeColor(serviceRequest.requestType)}`}>
                      {serviceRequest.requestType}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* 프레임 2: 요청 유형 선택 */}
            <Card className="itsm-card">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  요청 유형 선택
                </h2>
                
                {/* 일반사용자가 선택한 요청 유형 표시 */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>일반사용자 선택:</strong> {serviceRequest.requestType}
                  </p>
                  <p className="text-xs text-gray-500">
                    자동 매핑: {requestTypeMapping[serviceRequest.requestType] ? 
                      `${requestTypeMapping[serviceRequest.requestType]} (${requestTypes.find(t => t.value === requestTypeMapping[serviceRequest.requestType])?.label})` : 
                      '매핑 정보 없음'}
                  </p>
                </div>
                
                {/* 요청 유형 매핑 테이블 */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">요청 유형 매핑 가이드</p>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div><span className="font-medium">요청/적용</span> → 소프트웨어 문제</div>
                    <div><span className="font-medium">장애/문제/자산</span> → 하드웨어 문제</div>
                    <div><span className="font-medium">변경/구성</span> → 시스템 문제</div>
                    <div><span className="font-medium">네트워크 관련</span> → 네트워크 문제</div>
                    <div><span className="font-medium">프린터 관련</span> → 프린터 문제</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {requestTypes.map((type) => (
                    <div
                      key={type.value}
                      className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedRequestType === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-blue-300'
                      }`}
                      onClick={() => setSelectedRequestType(type.value)}
                    >
                      <div className="flex items-center gap-2">
                        {selectedRequestType === type.value && (
                          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span className={`text-sm font-medium ${
                          selectedRequestType === type.value ? 'text-blue-900' : 'text-gray-700'
                        }`}>
                          {type.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 선택된 요청 유형에 대한 설명 */}
                {selectedRequestType && (
                  <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-800">
                    <strong>선택된 유형:</strong> {requestTypes.find(t => t.value === selectedRequestType)?.label}
                    {selectedRequestType === requestTypeMapping[serviceRequest.requestType] && 
                      <span className="ml-2 text-green-600">✓ 자동 매핑과 일치</span>
                    }
                  </div>
                )}
              </div>
            </Card>

            {/* 프레임 3: 배정 의견 작성 */}
            <Card className="itsm-card">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  배정 의견 작성
                </h2>
                <div>
                  <label htmlFor="assignmentOpinion" className="block text-sm font-medium text-gray-700 mb-2">
                    배정 의견 <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="assignmentOpinion"
                    value={assignmentOpinion}
                    onChange={(e) => setAssignmentOpinion(e.target.value)}
                    placeholder="배정에 대한 의견이나 특별한 고려사항을 입력하세요..."
                    required
                    rows={6}
                    className="w-full"
                  />
                </div>
              </div>
            </Card>

            {/* 프레임 4: 기술자 선택 */}
            <Card className="itsm-card">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  기술자 선택
                </h2>
                <div>
                  <label htmlFor="technician" className="block text-sm font-medium text-gray-700 mb-2">
                    기술자 선택 <span className="text-red-500">*</span>
                  </label>
                  <Select
                    id="technician"
                    value={selectedTechnician}
                    onChange={(e) => setSelectedTechnician(e.target.value)}
                    required
                    className="w-full"
                  >
                    <option value="">기술자를 선택하세요</option>
                    {technicians.map((tech) => (
                      <option key={tech.id} value={tech.id}>
                        {tech.name} ({tech.department}) - 현재 작업량: {tech.currentWorkload}건
                      </option>
                    ))}
                  </Select>
                </div>

                {/* 선택된 담당자 정보 표시 */}
                {selectedTechnician && (
                  <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">선택된 기술자 정보</h4>
                    {(() => {
                      const tech = technicians.find(t => t.id === selectedTechnician)
                      return tech ? (
                        <div className="text-sm text-blue-800">
                          <p><strong>이름:</strong> {tech.name}</p>
                          <p><strong>부서:</strong> {tech.department}</p>
                          <p><strong>보유 기술:</strong> {tech.skills.join(', ')}</p>
                          <p><strong>현재 작업량:</strong> {tech.currentWorkload}건</p>
                        </div>
                      ) : null
                    })()}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* 기술자 목록 */}
          <Card className="itsm-card">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                기술자 목록
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {technicians.map((tech) => (
                  <div
                    key={tech.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedTechnician === tech.id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedTechnician(tech.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{tech.name}</h4>
                        {selectedTechnician === tech.id && (
                          <span className="text-blue-600">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tech.currentWorkload <= 2 ? 'bg-green-100 text-green-800' :
                        tech.currentWorkload <= 4 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {tech.currentWorkload}건
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{tech.department}</p>
                    <div className="flex flex-wrap gap-1">
                      {tech.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* 배정 완료 버튼 */}
          <div className="mt-8 flex justify-center">
            <form onSubmit={handleSubmit} className="w-full max-w-md">
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || !selectedRequestType || !assignmentOpinion || !selectedTechnician}
                  className="itsm-button-primary flex-1 py-3"
                >
                  {isSubmitting ? '처리 중...' : '배정 완료'}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setSelectedRequestType('')
                    setAssignmentOpinion('')
                    setSelectedTechnician('')
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white flex-1 py-3"
                >
                  초기화
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

export default TechnicianAssignment
