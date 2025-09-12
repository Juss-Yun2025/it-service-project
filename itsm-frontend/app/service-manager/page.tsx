"use client"

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ArrowLeft, BarChart3, Users, Settings, TrendingUp, AlertTriangle, CheckCircle, Clock, RefreshCw } from 'lucide-react'

interface ServiceMetrics {
  totalRequests: number
  completedRequests: number
  pendingRequests: number
  averageResolutionTime: string
  customerSatisfaction: number
  systemUptime: number
}

interface ServiceRequest {
  id: string
  title: string
  requester: string
  department: string
  requestDate: string
  status: string
  priority: string
  assignedTechnician: string
  estimatedCompletion: string
}

interface Technician {
  id: string
  name: string
  department: string
  currentWorkload: number
  completedTasks: number
  averageRating: number
  skills: string[]
}

export default function ServiceManagerPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  // 서비스 메트릭 데이터
  const serviceMetrics: ServiceMetrics = {
    totalRequests: 156,
    completedRequests: 142,
    pendingRequests: 14,
    averageResolutionTime: '2.3시간',
    customerSatisfaction: 4.7,
    systemUptime: 99.2
  }

  // 서비스 요청 데이터
  const serviceRequests: ServiceRequest[] = [
    {
      id: 'SR-20250112-001',
      title: '컴퓨터 속도 개선 요청',
      requester: '김사용자',
      department: '개발팀',
      requestDate: '2025-01-12 09:30',
      status: '처리중',
      priority: '높음',
      assignedTechnician: '박기술자',
      estimatedCompletion: '2025-01-12 15:00'
    },
    {
      id: 'SR-20250112-002',
      title: '프린터 연결 오류',
      requester: '이사용자',
      department: '마케팅팀',
      requestDate: '2025-01-12 10:15',
      status: '완료',
      priority: '보통',
      assignedTechnician: '최기술자',
      estimatedCompletion: '2025-01-12 12:00'
    },
    {
      id: 'SR-20250112-003',
      title: '이메일 발송 오류',
      requester: '최사용자',
      department: '영업팀',
      requestDate: '2025-01-12 11:00',
      status: '대기',
      priority: '높음',
      assignedTechnician: '',
      estimatedCompletion: ''
    }
  ]

  // 기술자 데이터
  const technicians: Technician[] = [
    {
      id: 'tech-001',
      name: '박기술자',
      department: 'IT지원팀',
      currentWorkload: 3,
      completedTasks: 45,
      averageRating: 4.8,
      skills: ['네트워크', '하드웨어', '시스템']
    },
    {
      id: 'tech-002',
      name: '이전문가',
      department: 'IT지원팀',
      currentWorkload: 1,
      completedTasks: 38,
      averageRating: 4.6,
      skills: ['소프트웨어', '데이터베이스']
    },
    {
      id: 'tech-003',
      name: '최전문가',
      department: 'IT지원팀',
      currentWorkload: 2,
      completedTasks: 52,
      averageRating: 4.9,
      skills: ['네트워크', '보안', '클라우드']
    }
  ]

  const filteredRequests = serviceRequests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.requester.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case '완료': return 'itsm-status-success'
      case '처리중': return 'itsm-status-warning'
      case '대기': return 'itsm-status-info'
      case '지연': return 'itsm-status-error'
      default: return 'itsm-status-info'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '높음': return 'bg-red-100 text-red-800'
      case '보통': return 'bg-yellow-100 text-yellow-800'
      case '낮음': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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
              <h1 className="text-2xl font-bold text-gray-900">서비스 관리</h1>
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
          {/* 탭 네비게이션 */}
          <div className="mb-8">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'dashboard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="h-4 w-4 inline mr-2" />
                대시보드
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'requests'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Clock className="h-4 w-4 inline mr-2" />
                서비스 요청 관리
              </button>
              <button
                onClick={() => setActiveTab('technicians')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'technicians'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />
                기술자 관리
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Settings className="h-4 w-4 inline mr-2" />
                설정
              </button>
            </nav>
          </div>

          {/* 대시보드 탭 */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* 메트릭 카드들 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="itsm-card">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">총 요청 수</p>
                        <p className="text-2xl font-bold text-gray-900">{serviceMetrics.totalRequests}</p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="itsm-card">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">완료된 요청</p>
                        <p className="text-2xl font-bold text-gray-900">{serviceMetrics.completedRequests}</p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="itsm-card">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Clock className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">대기 중인 요청</p>
                        <p className="text-2xl font-bold text-gray-900">{serviceMetrics.pendingRequests}</p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="itsm-card">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">평균 해결 시간</p>
                        <p className="text-2xl font-bold text-gray-900">{serviceMetrics.averageResolutionTime}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* 추가 메트릭 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="itsm-card">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">고객 만족도</h3>
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`h-5 w-5 ${i < Math.floor(serviceMetrics.customerSatisfaction) ? 'text-yellow-400' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="ml-2 text-sm font-medium text-gray-600">
                            {serviceMetrics.customerSatisfaction}/5.0
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="itsm-card">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">시스템 가동률</h3>
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">가동률</span>
                          <span className="text-sm font-medium text-gray-900">{serviceMetrics.systemUptime}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${serviceMetrics.systemUptime}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* 서비스 요청 관리 탭 */}
          {activeTab === 'requests' && (
            <div className="space-y-6">
              {/* 검색 및 필터 */}
              <Card className="itsm-card">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="요청 제목 또는 요청자로 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="flex gap-4">
                      <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-32"
                      >
                        <option value="all">모든 상태</option>
                        <option value="대기">대기</option>
                        <option value="처리중">처리중</option>
                        <option value="완료">완료</option>
                        <option value="지연">지연</option>
                      </Select>
                      <Select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="w-32"
                      >
                        <option value="all">모든 우선순위</option>
                        <option value="높음">높음</option>
                        <option value="보통">보통</option>
                        <option value="낮음">낮음</option>
                      </Select>
                      <Button
                        onClick={() => {
                          setSearchTerm('')
                          setStatusFilter('all')
                          setPriorityFilter('all')
                        }}
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        초기화
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* 요청 목록 */}
              <Card className="itsm-card">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">서비스 요청 목록</h3>
                  <div className="overflow-x-auto">
                    <table className="itsm-table-container">
                      <thead className="itsm-table-thead">
                        <tr>
                          <th className="itsm-table-th">요청 ID</th>
                          <th className="itsm-table-th">제목</th>
                          <th className="itsm-table-th">요청자</th>
                          <th className="itsm-table-th">부서</th>
                          <th className="itsm-table-th">상태</th>
                          <th className="itsm-table-th">우선순위</th>
                          <th className="itsm-table-th">담당자</th>
                          <th className="itsm-table-th">예상 완료</th>
                          <th className="itsm-table-th">작업</th>
                        </tr>
                      </thead>
                      <tbody className="itsm-table-tbody">
                        {filteredRequests.map((request) => (
                          <tr key={request.id}>
                            <td className="itsm-table-td font-medium">{request.id}</td>
                            <td className="itsm-table-td">{request.title}</td>
                            <td className="itsm-table-td">{request.requester}</td>
                            <td className="itsm-table-td">{request.department}</td>
                            <td className="itsm-table-td">
                              <span className={getStatusColor(request.status)}>
                                {request.status}
                              </span>
                            </td>
                            <td className="itsm-table-td">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                                {request.priority}
                              </span>
                            </td>
                            <td className="itsm-table-td">{request.assignedTechnician || '-'}</td>
                            <td className="itsm-table-td">{request.estimatedCompletion || '-'}</td>
                            <td className="itsm-table-td">
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 text-xs"
                                >
                                  상세보기
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 text-xs"
                                >
                                  배정
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* 기술자 관리 탭 */}
          {activeTab === 'technicians' && (
            <div className="space-y-6">
              <Card className="itsm-card">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">기술자 목록</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {technicians.map((tech) => (
                      <div key={tech.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900">{tech.name}</h4>
                          <span className="text-sm text-gray-500">{tech.department}</span>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">현재 작업량</span>
                            <span className="font-medium">{tech.currentWorkload}건</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">완료된 작업</span>
                            <span className="font-medium">{tech.completedTasks}건</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">평균 평점</span>
                            <span className="font-medium">{tech.averageRating}/5.0</span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">보유 기술</p>
                          <div className="flex flex-wrap gap-1">
                            {tech.skills.map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                          >
                            상세보기
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white flex-1"
                          >
                            작업 배정
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* 설정 탭 */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <Card className="itsm-card">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">서비스 관리 설정</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        기본 응답 시간 (시간)
                      </label>
                      <Input
                        type="number"
                        defaultValue="2"
                        className="w-32"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        자동 배정 활성화
                      </label>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        이메일 알림 활성화
                      </label>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="pt-4">
                      <Button className="itsm-button-primary">
                        설정 저장
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}