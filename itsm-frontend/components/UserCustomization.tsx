"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type UserPreference = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: string;
};

type DashboardWidget = {
  id: string;
  name: string;
  description: string;
  visible: boolean;
  position: number;
};

export default function UserCustomization() {
  const [preferences, setPreferences] = useState<UserPreference[]>([
    { id: "1", name: "실시간 알림", description: "서비스 상태 변경 시 즉시 알림", enabled: true, category: "알림" },
    { id: "2", name: "자동 새로고침", description: "30초마다 자동으로 데이터 새로고침", enabled: true, category: "자동화" },
    { id: "3", name: "다크 모드", description: "어두운 테마로 화면 표시", enabled: false, category: "테마" },
    { id: "4", name: "컴팩트 모드", description: "더 조밀한 레이아웃으로 표시", enabled: false, category: "레이아웃" },
    { id: "5", name: "키보드 단축키", description: "키보드 단축키 활성화", enabled: true, category: "접근성" },
    { id: "6", name: "음성 알림", description: "음성으로 상태 변경 알림", enabled: false, category: "알림" }
  ]);

  const [widgets, setWidgets] = useState<DashboardWidget[]>([
    { id: "1", name: "서비스 상태 요약", description: "전체 서비스 상태를 한눈에 확인", visible: true, position: 1 },
    { id: "2", name: "최근 요청사항", description: "최근 제출한 요청사항 목록", visible: true, position: 2 },
    { id: "3", name: "빠른 응답 도구", description: "자주 사용하는 빠른 응답 도구", visible: true, position: 3 },
    { id: "4", name: "실시간 차트", description: "서비스 성능 실시간 차트", visible: false, position: 4 },
    { id: "5", name: "알림 센터", description: "중요한 알림과 업데이트", visible: true, position: 5 },
    { id: "6", name: "즐겨찾기 서비스", description: "자주 사용하는 서비스 목록", visible: false, position: 6 }
  ]);

  const togglePreference = (id: string) => {
    setPreferences(prev => 
      prev.map(pref => 
        pref.id === id ? { ...pref, enabled: !pref.enabled } : pref
      )
    );
  };

  const toggleWidget = (id: string) => {
    setWidgets(prev => 
      prev.map(widget => 
        widget.id === id ? { ...widget, visible: !widget.visible } : widget
      )
    );
  };

  const moveWidget = (id: string, direction: "up" | "down") => {
    setWidgets(prev => {
      const currentIndex = prev.findIndex(w => w.id === id);
      if (currentIndex === -1) return prev;

      const newWidgets = [...prev];
      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

      if (targetIndex < 0 || targetIndex >= newWidgets.length) return prev;

      // 위치 교환
      [newWidgets[currentIndex], newWidgets[targetIndex]] = [newWidgets[targetIndex], newWidgets[currentIndex]];
      
      // 위치 번호 업데이트
      return newWidgets.map((widget, index) => ({ ...widget, position: index + 1 }));
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">사용자 맞춤 설정</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          대시보드와 인터페이스를 개인 취향에 맞게 커스터마이징할 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 사용자 선호도 설정 */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">사용자 선호도</h3>
          <div className="space-y-3">
            {preferences.map((preference) => (
              <div key={preference.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preference.enabled}
                        onChange={() => togglePreference(preference.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                    <div>
                      <h4 className="font-medium text-gray-900">{preference.name}</h4>
                      <p className="text-sm text-gray-600">{preference.description}</p>
                    </div>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {preference.category}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* 대시보드 위젯 설정 */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">대시보드 위젯</h3>
          <div className="space-y-3">
            {widgets.map((widget) => (
              <div key={widget.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={widget.visible}
                        onChange={() => toggleWidget(widget.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                    <div>
                      <h4 className="font-medium text-gray-900">{widget.name}</h4>
                      <p className="text-sm text-gray-600">{widget.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                    {widget.position}번
                  </span>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => moveWidget(widget.id, "up")}
                      disabled={widget.position === 1}
                      className="w-8 h-8 p-0"
                    >
                      ↑
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => moveWidget(widget.id, "down")}
                      disabled={widget.position === widgets.length}
                      className="w-8 h-8 p-0"
                    >
                      ↓
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 테마 설정 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">테마 설정</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border-2 border-blue-500 rounded-lg p-4 cursor-pointer hover:bg-blue-50">
            <div className="w-full h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded mb-3"></div>
            <h4 className="font-medium text-gray-900">기본 테마</h4>
            <p className="text-sm text-gray-600">파란색 기반의 기본 테마</p>
          </div>
          <div className="border-2 border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50">
            <div className="w-full h-20 bg-gradient-to-r from-gray-700 to-gray-800 rounded mb-3"></div>
            <h4 className="font-medium text-gray-900">다크 테마</h4>
            <p className="text-sm text-gray-600">어두운 배경의 테마</p>
          </div>
          <div className="border-2 border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50">
            <div className="w-full h-20 bg-gradient-to-r from-green-500 to-green-600 rounded mb-3"></div>
            <h4 className="font-medium text-gray-900">그린 테마</h4>
            <p className="text-sm text-gray-600">녹색 기반의 테마</p>
          </div>
        </div>
      </Card>

      {/* 저장 버튼 */}
      <div className="flex justify-center">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
          설정 저장
        </Button>
      </div>
    </div>
  );
}
