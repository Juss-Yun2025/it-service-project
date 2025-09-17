"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/ui/Icon'

// 데이터 타입 정의
interface ServiceRequest {
  id: string
  requestNumber: string
  title: string
  status: string
  currentStatus: string
  requestDate: string
  requester: string
  department: string
  stage: string
  assignTime?: string
  assignee?: string
  assigneeDepartment?: string
  content: string
  contact: string
  location: string
  actualRequester?: string
  actualContact?: string
}

interface Technician {
  id: string
  name: string
  department: string
  isWorking: boolean
  assignedCount: number
}

interface Inquiry {
  id: string
  inquiryDate: string
  content: string
  inquirer: string
  answerDate?: string
  isLocked?: boolean
}

interface PendingWork {
  id: string
  technician: string
  lastWeekPending: number
  longTermPending: number
}

export default function AssignmentManagerPage() {
  const router = useRouter()
  
  // 상태 관리
  const [realTimeUpdate, setRealTimeUpdate] = useState(false)
  const [showTechnicianStatus, setShowTechnicianStatus] = useState(true)
  const [showPendingWork, setShowPendingWork] = useState(true)
  
  // 서비스 신청 관련 상태
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([])
  const [serviceRequestPage, setServiceRequestPage] = useState(1)
  const [serviceRequestStartDate, setServiceRequestStartDate] = useState('')
  const [serviceRequestEndDate, setServiceRequestEndDate] = useState('')
  const [showUnassignedOnly, setShowUnassignedOnly] = useState(false)
  
  // 일반 문의 관련 상태
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [inquiryPage, setInquiryPage] = useState(1)
  const [inquiryStartDate, setInquiryStartDate] = useState('')
  const [inquiryEndDate, setInquiryEndDate] = useState('')
  const [showUnansweredOnly, setShowUnansweredOnly] = useState(false)
  
  // 조치담당자 관련 상태
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [technicianPage, setTechnicianPage] = useState(1)
  const [selectedDepartment, setSelectedDepartment] = useState('')
  
  // 작업미결 관련 상태
  const [pendingWorks, setPendingWorks] = useState<PendingWork[]>([])
  const [pendingWorkPage, setPendingWorkPage] = useState(1)
  const [selectedPendingDepartment, setSelectedPendingDepartment] = useState('')
  
  // 모달 상태
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [showReassignmentModal, setShowReassignmentModal] = useState(false)
  const [showAnswerModal, setShowAnswerModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showInfoSuccessModal, setShowInfoSuccessModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  
  // 배정/재배정 모달 상태
  const [assignmentDepartment, setAssignmentDepartment] = useState('')
  const [assignmentTechnician, setAssignmentTechnician] = useState('')
  const [assignmentOpinion, setAssignmentOpinion] = useState('')
  const [serviceType, setServiceType] = useState('요청')

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    const today = new Date()
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(today.getDate() - 7)
    
    const todayString = today.toISOString().split('T')[0]
    const oneWeekAgoString = oneWeekAgo.toISOString().split('T')[0]
    
    setServiceRequestStartDate(oneWeekAgoString)
    setServiceRequestEndDate(todayString)
    setInquiryStartDate(oneWeekAgoString)
    setInquiryEndDate(todayString)
    
    // 샘플 데이터 로드
    loadSampleData()
  }, [])

  // 샘플 데이터 로드
  const loadSampleData = () => {
    // 서비스 신청 샘플 데이터
    setServiceRequests([
      {
        id: '1',
        requestNumber: 'SR-20250831-009',
        title: '네트워크 연결 문제',
        status: '접수',
        currentStatus: '메시지창',
        requestDate: '2025.08.31 13:00',
        requester: '이영희',
        department: '생산부',
        stage: '접수',
        content: '사무실에서 인터넷 연결이 자주 끊어지는 문제가 발생하고 있습니다.',
        contact: '010-9870-1234',
        location: '제1공장 생산본부 사무실'
      },
      {
        id: '2',
        requestNumber: 'SR-20250831-008',
        title: '프린터 드라이버 업데이트',
        status: '재배정',
        currentStatus: '기타상태',
        requestDate: '2025.08.31 11:30',
        requester: '박달자',
        department: '운송부',
        stage: '재배정',
        assignTime: '11:40',
        assignee: '홍기술',
        assigneeDepartment: 'IT팀',
        content: '프린터 드라이버 업데이트가 필요합니다.',
        contact: '010-9870-5678',
        location: '제2공장 운송부 사무실'
      },
      {
        id: '3',
        requestNumber: 'SR-20250831-007',
        title: '모니터 전원 불량',
        status: '배정',
        currentStatus: '부분불능',
        requestDate: '2025.08.31 11:00',
        requester: '김영자',
        department: '운영팀',
        stage: '배정',
        assignTime: '11:10',
        assignee: '김기술',
        assigneeDepartment: '운영팀',
        content: '모니터 전원이 켜지지 않습니다.',
        contact: '010-9870-9012',
        location: '본사 운영팀 사무실'
      },
      {
        id: '4',
        requestNumber: 'SR-20250831-006',
        title: '이메일 첨부파일 다운로드 문제',
        status: '확인',
        currentStatus: '정상작동',
        requestDate: '2025.08.31 10:30',
        requester: '김철수',
        department: '관리부',
        stage: '확인',
        assignTime: '10:40',
        assignee: '김기술',
        assigneeDepartment: '운영팀',
        content: '이메일 첨부파일을 다운로드할 수 없습니다.',
        contact: '010-9870-3456',
        location: '본사 관리부 사무실'
      },
      {
        id: '5',
        requestNumber: 'SR-20250831-005',
        title: 'VPN 접속 불가',
        status: '작업',
        currentStatus: '점검요청',
        requestDate: '2025.08.31 10:00',
        requester: '이영희',
        department: '생산부',
        stage: '작업',
        assignTime: '10:10',
        assignee: '김기술',
        assigneeDepartment: '운영팀',
        content: 'VPN 접속이 되지 않아 원격 업무가 불가능합니다.',
        contact: '010-9870-1234',
        location: '제1공장 생산본부 사무실'
      },
      {
        id: '6',
        requestNumber: 'SR-20250831-004',
        title: '마우스 불량',
        status: '접수',
        currentStatus: '오류발생',
        requestDate: '2025.08.31 09:30',
        requester: '정수진',
        department: '재무부',
        stage: '접수',
        content: '마우스가 제대로 작동하지 않습니다.',
        contact: '010-9870-7890',
        location: '본사 재무부 사무실'
      },
      {
        id: '7',
        requestNumber: 'SR-20250831-003',
        title: '키보드 키 불량',
        status: '배정',
        currentStatus: '부분불능',
        requestDate: '2025.08.31 09:00',
        requester: '최영희',
        department: '마케팅부',
        stage: '배정',
        assignTime: '09:10',
        assignee: '박기술',
        assigneeDepartment: 'IT팀',
        content: '키보드의 일부 키가 작동하지 않습니다.',
        contact: '010-9870-2468',
        location: '본사 마케팅부 사무실'
      },
      {
        id: '8',
        requestNumber: 'SR-20250831-002',
        title: '소프트웨어 설치 요청',
        status: '확인',
        currentStatus: '정상작동',
        requestDate: '2025.08.31 08:30',
        requester: '박민수',
        department: '인사부',
        stage: '확인',
        assignTime: '08:40',
        assignee: '이기술',
        assigneeDepartment: '개발팀',
        content: '새로운 소프트웨어 설치가 필요합니다.',
        contact: '010-9870-1357',
        location: '본사 인사부 사무실'
      },
      {
        id: '9',
        requestNumber: 'SR-20250831-001',
        title: '시스템 속도 개선',
        status: '작업',
        currentStatus: '점검요청',
        requestDate: '2025.08.31 08:00',
        requester: '김사용',
        department: '영업부',
        stage: '작업',
        assignTime: '08:10',
        assignee: '정기술',
        assigneeDepartment: '운영팀',
        content: '시스템이 느려서 업무에 지장이 있습니다.',
        contact: '010-9870-9753',
        location: '본사 영업부 사무실'
      },
      {
        id: '10',
        requestNumber: 'SR-20250830-015',
        title: '데이터베이스 백업',
        status: '완료',
        currentStatus: '정상작동',
        requestDate: '2025.08.30 17:00',
        requester: '이관리',
        department: '관리부',
        stage: '완료',
        assignTime: '17:10',
        assignee: '송기술',
        assigneeDepartment: '운영팀',
        content: '데이터베이스 백업 작업이 필요합니다.',
        contact: '010-9870-8642',
        location: '본사 관리부 사무실'
      },
      {
        id: '11',
        requestNumber: 'SR-20250830-014',
        title: '보안 프로그램 업데이트',
        status: '접수',
        currentStatus: '메시지창',
        requestDate: '2025.08.30 16:30',
        requester: '박보안',
        department: '보안팀',
        stage: '접수',
        content: '보안 프로그램 업데이트가 필요합니다.',
        contact: '010-9870-7531',
        location: '본사 보안팀 사무실'
      },
      {
        id: '12',
        requestNumber: 'SR-20250830-013',
        title: '서버 점검 요청',
        status: '배정',
        currentStatus: '부분불능',
        requestDate: '2025.08.30 15:00',
        requester: '김서버',
        department: '운영팀',
        stage: '배정',
        assignTime: '15:10',
        assignee: '한기술',
        assigneeDepartment: '개발팀',
        content: '서버 상태 점검이 필요합니다.',
        contact: '010-9870-6420',
        location: '본사 운영팀 사무실'
      },
      {
        id: '13',
        requestNumber: 'SR-20250830-012',
        title: '네트워크 속도 개선',
        status: '확인',
        currentStatus: '정상작동',
        requestDate: '2025.08.30 14:00',
        requester: '이네트워크',
        department: 'IT팀',
        stage: '확인',
        assignTime: '14:10',
        assignee: '윤기술',
        assigneeDepartment: 'IT팀',
        content: '네트워크 속도가 느려서 개선이 필요합니다.',
        contact: '010-9870-5319',
        location: '본사 IT팀 사무실'
      },
      {
        id: '14',
        requestNumber: 'SR-20250830-011',
        title: '프린터 용지 걸림',
        status: '작업',
        currentStatus: '점검요청',
        requestDate: '2025.08.30 13:00',
        requester: '정프린터',
        department: '생산부',
        stage: '작업',
        assignTime: '13:10',
        assignee: '강기술',
        assigneeDepartment: '개발팀',
        content: '프린터에서 용지가 자주 걸립니다.',
        contact: '010-9870-4208',
        location: '제1공장 생산본부 사무실'
      },
      {
        id: '15',
        requestNumber: 'SR-20250830-010',
        title: '모니터 화면 깜빡임',
        status: '재배정',
        currentStatus: '기타상태',
        requestDate: '2025.08.30 12:00',
        requester: '최모니터',
        department: '운송부',
        stage: '재배정',
        assignTime: '12:10',
        assignee: '김기술',
        assigneeDepartment: '운영팀',
        content: '모니터 화면이 자주 깜빡입니다.',
        contact: '010-9870-3197',
        location: '제2공장 운송부 사무실'
      }
    ])

    // 일반 문의 샘플 데이터
    setInquiries([
      {
        id: '1',
        inquiryDate: '2025.08.31 14:00',
        content: '모니터 전원 문의',
        inquirer: '홍길순',
        answerDate: '2025.08.01 13:00',
        isLocked: true
      },
      {
        id: '2',
        inquiryDate: '2025.08.31 13:00',
        content: '네트워크 문의',
        inquirer: '김영자'
      },
      {
        id: '3',
        inquiryDate: '2025.08.31 12:00',
        content: '프린터 드라이버 업데이트',
        inquirer: '이영희'
      },
      {
        id: '4',
        inquiryDate: '2025.08.31 11:00',
        content: '이메일 문의',
        inquirer: '박달자'
      },
      {
        id: '5',
        inquiryDate: '2025.08.31 10:00',
        content: 'VPN 접속 문제 문의',
        inquirer: '정민수'
      },
      {
        id: '6',
        inquiryDate: '2025.08.31 09:30',
        content: '마우스 작동 불량 문의',
        inquirer: '정수진',
        answerDate: '2025.08.31 10:00',
        isLocked: false
      },
      {
        id: '7',
        inquiryDate: '2025.08.31 09:00',
        content: '키보드 키 불량 문의',
        inquirer: '최영희'
      },
      {
        id: '8',
        inquiryDate: '2025.08.31 08:30',
        content: '소프트웨어 설치 문의',
        inquirer: '박민수',
        answerDate: '2025.08.31 09:00',
        isLocked: false
      },
      {
        id: '9',
        inquiryDate: '2025.08.31 08:00',
        content: '시스템 속도 개선 문의',
        inquirer: '김사용'
      },
      {
        id: '10',
        inquiryDate: '2025.08.30 17:00',
        content: '데이터베이스 백업 문의',
        inquirer: '이관리',
        answerDate: '2025.08.30 18:00',
        isLocked: false
      },
      {
        id: '11',
        inquiryDate: '2025.08.30 16:30',
        content: '보안 프로그램 업데이트 문의',
        inquirer: '박보안'
      },
      {
        id: '12',
        inquiryDate: '2025.08.30 15:00',
        content: '서버 점검 문의',
        inquirer: '김서버',
        answerDate: '2025.08.30 16:00',
        isLocked: false
      },
      {
        id: '13',
        inquiryDate: '2025.08.30 14:00',
        content: '네트워크 속도 개선 문의',
        inquirer: '이네트워크'
      },
      {
        id: '14',
        inquiryDate: '2025.08.30 13:00',
        content: '프린터 용지 걸림 문의',
        inquirer: '정프린터',
        answerDate: '2025.08.30 14:00',
        isLocked: false
      },
      {
        id: '15',
        inquiryDate: '2025.08.30 12:00',
        content: '모니터 화면 깜빡임 문의',
        inquirer: '최모니터'
      }
    ])

    // 조치담당자 샘플 데이터
    setTechnicians([
      {
        id: '1',
        name: '김기술',
        department: '운영팀',
        isWorking: true,
        assignedCount: 5
      },
      {
        id: '2',
        name: '박기술',
        department: 'IT팀',
        isWorking: true,
        assignedCount: 10
      },
      {
        id: '3',
        name: '홍기술',
        department: 'IT팀',
        isWorking: false,
        assignedCount: 0
      },
      {
        id: '4',
        name: '이기술',
        department: '개발팀',
        isWorking: true,
        assignedCount: 3
      },
      {
        id: '5',
        name: '정기술',
        department: '운영팀',
        isWorking: true,
        assignedCount: 7
      },
      {
        id: '6',
        name: '최기술',
        department: 'IT팀',
        isWorking: false,
        assignedCount: 2
      },
      {
        id: '7',
        name: '한기술',
        department: '개발팀',
        isWorking: true,
        assignedCount: 4
      },
      {
        id: '8',
        name: '송기술',
        department: '운영팀',
        isWorking: true,
        assignedCount: 8
      },
      {
        id: '9',
        name: '윤기술',
        department: 'IT팀',
        isWorking: false,
        assignedCount: 1
      },
      {
        id: '10',
        name: '강기술',
        department: '개발팀',
        isWorking: true,
        assignedCount: 6
      },
      {
        id: '11',
        name: '서기술',
        department: '운영팀',
        isWorking: true,
        assignedCount: 9
      },
      {
        id: '12',
        name: '임기술',
        department: 'IT팀',
        isWorking: false,
        assignedCount: 3
      },
      {
        id: '13',
        name: '오기술',
        department: '개발팀',
        isWorking: true,
        assignedCount: 2
      },
      {
        id: '14',
        name: '신기술',
        department: '운영팀',
        isWorking: true,
        assignedCount: 11
      },
      {
        id: '15',
        name: '배기술',
        department: 'IT팀',
        isWorking: false,
        assignedCount: 0
      },
      {
        id: '16',
        name: '송기술',
        department: '개발팀',
        isWorking: true,
        assignedCount: 7
      },
      {
        id: '17',
        name: '노기술',
        department: '운영팀',
        isWorking: true,
        assignedCount: 4
      },
      {
        id: '18',
        name: '문기술',
        department: 'IT팀',
        isWorking: false,
        assignedCount: 2
      },
      {
        id: '19',
        name: '양기술',
        department: '개발팀',
        isWorking: true,
        assignedCount: 8
      },
      {
        id: '20',
        name: '백기술',
        department: '운영팀',
        isWorking: true,
        assignedCount: 5
      },
      {
        id: '21',
        name: '남기술',
        department: 'IT팀',
        isWorking: false,
        assignedCount: 1
      },
      {
        id: '22',
        name: '심기술',
        department: '개발팀',
        isWorking: true,
        assignedCount: 6
      }
    ])

    // 작업미결 샘플 데이터
    setPendingWorks([
      {
        id: '1',
        technician: '김기술',
        lastWeekPending: 0,
        longTermPending: 1
      },
      {
        id: '2',
        technician: '박기술',
        lastWeekPending: 1,
        longTermPending: 2
      },
      {
        id: '3',
        technician: '홍기술',
        lastWeekPending: 0,
        longTermPending: 1
      },
      {
        id: '4',
        technician: '이기술',
        lastWeekPending: 2,
        longTermPending: 0
      },
      {
        id: '5',
        technician: '정기술',
        lastWeekPending: 1,
        longTermPending: 3
      },
      {
        id: '6',
        technician: '최기술',
        lastWeekPending: 0,
        longTermPending: 2
      },
      {
        id: '7',
        technician: '한기술',
        lastWeekPending: 3,
        longTermPending: 1
      },
      {
        id: '8',
        technician: '송기술',
        lastWeekPending: 1,
        longTermPending: 0
      },
      {
        id: '9',
        technician: '윤기술',
        lastWeekPending: 0,
        longTermPending: 4
      },
      {
        id: '10',
        technician: '강기술',
        lastWeekPending: 2,
        longTermPending: 1
      },
      {
        id: '11',
        technician: '서기술',
        lastWeekPending: 0,
        longTermPending: 3
      },
      {
        id: '12',
        technician: '임기술',
        lastWeekPending: 1,
        longTermPending: 2
      },
      {
        id: '13',
        technician: '오기술',
        lastWeekPending: 2,
        longTermPending: 0
      },
      {
        id: '14',
        technician: '신기술',
        lastWeekPending: 0,
        longTermPending: 1
      },
      {
        id: '15',
        technician: '배기술',
        lastWeekPending: 3,
        longTermPending: 2
      },
      {
        id: '16',
        technician: '송기술',
        lastWeekPending: 1,
        longTermPending: 0
      },
      {
        id: '17',
        technician: '노기술',
        lastWeekPending: 0,
        longTermPending: 4
      },
      {
        id: '18',
        technician: '문기술',
        lastWeekPending: 2,
        longTermPending: 1
      },
      {
        id: '19',
        technician: '양기술',
        lastWeekPending: 1,
        longTermPending: 3
      },
      {
        id: '20',
        technician: '백기술',
        lastWeekPending: 0,
        longTermPending: 2
      },
      {
        id: '21',
        technician: '남기술',
        lastWeekPending: 1,
        longTermPending: 0
      },
      {
        id: '22',
        technician: '심기술',
        lastWeekPending: 2,
        longTermPending: 1
      }
    ])
  }

  // 로그아웃 함수
  const handleLogout = () => {
    router.push('/')
  }

  // 새로고침 함수들
  const handleServiceRequestRefresh = () => {
    setServiceRequestPage(1)
    const today = new Date()
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(today.getDate() - 7)
    
    const todayString = today.toISOString().split('T')[0]
    const oneWeekAgoString = oneWeekAgo.toISOString().split('T')[0]
    
    setServiceRequestStartDate(oneWeekAgoString)
    setServiceRequestEndDate(todayString)
    loadSampleData()
  }

  const handleInquiryRefresh = () => {
    setInquiryPage(1)
    const today = new Date()
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(today.getDate() - 7)
    
    const todayString = today.toISOString().split('T')[0]
    const oneWeekAgoString = oneWeekAgo.toISOString().split('T')[0]
    
    setInquiryStartDate(oneWeekAgoString)
    setInquiryEndDate(todayString)
    loadSampleData()
  }

  const handleTechnicianRefresh = () => {
    setTechnicianPage(1)
    setSelectedDepartment('')
    loadSampleData()
  }

  const handlePendingWorkRefresh = () => {
    setPendingWorkPage(1)
    setSelectedPendingDepartment('')
    loadSampleData()
  }

  // 모달 핸들러들
  const handleAssignment = (request: ServiceRequest) => {
    setSelectedRequest(request)
    setShowAssignmentModal(true)
  }

  const handleReassignment = (request: ServiceRequest) => {
    setSelectedRequest(request)
    setShowReassignmentModal(true)
  }

  const handleAnswer = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry)
    setShowAnswerModal(true)
  }

  const handleInfoChange = () => {
    setShowInfoModal(true)
  }

  const closeModal = () => {
    setShowAssignmentModal(false)
    setShowReassignmentModal(false)
    setShowAnswerModal(false)
    setShowInfoModal(false)
    setSelectedRequest(null)
    setSelectedInquiry(null)
    setAssignmentDepartment('')
    setAssignmentTechnician('')
    setAssignmentOpinion('')
    setServiceType('요청')
  }

  // 선택된 부서에 따른 조치담당자 필터링
  const getFilteredTechnicians = () => {
    if (!assignmentDepartment) return []
    return technicians.filter(technician => technician.department === assignmentDepartment)
  }

  // 필터링된 데이터
  const filteredServiceRequests = serviceRequests.filter(request => {
    // 미 배정만 조회 필터
    if (showUnassignedOnly && !['접수', '재배정'].includes(request.stage)) {
      return false
    }
    
    // 날짜 필터링
    if (serviceRequestStartDate && serviceRequestEndDate) {
      // 날짜 형식 변환 (YYYY-MM-DD -> YYYY.MM.DD)
      const requestDate = request.requestDate.split(' ')[0].replace(/\./g, '-')
      const startDateFormatted = serviceRequestStartDate
      const endDateFormatted = serviceRequestEndDate
      
      if (requestDate < startDateFormatted || requestDate > endDateFormatted) {
        return false
      }
    }
    
    return true
  })

  const filteredInquiries = inquiries.filter(inquiry => {
    // 미 답변만 조회 필터
    if (showUnansweredOnly && inquiry.answerDate) {
      return false
    }
    
    // 날짜 필터링
    if (inquiryStartDate && inquiryEndDate) {
      // 날짜 형식 변환 (YYYY-MM-DD -> YYYY.MM.DD)
      const inquiryDate = inquiry.inquiryDate.split(' ')[0].replace(/\./g, '-')
      const startDateFormatted = inquiryStartDate
      const endDateFormatted = inquiryEndDate
      
      if (inquiryDate < startDateFormatted || inquiryDate > endDateFormatted) {
        return false
      }
    }
    
    return true
  })

  const filteredTechnicians = technicians.filter(technician => {
    if (selectedDepartment && technician.department !== selectedDepartment) {
      return false
    }
    return true
  })

  // 페이지 범위 안전장치
  const maxTechnicianPage = Math.ceil(filteredTechnicians.length / 10)
  const safeTechnicianPage = Math.min(technicianPage, Math.max(1, maxTechnicianPage))

  const filteredPendingWorks = pendingWorks.filter(work => {
    if (selectedPendingDepartment) {
      const technician = technicians.find(t => t.name === work.technician)
      if (technician && technician.department !== selectedPendingDepartment) {
        return false
      }
    }
    return true
  })

  // 페이지 범위 안전장치
  const maxPendingWorkPage = Math.ceil(filteredPendingWorks.length / 10)
  const safePendingWorkPage = Math.min(pendingWorkPage, Math.max(1, maxPendingWorkPage))

  return (
    <div className="h-screen relative overflow-hidden">
      {/* 배경 이미지 */}
      <div 
        className="absolute inset-0 bg-no-repeat bg-cover"
        style={{
          backgroundImage: `url('/image/배경_배정담당자_페이지.jpg')`
        }}
      />
      
      {/* 배경 오버레이 */}
      <div className="fixed inset-0 bg-black/40" />

      {/* 헤더 */}
      <div className="relative z-20">
        <div className="flex justify-between items-center p-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Icon name="laptop" size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">IT Service Management</h1>
              <p className="text-gray-300 text-sm">통합 IT 서비스 관리 시스템</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* 실시간 업데이트 토글 */}
            <div className="flex items-center space-x-2">
              <span className="text-white text-sm">실시간 업데이트</span>
              <button
                onClick={() => setRealTimeUpdate(!realTimeUpdate)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  realTimeUpdate ? 'bg-green-500' : 'bg-gray-400'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  realTimeUpdate ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-out"
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* 사용자 정보 및 네비게이션 */}
        <div className="max-w-7xl mx-auto px-6 py-6 w-full">
          <div className="flex items-center justify-between mb-12">
            <div className="px-20 py-0 rounded-full -ml-72 smooth-hover animate-fade-in shadow-lg" style={{backgroundColor: '#DBFCE7', marginLeft: '-312px'}}>
              <span className="text-green-600 font-medium" style={{fontSize: '14px'}}>배정담당자 (김배정)</span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleInfoChange}
                className="text-white/70 hover:text-white transition-all duration-300 ease-out flex items-center space-x-2 button-smooth"
                style={{position: 'absolute', right: '130px', top: 'calc(50% + 36px)', transform: 'translateY(-50%)'}}
              >
                <Icon name="settings" size={20} className="text-white hover:text-white" />
                <span>정보 변경</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 - 4개 프레임 */}
      <div className="relative z-10 w-full" style={{height: 'calc(100vh - 140px)', marginTop: '-70px'}}>
        
        {/* 좌측: 조치담당자 작업현황 */}
        <div 
          className="absolute bg-white/80 rounded-lg shadow-xl p-4 z-20" 
          style={{
            left: '20px',
            top: '10px',
            width: '300px',
            height: 'calc(100vh - 240px)'
          }}
        >
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <button
                onClick={handleTechnicianRefresh}
                className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Icon name="refresh" size={16} />
              </button>
              <h3 className="text-lg font-bold text-gray-800">조치담당자 작업현황</h3>
            </div>
            <div className="flex justify-end" style={{marginTop: '30px'}}>
              <button
                onClick={() => setShowTechnicianStatus(!showTechnicianStatus)}
                className={`w-8 h-4 rounded-full transition-colors ${
                  showTechnicianStatus ? 'bg-green-500' : 'bg-gray-400'
                }`}
              >
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                  showTechnicianStatus ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>

          {showTechnicianStatus && (
            <>
              {/* 부서 선택 */}
              <div className="mb-4">
                <select
                  value={selectedDepartment}
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value)
                    setTechnicianPage(1)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">전체 부서</option>
                  <option value="IT팀">IT팀</option>
                  <option value="운영팀">운영팀</option>
                </select>
              </div>

              {/* 현재 시간 */}
              <div className="text-sm text-gray-600 mb-4">
                2025.08.31 18:00 현재
              </div>

              {/* 조치담당자 테이블 */}
              <div className="overflow-x-auto overflow-y-auto" style={{height: 'calc(100vh - 360px)'}}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-2 py-1.5 text-center font-semibold text-gray-700">조치담당자</th>
                      <th className="px-2 py-1.5 text-center font-semibold text-gray-700">작업</th>
                      <th className="px-2 py-1.5 text-center font-semibold text-gray-700">배정건수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTechnicians.slice((safeTechnicianPage - 1) * 10, safeTechnicianPage * 10).map((technician) => (
                      <tr key={technician.id} className="border-b border-gray-100">
                        <td className="px-2 py-1 text-center text-gray-800">{technician.name}</td>
                        <td className="px-2 py-1 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            technician.isWorking ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {technician.isWorking ? 'Y' : 'N'}
                          </span>
                        </td>
                        <td className="px-2 py-1 text-center text-gray-800">{technician.assignedCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 페이지네이션 */}
              {filteredTechnicians.length > 0 && maxTechnicianPage > 1 && (
                <div className="flex justify-center" style={{marginTop: '-120px'}}>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setTechnicianPage(Math.max(1, technicianPage - 1))}
                      disabled={technicianPage === 1}
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      이전
                    </button>
                    <span className="px-2 py-1 bg-blue-500 text-white rounded text-xs">
                      {safeTechnicianPage}/{maxTechnicianPage}
                    </span>
                    <button 
                      onClick={() => setTechnicianPage(Math.min(maxTechnicianPage, technicianPage + 1))}
                      disabled={technicianPage >= maxTechnicianPage}
                      className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      다음
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* 중앙: 서비스신청현황 */}
        <div 
          className="absolute bg-white/80 rounded-lg shadow-xl p-4 z-20" 
          style={{
            left: '347px',
            top: '10px',
            width: '1218px',
            height: 'calc(50vh - 130px)'
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleServiceRequestRefresh}
                className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Icon name="refresh" size={16} />
              </button>
              <h3 className="text-lg font-bold text-gray-800">서비스신청현황</h3>
            </div>
          </div>

          {/* 검색 조건 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <input
                type="date"
                value={serviceRequestStartDate}
                onChange={(e) => setServiceRequestStartDate(e.target.value)}
                className="px-3 py-2 border-2 border-gray-400 rounded-lg text-sm font-medium bg-white shadow-sm focus:border-blue-500 focus:outline-none"
              />
              <span className="text-gray-600 font-medium">~</span>
              <input
                type="date"
                value={serviceRequestEndDate}
                onChange={(e) => setServiceRequestEndDate(e.target.value)}
                className="px-3 py-2 border-2 border-gray-400 rounded-lg text-sm font-medium bg-white shadow-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">미 배정만 조회</span>
              <button
                onClick={() => setShowUnassignedOnly(!showUnassignedOnly)}
                className={`w-8 h-4 rounded-full transition-colors ${
                  showUnassignedOnly ? 'bg-green-500' : 'bg-gray-400'
                }`}
              >
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                  showUnassignedOnly ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>

          {/* 서비스신청 테이블 */}
          <div className="overflow-x-auto overflow-y-auto" style={{height: 'calc(50vh - 240px)'}}>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-2 py-1.5 text-center font-semibold text-gray-700">신청번호</th>
                  <th className="px-2 py-1.5 text-center font-semibold text-gray-700">신청일시</th>
                  <th className="px-2 py-1.5 text-center font-semibold text-gray-700">신청제목</th>
                  <th className="px-2 py-1.5 text-center font-semibold text-gray-700">현재상태</th>
                  <th className="px-2 py-1.5 text-center font-semibold text-gray-700">신청자</th>
                  <th className="px-2 py-1.5 text-center font-semibold text-gray-700">신청소속</th>
                  <th className="px-2 py-1.5 text-center font-semibold text-gray-700">단계</th>
                  <th className="px-2 py-1.5 text-center font-semibold text-gray-700">배정시간</th>
                  <th className="px-2 py-1.5 text-center font-semibold text-gray-700">조치자</th>
                  <th className="px-2 py-1.5 text-center font-semibold text-gray-700">조치소속</th>
                  <th className="px-2 py-1.5 text-center font-semibold text-gray-700">관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredServiceRequests.slice((serviceRequestPage - 1) * 5, serviceRequestPage * 5).map((request) => (
                  <tr key={request.id} className="border-b border-gray-100 hover:bg-blue-50">
                    <td className="px-2 py-1 text-center text-blue-600 font-medium">{request.requestNumber}</td>
                    <td className="px-2 py-1 text-center text-gray-800">{request.requestDate.split(' ')[1]}</td>
                    <td className="px-2 py-1 text-gray-800 max-w-xs truncate" title={request.title}>
                      {request.title}
                    </td>
                    <td className="px-2 py-1 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        request.currentStatus === '정상작동' ? 'bg-green-100 text-green-800' :
                        request.currentStatus === '오류발생' ? 'bg-red-100 text-red-800' :
                        request.currentStatus === '부분불능' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {request.currentStatus}
                      </span>
                    </td>
                    <td className="px-2 py-1 text-center text-gray-800">{request.requester}</td>
                    <td className="px-2 py-1 text-center text-gray-800">{request.department}</td>
                    <td className="px-2 py-1 text-center">
                      {request.stage === '접수' && <Icon name="check-circle" size={16} className="text-green-500 mx-auto" />}
                      {request.stage === '재배정' && <Icon name="refresh" size={16} className="text-orange-500 mx-auto" />}
                      {request.stage === '배정' && <Icon name="user" size={16} className="text-blue-500 mx-auto" />}
                      {request.stage === '확인' && <Icon name="eye" size={16} className="text-purple-500 mx-auto" />}
                      {request.stage === '작업' && <Icon name="settings" size={16} className="text-indigo-500 mx-auto" />}
                    </td>
                    <td className="px-2 py-1 text-center text-gray-800">{request.assignTime || '-'}</td>
                    <td className="px-2 py-1 text-center text-gray-800">{request.assignee || '-'}</td>
                    <td className="px-2 py-1 text-center text-gray-800">{request.assigneeDepartment || '-'}</td>
                    <td className="px-2 py-1 text-center">
                      {request.stage === '접수' && (
                        <button
                          onClick={() => handleAssignment(request)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                        >
                          배정작업
                        </button>
                      )}
                      {request.stage === '재배정' && (
                        <button
                          onClick={() => handleReassignment(request)}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded text-xs"
                        >
                          재배정작업
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {filteredServiceRequests.length > 0 && Math.ceil(filteredServiceRequests.length / 5) > 1 && (
            <div className="flex justify-center" style={{marginTop: '-41px'}}>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setServiceRequestPage(Math.max(1, serviceRequestPage - 1))}
                  disabled={serviceRequestPage === 1}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  이전
                </button>
                <span className="px-2 py-1 bg-blue-500 text-white rounded text-xs">
                  {serviceRequestPage}/{Math.ceil(filteredServiceRequests.length / 5)}
                </span>
                <button 
                  onClick={() => setServiceRequestPage(Math.min(Math.ceil(filteredServiceRequests.length / 5), serviceRequestPage + 1))}
                  disabled={serviceRequestPage >= Math.ceil(filteredServiceRequests.length / 5)}
                  className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 우측: 작업미결현황 */}
        <div 
          className="absolute bg-white/80 rounded-lg shadow-xl p-4 z-20" 
          style={{
            left: '1595px',
            top: '10px',
            width: '300px',
            height: 'calc(100vh - 240px)'
          }}
        >
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <button
                onClick={handlePendingWorkRefresh}
                className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Icon name="refresh" size={16} />
              </button>
              <h3 className="text-lg font-bold text-gray-800">작업미결현황</h3>
            </div>
            <div className="flex justify-end" style={{marginTop: '30px'}}>
              <button
                onClick={() => setShowPendingWork(!showPendingWork)}
                className={`w-8 h-4 rounded-full transition-colors ${
                  showPendingWork ? 'bg-green-500' : 'bg-gray-400'
                }`}
              >
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                  showPendingWork ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>

          {showPendingWork && (
            <>
              {/* 부서 선택 */}
              <div className="mb-4">
                <select
                  value={selectedPendingDepartment}
                  onChange={(e) => {
                    setSelectedPendingDepartment(e.target.value)
                    setPendingWorkPage(1)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">전체 부서</option>
                  <option value="IT팀">IT팀</option>
                  <option value="운영팀">운영팀</option>
                </select>
              </div>

              {/* 작업미결 테이블 */}
              <div className="overflow-x-auto overflow-y-auto" style={{height: 'calc(100vh - 360px)'}}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-2 py-1.5 text-center font-semibold text-gray-700">조치담당자</th>
                      <th className="px-2 py-1.5 text-center font-semibold text-gray-700">전주미결</th>
                      <th className="px-2 py-1.5 text-center font-semibold text-gray-700">장기미결</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPendingWorks.slice((safePendingWorkPage - 1) * 10, safePendingWorkPage * 10).map((work) => (
                      <tr key={work.id} className="border-b border-gray-100">
                        <td className="px-2 py-1 text-center text-gray-800">{work.technician}</td>
                        <td className="px-2 py-1 text-center text-gray-800">{work.lastWeekPending}</td>
                        <td className="px-2 py-1 text-center text-gray-800">{work.longTermPending}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 페이지네이션 */}
              {filteredPendingWorks.length > 0 && maxPendingWorkPage > 1 && (
                <div className="flex justify-center" style={{marginTop: '-84px'}}>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setPendingWorkPage(Math.max(1, pendingWorkPage - 1))}
                      disabled={pendingWorkPage === 1}
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      이전
                    </button>
                    <span className="px-2 py-1 bg-blue-500 text-white rounded text-xs">
                      {safePendingWorkPage}/{maxPendingWorkPage}
                    </span>
                    <button 
                      onClick={() => setPendingWorkPage(Math.min(maxPendingWorkPage, pendingWorkPage + 1))}
                      disabled={pendingWorkPage >= maxPendingWorkPage}
                      className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      다음
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* 하단: 일반문의답변현황 */}
        <div 
          className="absolute bg-white/80 rounded-lg shadow-xl p-4 z-20" 
          style={{
            left: '347px',
            top: 'calc(50vh - 110px)',
            width: '1218px',
            height: 'calc(50vh - 120px)'
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleInquiryRefresh}
                className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Icon name="refresh" size={16} />
              </button>
              <h3 className="text-lg font-bold text-gray-800">일반문의답변현황</h3>
            </div>
          </div>

          {/* 검색 조건 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <input
                type="date"
                value={inquiryStartDate}
                onChange={(e) => setInquiryStartDate(e.target.value)}
                className="px-3 py-2 border-2 border-gray-400 rounded-lg text-sm font-medium bg-white shadow-sm focus:border-blue-500 focus:outline-none"
              />
              <span className="text-gray-600 font-medium">~</span>
              <input
                type="date"
                value={inquiryEndDate}
                onChange={(e) => setInquiryEndDate(e.target.value)}
                className="px-3 py-2 border-2 border-gray-400 rounded-lg text-sm font-medium bg-white shadow-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">미 답변만 조회</span>
              <button
                onClick={() => setShowUnansweredOnly(!showUnansweredOnly)}
                className={`w-8 h-4 rounded-full transition-colors ${
                  showUnansweredOnly ? 'bg-green-500' : 'bg-gray-400'
                }`}
              >
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                  showUnansweredOnly ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>

          {/* 일반문의 테이블 */}
          <div className="overflow-x-auto overflow-y-auto" style={{height: 'calc(50vh - 230px)'}}>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-2 py-1.5 text-center font-semibold text-gray-700">문의일시</th>
                  <th className="px-2 py-1.5 text-center font-semibold text-gray-700">문의내용</th>
                  <th className="px-2 py-1.5 text-center font-semibold text-gray-700">문의자</th>
                  <th className="px-2 py-1.5 text-center font-semibold text-gray-700">답변일시</th>
                  <th className="px-2 py-1.5 text-center font-semibold text-gray-700">관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredInquiries.slice((inquiryPage - 1) * 5, inquiryPage * 5).map((inquiry) => (
                  <tr key={inquiry.id} className="border-b border-gray-100 hover:bg-blue-50">
                    <td className="px-2 py-1 text-center text-gray-800">{inquiry.inquiryDate}</td>
                    <td className="px-2 py-1 text-gray-800 max-w-xs truncate" title={inquiry.content}>
                      {inquiry.content}
                    </td>
                    <td className="px-2 py-1 text-center text-gray-800">{inquiry.inquirer}</td>
                    <td className="px-2 py-1 text-center text-gray-800">{inquiry.answerDate || '-'}</td>
                    <td className="px-2 py-1 text-center">
                      {inquiry.isLocked ? (
                        <Icon name="lock" size={16} className="text-gray-400 mx-auto" />
                      ) : inquiry.answerDate ? (
                        <button
                          onClick={() => handleAnswer(inquiry)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                        >
                          답변하기
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAnswer(inquiry)}
                          className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                        >
                          답변하기
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {filteredInquiries.length > 0 && Math.ceil(filteredInquiries.length / 5) > 1 && (
            <div className="flex justify-center" style={{marginTop: '-39px'}}>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setInquiryPage(Math.max(1, inquiryPage - 1))}
                  disabled={inquiryPage === 1}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  이전
                </button>
                <span className="px-2 py-1 bg-blue-500 text-white rounded text-xs">
                  {inquiryPage}/{Math.ceil(filteredInquiries.length / 5)}
                </span>
                <button 
                  onClick={() => setInquiryPage(Math.min(Math.ceil(filteredInquiries.length / 5), inquiryPage + 1))}
                  disabled={inquiryPage >= Math.ceil(filteredInquiries.length / 5)}
                  className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="absolute text-center" style={{bottom: '47px', left: '20px', right: '20px'}}>
          <span className="text-sm text-gray-400">
            © 2025 IT 서비스 관리 시스템. 모든 권리는 Juss 가 보유
          </span>
        </div>
      </div>

      {/* 배정작업 모달 */}
      {showAssignmentModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="user" size={24} className="mr-2" />
                배정작업
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="py-4 px-6">
              <div className="grid grid-cols-2 gap-6">
                {/* 서비스신청정보 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="user" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">서비스신청정보</h3>
                  </div>
                  
                  <div className="space-y-0">
                    <div>
                      <span className="text-sm font-medium text-gray-600">신청번호: </span>
                      <span className="text-sm font-bold text-red-600">{selectedRequest.requestNumber}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">신청제목: </span>
                      <span className="text-sm">{selectedRequest.title}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">신청내용: </span>
                      <div className="text-sm mt-1 p-2 bg-gray-50 rounded text-gray-700">
                        {selectedRequest.content}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="user" size={14} className="mr-1" />
                        신청자: 
                      </span>
                      <span className="text-sm ml-5">{selectedRequest.requester} ({selectedRequest.department})</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="mail" size={14} className="mr-1" />
                        신청연락처: 
                      </span>
                      <span className="text-sm ml-5">{selectedRequest.contact}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="briefcase" size={14} className="mr-1" />
                        신청위치: 
                      </span>
                      <span className="text-sm ml-5">{selectedRequest.location}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="calendar" size={14} className="mr-1" />
                        신청일시: 
                      </span>
                      <span className="text-sm ml-5">{selectedRequest.requestDate}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="message-square" size={14} className="mr-1" />
                        현재상태: 
                      </span>
                      <span className="text-sm ml-5">{selectedRequest.currentStatus}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">실제신청자: </span>
                      <span className="text-sm ml-5">{selectedRequest.actualRequester || selectedRequest.requester}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">실제연락처: </span>
                      <span className="text-sm ml-5">{selectedRequest.actualContact || selectedRequest.contact}</span>
                    </div>
                  </div>
                </div>

                {/* 배정정보 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="settings" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">배정정보</h3>
                  </div>
                  
                  <div className="space-y-0">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">조치담당 소속</label>
                      <select 
                        value={assignmentDepartment}
                        onChange={(e) => {
                          setAssignmentDepartment(e.target.value)
                          setAssignmentTechnician('') // 부서 변경 시 담당자 초기화
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">부서를 선택하세요</option>
                        <option value="IT팀">IT팀</option>
                        <option value="운영팀">운영팀</option>
                        <option value="개발팀">개발팀</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">조치담당자</label>
                      <select 
                        value={assignmentTechnician}
                        onChange={(e) => setAssignmentTechnician(e.target.value)}
                        disabled={!assignmentDepartment}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">담당자를 선택하세요</option>
                        {getFilteredTechnicians().map((technician) => (
                          <option key={technician.id} value={technician.name}>
                            {technician.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">배정의견</label>
                      <textarea 
                        value={assignmentOpinion}
                        onChange={(e) => setAssignmentOpinion(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                        placeholder="배정 담당자 의견"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                        <Icon name="calendar" size={16} className="mr-1" />
                        배정일시(현재)
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm">
                        {new Date().toLocaleString('ko-KR', { 
                          year: 'numeric', 
                          month: '2-digit', 
                          day: '2-digit', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">서비스 조치 유형</label>
                      <select 
                        value={serviceType}
                        onChange={(e) => setServiceType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="요청">요청</option>
                        <option value="장애">장애</option>
                        <option value="변경">변경</option>
                        <option value="문제">문제</option>
                        <option value="적용">적용</option>
                        <option value="구성">구성</option>
                        <option value="자산">자산</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-end py-4 px-6 border-t border-gray-200 space-x-3">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-all duration-200"
              >
                취소
              </button>
              <button
                onClick={() => {
                  // 배정 완료 로직
                  alert('배정이 완료되었습니다.')
                  closeModal()
                }}
                className="px-6 py-2 text-white rounded-lg font-medium transition-all duration-200"
                style={{backgroundColor: '#DBFCE7', color: '#000'}}
              >
                배정하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 재배정작업 모달 */}
      {showReassignmentModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="refresh" size={24} className="mr-2" />
                재배정작업
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="py-4 px-6">
              <div className="grid grid-cols-2 gap-6">
                {/* 서비스신청정보 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="user" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">서비스신청정보</h3>
                  </div>
                  
                  <div className="space-y-0">
                    <div>
                      <span className="text-sm font-medium text-gray-600">신청번호: </span>
                      <span className="text-sm font-bold text-blue-600">{selectedRequest.requestNumber}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">신청제목: </span>
                      <span className="text-sm">{selectedRequest.title}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">신청내용: </span>
                      <div className="text-sm mt-1 p-2 bg-gray-50 rounded text-gray-700">
                        {selectedRequest.content}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="user" size={14} className="mr-1" />
                        신청자: 
                      </span>
                      <span className="text-sm ml-5">{selectedRequest.requester} ({selectedRequest.department})</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="mail" size={14} className="mr-1" />
                        신청연락처: 
                      </span>
                      <span className="text-sm ml-5">{selectedRequest.contact}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="briefcase" size={14} className="mr-1" />
                        신청위치: 
                      </span>
                      <span className="text-sm ml-5">{selectedRequest.location}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="calendar" size={14} className="mr-1" />
                        신청일시: 
                      </span>
                      <span className="text-sm ml-5">{selectedRequest.requestDate}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="message-square" size={14} className="mr-1" />
                        현재상태: 
                      </span>
                      <span className="text-sm ml-5">{selectedRequest.currentStatus}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">실제신청자: </span>
                      <span className="text-sm ml-5">{selectedRequest.actualRequester || selectedRequest.requester}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">실제연락처: </span>
                      <span className="text-sm ml-5">{selectedRequest.actualContact || selectedRequest.contact}</span>
                    </div>
                  </div>
                </div>

                {/* 재배정정보 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="settings" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">재배정정보</h3>
                  </div>
                  
                  <div className="space-y-0">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">조치담당 소속</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">부서를 선택하세요</option>
                        <option value="IT팀">IT팀</option>
                        <option value="운영팀">운영팀</option>
                        <option value="개발팀">개발팀</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">조치담당자</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">담당자를 선택하세요</option>
                        <option value="김기술">김기술</option>
                        <option value="박기술">박기술</option>
                        <option value="홍기술">홍기술</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">재배정의견</label>
                      <textarea 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                        placeholder="배정 담당자 의견"
                      />
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="calendar" size={14} className="mr-1" />
                        재배정일시(현재): 
                      </span>
                      <span className="text-sm ml-5">
                        {new Date().toLocaleString('ko-KR', { 
                          year: 'numeric', 
                          month: '2-digit', 
                          day: '2-digit', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">서비스 조치 유형</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="구성">구성</option>
                        <option value="요청">요청</option>
                        <option value="장애">장애</option>
                        <option value="변경">변경</option>
                        <option value="문제">문제</option>
                        <option value="적용">적용</option>
                        <option value="자산">자산</option>
                      </select>
                    </div>
                    
                    {/* 이전 배정 정보 */}
                    <div className="border-t pt-3 mt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">이전 배정 정보</h4>
                      
                      <div className="space-y-0">
                        <div>
                          <span className="text-xs font-medium text-gray-500">전) 배정일시: </span>
                          <span className="text-xs ml-2">{selectedRequest.assignTime || '2025.08.31 11:40'}</span>
                        </div>
                        
                        <div>
                          <span className="text-xs font-medium text-gray-500">전) 배정담당자: </span>
                          <span className="text-xs ml-2">이배정 (관리팀)</span>
                        </div>
                        
                        <div>
                          <span className="text-xs font-medium text-gray-500">전) 배정의견: </span>
                          <span className="text-xs ml-2">업무에 적합하여 배정</span>
                        </div>
                        
                        <div>
                          <span className="text-xs font-medium text-gray-500">전) 조치담당자: </span>
                          <span className="text-xs ml-2">{selectedRequest.assignee || '홍기술'}</span>
                        </div>
                        
                        <div>
                          <span className="text-xs font-medium text-red-600">반려의견: </span>
                          <span className="text-xs ml-2 text-red-600">금일 휴가 입니다.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-end py-4 px-6 border-t border-gray-200 space-x-3">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-all duration-200"
              >
                취소
              </button>
              <button
                onClick={() => {
                  // 재배정 완료 로직
                  alert('재배정이 완료되었습니다.')
                  closeModal()
                }}
                className="px-6 py-2 text-white rounded-lg font-medium transition-all duration-200"
                style={{backgroundColor: '#DBFCE7', color: '#000'}}
              >
                재배정하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 답변하기 모달 */}
      {showAnswerModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="message-square" size={24} className="mr-2" />
                답변하기
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="py-4 px-6 space-y-4">
              {/* 일반문의사항 정보 */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Icon name="help-circle" size={20} className="text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-800">일반문의사항 정보</h3>
                </div>
                
                <div className="space-y-0">
                  <div>
                    <span className="text-sm font-medium text-gray-600 flex items-center">
                      <Icon name="calendar" size={14} className="mr-1" />
                      문의일시: 
                    </span>
                    <span className="text-sm ml-5">{selectedInquiry.inquiryDate}</span>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-600 flex items-center">
                      <Icon name="user" size={14} className="mr-1" />
                      문의자: 
                    </span>
                    <span className="text-sm ml-5">{selectedInquiry.inquirer}</span>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-600 flex items-center">
                      <Icon name="message-square" size={14} className="mr-1" />
                      문의내용: 
                    </span>
                    <div className="text-sm mt-1 p-2 bg-gray-50 rounded text-gray-700">
                      {selectedInquiry.content}
                    </div>
                  </div>
                </div>
              </div>

              {/* 답변하기 정보 */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Icon name="edit" size={20} className="text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-800">답변하기 정보</h3>
                </div>
                
                <div className="space-y-0">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">답변내용</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                      placeholder="답변 내용을 입력하세요"
                      defaultValue="네트워크 케이블이 정확히 꼽혀 있는지 확인 해 주세요!"
                    />
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-600">답변자: </span>
                    <span className="text-sm ml-5">이배정 (관리팀)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-end py-4 px-6 border-t border-gray-200 space-x-3">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-all duration-200"
              >
                취소
              </button>
              <button
                onClick={() => {
                  // 답변 완료 로직
                  alert('답변이 완료되었습니다.')
                  closeModal()
                }}
                className="px-6 py-2 text-white rounded-lg font-medium transition-all duration-200"
                style={{backgroundColor: '#DBFCE7', color: '#000'}}
              >
                답변하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 정보변경 모달 */}
      {showInfoModal && !showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="user" size={24} className="mr-2" />
                회원 정보 수정
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="py-4 px-6 space-y-4">
              {/* 이메일 */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <Icon name="mail" size={16} className="mr-2" />
                  이메일
                </label>
                <input
                  type="email"
                  defaultValue="assign@itsm.com"
                  className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 성명 */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <Icon name="user" size={16} className="mr-2" />
                  성명
                </label>
                <input
                  type="text"
                  defaultValue="김배정"
                  className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 직급 */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <Icon name="briefcase" size={16} className="mr-2" />
                  직급
                </label>
                <input
                  type="text"
                  defaultValue="대리"
                  className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 소속 */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <Icon name="briefcase" size={16} className="mr-2" />
                  소속
                </label>
                <input
                  type="text"
                  defaultValue="IT운영팀"
                  className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 연락처 */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <Icon name="mail" size={16} className="mr-2" />
                  연락처
                </label>
                <input
                  type="tel"
                  defaultValue="010-1234-5678"
                  className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 비밀번호 변경 버튼 */}
              <div className="pt-4">
                <button 
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-all duration-200 button-smooth"
                >
                  비밀번호 변경
                </button>
              </div>

              {/* 생성일시 (읽기 전용) */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <Icon name="calendar" size={16} className="mr-2" />
                  생성일시
                </label>
                <input
                  type="text"
                  defaultValue="2025.08.01 13:00"
                  readOnly
                  className="w-full px-3 py-1 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-end py-4 px-6 border-t border-gray-200">
              <button
                onClick={() => { setShowInfoModal(false); setShowInfoSuccessModal(true); }}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                회원정보 수정
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 비밀번호 변경 모달 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800">비밀번호 변경</h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="py-4 px-6 space-y-3">
              {/* 현재 비밀번호 */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  현재 비밀번호
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="현재 비밀번호를 입력하세요"
                />
              </div>

              {/* 새 비밀번호 */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  새 비밀번호
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="새 비밀번호를 입력하세요"
                />
              </div>

              {/* 비밀번호 확인 */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  비밀번호 확인
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="새 비밀번호를 다시 입력하세요"
                />
              </div>
            </div>

            <div className="flex gap-3 py-4 px-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setCurrentPassword('')
                  setNewPassword('')
                  setConfirmPassword('')
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                취소
              </button>
              <button
                onClick={() => {
                  // 비밀번호 변경 로직
                  if (newPassword !== confirmPassword) {
                    alert('새 비밀번호가 일치하지 않습니다.')
                    return
                  }
                  if (newPassword.length < 8) {
                    alert('비밀번호는 8자 이상이어야 합니다.')
                    return
                  }
                  alert('비밀번호가 변경되었습니다.')
                  setShowPasswordModal(false)
                  setCurrentPassword('')
                  setNewPassword('')
                  setConfirmPassword('')
                }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                변경
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 회원정보 수정 완료 메시지 모달 */}
      {showInfoSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-bounce-in">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <img src="/icons/check-circle.svg" alt="완료" className="w-12 h-12" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2 animate-fade-in-up">변경 완료</h2>
              <p className="text-gray-600 mb-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                회원정보가 성공적으로 변경되었습니다.
              </p>
              <button
                onClick={() => setShowInfoSuccessModal(false)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 button-smooth animate-fade-in-up"
                style={{animationDelay: '0.4s'}}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
