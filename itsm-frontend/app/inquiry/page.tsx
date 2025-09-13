"use client"

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FigmaCard } from '@/components/figma/FigmaCard'
import { FigmaButton } from '@/components/figma/FigmaButton'
import { ArrowLeft, Search, RefreshCw, Plus, Eye, Lock, Unlock, Calendar, User, MessageSquare } from 'lucide-react'

interface Inquiry {
  id: string
  inquiryDate: string
  content: string
  inquirer: string
  answerDate: string
  answer: string
  answerer: string
  isSecret: boolean
  isMine: boolean
}

export default function InquiryPage() {
  const [searchDate, setSearchDate] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [showMyPostsOnly, setShowMyPostsOnly] = useState(false)
  const [showWriteModal, setShowWriteModal] = useState(false)
  const [showAnswerModal, setShowAnswerModal] = useState(false)
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [newInquiry, setNewInquiry] = useState({
    content: '',
    isSecret: false
  })

  // 샘플 데이터
  const [inquiries] = useState<Inquiry[]>([
    {
      id: '1',
      inquiryDate: '2025-01-12 09:30',
      content: '시스템 사용법에 대해 문의드립니다.',
      inquirer: '김사용자',
      answerDate: '2025-01-12 14:20',
      answer: '시스템 사용법은 매뉴얼을 참고해주세요.',
      answerer: '관리자',
      isSecret: false,
      isMine: true
    },
    {
      id: '2',
      inquiryDate: '2025-01-12 10:15',
      content: '비밀문의입니다.',
      inquirer: '이사용자',
      answerDate: '2025-01-12 15:30',
      answer: '비밀 답변입니다.',
      answerer: '관리자',
      isSecret: true,
      isMine: false
    },
    {
      id: '3',
      inquiryDate: '2025-01-12 11:00',
      content: '로그인 오류가 발생합니다.',
      inquirer: '최사용자',
      answerDate: '',
      answer: '',
      answerer: '',
      isSecret: false,
      isMine: true
    },
    {
      id: '4',
      inquiryDate: '2025-01-11 16:45',
      content: '계정 초기화 요청',
      inquirer: '박사용자',
      answerDate: '2025-01-12 09:15',
      answer: '계정이 초기화되었습니다.',
      answerer: '관리자',
      isSecret: false,
      isMine: false
    }
  ])

  const itemsPerPage = 10
  const filteredInquiries = inquiries.filter(inquiry => {
    const inquiryDate = new Date(inquiry.inquiryDate.split(' ')[0])
    const startDate = new Date(searchDate.startDate)
    const endDate = new Date(searchDate.endDate)
    const dateMatch = inquiryDate >= startDate && inquiryDate <= endDate
    const myPostsMatch = showMyPostsOnly ? inquiry.isMine : true
    return dateMatch && myPostsMatch
  })

  const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage)
  const currentInquiries = filteredInquiries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleWriteInquiry = () => {
    setNewInquiry({ content: '', isSecret: false })
    setShowWriteModal(true)
  }

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newInquiry.content.trim()) {
      alert('문의내용을 입력해주세요.')
      return
    }
    
    console.log('새 문의 등록:', newInquiry)
    setShowWriteModal(false)
    setNewInquiry({ content: '', isSecret: false })
    // 실제로는 API 호출
  }

  const handleViewAnswer = (inquiry: Inquiry) => {
    if (inquiry.answerDate) {
      setSelectedInquiry(inquiry)
      setShowAnswerModal(true)
    }
  }

  const handleRefresh = () => {
    setSearchDate({
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    })
    setCurrentPage(1)
    setShowMyPostsOnly(false)
  }

  const maskName = (name: string, isMine: boolean) => {
    if (isMine) return name
    return name.charAt(0) + '**'
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
                일반 문의사항
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <FigmaButton
                onClick={() => window.location.href = '/progress'}
                variant="secondary"
                size="sm"
              >
                요청진행사항
              </FigmaButton>
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
        {/* 검색 및 필터 */}
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
          <div className="flex items-center space-x-4">
            <FigmaButton
              onClick={() => setShowMyPostsOnly(!showMyPostsOnly)}
              variant={showMyPostsOnly ? "primary" : "secondary"}
              size="md"
            >
              작성글만보기
            </FigmaButton>
            <FigmaButton
              onClick={handleWriteInquiry}
              variant="success"
              size="md"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              문의글쓰기
            </FigmaButton>
          </div>
        </div>

        {/* 문의 목록 */}
        <FigmaCard variant="elevated" padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontFamily: 'var(--figma-font-family)' }}>
              <thead style={{ background: 'var(--figma-surface)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{
                    color: 'var(--figma-text-primary)',
                    borderBottom: '1px solid var(--figma-border)'
                  }}>
                    문의일시
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{
                    color: 'var(--figma-text-primary)',
                    borderBottom: '1px solid var(--figma-border)'
                  }}>
                    문의내용
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{
                    color: 'var(--figma-text-primary)',
                    borderBottom: '1px solid var(--figma-border)'
                  }}>
                    문의자
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{
                    color: 'var(--figma-text-primary)',
                    borderBottom: '1px solid var(--figma-border)'
                  }}>
                    답변일시
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{
                    color: 'var(--figma-text-primary)',
                    borderBottom: '1px solid var(--figma-border)'
                  }}>
                    잠금아이콘
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
                {currentInquiries.map((inquiry) => (
                  <tr key={inquiry.id} style={{ borderBottom: '1px solid var(--figma-border)' }}>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--figma-text-secondary)' }}>
                      {inquiry.inquiryDate}
                    </td>
                    <td className="px-4 py-3 text-sm max-w-xs truncate" style={{ color: 'var(--figma-text-primary)' }}>
                      {inquiry.content}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--figma-text-secondary)' }}>
                      {maskName(inquiry.inquirer, inquiry.isMine)}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--figma-text-secondary)' }}>
                      {inquiry.answerDate || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {inquiry.isSecret ? (
                        <Lock className="h-4 w-4" style={{ color: 'var(--figma-error)' }} />
                      ) : (
                        <Unlock className="h-4 w-4" style={{ color: 'var(--figma-success)' }} />
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {inquiry.answerDate && !inquiry.isSecret ? (
                        <FigmaButton
                          size="sm"
                          onClick={() => handleViewAnswer(inquiry)}
                          variant="primary"
                          className="px-2 py-1 text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          답변보기
                        </FigmaButton>
                      ) : (
                        <span className="text-sm" style={{ color: 'var(--figma-text-muted)' }}>
                          {inquiry.isSecret ? '비밀글' : '답변대기'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
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

      {/* 문의글쓰기 모달 */}
      {showWriteModal && (
        <div className="itsm-modal-overlay">
          <div className="itsm-modal-content">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">문의글쓰기</h2>
              <Button
                onClick={() => setShowWriteModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>

            <form onSubmit={handleSubmitInquiry} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  문의내용 <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={newInquiry.content}
                  onChange={(e) => setNewInquiry({...newInquiry, content: e.target.value})}
                  placeholder="문의 내용을 입력하세요"
                  rows={6}
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isSecret"
                  checked={newInquiry.isSecret}
                  onChange={(e) => setNewInquiry({...newInquiry, isSecret: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isSecret" className="ml-2 block text-sm font-medium text-gray-700">
                  비밀글여부
                </label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  onClick={() => setShowWriteModal(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  등록
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 답변보기 모달 */}
      {showAnswerModal && selectedInquiry && (
        <div className="itsm-modal-overlay">
          <div className="itsm-modal-content">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">답변보기</h2>
              <Button
                onClick={() => setShowAnswerModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">문의일시</label>
                  <p className="text-gray-900">{selectedInquiry.inquiryDate}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">문의자</label>
                  <p className="text-gray-900">{maskName(selectedInquiry.inquirer, selectedInquiry.isMine)}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">문의내용</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedInquiry.content}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">답변내용</label>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedInquiry.answer}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">답변자</label>
                  <p className="text-gray-900">{selectedInquiry.answerer}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">답변일시</label>
                  <p className="text-gray-900">{selectedInquiry.answerDate}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                onClick={() => setShowAnswerModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                닫기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
