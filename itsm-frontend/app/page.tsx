"use client";

// import { Button } from "@/components/ui/button"; // 사용되지 않음
// import { FigmaButton } from "@/components/figma/FigmaButton"; // 삭제됨
// import { FigmaCard } from "@/components/figma/FigmaCard"; // 삭제됨
import { useState, useEffect } from "react";
import { getPermissionLevelName, getRolePermissionLevel } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import Icon from '@/components/ui/Icon'
import { apiClient, LoginRequest } from '@/lib/api'
// import { PermissionGuard, RoleGuard, usePermissions, useRoles } from '@/components/PermissionGuard' // 사용되지 않음
import { 
  MessageSquare, 
  BarChart3, 
  FileText, 
  HelpCircle, 
  // Coffee, // 사용되지 않음
  // Cookie, // 사용되지 않음
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
  { email: "service@itsm.com", password: "service123", name: "관리매니저", role: "service_manager" },
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
  
  // 로딩 상태
  const [isLoginLoading, setIsLoginLoading] = useState<boolean>(false);
  const [isSignupLoading, setIsSignupLoading] = useState<boolean>(false);
  
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

  // 로그인 처리 (API 연동)
  const handleLogin = async () => {
    setLoginError("");
    setIsLoginLoading(true);
    
    // isTechLogin 상태를 로컬 변수로 저장 (React 상태 업데이트 지연 방지)
    const currentIsTechLogin = isTechLogin;

    // 입력값 검증
    if (!email || !password) {
      setLoginError("이메일과 비밀번호를 입력해주세요.");
      setIsLoginLoading(false);
      setIsTechLogin(false);
      return;
    }

    try {
      const loginData: LoginRequest = {
        email,
        password
      };

      const response = await apiClient.login(loginData);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        setCurrentUser({ ...user, password: '' });
        setIsLoggedIn(true);
        setShowLoginModal(false);
        setEmail("");
        setPassword("");
        setIsTechLogin(false);
        
        // 권한별 페이지 라우팅 (DB 기반 권한 확인)
        // 로그인 성공 후 사용자 ID를 localStorage에 저장
        localStorage.setItem('userId', user.id);
        
        // 권한에 따른 페이지 라우팅
        try {
          const permissionResponse = await apiClient.getUserRoles(user.id);
          if (permissionResponse.success && permissionResponse.data) {
            const userRoles = permissionResponse.data.map(role => role.name);
            
            if (userRoles.includes('시스템관리')) {
              router.push('/system-admin');
            } else if (userRoles.includes('관리매니저')) {
              router.push('/service-manager');
            } else if (userRoles.includes('조치담당자')) {
              router.push('/technician');
            } else if (userRoles.includes('배정담당자')) {
              router.push('/assignment-manager');
            } else {
              // 일반사용자 또는 권한이 없는 경우
              if (currentIsTechLogin) {
                // Tech Login으로 로그인한 일반사용자는 요청진행사항 페이지로
                router.push('/progress');
              } else {
                // 메뉴에서 선택한 일반사용자는 선택한 메뉴로
                if (selectedMenuItem) {
                  const menuItem = mainMenuItems.find(item => item.id === selectedMenuItem);
                  if (menuItem) {
                    router.push(menuItem.path);
                  } else {
                    router.push('/progress');
                  }
                } else {
                  router.push('/progress');
                }
              }
            }
          } else {
            // 권한 조회 실패 시 기본 페이지로 이동
            router.push('/progress');
          }
        } catch (error) {
          console.error('권한 확인 오류:', error);
          router.push('/progress');
        }
      } else {
        setLoginError(response.error || "로그인에 실패했습니다.");
        setIsTechLogin(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError("로그인 중 오류가 발생했습니다.");
      setIsTechLogin(false);
    } finally {
      setIsLoginLoading(false);
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

  // 로그아웃 처리 (API 연동)
  const handleLogout = async () => {
    await apiClient.logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setSelectedMenuItem("");
    setIsTechLogin(false);
  };

  // 로그인 모달 닫기
  const handleCloseModal = () => {
    setShowLoginModal(false);
    setLoginError("");
    setEmail("");
    setPassword("");
    setSelectedMenuItem("");
    setIsTechLogin(false);
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

  // 회원가입 처리 (API 연동)
  const handleSignup = async () => {
    setSignupError("");
    setIsSignupLoading(true);

    // 필수 항목 검증
    if (!signupEmail || !signupPassword || !signupConfirmPassword || !signupName || !signupPosition || !signupDepartment || !signupContact) {
      setSignupError("모든 필수 항목을 입력해주세요.");
      setIsSignupLoading(false);
      return;
    }

    // 비밀번호 확인
    if (signupPassword !== signupConfirmPassword) {
      setSignupError("비밀번호가 일치하지 않습니다.");
      setIsSignupLoading(false);
      return;
    }

    // 비밀번호 보안 검증 (영문, 숫자, 특수문자 조합 8~16자)
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,16}$/;
    if (!passwordRegex.test(signupPassword)) {
      setSignupError("비밀번호는 영문, 숫자, 특수문자 조합 8~16자여야 합니다.");
      setIsSignupLoading(false);
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupEmail)) {
      setSignupError("올바른 이메일 형식을 입력해주세요.");
      setIsSignupLoading(false);
      return;
    }

    // 연락처 형식 검증 (010-1234-5678)
    const contactRegex = /^010-\d{4}-\d{4}$/;
    if (!contactRegex.test(signupContact)) {
      setSignupError("연락처는 010-1234-5678 형식으로 입력해주세요.");
      setIsSignupLoading(false);
      return;
    }

    try {
      const signupData = {
        email: signupEmail,
        password: signupPassword,
        name: signupName,
        position: signupPosition,
        department: signupDepartment,
        phone: signupContact,
        role: "user" // 기본 권한: 일반사용자
      };

      const response = await apiClient.register(signupData);
      
      if (response.success) {
        alert("회원가입이 완료되었습니다!");
        handleCloseSignupModal();
      } else {
        setSignupError(response.error || "회원가입에 실패했습니다.");
      }
    } catch (error) {
      console.error('Signup error:', error);
      setSignupError("회원가입 중 오류가 발생했습니다.");
    } finally {
      setIsSignupLoading(false);
    }
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
          <div className="w-full max-w-md mx-0 smooth-hover bg-white border border-gray-200 rounded-lg p-6 transition-all duration-200">
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

              <form onSubmit={(e) => { 
                e.preventDefault(); 
                setLoginError("로그인 버튼을 눌러주세요.");
              }} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    이메일
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        setLoginError("로그인 버튼을 눌러주세요.");
                      }
                    }}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="이메일을 입력하세요"
                    autoComplete="email"
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        setLoginError("로그인 버튼을 눌러주세요.");
                      }
                    }}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="비밀번호를 입력하세요"
                    autoComplete="current-password"
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
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 text-sm sm:text-base bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleLogin}
                    disabled={isLoginLoading}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors text-sm sm:text-base font-medium ${
                      isLoginLoading 
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isLoginLoading ? '로그인 중...' : '로그인'}
                  </button>
                </div>
              </form>

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
                <div className="break-all">• 관리매니저: service@itsm.com / service123</div>
                <div className="break-all">• 조치담당자: tech@itsm.com / tech123</div>
                <div className="break-all">• 배정담당자: assign@itsm.com / assign123</div>
                <div className="break-all">• 일반사용자: user@itsm.com / user123</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 회원가입 모달 */}
      {showSignupModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-enter">
          <div className="w-full max-w-lg mx-0 smooth-hover bg-white border border-gray-200 rounded-lg p-6 transition-all duration-200">
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

              <form onSubmit={async (e) => { 
                e.preventDefault(); 
                try {
                  await handleSignup(); 
                } catch (error) {
                  console.error('Signup form error:', error);
                  setSignupError('회원가입 중 오류가 발생했습니다.');
                }
              }} className="space-y-4">
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
                      autoComplete="email"
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
                      autoComplete="new-password"
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
                      autoComplete="new-password"
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
                    <select
                      value={signupDepartment}
                      onChange={(e) => setSignupDepartment(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      required
                    >
                      <option value="">부서를 선택하세요</option>
                      <option value="IT팀">IT팀</option>
                      <option value="운영팀">운영팀</option>
                      <option value="개발팀">개발팀</option>
                      <option value="관리부">관리부</option>
                      <option value="생산부">생산부</option>
                      <option value="구매팀">구매팀</option>
                      <option value="재무팀">재무팀</option>
                      <option value="영업팀">영업팀</option>
                      <option value="마케팅팀">마케팅팀</option>
                      <option value="인사팀">인사팀</option>
                      <option value="보안팀">보안팀</option>
                      <option value="법무팀">법무팀</option>
                      <option value="연구개발팀">연구개발팀</option>
                    </select>
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
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-center">
                    <div className="flex items-center justify-center mb-2">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">회원가입 오류</span>
                    </div>
                    <p className="text-sm">{signupError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSignupLoading}
                  className={`w-full px-4 py-3 rounded-lg transition-colors text-base font-medium mt-4 ${
                    isSignupLoading 
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isSignupLoading ? '회원가입 중...' : '회원가입'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 로그인된 사용자 정보 - 반응형 */}
      {isLoggedIn && currentUser && (
        <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-40">
          <div className="p-2 sm:p-4 bg-white border border-gray-200 rounded-lg transition-all duration-200">
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
              <button
                onClick={handleLogout}
                className="ml-1 sm:ml-2 text-xs sm:text-sm bg-red-500 hover:bg-red-600 text-white font-medium py-1.5 px-3 rounded-lg transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <span className="hidden sm:inline">로그아웃</span>
                <span className="sm:hidden">로그아웃</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
