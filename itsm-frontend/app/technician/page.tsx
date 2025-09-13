"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function TechnicianPage() {
  const router = useRouter();

  useEffect(() => {
    // 권한 확인 로직 (실제로는 서버에서 확인)
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'technician') {
      router.push('/');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">조치담당자 페이지</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 배정된 작업 */}
            <div className="bg-yellow-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-yellow-800 mb-4">배정된 작업</h2>
              <p className="text-gray-600 mb-4">배정담당자에 의해 배정된 서비스 신청 정보를 조회하고 승인/반려를 진행합니다.</p>
              <div className="space-y-2">
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium">문서 출력 문제</p>
                  <p className="text-sm text-gray-500">배정일: 2025-01-15 | 상태: 배정됨</p>
                  <div className="mt-2 space-x-2">
                    <button className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600">
                      승인
                    </button>
                    <button className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600">
                      반려
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 진행 중인 작업 */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">진행 중인 작업</h2>
              <p className="text-gray-600 mb-4">승인 후 서비스 작업을 진행합니다.</p>
              <div className="space-y-2">
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium">네트워크 연결 오류</p>
                  <p className="text-sm text-gray-500">승인일: 2025-01-14 | 상태: 진행 중</p>
                  <div className="mt-2">
                    <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
                      작업 완료
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              메인으로
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('userRole');
                router.push('/');
              }}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
