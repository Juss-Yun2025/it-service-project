"use client"

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import PermissionGuard from '@/components/PermissionGuard'
import { canManageUsers, canManageTechnicians, canManageServices } from '@/lib/auth'
import { ArrowLeft, Users, Settings, BarChart3, Shield, Database, Server, Bell, RefreshCw } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'inactive'
  createdAt: string
}

interface Technician {
  id: string
  name: string
  email: string
  specialty: string
  status: 'active' | 'inactive'
  assignedTasks: number
  createdAt: string
}

export default function SystemAdminPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'technicians' | 'services' | 'settings' | 'security'>('dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  
  // 샘플 데이터
  const [users] = useState<User[]>([
    {
      id: '1',
      name: '김사용자',
      email: 'user1@example.com',
      role: 'user',
      status: 'active',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: '이기술자',
      email: 'tech1@example.com',
      role: 'technician',
      status: 'active',
      createdAt: '2024-01-10'
    },
    {
      id: '3',
      name: '박배정자',
      email: 'assign1@example.com',
      role: 'assignment_manager',
      status: 'active',
      createdAt: '2024-01-12'
    }
  ])

  const [technicians] = useState<Technician[]>([
    {
      id: '1',
      name: '이기술자',
      email: 'tech1@example.com',
      specialty: '네트워크',
      status: 'active',
      assignedTasks: 3,
      createdAt: '2024-01-10'
    },
    {
      id: '2',
      name: '최기술자',
      email: 'tech2@example.com',
      specialty: '서버',
      status: 'active',
      assignedTasks: 1,
      createdAt: '2024-01-08'
    }
  ])

  const handleUserStatusChange = (userId: string, status: 'active' | 'inactive') => {
    console.log(`사용자 ${userId} 상태 변경: ${status}`)
  }

  const handleTechnicianStatusChange = (technicianId: string, status: 'active' | 'inactive') => {
    console.log(`기술자 ${technicianId} 상태 변경: ${status}`)
  }

  // 시스템 메트릭 데이터
  const systemMetrics = {
    totalUsers: 156,
    activeUsers: 142,
    totalTechnicians: 12,
    activeTechnicians: 10,
    totalRequests: 1247,
    completedRequests: 1189,
    systemUptime: 99.8,
    averageResponseTime: '1.2시간'
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesStatus && matchesRole
  })

  return (
    <PermissionGuard userRole="system_admin" requiredPath="/system-admin">
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
                <h1 className="text-2xl font-bold text-gray-900">시스템관리</h1>
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
                  onClick={() => setActiveTab('users')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'users'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Users className="h-4 w-4 inline mr-2" />
                  사용자 관리
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
                  onClick={() => setActiveTab('services')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'services'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Server className="h-4 w-4 inline mr-2" />
                  서비스 관리
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'security'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Shield className="h-4 w-4 inline mr-2" />
                  보안 관리
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
                  시스템 설정
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
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">총 사용자</p>
                          <p className="text-2xl font-bold text-gray-900">{systemMetrics.totalUsers}</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="itsm-card">
                    <div className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Users className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">활성 사용자</p>
                          <p className="text-2xl font-bold text-gray-900">{systemMetrics.activeUsers}</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="itsm-card">
                    <div className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Server className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">총 요청</p>
                          <p className="text-2xl font-bold text-gray-900">{systemMetrics.totalRequests}</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="itsm-card">
                    <div className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <BarChart3 className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">시스템 가동률</p>
                          <p className="text-2xl font-bold text-gray-900">{systemMetrics.systemUptime}%</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* 추가 통계 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="itsm-card">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">사용자 현황</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">활성 사용자</span>
                          <span className="font-medium">{systemMetrics.activeUsers}명</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">비활성 사용자</span>
                          <span className="font-medium">{systemMetrics.totalUsers - systemMetrics.activeUsers}명</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">기술자</span>
                          <span className="font-medium">{systemMetrics.totalTechnicians}명</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="itsm-card">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">서비스 현황</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">완료된 요청</span>
                          <span className="font-medium">{systemMetrics.completedRequests}건</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">평균 응답 시간</span>
                          <span className="font-medium">{systemMetrics.averageResponseTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">완료율</span>
                          <span className="font-medium">
                            {Math.round((systemMetrics.completedRequests / systemMetrics.totalRequests) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* 사용자 관리 탭 */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                {/* 검색 및 필터 */}
                <Card className="itsm-card">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <Input
                          placeholder="이름 또는 이메일로 검색..."
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
                          <option value="active">활성</option>
                          <option value="inactive">비활성</option>
                        </Select>
                        <Select
                          value={roleFilter}
                          onChange={(e) => setRoleFilter(e.target.value)}
                          className="w-32"
                        >
                          <option value="all">모든 역할</option>
                          <option value="user">일반사용자</option>
                          <option value="technician">기술자</option>
                          <option value="assignment_manager">배정담당자</option>
                          <option value="service_manager">서비스관리</option>
                          <option value="system_admin">시스템관리</option>
                        </Select>
                        <Button
                          onClick={() => {
                            setSearchTerm('')
                            setStatusFilter('all')
                            setRoleFilter('all')
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

                <Card className="itsm-card">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">사용자 관리</h2>
                      <Button className="itsm-button-primary">
                        새 사용자 추가
                      </Button>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="itsm-table-container">
                        <thead className="itsm-table-thead">
                          <tr>
                            <th className="itsm-table-th">이름</th>
                            <th className="itsm-table-th">이메일</th>
                            <th className="itsm-table-th">역할</th>
                            <th className="itsm-table-th">상태</th>
                            <th className="itsm-table-th">가입일</th>
                            <th className="itsm-table-th">작업</th>
                          </tr>
                        </thead>
                        <tbody className="itsm-table-tbody">
                          {filteredUsers.map((user) => (
                            <tr key={user.id}>
                              <td className="itsm-table-td font-medium">{user.name}</td>
                              <td className="itsm-table-td">{user.email}</td>
                              <td className="itsm-table-td">
                                {user.role === 'user' ? '일반사용자' : 
                                 user.role === 'technician' ? '기술자' :
                                 user.role === 'assignment_manager' ? '기술자' : 
                                 user.role === 'service_manager' ? '서비스관리' :
                                 user.role === 'system_admin' ? '시스템관리' : user.role}
                              </td>
                              <td className="itsm-table-td">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  user.status === 'active' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {user.status === 'active' ? '활성' : '비활성'}
                                </span>
                              </td>
                              <td className="itsm-table-td">{user.createdAt}</td>
                              <td className="itsm-table-td">
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleUserStatusChange(user.id, user.status === 'active' ? 'inactive' : 'active')}
                                    className={`px-2 py-1 text-xs ${
                                      user.status === 'active'
                                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                    }`}
                                  >
                                    {user.status === 'active' ? '비활성화' : '활성화'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 text-xs"
                                  >
                                    편집
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
              <Card className="itsm-card">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">기술자 관리</h2>
                    <Button className="itsm-button-primary">
                      새 기술자 추가
                    </Button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="itsm-table-container">
                      <thead className="itsm-table-thead">
                        <tr>
                          <th className="itsm-table-th">이름</th>
                          <th className="itsm-table-th">이메일</th>
                          <th className="itsm-table-th">전문분야</th>
                          <th className="itsm-table-th">할당된 작업</th>
                          <th className="itsm-table-th">상태</th>
                          <th className="itsm-table-th">작업</th>
                        </tr>
                      </thead>
                      <tbody className="itsm-table-tbody">
                        {technicians.map((technician) => (
                          <tr key={technician.id}>
                            <td className="itsm-table-td font-medium">{technician.name}</td>
                            <td className="itsm-table-td">{technician.email}</td>
                            <td className="itsm-table-td">{technician.specialty}</td>
                            <td className="itsm-table-td">{technician.assignedTasks}개</td>
                            <td className="itsm-table-td">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                technician.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {technician.status === 'active' ? '활성' : '비활성'}
                              </span>
                            </td>
                            <td className="itsm-table-td">
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleTechnicianStatusChange(technician.id, technician.status === 'active' ? 'inactive' : 'active')}
                                  className={`px-2 py-1 text-xs ${
                                    technician.status === 'active'
                                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                                  }`}
                                >
                                  {technician.status === 'active' ? '비활성화' : '활성화'}
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 text-xs"
                                >
                                  편집
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
            )}

            {/* 서비스 관리 탭 */}
            {activeTab === 'services' && (
              <Card className="itsm-card">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">서비스 관리</h2>
                    <Button className="itsm-button-primary">
                      새 서비스 추가
                    </Button>
                  </div>
                  
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Server className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">서비스 관리 기능</h3>
                    <p className="text-gray-500">서비스 카테고리, SLA 설정, 워크플로우 관리 등의 기능이 여기에 표시됩니다.</p>
                  </div>
                </div>
              </Card>
            )}

            {/* 보안 관리 탭 */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <Card className="itsm-card">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">보안 설정</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          비밀번호 정책
                        </label>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input type="checkbox" defaultChecked className="mr-2" />
                            <span className="text-sm text-gray-700">최소 8자 이상</span>
                          </div>
                          <div className="flex items-center">
                            <input type="checkbox" defaultChecked className="mr-2" />
                            <span className="text-sm text-gray-700">영문과 숫자 포함</span>
                          </div>
                          <div className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span className="text-sm text-gray-700">특수문자 포함</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          세션 타임아웃 (분)
                        </label>
                        <Input type="number" defaultValue="30" className="w-32" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          로그인 시도 제한
                        </label>
                        <Input type="number" defaultValue="5" className="w-32" />
                      </div>
                      <Button className="itsm-button-primary">
                        보안 설정 저장
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* 시스템 설정 탭 */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <Card className="itsm-card">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">시스템 설정</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          시스템 이름
                        </label>
                        <Input defaultValue="ITSM 시스템" className="w-full" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          기본 언어
                        </label>
                        <Select defaultValue="ko" className="w-32">
                          <option value="ko">한국어</option>
                          <option value="en">English</option>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          시간대
                        </label>
                        <Select defaultValue="Asia/Seoul" className="w-48">
                          <option value="Asia/Seoul">Asia/Seoul (UTC+9)</option>
                          <option value="UTC">UTC (UTC+0)</option>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          이메일 알림
                        </label>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input type="checkbox" defaultChecked className="mr-2" />
                            <span className="text-sm text-gray-700">새 요청 알림</span>
                          </div>
                          <div className="flex items-center">
                            <input type="checkbox" defaultChecked className="mr-2" />
                            <span className="text-sm text-gray-700">완료 알림</span>
                          </div>
                          <div className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span className="text-sm text-gray-700">지연 알림</span>
                          </div>
                        </div>
                      </div>
                      <Button className="itsm-button-primary">
                        설정 저장
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}

          </div>
        </main>
      </div>
    </PermissionGuard>
  )
}
