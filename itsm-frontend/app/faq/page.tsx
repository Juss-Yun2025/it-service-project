"use client"

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FigmaCard } from '@/components/figma/FigmaCard'
import { FigmaButton } from '@/components/figma/FigmaButton'
import { ArrowLeft, Search, Plus, Edit, Trash2, Lock, Unlock } from 'lucide-react'

interface FAQ {
  id: string
  icon: string
  summary: string
  content: string
  category: string
  solution: string
  persistentIssue: string
  isLocked: boolean
  createdAt: string
  updatedAt: string
}

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [isManager, setIsManager] = useState(false) // 관리매니저 권한 확인

  // 샘플 FAQ 데이터
  const [faqs] = useState<FAQ[]>([
    {
      id: '1',
      icon: '💻',
      summary: '컴퓨터가 느려질 때',
      content: '컴퓨터가 갑자기 느려지는 현상이 발생했습니다.',
      category: '성능',
      solution: '1. 불필요한 프로그램 종료\n2. 디스크 정리 실행\n3. 재부팅 시도',
      persistentIssue: '위 방법으로 해결되지 않으면 IT팀에 문의하세요.',
      isLocked: false,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: '2',
      icon: '📧',
      summary: '이메일이 발송되지 않을 때',
      content: '이메일을 보내려고 하는데 발송이 되지 않습니다.',
      category: '이메일',
      solution: '1. 인터넷 연결 확인\n2. 이메일 주소 확인\n3. 첨부파일 크기 확인',
      persistentIssue: '계속 문제가 발생하면 메일 서버 상태를 확인해주세요.',
      isLocked: false,
      createdAt: '2024-01-10',
      updatedAt: '2024-01-10'
    },
    {
      id: '3',
      icon: '🔒',
      summary: '비밀번호를 잊어버렸을 때',
      content: '시스템 로그인 비밀번호를 잊어버렸습니다.',
      category: '보안',
      solution: '1. 비밀번호 찾기 기능 사용\n2. IT팀에 초기화 요청',
      persistentIssue: '보안상의 이유로 직접 초기화는 불가능합니다.',
      isLocked: true,
      createdAt: '2024-01-08',
      updatedAt: '2024-01-08'
    }
  ])

  const itemsPerPage = 6
  const filteredFAQs = faqs.filter(faq => 
    faq.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredFAQs.length / itemsPerPage)
  const currentFAQs = filteredFAQs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleFAQClick = (faq: FAQ) => {
    setSelectedFAQ(faq)
  }

  const handleAddFAQ = () => {
    setShowAddModal(true)
  }

  const handleEditFAQ = (faq: FAQ) => {
    setSelectedFAQ(faq)
    setShowEditModal(true)
  }

  const handleDeleteFAQ = (faqId: string) => {
    if (window.confirm('정말로 이 FAQ를 삭제하시겠습니까?')) {
      console.log('FAQ 삭제:', faqId)
    }
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
                자주하는 질문
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
                onClick={() => window.location.href = '/inquiry'}
                variant="secondary"
                size="sm"
              >
                일반문의사항
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
        {/* 검색 및 관리 버튼 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--figma-text-muted)' }} />
              <Input
                type="text"
                placeholder="FAQ 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                style={{
                  borderColor: 'var(--figma-border)',
                  fontFamily: 'var(--figma-font-family)',
                  fontSize: 'var(--figma-font-size-base)'
                }}
              />
            </div>
          </div>
          {isManager && (
            <div className="flex space-x-2">
              <FigmaButton
                onClick={handleAddFAQ}
                variant="primary"
                size="md"
              >
                <Plus className="h-4 w-4 mr-2" />
                질문 추가
              </FigmaButton>
            </div>
          )}
        </div>

        {/* FAQ 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentFAQs.map((faq) => (
            <FigmaCard 
              key={faq.id} 
              variant="elevated" 
              padding="lg" 
              className="hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">{faq.icon}</div>
                <div className="flex items-center space-x-2">
                  {faq.isLocked ? (
                    <Lock className="h-4 w-4" style={{ color: 'var(--figma-error)' }} />
                  ) : (
                    <Unlock className="h-4 w-4" style={{ color: 'var(--figma-success)' }} />
                  )}
                  {isManager && (
                    <div className="flex space-x-1">
                      <FigmaButton
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditFAQ(faq)
                        }}
                        variant="secondary"
                        className="p-1 h-8 w-8"
                      >
                        <Edit className="h-3 w-3" />
                      </FigmaButton>
                      <FigmaButton
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteFAQ(faq.id)
                        }}
                        variant="danger"
                        className="p-1 h-8 w-8"
                      >
                        <Trash2 className="h-3 w-3" />
                      </FigmaButton>
                    </div>
                  )}
                </div>
              </div>
              
              <h3 className="text-lg font-semibold mb-2" style={{
                color: 'var(--figma-text-primary)',
                fontFamily: 'var(--figma-font-family)'
              }}>
                {faq.summary}
              </h3>
              <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--figma-text-secondary)' }}>
                {faq.content}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-1 rounded-full" style={{
                  color: 'var(--figma-primary)',
                  background: 'var(--figma-primary-light)'
                }}>
                  {faq.category}
                </span>
                <FigmaButton
                  onClick={() => handleFAQClick(faq)}
                  variant="primary"
                  size="sm"
                >
                  자세히 보기
                </FigmaButton>
              </div>
            </FigmaCard>
          ))}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
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
      </main>

      {/* FAQ 상세보기 모달 */}
      {selectedFAQ && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ 
          background: 'var(--figma-background)',
          zIndex: 'var(--figma-z-modal)'
        }}>
          <FigmaCard variant="elevated" padding="lg" className="max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{selectedFAQ.icon}</span>
                <div>
                  <h2 className="text-xl font-bold" style={{
                    color: 'var(--figma-text-primary)',
                    fontFamily: 'var(--figma-font-family)'
                  }}>
                    {selectedFAQ.summary}
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--figma-text-secondary)' }}>
                    {selectedFAQ.category}
                  </p>
                </div>
              </div>
              <FigmaButton
                onClick={() => setSelectedFAQ(null)}
                variant="secondary"
                size="sm"
              >
                ✕
              </FigmaButton>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2" style={{
                  color: 'var(--figma-text-primary)',
                  fontFamily: 'var(--figma-font-family)'
                }}>
                  발생 원인
                </h3>
                <p className="p-3 rounded-lg" style={{
                  color: 'var(--figma-text-secondary)',
                  background: 'var(--figma-surface)',
                  borderRadius: 'var(--figma-radius-lg)'
                }}>
                  {selectedFAQ.content}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2" style={{
                  color: 'var(--figma-text-primary)',
                  fontFamily: 'var(--figma-font-family)'
                }}>
                  즉시 해결
                </h3>
                <div className="p-3 rounded-lg whitespace-pre-line" style={{
                  color: 'var(--figma-text-secondary)',
                  background: 'var(--figma-success-light)',
                  borderRadius: 'var(--figma-radius-lg)'
                }}>
                  {selectedFAQ.solution}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2" style={{
                  color: 'var(--figma-text-primary)',
                  fontFamily: 'var(--figma-font-family)'
                }}>
                  문제가 지속될 경우
                </h3>
                <p className="p-3 rounded-lg" style={{
                  color: 'var(--figma-text-secondary)',
                  background: 'var(--figma-warning-light)',
                  borderRadius: 'var(--figma-radius-lg)'
                }}>
                  {selectedFAQ.persistentIssue}
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <FigmaButton
                onClick={() => setSelectedFAQ(null)}
                variant="primary"
                size="md"
              >
                닫기
              </FigmaButton>
            </div>
          </FigmaCard>
        </div>
      )}

      {/* FAQ 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ 
          background: 'var(--figma-background)',
          zIndex: 'var(--figma-z-modal)'
        }}>
          <FigmaCard variant="elevated" padding="lg" className="max-w-2xl w-full mx-4">
            <h2 className="text-xl font-bold mb-4" style={{
              color: 'var(--figma-text-primary)',
              fontFamily: 'var(--figma-font-family)'
            }}>
              FAQ 추가
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{
                  color: 'var(--figma-text-primary)',
                  fontFamily: 'var(--figma-font-family)'
                }}>
                  아이콘
                </label>
                <Input 
                  placeholder="이모지 입력 (예: 💻)" 
                  style={{
                    borderColor: 'var(--figma-border)',
                    fontFamily: 'var(--figma-font-family)',
                    fontSize: 'var(--figma-font-size-base)'
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{
                  color: 'var(--figma-text-primary)',
                  fontFamily: 'var(--figma-font-family)'
                }}>
                  발생 원인 요약 *
                </label>
                <Input 
                  placeholder="요약 입력" 
                  style={{
                    borderColor: 'var(--figma-border)',
                    fontFamily: 'var(--figma-font-family)',
                    fontSize: 'var(--figma-font-size-base)'
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{
                  color: 'var(--figma-text-primary)',
                  fontFamily: 'var(--figma-font-family)'
                }}>
                  발생 원인 내용 *
                </label>
                <textarea 
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2" 
                  rows={3}
                  style={{
                    borderColor: 'var(--figma-border)',
                    fontFamily: 'var(--figma-font-family)',
                    fontSize: 'var(--figma-font-size-base)',
                    borderRadius: 'var(--figma-radius-lg)',
                    border: '1px solid var(--figma-border)'
                  }}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{
                  color: 'var(--figma-text-primary)',
                  fontFamily: 'var(--figma-font-family)'
                }}>
                  즉시 해결
                </label>
                <textarea 
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2" 
                  rows={3}
                  style={{
                    borderColor: 'var(--figma-border)',
                    fontFamily: 'var(--figma-font-family)',
                    fontSize: 'var(--figma-font-size-base)',
                    borderRadius: 'var(--figma-radius-lg)',
                    border: '1px solid var(--figma-border)'
                  }}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{
                  color: 'var(--figma-text-primary)',
                  fontFamily: 'var(--figma-font-family)'
                }}>
                  문제가 지속될 경우
                </label>
                <textarea 
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2" 
                  rows={3}
                  style={{
                    borderColor: 'var(--figma-border)',
                    fontFamily: 'var(--figma-font-family)',
                    fontSize: 'var(--figma-font-size-base)',
                    borderRadius: 'var(--figma-radius-lg)',
                    border: '1px solid var(--figma-border)'
                  }}
                ></textarea>
              </div>
              <div className="flex justify-end space-x-2">
                <FigmaButton
                  onClick={() => setShowAddModal(false)}
                  variant="secondary"
                  size="md"
                >
                  취소
                </FigmaButton>
                <FigmaButton
                  variant="primary"
                  size="md"
                >
                  추가
                </FigmaButton>
              </div>
            </form>
          </FigmaCard>
        </div>
      )}
    </div>
  )
}
