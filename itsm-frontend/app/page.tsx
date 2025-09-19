"use client";

import { Button } from "@/components/ui/button";
import { FigmaButton } from "@/components/figma/FigmaButton";
import { FigmaCard } from "@/components/figma/FigmaCard";
import { useState, useEffect } from "react";
import { getPermissionLevelName, getRolePermissionLevel } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import Icon from '@/components/ui/Icon'
import { 
  MessageSquare, 
  BarChart3, 
  FileText, 
  HelpCircle, 
  Coffee, 
  Cookie,
  Laptop,
  LogIn
} from 'lucide-react'

type User = {
  email: string;
  password: string;
  name: string;
  role: "system_admin" | "service_manager" | "technician" | "assignment_manager" | "user" | string;
};

// 샘플 사용자 데이터 (ITSM 개발 설명서 반영)
const users: User[] = [
  { email: "system@itsm.com", password: "system123", name: "시스템관리", role: "system_admin" },
  { email: "service@itsm.com", password: "service123", name: "서비스관리", role: "service_manager" },
  { email: "tech@itsm.com", password: "tech123", name: "조치담당자", role: "technician" },
  { email: "assign@itsm.com", password: "assign123", name: "배정담당자", role: "assignment_manager" },
  { email: "user@itsm.com", password: "user123", name: "일반사용자", role: "user" }
]

// 메인 페이지 메뉴 항목 정의
const mainMenuItems = [
  {
    id: 'faq',
    title: '자주하는 질문',
    description: '자주 묻는 질문과 답변을 확인하세요',
    icon: MessageSquare,
    path: '/faq',
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600'
  },
  {
    id: 'progress',
    title: '요청 진행사항',
    description: '서비스 요청의 진행 상황을 확인하세요',
    icon: BarChart3,
    path: '/progress',
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-600'
  },
  {
    id: 'service-request',
    title: '서비스 신청',
    description: '새로운 서비스를 신청하세요',
    icon: FileText,
    path: '/service-request',
    color: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-600'
  },
  {
    id: 'inquiry',
    title: '일반 문의사항',
    description: '기타 문의사항을 등록하고 확인하세요',
    icon: HelpCircle,
    path: '/inquiry',
    color: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600'
  }
]

export default function Home() {
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>("");
  const [isTechLogin, setIsTechLogin] = useState<boolean>(false);
  const [hoveredMenuItem, setHoveredMenuItem] = useState<string>("");
  const [screenWidth, setScreenWidth] = useState<number>(0);
  const [showSignupModal, setShowSignupModal] = useState<boolean>(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState<boolean>(false);
  
  // 회원가입 상태
  const [signupEmail, setSignupEmail] = useState<string>("");
  const [signupPassword, setSignupPassword] = useState<string>("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState<string>("");
  const [signupName, setSignupName] = useState<string>("");
  const [signupPosition, setSignupPosition] = useState<string>("");
  const [signupDepartment, setSignupDepartment] = useState<string>("");
  const [signupContact, setSignupContact] = useState<string>("");
  const [signupError, setSignupError] = useState<string>("");
  
  const router = useRouter();

  // 화면 너비 감지 및 동적 위치 계산
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    // 초기 화면 너비 설정
    handleResize();

    // 리사이즈 이벤트 리스너 등록
    window.addEventListener('resize', handleResize);

    // 클린업
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 기준점들
  const baseWidth1920 = 1920;
  const basePosition1920 = -896; // 1920px에서 -896p
  // 동적 위치 계산 함수 (1px당 0.5px 이동) - 부드러운 애니메이션을 위한 상태
  const [animatedPosition, setAnimatedPosition] = useState(basePosition1920);
  
  const calculateDynamicPositionPx = () => {
    if (screenWidth === 0) return basePosition1920;
    
    // 1px 변경당 0.5px 이동
    const widthDifference = baseWidth1920 - screenWidth;
    const positionAdjustment = widthDifference * 0.5;
    const position = basePosition1920 + positionAdjustment;
    
    return position;
  };

  const dynamicPositionPx = calculateDynamicPositionPx();

  // 부드러운 위치 애니메이션을 위한 useEffect
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPosition(dynamicPositionPx);
    }, 50); // 50ms 지연으로 부드러운 전환
    
    return () => clearTimeout(timer);
  }, [dynamicPositionPx]);

  // 로그인 처리
  const handleLogin = () => {
    setLoginError("");

    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      setShowLoginModal(false);
      setEmail("");
      setPassword("");
      
      // 사용자 역할을 localStorage에 저장
      localStorage.setItem('userRole', user.role);
      
      // 권한별 페이지 라우팅
      if (isTechLogin) {
        // 기술자/관리자 로그인
        switch (user.role) {
          case 'system_admin':
            router.push('/system-admin');
            break;
          case 'service_manager':
            router.push('/service-manager');
            break;
          case 'technician':
            router.push('/technician');
            break;
          case 'assignment_manager':
            router.push('/assignment-manager');
            break;
          default:
            setLoginError("권한이 없습니다.");
            return;
        }
      } else {
        // 일반 사용자 로그인
        if (selectedMenuItem) {
          const menuItem = mainMenuItems.find(item => item.id === selectedMenuItem);
          if (menuItem) {
            router.push(menuItem.path);
          }
        }
      }
    } else {
      setLoginError("이메일 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  // 메뉴 항목 클릭 처리
  const handleMenuItemClick = (menuId: string) => {
    setSelectedMenuItem(menuId);
    setShowLoginModal(true);
    setIsTechLogin(false);
  };

  // 기술자 로그인 클릭 처리
  const handleTechLoginClick = () => {
    setSelectedMenuItem("");
    setShowLoginModal(true);
    setIsTechLogin(true);
  };

  // 로그아웃 처리
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setSelectedMenuItem("");
  };

  // 로그인 모달 닫기
  const handleCloseModal = () => {
    setShowLoginModal(false);
    setLoginError("");
    setEmail("");
    setPassword("");
    setSelectedMenuItem("");
    setKeepLoggedIn(false);
  };

  // 회원가입 모달 열기
  const handleShowSignup = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  // 회원가입 모달 닫기
  const handleCloseSignupModal = () => {
    setShowSignupModal(false);
    setSignupError("");
    setSignupEmail("");
    setSignupPassword("");
    setSignupConfirmPassword("");
    setSignupName("");
    setSignupPosition("");
    setSignupDepartment("");
    setSignupContact("");
  };

  // 회원가입 처리
  const handleSignup = () => {
    setSignupError("");

    // 필수 항목 검증
    if (!signupEmail || !signupPassword || !signupConfirmPassword || !signupName || !signupPosition || !signupDepartment || !signupContact) {
      setSignupError("모든 필수 항목을 입력해주세요.");
      return;
    }

    // 비밀번호 확인
    if (signupPassword !== signupConfirmPassword) {
      setSignupError("비밀번호가 일치하지 않습니다.");
      return;
    }

    // 비밀번호 보안 검증 (영문, 숫자, 특수문자 조합 8~16자)
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,16}$/;
    if (!passwordRegex.test(signupPassword)) {
      setSignupError("비밀번호는 영문, 숫자, 특수문자 조합 8~16자여야 합니다.");
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupEmail)) {
      setSignupError("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    // 연락처 형식 검증 (010-1234-5678)
    const contactRegex = /^010-\d{4}-\d{4}$/;
    if (!contactRegex.test(signupContact)) {
      setSignupError("연락처는 010-1234-5678 형식으로 입력해주세요.");
      return;
    }

    // 회원가입 성공 (실제로는 서버에 전송)
    const newUser = {
      email: signupEmail,
      password: signupPassword,
      name: signupName,
      role: "user", // 기본 권한: 일반사용자
      position: signupPosition,
      department: signupDepartment,
      contact: signupContact,
      createdAt: new Date().toISOString(),
    };

    // 사용자 목록에 추가 (실제로는 서버에 저장)
    users.push(newUser);
    
    alert("회원가입이 완료되었습니다!");
    handleCloseSignupModal();
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 메인 배경 이미지 */}
      <div 
        className="absolute inset-0 bg-no-repeat"
        style={{
          backgroundImage: `url('/image/배경_메인_페이지.jpg')`,
          backgroundSize: '1920px 1080px',
          backgroundPosition: 'center center'
        }}
      ></div>
      
      {/* 배경 오버레이 - 텍스트 가독성 향상 */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      {/* 배경 그리드 패턴 - 추가 텍스처 */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* 메인 컨테이너 */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* 상단 헤더 - 반응형 */}
        <div className="flex justify-between items-center p-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Laptop className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl font-bold text-white truncate">IT Service Management</h1>
              <p className="text-gray-300 text-sm">통합 IT 서비스 관리 시스템</p>
            </div>
          </div>
          
          {/* 기술자 로그인 버튼 - 반응형 */}
          <div className="bg-gray-600/50 px-4 py-2 rounded-full backdrop-blur-sm">
            <button
              onClick={handleTechLoginClick}
              className="text-white text-sm font-medium flex items-center space-x-2 hover:text-gray-200 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Tech Login</span>
            </button>
          </div>
        </div>

        {/* 메인 콘텐츠 - Figma 디자인 레이아웃 */}
        <div className="flex-1 flex items-center">
          <div className="w-full max-w-7xl mx-auto px-8 grid grid-cols-2 gap-16 items-center">
            
            {/* 왼쪽 섹션 - 환영 메시지 */}
            <div className="relative h-96 w-full">
              {/* 환영 메시지 - 왼쪽 하단 정렬 */}
              <div className="absolute bottom-8 left-8 right-8 z-10 space-y-6 transform -translate-x-1/2 translate-y-1/5">
                <h2 className="text-4xl font-bold text-white leading-tight drop-shadow-lg">
                  IT 서비스 관리 시스템에<br />
                  <span className="text-blue-400">오신 것을 환영합니다</span>
                </h2>
                <p className="text-lg text-gray-200 leading-relaxed drop-shadow-md">
                  효율적인 IT 서비스 관리와 모니터링을 통해 비즈니스 연속성을 보장하고 
                  사용자 경험을 향상시키기 위한 통합 솔루션입니다.
                  커피 한잔의 여유를 가지고 서비스를 이용해 보세요!
                </p>
              </div>
            </div>

            {/* 원형 이미지 레이어 - 메뉴와 독립적 */}
            <div className="fixed inset-0 pointer-events-none z-10">
              {/* 커피잔 - 자주하는질문 이미지 (호버 시에만 표시) */}
              {hoveredMenuItem === 'faq' && (
                <div style={{position: 'fixed', right: '0', top: '50%', transform: `translateX(${animatedPosition}px) translateY(-113%)`, zIndex: 20, transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)'}}>
                    <div className="relative">
                  <div
                    className="w-80 h-80 bg-cover bg-center rounded-full shadow-2xl transition-all duration-700 ease-out"
                        style={{
                          backgroundImage: `url('/image/반응형_자주하는질문.jpg')`,
                          animation: 'fadeInScale 0.6s ease-out forwards'
                        }}
                      ></div>
                      <div className="absolute inset-0 flex items-start justify-center pt-12">
                        <div className="text-center text-white">
                    <div className="text-xl font-bold" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)'}}>
                      FAQ
                    </div>
                    <div className="text-sm mt-1 px-2" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.8), 0 0 6px rgba(0,0,0,0.6)'}}>
                            자주 묻는 질문과 답변을 확인하세요
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
              {/* 요청진행사항 이미지 (호버 시에만 표시) */}
              {hoveredMenuItem === 'progress' && (
                <div style={{position: 'fixed', right: '0', top: '50%', transform: `translateX(${animatedPosition}px) translateY(-113%)`, zIndex: 20, transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)'}}>
                    <div className="relative">
                  <div
                    className="w-80 h-80 bg-cover bg-center rounded-full shadow-2xl transition-all duration-700 ease-out"
                        style={{
                          backgroundImage: `url('/image/반응형_요청진행사항.jpg')`,
                          animation: 'fadeInScale 0.6s ease-out forwards'
                        }}
                      ></div>
                      <div className="absolute inset-0 flex items-start justify-center pt-12">
                        <div className="text-center text-white">
                          <div className="text-xl font-bold" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)'}}>
                            Progress
                          </div>
                          <div className="text-sm mt-1 px-2" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.8), 0 0 6px rgba(0,0,0,0.6)'}}>
                            서비스 요청의 현재 상태를 확인하세요
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
              {/* 서비스신청 이미지 (호버 시에만 표시) */}
              {hoveredMenuItem === 'service-request' && (
                <div style={{position: 'fixed', right: '0', top: '50%', transform: `translateX(${animatedPosition}px) translateY(-113%)`, zIndex: 20, transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)'}}>
                    <div className="relative">
                  <div
                    className="w-80 h-80 bg-cover bg-center rounded-full shadow-2xl transition-all duration-700 ease-out"
                        style={{
                          backgroundImage: `url('/image/반응형_서비스신청.jpg')`,
                          animation: 'fadeInScale 0.6s ease-out forwards'
                        }}
                      ></div>
                      <div className="absolute inset-0 flex items-start justify-center pt-12">
                        <div className="text-center text-white">
                          <div className="text-xl font-bold" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)'}}>
                            Service Request
                          </div>
                          <div className="text-sm mt-1 px-2" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.8), 0 0 6px rgba(0,0,0,0.6)'}}>
                            새로운 IT 서비스를 신청하세요
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
              {/* 일반문의사항 이미지 (호버 시에만 표시) */}
              {hoveredMenuItem === 'inquiry' && (
                <div style={{position: 'fixed', right: '0', top: '50%', transform: `translateX(${animatedPosition}px) translateY(-113%)`, zIndex: 20, transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)'}}>
                    <div className="relative">
                  <div
                    className="w-80 h-80 bg-cover bg-center rounded-full shadow-2xl transition-all duration-700 ease-out"
                        style={{
                          backgroundImage: `url('/image/반응형_일반문의사항.jpg')`,
                          animation: 'fadeInScale 0.6s ease-out forwards'
                        }}
                      ></div>
                      <div className="absolute inset-0 flex items-start justify-center pt-12">
                        <div className="text-center text-white">
                          <div className="text-xl font-bold" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)'}}>
                            Inquiry
                          </div>
                          <div className="text-sm mt-1 px-2" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.8), 0 0 6px rgba(0,0,0,0.6)'}}>
                            궁금한 사항을 문의하세요
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </div>

            {/* 오른쪽 섹션 - 메뉴 */}
            <div className="space-y-4 sm:space-y-6">
              {/* 메인 메뉴 항목들 - 인터랙티브 반응형 스타일 */}
              <div className="space-y-0 transform translate-x-[60%] relative">
                {mainMenuItems.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <div 
                      key={item.id} 
                      className={`relative ${item.id === 'faq' ? 'transform -translate-y-[180%] -translate-x-[10%]' : item.id === 'progress' ? 'transform -translate-y-[120%]' : item.id === 'service-request' ? 'transform -translate-y-[60%] translate-x-[10%]' : item.id === 'inquiry' ? 'transform translate-y-[20%] translate-x-[20%]' : ''}`}
                    >
                      <button
                        onClick={() => handleMenuItemClick(item.id)}
                        onMouseEnter={() => setHoveredMenuItem(item.id)}
                        onMouseLeave={() => setHoveredMenuItem("")}
                        className="w-[60%] p-3 sm:p-4 text-left hover:bg-white/5 transition-all duration-500 ease-out group rounded-lg smooth-hover"
                      >
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className={`w-5 h-5 sm:w-6 sm:h-6 ${item.color} rounded flex items-center justify-center flex-shrink-0 transition-all duration-500 ease-out group-hover:scale-110 group-hover:shadow-lg group-hover:rotate-3`}>
                            <IconComponent className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                          </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-medium transition-all duration-500 ease-out truncate text-white group-hover:text-blue-300 group-hover:scale-105">
                            {item.title}
                          </h3>
                        </div>
                        </div>
                      </button>
                      
                      {/* 구분선 */}
                      <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent w-[60%]"></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 하단 저작권 정보 - 반응형 */}
        <div className="absolute bottom-4 left-4 right-4 text-center">
          <span className="text-sm text-gray-400">
            © 2025 IT 서비스 관리 시스템. 모든 권리는 Juss 가 보유
          </span>
        </div>
      </div>

      {/* 로그인 모달 - 반응형 */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-enter">
          <FigmaCard className="w-full max-w-md mx-0 smooth-hover">
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                  {isTechLogin ? '기술자 로그인' : '사용자 로그인'}
                </h2>
                <p className="text-sm sm:text-base text-gray-600 text-left">
                  {isTechLogin 
                    ? '기술자 계정으로 로그인하세요' 
                    : selectedMenuItem 
                      ? `${mainMenuItems.find(item => item.id === selectedMenuItem)?.title} 페이지 접근을 위해 로그인하세요`
                      : '서비스 이용을 위해 로그인하세요'
                  }
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    이메일
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="이메일을 입력하세요"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    비밀번호
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="비밀번호를 입력하세요"
                    required
                  />
                </div>

                {/* 로그인 상태 유지 및 비밀번호 찾기 */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={keepLoggedIn}
                      onChange={(e) => setKeepLoggedIn(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">로그인 상태 유지</span>
                  </label>
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    비밀번호 찾기
                  </button>
                </div>

                {loginError && (
                  <div className="text-red-600 text-xs sm:text-sm text-center bg-red-50 p-2 sm:p-3 rounded-lg">
                    {loginError}
                  </div>
                )}

                <div className="flex space-x-2 sm:space-x-3 pt-3 sm:pt-4">
                  <FigmaButton
                    variant="secondary"
                    onClick={handleCloseModal}
                    className="flex-1 text-sm sm:text-base"
                  >
                    취소
                  </FigmaButton>
                  <FigmaButton
                    variant="primary"
                    onClick={handleLogin}
                    className="flex-1 text-sm sm:text-base"
                  >
                    로그인
                  </FigmaButton>
                </div>

                {/* 회원가입 링크 */}
                <div className="text-center mt-4">
                  <span className="text-sm text-gray-600">계정이 없으신가요? </span>
                  <button
                    type="button"
                    onClick={handleShowSignup}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    회원가입
                  </button>
                </div>
              </div>

              {/* 테스트 계정 정보 - 반응형 */}
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">테스트 계정:</h4>
                <div className="text-xs text-gray-600 space-y-0.5 sm:space-y-1">
                  <div className="break-all">• 시스템관리: system@itsm.com / system123</div>
                  <div className="break-all">• 서비스관리: service@itsm.com / service123</div>
                  <div className="break-all">• 조치담당자: tech@itsm.com / tech123</div>
                  <div className="break-all">• 배정담당자: assign@itsm.com / assign123</div>
                  <div className="break-all">• 일반사용자: user@itsm.com / user123</div>
                </div>
              </div>
            </div>
          </FigmaCard>
        </div>
      )}

      {/* 회원가입 모달 */}
      {showSignupModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-enter">
          <FigmaCard className="w-full max-w-lg mx-0 smooth-hover">
            <div className="p-4 sm:p-6 lg:p-8">
              {/* 헤더 */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Icon name="user" size={20} className="text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">회원가입</h2>
                </div>
                <button
                  onClick={handleCloseSignupModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Icon name="close" size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* 이메일 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이메일 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon name="mail" size={20} className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="이메일 주소를 입력해 주세요!"
                      required
                    />
                  </div>
                </div>

                {/* 비밀번호 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    비밀번호 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon name="lock" size={20} className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="영문, 숫자, 특수문자 조합 8~16자"
                      required
                    />
                  </div>
                </div>

                {/* 비밀번호 확인 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    비밀번호 확인 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon name="lock" size={20} className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="비밀번호를 다시 입력해주세요"
                      required
                    />
                  </div>
                </div>

                {/* 성명 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    성명 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon name="user" size={20} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="예) 홍길동"
                      required
                    />
                  </div>
                </div>

                {/* 직급 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    직급 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon name="briefcase" size={20} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={signupPosition}
                      onChange={(e) => setSignupPosition(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="예) 사원"
                      required
                    />
                  </div>
                </div>

                {/* 소속 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    소속 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <img src="/icons/briefcase.svg" alt="소속" className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={signupDepartment}
                      onChange={(e) => setSignupDepartment(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="예) 관리부"
                      required
                    />
                  </div>
                </div>

                {/* 연락처 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    연락처 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <img src="/icons/phone.svg" alt="연락처" className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={signupContact}
                      onChange={(e) => setSignupContact(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="예) 010-1234-5678"
                      required
                    />
                  </div>
                </div>

                {signupError && (
                  <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
                    {signupError}
                  </div>
                )}

                <FigmaButton
                  variant="primary"
                  onClick={handleSignup}
                  className="w-full text-base py-3 mt-4"
                >
                  회원가입
                </FigmaButton>
              </div>
            </div>
          </FigmaCard>
        </div>
      )}

      {/* 로그인된 사용자 정보 - 반응형 */}
      {isLoggedIn && currentUser && (
        <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-40">
          <FigmaCard className="p-2 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs sm:text-sm font-medium">
                  {currentUser.name.charAt(0)}
                </span>
              </div>
              <div className="min-w-0 hidden sm:block">
                <p className="text-sm font-medium text-gray-800 truncate">{currentUser.name}</p>
                <p className="text-xs text-gray-600 truncate">{getPermissionLevelName(getRolePermissionLevel(currentUser.role))}</p>
              </div>
              <FigmaButton
                onClick={handleLogout}
                variant="error"
                size="sm"
                className="ml-1 sm:ml-2 text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">로그아웃</span>
                <span className="sm:hidden">로그아웃</span>
              </FigmaButton>
            </div>
          </FigmaCard>
        </div>
      )}
    </div>
  );
}
