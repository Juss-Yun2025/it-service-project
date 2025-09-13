"use client";

import { Button } from "@/components/ui/button";
import { FigmaButton } from "@/components/figma/FigmaButton";
import { FigmaCard } from "@/components/figma/FigmaCard";
import { useState, useEffect } from "react";
import { getPermissionLevelName, getRolePermissionLevel } from '@/lib/auth'
import { useRouter } from 'next/navigation'
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
  
  const router = useRouter();

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
      
      // 선택된 메뉴 항목이 있으면 해당 페이지로 이동
      if (selectedMenuItem) {
        const menuItem = mainMenuItems.find(item => item.id === selectedMenuItem);
        if (menuItem) {
          router.push(menuItem.path);
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
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 메인 배경 이미지 */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/image/메인페이지_배경_이미지.jpg')`
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
        <div className="flex justify-between items-center p-4 sm:p-6 lg:p-8">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Laptop className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-3xl font-bold text-white truncate">IT Service Management</h1>
              <p className="text-gray-300 text-xs sm:text-sm hidden sm:block">통합 IT 서비스 관리 시스템</p>
            </div>
          </div>
          
          {/* 기술자 로그인 버튼 - 반응형 */}
          <div className="bg-gray-600/50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full backdrop-blur-sm">
            <button
              onClick={handleTechLoginClick}
              className="text-white text-xs sm:text-sm font-medium flex items-center space-x-1 sm:space-x-2 hover:text-gray-200 transition-colors"
            >
              <LogIn className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Tech Login</span>
              <span className="sm:hidden">Tech</span>
            </button>
          </div>
        </div>

        {/* 메인 콘텐츠 - Figma 디자인 레이아웃 */}
        <div className="flex-1 flex items-center">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            
            {/* 왼쪽 섹션 - 환영 메시지 */}
            <div className="relative h-80 sm:h-96 md:h-[28rem] lg:h-[32rem] xl:h-96 w-full">
              {/* 환영 메시지 - 왼쪽 하단 정렬 */}
              <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-4 sm:left-6 lg:left-8 right-4 sm:right-6 lg:right-8 z-10 space-y-3 sm:space-y-4 lg:space-y-6 transform -translate-x-1/2 translate-y-1/5">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight drop-shadow-lg">
                  IT 서비스 관리 시스템에<br />
                  <span className="text-blue-400">오신 것을 환영합니다</span>
                </h2>
                <p className="text-sm sm:text-base lg:text-lg text-gray-200 leading-relaxed drop-shadow-md">
                  효율적인 IT 서비스 관리와 모니터링을 통해 비즈니스 연속성을 보장하고 
                  사용자 경험을 향상시키는 통합 솔루션입니다.
                </p>
              </div>
            </div>

            {/* 오른쪽 섹션 - 메뉴 + 커피잔 */}
            <div className="space-y-4 sm:space-y-6">
              {/* 메인 메뉴 항목들 + 커피잔 - 인터랙티브 반응형 스타일 */}
              <div className="space-y-0 transform translate-x-[60%] relative">
                {/* 커피잔 - 자주하는질문 이미지 (호버 시에만 표시) */}
                {hoveredMenuItem === 'faq' && (
                  <div className="fixed" style={{right: '20px', top: '50%', transform: 'translateY(-50%) translateX(-900px) translateY(-200px)'}}>
                    <div className="relative">
                      <div 
                        className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 xl:w-80 xl:h-80 bg-cover bg-center rounded-full shadow-2xl transition-all duration-500 ease-in-out"
                        style={{
                          backgroundImage: `url('/image/자주하는질문_반응형_이미지.jpg')`
                        }}
                      ></div>
                      <div className="absolute inset-0 flex items-start justify-center pt-6 sm:pt-8 md:pt-10 lg:pt-12 xl:pt-14">
                        <div className="text-center text-white">
                          <div className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)'}}>
                            FAQ
                          </div>
                          <div className="text-xs sm:text-xs md:text-sm lg:text-sm xl:text-base mt-1 px-1 sm:px-2" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.8), 0 0 6px rgba(0,0,0,0.6)'}}>
                            자주 묻는 질문과 답변을 확인하세요
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 요청진행사항 이미지 (호버 시에만 표시) */}
                {hoveredMenuItem === 'progress' && (
                  <div className="fixed" style={{right: '20px', top: '50%', transform: 'translateY(-50%) translateX(-900px) translateY(-200px)'}}>
                    <div className="relative">
                      <div 
                        className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 xl:w-80 xl:h-80 bg-cover bg-center rounded-full shadow-2xl transition-all duration-500 ease-in-out"
                        style={{
                          backgroundImage: `url('/image/요청진행사항_반응형_이미지.jpg')`
                        }}
                      ></div>
                      <div className="absolute inset-0 flex items-start justify-center pt-6 sm:pt-8 md:pt-10 lg:pt-12 xl:pt-14">
                        <div className="text-center text-white">
                          <div className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)'}}>
                            Progress
                          </div>
                          <div className="text-xs sm:text-xs md:text-sm lg:text-sm xl:text-base mt-1 px-1 sm:px-2" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.8), 0 0 6px rgba(0,0,0,0.6)'}}>
                            서비스 요청의 현재 상태를 확인하세요
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 서비스신청 이미지 (호버 시에만 표시) */}
                {hoveredMenuItem === 'service-request' && (
                  <div className="fixed" style={{right: '20px', top: '50%', transform: 'translateY(-50%) translateX(-900px) translateY(-200px)'}}>
                    <div className="relative">
                      <div 
                        className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 xl:w-80 xl:h-80 bg-cover bg-center rounded-full shadow-2xl transition-all duration-500 ease-in-out"
                        style={{
                          backgroundImage: `url('/image/서비스신청_반응형_이미지.jpg')`
                        }}
                      ></div>
                      <div className="absolute inset-0 flex items-start justify-center pt-6 sm:pt-8 md:pt-10 lg:pt-12 xl:pt-14">
                        <div className="text-center text-white">
                          <div className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)'}}>
                            Service Request
                          </div>
                          <div className="text-xs sm:text-xs md:text-sm lg:text-sm xl:text-base mt-1 px-1 sm:px-2" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.8), 0 0 6px rgba(0,0,0,0.6)'}}>
                            새로운 IT 서비스를 신청하세요
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 일반문의사항 이미지 (호버 시에만 표시) */}
                {hoveredMenuItem === 'inquiry' && (
                  <div className="fixed" style={{right: '20px', top: '50%', transform: 'translateY(-50%) translateX(-900px) translateY(-200px)'}}>
                    <div className="relative">
                      <div 
                        className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 xl:w-80 xl:h-80 bg-cover bg-center rounded-full shadow-2xl transition-all duration-500 ease-in-out"
                        style={{
                          backgroundImage: `url('/image/일반문의사항_반응형_이미지.jpg')`
                        }}
                      ></div>
                      <div className="absolute inset-0 flex items-start justify-center pt-6 sm:pt-8 md:pt-10 lg:pt-12 xl:pt-14">
                        <div className="text-center text-white">
                          <div className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)'}}>
                            Inquiry
                          </div>
                          <div className="text-xs sm:text-xs md:text-sm lg:text-sm xl:text-base mt-1 px-1 sm:px-2" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.8), 0 0 6px rgba(0,0,0,0.6)'}}>
                            궁금한 사항을 문의하세요
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
                        className="w-[60%] p-3 sm:p-4 text-left hover:bg-white/5 transition-all duration-300 group rounded-lg"
                      >
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className={`w-5 h-5 sm:w-6 sm:h-6 ${item.color} rounded flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                            <IconComponent className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                          </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-medium transition-all duration-300 truncate text-white group-hover:text-blue-300 group-hover:scale-105">
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
        <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 lg:bottom-8 lg:left-8 text-xs sm:text-sm text-gray-400">
          <span className="hidden sm:inline">© 2025 IT 서비스 관리 시스템. 모든 권리는 Juss 기 보유</span>
          <span className="sm:hidden">© 2025 ITSM</span>
        </div>
      </div>

      {/* 로그인 모달 - 반응형 */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <FigmaCard className="w-full max-w-md mx-0">
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                  {isTechLogin ? '기술자 로그인' : '사용자 로그인'}
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
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
