"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FigmaCard } from "@/components/figma/FigmaCard";
import { FigmaButton } from "@/components/figma/FigmaButton";
import UserCustomization from "@/components/UserCustomization";

type ServiceStatus = {
  id: number;
  name: string;
  status: "정상" | "경고" | "오류" | "점검중";
  uptime: string;
  lastUpdate: string;
  responseTime: string;
  priority: "높음" | "보통" | "낮음";
};

type QuickResponse = {
  id: number;
  title: string;
  description: string;
  category: string;
  estimatedTime: string;
  icon: string;
};

type UserRequest = {
  id: string;
  title: string;
  status: "접수" | "배정중" | "진행중" | "완료" | "취소";
  priority: "높음" | "보통" | "낮음";
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  estimatedCompletion?: string;
};

// 더미 데이터
const serviceStatuses: ServiceStatus[] = [
  { id: 1, name: "이메일 서비스", status: "정상", uptime: "99.9%", lastUpdate: "2024-01-22 14:30", responseTime: "0.2초", priority: "높음" },
  { id: 2, name: "파일 서버", status: "경고", uptime: "98.5%", lastUpdate: "2024-01-22 14:25", responseTime: "1.5초", priority: "높음" },
  { id: 3, name: "데이터베이스", status: "정상", uptime: "99.8%", lastUpdate: "2024-01-22 14:30", responseTime: "0.1초", priority: "높음" },
  { id: 4, name: "웹 애플리케이션", status: "오류", uptime: "95.2%", lastUpdate: "2024-01-22 14:20", responseTime: "5.2초", priority: "높음" },
  { id: 5, name: "백업 시스템", status: "정상", uptime: "99.9%", lastUpdate: "2024-01-22 14:30", responseTime: "0.3초", priority: "보통" },
  { id: 6, name: "VPN 서비스", status: "점검중", uptime: "99.7%", lastUpdate: "2024-01-22 14:15", responseTime: "2.1초", priority: "높음" }
];

const quickResponses: QuickResponse[] = [
  { id: 1, title: "이메일 접속 불가", description: "이메일 서비스에 접속할 수 없는 경우", category: "이메일", estimatedTime: "10분", icon: "📧" },
  { id: 2, title: "파일 업로드 오류", description: "파일 업로드 시 오류가 발생하는 경우", category: "파일서버", estimatedTime: "15분", icon: "📁" },
  { id: 3, title: "VPN 연결 실패", description: "VPN 연결이 되지 않는 경우", category: "네트워크", estimatedTime: "20분", icon: "🔒" },
  { id: 4, title: "웹사이트 접속 불가", description: "내부 웹사이트에 접속할 수 없는 경우", category: "웹서비스", estimatedTime: "25분", icon: "🌐" },
  { id: 5, title: "프린터 인쇄 오류", description: "프린터 인쇄가 되지 않는 경우", category: "하드웨어", estimatedTime: "30분", icon: "🖨️" },
  { id: 6, title: "소프트웨어 설치", description: "새로운 소프트웨어 설치 요청", category: "소프트웨어", estimatedTime: "1시간", icon: "💻" }
];

const userRequests: UserRequest[] = [
  { id: "SR-2024-001", title: "이메일 첨부파일 다운로드 오류", status: "진행중", priority: "높음", createdAt: "2024-01-22 09:30", updatedAt: "2024-01-22 14:15", assignedTo: "김기술", estimatedCompletion: "2024-01-22 16:00" },
  { id: "SR-2024-002", title: "VPN 접속 불가", status: "배정중", priority: "높음", createdAt: "2024-01-22 13:45", updatedAt: "2024-01-22 14:00" },
  { id: "SR-2024-003", title: "프린터 드라이버 업데이트", status: "완료", priority: "보통", createdAt: "2024-01-21 16:20", updatedAt: "2024-01-22 10:30", assignedTo: "박기술" }
];

export default function UserDashboard() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedQuickResponse, setSelectedQuickResponse] = useState<QuickResponse | null>(null);
  const [showQuickResponseModal, setShowQuickResponseModal] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
     // 서비스 신청 폼 상태
   const [requestDateTime, setRequestDateTime] = useState<string>("");
   const [managementId, setManagementId] = useState<string>("");
   const [requestStatus, setRequestStatus] = useState<string>("정상작동");
   const [requestTitle, setRequestTitle] = useState<string>("");
   const [requestContent, setRequestContent] = useState<string>("");
   const [requestType, setRequestType] = useState<string>("요청");
   const [requestLocation, setRequestLocation] = useState<string>("");
   const [isProxyRequest, setIsProxyRequest] = useState<boolean>(false);
   const [actualRequester, setActualRequester] = useState<string>("");
   const [actualContact, setActualContact] = useState<string>("");
   const [actualDept, setActualDept] = useState<string>("");

  // 실시간 업데이트 시뮬레이션
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // 실시간 데이터 업데이트 시뮬레이션
      console.log("실시간 데이터 업데이트 중...");
    }, 30000); // 30초마다 업데이트

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // URL 파라미터에서 탭 정보 읽기
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['dashboard', 'service-request', 'quick-response', 'monitoring', 'my-requests', 'customization'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // 현재 시간 설정
  useEffect(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const y = now.getFullYear();
    const m = pad(now.getMonth() + 1);
    const d = pad(now.getDate());
    const hh = pad(now.getHours());
    const mm = pad(now.getMinutes());
    const dtLocal = `${y}-${m}-${d}T${hh}:${mm}`;
    setRequestDateTime(dtLocal);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "정상": return "text-green-600 bg-green-100";
      case "경고": return "text-yellow-600 bg-yellow-100";
      case "오류": return "text-red-600 bg-red-100";
      case "점검중": return "text-blue-600 bg-blue-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "높음": return "text-red-600 bg-red-100";
      case "보통": return "text-yellow-600 bg-yellow-100";
      case "낮음": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getRequestStatusColor = (status: string) => {
    switch (status) {
      case "접수": return "text-blue-600 bg-blue-100";
      case "배정중": return "text-yellow-600 bg-yellow-100";
      case "진행중": return "text-orange-600 bg-orange-100";
      case "완료": return "text-green-600 bg-green-100";
      case "취소": return "text-gray-600 bg-gray-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  // 서비스 신청 폼 제출 처리
  const handleSubmitServiceRequest = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 현재 시간으로 신청 일시 설정
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const y = now.getFullYear();
    const m = pad(now.getMonth() + 1);
    const d = pad(now.getDate());
    const hh = pad(now.getHours());
    const mm = pad(now.getMinutes());
    const dtLocal = `${y}-${m}-${d}T${hh}:${mm}`;
    
         // 서비스 요청 데이터 생성
     const newRequest = {
       id: managementId || `SR-${y}${m}${d}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
       title: requestTitle,
       content: requestContent,
       requester: "일반사용자",
       requesterEmail: "user@itsm.com",
       requestDate: dtLocal,
       requestType: requestType,
       requestStatus: requestStatus,
       requestContact: "010-1234-5678", // DB에서 읽어올 정보
       requestDept: "IT운영팀", // DB에서 읽어올 정보
       requestLocation: requestLocation,
       isProxyRequest: isProxyRequest,
       actualRequester: actualRequester,
       actualContact: actualContact,
       actualDept: actualDept,
       priority: "보통",
       status: "배정 대기",
       createdAt: now.toISOString()
     };
    
    // 성공 메시지 표시
    alert(`서비스 요청이 성공적으로 접수되었습니다!\n\n요청번호: ${newRequest.id}\n제목: ${newRequest.title}\n\n배정담당자가 검토 후 조치담당자를 배정할 예정입니다.`);
    
         // 폼 초기화
     setRequestTitle("");
     setRequestContent("");
     setRequestType("요청");
     setRequestStatus("정상작동");
     setRequestLocation("");
     setIsProxyRequest(false);
     setActualRequester("");
     setActualContact("");
     setActualDept("");
     setManagementId("");
    
    // 대시보드 탭으로 이동
    setActiveTab("dashboard");
  };

  const handleQuickResponse = (response: QuickResponse) => {
    setSelectedQuickResponse(response);
    setShowQuickResponseModal(true);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--figma-background)' }}>
      {/* 헤더 */}
      <header className="shadow-sm" style={{ 
        background: 'var(--figma-surface)',
        borderBottom: '1px solid var(--figma-border)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--figma-primary)' }}>
                <img src="/icons/user.svg" alt="사용자" className="w-6 h-6" style={{ color: 'var(--figma-text-inverse)' }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{
                  color: 'var(--figma-text-primary)',
                  fontFamily: 'var(--figma-font-family)'
                }}>
                  일반사용자 대시보드
                </h1>
                <p className="text-sm" style={{ color: 'var(--figma-text-secondary)' }}>
                  빠른 응답과 실시간 모니터링
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm" style={{ color: 'var(--figma-text-secondary)' }}>실시간 업데이트</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" style={{
                    background: autoRefresh ? 'var(--figma-primary)' : 'var(--figma-border)'
                  }}></div>
                </label>
              </div>
              <FigmaButton variant="secondary" size="sm" className="text-sm mr-2">
                새로고침
              </FigmaButton>
              <FigmaButton 
                variant="danger" 
                size="sm"
                className="text-sm"
                onClick={() => window.location.href = "/"}
              >
                로그아웃
              </FigmaButton>
            </div>
          </div>
        </div>
      </header>

      {/* 네비게이션 */}
      <nav style={{ 
        background: 'var(--figma-surface)',
        borderBottom: '1px solid var(--figma-border)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
                         {[
               { id: "dashboard", name: "대시보드", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" },
               { id: "service-request", name: "서비스 신청", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
               { id: "quick-response", name: "빠른 응답", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
               { id: "monitoring", name: "실시간 모니터링", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
               { id: "my-requests", name: "내 요청사항", icon: "M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
               { id: "customization", name: "사용자 맞춤", icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2" }
             ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200"
                style={{
                  borderBottomColor: activeTab === tab.id ? 'var(--figma-primary)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--figma-primary)' : 'var(--figma-text-secondary)',
                  fontFamily: 'var(--figma-font-family)'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.color = 'var(--figma-text-primary)';
                    e.currentTarget.style.borderBottomColor = 'var(--figma-border)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.color = 'var(--figma-text-secondary)';
                    e.currentTarget.style.borderBottomColor = 'transparent';
                  }
                }}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  <span>{tab.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <FigmaCard variant="elevated" padding="lg" className="text-white" style={{ background: 'var(--figma-primary)' }}>
                <div className="flex items-center">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
                    <img src="/icons/check-circle.svg" alt="완료" className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm opacity-90" style={{ fontFamily: 'var(--figma-font-family)' }}>정상 서비스</p>
                    <p className="text-2xl font-bold" style={{ fontFamily: 'var(--figma-font-family)' }}>{serviceStatuses.filter(s => s.status === "정상").length}</p>
                  </div>
                </div>
              </FigmaCard>

              <FigmaCard variant="elevated" padding="lg" className="text-white" style={{ background: 'var(--figma-warning)' }}>
                <div className="flex items-center">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
                    <img src="/icons/help-circle.svg" alt="경고" className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm opacity-90" style={{ fontFamily: 'var(--figma-font-family)' }}>경고/오류</p>
                    <p className="text-2xl font-bold" style={{ fontFamily: 'var(--figma-font-family)' }}>{serviceStatuses.filter(s => s.status === "경고" || s.status === "오류").length}</p>
                  </div>
                </div>
              </FigmaCard>

              <FigmaCard variant="elevated" padding="lg" className="text-white" style={{ background: 'var(--figma-success)' }}>
                <div className="flex items-center">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
                    <img src="/icons/document.svg" alt="문서" className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm opacity-90" style={{ fontFamily: 'var(--figma-font-family)' }}>내 요청사항</p>
                    <p className="text-2xl font-bold" style={{ fontFamily: 'var(--figma-font-family)' }}>{userRequests.length}</p>
                  </div>
                </div>
              </FigmaCard>

              <FigmaCard variant="elevated" padding="lg" className="text-white" style={{ background: 'var(--figma-secondary)' }}>
                <div className="flex items-center">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
                    <img src="/icons/refresh.svg" alt="새로고침" className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm opacity-90" style={{ fontFamily: 'var(--figma-font-family)' }}>빠른 응답</p>
                    <p className="text-2xl font-bold" style={{ fontFamily: 'var(--figma-font-family)' }}>{quickResponses.length}</p>
                  </div>
                </div>
              </FigmaCard>
            </div>

            {/* 서비스 상태 요약 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FigmaCard variant="elevated" padding="lg">
                <h3 className="text-lg font-semibold mb-4" style={{
                  color: 'var(--figma-text-primary)',
                  fontFamily: 'var(--figma-font-family)'
                }}>
                  서비스 상태 요약
                </h3>
                <div className="space-y-3">
                  {serviceStatuses.slice(0, 4).map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--figma-surface)' }}>
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-1 rounded-full text-xs font-medium" style={{
                          color: service.status === '정상' ? 'var(--figma-success)' : 
                                 service.status === '경고' ? 'var(--figma-warning)' : 
                                 service.status === '오류' ? 'var(--figma-error)' : 'var(--figma-primary)',
                          background: service.status === '정상' ? 'var(--figma-success-light)' : 
                                     service.status === '경고' ? 'var(--figma-warning-light)' : 
                                     service.status === '오류' ? 'var(--figma-error-light)' : 'var(--figma-primary-light)'
                        }}>
                          {service.status}
                        </span>
                        <span className="font-medium" style={{ 
                          color: 'var(--figma-text-primary)',
                          fontFamily: 'var(--figma-font-family)'
                        }}>
                          {service.name}
                        </span>
                      </div>
                      <div className="text-sm" style={{ color: 'var(--figma-text-secondary)' }}>
                        응답시간: {service.responseTime}
                      </div>
                    </div>
                  ))}
                </div>
              </FigmaCard>

              <FigmaCard variant="elevated" padding="lg">
                <h3 className="text-lg font-semibold mb-4" style={{
                  color: 'var(--figma-text-primary)',
                  fontFamily: 'var(--figma-font-family)'
                }}>
                  최근 요청사항
                </h3>
                <div className="space-y-3">
                  {userRequests.slice(0, 3).map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--figma-surface)' }}>
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-1 rounded-full text-xs font-medium" style={{
                          color: request.status === '완료' ? 'var(--figma-success)' : 
                                 request.status === '진행중' ? 'var(--figma-warning)' : 
                                 request.status === '취소' ? 'var(--figma-error)' : 'var(--figma-primary)',
                          background: request.status === '완료' ? 'var(--figma-success-light)' : 
                                     request.status === '진행중' ? 'var(--figma-warning-light)' : 
                                     request.status === '취소' ? 'var(--figma-error-light)' : 'var(--figma-primary-light)'
                        }}>
                          {request.status}
                        </span>
                        <div>
                          <p className="font-medium text-sm" style={{ 
                            color: 'var(--figma-text-primary)',
                            fontFamily: 'var(--figma-font-family)'
                          }}>
                            {request.title}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--figma-text-secondary)' }}>{request.id}</p>
                        </div>
                      </div>
                      <div className="text-sm" style={{ color: 'var(--figma-text-secondary)' }}>
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </FigmaCard>
            </div>
          </div>
        )}

        {activeTab === "quick-response" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">빠른 응답 서비스</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                자주 발생하는 IT 문제에 대한 빠른 해결책을 제공합니다. 
                문제 유형을 선택하면 즉시 대응 방안을 확인할 수 있습니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickResponses.map((response) => (
                <Card 
                  key={response.id} 
                  className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105"
                  onClick={() => handleQuickResponse(response)}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-4">{response.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{response.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{response.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {response.category}
                      </span>
                      <span className="text-gray-500">예상 소요시간: {response.estimatedTime}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "service-request" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">서비스 신청</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                IT 서비스 관련 요청, 장애 신고, 변경 요청 등을 제출할 수 있습니다.
              </p>
            </div>

                         <Card className="p-6">
               <form onSubmit={handleSubmitServiceRequest} className="space-y-6">
                 
                 {/* 첫번째행: 신청일자/시간, 현재상태, 관리번호, 위치 */}
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">신청 일자/시간</label>
                     <input type="datetime-local" value={requestDateTime} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700" readOnly />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">현재 상태</label>
                     <select value={requestStatus} onChange={(e) => setRequestStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                       <option>정상작동</option>
                       <option>오류발생</option>
                       <option>메시지창</option>
                       <option>부분불능</option>
                       <option>전체불능</option>
                       <option>점검요청</option>
                       <option>기타상태</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">관리번호</label>
                     <input type="text" value={managementId} onChange={(e) => setManagementId(e.target.value)} placeholder="예: SR-20250101-123456" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">위치</label>
                     <input type="text" value={requestLocation} onChange={(e) => setRequestLocation(e.target.value)} placeholder="예: 본사 3층 NOC" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                   </div>
                 </div>

                 {/* 두번째행: 신청자, 연락처, 소속, 대리체크 */}
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">신청자</label>
                     <input type="text" value="일반사용자" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700" readOnly />
                   </div>
                                       <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">연락처</label>
                      <input type="text" value="010-1234-5678" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700" readOnly />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">소속</label>
                      <input type="text" value="IT운영팀" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700" readOnly />
                    </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">대리신청</label>
                     <div className="flex items-center h-10">
                       <label className="flex items-center">
                         <input 
                           type="checkbox" 
                           checked={isProxyRequest} 
                           onChange={(e) => setIsProxyRequest(e.target.checked)}
                           className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                         />
                         <span className="text-sm font-medium text-gray-700">대리신청 여부</span>
                       </label>
                     </div>
                   </div>
                 </div>

                 {/* 세번째행: 실제신청자, 실제연락처, 실제소속 (대리신청 체크 시에만 표시) */}
                 {isProxyRequest && (
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">실제 신청자</label>
                       <input
                         type="text"
                         value={actualRequester}
                         onChange={(e) => setActualRequester(e.target.value)}
                         placeholder="실제 신청자의 이름을 입력하세요"
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                         required={isProxyRequest}
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">실제 연락처</label>
                       <input 
                         type="tel" 
                         value={actualContact} 
                         onChange={(e) => setActualContact(e.target.value)} 
                         placeholder="예: 010-1234-5678" 
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                         required={isProxyRequest} 
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">실제 소속</label>
                       <input 
                         type="text" 
                         value={actualDept} 
                         onChange={(e) => setActualDept(e.target.value)} 
                         placeholder="예: 운영팀/영업1팀" 
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                         required={isProxyRequest} 
                       />
                     </div>
                     <div></div> {/* 빈 칸으로 4열 유지 */}
                   </div>
                 )}

                 {/* 네번째행: 요청제목 */}
                 <div className="grid grid-cols-1 gap-6">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">요청 제목</label>
                     <input type="text" value={requestTitle} onChange={(e) => setRequestTitle(e.target.value)} placeholder="예: 이메일 서비스 장애 신고" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                   </div>
                 </div>

                 {/* 다섯번째행: 요청 내용 */}
                 <div className="grid grid-cols-1 gap-6">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">요청 내용</label>
                     <textarea value={requestContent} onChange={(e) => setRequestContent(e.target.value)} rows={8} placeholder="증상, 발생 시각, 영향 범위 등을 자세히 작성해주세요." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                   </div>
                 </div>
                 
                 {/* 제출 버튼 */}
                 <div className="flex justify-end">
                   <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-medium">신청 접수</Button>
                 </div>
               </form>
             </Card>
          </div>
        )}

        {activeTab === "monitoring" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">실시간 모니터링</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                모든 IT 서비스의 실시간 상태를 모니터링합니다. 
                서비스 상태, 응답시간, 가동률을 실시간으로 확인할 수 있습니다.
              </p>
            </div>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">서비스 상태 모니터링</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">실시간 업데이트 중</span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">서비스명</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가동률</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">응답시간</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">우선순위</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">마지막 업데이트</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {serviceStatuses.map((service) => (
                      <tr key={service.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {service.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(service.status)}`}>
                            {service.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {service.uptime}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {service.responseTime}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(service.priority)}`}>
                            {service.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {service.lastUpdate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* 실시간 차트 영역 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">서비스 응답시간 트렌드</h3>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">실시간 차트가 여기에 표시됩니다</p>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">서비스 가동률 현황</h3>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">가동률 차트가 여기에 표시됩니다</p>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "my-requests" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">내 요청사항</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                제출한 서비스 요청의 진행 상황을 확인하고 관리할 수 있습니다.
              </p>
            </div>

            <Card className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">요청번호</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">우선순위</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">담당자</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">예상 완료</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {request.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRequestStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(request.priority)}`}>
                            {request.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.assignedTo || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {request.estimatedCompletion ? new Date(request.estimatedCompletion).toLocaleString() : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button variant="outline" size="sm" className="mr-2">
                            상세보기
                          </Button>
                          {request.status === "진행중" && (
                            <Button variant="outline" size="sm">
                              문의하기
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "customization" && (
          <UserCustomization />
        )}
      </main>

      {/* 빠른 응답 모달 */}
      {showQuickResponseModal && selectedQuickResponse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">빠른 응답</h3>
              <button
                onClick={() => setShowQuickResponseModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <img src="/icons/close.svg" alt="닫기" className="w-6 h-6" />
              </button>
            </div>
            
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">{selectedQuickResponse.icon}</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">{selectedQuickResponse.title}</h4>
              <p className="text-gray-600 mb-4">{selectedQuickResponse.description}</p>
              <div className="flex items-center justify-center space-x-4 text-sm">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {selectedQuickResponse.category}
                </span>
                <span className="text-gray-500">예상 소요시간: {selectedQuickResponse.estimatedTime}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-semibold text-blue-900 mb-2">즉시 해결 방법:</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 브라우저 캐시 및 쿠키 삭제</li>
                  <li>• 다른 브라우저로 시도</li>
                  <li>• 네트워크 연결 상태 확인</li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h5 className="font-semibold text-yellow-900 mb-2">문제가 지속될 경우:</h5>
                <p className="text-sm text-yellow-800">
                  위 방법으로 해결되지 않으면 IT 지원팀에 문의하세요.
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button 
                className="flex-1"
                onClick={() => {
                  // 서비스 요청 페이지로 이동
                  window.location.href = "/";
                }}
              >
                서비스 요청하기
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowQuickResponseModal(false)}
              >
                닫기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
