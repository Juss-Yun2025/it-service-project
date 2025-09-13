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
  
  const router = useRouter();

  // 로그인 처리
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* 배경 그리드 */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      {/* 메인 컨테이너 */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
              <Laptop className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">IT Service Management</h1>
              <p className="text-gray-300 text-sm">통합 IT 서비스 관리 시스템</p>
            </div>
          </div>
          
          {/* 기술자 로그인 버튼 */}
          <FigmaButton
            onClick={handleTechLoginClick}
            variant="secondary"
            size="md"
            className="flex items-center space-x-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Tech Login</span>
          </FigmaButton>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* 왼쪽 섹션 - 소개 및 노트북 */}
          <div className="space-y-8">
            {/* 노트북 이미지 영역 */}
            <div className="relative">
              <div className="w-full h-64 bg-gray-800/50 rounded-2xl border border-gray-700/50 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Laptop className="w-16 h-16 text-gray-400 mx-auto" />
                  <p className="text-gray-400 text-sm">IT 서비스 관리 시스템</p>
                </div>
              </div>
            </div>

            {/* 환영 메시지 */}
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-white leading-tight">
                IT 서비스 관리 시스템에<br />
                <span className="text-blue-400">오신 것을 환영합니다</span>
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                효율적인 IT 서비스 관리와 모니터링을 통해 비즈니스 연속성을 보장하고 
                사용자 경험을 향상시키는 통합 솔루션입니다.
              </p>
            </div>

            {/* 저작권 정보 */}
            <div className="text-sm text-gray-400">
              © 2025 IT 서비스 관리 시스템. 모든 권리는 Juss 기 보유
            </div>
          </div>

          {/* 오른쪽 섹션 - 메뉴 및 장식 요소 */}
          <div className="space-y-8">
            {/* 커피와 쿠키 장식 */}
            <div className="flex justify-center space-x-8">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center shadow-lg">
                <Coffee className="w-8 h-8 text-amber-600" />
              </div>
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center shadow-lg">
                <Cookie className="w-8 h-8 text-amber-600" />
              </div>
            </div>

            {/* 메인 메뉴 항목들 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mainMenuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <FigmaCard
                    key={item.id}
                    variant="elevated"
                    className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    onClick={() => handleMenuItemClick(item.id)}
                  >
                    <div className="p-6 text-center space-y-4">
                      <div className={`w-12 h-12 ${item.color} ${item.hoverColor} rounded-lg flex items-center justify-center mx-auto transition-colors duration-200`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </FigmaCard>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 로그인 모달 */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <FigmaCard className="w-full max-w-md mx-4">
            <div className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {isTechLogin ? '기술자 로그인' : '사용자 로그인'}
                </h2>
                <p className="text-gray-600">
                  {isTechLogin 
                    ? '기술자 계정으로 로그인하세요' 
                    : selectedMenuItem 
                      ? `${mainMenuItems.find(item => item.id === selectedMenuItem)?.title} 페이지 접근을 위해 로그인하세요`
                      : '서비스 이용을 위해 로그인하세요'
                  }
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="이메일을 입력하세요"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    비밀번호
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="비밀번호를 입력하세요"
                    required
                  />
                </div>

                {loginError && (
                  <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
                    {loginError}
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <FigmaButton
                    type="button"
                    variant="secondary"
                    onClick={handleCloseModal}
                    className="flex-1"
                  >
                    취소
                  </FigmaButton>
                  <FigmaButton
                    type="submit"
                    variant="primary"
                    className="flex-1"
                  >
                    로그인
                  </FigmaButton>
                </div>
              </form>

              {/* 테스트 계정 정보 */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">테스트 계정:</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>• 시스템관리: system@itsm.com / system123</div>
                  <div>• 서비스관리: service@itsm.com / service123</div>
                  <div>• 조치담당자: tech@itsm.com / tech123</div>
                  <div>• 배정담당자: assign@itsm.com / assign123</div>
                  <div>• 일반사용자: user@itsm.com / user123</div>
                </div>
              </div>
            </div>
          </FigmaCard>
        </div>
      )}

      {/* 로그인된 사용자 정보 */}
      {isLoggedIn && currentUser && (
        <div className="fixed top-4 right-4 z-40">
          <FigmaCard className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {currentUser.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{currentUser.name}</p>
                <p className="text-xs text-gray-600">{getPermissionLevelName(getRolePermissionLevel(currentUser.role))}</p>
              </div>
              <FigmaButton
                onClick={handleLogout}
                variant="error"
                size="sm"
                className="ml-2"
              >
                로그아웃
              </FigmaButton>
            </div>
          </FigmaCard>
        </div>
      )}
    </div>
  );
}
