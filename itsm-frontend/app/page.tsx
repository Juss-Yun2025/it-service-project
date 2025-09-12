"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { getPermissionLevelName, getRolePermissionLevel } from '@/lib/auth'

type User = {
  email: string;
  password: string;
  name: string;
  role: "system_admin" | "service_manager" | "technician" | "assignment_manager" | "user" | string;
};

type Service = {
  id: number;
  name: string;
  status: string;
  uptime: string;
  lastIncident: string;
};

// 샘플 사용자 데이터
const users: User[] = [
  { email: "system@itsm.com", password: "system123", name: "시스템관리", role: "system_admin" },
  { email: "service@itsm.com", password: "service123", name: "서비스관리", role: "service_manager" },
  { email: "tech@itsm.com", password: "tech123", name: "기술자", role: "technician" },
  { email: "assign@itsm.com", password: "assign123", name: "기술자", role: "assignment_manager" },
  { email: "user@itsm.com", password: "user123", name: "일반사용자", role: "user" }
]

// 더미 서비스 데이터
const dummyServices: Service[] = [
  { id: 1, name: "이메일 서비스", status: "정상", uptime: "99.9%", lastIncident: "2024-01-15" },
  { id: 2, name: "파일 서버", status: "경고", uptime: "98.5%", lastIncident: "2024-01-20" },
  { id: 3, name: "데이터베이스", status: "정상", uptime: "99.8%", lastIncident: "2024-01-10" },
  { id: 4, name: "웹 애플리케이션", status: "오류", uptime: "95.2%", lastIncident: "2024-01-22" },
  { id: 5, name: "백업 시스템", status: "정상", uptime: "99.9%", lastIncident: "2024-01-18" }
];

export default function Home() {
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [showServiceRequest, setShowServiceRequest] = useState<boolean>(false);
  const [postLoginAction, setPostLoginAction] = useState<"openServiceRequest" | "quickResponse" | "monitoring" | "customization" | null>(null);

  // 서비스 신청 폼 상태
  // 신청 일시 및 관리번호(자동 생성)
  const [requestDateTime, setRequestDateTime] = useState<string>("");
  const [managementId, setManagementId] = useState<string>("");
  const [requestStatus, setRequestStatus] = useState<string>("정상");
  const [requestTitle, setRequestTitle] = useState<string>("");
  const [requestContent, setRequestContent] = useState<string>("");
  const [requestType, setRequestType] = useState<string>("요청");
  const [requestContact, setRequestContact] = useState<string>("");
  const [requestDept, setRequestDept] = useState<string>("");
  const [requestLocation, setRequestLocation] = useState<string>("");
  const [isProxyRequest, setIsProxyRequest] = useState<boolean>(false);
  const [actualRequester, setActualRequester] = useState<string>("");
  const [actualContact, setActualContact] = useState<string>("");
  const [actualDept, setActualDept] = useState<string>("");
  const [requestPriority, setRequestPriority] = useState<string>("보통");

  // 서비스 신청 데이터 저장소 (전역 상태로 관리)
  const [serviceRequests, setServiceRequests] = useState<any[]>([
    // 샘플 데이터 추가
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
  ]);

  // 신청 일시 생성
  const prepareNewRequest = () => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const y = now.getFullYear();
    const m = pad(now.getMonth() + 1);
    const d = pad(now.getDate());
    const hh = pad(now.getHours());
    const mm = pad(now.getMinutes());
    const ss = pad(now.getSeconds());
    // datetime-local 형식 값
    const dtLocal = `${y}-${m}-${d}T${hh}:${mm}`;
    setRequestDateTime(dtLocal);
    // 기본값 초기화
    setRequestStatus("정상");
  };

  // 로그인 모달 열기 함수
  const openLoginModal = () => {
    setShowLoginModal(true);
    setLoginError("");
    setEmail("");
    setPassword("");
  };

  // 로그인 모달 닫기 함수
  const closeLoginModal = () => {
    console.log("로그인 모달 닫기 시도");
    setShowLoginModal(false);
    setLoginError("");
    setEmail("");
    setPassword("");
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError("");
    
    console.log("로그인 시도:", { email, password });
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      console.log("로그인 성공:", user);
      setIsLoggedIn(true);
      setCurrentUser(user);
      closeLoginModal();
      if (postLoginAction === "openServiceRequest") {
        prepareNewRequest();
        setShowServiceRequest(true);
        setPostLoginAction(null);
      } else if (postLoginAction === "faq") {
        window.location.href = "/faq";
        setPostLoginAction(null);
      } else if (postLoginAction === "progress") {
        window.location.href = "/progress";
        setPostLoginAction(null);
      } else if (postLoginAction === "serviceRequest") {
        prepareNewRequest();
        setShowServiceRequest(true);
        setPostLoginAction(null);
      } else if (postLoginAction === "inquiry") {
        window.location.href = "/inquiry";
        setPostLoginAction(null);
      } else if (postLoginAction === "quickResponse") {
        window.location.href = "/user-dashboard?tab=quick-response";
        setPostLoginAction(null);
      } else if (postLoginAction === "monitoring") {
        window.location.href = "/user-dashboard?tab=monitoring";
        setPostLoginAction(null);
      } else if (postLoginAction === "customization") {
        window.location.href = "/user-dashboard?tab=customization";
        setPostLoginAction(null);
      }
    } else {
      console.log("로그인 실패: 잘못된 자격증명");
      setLoginError("이메일 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  const handleOpenServiceRequest = () => {
    if (isLoggedIn) {
      prepareNewRequest();
      setShowServiceRequest(true);
    } else {
      setPostLoginAction("openServiceRequest");
      openLoginModal();
    }
  };

  const handleQuickResponseClick = () => {
    if (!isLoggedIn) {
      setPostLoginAction("quickResponse");
      setShowLoginModal(true);
    } else {
      // 로그인된 경우 일반사용자 대시보드로 이동하여 빠른 응답 탭으로 이동
      window.location.href = "/user-dashboard?tab=quick-response";
    }
  };

  const handleMonitoringClick = () => {
    if (!isLoggedIn) {
      setPostLoginAction("monitoring");
      setShowLoginModal(true);
    } else {
      // 로그인된 경우 일반사용자 대시보드로 이동하여 실시간 모니터링 탭으로 이동
      window.location.href = "/user-dashboard?tab=monitoring";
    }
  };

  const handleCustomizationClick = () => {
    if (!isLoggedIn) {
      setPostLoginAction("customization");
      setShowLoginModal(true);
    } else {
      // 로그인된 경우 일반사용자 대시보드로 이동하여 사용자 맞춤 탭으로 이동
      window.location.href = "/user-dashboard?tab=customization";
    }
  };

  const handleSubmitServiceRequest = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
          const newServiceRequest = {
        id: managementId,
        title: requestTitle,
        content: requestContent,
        requester: currentUser?.name || "",
        requesterEmail: currentUser?.email || "",
        requestDate: requestDateTime,
        requestType: "요청", // 기본값으로 설정
        requestStatus: requestStatus,
        requestContact: requestContact,
        requestDept: requestDept,
        requestLocation: requestLocation,
        isProxyRequest,
        actualRequester: isProxyRequest ? actualRequester : "",
        actualContact: isProxyRequest ? actualContact : "",
        actualDept: isProxyRequest ? actualDept : "",
        priority: "보통", // 기본값으로 설정
        status: "배정 대기",
        createdAt: new Date().toISOString()
      };
    
    console.log("서비스 신청 접수", newServiceRequest);
    
    // 서비스 신청 데이터를 저장소에 추가
    setServiceRequests(prev => [...prev, newServiceRequest]);
    
    alert("서비스 신청이 접수되었습니다.");
    setShowServiceRequest(false);
    
    // 폼 초기화
    setManagementId("");
    setRequestDateTime("");
    setRequestStatus("정상");
    setRequestTitle("");
    setRequestContent("");
    setRequestContact("");
    setRequestDept("");
    setRequestLocation("");
    setIsProxyRequest(false);
    setActualRequester("");
    setActualContact("");
    setActualDept("");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setActiveTab("dashboard");
    setShowServiceRequest(false);
    setShowLoginModal(false);
    setRequestTitle("");
    setRequestContent("");
    setRequestLocation("");
    setRequestContact("");
    setRequestDept("");
    setRequestStatus("정상작동");
    setManagementId("");
    setIsProxyRequest(false);
    setActualRequester("");
  };

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showLoginModal) {
        closeLoginModal();
      }
    };

    if (showLoginModal) {
      document.addEventListener('keydown', handleEscape);
      // 모달이 열려있을 때 body 스크롤 방지
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showLoginModal]);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "정상": return "text-green-600 bg-green-100";
      case "경고": return "text-yellow-600 bg-yellow-100";
      case "오류": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  // 기술자 전용 화면 (조치담당자)
  if (isLoggedIn && currentUser?.role === "technician") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <header className="relative z-10 bg-white/90 backdrop-blur-sm shadow-lg border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">IT 서비스 관리 - 기술자</h1>
                  <p className="text-sm text-gray-600">권한: {getPermissionLevelName(getRolePermissionLevel(currentUser.role))}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {currentUser && (
                  <span className="text-sm text-gray-600">
                    {currentUser.name} (기술자)
                  </span>
                )}
                <Button 
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2"
                >
                  로그아웃
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* 메인 */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* 기술자 화면 */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">작업 진행</h3>
              <p className="text-gray-600 text-center mb-4">
                배정된 서비스 요청에 대한 실제 작업 진행 및 상황 기록
              </p>
              <a
                href={`/technician-work?requestId=SR-2024-001&role=${currentUser.role}`}
                className="block w-full bg-orange-600 hover:bg-orange-700 text-white text-center py-3 px-4 rounded-lg font-medium transition-colors"
              >
                작업 화면으로 이동
              </a>
            </div>

            {/* 작업 현황 */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">작업 현황</h3>
              <p className="text-gray-600 text-center mb-4">
                현재 진행 중인 작업과 완료된 작업 현황을 확인
              </p>
              <button className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-3 px-4 rounded-lg font-medium transition-colors">
                작업 현황 보기
              </button>
            </div>

            {/* 기술 지원 */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">기술 지원</h3>
              <p className="text-gray-600 text-center mb-4">
                기술적 문제 해결을 위한 도구와 리소스
              </p>
              <button className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center py-3 px-4 rounded-lg font-medium transition-colors">
                기술 지원 도구
              </button>
            </div>
          </div>

          {/* 서비스 요청 목록 */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">배정된 서비스 요청</h3>
            
            {serviceRequests.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <p className="text-gray-500">배정된 서비스 요청이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {serviceRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{request.title}</h4>
                        <p className="text-sm text-gray-600">{request.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          요청자: {request.requester} | 상태: {request.status}
                        </p>
                      </div>
                      <a
                        href={`/technician-work?requestId=${request.id}&role=${currentUser.role}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      >
                        작업 시작
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    )
  }

  // 일반 사용자 전용 화면 - 새로운 대시보드로 리다이렉트
  if (isLoggedIn && currentUser?.role === "user") {
    // 새로운 사용자 대시보드로 리다이렉트
    window.location.href = "/user-dashboard";
    return null;
  }

  // 시스템관리 전용 화면
  if (isLoggedIn && currentUser?.role === "system_admin") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <header className="relative z-10 bg-white/90 backdrop-blur-sm shadow-lg border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">IT 서비스 관리 - 시스템관리</h1>
                  <p className="text-sm text-gray-600">권한: {getPermissionLevelName(getRolePermissionLevel(currentUser.role))}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {currentUser && (
                  <span className="text-sm text-gray-600">
                    {currentUser.name} (시스템관리)
                  </span>
                )}
                <Button 
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2"
                >
                  로그아웃
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* 메인 */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* 사용자 관리 */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">사용자 관리</h3>
              <p className="text-gray-600 text-center mb-4">
                모든 사용자 및 기술자 회원정보를 관리합니다
              </p>
              <a
                href="/system-admin"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-4 rounded-lg font-medium transition-colors"
              >
                사용자 관리
              </a>
            </div>

            {/* 시스템 설정 */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">시스템 설정</h3>
              <p className="text-gray-600 text-center mb-4">
                시스템 전반의 설정 및 권한을 관리합니다
              </p>
              <button className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-3 px-4 rounded-lg font-medium transition-colors">
                시스템 설정
              </button>
            </div>

            {/* 감사 로그 */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">감사 로그</h3>
              <p className="text-gray-600 text-center mb-4">
                시스템 사용 내역 및 보안 로그를 확인합니다
              </p>
              <button className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center py-3 px-4 rounded-lg font-medium transition-colors">
                감사 로그
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 서비스관리 전용 화면
  if (isLoggedIn && currentUser?.role === "service_manager") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <header className="relative z-10 bg-white/90 backdrop-blur-sm shadow-lg border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">IT 서비스 관리 - 서비스관리</h1>
                  <p className="text-sm text-gray-600">권한: {getPermissionLevelName(getRolePermissionLevel(currentUser.role))}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {currentUser && (
                  <span className="text-sm text-gray-600">
                    {currentUser.name} (서비스관리)
                  </span>
                )}
                <Button 
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2"
                >
                  로그아웃
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* 메인 */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* 서비스 품질 관리 */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">서비스 품질 관리</h3>
              <p className="text-gray-600 text-center mb-4">
                서비스 품질 및 SLA 관리를 담당합니다
              </p>
              <a
                href="/service-manager"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-4 rounded-lg font-medium transition-colors"
              >
                서비스 관리
              </a>
            </div>

            {/* 워크플로우 관리 */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">워크플로우 관리</h3>
              <p className="text-gray-600 text-center mb-4">
                서비스 프로세스 및 워크플로우를 설정합니다
              </p>
              <button className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-3 px-4 rounded-lg font-medium transition-colors">
                워크플로우 관리
              </button>
            </div>

            {/* 성과 분석 */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">성과 분석</h3>
              <p className="text-gray-600 text-center mb-4">
                서비스 성과 및 KPI를 분석합니다
              </p>
              <button className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center py-3 px-4 rounded-lg font-medium transition-colors">
                성과 분석
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 관리자/기술자 등 관계자 화면
  if (isLoggedIn) {
    return (
      <div className="min-h-screen dashboard-background">
        {/* 헤더 */}
        <header className="relative z-10 bg-white/90 backdrop-blur-sm shadow-lg border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">IT 서비스 관리</h1>
                  <p className="text-sm text-gray-600">권한: {currentUser ? getPermissionLevelName(getRolePermissionLevel(currentUser.role)) : '알 수 없음'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {currentUser && (
                  <span className="text-sm text-gray-600">
                    {currentUser.name} ({currentUser.role})
                  </span>
                )}
                <Button 
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2"
                >
                  로그아웃
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* 네비게이션 탭 */}
        <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex space-x-8">
              {[
                { id: "dashboard", name: "대시보드", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" },
                { id: "services", name: "서비스 관리", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
                { id: "incidents", name: "사고 관리", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" },
                { id: "reports", name: "보고서", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
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
        <main className="max-w-7xl mx-auto px-6 py-8">
          {showServiceRequest && (
            <div className="mb-8 service-request-form rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">서비스 신청</h3>
                <button onClick={() => setShowServiceRequest(false)} className="text-gray-500 hover:text-gray-700 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmitServiceRequest} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* 첫 번째 행: 4열 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">관리번호</label>
                    <input type="text" value={managementId} onChange={(e) => setManagementId(e.target.value)} placeholder="예: SR-20250101-123456" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">신청 일자/시간</label>
                    <input type="datetime-local" value={requestDateTime} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700" readOnly />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">요청 유형</label>
                    <select value={requestType} disabled className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 cursor-not-allowed">
                      <option>요청</option>
                      <option>장애</option>
                      <option>변경</option>
                      <option>문제</option>
                      <option>적용</option>
                      <option>구성</option>
                      <option>자산</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">현재 상태</label>
                    <select value={requestStatus} onChange={(e) => setRequestStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>정상</option>
                      <option>경고</option>
                      <option>오류</option>
                    </select>
                  </div>
                </div>

                {/* 두 번째 행: 4열 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">신청자</label>
                    <input type="text" value={currentUser?.name || ""} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700" readOnly />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">연락처</label>
                    <input type="text" value={requestContact} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700" readOnly />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">소속</label>
                    <input type="text" value={requestDept} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700" readOnly />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">위치</label>
                    <input type="text" value={requestLocation} onChange={(e) => setRequestLocation(e.target.value)} placeholder="예: 본사 3층 NOC" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                </div>

                {/* 세 번째 행: 대리신청 체크박스 */}
                <div className="flex items-center">
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

                {/* 네 번째 행: 대리신청 정보 (조건부) */}
                {isProxyRequest && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">실제 신청자</label>
                      <input
                        type="text"
                        value={actualRequester}
                        onChange={(e) => setActualRequester(e.target.value)}
                        placeholder="실제 신청자의 이름을 입력하세요"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        required={isProxyRequest} 
                      />
                    </div>
                  </div>
                )}

                {/* 다섯 번째 행: 요청 제목 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">요청 제목</label>
                  <input type="text" value={requestTitle} onChange={(e) => setRequestTitle(e.target.value)} placeholder="예: 이메일 서비스 장애 신고" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                </div>

                {/* 여섯 번째 행: 요청 내용 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">요청 내용</label>
                  <textarea value={requestContent} onChange={(e) => setRequestContent(e.target.value)} rows={6} placeholder="증상, 발생 시각, 영향 범위 등을 자세히 작성해주세요." className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                </div>

                {/* 제출 버튼 */}
                <div className="flex justify-end">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium">
                    신청 접수
                  </Button>
                </div>
              </form>
            </div>
          )}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white drop-shadow-lg">대시보드</h2>
              
              {/* 통계 카드 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">전체 서비스</p>
                      <p className="text-2xl font-bold text-gray-900">{dummyServices.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">정상 서비스</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {dummyServices.filter(s => s.status === "정상").length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">경고</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {dummyServices.filter(s => s.status === "경고").length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">오류</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {dummyServices.filter(s => s.status === "오류").length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 서비스 상태 요약 */}
              <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-white/20">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">서비스 상태 요약</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {dummyServices.map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50/80 rounded-lg hover:bg-gray-100/80 transition-colors duration-200">
                        <div className="flex items-center space-x-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(service.status)}`}>
                            {service.status}
                          </span>
                          <span className="font-medium text-gray-900">{service.name}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          가동률: {service.uptime}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "services" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-white drop-shadow-lg">서비스 관리</h2>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                  새 서비스 추가
                </Button>
              </div>
              
              <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-white/20">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">서비스 목록</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50/80">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">서비스명</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가동률</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">마지막 사고</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/60 divide-y divide-gray-200">
                      {dummyServices.map((service) => (
                        <tr key={service.id} className="hover:bg-gray-50/80 transition-colors duration-200">
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {service.lastIncident}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button className="text-blue-600 hover:text-blue-900 mr-2">편집</Button>
                            <Button className="text-red-600 hover:text-red-900">삭제</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "incidents" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white drop-shadow-lg">사고 관리</h2>
              <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 p-6">
                <p className="text-gray-600">사고 관리 기능이 여기에 표시됩니다.</p>
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white drop-shadow-lg">보고서</h2>
              <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 p-6">
                <p className="text-gray-600">보고서 기능이 여기에 표시됩니다.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // 기술자 전용 화면 (배정담당자)
  if (isLoggedIn && currentUser?.role === "assignment_manager") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <header className="relative z-10 bg-white/90 backdrop-blur-sm shadow-lg border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">IT 서비스 관리 - 기술자</h1>
                  <p className="text-sm text-gray-600">권한: {getPermissionLevelName(getRolePermissionLevel(currentUser.role))}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {currentUser && (
                  <span className="text-sm text-gray-600">
                    {currentUser.name} (기술자)
                  </span>
                )}
                <Button 
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2"
                >
                  로그아웃
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* 메인 */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* 기술자 화면 */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">배정 관리</h3>
              <p className="text-gray-600 text-center mb-4">
                서비스 요청에 대한 요청 유형 선택, 배정 의견 작성, 조치 담당자 선택
              </p>
              <a
                href={`/technician-assignment?role=${currentUser.role}`}
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-4 rounded-lg font-medium transition-colors"
              >
                배정 화면으로 이동
              </a>
            </div>

            {/* 배정 현황 */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">배정 현황</h3>
              <p className="text-gray-600 text-center mb-4">
                현재 배정된 요청과 배정 대기 중인 요청 현황을 확인
              </p>
              <button className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-3 px-4 rounded-lg font-medium transition-colors">
                배정 현황 보기
              </button>
            </div>

            {/* 담당자 관리 */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">담당자 관리</h3>
              <p className="text-gray-600 text-center mb-4">
                조치 담당자들의 정보와 작업량을 관리
              </p>
              <button className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center py-3 px-4 rounded-lg font-medium transition-colors">
                담당자 관리
              </button>
            </div>
          </div>

          {/* 서비스 요청 목록 */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">배정 대기 중인 서비스 요청</h3>
            
            {serviceRequests.filter(req => req.status === "배정 대기").length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-2">현재 배정 대기 중인 서비스 요청이 없습니다</p>
                <p className="text-sm text-gray-400">일반 사용자가 서비스 신청을 하면 여기에 표시됩니다</p>
              </div>
            ) : (
              <div className="space-y-4">
                {serviceRequests.filter(req => req.status === "배정 대기").map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{request.title}</h4>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {request.id}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            request.priority === '높음' ? 'bg-red-100 text-red-800' :
                            request.priority === '보통' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {request.priority}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {request.requestType}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{request.content}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>요청자: {request.requester} ({request.requestDept})</span>
                          <span>위치: {request.requestLocation}</span>
                          <span>요청일: {new Date(request.requestDate).toLocaleDateString('ko-KR')}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <a
                          href={`/technician-assignment?requestId=${request.id}&role=${currentUser.role}`}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          배정하기
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen hero-background">
      {/* 헤더 */}
      <header className="relative z-10 bg-white/90 backdrop-blur-sm shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">IT 서비스 관리</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                className="bg-transparent hover:bg-gray-100 text-gray-900 border border-gray-300 px-6 py-2 transition-all duration-200"
                onClick={openLoginModal}
              >
                기술자 로그인
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="hero-content max-w-7xl mx-auto px-6 py-12">
        {/* 일반사용자용 4가지 메뉴 */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">IT 서비스 관리</h2>
          <p className="text-xl text-gray-600 mb-8">원하는 서비스를 선택하세요</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* 자주하는질문 */}
          <div 
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => setPostLoginAction('faq')}
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">자주하는 질문</h3>
            <p className="text-gray-600 text-center mb-4">
              자주 발생하는 문제와 해결방법을 확인하세요
            </p>
            <div className="text-center">
              <Button 
                onClick={() => setShowLoginModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              >
                바로가기
              </Button>
            </div>
          </div>

          {/* 요청진행사항 */}
          <div 
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => setPostLoginAction('progress')}
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">요청 진행사항</h3>
            <p className="text-gray-600 text-center mb-4">
              내가 신청한 서비스의 진행상황을 확인하세요
            </p>
            <div className="text-center">
              <Button 
                onClick={() => setShowLoginModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
              >
                바로가기
              </Button>
            </div>
          </div>

          {/* 서비스신청 */}
          <div 
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => setPostLoginAction('serviceRequest')}
          >
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">서비스 신청</h3>
            <p className="text-gray-600 text-center mb-4">
              새로운 IT 서비스를 신청하세요
            </p>
            <div className="text-center">
              <Button 
                onClick={() => setShowLoginModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
              >
                바로가기
              </Button>
            </div>
          </div>

          {/* 일반문의사항 */}
          <div 
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => setPostLoginAction('inquiry')}
          >
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">일반 문의사항</h3>
            <p className="text-gray-600 text-center mb-4">
              궁금한 사항을 문의하거나 답변을 확인하세요
            </p>
            <div className="text-center">
              <Button 
                onClick={() => setShowLoginModal(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2"
              >
                바로가기
              </Button>
            </div>
          </div>
        </div>

        {showServiceRequest && (
          <div className="mb-8 bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">서비스 신청</h3>
              <button onClick={() => setShowServiceRequest(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmitServiceRequest} className="space-y-6">
              
              {/* 1열: 기본 정보 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">신청 일자/시간</label>
                  <input type="datetime-local" value={requestDateTime} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">관리번호</label>
                  <input type="text" value={managementId} onChange={(e) => setManagementId(e.target.value)} placeholder="예: SR-20250101-123456" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">요청 유형</label>
                  <select value={requestType} onChange={(e) => setRequestType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>요청</option>
                    <option>장애</option>
                    <option>변경</option>
                    <option>문제</option>
                    <option>적용</option>
                    <option>구성</option>
                    <option>자산</option>
                  </select>
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
              </div>

              {/* 2열: 신청자 정보 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">신청자</label>
                  <input type="text" value={currentUser?.name || ""} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">연락처</label>
                  <input type="text" value={requestContact} onChange={(e) => setRequestContact(e.target.value)} placeholder="연락처를 입력하세요" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">소속</label>
                  <input type="text" value={requestDept} onChange={(e) => setRequestDept(e.target.value)} placeholder="소속을 입력하세요" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">위치</label>
                  <input type="text" value={requestLocation} onChange={(e) => setRequestLocation(e.target.value)} placeholder="예: 본사 3층 NOC" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>

              {/* 3열: 대리신청 정보 */}
              <div className="space-y-4">
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
                
                {isProxyRequest && (
                  <>
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
                  </>
                )}
              </div>

              {/* 4열: 요청 내용 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">요청 제목</label>
                  <input type="text" value={requestTitle} onChange={(e) => setRequestTitle(e.target.value)} placeholder="예: 이메일 서비스 장애 신고" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">요청 내용</label>
                  <textarea value={requestContent} onChange={(e) => setRequestContent(e.target.value)} rows={8} placeholder="증상, 발생 시각, 영향 범위 등을 자세히 작성해주세요." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                </div>
              </div>
              
              {/* 제출 버튼 - 전체 너비 */}
              <div className="md:col-span-4">
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium">신청 접수</Button>
              </div>
            </form>
          </div>
        )}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
            IT 서비스 관리 시스템에 오신 것을 환영합니다
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto drop-shadow-md">
            효율적인 IT 서비스 관리와 모니터링을 통해 비즈니스 연속성을 보장하고 
            사용자 경험을 향상시키는 통합 솔루션입니다.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <button 
              onClick={() => handleQuickResponseClick()}
              className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">빠른 응답</h3>
              <p className="text-gray-600">
                IT 이슈에 대한 신속한 대응과 해결로 업무 중단을 최소화합니다.
              </p>
            </button>

            <button 
              onClick={() => handleMonitoringClick()}
              className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">실시간 모니터링</h3>
              <p className="text-gray-600">
                24/7 시스템 상태 모니터링으로 잠재적 문제를 사전에 감지합니다.
              </p>
            </button>

            <button 
              onClick={() => handleCustomizationClick()}
              className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">사용자 맞춤</h3>
              <p className="text-gray-600">
                조직의 요구사항에 맞는 맞춤형 서비스와 대시보드를 제공합니다.
              </p>
            </button>
          </div>

          <div className="mt-16">
            <Button
              onClick={handleOpenServiceRequest}
              className="mx-auto block w-[520px] h-[140px] rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex flex-col items-center">
                <span className="text-2xl font-semibold">서비스 신청</span>
                <span className="mt-2 text-sm text-white/90">서비스 요청 시 신청을 눌러 주세요!</span>
              </div>
            </Button>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-800/80 backdrop-blur-sm text-white mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <p className="text-gray-300">
              © 2024 IT 서비스 관리 시스템. 모든 권리 보유.
            </p>
          </div>
        </div>
      </footer>

      {/* 로그인 모달 */}
      {showLoginModal && (
        <div className="itsm-modal-overlay">
          <div className="itsm-modal-content">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">로그인</h2>
              <button
                onClick={closeLoginModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {loginError && (
              <div className="itsm-status-error p-3 rounded-lg mb-4">
                {loginError}
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="itsm-input"
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="itsm-input"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-600">로그인 상태 유지</span>
                </label>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-500">
                  비밀번호 찾기
                </a>
              </div>
              
              <Button 
                type="submit" 
                className="itsm-button-primary w-full py-2"
              >
                로그인
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                계정이 없으신가요?{" "}
                <a 
                  href="/signup" 
                  className="text-blue-600 hover:text-blue-500 font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    closeLoginModal();
                    window.location.href = '/signup';
                  }}
                >
                  회원가입
                </a>
              </p>
            </div>

            {/* 더미 계정 정보 */}
            <div className="mt-6 p-4 bg-gray-50/80 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">테스트 계정:</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p>시스템관리: system@itsm.com / system123</p>
                <p>서비스관리: service@itsm.com / service123</p>
                <p>기술자: tech@itsm.com / tech123</p>
                <p>일반사용자: user@itsm.com / user123</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
