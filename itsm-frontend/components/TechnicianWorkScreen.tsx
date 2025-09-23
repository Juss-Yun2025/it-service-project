"use client"

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select } from './ui/select'
import { Textarea } from './ui/textarea'
import { User, Wrench, Clock, CheckCircle, AlertCircle, ArrowLeft, FileText, Phone, MapPin } from 'lucide-react'
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

interface AssignmentInfo {
  requestId: string
  assignedTechnician: string
  technicianName: string
  technicianDepartment: string
  assignedRequestType: string
  assignmentOpinion: string
  assignedAt: string
  estimatedCompletionTime: string
}

interface WorkProgress {
  currentStep: string
  workDescription: string
  workStartTime: string
  workEndTime: string
  issues: string
  isCompleted: boolean
  completionNotes: string
}

const TechnicianWorkScreen: React.FC = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const requestId = searchParams.get('requestId')
  const technicianId = searchParams.get('technicianId')
  const technicianName = searchParams.get('technicianName')
  const assignedRequestType = searchParams.get('requestType')
  const assignmentOpinion = searchParams.get('opinion')
  
  const [serviceRequest, setServiceRequest] = useState<ServiceRequest | null>(null)
  const [assignmentInfo, setAssignmentInfo] = useState<AssignmentInfo | null>(null)
  const [workProgress, setWorkProgress] = useState<WorkProgress>({
    currentStep: '작업 시작',
    workDescription: '',
    workStartTime: '',
    workEndTime: '',
    issues: '',
    isCompleted: false,
    completionNotes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 샘플 서비스 요청 데이터
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
      status: "작업 중",
      createdAt: "2024-01-22T09:30:00Z"
    }
  ]

  // URL 파라미터에서 배정 정보 설정
  useEffect(() => {
    if (requestId) {
      const foundRequest = sampleServiceRequests.find(req => req.id === requestId)
      if (foundRequest) {
        setServiceRequest(foundRequest)
        
        // 배정 정보 설정
        setAssignmentInfo({
          requestId: requestId,
          assignedTechnician: technicianId || 'tech-001',
          technicianName: technicianName || '박기술',
          technicianDepartment: 'IT지원팀',
          assignedRequestType: assignedRequestType || 'hardware',
          assignmentOpinion: assignmentOpinion || '하드웨어 문제로 판단되어 배정합니다.',
          assignedAt: new Date().toISOString(),
          estimatedCompletionTime: '2시간'
        })
      }
    } else {
      // 기본값으로 첫 번째 요청 설정
      setServiceRequest(sampleServiceRequests[0])
      setAssignmentInfo({
        requestId: sampleServiceRequests[0].id,
        assignedTechnician: 'tech-001',
        technicianName: '박기술',
        technicianDepartment: 'IT지원팀',
        assignedRequestType: 'hardware',
        assignmentOpinion: '하드웨어 문제로 판단되어 배정합니다.',
        assignedAt: new Date().toISOString(),
        estimatedCompletionTime: '2시간'
      })
    }
  }, [requestId, technicianId, technicianName, assignedRequestType, assignmentOpinion])

  // 뒤로가기 함수
  const handleGoBack = () => {
    if (workProgress.workDescription || workProgress.issues || workProgress.completionNotes) {
      const confirmed = window.confirm('작업 내용이 저장되지 않았습니다. 정말로 나가시겠습니까?')
      if (!confirmed) {
        return
      }
    }
    router.push('/')
  }

  // 브라우저 뒤로가기 버튼 처리
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (workProgress.workDescription || workProgress.issues || workProgress.completionNotes) {
        e.preventDefault()
        e.returnValue = '작업 내용이 저장되지 않았습니다. 정말로 나가시겠습니까?'
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [workProgress])

  const handleWorkProgressChange = (field: keyof WorkProgress, value: string | boolean) => {
    setWorkProgress(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleStartWork = () => {
    setWorkProgress(prev => ({
      ...prev,
      currentStep: '작업 진행 중',
      workStartTime: new Date().toISOString()
    }))
  }

  const handleCompleteWork = () => {
    setWorkProgress(prev => ({
      ...prev,
      currentStep: '작업 완료',
      workEndTime: new Date().toISOString(),
      isCompleted: true
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // 작업 진행 상황 저장 로직
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const completionMessage = `
작업이 완료되었습니다!

요청번호: ${serviceRequest?.id}
요청제목: ${serviceRequest?.title}
작업자: ${assignmentInfo?.technicianName}
작업내용: ${workProgress.workDescription}
완료일시: ${workProgress.workEndTime || new Date().toLocaleString('ko-KR')}
${workProgress.issues ? `문제사항: ${workProgress.issues}` : ''}
${workProgress.completionNotes ? `완료 메모: ${workProgress.completionNotes}` : ''}

작업이 성공적으로 저장되었습니다.
      `.trim()
      
      alert(completionMessage)
      
      // 폼 초기화
      setWorkProgress({
        currentStep: '작업 시작',
        workDescription: '',
        workStartTime: '',
        workEndTime: '',
        issues: '',
        isCompleted: false,
        completionNotes: ''
      })
      
    } catch (error) {
      alert('작업 저장 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!serviceRequest || !assignmentInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">서비스 요청을 찾을 수 없습니다</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            메인 페이지로 돌아가기
          </Link>
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
              <h1 className="text-2xl font-bold text-gray-900">기술자 작업</h1>
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
          {/* 3가지 프레임 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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

                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">요청자</p>
                      <p className="text-gray-900">{serviceRequest.requester} ({serviceRequest.requestDept})</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">연락처</p>
                      <p className="text-gray-900">{serviceRequest.requestContact}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">위치</p>
                      <p className="text-gray-900">{serviceRequest.requestLocation}</p>
                    </div>
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
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      우선순위: {serviceRequest.priority}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {serviceRequest.currentStatus}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {serviceRequest.requestType}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* 프레임 2: 배정 정보 및 작업 진행 */}
            <Card className="itsm-card">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  배정 정보 및 작업 진행
                </h2>
                
                {/* 배정 정보 */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-3">배정 정보</h3>
                  <div className="space-y-2 text-sm text-blue-800">
                    <p><strong>배정된 기술자:</strong> {assignmentInfo.technicianName} ({assignmentInfo.technicianDepartment})</p>
                    <p><strong>배정된 요청 유형:</strong> {assignmentInfo.assignedRequestType}</p>
                    <p><strong>배정 의견:</strong> {assignmentInfo.assignmentOpinion}</p>
                    <p><strong>배정일시:</strong> {new Date(assignmentInfo.assignedAt).toLocaleString('ko-KR')}</p>
                    <p><strong>예상 완료시간:</strong> {assignmentInfo.estimatedCompletionTime}</p>
                  </div>
                </div>

                {/* 작업 진행 상황 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">현재 단계</label>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {workProgress.currentStep}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">작업 시작 시간</label>
                    <p className="text-gray-900">
                      {workProgress.workStartTime 
                        ? new Date(workProgress.workStartTime).toLocaleString('ko-KR')
                        : '아직 시작하지 않음'
                      }
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">작업 완료 시간</label>
                    <p className="text-gray-900">
                      {workProgress.workEndTime 
                        ? new Date(workProgress.workEndTime).toLocaleString('ko-KR')
                        : '아직 완료하지 않음'
                      }
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {!workProgress.workStartTime && (
                      <Button
                        onClick={handleStartWork}
                        className="itsm-button-primary text-sm px-4 py-2"
                      >
                        작업 시작
                      </Button>
                    )}
                    {workProgress.workStartTime && !workProgress.isCompleted && (
                      <Button
                        onClick={handleCompleteWork}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2"
                      >
                        작업 완료
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* 프레임 3: 작업 내용 및 결과 */}
            <Card className="itsm-card">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  작업 내용 및 결과
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      작업 내용 <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      value={workProgress.workDescription}
                      onChange={(e) => handleWorkProgressChange('workDescription', e.target.value)}
                      placeholder="수행한 작업 내용을 상세히 입력하세요..."
                      required
                      rows={4}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      문제사항
                    </label>
                    <Textarea
                      value={workProgress.issues}
                      onChange={(e) => handleWorkProgressChange('issues', e.target.value)}
                      placeholder="작업 중 발생한 문제사항을 입력하세요..."
                      rows={3}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      완료 메모
                    </label>
                    <Textarea
                      value={workProgress.completionNotes}
                      onChange={(e) => handleWorkProgressChange('completionNotes', e.target.value)}
                      placeholder="작업 완료 후 추가 메모나 권장사항을 입력하세요..."
                      rows={3}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isCompleted"
                      checked={workProgress.isCompleted}
                      onChange={(e) => handleWorkProgressChange('isCompleted', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isCompleted" className="ml-2 block text-sm font-medium text-gray-700">
                      작업 완료 확인
                    </label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !workProgress.workDescription}
                      className="itsm-button-primary flex-1"
                    >
                      {isSubmitting ? '저장 중...' : '작업 저장'}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setWorkProgress({
                          currentStep: '작업 시작',
                          workDescription: '',
                          workStartTime: '',
                          workEndTime: '',
                          issues: '',
                          isCompleted: false,
                          completionNotes: ''
                        })
                      }}
                      className="bg-gray-500 hover:bg-gray-600 text-white flex-1"
                    >
                      초기화
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default TechnicianWorkScreen