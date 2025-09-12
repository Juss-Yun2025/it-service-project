"use client"

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Search, RefreshCw, Eye, Edit, Trash2, Calendar, User, Clock, CheckCircle } from 'lucide-react'

interface ServiceRequest {
  id: string
  requestNumber: string
  title: string
  content: string
  requester: string
  requesterContact: string
  requesterDept: string
  requestDate: string
  currentStatus: string
  progress: string
  assignedTechnician: string
  completedDate: string
  actualRequester?: string
  actualContact?: string
  actualDept?: string
  location: string
  isProxyRequest: boolean
}

export default function ProgressPage() {
  const [searchDate, setSearchDate] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showInfoChangeModal, setShowInfoChangeModal] = useState(false)

  // 샘플 데이터
  const [serviceRequests] = useState<ServiceRequest[]>([
    {
      id: '1',
      requestNumber: 'SR-20250112-001',
      title: '컴퓨터 속도 개선 요청',
      content: '컴퓨터가 매우 느려져서 작업에 지장이 있습니다.',
      requester: '김사용자',
      requesterContact: '010-1234-5678',
      requesterDept: '개발팀',
      requestDate: '2025-01-12 09:30',
      currentStatus: '정상작동',
      progress: '정상접수',
      assignedTechnician: '',
      completedDate: '',
      location: '3층 개발팀 사무실',
      isProxyRequest: false
    },
    {
      id: '2',
      requestNumber: 'SR-20250112-002',
      title: '프린터 연결 오류',
      content: '프린터가 연결되지 않아 인쇄가 안됩니다.',
      requester: '이사용자',
      requesterContact: '010-2345-6789',
      requesterDept: '마케팅팀',
      requestDate: '2025-01-12 10:15',
      currentStatus: '오류발생',
      progress: '담당배정',
      assignedTechnician: '박기술자',
      completedDate: '',
      location: '2층 마케팅팀 사무실',
      isProxyRequest: false
    },
    {
      id: '3',
      requestNumber: 'SR-20250112-003',
      title: '이메일 발송 오류',
      content: '이메일이 발송되지 않는 문제가 발생했습니다.',
      requester: '최사용자',
      requesterContact: '010-3456-7890',
      requesterDept: '영업팀',
      requestDate: '2025-01-12 11:00',
      currentStatus: '오류발생',
      progress: '작업진행',
      assignedTechnician: '김기술자',
      completedDate: '',
      location: '1층 영업팀 사무실',
      isProxyRequest: true,
      actualRequester: '정대리',
      actualContact: '010-4567-8901',
      actualDept: '영업팀'
    },
    {
      id: '4',
      requestNumber: 'SR-20250111-001',
      title: '네트워크 연결 불안정',
      content: '인터넷 연결이 불안정하여 작업에 지장이 있습니다.',
      requester: '박사용자',
      requesterContact: '010-5678-9012',
      requesterDept: '기획팀',
      requestDate: '2025-01-11 14:20',
      currentStatus: '오류발생',
      progress: '처리완료',
      assignedTechnician: '이기술자',
      completedDate: '2025-01-11 16:30',
      location: '4층 기획팀 사무실',
      isProxyRequest: false
    }
  ])

  const itemsPerPage = 10
  const filteredRequests = serviceRequests.filter(request => {
    const requestDate = new Date(request.requestDate.split(' ')[0])
    const startDate = new Date(searchDate.startDate)
    const endDate = new Date(searchDate.endDate)
    return requestDate >= startDate && requestDate <= endDate
  })

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage)
  const currentRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getProgressStatus = (progress: string) => {
    switch (progress) {
      case '정상접수': return { text: '정상접수', class: 'itsm-status-info' }
      case '담당배정': return { text: '담당배정', class: 'itsm-status-warning' }
      case '시간조율': return { text: '시간조율', class: 'itsm-status-warning' }
      case '작업진행': return { text: '작업진행', class: 'itsm-status-warning' }
      case '처리완료': return { text: '처리완료', class: 'itsm-status-success' }
      case '미결처리': return { text: '미결처리', class: 'itsm-status-error' }
      default: return { text: progress, class: 'itsm-status-info' }
    }
  }

  const handleEdit = (request: ServiceRequest) => {
    if (request.progress === '정상접수') {
      setSelectedRequest(request)
      setShowEditModal(true)
    }
  }

  const handleDelete = (request: ServiceRequest) => {
    if (request.progress === '정상접수') {
      setSelectedRequest(request)
      setShowDeleteModal(true)
    }
  }

  const handleDetail = (request: ServiceRequest) => {
    setSelectedRequest(request)
    setShowDetailModal(true)
  }

  const handleRefresh = () => {
    setSearchDate({
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    })
    setCurrentPage(1)
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
              <h1 className="text-2xl font-bold text-gray-900">요청 진행사항</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => window.location.href = '/service-request'}
                className="text-gray-600 hover:text-gray-900"
              >
                서비스신청
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
                onClick={() => setShowInfoChangeModal(true)}
                className="text-gray-600 hover:text-gray-900"
              >
                정보변경
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
        {/* 검색 및 새로고침 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleRefresh}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className="h-4 w-4" />
              새로고침
            </Button>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">검색 기간:</label>
              <Input
                type="date"
                value={searchDate.startDate}
                onChange={(e) => setSearchDate({...searchDate, startDate: e.target.value})}
                className="w-40"
              />
              <span className="text-gray-500">~</span>
              <Input
                type="date"
                value={searchDate.endDate}
                onChange={(e) => setSearchDate({...searchDate, endDate: e.target.value})}
                className="w-40"
              />
            </div>
          </div>
        </div>

        {/* 요청 목록 */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="itsm-table-container">
              <thead className="itsm-table-thead">
                <tr>
                  <th className="itsm-table-th">신청번호</th>
                  <th className="itsm-table-th">신청제목</th>
                  <th className="itsm-table-th">진행</th>
                  <th className="itsm-table-th">신청일시</th>
                  <th className="itsm-table-th">담당자</th>
                  <th className="itsm-table-th">완료일시</th>
                  <th className="itsm-table-th">작업</th>
                </tr>
              </thead>
              <tbody className="itsm-table-tbody">
                {currentRequests.map((request) => {
                  const progressStatus = getProgressStatus(request.progress)
                  return (
                    <tr key={request.id}>
                      <td className="itsm-table-td font-medium">{request.requestNumber}</td>
                      <td className="itsm-table-td">{request.title}</td>
                      <td className="itsm-table-td">
                        <span className={progressStatus.class}>
                          {progressStatus.text}
                        </span>
                      </td>
                      <td className="itsm-table-td">{request.requestDate}</td>
                      <td className="itsm-table-td">{request.assignedTechnician || '-'}</td>
                      <td className="itsm-table-td">{request.completedDate || '-'}</td>
                      <td className="itsm-table-td">
                        <div className="flex space-x-2">
                          {request.progress === '정상접수' ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleEdit(request)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 text-xs"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                수정
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleDelete(request)}
                                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 text-xs"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                삭제
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleDetail(request)}
                              className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 text-xs"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              상세보기
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 p-4">
              <Button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1"
              >
                이전
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </Button>
              ))}
              <Button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1"
              >
                다음
              </Button>
            </div>
          )}
        </Card>
      </main>

      {/* 신청정보수정 모달 */}
      {showEditModal && selectedRequest && (
        <div className="itsm-modal-overlay">
          <div className="itsm-modal-content">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">신청정보수정</h2>
              <Button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">신청번호</label>
                  <Input value={selectedRequest.requestNumber} readOnly className="bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">신청자</label>
                  <Input value={selectedRequest.requester} readOnly className="bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">신청연락처</label>
                  <Input value={selectedRequest.requesterContact} readOnly className="bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">신청위치</label>
                  <Input value={selectedRequest.location} readOnly className="bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">신청일시</label>
                  <Input value={selectedRequest.requestDate} readOnly className="bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">현재상태</label>
                  <Input value={selectedRequest.currentStatus} readOnly className="bg-gray-100" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">신청제목 *</label>
                <Input defaultValue={selectedRequest.title} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">신청내용 *</label>
                <textarea 
                  defaultValue={selectedRequest.content}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">현재상태 *</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="정상작동">정상작동</option>
                  <option value="오류발생">오류발생</option>
                  <option value="메시지창">메시지창</option>
                  <option value="부분불능">부분불능</option>
                  <option value="전체불능">전체불능</option>
                  <option value="점검요청">점검요청</option>
                  <option value="기타상태">기타상태</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                onClick={() => setShowEditModal(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white mr-2"
              >
                취소
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                수정완료
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 신청정보삭제 모달 */}
      {showDeleteModal && selectedRequest && (
        <div className="itsm-modal-overlay">
          <div className="itsm-modal-content">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">신청정보삭제</h2>
              <Button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">신청번호</label>
                  <Input value={selectedRequest.requestNumber} readOnly className="bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">신청제목</label>
                  <Input value={selectedRequest.title} readOnly className="bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">신청자</label>
                  <Input value={selectedRequest.requester} readOnly className="bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">신청연락처</label>
                  <Input value={selectedRequest.requesterContact} readOnly className="bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">신청위치</label>
                  <Input value={selectedRequest.location} readOnly className="bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">신청일시</label>
                  <Input value={selectedRequest.requestDate} readOnly className="bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">현재상태</label>
                  <Input value={selectedRequest.currentStatus} readOnly className="bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">실제신청자</label>
                  <Input value={selectedRequest.actualRequester || '-'} readOnly className="bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">실제연락처</label>
                  <Input value={selectedRequest.actualContact || '-'} readOnly className="bg-gray-100" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">신청내용</label>
                <textarea 
                  value={selectedRequest.content}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  rows={4}
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white mr-2"
              >
                취소
              </Button>
              <Button 
                onClick={() => {
                  if (window.confirm('정말로 삭제하시겠습니까?')) {
                    setShowDeleteModal(false)
                    // 삭제 로직 구현
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                삭제완료
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 서비스상세보기 모달 */}
      {showDetailModal && selectedRequest && (
        <div className="itsm-modal-overlay">
          <div className="itsm-modal-content max-w-4xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">서비스상세보기</h2>
              <Button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 서비스 신청 정보 */}
              <Card className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">서비스 신청 정보</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">신청번호</label>
                    <p className="text-gray-900">{selectedRequest.requestNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">신청제목</label>
                    <p className="text-gray-900">{selectedRequest.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">신청내용</label>
                    <p className="text-gray-900">{selectedRequest.content}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">신청자</label>
                    <p className="text-gray-900">{selectedRequest.requester}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">신청연락처</label>
                    <p className="text-gray-900">{selectedRequest.requesterContact}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">신청위치</label>
                    <p className="text-gray-900">{selectedRequest.location}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">신청일시</label>
                    <p className="text-gray-900">{selectedRequest.requestDate}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">현재상태</label>
                    <p className="text-gray-900">{selectedRequest.currentStatus}</p>
                  </div>
                  {selectedRequest.isProxyRequest && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">실제신청자</label>
                        <p className="text-gray-900">{selectedRequest.actualRequester}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">실제연락처</label>
                        <p className="text-gray-900">{selectedRequest.actualContact}</p>
                      </div>
                    </>
                  )}
                </div>
              </Card>

              {/* 작업 진행 정보 */}
              <Card className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">작업 진행 정보</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">배정일시</label>
                    <p className="text-gray-900">{selectedRequest.requestDate}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">서비스유형</label>
                    <p className="text-gray-900">장애</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">조치담당자</label>
                    <p className="text-gray-900">{selectedRequest.assignedTechnician || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">예정조율일시</label>
                    <p className="text-gray-900">-</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">작업시작일시</label>
                    <p className="text-gray-900">-</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">작업내역</label>
                    <p className="text-gray-900">-</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">작업완료일시</label>
                    <p className="text-gray-900">{selectedRequest.completedDate || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">문제사항</label>
                    <p className="text-gray-900">-</p>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <label className="text-sm font-medium text-gray-700">미결완료</label>
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                onClick={() => setShowDetailModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                나가기
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 정보변경 모달 */}
      {showInfoChangeModal && (
        <div className="itsm-modal-overlay">
          <div className="itsm-modal-content">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">정보변경</h2>
              <Button
                onClick={() => setShowInfoChangeModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                <Input defaultValue="user@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">성명</label>
                <Input defaultValue="김사용자" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">직급</label>
                <Input defaultValue="대리" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">소속</label>
                <Input defaultValue="개발팀" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">연락처</label>
                <Input defaultValue="010-1234-5678" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">현재 비밀번호</label>
                <Input type="password" placeholder="현재 비밀번호를 입력하세요" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">새 비밀번호</label>
                <Input type="password" placeholder="새 비밀번호를 입력하세요" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">새 비밀번호 확인</label>
                <Input type="password" placeholder="새 비밀번호를 다시 입력하세요" />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                onClick={() => setShowInfoChangeModal(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white mr-2"
              >
                취소
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                수정완료
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
