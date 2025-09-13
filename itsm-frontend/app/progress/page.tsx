"use client"

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FigmaCard } from '@/components/figma/FigmaCard'
import { FigmaButton } from '@/components/figma/FigmaButton'
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
    <div className="min-h-screen" style={{ background: 'var(--figma-background)' }}>
      {/* 헤더 */}
      <header className="shadow-sm" style={{ 
        background: 'var(--figma-surface)',
        borderBottom: '1px solid var(--figma-border)'
      }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <FigmaButton
                onClick={() => window.history.back()}
                variant="secondary"
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                뒤로가기
              </FigmaButton>
              <h1 className="text-2xl font-bold" style={{
                color: 'var(--figma-text-primary)',
                fontFamily: 'var(--figma-font-family)'
              }}>
                요청 진행사항
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <FigmaButton
                onClick={() => window.location.href = '/service-request'}
                variant="secondary"
                size="sm"
              >
                서비스신청
              </FigmaButton>
              <FigmaButton
                onClick={() => window.location.href = '/faq'}
                variant="secondary"
                size="sm"
              >
                자주하는질문
              </FigmaButton>
              <FigmaButton
                onClick={() => window.location.href = '/inquiry'}
                variant="secondary"
                size="sm"
              >
                일반문의사항
              </FigmaButton>
              <FigmaButton
                onClick={() => setShowInfoChangeModal(true)}
                variant="secondary"
                size="sm"
              >
                정보변경
              </FigmaButton>
              <FigmaButton
                onClick={() => window.location.href = '/'}
                variant="danger"
                size="sm"
              >
                로그아웃
              </FigmaButton>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* 검색 및 새로고침 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <FigmaButton
              onClick={handleRefresh}
              variant="primary"
              size="md"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              새로고침
            </FigmaButton>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium" style={{
                color: 'var(--figma-text-primary)',
                fontFamily: 'var(--figma-font-family)'
              }}>
                검색 기간:
              </label>
              <Input
                type="date"
                value={searchDate.startDate}
                onChange={(e) => setSearchDate({...searchDate, startDate: e.target.value})}
                className="w-40"
                style={{
                  borderColor: 'var(--figma-border)',
                  fontFamily: 'var(--figma-font-family)',
                  fontSize: 'var(--figma-font-size-base)'
                }}
              />
              <span style={{ color: 'var(--figma-text-secondary)' }}>~</span>
              <Input
                type="date"
                value={searchDate.endDate}
                onChange={(e) => setSearchDate({...searchDate, endDate: e.target.value})}
                className="w-40"
                style={{
                  borderColor: 'var(--figma-border)',
                  fontFamily: 'var(--figma-font-family)',
                  fontSize: 'var(--figma-font-size-base)'
                }}
              />
            </div>
          </div>
        </div>

        {/* 요청 목록 */}
        <FigmaCard variant="elevated" padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontFamily: 'var(--figma-font-family)' }}>
              <thead style={{ background: 'var(--figma-surface)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{
                    color: 'var(--figma-text-primary)',
                    borderBottom: '1px solid var(--figma-border)'
                  }}>
                    신청번호
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{
                    color: 'var(--figma-text-primary)',
                    borderBottom: '1px solid var(--figma-border)'
                  }}>
                    신청제목
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{
                    color: 'var(--figma-text-primary)',
                    borderBottom: '1px solid var(--figma-border)'
                  }}>
                    진행
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{
                    color: 'var(--figma-text-primary)',
                    borderBottom: '1px solid var(--figma-border)'
                  }}>
                    신청일시
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{
                    color: 'var(--figma-text-primary)',
                    borderBottom: '1px solid var(--figma-border)'
                  }}>
                    담당자
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{
                    color: 'var(--figma-text-primary)',
                    borderBottom: '1px solid var(--figma-border)'
                  }}>
                    완료일시
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{
                    color: 'var(--figma-text-primary)',
                    borderBottom: '1px solid var(--figma-border)'
                  }}>
                    작업
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentRequests.map((request) => {
                  const progressStatus = getProgressStatus(request.progress)
                  return (
                    <tr key={request.id} style={{ borderBottom: '1px solid var(--figma-border)' }}>
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--figma-text-primary)' }}>
                        {request.requestNumber}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--figma-text-secondary)' }}>
                        {request.title}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 rounded-full text-xs font-medium" style={{
                          color: progressStatus.text === '처리완료' ? 'var(--figma-success)' : 
                                 progressStatus.text === '미결처리' ? 'var(--figma-error)' : 'var(--figma-warning)',
                          background: progressStatus.text === '처리완료' ? 'var(--figma-success-light)' : 
                                     progressStatus.text === '미결처리' ? 'var(--figma-error-light)' : 'var(--figma-warning-light)'
                        }}>
                          {progressStatus.text}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--figma-text-secondary)' }}>
                        {request.requestDate}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--figma-text-secondary)' }}>
                        {request.assignedTechnician || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--figma-text-secondary)' }}>
                        {request.completedDate || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex space-x-2">
                          {request.progress === '정상접수' ? (
                            <>
                              <FigmaButton
                                size="sm"
                                onClick={() => handleEdit(request)}
                                variant="primary"
                                className="px-2 py-1 text-xs"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                수정
                              </FigmaButton>
                              <FigmaButton
                                size="sm"
                                onClick={() => handleDelete(request)}
                                variant="danger"
                                className="px-2 py-1 text-xs"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                삭제
                              </FigmaButton>
                            </>
                          ) : (
                            <FigmaButton
                              size="sm"
                              onClick={() => handleDetail(request)}
                              variant="success"
                              className="px-2 py-1 text-xs"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              상세보기
                            </FigmaButton>
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
            <div className="flex justify-center items-center space-x-2 p-4" style={{ borderTop: '1px solid var(--figma-border)' }}>
              <FigmaButton
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                variant="secondary"
                size="sm"
              >
                이전
              </FigmaButton>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <FigmaButton
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  variant={currentPage === page ? "primary" : "secondary"}
                  size="sm"
                >
                  {page}
                </FigmaButton>
              ))}
              <FigmaButton
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                variant="secondary"
                size="sm"
              >
                다음
              </FigmaButton>
            </div>
          )}
        </FigmaCard>
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
