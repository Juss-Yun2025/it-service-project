"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AssignmentManagerPage() {
  const router = useRouter();

  useEffect(() => {
    // 권한 확인 로직 (실제로는 서버에서 확인)
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'assignment_manager') {
      router.push('/');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">배정담당자 페이지</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 서비스 신청 배정 */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">서비스 신청 배정</h2>
              <p className="text-gray-600 mb-4">서비스 신청된 데이터의 조치담당자를 배정하는 업무를 진행합니다.</p>
              <div className="space-y-2">
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium">문서 출력 문제</p>
                  <p className="text-sm text-gray-500">2025-01-15 | 긴급</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium">네트워크 연결 오류</p>
                  <p className="text-sm text-gray-500">2025-01-15 | 보통</p>
                </div>
              </div>
            </div>

            {/* 일반 문의 답변 */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-green-800 mb-4">일반 문의 답변</h2>
              <p className="text-gray-600 mb-4">일반 문의에 등록된 답변 업무를 진행합니다.</p>
              <div className="space-y-2">
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium">시스템 사용 문의</p>
                  <p className="text-sm text-gray-500">2025-01-15 | 답변 대기</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium">권한 변경 요청</p>
                  <p className="text-sm text-gray-500">2025-01-15 | 처리 중</p>
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
