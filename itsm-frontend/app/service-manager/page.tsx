"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/ui/Icon'
import { apiClient } from '@/lib/api'
import type { Stage, Department, Position, ServiceType, GeneralInquiry, InquiryStatistics } from '@/lib/api'

function ServiceManagerPage() {
  const router = useRouter()
  
  // 시간을 hh:mm 형식으로 변환하는 함수
  const formatTimeToHHMM = (timeString: string | undefined) => {
    if (!timeString) return '-';
    try {
      // 다양한 시간 형식을 처리
      let date: Date;
      if (timeString.includes('T')) {
        // ISO 형식: "2025-01-01T14:30:00" 또는 "2025-01-01T14:30"
        date = new Date(timeString);
      } else if (timeString.includes(' ')) {
        // 날짜와 시간이 공백으로 구분된 형식: "2025-01-01 14:30:00"
        date = new Date(timeString);
      } else if (timeString.includes(':')) {
        // 시간만 있는 형식: "14:30:00" 또는 "14:30"
        const [hours, minutes] = timeString.split(':');
        const today = new Date();
        date = new Date(today.getFullYear(), today.getMonth(), today.getDate(),
          parseInt(hours), parseInt(minutes));
      } else {
        return timeString; // 변환할 수 없는 형식은 그대로 반환
      }
      if (isNaN(date.getTime())) {
        return timeString; // 유효하지 않은 날짜는 원본 반환
      }
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (error) {
      return timeString; // 오류 발생 시 원본 반환
    }
  };
  
  // 모든 상태 변수 선언 (최상단)
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null)
  const [showGeneralInquiryEditModal, setShowGeneralInquiryEditModal] = useState(false)
  const [showGeneralInquiryDeleteModal, setShowGeneralInquiryDeleteModal] = useState(false)
  const [showGeneralInquiryReplyModal, setShowGeneralInquiryReplyModal] = useState(false)
  const [showFAQAddModal, setShowFAQAddModal] = useState(false)
  const [showFAQCompleteModal, setShowFAQCompleteModal] = useState(false)
  const [generalInquiryCurrentPage, setGeneralInquiryCurrentPage] = useState(1)
  const [showUnansweredOnly, setShowUnansweredOnly] = useState(false)
  const [generalInquirySearchStartDate, setGeneralInquirySearchStartDate] = useState('')
  const [generalInquirySearchEndDate, setGeneralInquirySearchEndDate] = useState('')
  const [showInfoSuccessModal, setShowInfoSuccessModal] = useState(false)
  const [showServiceWorkCompleteModal, setShowServiceWorkCompleteModal] = useState(false)
  const [showServiceWorkDeleteCompleteModal, setShowServiceWorkDeleteCompleteModal] = useState(false)
  const [faqCurrentPage, setFaqCurrentPage] = useState(1)
  const [selectedFAQ, setSelectedFAQ] = useState<any>(null)
  const [showFAQEditModal, setShowFAQEditModal] = useState(false)
  const [showGeneralInquiryStatus, setShowGeneralInquiryStatus] = useState(true)
  const [inquiryCurrentDepartment, setInquiryCurrentDepartment] = useState('전체 부서')
  const [showServiceWorkInfoModal, setShowServiceWorkInfoModal] = useState(false)
  const [showServiceWorkDeleteModal, setShowServiceWorkDeleteModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [selectedWorkRequest, setSelectedWorkRequest] = useState<ServiceRequest | null>(null)
  const [showServiceAssignmentModal, setShowServiceAssignmentModal] = useState(false)
  const [showServiceReassignmentModal, setShowServiceReassignmentModal] = useState(false)
  
  // 배정작업 모달 상태
  const [assignmentDepartment, setAssignmentDepartment] = useState('')
  const [assignmentTechnician, setAssignmentTechnician] = useState('')
  const [assignmentOpinion, setAssignmentOpinion] = useState('')
  const [assignmentServiceType, setAssignmentServiceType] = useState('')
  const [assignmentTechnicians, setAssignmentTechnicians] = useState<any[]>([])
  
  // 재배정작업 모달 상태
  const [reassignmentDepartment, setReassignmentDepartment] = useState('')
  const [reassignmentTechnician, setReassignmentTechnician] = useState('')
  const [reassignmentOpinion, setReassignmentOpinion] = useState('')
  const [reassignmentServiceType, setReassignmentServiceType] = useState('')
  const [reassignmentTechnicians, setReassignmentTechnicians] = useState<any[]>([])
  
  // 서비스 타입 관련 상태
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [serviceTypesLoading, setServiceTypesLoading] = useState(false)
  
  const [serviceWorkScheduledDate, setServiceWorkScheduledDate] = useState('')
  const [serviceWorkStartDate, setServiceWorkStartDate] = useState('')
  const [serviceWorkContent, setServiceWorkContent] = useState('')
  const [serviceWorkCompleteDate, setServiceWorkCompleteDate] = useState('')
  const [serviceWorkProblemIssue, setServiceWorkProblemIssue] = useState('')
  const [serviceWorkIsUnresolved, setServiceWorkIsUnresolved] = useState(false)
  const [serviceWorkCurrentStage, setServiceWorkCurrentStage] = useState('예정')
  const [aggregationServiceStatistics, setAggregationServiceStatistics] = useState<any>(null)
  const [isUnresolved, setIsUnresolved] = useState(false)
  const [showApprovalSuccessModal, setShowApprovalSuccessModal] = useState(false)
  const [showServiceAggregation, setShowServiceAggregation] = useState(true)
  const [currentDepartment, setCurrentDepartment] = useState('')
  const [showServiceWorkList, setShowServiceWorkList] = useState(false)
  const [showFAQManagement, setShowFAQManagement] = useState(false)
  const [showGeneralInquiryList, setShowGeneralInquiryList] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [inquiryStartDate, setInquiryStartDate] = useState(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return oneWeekAgo.toISOString().split('T')[0];
  })
  const [inquiryEndDate, setInquiryEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  })
  const [inquirySelectedDepartment, setInquirySelectedDepartment] = useState('')
  const [inquiryData, setInquiryData] = useState({
    answered: 0,
    unanswered: 0,
    total: 0,
    completionRate: 0,
    avgResponseTime: 0
  })
  interface ManagerInfo {
    name: string;
    email: string;
    fullName: string;
    position: string;
    department: string;
    phone: string;
    createDate: string;
  }
  const [managerInfo, setManagerInfo] = useState<ManagerInfo>({
    name: '',
    email: '',
    fullName: '',
    position: '',
    department: '',
    phone: '',
    createDate: ''
  })

  // 상태별 색상 매핑 (동적 처리)
  const [statusColors, setStatusColors] = useState<{[key: string]: string}>({})
  const [statusList, setStatusList] = useState<string[]>([])

  // 단계별 아이콘 매핑 (동적 처리)
  const [stageIcons, setStageIcons] = useState<{[key: string]: {icon: string, iconColor: string}}>({})

  // 단계별 버튼 매핑 (동적 처리) - const 버전으로 대체됨

  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [departmentsLoading, setDepartmentsLoading] = useState<boolean>(false)
  const [positions, setPositions] = useState<Position[]>([])
  const [positionsLoading, setPositionsLoading] = useState<boolean>(false)
  const [stages, setStages] = useState<Stage[]>([])
  const [stageColors, setStageColors] = useState<{[key: string]: string}>({})
  const [serviceWorkSearchStartDate, setServiceWorkSearchStartDate] = useState(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return oneWeekAgo.toISOString().split('T')[0];
  })
  const [serviceWorkSearchEndDate, setServiceWorkSearchEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  })
  const [showServiceIncompleteOnly, setShowServiceIncompleteOnly] = useState(false)
  const [serviceWorkSelectedDepartment, setServiceWorkSelectedDepartment] = useState('전체')
  const [serviceWorkCurrentPage, setServiceWorkCurrentPage] = useState(1)
  const [serviceWorkSelectedStage, setServiceWorkSelectedStage] = useState('전체')
  const [serviceRequestsLoading, setServiceRequestsLoading] = useState(false)
  const [serviceRequestsPagination, setServiceRequestsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  })
  const [currentDate, setCurrentDate] = useState('')
  const [currentTime, setCurrentTime] = useState('')
  const [searchStartDate, setSearchStartDate] = useState('')
  const [searchEndDate, setSearchEndDate] = useState('')
  const [showWorkRegistrationInInfo, setShowWorkRegistrationInInfo] = useState(false)
  const [scheduledDate, setScheduledDate] = useState('')
  const [currentStage, setCurrentStage] = useState('예정')
  const [workStartDate, setWorkStartDate] = useState('')
  const [workCompleteDate, setWorkCompleteDate] = useState('')
  const [workContent, setWorkContent] = useState('')
  const [problemIssue, setProblemIssue] = useState('')
  const [showRejectionSuccessModal, setShowRejectionSuccessModal] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [aggregationStartDate, setAggregationStartDate] = useState(() => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return oneMonthAgo.toISOString().split('T')[0];
  })
  const [aggregationEndDate, setAggregationEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  })
  const [aggregationSelectedDepartment, setAggregationSelectedDepartment] = useState('')
  const [aggregationLoading, setAggregationLoading] = useState(false)
  const [aggregationServiceRequests, setAggregationServiceRequests] = useState<ServiceRequest[]>([])
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(false)
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [showRejectionInAssignment, setShowRejectionInAssignment] = useState(false)
  const [showInfoViewModal, setShowInfoViewModal] = useState(false)
  const [showWorkRegistrationModal, setShowWorkRegistrationModal] = useState(false)
  const [showWorkCompleteModal, setShowWorkCompleteModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [rejectionOpinion, setRejectionOpinion] = useState('')
  
  // 시스템관리 페이지와 동일: 서비스 집계 요청 데이터 가져오기
  const fetchAggregationServiceRequests = async () => {
    setAggregationLoading(true);
    try {
      const params = {
        startDate: aggregationStartDate,
        endDate: aggregationEndDate,
        department: aggregationSelectedDepartment !== '' ? aggregationSelectedDepartment : undefined,
        showIncompleteOnly: false, // 집계 현황에서는 모든 상태 포함
        page: 1,
        limit: 1000 // 집계용이므로 충분한 데이터 가져오기
      };
      const response = await apiClient.getServiceRequests(params);
      if (response.success && response.data) {
        // API 응답 데이터를 프론트엔드 형식으로 변환
        const transformedData = response.data.map((item: any) => mapServiceRequestData(item));
        setAggregationServiceRequests(transformedData);
      } else {
        console.error('Failed to fetch aggregation service requests:', response.error);
      }
    } catch (error) {
      console.error('Error fetching aggregation service requests:', error);
    } finally {
      setAggregationLoading(false);
    }
  };

  // 시스템관리 페이지와 동일: 서비스 집계 통계 가져오기
  const fetchAggregationServiceStatistics = async () => {
    try {
      const params = {
        startDate: aggregationStartDate,
        endDate: aggregationEndDate,
        department: aggregationSelectedDepartment !== '' ? aggregationSelectedDepartment : undefined,
        dateField: 'request_date' // 검색 기준 컬럼 변경
      }
      const response = await apiClient.getServiceStatistics(params)
      if (response.success && response.data) {
        setAggregationServiceStatistics(response.data)
      }
    } catch (e) {
      console.error('❌ 서비스 집계현황 통계 가져오기 실패:', e)
    }
  }

  // 시스템관리 페이지와 동일: stages 로드 함수
  const loadStages = async () => {
    try {
      const response = await apiClient.getStages();
      if (response.success && response.data) {
        setStages(response.data);
        
        // 단계별 아이콘 매핑 설정 (시스템관리 페이지와 동일 패턴)
        const iconsMapping: {[key: string]: {icon: string, iconColor: string}} = {};
        const buttonsMapping: {[key: string]: string[]} = {};
        response.data.forEach((stage: any) => {
          if (stage.icon && stage.iconColor) {
            iconsMapping[stage.name] = {
              icon: stage.icon,
              iconColor: stage.iconColor
            };
          }
          if (stage.buttons) {
            buttonsMapping[stage.name] = stage.buttons;
          }
        });
        setStageIcons(iconsMapping);
        // setStageButtons는 const로 정의되어 제거됨
        console.log('단계별 아이콘 매핑 설정 (백엔드 기반):', iconsMapping);
        console.log('단계별 버튼 매핑 설정 (백엔드 기반):', buttonsMapping);
      }
    } catch (error) {
      console.error('❌ stages 로드 중 오류:', error);
    }
  };

  // 특정 부서로 통계 가져오기 (초기 로드용)
  const fetchAggregationServiceStatisticsWithDepartment = async (departmentName: string) => {
    try {
      const params = {
        startDate: aggregationStartDate,
        endDate: aggregationEndDate,
        department: departmentName !== '' ? departmentName : undefined
      }
      const response = await apiClient.getServiceStatistics(params)
      if (response.success && response.data) {
        setAggregationServiceStatistics(response.data)
      }
    } catch (e) {
      console.error('❌ 직접 부서 서비스 집계현황 통계 가져오기 실패:', e)
    }
  };
  
  // ServiceRequest 타입 정의
  interface ServiceRequest {
    id: any;
    requestNumber: any;
    title: any;
    currentStatus: any;
    requestDate: any;
    requestTime: any;
    requester: any;
    department: any;
    requesterDepartment: any;
    stage: any;
    assignTime: any;
    assignDate: any;
    description?: any;
    status?: any;
    priority?: any;
    assignedTo?: any;
    requestedBy?: any;
    workStartDate?: string;
    workCompleteDate?: string;
    workContent?: string;
    problemIssue?: string;
    isUnresolved?: boolean;
    completedBy?: string;
    stageId?: any;
    [key: string]: any;
  }
  
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([])

  // PendingWork 인터페이스 정의
  interface PendingWork {
    id: string
    technician: string
    lastWeekPending: number
    longTermPending: number
  }

  // 초기값 설정 및 데이터 로드 useEffect
  useEffect(() => {
    // 시스템관리 페이지 패턴 참고: 로그인 사용자 정보 localStorage에서 가져오기
    const userStr = window.localStorage.getItem('user');
    if (userStr) {
      const currentUser = JSON.parse(userStr);
      
      setCurrentUserId(currentUser.id || '관리매니저');
      setManagerInfo({
        name: currentUser.name || '',
        email: currentUser.email || '',
        fullName: currentUser.name || '',
        position: currentUser.position || '',
        department: currentUser.department || '전체 부서',
        phone: currentUser.phone || '',
        createDate: currentUser.created_at || ''
      });
      setCurrentDepartment(currentUser.department || '전체 부서');
      // 관리매니저는 소속 책임자로 소속 조치담당자들의 업무를 관리할 부서 권한을 가진다
      const userDepartment = currentUser.department || '';
      setAggregationSelectedDepartment(userDepartment);
      // 서비스작업List관리 검색조건도 소속 부서로 초기설정
      setServiceWorkSelectedDepartment(userDepartment || '전체');
      // 일반문의 현황도 소속 부서로 초기설정
      setInquirySelectedDepartment(userDepartment);
      setInquiryCurrentDepartment(userDepartment || '전체 부서');
    } else {
      setCurrentUserId('관리매니저');
      setManagerInfo({
        name: '관리매니저',
        email: '',
        fullName: '관리매니저',
        position: '',
        department: '전체 부서',
        phone: '',
        createDate: ''
      });
      setCurrentDepartment('전체 부서');
      setAggregationSelectedDepartment(''); // 기본값은 전체 부서
      setServiceWorkSelectedDepartment('전체'); // 기본값은 전체 부서
      // 일반문의 현황 기본값도 전체 부서
      setInquirySelectedDepartment('');
      setInquiryCurrentDepartment('전체 부서');
    }
    // 그래프(검색) 일자 초기값: 최근 한 달
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
    setSearchStartDate(oneMonthAgo.toISOString().split('T')[0]);
    setSearchEndDate(today.toISOString().split('T')[0]);
    
    // 초기값 설정 후 서비스 통계 자동 로드
    setTimeout(() => {
      loadStages(); // stages 먼저 로드
      fetchDepartments(); // departments 로드
      fetchPositions(); // positions 로드
      fetchServiceTypes(); // service types 로드
      loadStatuses(); // 상태 정보 로드
    }, 100);
    
    // 부서 설정이 완료된 후 통계 로드 (사용자 부서값 직접 사용)
    const userDepartment = userStr ? JSON.parse(userStr).department || '' : '';
    setTimeout(() => {
      // aggregationSelectedDepartment 상태값 대신 직접 사용자 부서값 사용
      fetchAggregationServiceStatisticsWithDepartment(userDepartment);
    }, 300);
  }, []);

  // 차트 데이터 메모이제이션
  const chartDataMemo = useMemo(() => {
    let currentChartData: { [key: string]: number } = {};
    
    if (aggregationServiceStatistics && stages.length > 0 && aggregationServiceStatistics.overview) {
      stages.forEach(stage => {
        const key = stage.name;
        const backendField = `stage_${stage.name}`;
        const value = parseInt(aggregationServiceStatistics.overview[backendField]) || 0;
        currentChartData[key] = value;
      });
    }
    
    const total = Object.values(currentChartData).reduce((sum, value) => sum + value, 0);
    return { chartData: currentChartData, total };
  }, [aggregationServiceStatistics, stages]);

  // 검색 조건 변경 시 자동으로 데이터 재조회
  useEffect(() => {
    if (stages.length > 0) {
      fetchAggregationServiceStatistics();
    }
  }, [aggregationStartDate, aggregationEndDate, aggregationSelectedDepartment]);

  // 모든 useState 선언 (최상단)
  interface ManagerInfo {
    name: string;
    email: string;
    fullName: string;
    position: string;
    department: string;
    phone: string;
    createDate: string;
  }

  // 날짜 형식화 함수
  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // 부서 목록 불러오기 함수
  const fetchDepartments = async () => {
    setDepartmentsLoading(true)
    try {
      const response = await apiClient.getDepartments()
      if (response.success && response.data) {
        setDepartments(response.data)
      }
    } catch (error) {
      console.error('❌ Error fetching departments:', error)
    } finally {
      setDepartmentsLoading(false)
    }
  }

  // 직급 목록 불러오기 함수
  const fetchPositions = async () => {
    setPositionsLoading(true)
    try {
      const response = await apiClient.getPositions()
      if (response.success && response.data) {
        setPositions(response.data)
      }
    } catch (error) {
      console.error('❌ Error fetching positions:', error)
    } finally {
      setPositionsLoading(false)
    }
  }

  // 상태 정보 로드
  const loadStatuses = async () => {
    try {
      const response = await apiClient.getAllCurrentStatuses();
      if (response.success && response.data) {
        // 상태별 색상 매핑 설정
        const colorMapping: {[key: string]: string} = {};
        response.data.forEach((status: any) => {
          if (status.color) {
            colorMapping[status.name] = status.color;
          }
        });
        setStatusColors(colorMapping);

        // 상태 목록 설정
        const statusNames = response.data.map((status: any) => status.name);
        setStatusList(statusNames);
        console.log('상태별 색상 매핑 설정 (백엔드 기반):', colorMapping);
        console.log('상태 목록 설정 (백엔드 기반):', statusNames);
      }
    } catch (error) {
      console.error('상태 정보 로드 실패:', error);
      // 오류 발생 시 빈 객체로 설정 (기본 회색 색상 사용)
      setStatusColors({});
    }
  };

  // 데이터 타입 정의
  // 서비스 작업 목록은 API에서 직접 필터링된 데이터를 사용 (하드코딩 필터링 제거)
  // 페이지네이션도 서버에서 처리된 데이터 사용

  // mapServiceRequestData 함수
  const mapServiceRequestData = (rawData: any) => {
    return {
      id: rawData.id?.toString() || '',
      requestNumber: rawData.request_number || '',
      title: rawData.title || '',
      currentStatus: rawData.current_status || '',
      requestDate: rawData.request_date || '',
      requestTime: rawData.request_time || '',
      requester: rawData.requester_name || '',
      department: rawData.requester_department || '',
      requesterDepartment: rawData.requester_department || '',
      stage: rawData.stage || '',
      assignTime: rawData.assign_time || '',
      assignDate: rawData.assign_date || '',
      assignee: rawData.assignee_name || '',
      assigneeDepartment: rawData.assignee_department || '',
      technician: rawData.technician_name || '',
      technicianDepartment: rawData.technician_department || '',
      workStartDate: rawData.work_start_date || '',
      workStartTime: rawData.work_start_time || '',
      workCompleteDate: rawData.work_complete_date || '',
      workCompleteTime: rawData.work_complete_time || '',
      content: rawData.content || '',
      contact: rawData.contact || '',
      location: rawData.location || '',
      actualRequester: rawData.actual_requester_name || '',
      actualContact: rawData.actual_contact || '',
      actualRequesterDepartment: rawData.actual_requester_department || '',
      serviceType: rawData.service_type || '',
      completionDate: rawData.completion_date || '',
      assignmentOpinion: rawData.assignment_opinion || '',
      previousAssignDate: rawData.previous_assign_date || '',
      previousAssignee: rawData.previous_assignee || '',
      previousAssignmentOpinion: rawData.previous_assignment_opinion || '',
      rejectionDate: rawData.rejection_date || '',
      rejectionOpinion: rawData.rejection_opinion || '',
      rejectionName: rawData.rejection_name || '',
      scheduledDate: rawData.scheduled_date || '',
      workContent: rawData.work_content || '',
      problemIssue: rawData.problem_issue || '',
      isUnresolved: rawData.is_unresolved || false,
      stageId: rawData.stage_id || 0
    };
  }

  // stages에서 단계명 가져오기 함수 (시스템관리와 동일)
  const getStageName = (stageKey: string): string => {
    // stages가 로드되었으면 stages에서 직접 찾기
    if (stages && stages.length > 0) {
      const stage = stages.find(s => s.name === stageKey);
      return stage ? stage.name : stageKey; // 찾지 못하면 stageKey 그대로 반환
    }

    // stages가 아직 로드되지 않았으면 stageKey 그대로 반환
    return stageKey;
  };

  // 현재 한국 시간을 datetime-local 형식으로 반환
  const getCurrentDateTime = () => {
    const now = new Date();
    const kstOffset = 9 * 60; // 한국은 UTC+9
    const kstTime = new Date(now.getTime() + (kstOffset * 60 * 1000));
    return kstTime.toISOString().slice(0, 16);
  };

  // 단계별 버튼 매핑 (시스템관리와 동일하지만 관리매니저 권한 제한)
  const stageButtons: { [key: string]: string[] } = {
    '확인': ['edit', 'delete'],
    '예정': ['edit', 'delete'], 
    '작업': ['edit', 'delete'],
    '완료': ['edit', 'delete'],
    '미결': ['edit', 'delete']
  };

  // 서비스 요청 데이터 가져오기 함수 - 부서 필터링에도 페이지네이션 적용
  const fetchServiceRequests = async () => {
    setServiceRequestsLoading(true);
    try {
      // 선택된 단계의 ID 찾기
      const selectedStageId = serviceWorkSelectedStage !== '전체'
        ? stages.find(s => s.name === serviceWorkSelectedStage)?.id
        : undefined;
      const isDeptFilteredForFetch = serviceWorkSelectedDepartment !== '전체';
      const params = {
        startDate: serviceWorkSearchStartDate,
        endDate: serviceWorkSearchEndDate,
        department: isDeptFilteredForFetch ? serviceWorkSelectedDepartment : undefined, // technician_department 대신 department 사용
        stage_id: selectedStageId,
        showIncompleteOnly: showServiceIncompleteOnly, // 미결완료 필터링 추가
        page: serviceRequestsPagination.page, // 부서 필터링에 관계없이 현재 페이지 사용
        limit: 10 // 고정된 limit 사용
      };
      
      console.log('🔍 fetchServiceRequests 파라미터:', {
        ...params,
        isDeptFilteredForFetch,
        serviceWorkSelectedDepartment,
        currentPage: serviceRequestsPagination.page
      });
      
      const response = await apiClient.getServiceRequests(params);
      console.log('📡 API 응답:', response);
      console.log('📊 응답 데이터 개수:', response.data?.length);
      console.log('📄 페이지네이션 정보:', (response as any).pagination);
      
      if (response.success && response.data) {
        // API 응답 데이터를 프론트엔드 형식으로 변환
        const transformedData = response.data.map((item: any) => mapServiceRequestData(item));
        setServiceRequests(transformedData);
        
        if ((response as any).pagination) {
          console.log('✅ 백엔드에서 페이지네이션 정보 수신:', (response as any).pagination);
          setServiceRequestsPagination({
            page: (response as any).pagination.page,
            limit: (response as any).pagination.limit,
            total: (response as any).pagination.total,
            totalPages: (response as any).pagination.totalPages
          });
        } else {
          console.log('⚠️ 백엔드에서 페이지네이션 정보 없음 - 클라이언트에서 계산');
          // 페이지네이션 정보가 없으면 기본값 설정
          const itemsPerPage = 10;
          const totalItems = transformedData.length;
          const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
          
          setServiceRequestsPagination(prev => ({
            ...prev,
            total: totalItems,
            totalPages: totalPages,
            limit: itemsPerPage
          }));
          console.log('📊 클라이언트 계산 페이지네이션:', { totalItems, totalPages, itemsPerPage });
        }
      } else {
        console.error('Failed to fetch service requests:', response.error);
        setServiceRequests([]);
        setServiceRequestsPagination(prev => ({ ...prev, total: 0, totalPages: 1 }));
      }
    } catch (error) {
      console.error('Error fetching service requests:', error);
      setServiceRequests([]);
      setServiceRequestsPagination(prev => ({ ...prev, total: 0, totalPages: 1 }));
    } finally {
      setServiceRequestsLoading(false);
    }
  };

  // 검색 조건 변경 시 페이지를 1로 리셋하고 데이터 가져오기
  useEffect(() => {
    if (stages.length > 0) {
      setServiceRequestsPagination(prev => ({ ...prev, page: 1 }));
      fetchServiceRequests();
    }
  }, [serviceWorkSearchStartDate, serviceWorkSearchEndDate, serviceWorkSelectedDepartment, serviceWorkSelectedStage, showServiceIncompleteOnly, stages.length]);

  // 페이지 변경 시에만 데이터 가져오기
  useEffect(() => {
    if (stages.length > 0) {
      fetchServiceRequests();
    }
  }, [serviceRequestsPagination.page]);

  const openAssignmentModal = (request: any) => {
    setSelectedWorkRequest(request)
    setShowServiceAssignmentModal(true)
  }

  const openInfoModal = (request: any) => {
    setSelectedWorkRequest(request)
    setShowServiceWorkInfoModal(true)
  }

  const openInfoChange = () => {
    setShowServiceWorkInfoModal(false)
    setShowWorkRegistrationInInfo(true)
    // 예정조율일시에 현재 시점 자동 설정 (한국 시간)
    const now = new Date()
    const kstOffset = 9 * 60 // 한국은 UTC+9
    const kstTime = new Date(now.getTime() + (kstOffset * 60 * 1000))
    const formattedNow = kstTime.toISOString().slice(0, 16)
    setServiceWorkScheduledDate(formattedNow)
  }

  // 누락된 핸들러 함수들 (기본 동작만)
  const handleInfoChange = () => {
    setShowServiceWorkInfoModal(true)
  }

  const handleScheduledProcess = () => {
    setServiceWorkCurrentStage('작업')
    alert('예정 단계가 처리되었습니다.')
  }

  const handleWorkStartProcess = () => {
    setServiceWorkCurrentStage('완료')
    alert('작업이 시작되었습니다.')
  }

  const handleWorkCompleteProcess = () => {
    setServiceWorkCurrentStage('미결')
    alert('작업이 완료되었습니다.')
  }

  const handleUnresolvedProcess = () => {
    setServiceWorkCurrentStage('미결')
    alert('미결 처리가 완료되었습니다.')
  }

  // 배정취소 처리 함수
  const handleAssignmentCancel = async (request: any) => {
    // 알람창으로 배정취소 의견 입력받기
    const rejectionOpinion = prompt('배정취소 의견을 입력해주세요:');
    if (!rejectionOpinion || rejectionOpinion.trim() === '') {
      alert('배정취소 의견을 입력해주세요.');
      return;
    }
    try {
      // 현재 로그인 사용자 정보 가져오기
      const userStr = localStorage.getItem('user');
      let currentUser = null;
      if (userStr) {
        currentUser = JSON.parse(userStr);
      }
      // 한국시간 적용
      const now = new Date();
      const kstOffset = 9 * 60; // 한국은 UTC+9
      const kstTime = new Date(now.getTime() + (kstOffset * 60 * 1000));
      const kstDateTime = kstTime.toISOString().slice(0, 19).replace('T', ' ');
      const response = await apiClient.cancelAssignment({
        requestId: request.id,
        rejectionOpinion: rejectionOpinion.trim(),
        rejectionDate: kstDateTime, // 한국시간 적용
        rejectionName: currentUser?.name || '', // 현재 로그인 사용자
        stageId: 3, // 재배정
        previousAssigneeDate: request.assignDate,
        previousAssignee: request.assignee
      });
      if (response.success) {
        alert('배정이 취소되었습니다.');
        await fetchServiceRequests(); // 목록 새로고침
      } else {
        alert('배정취소 중 오류가 발생했습니다: ' + response.error);
      }
    } catch (error) {
      console.error('배정취소 실패:', error);
      alert('배정취소 중 오류가 발생했습니다.');
    }
  };

  // 서비스 타입 목록 불러오기 함수
  const fetchServiceTypes = async () => {
    setServiceTypesLoading(true)
    try {
      const response = await apiClient.getServiceTypes()
      if (response.success && response.data) {
        setServiceTypes(response.data)
      }
    } catch (error) {
      console.error('❌ Error fetching service types:', error)
    } finally {
      setServiceTypesLoading(false)
    }
  }

  // 서비스 타입 기본값 설정
  useEffect(() => {
    if (serviceTypes.length > 0) {
      const defaultServiceType = serviceTypes[0].name
      setAssignmentServiceType(defaultServiceType)
      setReassignmentServiceType(defaultServiceType)
    }
  }, [serviceTypes])

  // 배정작업 모달 - 조치 소속 변경 핸들러
  const handleAssignmentDepartmentChange = async (departmentName: string) => {
    setAssignmentDepartment(departmentName)
    if (departmentName) {
      const technicians = await fetchTechniciansByDepartment(departmentName)
      setAssignmentTechnicians(technicians)

      // 조치담당자가 없는 경우 알림
      if (technicians.length === 0) {
        alert(`${departmentName}에 조치담당자 권한을 가진 사용자가 없습니다.`)
      }

      // 현재 선택된 조치자가 새로운 부서에 없으면 초기화
      const currentTechnician = assignmentTechnician
      if (currentTechnician && !technicians.find((t: any) => t.name === currentTechnician)) {
        setAssignmentTechnician('')
      }
    } else {
      setAssignmentTechnicians([])
      setAssignmentTechnician('')
    }
  }

  // 재배정작업 모달 - 조치 소속 변경 핸들러
  const handleReassignmentDepartmentChange = async (departmentName: string) => {
    setReassignmentDepartment(departmentName)
    if (departmentName) {
      const technicians = await fetchTechniciansByDepartment(departmentName)
      setReassignmentTechnicians(technicians)

      // 조치담당자가 없는 경우 알림
      if (technicians.length === 0) {
        alert(`${departmentName}에 조치담당자 권한을 가진 사용자가 없습니다.`)
      }

      // 현재 선택된 조치자가 새로운 부서에 없으면 초기화
      const currentTechnician = reassignmentTechnician
      if (currentTechnician && !technicians.find((t: any) => t.name === currentTechnician)) {
        setReassignmentTechnician('')
      }
    } else {
      setReassignmentTechnicians([])
      setReassignmentTechnician('')
    }
  }

  // 특정 부서의 기술자 목록 가져오기
  const fetchTechniciansByDepartment = async (departmentName: string) => {
    try {
      const response = await apiClient.getUsers({
        role: '조치담당자',
        department: departmentName
      });
      if (response.success && response.data) {
        return response.data.users;
      } else {
        console.error('기술자 목록 가져오기 실패:', response.error);
        return [];
      }
    } catch (error) {
      console.error('기술자 목록 가져오기 오류:', error);
      return [];
    }
  };

  // 재배정작업 처리 함수
  const handleReassignmentSubmit = async () => {
    if (!selectedWorkRequest || !reassignmentDepartment || !reassignmentTechnician || !reassignmentOpinion.trim()) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }

    try {
      // 현재 로그인 사용자 정보 가져오기
      const userStr = localStorage.getItem('user');
      let currentUser = null;
      if (userStr) {
        currentUser = JSON.parse(userStr);
      }

      if (!currentUser) {
        alert('사용자 정보를 찾을 수 없습니다.');
        return;
      }

      // 선택된 기술자 ID 찾기
      const technicianId = reassignmentTechnicians.find((t: any) => t.name === reassignmentTechnician)?.id;

      // 디버깅 로그
      console.log('=== 재배정하기 디버깅 ===');
      console.log('selectedWorkRequest:', selectedWorkRequest);
      console.log('reassignmentDepartment:', reassignmentDepartment);
      console.log('reassignmentTechnician:', reassignmentTechnician);
      console.log('reassignmentOpinion:', reassignmentOpinion);
      console.log('technicianId:', technicianId);

      // 재배정(3)에서 배정(2)으로 돌아가기 - 시스템 관리와 동일한 구조
      const updateData = {
        stage_id: 2, // 배정 단계 ID 직접 사용
        // 배정담당자 정보 (재배정하기를 클릭한 현재 로그인 사용자)
        assignee_id: currentUser.id,
        assignee_name: currentUser.name,
        assignee_department: currentUser.department,
        // 배정 일시 (현재시점 기준 - 한국 시간)
        assign_date: (() => {
          const now = new Date();
          const kstOffset = 9 * 60; // 한국은 UTC+9
          const kstTime = new Date(now.getTime() + (kstOffset * 60 * 1000));
          return kstTime.toISOString().replace('T', ' ').substring(0, 19); // YYYY-MM-DD HH:mm:ss 형식
        })(),
        assign_time: (() => {
          const now = new Date();
          const kstOffset = 9 * 60; // 한국은 UTC+9
          const kstTime = new Date(now.getTime() + (kstOffset * 60 * 1000));
          return kstTime.toTimeString().split(' ')[0].substring(0, 5); // HH:MM 형식
        })(),
        // 조치소속은 technician_department에 저장
        technician_department: reassignmentDepartment,
        // 조치자는 technician_name과 technician_id에 저장
        technician_name: reassignmentTechnician,
        technician_id: technicianId,
        // 재배정의견은 assignment_opinion에 저장
        assignment_opinion: reassignmentOpinion,
        // 서비스 타입
        service_type: reassignmentServiceType
      };

      console.log('재배정 업데이트 데이터:', updateData);

      const response = await apiClient.put(`/service-requests/${selectedWorkRequest?.id}`, updateData);
      if (response.success) {
        alert('재배정이 완료되었습니다.');
        setShowServiceReassignmentModal(false);
        // 상태 초기화
        setReassignmentDepartment('');
        setReassignmentTechnician('');
        setReassignmentOpinion('');
        setReassignmentServiceType('');
        setReassignmentTechnicians([]);
        // 목록 새로고침
        await fetchServiceRequests();
      } else {
        alert('재배정 중 오류가 발생했습니다: ' + response.error);
      }
    } catch (error) {
      console.error('재배정 오류:', error);
      alert('재배정 중 오류가 발생했습니다.');
    }
  };

  // 백엔드 기반: 일반문의 통계 가져오기 및 inquiryData 반영
  const fetchManagerInquiryStatistics = async () => {
    try {
      const params = {
        startDate: inquiryStartDate,
        endDate: inquiryEndDate,
        department: inquirySelectedDepartment || undefined
      }
      const response = await apiClient.getInquiryStatistics(params)
      if (response.success && response.data && response.data.overview) {
        const ov = response.data.overview
        const answered = parseInt(String(ov.answered_inquiries)) || 0
        const unanswered = parseInt(String(ov.pending_inquiries)) || 0
        const total = parseInt(String(ov.total_inquiries)) || (answered + unanswered)
        const completionRate = total > 0 ? Math.round((answered / total) * 1000) / 10 : 0
        const avgResponseTime = parseFloat(String(ov.avg_response_hours)) || 0
        setInquiryData({ answered, unanswered, total, completionRate, avgResponseTime })
      }
    } catch (e) {
      console.error('관리매니저 일반문의 통계 로드 실패:', e)
    }
  }



  // 일반문의현황 부서나 날짜 변경 시 데이터 업데이트
  useEffect(() => {
    fetchManagerInquiryStatistics()
  }, [inquirySelectedDepartment, inquiryStartDate, inquiryEndDate])

  // 서비스작업List관리가 열릴 때 데이터 새로고침
  useEffect(() => {
    if (showServiceWorkList) {
      fetchDepartments();
      if (stages.length > 0) {
        fetchServiceRequests();
      }
    }
  }, [showServiceWorkList]);

  // stages가 로드된 후 서비스작업List가 열려있으면 데이터 로드
  useEffect(() => {
    if (stages.length > 0 && showServiceWorkList) {
      fetchServiceRequests();
    }
  }, [stages.length, showServiceWorkList]);

  // 페이지네이션 로직 - 부서 필터링에 관계없이 정상 작동
  const serviceWorkTotalPages = serviceRequestsPagination.totalPages;
  
  console.log('📊 현재 페이지네이션 상태:', {
    currentPage: serviceRequestsPagination.page,
    totalPages: serviceWorkTotalPages,
    total: serviceRequestsPagination.total,
    limit: serviceRequestsPagination.limit,
    selectedDepartment: serviceWorkSelectedDepartment,
    dataLength: serviceRequests.length
  });
  const handleRefresh = () => {
    // 서버에서 최신 통계 재로드
    fetchAggregationServiceStatistics()
    fetchManagerInquiryStatistics()
  }

  const closeModal = () => {
    setShowAssignmentModal(false)
    setShowRejectionModal(false)
    setShowRejectionInAssignment(false)
    setShowInfoModal(false)
    setShowInfoViewModal(false)
    setShowWorkRegistrationModal(false)
    setShowWorkCompleteModal(false)
    setShowPasswordModal(false)
    setShowWorkRegistrationInInfo(false)
    setSelectedRequest(null)
    setRejectionOpinion('')
    // 작업정보등록 상태 초기화
    setScheduledDate('')
    setWorkStartDate('')
    setWorkContent('')
    setWorkCompleteDate('')
    setProblemIssue('')
    setIsUnresolved(false)
    setCurrentStage('예정')
  }

  // 배정승인 처리
  const handleAssignmentApprove = () => {
    if (selectedRequest) {
      setServiceRequests(prev => 
        prev.map(req => 
          req.id === selectedRequest.id 
            ? { ...req, stage: '확인' }
            : req
        )
      )
    }
    setShowAssignmentModal(false)
    setShowApprovalSuccessModal(true)
    setSelectedRequest(null)
  }

  // 배정반려 처리
  const handleAssignmentReject = () => {
    setShowRejectionInAssignment(true)
  }

  // 작업 등록 정보 모달 표시
  const handleWorkRegistrationInInfo = () => {
    setShowWorkRegistrationInInfo(true)
  }

  const handleFinalReject = () => {
    if (selectedRequest) {
      const now = new Date()
      const currentDateTime = now.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace(/\./g, '.').replace(/\s/g, ' ')

      setServiceRequests(prev =>
        prev.map(req =>
          req.id === selectedRequest.id
            ? {
                ...req,
                // 현재 배정 정보를 전) 배정 정보로 이동
                previousAssignDate: req.assignDate,
                previousAssignee: req.assignee,
                previousAssignmentOpinion: req.assignmentOpinion,
                // 현재 배정 정보 초기화
                assignDate: '',
                assignee: '',
                assignmentOpinion: '',
                // 반려 정보 설정
                rejectionDate: currentDateTime,
                rejectionOpinion: rejectionOpinion,
                stage: '반려'
              }
            : req
        )
      )
    }
    setShowRejectionInAssignment(false)
    setShowAssignmentModal(false)
    setShowRejectionSuccessModal(true) // Show rejection success modal
    setSelectedRequest(null)
    setRejectionOpinion('')
  }
  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* 배경 이미지 */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/image/배경_관리매니저_페이지.jpg')",
          opacity: 1.0
        }}
      />

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
            <button
              onClick={() => router.push('/')}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-out"
              style={{marginRight: '0px'}}
            >
              로그아웃
                    </button>
                </div>
              </div>
            </div>

      {/* 메인 컨텐츠 */}
      <main className="relative z-10">
        {/* 사용자 정보 및 네비게이션 */}
        <div className="max-w-7xl mx-auto px-6 py-6 w-full">
          <div className="flex items-center justify-between mb-12">
            <div className="px-20 py-0 rounded-full -ml-72 smooth-hover animate-fade-in shadow-lg" style={{backgroundColor: '#D4B8F9', marginLeft: '-310px'}}>
              <span className="text-purple-800 font-medium" style={{fontSize: '14px'}}>관리매니저 ({managerInfo.name})</span>
            </div>
          </div>
        </div>

        {/* 완전히 분리된 정보변경 버튼 */}
        <div className="absolute z-50" style={{top: '14px', right: '116px'}}>
          <button 
            onClick={handleInfoChange}
            className="text-black/70 hover:text-black transition-all duration-300 ease-out flex items-center space-x-2 button-smooth px-4 py-2 rounded-lg"
          >
            <Icon name="settings-gray" size={20} className="text-black hover:text-black" />
            <span>정보 변경</span>
                    </button>
        </div>

        {/* 분리된 3개 프레임 */}
        <div className="max-w-7xl mx-auto px-6 py-6">
            
          {/* 프레임 1: 서비스 집계현황 */}
          <div className="mb-6" style={{marginLeft: '-315px', marginTop: '-60px'}}>
            <div className="w-80" style={{width: '306px'}}>
              <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col" style={{height: '650px', backgroundColor: 'rgba(255, 255, 255, 0.5)'}}>
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <button
                      onClick={() => {
                        fetchAggregationServiceRequests();
                        fetchAggregationServiceStatistics();
                      }}
                      className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <Icon name="refresh" size={16} />
                    </button>
                    <h3 className="text-lg font-bold text-gray-800">서비스 집계현황</h3>
                  </div>
                  <div className="flex justify-end" style={{marginTop: '30px'}}>
                    <button
                      onClick={() => setShowServiceAggregation(!showServiceAggregation)}
                      className={`w-8 h-4 rounded-full transition-colors ${
                        showServiceAggregation ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    >
                      <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                        showServiceAggregation ? 'translate-x-4' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>

                {showServiceAggregation && (
                  <>
                    {/* 부서 선택 */}
                    <div className="mb-4">
                      <select
                        value={aggregationSelectedDepartment}
                        onChange={(e) => {
                          setAggregationSelectedDepartment(e.target.value)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        disabled={departmentsLoading}
                      >
                        <option value="">전체 부서</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.name}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>


                    {/* 검색 기간 선택 (현재시점 1개월) */}
                    <div className="mb-4">
                      <div className="flex items-center space-x-1">
                        <input
                          type="date"
                          value={aggregationStartDate}
                          max={aggregationEndDate}
                          onChange={(e) => {
                            const newStart = e.target.value;
                            // 시작일이 종료일보다 크면 종료일로 맞춤
                            if (newStart > aggregationEndDate) {
                              setAggregationStartDate(aggregationEndDate);
                            } else {
                              setAggregationStartDate(newStart);
                            }
                          }}
                          className="w-full px-2 py-2 border border-gray-300 rounded-lg text-xs"
                        />
                        <span className="text-gray-500 text-sm">~</span>
                        <input
                          type="date"
                          value={aggregationEndDate}
                          min={aggregationStartDate}
                          onChange={(e) => {
                            const newEnd = e.target.value;
                            // 종료일이 시작일보다 작으면 시작일로 맞춤
                            if (newEnd < aggregationStartDate) {
                              setAggregationEndDate(aggregationStartDate);
                            } else {
                              setAggregationEndDate(newEnd);
                            }
                          }}
                          className="w-full px-2 py-2 border border-gray-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    {/* 반원 호 차트 */}
                    <div className="flex items-center h-40" style={{marginTop: '100px'}}>
                      <div className="w-[400px] h-[400px] relative">
                        <svg viewBox="0 0 200 200" className="w-full h-full">
                          {(() => {
                            // 메모이제이션된 차트 데이터 사용
                            const { chartData, total } = chartDataMemo;

                            const radius = 120
                            const centerX = 150
                            const centerY = 100
                            
                            // total이 0이면 빈 차트 표시
                            if (total === 0) {
                              return (
                                <text x={centerX} y={centerY} textAnchor="middle" className="text-gray-500 text-sm">
                                  데이터 없음
                                </text>
                              )
                            }
                            
                            // 각 섹션의 각도 계산 (180도 반원) - NaN 방지 (동적 처리)
                            // stages 테이블에서 동적으로 색상과 순서 가져오기
                            const stageColors: { [key: string]: string } = {};
                            stages.forEach(stage => {
                              // Tailwind CSS 클래스명을 hex 코드로 변환
                              const colorMap: { [key: string]: string } = {
                                'bg-purple-100 text-purple-800': '#8B5CF6',
                                'bg-blue-100 text-blue-800': '#3B82F6',
                                'bg-green-100 text-green-800': '#10B981',
                                'bg-yellow-100 text-yellow-800': '#F59E0B',
                                'bg-orange-100 text-orange-800': '#F97316',
                                'bg-red-100 text-red-800': '#EF4444',
                                'bg-indigo-100 text-indigo-800': '#6366F1'
                              };
                              stageColors[stage.name] = colorMap[stage.color || ''] || '#6B7280';
                            });

                            // stages 테이블의 id 순서대로 정렬 (그래프용 - 위에서부터 접수→미결)
                            const sortedStages = [...stages].sort((a, b) => a.id - b.id);
                            const stageData = sortedStages.map((stage, index) => {
                              const key = stage.name; // 한글 이름을 직접 키로 사용
                              const value = chartData[key] || 0;
                              const result = {
                                key: key,
                                koreanName: stage.name,
                                value,
                                angle: total > 0 ? (value / total) * 180 : 0,
                                color: stageColors[stage.name],
                                order: stage.id // stages 테이블의 id를 순서로 사용
                              };
                              return result;
                            }).filter(stage => stage.value > 0); // 값이 있는 단계만 표시

                            // 극좌표를 직교좌표로 변환 (180도 회전)
                            const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
                              // 각도가 유효하지 않으면 기본값 반환
                              if (!isFinite(angleInDegrees)) {
                                return { x: centerX, y: centerY }
                              }
                              const angleInRadians = (angleInDegrees + 90) * Math.PI / 180.0
                              const x = centerX + (radius * Math.cos(angleInRadians))
                              const y = centerY + (radius * Math.sin(angleInRadians))
                              return { x, y }
                            };

                            // 호 그리기 함수
                            const createArc = (key: string, startAngle: number, endAngle: number, color: string, strokeWidth = 48) => {
                              // 각도가 유효하지 않으면 빈 path 반환
                              if (!isFinite(startAngle) || !isFinite(endAngle) || startAngle === endAngle) {
                                return null
                              }
                              const start = polarToCartesian(centerX, centerY, radius, endAngle)
                              const end = polarToCartesian(centerX, centerY, radius, startAngle)
                              // 좌표가 유효하지 않으면 빈 path 반환
                              if (!isFinite(start.x) || !isFinite(start.y) || !isFinite(end.x) || !isFinite(end.y)) {
                                return null
                              }
                              const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"
                              const d = [
                                "M", start.x, start.y,
                                "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
                              ].join(" ")
                              return (
                                <path
                                  key={key}
                                  d={d}
                                  fill="none"
                                  stroke={color}
                                  strokeWidth={strokeWidth}
                                  strokeLinecap="round"
                                />
                              )
                            }

                            // 호 그리기
                            let currentAngle = 0
                            const arcs = stageData.slice().reverse().map((stage) => {
                              if (stage.value === 0) return null;
                              const startAngle = currentAngle
                              const endAngle = currentAngle + stage.angle
                              currentAngle += stage.angle
                              return createArc(stage.key, startAngle, endAngle, stage.color)
                            })

                            return (
                              <>
                                {arcs}
                                {/* 중앙 텍스트 제거 */}
                              </>
                            )
                          })()}
                        </svg>

                        {/* 범례 오버레이 */}
                        <div className="absolute top-36 right-4 space-y-2 text-sm">
                        {/* 동적 범례 렌더링 */}
                        {(() => {
                          // stages가 로드되지 않았으면 로딩 표시
                          if (!stages || stages.length === 0) {
                            return (
                              <div className="text-gray-500 text-xs">
                                로딩 중...
                              </div>
                            );
                          }

                          // stages 테이블에서 동적으로 색상 가져오기
                          const stageColors: { [key: string]: string } = {};
                          stages.forEach(stage => {
                            // Tailwind CSS 클래스명을 hex 코드로 변환
                            const colorMap: { [key: string]: string } = {
                              'bg-purple-100 text-purple-800': '#8B5CF6',
                              'bg-blue-100 text-blue-800': '#3B82F6',
                              'bg-green-100 text-green-800': '#10B981',
                              'bg-yellow-100 text-yellow-800': '#F59E0B',
                              'bg-orange-100 text-orange-800': '#F97316',
                              'bg-red-100 text-red-800': '#EF4444',
                              'bg-indigo-100 text-indigo-800': '#6366F1'
                            };
                              stageColors[stage.name] = colorMap[stage.color ?? ''] || '#6B7280';
                          });

                          // 메모이제이션된 차트 데이터 사용
                          const { chartData: legendChartData } = chartDataMemo;

                          // stages 테이블의 id 순서대로 정렬하여 범례 생성
                          const sortedStages = [...stages].sort((a, b) => a.id - b.id);
                          
                          const stageData = sortedStages.map((stage) => {
                            const key = stage.name; // 한글 이름을 직접 키로 사용
                            const value = legendChartData[key] || 0;
                            return {
                              key: key,
                              koreanName: stage.name,
                              value,
                              color: stageColors[stage.name]
                            };
                          }).filter(stage => stage.value > 0); // 값이 있는 단계만 표시

                          return stageData.map((stage, index) => {
                            if (stage.value === 0) return null;

                            return (
                              <div key={stage.key} className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }}></div>
                                <span className="text-gray-700 font-medium text-xs">
                                  {stage.koreanName}: {stage.value}
                                </span>
                              </div>
                            );
                          });
                        })()}
                        </div>

                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* 프레임 2: 서비스선택 */}
          <div className="mb-6" style={{marginLeft: '34px', marginTop: '-676px'}}>
            <div className="w-full" style={{maxWidth: '1170px'}}>
                <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col" style={{
                  height: '652px', 
                  backgroundColor: 'rgba(255, 255, 255, 0)'
                }}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-purple-900">서비스 관리</h3>
                  <h3 className="text-sm text-purple-900">(아래 선택항목을 선택 하세요!)</h3>
                </div>

                {/* 3가지 관리 항목 */}
                <div className="flex justify-center items-center gap-4 h-full">
                  {/* 서비스 작업 List 관리 - 좌측에서 날아오는 애니메이션 */}
                  <div 
                    onClick={() => setShowServiceWorkList(true)}
                    className="bg-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-700 hover:scale-105 transition-all duration-300 ease-in-out flex flex-col items-start justify-start animate-slide-in-left"
                    style={{
                      backgroundImage: `url('/image/선택_서비스작업List관리.jpg')`,
                      backgroundSize: '400px',
                      backgroundPosition: 'center',
                      width: '300px',
                      height: '400px',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 10px 20px rgba(0, 0, 0, 0.3), 0 0 0 3px rgba(255, 255, 255, 0.3)',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      animation: 'slideInLeft 0.8s ease-out forwards',
                      opacity: 0,
                      transform: 'translateX(-100px)'
                    }}
                  >
                    <div className="text-left">
                      <Icon name="laptop-white" className="text-white mb-4" />
                      <h4 className="text-white font-bold text-lg">서비스 작업 List 관리</h4>
                    </div>
                  </div>

                  {/* 자주하는 질문 관리 - 아래쪽에서 날아오는 애니메이션 */}
                  <div 
                    onClick={() => setShowFAQManagement(true)}
                    className="bg-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-700 hover:scale-105 transition-all duration-300 ease-in-out flex flex-col items-start justify-start animate-slide-in-bottom"
                    style={{
                      backgroundImage: `url('/image/선택_자주하는질문관리.jpg')`,
                      backgroundSize: '750px',
                      backgroundPosition: 'center',
                      width: '300px',
                      height: '400px',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 10px 20px rgba(0, 0, 0, 0.3), 0 0 0 3px rgba(255, 255, 255, 0.3)',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      animation: 'slideInBottom 0.8s ease-out 0.2s forwards',
                      opacity: 0,
                      transform: 'translateY(100px)'
                    }}
                  >
                    <div className="text-left">
                      <Icon name="help-circle" size={48} className="text-white mb-4" />
                      <h4 className="text-white font-bold text-lg">자주하는 질문 관리</h4>
                    </div>
                  </div>

                  {/* 일반문의 List 관리 - 우측에서 날아오는 애니메이션 */}
                  <div 
                    onClick={() => setShowGeneralInquiryList(true)}
                    className="bg-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-700 hover:scale-105 transition-all duration-300 ease-in-out flex flex-col items-start justify-start animate-slide-in-right"
                    style={{
                      backgroundImage: `url('/image/선택_일반문의List관리.jpg')`,
                      backgroundSize: '600px',
                      backgroundPosition: 'center',
                      width: '300px',
                      height: '400px',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 10px 20px rgba(0, 0, 0, 0.3), 0 0 0 3px rgba(255, 255, 255, 0.3)',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      animation: 'slideInRight 0.8s ease-out 0.4s forwards',
                      opacity: 0,
                      transform: 'translateX(100px)'
                    }}
                  >
                    <div className="text-left">
                      <Icon name="message-square" size={48} className="text-white mb-4" />
                      <h4 className="text-white font-bold text-lg">일반문의 List 관리</h4>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* 서비스작업 List 관리 프레임 */}
          {showServiceWorkList && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
              <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-hidden">
                {/* 모달 헤더 */}
                <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={async () => {
                        await fetchServiceRequests();
                      }}
                      className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <Icon name="refresh" size={16} />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">서비스 작업 처리 현황</h2>
                  </div>
                  <button
                    onClick={() => setShowServiceWorkList(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Icon name="close" size={24} />
                  </button>
                </div>

                {/* 검색 및 필터 영역 */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      {/* 날짜 선택 */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="date"
                          value={serviceWorkSearchStartDate}
                          max={serviceWorkSearchEndDate}
                          onChange={(e) => {
                            const startDate = e.target.value;
                            setServiceWorkSearchStartDate(startDate);
                            // 시작일이 종료일보다 늦으면 종료일을 시작일로 설정
                            if (startDate && serviceWorkSearchEndDate && startDate > serviceWorkSearchEndDate) {
                              setServiceWorkSearchEndDate(startDate);
                            }
                          }}
                          className="px-3 py-2 border-2 border-gray-400 rounded-lg text-sm font-medium bg-white shadow-sm focus:border-blue-500 focus:outline-none"
                        />
                        <span className="text-gray-600 font-medium">~</span>
                        <input
                          type="date"
                          value={serviceWorkSearchEndDate}
                          min={serviceWorkSearchStartDate}
                          onChange={(e) => {
                            const endDate = e.target.value;
                            setServiceWorkSearchEndDate(endDate);
                            // 종료일이 시작일보다 이르면 시작일을 종료일로 설정
                            if (endDate && serviceWorkSearchStartDate && endDate < serviceWorkSearchStartDate) {
                              setServiceWorkSearchStartDate(endDate);
                            }
                          }}
                          className="px-3 py-2 border-2 border-gray-400 rounded-lg text-sm font-medium bg-white shadow-sm focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      
                      {/* 부서 선택 */}
                      <select
                        value={serviceWorkSelectedDepartment}
                        onChange={(e) => setServiceWorkSelectedDepartment(e.target.value)}
                        className="px-3 py-2 border-2 border-gray-400 rounded-lg text-sm font-medium bg-white shadow-sm focus:border-blue-500 focus:outline-none"
                        disabled={departmentsLoading}
                      >
                        <option value="전체">전체</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.name}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* 단계 선택 - 우측 끝 배치 */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">단계</span>
                      <select
                        value={serviceWorkSelectedStage}
                        onChange={(e) => {
                          setServiceWorkSelectedStage(e.target.value);
                        }}
                        className="px-3 py-2 border-2 border-gray-400 rounded-lg text-sm font-medium bg-white shadow-sm focus:border-blue-500 focus:outline-none"
                        disabled={!stages || stages.length === 0}
                      >
                        <option value="전체">전체</option>
                        {stages.map((stage) => (
                          <option key={stage.id} value={stage.name}>
                            {stage.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 테이블 영역 */}
                <div className="flex-1 overflow-hidden">
                  <div className="overflow-x-auto overflow-y-auto px-4" style={{height: '450px'}}>
                    <table className="w-full text-sm">
                      <thead className="sticky top-0" style={{backgroundColor: '#D4B8F9'}}>
                        <tr>
                          <th className="px-2 py-2 text-center text-sm font-bold text-purple-800">신청번호</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-purple-800">신청시간</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-purple-800">신청제목</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-purple-800">현재상태</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-purple-800">신청자</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-purple-800">신청소속</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-purple-800">배정시간</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-purple-800">단계</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-purple-800">조치자</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-purple-800">조치소속</th>
                          <th className="px-2 py-2 text-center text-sm font-bold text-purple-800">관리</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {serviceRequestsLoading ? (
                          <tr>
                            <td colSpan={11} className="px-2 py-8 text-center text-gray-500">
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                                데이터를 불러오는 중...
                              </div>
                            </td>
                          </tr>
                        ) : serviceRequests.length === 0 ? (
                          <tr>
                            <td colSpan={11} className="px-2 py-8 text-center text-gray-500">
                              조회된 서비스 요청이 없습니다.
                            </td>
                          </tr>
                        ) : (
                          serviceRequests.map((request) => (
                          <tr key={request.id} className="hover:bg-gray-50">
                            <td className="px-2 py-2 text-gray-900 text-center">{request.requestNumber}</td>
                            <td className="px-2 py-2 text-gray-900 text-center">{formatTimeToHHMM(request.requestTime)}</td>
                            <td className="px-2 py-2 text-gray-900">{request.title}</td>
                            <td className="px-2 py-2 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[request.currentStatus] || 'bg-gray-100 text-gray-800'}`}>
                                {request.currentStatus}
                              </span>
                            </td>
                            <td className="px-2 py-2 text-gray-900 text-center">{request.requester}</td>
                            <td className="px-2 py-2 text-gray-900 text-center">{request.department}</td>
                            <td className="px-2 py-2 text-gray-900 text-center">{formatTimeToHHMM(request.assignTime)}</td>
                            <td className="px-2 py-2 text-center">
                              <div className="flex items-center justify-center">
                                {stageIcons[request.stage] && (
                                  <Icon 
                                    name={stageIcons[request.stage].icon} 
                                    size={16} 
                                    className={stageIcons[request.stage].iconColor} 
                                  />
                                )}
                                <span className="ml-1 text-gray-900">{request.stage}</span>
                              </div>
                            </td>
                            <td className="px-2 py-2 text-gray-900 text-center">{request.technician || '-'}</td>
                            <td className="px-2 py-2 text-gray-900 text-center">{request.technicianDepartment || '-'}</td>
                            <td className="px-2 py-2 text-center">
                              <div className="flex space-x-1 justify-center">
                                {/* 접수 단계: 조치담당자 미확정 - 배정작업 버튼 */}
                                {request.stage === '접수' && (
                                  <button
                                    onClick={async () => {
                                      setSelectedWorkRequest(request);
                                      // 기존 데이터로 초기화
                                      const technicianDept = request.technicianDepartment || '';
                                      const technicianName = request.technician || '';
                                      console.log('배정작업 모달 열기 - 기존 데이터:', {
                                        technicianDept,
                                        technicianName,
                                        request: request
                                      });
                                      setAssignmentDepartment(technicianDept);
                                      setAssignmentTechnician(technicianName);
                                      setAssignmentOpinion(request.assignmentOpinion || '');
                                      setAssignmentServiceType(request.serviceType || serviceTypes[0]?.name || '');
                                      console.log('배정작업 모달 - 설정된 값들:', {
                                        technicianDept,
                                        technicianName,
                                        assignmentOpinion: request.assignmentOpinion || '',
                                        serviceType: request.serviceType || serviceTypes[0]?.name || ''
                                      });
                                      // 조치 소속이 있으면 해당 부서의 담당자 목록 로드
                                      if (technicianDept) {
                                        const technicians = await fetchTechniciansByDepartment(technicianDept);
                                        setAssignmentTechnicians(technicians);
                                        console.log('로드된 담당자 목록:', technicians);
                                      } else {
                                        setAssignmentTechnicians([]);
                                      }
                                      setShowServiceAssignmentModal(true);
                                    }}
                                    className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                                  >
                                    배정작업
                                  </button>
                                )}
                                {/* 재배정 단계: 조치담당자 미확정 - 재배정작업 버튼 */}
                                {request.stage === '재배정' && (
                                  <button
                                    onClick={async () => {
                                      setSelectedWorkRequest(request);
                                      // 기존 데이터로 초기화
                                      const technicianDept = request.technicianDepartment || '';
                                      setReassignmentDepartment(technicianDept);
                                      setReassignmentTechnician(request.technician || '');
                                      setReassignmentOpinion(request.assignmentOpinion || '');
                                      setReassignmentServiceType(request.serviceType || serviceTypes[0]?.name || '');
                                      // 조치 소속이 있으면 해당 부서의 담당자 목록 로드
                                      if (technicianDept) {
                                        const technicians = await fetchTechniciansByDepartment(technicianDept);
                                        setReassignmentTechnicians(technicians);
                                      } else {
                                        setReassignmentTechnicians([]);
                                      }
                                      setShowServiceReassignmentModal(true);
                                    }}
                                    className="px-2 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600 transition-colors"
                                  >
                                    재배정작업
                                  </button>
                                )}

                                {/* 배정 단계: 배정취소 버튼 */}
                                {stageButtons[request.stage]?.includes('assignmentCancel') && (
                                  <button
                                    onClick={() => handleAssignmentCancel(request)}
                                    className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                                  >
                                    배정취소
                                  </button>
                                )}

                                {/* 수정/삭제 버튼: 백엔드에서 정의된 단계별 버튼 권한 및 부서 권한 처리 */}
                                {stageButtons[request.stage]?.includes('edit') && stageButtons[request.stage]?.includes('delete') && 
                                  request.technicianDepartment === managerInfo.department && (
                                  <>
                                    <button
                                      onClick={() => {
                                        console.log('수정 모달 열기 - 신청번호:', request?.requestNumber);
                                        console.log('원본 request 데이터:', JSON.stringify(request, null, 2));
                                        // request 객체가 유효한지 확인
                                        if (!request) {
                                          console.error('request 객체가 undefined입니다!');
                                          return;
                                        }
                                        // 먼저 상태 초기화
                                        setServiceWorkScheduledDate('')
                                        setServiceWorkStartDate('')
                                        setServiceWorkContent('')
                                        setServiceWorkCompleteDate('')
                                        setServiceWorkProblemIssue('')
                                        setServiceWorkIsUnresolved(false)
                                        // request 객체를 로컬 변수로 저장
                                        const currentRequest = request;
                                        // 약간의 지연 후 데이터 설정 (React 상태 업데이트 보장)
                                        setTimeout(() => {
                                          setSelectedWorkRequest(currentRequest);
                                          // datetime-local 형식에 맞게 변환 (YYYY-MM-DDTHH:MM)
                                          const formatForDateTimeLocal = (dateStr: string) => {
                                            console.log('formatForDateTimeLocal 입력:', dateStr);
                                            if (!dateStr) {
                                              console.log('빈 문자열 반환');
                                              return '';
                                            }
                                            // API에서 받은 형식: "2025-08-23T00:00" 또는 "2025-08-23T14:00"
                                            // datetime-local 형식: "2025-08-23T00:00" (초 없음)
                                            const result = dateStr.slice(0, 16);
                                            console.log('formatForDateTimeLocal 결과:', result);
                                            return result;
                                          };
                                          const formattedScheduledDate = formatForDateTimeLocal(currentRequest.scheduledDate || '');
                                          const formattedWorkStartDate = formatForDateTimeLocal(currentRequest.workStartDate || '');
                                          const formattedWorkCompleteDate = formatForDateTimeLocal(currentRequest.workCompleteDate || '');
                                          console.log('수정 모달 데이터 로딩:');
                                          console.log('원본 데이터:', JSON.stringify({
                                            scheduledDate: currentRequest.scheduledDate,
                                            workStartDate: currentRequest.workStartDate,
                                            workCompleteDate: currentRequest.workCompleteDate,
                                            workContent: currentRequest.workContent,
                                            problemIssue: currentRequest.problemIssue,
                                            isUnresolved: currentRequest.isUnresolved,
                                            stage: currentRequest.stage
                                          }, null, 2));
                                          console.log('변환된 데이터:', JSON.stringify({
                                            scheduled_date: formattedScheduledDate,
                                            work_start_date: formattedWorkStartDate,
                                            work_complete_date: formattedWorkCompleteDate
                                          }, null, 2));
                                          // 단계별 초기값 설정
                                          const currentStageId = stages.find(s => s.name === currentRequest.stage)?.id || 5;
                                          const currentDateTime = getCurrentDateTime();
                                          console.log('단계별 초기값 설정:', {
                                            currentStage: currentRequest.stage,
                                            currentStageId,
                                            currentDateTime,
                                            hasScheduledDate: !!formattedScheduledDate,
                                            hasWorkStartDate: !!formattedWorkStartDate,
                                            hasWorkCompleteDate: !!formattedWorkCompleteDate
                                          });
                                          // 예정조율일시: 확인 단계(id=4)에서 활성화, 데이터가 없으면 현재 일시
                                          const scheduledDateValue = (currentStageId === 4 && !formattedScheduledDate)
                                            ? currentDateTime
                                            : formattedScheduledDate;
                                          // 작업시작일시: 예정 단계(id=5)에서 활성화, 데이터가 없으면 현재 일시
                                          const workStartDateValue = (currentStageId === 5 && !formattedWorkStartDate)
                                            ? currentDateTime
                                            : formattedWorkStartDate;
                                          // 작업완료일시: 작업 단계(id=6)에서 활성화, 데이터가 없으면 현재 일시
                                          const workCompleteDateValue = (currentStageId === 6 && !formattedWorkCompleteDate)
                                            ? currentDateTime
                                            : formattedWorkCompleteDate;
                                          console.log('설정된 초기값:', {
                                            scheduledDateValue,
                                            workStartDateValue,
                                            workCompleteDateValue
                                          });
                                          setServiceWorkScheduledDate(scheduledDateValue)
                                          setServiceWorkStartDate(workStartDateValue)
                                          setServiceWorkContent(currentRequest.workContent || '')
                                          setServiceWorkCompleteDate(workCompleteDateValue)
                                          setServiceWorkProblemIssue(currentRequest.problemIssue || '')
                                          setServiceWorkIsUnresolved(currentRequest.isUnresolved || false)
                                          // stage는 selectedWorkRequest.stage를 사용하므로 별도 설정 불필요
                                          console.log('상태 변수 설정 완료:', JSON.stringify({
                                            serviceWorkScheduledDate: formattedScheduledDate,
                                            serviceWorkStartDate: formattedWorkStartDate,
                                            serviceWorkCompleteDate: formattedWorkCompleteDate,
                                            serviceWorkContent: currentRequest.workContent || '',
                                            serviceWorkProblemIssue: currentRequest.problemIssue || '',
                                            serviceWorkIsUnresolved: currentRequest.isUnresolved || false,
                                            stage: currentRequest.stage
                                          }, null, 2));
                                        }, 100);
                                        setShowServiceWorkInfoModal(true);
                                      }}
                                      className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                                    >
                                      수정
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedWorkRequest(request);
                                        setShowServiceWorkDeleteModal(true);
                                      }}
                                      className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                                    >
                                      삭제
                                    </button>
                                  </>
                                )}

                                {/* 권한없음 처리: 수정/삭제 버튼이 있는 단계이지만 부서 권한이 없는 경우 */}
                                {stageButtons[request.stage]?.includes('edit') && stageButtons[request.stage]?.includes('delete') && 
                                  request.technicianDepartment !== managerInfo.department && (
                                  <span className="text-gray-400 text-xs">권한없음</span>
                                )}
                              </div>
                            </td>
                          </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 페이지네이션 - 시스템관리 페이지 패턴 */}
                {(serviceWorkTotalPages > 1 || serviceRequests.length > 0) && (
                  <div className="flex justify-center mt-4 pt-4 pb-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          const newPage = Math.max(1, serviceRequestsPagination.page - 1);
                          setServiceRequestsPagination(prev => ({ ...prev, page: newPage }));
                        }}
                        disabled={serviceRequestsPagination.page === 1}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        이전
                      </button>
                      <span className="px-2 py-1 bg-blue-500 text-white rounded text-xs">
                        {serviceRequestsPagination.page}/{serviceWorkTotalPages}
                      </span>
                      <button
                        onClick={() => {
                          const newPage = Math.min(serviceWorkTotalPages, serviceRequestsPagination.page + 1);
                          setServiceRequestsPagination(prev => ({ ...prev, page: newPage }));
                        }}
                        disabled={serviceRequestsPagination.page >= serviceWorkTotalPages}
                        className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        다음
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* 프레임 3: 일반문의 현황 */}
          <div className="absolute" style={{left: '1590px', top: '84px'}}>
            <div className="w-80" style={{width: '306px'}}>
              <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col" style={{height: '650px', backgroundColor: 'rgba(255, 255, 255, 0.5)'}}>
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <button
                      onClick={() => {
                        fetchManagerInquiryStatistics();
                      }}
                      className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <Icon name="refresh" size={16} />
                    </button>
                    <h3 className="text-lg font-bold text-gray-800">일반문의 현황</h3>
                  </div>
                  <div className="flex justify-end" style={{marginTop: '30px'}}>
                    <button
                      onClick={() => setShowGeneralInquiryStatus(!showGeneralInquiryStatus)}
                      className={`w-8 h-4 rounded-full transition-colors ${
                        showGeneralInquiryStatus ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    >
                      <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                        showGeneralInquiryStatus ? 'translate-x-4' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>

                {showGeneralInquiryStatus && (
                  <>
                    {/* 부서 선택 */}
                    <div className="mb-4">
                      <select
                        value={inquirySelectedDepartment}
                        onChange={(e) => {
                          setInquirySelectedDepartment(e.target.value)
                          setInquiryCurrentDepartment(e.target.value || '전체 부서')
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        disabled={departmentsLoading}
                      >
                        <option value="">전체 부서</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.name}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 검색 기간 선택 */}
                    <div className="mb-4">
                      <div className="flex items-center space-x-1">
                        <input
                          type="date"
                          value={inquiryStartDate}
                          max={inquiryEndDate}
                          onChange={(e) => {
                            const startDate = e.target.value;
                            setInquiryStartDate(startDate);
                            // 시작일이 종료일보다 늦으면 종료일을 시작일로 설정
                            if (startDate && inquiryEndDate && startDate > inquiryEndDate) {
                              setInquiryEndDate(startDate);
                            }
                          }}
                          className="w-full px-2 py-2 border border-gray-300 rounded-lg text-xs"
                        />
                        <span className="text-gray-500 text-sm">~</span>
                        <input
                          type="date"
                          value={inquiryEndDate}
                          min={inquiryStartDate}
                          onChange={(e) => {
                            const endDate = e.target.value;
                            setInquiryEndDate(endDate);
                            // 종료일이 시작일보다 이르면 시작일을 종료일로 설정
                            if (endDate && inquiryStartDate && endDate < inquiryStartDate) {
                              setInquiryStartDate(endDate);
                            }
                          }}
                          className="w-full px-2 py-2 border border-gray-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    {/* 스택 막대 차트 (시스템관리 페이지와 동일) */}
                    <div className="flex justify-center items-center h-96">
                      <div className="w-full h-80 relative">
                        <div className="flex justify-center h-full">
                          {/* 스택 막대 */}
                          <div className="flex flex-col items-center">
                            {(() => {
                              // 시스템관리 페이지와 동일: 프론트엔드에서 직접 계산 (숫자형 변환)
                              const answered = inquiryData.answered || 0;
                              const pending = inquiryData.unanswered || 0;
                              const total = answered + pending;
                              
                              // 데이터가 없으면 "데이터 없음" 표시
                              if (total === 0) {
                                return (
                                  <div className="w-32 h-32 flex items-center justify-center bg-gray-100 rounded-lg">
                                    <span className="text-gray-500 text-sm">데이터 없음</span>
                                  </div>
                                );
                              }
                              
                              // T값: 고정 박스 크기 (300px)
                              const T = 300; // 항상 300px 고정                              
                              // A값: 답변 비율에 따른 높이
                              const A = (answered / total) * T;                              
                              // B값: 미답변 비율에 따른 높이  
                              const B = (pending / total) * T;                              
                              return (
                                <div className="w-32 relative" style={{ height: `${T}px` }}>
                                  {/* 미답변 (주황색) - 상단 */}
                                  <div
                                    className="w-full bg-orange-500 rounded-t absolute top-0 flex items-center justify-center"
                                    style={{ 
                                      height: `${B}px`
                                    }}
                                  >
                                    <span className="text-black text-sm font-bold">
                                      {pending}
                                    </span>
                                  </div>
                                  {/* 답변 (초록색) - 하단 */}
                                  <div
                                    className="w-full bg-green-500 rounded-b absolute bottom-0 flex items-center justify-center"
                                    style={{ 
                                      height: `${A}px` 
                                    }}
                                  >
                                    <span className="text-black text-sm font-bold">
                                      {answered}
                                    </span>
                                  </div>
                                </div>
                              );
                            })()}
                            {/* 라벨 */}
                            <div className="mt-3 text-center">
                              <div className="flex items-center space-x-3 text-sm">
                                <div className="flex items-center space-x-1">
                                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                                  <span>미답변</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                                  <span>답변</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="relative z-10 text-white py-4">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm">ⓒ 2025 IT 서비스 관리 시스템. 모든권리는 Juss 가 보유</p>
        </div>
      </footer>
      {/* 배정확인 모달 */}
      {showAssignmentModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="assignment-confirm" size={24} className="mr-2" />
                배정 확인
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 - 2열 레이아웃 */}
            <div className="py-4 px-6">
              <div className="grid grid-cols-2 gap-6">
                {/* 왼쪽: 서비스신청정보 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="user" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">서비스 신청 정보</h3>
                  </div>
                  
                  <div className="space-y-0">
                    <div>
                      <span className="text-sm font-medium text-gray-600">신청 번호 : </span>
                      <span className="text-sm font-bold text-red-600">{selectedRequest.requestNumber}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">신청 제목 : </span>
                      <span className="text-sm">{selectedRequest.title}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">신청 내용 </span>
                      <div className="text-sm mt-1 p-3 bg-gray-50 rounded text-gray-700 min-h-24 max-h-48 overflow-y-auto whitespace-pre-wrap">
                        {selectedRequest.content}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="user" size={14} className="mr-1" />
                        신청자 : <span className="text-sm ml-1 text-black">{selectedRequest.requester} ({selectedRequest.department})</span>
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="mail" size={14} className="mr-1" />
                        신청 연락처 : <span className="text-sm ml-1 text-black">{selectedRequest.contact}</span>
                      </span>                    
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="briefcase" size={14} className="mr-1" />
                        신청 위치 
                      </span>
                      <span className="text-sm ml-5">{selectedRequest.location}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="calendar" size={14} className="mr-1" />
                        신청 일시 : <span className="text-sm ml-1 text-black">{selectedRequest.requestDate} {selectedRequest.requestTime}</span>
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="message-square" size={14} className="mr-1" />
                        현재 상태 : <span className="text-sm ml-1 text-red-600 font-semibold">{selectedRequest.currentStatus}</span>
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">실제 신청자 : </span>
                      <span className="text-sm ml-1">{selectedRequest.actualRequester || selectedRequest.requester}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">실제 연락처 : </span>
                      <span className="text-sm ml-1">{selectedRequest.actualContact || selectedRequest.contact}</span>
                    </div>
                  </div>
                </div>

                {/* 오른쪽: 배정 반려 (반려 버튼 클릭 시에만 표시) */}
                {showRejectionInAssignment && (
                  <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center space-x-2 mb-4">
                      <Icon name="assignment-reject" size={20} className="text-orange-600" />
                      <h3 className="text-lg font-semibold text-gray-800">배정 반려</h3>
                    </div>
                    
                    <div className="space-y-0">
                      <div>
                        <span className="text-sm font-medium text-gray-600">배정 일시 : </span>
                        <span className="text-sm">{selectedRequest.assignDate || '2025.08.31 11:10'}</span>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-600">배정 담당자 : </span>
                        <span className="text-sm">{selectedRequest.assignee || '이배정'}</span>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-600">배정 의견 : </span>
                        <span className="text-sm">{selectedRequest.assignmentOpinion || '업무에 적합하여 배정'}</span>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-600">서비스 조치유형 → </span>
                        <span className="text-sm">{selectedRequest.serviceType}</span>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-600">조치 담당자 : </span>
                        <span className="text-sm">김기술</span>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-600">반려 의견 : </span>
                        <textarea
                          value={rejectionOpinion}
                          onChange={(e) => setRejectionOpinion(e.target.value)}
                          placeholder="배정 담당자 의견"
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex gap-3 py-4 px-6 border-t border-gray-200">
              {!showRejectionInAssignment ? (
                <>
                  <button
                    onClick={handleAssignmentApprove}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-all duration-200 button-smooth"
                  >
                    승인
                  </button>
                  <button
                    onClick={handleAssignmentReject}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium transition-all duration-200 button-smooth"
                  >
                    반려
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowRejectionInAssignment(false)}
                    className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 button-smooth"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleFinalReject}
                    className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-all duration-200 button-smooth"
                  >
                    최종 반려
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* 정보확인 모달 */}
      {showInfoViewModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="assignment-confirm" size={24} className="mr-2" />
                정보 확인
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 - 2열 레이아웃 */}
            <div className="py-4 px-6">
              <div className="grid grid-cols-2 gap-6">
                {/* 왼쪽: 서비스신청정보 */}
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
                      <div className="text-sm mt-1 p-3 bg-gray-50 rounded text-gray-700 min-h-24 max-h-48 overflow-y-auto whitespace-pre-wrap">
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
                        신청일시: <span className="text-sm ml-1 text-black">{selectedRequest.requestDate} {selectedRequest.requestTime}</span>
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="message-square" size={14} className="mr-1" />
                        현재상태: 
                      </span>
                      <span className="text-sm ml-5 text-red-600 font-semibold">{selectedRequest.currentStatus}</span>
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

                {/* 오른쪽: 작업정보등록 (작업정보등록 버튼 클릭 시에만 표시) */}
                {showWorkRegistrationInInfo && (
                  <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center space-x-2 mb-4">
                      <Icon name="settings" size={20} className="text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-800">작업정보등록</h3>
                    </div>
                    
                    <div className="space-y-0 py-0">
                      {/* 배정 정보 */}
                      <div className="bg-gray-50 px-4 py-0 rounded-lg">
              <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium text-gray-600">배정일시 :</span>
                            <span className="text-sm text-gray-800 ml-2">{selectedRequest.assignDate || '2025.08.31 10:40'}</span>
                </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600">배정 담당자 :</span>
                            <span className="text-sm text-gray-800 ml-2">{selectedRequest.assignee || '이배정'}</span>
                </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600">서비스 조치 정보 :</span>
                            <span className="text-sm text-gray-800 ml-2">{selectedRequest.serviceType || '문제'}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600">조치담당자 :</span>
                            <span className="text-sm text-gray-800 ml-2">김기술</span>
              </div>
            </div>
          </div>


                      {/* 예정 조율 일시 */}
                      <div className={`px-4 py-0 rounded-lg border-2 ${currentStage === '예정' ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-600 mb-2">예정 조율 일시</label>
                            <input
                              type="datetime-local"
                              value={scheduledDate}
                              onChange={(e) => setScheduledDate(e.target.value)}
                              disabled={currentStage !== '예정'}
                              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                currentStage !== '예정' ? 'bg-gray-100 cursor-not-allowed' : ''
                              }`}
                            />
                          </div>
                          {currentStage === '예정' && (
                            <div className="flex items-center gap-2">
                              <Icon name="calendar" className="w-5 h-5 text-gray-400" />
            <button
                                onClick={handleScheduledProcess}
                                disabled={!scheduledDate}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                  scheduledDate
                                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                처리
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 작업 시작 일시 */}
                      <div className={`px-4 py-0 rounded-lg border-2 ${currentStage === '작업' ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-600 mb-2">작업 시작 일시</label>
                            <input
                              type="datetime-local"
                              value={workStartDate}
                              onChange={(e) => setWorkStartDate(e.target.value)}
                              disabled={currentStage !== '작업'}
                              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                currentStage !== '작업' ? 'bg-gray-100 cursor-not-allowed' : ''
                              }`}
                            />
                          </div>
                          {currentStage === '작업' && (
                            <div className="flex items-center gap-2">
                              <Icon name="calendar" className="w-5 h-5 text-gray-400" />
                              <button
                                onClick={handleWorkStartProcess}
                                disabled={!workStartDate}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                  workStartDate
                                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                처리
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 작업 내역 및 완료 일시 */}
                      <div className={`px-4 py-0 rounded-lg border-2 ${currentStage === '완료' ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="space-y-0">
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">작업 내역</label>
                            <textarea
                              value={workContent}
                              onChange={(e) => setWorkContent(e.target.value)}
                              disabled={currentStage !== '완료'}
                              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                currentStage !== '완료' ? 'bg-gray-100 cursor-not-allowed' : ''
                              }`}
                              rows={3}
                              placeholder="작업 내용 입력"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">작업 완료 일시</label>
                            <input
                              type="datetime-local"
                              value={workCompleteDate}
                              onChange={(e) => setWorkCompleteDate(e.target.value)}
                              disabled={currentStage !== '완료'}
                              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                currentStage !== '완료' ? 'bg-gray-100 cursor-not-allowed' : ''
                              }`}
                            />
                          </div>
                          {currentStage === '완료' && (
                            <div className="flex justify-end">
                              <button
                                onClick={handleWorkCompleteProcess}
                                disabled={!workContent || !workCompleteDate}
                                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                                  workContent && workCompleteDate
                                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                처리
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 문제 사항 */}
                      <div className={`px-4 py-0 rounded-lg border-2 ${currentStage === '미결' ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-600 mb-2">문제 사항</label>
                            <textarea
                              value={problemIssue}
                              onChange={(e) => setProblemIssue(e.target.value)}
                              disabled={currentStage !== '미결'}
                              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                                currentStage !== '미결' ? 'bg-gray-100 cursor-not-allowed' : ''
                              }`}
                              rows={3}
                              placeholder="작업 중 발견 된 문제점 입력"
                            />
                          </div>
                          {currentStage === '미결' && (
                            <div className="flex items-start gap-2">
                              <button
                                onClick={handleUnresolvedProcess}
                                className="px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-pink-500 hover:bg-pink-600 text-white"
                              >
                                등재
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="mt-3 flex items-center">
                          <input
                            type="checkbox"
                            id="unresolved"
                            checked={isUnresolved}
                            onChange={(e) => setIsUnresolved(e.target.checked)}
                            disabled={currentStage !== '미결'}
                            className={`mr-2 ${currentStage !== '미결' ? 'cursor-not-allowed' : ''}`}
                          />
                          <label htmlFor="unresolved" className={`text-sm font-medium ${
                            currentStage !== '미결' ? 'text-gray-400' : 'text-gray-700'
                          }`}>
                            미결 완료
                          </label>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* 오른쪽: 빈 공간 (작업정보등록 버튼 클릭 전) */}
                {!showWorkRegistrationInInfo && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="settings" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">작업정보등록</h3>
                  </div>
                  
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">작업정보등록을 시작하려면</p>
                    <p className="text-gray-500 mb-6">하단 버튼을 클릭하세요</p>
                  </div>
                </div>
                )}
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex gap-3 py-4 px-6 border-t border-gray-200">
              {!showWorkRegistrationInInfo ? (
                <>
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                취소
              </button>
              <button
                    onClick={handleWorkRegistrationInInfo}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                작업 정보 등록
              </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowWorkRegistrationInInfo(false)}
                    className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 button-smooth"
                  >
                    뒤로가기
            </button>
            <button
              onClick={() => {
                      closeModal()
                      setShowWorkCompleteModal(true)
              }}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 button-smooth"
            >
                    작업 확인 완료
            </button>
                </>
              )}
          </div>
        </div>
      </div>
      )}

      {/* 비밀번호 변경 모달 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="lock" size={24} className="mr-2" />
                비밀번호 변경
              </h2>
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setCurrentPassword('')
                  setNewPassword('')
                  setConfirmPassword('')
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
    </div>

            {/* 모달 내용 */}
            <div className="py-4 px-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <Icon name="lock" size={16} className="mr-2" />
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
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <Icon name="lock" size={16} className="mr-2" />
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
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <Icon name="lock" size={16} className="mr-2" />
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

            {/* 모달 하단 버튼 */}
            <div className="flex gap-3 py-4 px-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setCurrentPassword('')
                  setNewPassword('')
                  setConfirmPassword('')
                }}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                취소
              </button>
              <button
                onClick={async () => {
                  // 비밀번호 변경 로직
                  if (!currentPassword || !newPassword || !confirmPassword) {
                    alert('모든 필드를 입력해주세요.')
                    return
                  }
                  if (newPassword !== confirmPassword) {
                    alert('새 비밀번호가 일치하지 않습니다.')
                    return
                  }
                  if (newPassword.length < 8) {
                    alert('비밀번호는 8자 이상이어야 합니다.')
                    return
                  }

                  try {
                    if (!currentUserId) {
                      alert('사용자 정보를 찾을 수 없습니다.')
                      return
                    }

                    // API를 통해 비밀번호 변경
                    const response = await apiClient.changeUserPassword(
                      currentUserId,
                      currentPassword,
                      newPassword
                    )

                    if (response.success) {
                      alert('비밀번호가 성공적으로 변경되었습니다.')
                      setShowPasswordModal(false)
                      setCurrentPassword('')
                      setNewPassword('')
                      setConfirmPassword('')
                    } else {
                      alert(response.message || '비밀번호 변경에 실패했습니다.')
                    }
                  } catch (error) {
                    console.error('Password change error:', error)
                    alert('비밀번호 변경 중 오류가 발생했습니다.')
                  }
                }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                변경
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
                  value={managerInfo.email}
                  readOnly
                  className="w-full px-3 py-1 border-0 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed focus:outline-none"
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
                  value={managerInfo.fullName}
                  onChange={(e) => setManagerInfo({...managerInfo, fullName: e.target.value})}
                  className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 직급 */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <Icon name="briefcase" size={16} className="mr-2" />
                  직급
                </label>
                <select
                  value={managerInfo.position}
                  onChange={(e) => setManagerInfo({...managerInfo, position: e.target.value})}
                  className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={positionsLoading}
                >
                  <option value="">
                    {positionsLoading ? '로딩 중...' : '직급을 선택하세요'}
                  </option>
                  {positions.map((position) => (
                    <option key={position.id} value={position.name}>
                      {position.name}
                    </option>
                  ))}
                </select>
                {positionsLoading && (
                  <p className="text-xs text-gray-500 mt-1">직급 목록을 불러오는 중...</p>
                )}
              </div>

              {/* 소속 */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <Icon name="briefcase" size={16} className="mr-2" />
                  소속
                </label>
                <select
                  value={managerInfo.department}
                  onChange={(e) => setManagerInfo({...managerInfo, department: e.target.value})}
                  className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={departmentsLoading}
                >
                  <option value="">
                    {departmentsLoading ? '로딩 중...' : '소속을 선택하세요'}
                  </option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 연락처 */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <Icon name="mail" size={16} className="mr-2" />
                  연락처
                </label>
                <input
                  type="tel"
                  value={managerInfo.phone}
                  onChange={(e) => setManagerInfo({...managerInfo, phone: e.target.value})}
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
                  value={(() => {
                    // YYYY-MM-DD hh:mm 형식으로 변환
                    if (managerInfo.createDate) {
                      try {
                        const date = new Date(managerInfo.createDate);
                        if (!isNaN(date.getTime())) {
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
                          const hours = String(date.getHours()).padStart(2, '0');
                          const minutes = String(date.getMinutes()).padStart(2, '0');
                          return `${year}-${month}-${day} ${hours}:${minutes}`;
                        }
                      } catch (e) {
                        console.error('Date parsing error:', e);
                      }
                    }
                    return managerInfo.createDate || '-';
                  })()}
                  readOnly
                  className="w-full px-3 py-1 border-0 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed focus:outline-none"
                />
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-end py-4 px-6 border-t border-gray-200">
              <button
                onClick={async () => {
                  if (!currentUserId) {
                    alert('사용자 ID를 찾을 수 없습니다.');
                    return;
                  }

                  try {
                    // API를 통해 사용자 정보 업데이트
                    const updateData = {
                      name: managerInfo.fullName,
                      department: managerInfo.department,
                      position: managerInfo.position,
                      phone: managerInfo.phone
                    };

                    const response = await apiClient.updateUser(currentUserId, updateData);

                    if (response.success) {
                      // 로컬 스토리지의 사용자 정보도 업데이트
                      const userStr = localStorage.getItem('user');
                      if (userStr) {
                        const currentUser = JSON.parse(userStr);
                        const updatedUser = {
                          ...currentUser,
                          name: managerInfo.fullName,
                          department: managerInfo.department,
                          position: managerInfo.position,
                          phone: managerInfo.phone,
                          status: currentUser.status // status 명시적으로 유지
                        };
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                      }

                      // 상태 업데이트
                      setManagerInfo({ ...managerInfo, name: managerInfo.fullName });

                      // 모달 닫기 및 성공 모달 표시
                      setShowInfoModal(false);
                      setShowInfoSuccessModal(true);
                    } else {
                      alert(response.error || '회원정보 수정에 실패했습니다.');
                    }
                  } catch (error) {
                    console.error('회원정보 수정 오류:', error);
                    alert('회원정보 수정 중 오류가 발생했습니다.');
                  }
                }}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                회원정보 수정
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 정보수정 성공 모달 */}
      {showInfoSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="check-circle" size={24} className="mr-2 text-green-600" />
                수정 완료
              </h2>
              <button
                onClick={() => setShowInfoSuccessModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="py-6 px-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="check-circle" size={32} className="text-green-600" />
              </div>
              <p className="text-gray-600 mb-6">회원정보가 성공적으로 수정되었습니다.</p>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-end py-4 px-6 border-t border-gray-200">
              <button
                onClick={() => setShowInfoSuccessModal(false)}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 배정승인 성공 모달 */}
      {showApprovalSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="check-circle" size={24} className="mr-2 text-green-600" />
                승인 완료
              </h2>
              <button
                onClick={() => setShowApprovalSuccessModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="py-6 px-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="check-circle" size={32} className="text-green-600" />
              </div>
              <p className="text-gray-600 mb-6">배정 승인 되었습니다.</p>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-end py-4 px-6 border-t border-gray-200">
              <button
                onClick={() => setShowApprovalSuccessModal(false)}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 최종반려 성공 모달 */}
      {showRejectionSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="assignment-reject" size={24} className="mr-2 text-orange-600" />
                반려 완료
              </h2>
              <button
                onClick={() => setShowRejectionSuccessModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="py-6 px-6 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="assignment-reject" size={32} className="text-orange-600" />
              </div>
              <p className="text-gray-600 mb-6">배정 반려가 되었습니다.</p>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-end py-4 px-6 border-t border-gray-200">
              <button
                onClick={() => setShowRejectionSuccessModal(false)}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 작업정보등록 모달 */}
      {showWorkRegistrationModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="settings" size={24} className="mr-2" />
                작업정보등록
              </h2>
              <button
                onClick={() => setShowWorkRegistrationModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 - 2열 레이아웃 */}
            <div className="py-4 px-6">
              <div className="grid grid-cols-2 gap-6">
                {/* 왼쪽: 서비스신청정보 (읽기전용) */}
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
                      <div className="text-sm mt-1 p-3 bg-gray-50 rounded text-gray-700 min-h-24 max-h-48 overflow-y-auto whitespace-pre-wrap">
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
                        신청일시: <span className="text-sm ml-1 text-black">{selectedRequest.requestDate} {selectedRequest.requestTime}</span>
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="message-square" size={14} className="mr-1" />
                        현재상태: 
                      </span>
                      <span className="text-sm ml-5 text-red-600 font-semibold">{selectedRequest.currentStatus}</span>
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

                {/* 오른쪽: 작업정보등록 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="settings" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">작업정보등록</h3>
                  </div>
                  
                  <div className="space-y-0">
                    {/* 배정정보 (읽기전용) */}
                    <div className="mb-4 p-3 bg-gray-50 rounded">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">배정정보</h4>
                      <div className="space-y-1 text-xs">
                        <div><span className="font-medium">배정일시:</span> {selectedRequest.assignDate || '2025.08.31 11:10'}</div>
                        <div><span className="font-medium">배정담당자:</span> {selectedRequest.assignee || '이배정'}</div>
                        <div><span className="font-medium">배정의견:</span> {selectedRequest.assignmentOpinion || '업무에 적합하여 배정'}</div>
                        <div><span className="font-medium">서비스유형:</span> {selectedRequest.serviceType}</div>
                        <div><span className="font-medium">조치담당자:</span> 김기술</div>
                      </div>
                    </div>

                    {/* 현재 단계 표시 */}
                    <div className="mb-4 p-2 bg-blue-50 rounded text-center">
                      <span className="text-sm font-medium text-blue-600">현재 단계: {currentStage}</span>
                    </div>

                    {/* 예정 단계 */}
                    {currentStage === '예정' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">예정조율일시</label>
                          <input
                            type="datetime-local"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <button
                          onClick={handleScheduledProcess}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-all duration-200"
                        >
                          처리
                        </button>
                      </div>
                    )}

                    {/* 작업 단계 */}
                    {currentStage === '작업' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">작업시작일시</label>
                          <input
                            type="datetime-local"
                            value={workStartDate}
                            onChange={(e) => setWorkStartDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <button
                          onClick={handleWorkStartProcess}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-all duration-200"
                        >
                          처리
                        </button>
                      </div>
                    )}

                    {/* 완료 단계 */}
                    {currentStage === '완료' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">작업내역</label>
                          <textarea
                            value={workContent}
                            onChange={(e) => setWorkContent(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="작업 내용을 입력하세요"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">작업완료일시</label>
                          <input
                            type="datetime-local"
                            value={workCompleteDate}
                            onChange={(e) => setWorkCompleteDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <button
                          onClick={handleWorkCompleteProcess}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-all duration-200"
                        >
                          처리
                        </button>
                      </div>
                    )}

                    {/* 미결 단계 */}
                    {currentStage === '미결' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">문제사항</label>
                          <textarea
                            value={problemIssue}
                            onChange={(e) => setProblemIssue(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="문제사항을 입력하세요"
                          />
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="unresolved"
                            checked={isUnresolved}
                            onChange={(e) => setIsUnresolved(e.target.checked)}
                            className="mr-2"
                          />
                          <label htmlFor="unresolved" className="text-sm font-medium text-gray-700">
                            미해결완료
                          </label>
                        </div>
                        <button
                          onClick={handleUnresolvedProcess}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium transition-all duration-200"
                        >
                          등재
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex gap-3 py-4 px-6 border-t border-gray-200">
              <button
                onClick={() => setShowWorkRegistrationModal(false)}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 작업완료 모달 */}
      {showWorkCompleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="check-circle" size={24} className="mr-2 text-green-600" />
                작업 확인
              </h2>
              <button
                onClick={() => setShowWorkCompleteModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="py-6 px-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="check-circle" size={32} className="text-green-600" />
              </div>
              <p className="text-gray-600 mb-6">작업을 확인 하셨습니다.</p>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-end py-4 px-6 border-t border-gray-200">
              <button
                onClick={() => setShowWorkCompleteModal(false)}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 배정작업 모달 */}
      {showServiceAssignmentModal && selectedWorkRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{ paddingTop: '30px' }}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="user" size={24} className="mr-2" />
                배정작업
              </h2>
              <button
                onClick={() => setShowServiceAssignmentModal(false)}
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
                    <h3 className="text-lg font-semibold text-gray-800">서비스 신청 정보</h3>
                  </div>
                  <div className="space-y-1">
                    <div className="py-1">
                      <span className="text-sm font-medium text-gray-600">신청 번호 : </span>
                      <span className="text-sm font-bold text-red-600">{selectedWorkRequest.requestNumber}</span>
                    </div>
                    <div className="py-1">
                      <span className="text-sm font-medium text-gray-600">신청 제목 : </span>
                      <span className="text-sm">{selectedWorkRequest.title}</span>
                    </div>
                    <div className="py-1">
                      <span className="text-sm font-medium text-gray-600">신청 내용 </span>
                      <div className="text-sm mt-1 p-3 bg-gray-50 rounded text-gray-700 min-h-24 max-h-48 overflow-y-auto whitespace-pre-wrap">
                        {selectedWorkRequest.content}
                      </div>
                    </div>
                    <div className="py-1">
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="user" size={14} className="mr-1" />
                        신청자 :  <span className="text-sm ml-1">{selectedWorkRequest.requester} ({selectedWorkRequest.department})</span>
                      </span>
                    </div>
                    <div className="py-1">
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="mail" size={14} className="mr-1" />
                        신청 연락처 : <span className="text-sm ml-1">{selectedWorkRequest.contact}</span>
                      </span>
                    </div>
                    <div className="py-1">
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="briefcase" size={14} className="mr-1" />
                        신청 위치
                      </span>
                      <div className="text-sm mt-1 p-3 bg-gray-50 rounded text-gray-700 min-h-16 max-h-32 overflow-y-auto whitespace-pre-wrap">
                        {selectedWorkRequest.location}
                      </div>
                    </div>
                    <div className="py-1 mb-5">
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="calendar" size={14} className="mr-1" />
                        신청 일시 : <span className="text-sm ml-1 text-black">{selectedWorkRequest.requestDate} {formatTimeToHHMM(selectedWorkRequest.requestTime)}</span>
                      </span>
                    </div>
                    <div className="py-1 mb-5">
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="message-square" size={14} className="mr-1" />
                        현재 상태 : <span className="text-sm ml-1 text-red-600 font-semibold">{selectedWorkRequest.currentStatus}</span>
                      </span>
                    </div>
                    {selectedWorkRequest.actualRequester && (
                      <div className="py-1">
                        <span className="text-sm font-medium text-gray-600">실제 신청자 : </span>
                        <span className="text-sm ml-1">{selectedWorkRequest.actualRequester}</span>
                      </div>
                    )}
                    {selectedWorkRequest.actualContact && (
                      <div className="py-1">
                        <span className="text-sm font-medium text-gray-600">실제 연락처 : </span>
                        <span className="text-sm ml-1">{selectedWorkRequest.actualContact}</span>
                      </div>
                    )}
                    {selectedWorkRequest.actualRequesterDepartment && (
                      <div className="py-1">
                        <span className="text-sm font-medium text-gray-600">실제 소속 : </span>
                        <span className="text-sm ml-1">{selectedWorkRequest.actualRequesterDepartment}</span>
                      </div>
                    )}
                  </div>
                </div>
                {/* 배정정보 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="settings" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">배정 작업 정보</h3>
                  </div>
                  <div className="space-y-0">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">조치 소속</label>
                      <select
                        value={assignmentDepartment}
                        onChange={(e) => handleAssignmentDepartmentChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">소속을 선택해 주세요.</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.name}>{dept.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">조치 담당자</label>
                      <select
                        value={assignmentTechnician}
                        onChange={(e) => setAssignmentTechnician(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!assignmentDepartment}
                      >
                        <option value="">조치자를 선택하세요</option>
                        {Array.isArray(assignmentTechnicians) && assignmentTechnicians.map(technician => (
                          <option key={technician.id} value={technician.name}>{technician.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">배정 의견</label>
                      <textarea
                        value={assignmentOpinion}
                        onChange={(e) => setAssignmentOpinion(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                        placeholder="배정 담당자 의견을 입력하세요"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                        <Icon name="calendar" size={16} className="mr-1" />
                        배정 일시(현재)
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
                        value={assignmentServiceType}
                        onChange={(e) => setAssignmentServiceType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {serviceTypes.map(type => (
                          <option key={type.id} value={type.name}>{type.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* 모달 하단 버튼 */}
            <div className="flex justify-end py-4 px-6 border-t border-gray-200 space-x-3">
              <button
                onClick={() => setShowServiceAssignmentModal(false)}
                className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-all duration-200"
              >
                취소
              </button>
              <button
                onClick={async () => {
                  if (!assignmentDepartment || !assignmentTechnician) {
                    alert('조치담당 소속과 조치담당자를 선택해주세요.');
                    return;
                  }
                  try {
                    // 조치자 ID 찾기
                    const selectedTechnician = assignmentTechnicians.find(t => t.name === assignmentTechnician);
                    const technicianId = selectedTechnician?.id || null;
                    // 현재 로그인 사용자 정보 가져오기
                    const userStr = localStorage.getItem('user');
                    let currentUser = null;
                    if (userStr) {
                      currentUser = JSON.parse(userStr);
                    }
                    // 사용자 정보가 없으면 오류 처리
                    if (!currentUser) {
                      alert('로그인 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
                      return;
                    }
                    const updateData = {
                      stage: '배정',
                      // 조치소속은 technician_department에 저장
                      technician_department: assignmentDepartment,
                      // 조치자는 technician_name과 technician_id에 저장
                      technician_name: assignmentTechnician,
                      technician_id: technicianId,
                      // 배정의견은 assignment_opinion에 저장
                      assignment_opinion: assignmentOpinion,
                      // 서비스 타입
                      service_type: assignmentServiceType,
                      // 배정일시는 현재시점 기준 assign_date(날짜+시간)와 assign_time(시간만)에 저장
                      assign_date: new Date().toISOString(), // YYYY-MM-DDTHH:MM:SS.sssZ 형식
                      assign_time: new Date().toTimeString().split(' ')[0].substring(0, 5), // HH:MM 형식
                      // 배정담당자는 현재 로그인 사용자 (assignee_name, assignee_id, assignee_department)
                      assignee_name: currentUser.name,
                      assignee_id: currentUser.id,
                      assignee_department: currentUser.department
                    };
                    const response = await apiClient.put(`/service-requests/${selectedWorkRequest?.id}`, updateData);
                    if (response.success) {
                      alert('배정이 완료되었습니다.');
                      setShowServiceAssignmentModal(false);
                      // 상태 초기화
                      setAssignmentDepartment('');
                      setAssignmentTechnician('');
                      setAssignmentOpinion('');
                      setAssignmentServiceType(serviceTypes[0]?.name || '');
                      // 목록 새로고침
                      await fetchServiceRequests();
                    } else {
                      alert('배정 중 오류가 발생했습니다: ' + response.error);
                    }
                  } catch (error) {
                    console.error('배정 오류:', error);
                    alert('배정 중 오류가 발생했습니다.');
                  }
                }}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200"
              >
                배정하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 재배정작업 모달 */}
      {showServiceReassignmentModal && selectedWorkRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="refresh" size={24} className="mr-2" />
                재배정작업
              </h2>
              <button
                onClick={() => setShowServiceReassignmentModal(false)}
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
                    <h3 className="text-lg font-semibold text-gray-800">서비스 신청 정보</h3>
                  </div>
                  <div className="space-y-1">
                    <div className="py-1">
                      <span className="text-sm font-medium text-gray-600">신청 번호 : </span>
                      <span className="text-sm font-bold text-blue-600">{selectedWorkRequest.requestNumber}</span>
                    </div>
                    <div className="py-1">
                      <span className="text-sm font-medium text-gray-600">신청 제목 : </span>
                      <span className="text-sm">{selectedWorkRequest.title}</span>
                    </div>
                    <div className="py-1">
                      <span className="text-sm font-medium text-gray-600">신청 내용 </span>
                      <div className="text-sm mt-1 p-3 bg-gray-50 rounded text-gray-700 min-h-24 max-h-48 overflow-y-auto whitespace-pre-wrap">
                        {selectedWorkRequest.content}
                      </div>
                    </div>
                    <div className="py-1">
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="user" size={14} className="mr-1" />
                        신청자 :  <span className="text-sm ml-1">{selectedWorkRequest.requester} ({selectedWorkRequest.department})</span>
                      </span>
                    </div>
                    <div className="py-1">
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="mail" size={14} className="mr-1" />
                        신청 연락처 : <span className="text-sm ml-1">{selectedWorkRequest.contact}</span>
                      </span>
                    </div>
                    <div className="py-1">
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="briefcase" size={14} className="mr-1" />
                        신청 위치
                      </span>
                      <div className="text-sm mt-1 p-3 bg-gray-50 rounded text-gray-700 min-h-16 max-h-32 overflow-y-auto whitespace-pre-wrap">
                        {selectedWorkRequest.location}
                      </div>
                    </div>
                    <div className="py-1 mb-5">
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="calendar" size={14} className="mr-1" />
                        신청 일시 : <span className="text-sm ml-1 text-black">{selectedWorkRequest.requestDate}</span>
                      </span>
                    </div>
                    <div className="py-1 mb-5">
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="message-square" size={14} className="mr-1" />
                        현재 상태 : <span className="text-sm ml-1 text-red-600 font-semibold">{selectedWorkRequest.currentStatus}</span>
                      </span>
                    </div>
                    {selectedWorkRequest.actualRequester && (
                      <div className="py-1">
                        <span className="text-sm font-medium text-gray-600">실제 신청자 : </span>
                        <span className="text-sm ml-1">{selectedWorkRequest.actualRequester}</span>
                      </div>
                    )}
                    {selectedWorkRequest.actualContact && (
                      <div className="py-1">
                        <span className="text-sm font-medium text-gray-600">실제 연락처 : </span>
                        <span className="text-sm ml-1">{selectedWorkRequest.actualContact}</span>
                      </div>
                    )}
                    {selectedWorkRequest.actualRequesterDepartment && (
                      <div className="py-1">
                        <span className="text-sm font-medium text-gray-600">실제 소속 : </span>
                        <span className="text-sm ml-1">{selectedWorkRequest.actualRequesterDepartment}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 재배정정보 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="settings" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">재 배정 정보</h3>
                  </div>
                  <div className="space-y-0">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">조치 소속</label>
                      <select
                        value={reassignmentDepartment}
                        onChange={(e) => handleReassignmentDepartmentChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">소속을 선택해 주세요.</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.name}>{dept.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">조치 담당자</label>
                      <select
                        value={reassignmentTechnician}
                        onChange={(e) => setReassignmentTechnician(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!reassignmentDepartment}
                      >
                        <option value="">조치자를 선택하세요</option>
                        {Array.isArray(reassignmentTechnicians) && reassignmentTechnicians.map(technician => (
                          <option key={technician.id} value={technician.name}>{technician.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">재 배정 의견</label>
                      <textarea
                        value={reassignmentOpinion}
                        onChange={(e) => setReassignmentOpinion(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                        placeholder="재배정 담당자 의견을 입력하세요"
                      />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="calendar" size={14} className="mr-1" />
                        재 배정 일시(현재):
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
                      <select
                        value={reassignmentServiceType}
                        onChange={(e) => setReassignmentServiceType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">선택</option>
                        {serviceTypes.map(serviceType => (
                          <option key={serviceType.id} value={serviceType.name}>
                            {serviceType.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* 이전 배정 정보 */}
                    <div className="border-t pt-3 mt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">이전 배정 정보</h4>
                      <div className="space-y-0">
                        <div>
                          <span className="text-xs font-medium text-gray-500">전) 배정 일시 : </span>
                          <span className="text-xs ml-2">
                            {(() => {
                              const dateStr = (selectedWorkRequest as any)?.previous_assign_date || selectedWorkRequest.previousAssignDate;
                              if (!dateStr) return '-';
                              // DB에서 읽은 값 그대로 표시 (YYYY-MM-DD hh:mm 형식)
                              if (dateStr.includes(' ')) {
                                // 이미 YYYY-MM-DD HH:mm:ss 형식인 경우 초 제거
                                return dateStr.substring(0, 16);
                              } else if (dateStr.includes('T')) {
                                // ISO 형식인 경우 변환
                                return dateStr.substring(0, 16).replace('T', ' ');
                              }
                              return dateStr;
                            })()}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-500">전) 배정 담당자 : </span>
                          <span className="text-xs ml-2">
                            {(selectedWorkRequest as any)?.previous_assignee || selectedWorkRequest.previousAssignee || '-'}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-500">전) 배정 의견 : </span>
                          <span className="text-xs ml-2">
                            {(selectedWorkRequest as any)?.previous_assignment_opinion || selectedWorkRequest.previousAssignmentOpinion || '-'}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-500">전) 조치담당자(반려) : </span>
                          <span className="text-xs ml-2">
                            {(selectedWorkRequest as any)?.rejection_name || selectedWorkRequest.rejectionName || '-'}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-red-600">반려 의견 : </span>
                          <span className="text-xs ml-2 text-red-600">
                            {(selectedWorkRequest as any)?.rejection_opinion || selectedWorkRequest.rejectionOpinion || '-'}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-500">반려 일시 : </span>
                          <span className="text-xs ml-2">
                            {(() => {
                              const dateStr = (selectedWorkRequest as any)?.rejection_date || selectedWorkRequest.rejectionDate;
                              if (!dateStr) return '-';
                              // DB에서 읽은 값 그대로 표시 (YYYY-MM-DD hh:mm 형식)
                              if (dateStr.includes(' ')) {
                                // 이미 YYYY-MM-DD HH:mm:ss 형식인 경우 초 제거
                                return dateStr.substring(0, 16);
                              } else if (dateStr.includes('T')) {
                                // ISO 형식인 경우 변환
                                return dateStr.substring(0, 16).replace('T', ' ');
                              }
                              return dateStr;
                            })()}
                          </span>
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
                onClick={() => setShowServiceReassignmentModal(false)}
                className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-all duration-200"
              >
                취소
              </button>
              <button
                onClick={handleReassignmentSubmit}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-all duration-200"
              >
                재배정하기
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 작업정보관리 모달 */}
      {showServiceWorkInfoModal && selectedWorkRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="settings" size={24} className="mr-2" />
                작업정보관리
              </h2>
              <button
                onClick={() => setShowServiceWorkInfoModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 - 2열 레이아웃 */}
            <div className="py-4 px-6">
              <div className="grid grid-cols-2 gap-6">
                {/* 왼쪽: 서비스신청정보 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="user" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">서비스신청정보</h3>
                  </div>
                  
                  <div className="space-y-0">
                    <div>
                      <span className="text-sm font-medium text-gray-600">신청번호: </span>
                      <span className="text-sm font-bold text-red-600">{selectedWorkRequest.requestNumber}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">신청제목: </span>
                      <span className="text-sm">{selectedWorkRequest.title}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">신청내용: </span>
                      <div className="text-sm mt-1 p-3 bg-gray-50 rounded text-gray-700 min-h-24 max-h-48 overflow-y-auto whitespace-pre-wrap">
                        {selectedWorkRequest.content}
                    </div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="user" size={14} className="mr-1" />
                        신청자: 
                      </span>
                      <span className="text-sm ml-5">{selectedWorkRequest.requester} ({selectedWorkRequest.department})</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="mail" size={14} className="mr-1" />
                        신청연락처: 
                      </span>
                      <span className="text-sm ml-5">{selectedWorkRequest.contact}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="briefcase" size={14} className="mr-1" />
                        신청위치: 
                      </span>
                      <span className="text-sm ml-5">{selectedWorkRequest.location}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="calendar" size={14} className="mr-1" />
                        신청일시: <span className="text-sm ml-1 text-black">{selectedWorkRequest.requestDate} {selectedWorkRequest.requestTime}</span>
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="message-square" size={14} className="mr-1" />
                        현재상태: 
                      </span>
                      <span className="text-sm ml-5 text-red-600 font-semibold">{selectedWorkRequest.currentStatus}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">실제신청자: </span>
                      <span className="text-sm ml-5">{selectedWorkRequest.actualRequester || selectedWorkRequest.requester}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">실제연락처: </span>
                      <span className="text-sm ml-5">{selectedWorkRequest.actualContact || selectedWorkRequest.contact}</span>
                    </div>
                  </div>
                </div>

                {/* 오른쪽: 작업정보등록 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="settings" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">작업정보등록</h3>
                    </div>
                  
                  <div className="space-y-0 py-0">
                    {/* 배정 정보 */}
                    <div className="bg-gray-50 px-4 py-0 rounded-lg">
                      <div className="space-y-2">
                    <div>
                          <span className="text-sm font-medium text-gray-600">배정일시 :</span>
                          <span className="text-sm text-gray-800 ml-2">{selectedWorkRequest.assignDate || '2025.08.31 10:40'}</span>
                    </div>
                    <div>
                          <span className="text-sm font-medium text-gray-600">배정 담당자 :</span>
                          <span className="text-sm text-gray-800 ml-2">{selectedWorkRequest.assignee || '이배정'}</span>
                    </div>
                    <div>
                          <span className="text-sm font-medium text-gray-600">서비스 조치 정보 :</span>
                          <span className="text-sm text-gray-800 ml-2">{selectedWorkRequest.serviceType || '문제'}</span>
                    </div>
                    <div>
                          <span className="text-sm font-medium text-gray-600">조치담당자 :</span>
                          <span className="text-sm text-gray-800 ml-2">김기술</span>
                    </div>
                      </div>
                    </div>

                    {/* 예정 조율 일시 */}
                    <div className={`px-4 py-0 rounded-lg border-2 ${(serviceWorkCurrentStage === '예정' || serviceWorkCurrentStage === '완료' || serviceWorkCurrentStage === '미결') ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-600 mb-2">예정 조율 일시</label>
                      <input
                        type="datetime-local"
                            value={serviceWorkScheduledDate}
                            onChange={(e) => setServiceWorkScheduledDate(e.target.value)}
                            disabled={serviceWorkCurrentStage !== '예정' && serviceWorkCurrentStage !== '완료' && serviceWorkCurrentStage !== '미결'}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              (serviceWorkCurrentStage !== '예정' && serviceWorkCurrentStage !== '완료' && serviceWorkCurrentStage !== '미결') ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                      />
                    </div>
                        {serviceWorkCurrentStage === '예정' && (
                          <div className="flex items-center gap-2">
                            <Icon name="calendar" className="w-5 h-5 text-gray-400" />
                            <button
                              onClick={() => {
                                if (serviceWorkScheduledDate) {
                                  setServiceWorkCurrentStage('작업')
                                  // 작업시작일시에 현재 시점 자동 설정 (한국 시간)
                                  const now = new Date()
                                  const kstOffset = 9 * 60 // 한국은 UTC+9
                                  const kstTime = new Date(now.getTime() + (kstOffset * 60 * 1000))
                                  const formattedNow = kstTime.toISOString().slice(0, 16)
                                  setServiceWorkStartDate(formattedNow)
                                  alert('예정조율일시가 등록되었습니다. 작업 단계로 진행합니다.')
                                } else {
                                  alert('예정조율일시를 입력해주세요.')
                                }
                              }}
                              disabled={!serviceWorkScheduledDate}
                              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                serviceWorkScheduledDate
                                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              처리
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 작업 시작 일시 */}
                    <div className={`px-4 py-0 rounded-lg border-2 ${(serviceWorkCurrentStage === '작업' || serviceWorkCurrentStage === '완료' || serviceWorkCurrentStage === '미결') ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-600 mb-2">작업 시작 일시</label>
                      <input
                        type="datetime-local"
                            value={serviceWorkStartDate}
                            onChange={(e) => setServiceWorkStartDate(e.target.value)}
                            disabled={serviceWorkCurrentStage !== '작업' && serviceWorkCurrentStage !== '완료' && serviceWorkCurrentStage !== '미결'}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              (serviceWorkCurrentStage !== '작업' && serviceWorkCurrentStage !== '완료' && serviceWorkCurrentStage !== '미결') ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                      />
                    </div>
                        {serviceWorkCurrentStage === '작업' && (
                          <div className="flex items-center gap-2">
                            <Icon name="calendar" className="w-5 h-5 text-gray-400" />
                            <button
                              onClick={() => {
                                if (serviceWorkStartDate) {
                                  setServiceWorkCurrentStage('완료')
                                  // 작업완료일시에 현재 시점 자동 설정 (한국 시간)
                                  const now = new Date()
                                  const kstOffset = 9 * 60 // 한국은 UTC+9
                                  const kstTime = new Date(now.getTime() + (kstOffset * 60 * 1000))
                                  const formattedNow = kstTime.toISOString().slice(0, 16)
                                  setServiceWorkCompleteDate(formattedNow)
                                  alert('작업이 시작되었습니다. 완료 단계로 진행합니다.')
                                } else {
                                  alert('작업시작일시를 입력해주세요.')
                                }
                              }}
                              disabled={!serviceWorkStartDate}
                              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                serviceWorkStartDate
                                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              처리
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 작업 내역 및 완료 일시 */}
                    <div className={`px-4 py-0 rounded-lg border-2 ${(serviceWorkCurrentStage === '완료' || serviceWorkCurrentStage === '미결') ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="space-y-0">
                    <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2">작업 내역</label>
                      <textarea
                            value={serviceWorkContent}
                            onChange={(e) => setServiceWorkContent(e.target.value)}
                            disabled={serviceWorkCurrentStage !== '완료' && serviceWorkCurrentStage !== '미결'}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              (serviceWorkCurrentStage !== '완료' && serviceWorkCurrentStage !== '미결') ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                        rows={3}
                            placeholder="작업 내용 입력"
                          />
                    </div>
                    <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2">작업 완료 일시</label>
                      <input
                        type="datetime-local"
                            value={serviceWorkCompleteDate}
                            onChange={(e) => setServiceWorkCompleteDate(e.target.value)}
                            disabled={serviceWorkCurrentStage !== '완료' && serviceWorkCurrentStage !== '미결'}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              (serviceWorkCurrentStage !== '완료' && serviceWorkCurrentStage !== '미결') ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                      />
                    </div>
                        {serviceWorkCurrentStage === '완료' && (
                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                if (serviceWorkContent && serviceWorkCompleteDate) {
                                  setServiceWorkCurrentStage('미결')
                                  alert('작업이 완료되었습니다. 미결 처리 단계로 진행합니다.')
                                } else {
                                  alert('작업내역과 작업완료일시를 모두 입력해주세요.')
                                }
                              }}
                              disabled={!serviceWorkContent || !serviceWorkCompleteDate}
                              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                                serviceWorkContent && serviceWorkCompleteDate
                                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              처리
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 문제 사항 */}
                    <div className={`px-4 py-0 rounded-lg border-2 ${serviceWorkCurrentStage === '미결' ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-600 mb-2">문제 사항</label>
                      <textarea
                            value={serviceWorkProblemIssue}
                            onChange={(e) => setServiceWorkProblemIssue(e.target.value)}
                            disabled={serviceWorkCurrentStage !== '미결'}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                              serviceWorkCurrentStage !== '미결' ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                        rows={3}
                            placeholder="작업 중 발견 된 문제점 입력"
                          />
                    </div>
                        {serviceWorkCurrentStage === '미결' && (
                          <div className="flex items-start gap-2">
                            <button
                              onClick={() => {
                                if (serviceWorkIsUnresolved && serviceWorkProblemIssue) {
                                  alert('미결 처리가 완료되었습니다.')
                                  setServiceWorkCurrentStage('미결완료')
                                } else {
                                  alert('미해결 체크박스를 선택하고 문제사항을 입력해주세요.')
                                }
                              }}
                              className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-all duration-200"
                            >
                              등재
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 flex items-center">
                      <input
                        type="checkbox"
                          id="serviceWorkUnresolved"
                          checked={serviceWorkIsUnresolved}
                          onChange={(e) => setServiceWorkIsUnresolved(e.target.checked)}
                          disabled={serviceWorkCurrentStage !== '미결'}
                          className={`mr-2 ${serviceWorkCurrentStage !== '미결' ? 'cursor-not-allowed' : ''}`}
                        />
                        <label htmlFor="serviceWorkUnresolved" className={`text-sm font-medium ${
                          serviceWorkCurrentStage !== '미결' ? 'text-gray-400' : 'text-gray-700'
                        }`}>
                          미결 완료
                        </label>
                    </div>
                      
                    </div>

                  </div>
                  </div>
                </div>
              </div>

              {/* 모달 하단 버튼 */}
            <div className="flex gap-3 py-4 px-6 border-t border-gray-200">
              <button
                onClick={() => {
                  console.log('나가기 버튼 클릭 - 서비스작업List 새로고침');
                  setShowServiceWorkInfoModal(false);
                }}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                나가기
              </button>
              {/* 작업 전체 수정 버튼 - 완료/미결 단계에서만 표시 */}
              {selectedWorkRequest?.stage && stageButtons[selectedWorkRequest.stage]?.includes('edit') && (
                <button
                  onClick={async () => {
                    // stage_id를 "확인"으로 변경
                    try {
                      const updateData = {
                        stage: getStageName('확인')
                      };
                      console.log('작업 전체 수정 - stage를 확인으로 변경:', updateData);
                      const response = await apiClient.put(`/service-requests/${selectedWorkRequest?.id}`, updateData);
                      if (response.success) {
                        // selectedWorkRequest 업데이트
                        setSelectedWorkRequest(prev => prev ? { ...prev, stage: getStageName('확인') } : null);
                        // 알림 메시지
                        alert('예정조율일시부터 단계적으로 다시 작업하세요!');
                        // 서비스작업List 새로고침
                        await fetchServiceRequests();
                        // 모달은 그대로 유지 - 닫지 않음
                      } else {
                        alert('작업 전체 수정 중 오류가 발생했습니다: ' + response.error);
                      }
                    } catch (error) {
                      console.error('작업 전체 수정 오류:', error);
                      alert('작업 전체 수정 중 오류가 발생했습니다.');
                    }
                  }}
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-all duration-200 button-smooth"
                >
                  작업 전체 수정
                </button>
              )}
              <button
                onClick={async () => {
                  try {
                    if (!selectedWorkRequest) return;
                    
                    // 시스템관리 페이지와 동일한 데이터 구조로 작업정보 업데이트
                    const updateData = {
                      stage: selectedWorkRequest.stage, // 현재 단계 유지
                      scheduled_date: serviceWorkScheduledDate || null,
                      work_start_date: serviceWorkStartDate || null,
                      work_complete_date: serviceWorkCompleteDate || null,
                      work_content: serviceWorkContent || null,
                      problem_issue: serviceWorkProblemIssue || null,
                      is_unresolved: serviceWorkIsUnresolved
                    };
                    
                    console.log('작업정보 수정 시작:', selectedWorkRequest.id);
                    console.log('수정 데이터:', updateData);
                    
                    // 시스템관리와 동일하게 apiClient.put 사용
                    const response = await apiClient.put(`/service-requests/${selectedWorkRequest?.id}`, updateData);
                    
                    if (response.success) {
                      console.log('작업정보 수정 성공');
                      setShowServiceWorkInfoModal(false);
                      setSelectedWorkRequest(null);
                      await fetchServiceRequests(); // 목록 새로고침
                      setShowServiceWorkCompleteModal(true);
                    } else {
                      console.error('작업정보 수정 실패:', response.error);
                      alert('작업정보 수정 중 오류가 발생했습니다: ' + (response.error || '알 수 없는 오류'));
                    }
                  } catch (error) {
                    console.error('작업정보 수정 오류:', error);
                    alert('작업정보 수정 중 오류가 발생했습니다.');
                  }
                }}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                수정완료
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 작업정보삭제 모달 */}
      {showServiceWorkDeleteModal && selectedWorkRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="trash" size={24} className="mr-2 text-red-600" />
                작업정보삭제
              </h2>
              <button
                onClick={() => setShowServiceWorkDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="py-6 px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 서비스 신청 정보 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="user" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">서비스신청정보</h3>
                  </div>
                  
                  <div className="space-y-0">
                    <div>
                      <span className="text-sm font-medium text-gray-600">신청번호: </span>
                      <span className="text-sm font-bold text-red-600">{selectedWorkRequest.requestNumber}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">신청제목: </span>
                      <span className="text-sm">{selectedWorkRequest.title}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">신청내용: </span>
                      <div className="text-sm mt-1 p-3 bg-gray-50 rounded text-gray-700 min-h-24 max-h-48 overflow-y-auto whitespace-pre-wrap">
                        {selectedWorkRequest.content}
                    </div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="user" size={14} className="mr-1" />
                        신청자: 
                      </span>
                      <span className="text-sm ml-5">{selectedWorkRequest.requester} ({selectedWorkRequest.department})</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="mail" size={14} className="mr-1" />
                        신청연락처: 
                      </span>
                      <span className="text-sm ml-5">{selectedWorkRequest.contact}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="briefcase" size={14} className="mr-1" />
                        신청위치: 
                      </span>
                      <span className="text-sm ml-5">{selectedWorkRequest.location}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="calendar" size={14} className="mr-1" />
                        신청일시: <span className="text-sm ml-1 text-black">{selectedWorkRequest.requestDate} {selectedWorkRequest.requestTime}</span>
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <Icon name="message-square" size={14} className="mr-1" />
                        현재상태: 
                      </span>
                      <span className="text-sm ml-5 text-red-600 font-semibold">{selectedWorkRequest.currentStatus}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">실제신청자: </span>
                      <span className="text-sm ml-5">{selectedWorkRequest.actualRequester || selectedWorkRequest.requester}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">실제연락처: </span>
                      <span className="text-sm ml-5">{selectedWorkRequest.actualContact || selectedWorkRequest.contact}</span>
                    </div>
                  </div>
                </div>

                {/* 작업정보등록 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="settings" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">작업정보등록</h3>
                  </div>
                  
                  <div className="space-y-0 py-0">
                    {/* 배정 정보 */}
                    <div className="bg-gray-50 px-4 py-0 rounded-lg">
                      <div className="space-y-2">
                    <div>
                          <span className="text-sm font-medium text-gray-600">배정일시 :</span>
                          <span className="text-sm ml-2">{selectedWorkRequest.assignDate || '2025.08.31 10:40'}</span>
                    </div>
                    <div>
                          <span className="text-sm font-medium text-gray-600">배정담당자 :</span>
                          <span className="text-sm ml-2">{selectedWorkRequest.assignee || '이배정'}</span>
                    </div>
                    <div>
                          <span className="text-sm font-medium text-gray-600">배정의견 :</span>
                          <span className="text-sm ml-2">{selectedWorkRequest.assignmentOpinion || '업무에 적합하여 배정'}</span>
                    </div>
                    <div>
                          <span className="text-sm font-medium text-gray-600">서비스유형 :</span>
                          <span className="text-sm ml-2">{selectedWorkRequest.serviceType}</span>
                    </div>
                    <div>
                          <span className="text-sm font-medium text-gray-600">조치담당자 :</span>
                          <span className="text-sm ml-2">김기술</span>
                    </div>
                      </div>
                    </div>

                    {/* 예정 조율 일시 */}
                    <div className="bg-gray-50 px-4 py-0 rounded-lg">
                      <div className="space-y-2">
                    <div>
                          <span className="text-sm font-medium text-gray-600">예정조율일시 :</span>
                          <span className="text-sm ml-2">{selectedWorkRequest.scheduledDate || '2025.08.31 15:00'}</span>
                    </div>
                      </div>
                    </div>

                    {/* 작업 시작 일시 */}
                    <div className="bg-gray-50 px-4 py-0 rounded-lg">
                      <div className="space-y-2">
                    <div>
                          <span className="text-sm font-medium text-gray-600">작업시작일시 :</span>
                          <span className="text-sm ml-2">{selectedWorkRequest.workStartDate || '2025.09.01 15:00'}</span>
                    </div>
                      </div>
                    </div>

                    {/* 작업 내역 및 완료 일시 */}
                    <div className="bg-gray-50 px-4 py-0 rounded-lg">
                      <div className="space-y-2">
                    <div>
                          <span className="text-sm font-medium text-gray-600">작업내역 :</span>
                          <div className="text-sm mt-1 p-2 bg-white rounded border text-gray-700 min-h-16 max-h-32 overflow-y-auto whitespace-pre-wrap">
                            {selectedWorkRequest.workContent || '작업 내용 수정'}
                          </div>
                    </div>
                    <div>
                          <span className="text-sm font-medium text-gray-600">작업완료일시 :</span>
                          <span className="text-sm ml-2">{selectedWorkRequest.workCompleteDate || '2025.08.31 15:00'}</span>
                    </div>
                      </div>
                    </div>

                    {/* 문제 사항 */}
                    <div className="bg-gray-50 px-4 py-0 rounded-lg">
                      <div className="space-y-2">
                    <div>
                          <span className="text-sm font-medium text-gray-600">문제사항 :</span>
                          <div className="text-sm mt-1 p-2 bg-white rounded border text-gray-700 min-h-16 max-h-32 overflow-y-auto whitespace-pre-wrap">
                            {selectedWorkRequest.problemIssue || '작업 중 발견된 문제점 수정'}
                          </div>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                            id="unresolved-delete-display"
                        className="mr-2"
                            checked={selectedWorkRequest.isUnresolved || false}
                        readOnly
                      />
                          <label htmlFor="unresolved-delete-display" className="text-sm font-medium text-gray-600">
                            미결완료
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 삭제 확인 메시지 */}
              <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <div className="text-red-800">
                    <p className="font-medium">⚠️ 작업정보를 삭제하시겠습니까?</p>
                    <p className="text-sm mt-1">삭제된 작업정보는 복구할 수 없습니다.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 모달 하단 버튼 */}
            <div className="flex gap-3 py-4 px-6 border-t border-gray-200">
                <button
                  onClick={() => setShowServiceWorkDeleteModal(false)}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 button-smooth"
                >
                  취소
                </button>
                <button
                  onClick={async () => {
                    if (confirm('정말로 삭제하시겠습니까?')) {
                      try {
                        if (!selectedWorkRequest) return;
                        
                        console.log('서비스 요청 삭제 시작:', selectedWorkRequest.id);
                        const response = await apiClient.deleteServiceRequest(Number(selectedWorkRequest.id));
                        
                        if (response.success) {
                          console.log('서비스 요청 삭제 성공');
                          setShowServiceWorkDeleteModal(false);
                          setSelectedWorkRequest(null);
                          await fetchServiceRequests(); // 목록 새로고침
                          setShowServiceWorkDeleteCompleteModal(true);
                        } else {
                          console.error('서비스 요청 삭제 실패:', response.error);
                          alert('삭제 중 오류가 발생했습니다: ' + (response.error || '알 수 없는 오류'));
                        }
                      } catch (error) {
                        console.error('서비스 요청 삭제 오류:', error);
                        alert('삭제 중 오류가 발생했습니다.');
                      }
                    }
                  }}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200 button-smooth"
                >
                  삭제하기
                </button>
              </div>
          </div>
        </div>
      )}

      {/* 작업정보수정 완료 모달 */}
      {showServiceWorkCompleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="check-circle" size={24} className="mr-2 text-green-600" />
                수정 완료
              </h2>
              <button
                onClick={() => setShowServiceWorkCompleteModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="py-6 px-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="check-circle" size={32} className="text-green-600" />
              </div>
              <p className="text-gray-600 mb-6">작업정보가 성공적으로 수정되었습니다.</p>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-end py-4 px-6 border-t border-gray-200">
              <button
                onClick={() => setShowServiceWorkCompleteModal(false)}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 작업정보삭제 완료 모달 */}
      {showServiceWorkDeleteCompleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="check-circle" size={24} className="mr-2 text-green-600" />
                삭제 완료
              </h2>
              <button
                onClick={() => setShowServiceWorkDeleteCompleteModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="py-6 px-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="check-circle" size={32} className="text-green-600" />
              </div>
              <p className="text-gray-600 mb-6">작업정보가 성공적으로 삭제되었습니다.</p>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-end py-4 px-6 border-t border-gray-200">
              <button
                onClick={() => setShowServiceWorkDeleteCompleteModal(false)}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 자주하는 질문 관리 프레임 */}
      {showFAQManagement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-hidden">
            {/* 프레임 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="help-circle" size={24} className="mr-2 text-blue-600" />
                자주하는 질문 관리
              </h2>
              <button
                onClick={() => setShowFAQManagement(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 프레임 내용 */}
            <div className="p-6 overflow-y-auto" style={{maxHeight: 'calc(90vh - 120px)'}}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* FAQ 카드들 */}
                {(() => {
                  // FAQ 데이터 (일반사용자 페이지와 동일)
                  const faqs = [
                    {
                      id: '1',
                      icon: '📧',
                      summary: '이메일 접속 불가',
                      content: '이메일 서비스에 접속할 수 없는 경우 발생하는 문제입니다.',
                      category: '이메일',
                      solution: '1. 브라우저 캐시 및 쿠키 삭제\n2. 다른 브라우저로 시도\n3. 네트워크 연결 상태 확인',
                      persistentIssue: '위 방법으로 해결되지 않으면 IT팀에 문의해 주세요!'
                    },
                    {
                      id: '2',
                      icon: '📤',
                      summary: '파일 업로드 오류',
                      content: '파일 업로드 시 오류가 발생하는 경우입니다.',
                      category: '파일서버'
                    },
                    {
                      id: '3',
                      icon: '🔒',
                      summary: '네트워크 연결 오류',
                      content: '네트워크 연결이 되지 않은 경우 발생하는 문제입니다.',
                      category: '네트워크'
                    },
                    {
                      id: '4',
                      icon: '🌐',
                      summary: '웹사이트 접속 불가',
                      content: '내부 웹사이트에 접속할 수 없는 경우입니다.',
                      category: '웹서비스'
                    },
                    {
                      id: '5',
                      icon: '🖨️',
                      summary: '프린터 인쇄 오류',
                      content: '프린터 인쇄가 되지 않는 경우입니다.',
                      category: '하드웨어',
                      solution: '1. 프린터 전원 및 연결 상태 확인\n2. 프린터 드라이버 재설치\n3. 프린터 큐 초기화',
                      persistentIssue: '위 방법으로 해결되지 않으면 하드웨어 담당자에게 연락해 주세요!'
                    },
                    {
                      id: '6',
                      icon: '💻',
                      summary: '소프트웨어 설치',
                      content: '새로운 소프트웨어 설치 요청입니다.',
                      category: '소프트웨어'
                    },
                    {
                      id: '7',
                      icon: '🖥️',
                      summary: '컴퓨터 느림 현상',
                      content: '컴퓨터가 갑자기 느려지는 현상입니다.',
                      category: '성능'
                    },
                    {
                      id: '8',
                      icon: '🔐',
                      summary: '비밀번호 초기화',
                      content: '시스템 로그인 비밀번호를 잊어버린 경우입니다.',
                      category: '보안'
                    },
                    {
                      id: '9',
                      icon: '📱',
                      summary: '모바일 앱 오류',
                      content: '모바일 애플리케이션에서 오류가 발생하는 경우입니다.',
                      category: '모바일'
                    },
                    {
                      id: '10',
                      icon: '🔧',
                      summary: '시스템 오류',
                      content: '시스템에서 예상치 못한 오류가 발생하는 경우입니다.',
                      category: '시스템'
                    },
                    {
                      id: '11',
                      icon: '💾',
                      summary: '데이터 백업',
                      content: '중요한 데이터를 백업하는 방법입니다.',
                      category: '데이터'
                    },
                    {
                      id: '12',
                      icon: '🌍',
                      summary: '원격 접속 오류',
                      content: '원격 접속 시 발생하는 문제입니다.',
                      category: '원격접속'
                    }
                  ]

                  // 페이지네이션 로직
                  const itemsPerPage = 6
                  const totalPages = Math.ceil(faqs.length / itemsPerPage)
                  const currentFAQs = faqs.slice(
                    (faqCurrentPage - 1) * itemsPerPage,
                    faqCurrentPage * itemsPerPage
                  )

                  return (
                    <>
                      {currentFAQs.map((faq) => (
                        <div
                          key={faq.id}
                          className="bg-white rounded-xl cursor-pointer hover:shadow-2xl transition-all duration-500 ease-out transform hover:scale-105 flex flex-col h-full border-2 border-gray-200 hover:border-blue-300"
                          style={{padding: '20px 30px'}}
                          onClick={() => {
                            setSelectedFAQ(faq)
                            setShowFAQEditModal(true)
                          }}
                        >
                          <div className="text-left mb-5 flex-1" style={{paddingTop: '15px'}}>
                            <div className="mb-3 text-center" style={{fontSize: '36px'}}>{faq.icon}</div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">
                              {faq.summary}
                            </h3>
                            <p className="text-gray-600 leading-relaxed mb-4 line-clamp-2 overflow-hidden">
                              {faq.content}
                            </p>
                          </div>
                          <div className="flex justify-between items-center mt-auto">
                            <span className="text-sm px-4 rounded-full bg-blue-100 text-blue-800 font-medium" style={{paddingTop: '0px', paddingBottom: '0px'}}>
                              {faq.category}
                            </span>
                            <div className="flex space-x-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation(); // 이벤트 버블링 방지
                                  setSelectedFAQ(faq);
                                  setShowFAQEditModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                수정
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation(); // 이벤트 버블링 방지
                                  if (confirm('이 FAQ를 삭제하시겠습니까?')) {
                                    // 삭제 로직 추가
                                    alert('FAQ가 삭제되었습니다.');
                                    // FAQ 관리 프레임은 유지 (닫지 않음)
                                  }
                                }}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )
                })()}
              </div>

              {/* 페이지네이션 */}
              {(() => {
                const faqs = [
                  { id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }, { id: '6' },
                  { id: '7' }, { id: '8' }, { id: '9' }, { id: '10' }, { id: '11' }, { id: '12' }
                ]
                const itemsPerPage = 6
                const totalPages = Math.ceil(faqs.length / itemsPerPage)
                
                return totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-4 mt-8">
                    <button
                      onClick={() => setFaqCurrentPage(Math.max(1, faqCurrentPage - 1))}
                      disabled={faqCurrentPage === 1}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-all duration-300 ease-out button-smooth"
                    >
                      이전
                    </button>
                    <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                      {faqCurrentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setFaqCurrentPage(Math.min(totalPages, faqCurrentPage + 1))}
                      disabled={faqCurrentPage === totalPages}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-all duration-300 ease-out button-smooth"
                    >
                      다음
                    </button>
                  </div>
                )
              })()}
            </div>

            {/* 프레임 하단 버튼 */}
            <div className="flex justify-between items-center py-4 px-6 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowFAQAddModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-out button-smooth flex items-center space-x-2"
                >
                  <Icon name="plus" size={16} />
                  <span>질문 추가</span>
                </button>
              </div>
              <div className="flex items-center space-x-4">
                {(() => {
                  const faqs = [
                    { id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }, { id: '6' },
                    { id: '7' }, { id: '8' }, { id: '9' }, { id: '10' }, { id: '11' }, { id: '12' }
                  ]
                  const itemsPerPage = 6
                  const totalPages = Math.ceil(faqs.length / itemsPerPage)
                  return (
                    <span className="text-sm text-gray-500">{faqCurrentPage} / {totalPages} 페이지</span>
                  )
                })()}
                <button
                  onClick={() => setShowFAQManagement(false)}
                  className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 button-smooth"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQ 수정 모달 */}
      {showFAQEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-2xl font-bold text-gray-800">자주하는 질문-수정</h2>
              <button
                onClick={() => setShowFAQEditModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="p-6 overflow-y-auto" style={{maxHeight: 'calc(90vh - 120px)'}}>
              {/* 아이콘 섹션 */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex flex-col items-center space-y-4">
                  <div className="text-6xl">{selectedFAQ?.icon || '📧'}</div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-out button-smooth">
                    Icon 변경
                  </button>
                </div>
              </div>

              {/* 입력 필드들 */}
              <div className="space-y-6">
                {/* 발생 원인 요약 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-0">
                    발생 원인 요약
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedFAQ?.summary || ''}
                    className="w-full px-4 py-0 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="발생 원인 요약을 입력하세요"
                  />
                </div>

                {/* 발생 원인 내용 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-0">
                    발생 원인 내용
                  </label>
                  <textarea
                    defaultValue={selectedFAQ?.content || ''}
                    rows={3}
                    className="w-full px-4 py-0 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="발생 원인 내용을 입력하세요"
                  />
                </div>

                {/* 즉시 해결방법 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-0">
                    즉시 해결방법
                  </label>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <textarea
                      defaultValue={selectedFAQ?.solution || "1. 브라우저 캐시 및 쿠키 삭제\n2. 다른 브라우저로 시도\n3. 네트워크 연결 상태 확인"}
                      rows={4}
                      className="w-full px-4 py-0 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                      placeholder="즉시 해결방법을 입력하세요"
                    />
                  </div>
                </div>

                {/* 문제가 지속될 경우 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-0">
                    문제가 지속될 경우
                  </label>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <textarea
                      defaultValue={selectedFAQ?.persistentIssue || "위 방법으로 해결되지 않으면 아래 서비스 신청 해 주세요!"}
                      rows={2}
                      className="w-full px-4 py-0 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 bg-white"
                      placeholder="문제가 지속될 경우 안내를 입력하세요"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-center items-center py-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowFAQEditModal(false)
                  setShowFAQCompleteModal(true)
                  // 수정 로직 추가
                }}
                className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 ease-out button-smooth"
              >
                수정
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ 추가 모달 */}
      {showFAQAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-2xl font-bold text-gray-800">자주하는 질문-추가</h2>
              <button
                onClick={() => setShowFAQAddModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="p-6 overflow-y-auto" style={{maxHeight: 'calc(90vh - 120px)'}}>
              {/* 아이콘 섹션 */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex flex-col items-center space-y-4">
                  <div className="text-6xl">📧</div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-out button-smooth">
                    Icon 변경
                  </button>
                </div>
              </div>

              {/* 입력 필드들 */}
              <div className="space-y-6">
                {/* 발생 원인 요약 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-0">
                    발생 원인 요약
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-0 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="발생 원인 요약을 입력하세요"
                  />
                </div>

                {/* 발생 원인 내용 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-0">
                    발생 원인 내용
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-0 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="발생 원인 내용을 입력하세요"
                  />
                </div>

                {/* 즉시 해결방법 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-0">
                    즉시 해결방법
                  </label>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <textarea
                      rows={4}
                      className="w-full px-4 py-0 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                      placeholder="즉시 해결방법을 입력하세요"
                    />
                  </div>
                </div>

                {/* 문제가 지속될 경우 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-0">
                    문제가 지속될 경우
                  </label>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <textarea
                      rows={2}
                      className="w-full px-4 py-0 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 bg-white"
                      placeholder="문제가 지속될 경우 안내를 입력하세요"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-center items-center py-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowFAQAddModal(false)
                  setShowFAQCompleteModal(true)
                  // 추가 로직 추가
                }}
                className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 ease-out button-smooth"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ 완료 모달 */}
      {showFAQCompleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="check-circle" size={24} className="mr-2 text-green-600" />
                완료
              </h2>
              <button
                onClick={() => setShowFAQCompleteModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="py-6 px-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="check-circle" size={32} className="text-green-600" />
              </div>
              <p className="text-gray-600 mb-6">FAQ가 성공적으로 처리되었습니다.</p>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-end py-4 px-6 border-t border-gray-200">
              <button
                onClick={() => setShowFAQCompleteModal(false)}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 일반문의 List 관리 프레임 */}
      {showGeneralInquiryList && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-hidden">
            {/* 프레임 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    setGeneralInquiryCurrentPage(1);
                    setShowUnansweredOnly(false);
                    const oneWeekAgo = new Date()
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
                    setGeneralInquirySearchStartDate(oneWeekAgo.toISOString().split('T')[0]);
                    setGeneralInquirySearchEndDate(new Date().toISOString().split('T')[0]);
                  }}
                  className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <Icon name="refresh" size={16} />
                </button>
                <h2 className="text-xl font-bold text-gray-800">일반 문의 답변</h2>
              </div>
              <button
                onClick={() => setShowGeneralInquiryList(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 검색 및 필터 영역 */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  {/* 날짜 선택 */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="date"
                      value={generalInquirySearchStartDate}
                      onChange={(e) => setGeneralInquirySearchStartDate(e.target.value)}
                      className="px-3 py-2 border-2 border-gray-400 rounded-lg text-sm font-medium bg-white shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                    <span className="text-gray-600 font-medium">~</span>
                    <input
                      type="date"
                      value={generalInquirySearchEndDate}
                      onChange={(e) => setGeneralInquirySearchEndDate(e.target.value)}
                      className="px-3 py-2 border-2 border-gray-400 rounded-lg text-sm font-medium bg-white shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                
                {/* 미답변만조회 토글 - 우측 끝 배치 */}
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700">미답변만조회</span>
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
            </div>

            {/* 테이블 영역 */}
            <div className="flex-1 overflow-hidden">
              <div className="overflow-x-auto overflow-y-auto px-4" style={{height: '450px'}}>
                <table className="w-full text-sm">
                  <thead className="sticky top-0" style={{backgroundColor: '#D4B8F9'}}>
                    <tr>
                      <th className="px-2 py-2 text-center text-sm font-bold text-purple-800">문의일시</th>
                      <th className="px-2 py-2 text-center text-sm font-bold text-purple-800">문의제목</th>
                      <th className="px-2 py-2 text-center text-sm font-bold text-purple-800">문의자</th>
                      <th className="px-2 py-2 text-center text-sm font-bold text-purple-800">답변일시</th>
                      <th className="px-2 py-2 text-center text-sm font-bold text-purple-800">답변자</th>
                      <th className="px-2 py-2 text-center text-sm font-bold text-purple-800">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(() => {
                      // 일반문의 데이터 (페이지네이션 테스트를 위해 더 많은 데이터 추가)
                      const inquiries = [
                        {
                          id: '1',
                          inquiryDate: '2025.08.31 14:00',
                          title: '모니터 전원 문의',
                          inquirer: '홍길순',
                          answerDate: '2025.08.31 15:00',
                          answerer: '이배정',
                          content: '모니터에 전원이 들어오지 않습니다.',
                          answerContent: '모니터 전원 케이블를 한번 더 꼽아 주세요! 모니터 전원 버튼을 켜 주십시요 이상과 같이 조치가 되지 않을 따는 서비스 신청 해 주세요!'
                        },
                        {
                          id: '2',
                          inquiryDate: '2025.08.31 13:00',
                          title: '네트워크 문의',
                          inquirer: '김영자',
                          answerDate: '',
                          answerer: '',
                          content: '네트워크 연결이 안 됩니다.'
                        },
                        {
                          id: '3',
                          inquiryDate: '2025.08.31 12:00',
                          title: '프린터 드라이버 업데이트',
                          inquirer: '이영희',
                          answerDate: '',
                          answerer: '',
                          content: '프린터 드라이버를 최신 버전으로 업데이트하고 싶습니다.'
                        },
                        {
                          id: '4',
                          inquiryDate: '2025.08.31 11:00',
                          title: '이메일 문의',
                          inquirer: '박달자',
                          answerDate: '2025.08.31 12:00',
                          answerer: '이배정',
                          content: '이메일 접속이 안 됩니다.',
                          answerContent: '이메일 계정 설정을 확인해 주세요. 비밀번호를 재설정하고 다시 시도해 보세요.'
                        },
                        {
                          id: '5',
                          inquiryDate: '2025.08.31 10:00',
                          title: '소프트웨어 설치 요청',
                          inquirer: '최민수',
                          answerDate: '',
                          answerer: '',
                          content: '새로운 소프트웨어를 설치하고 싶습니다.'
                        },
                        {
                          id: '6',
                          inquiryDate: '2025.08.31 09:30',
                          title: '키보드 고장 문의',
                          inquirer: '정수진',
                          answerDate: '2025.08.31 10:30',
                          answerer: '김기술',
                          content: '키보드가 작동하지 않습니다.',
                          answerContent: '키보드 연결을 확인하고, 다른 포트에 연결해 보세요. 문제가 지속되면 교체가 필요합니다.'
                        },
                        {
                          id: '7',
                          inquiryDate: '2025.08.31 09:00',
                          title: '웹사이트 접속 불가',
                          inquirer: '강지훈',
                          answerDate: '',
                          answerer: '',
                          content: '내부 웹사이트에 접속할 수 없습니다.'
                        },
                        {
                          id: '8',
                          inquiryDate: '2025.08.30 16:30',
                          title: '마우스 반응 지연',
                          inquirer: '윤서연',
                          answerDate: '2025.08.30 17:00',
                          answerer: '이배정',
                          content: '마우스가 느리게 반응합니다.',
                          answerContent: '마우스 드라이버를 업데이트하고, USB 포트를 변경해 보세요.'
                        },
                        {
                          id: '9',
                          inquiryDate: '2025.08.30 15:00',
                          title: '폴더 권한 문의',
                          inquirer: '송현우',
                          answerDate: '',
                          answerer: '',
                          content: '특정 폴더에 접근할 수 없습니다.'
                        },
                        {
                          id: '10',
                          inquiryDate: '2025.08.30 14:00',
                          title: '인쇄 대기열 오류',
                          inquirer: '임지영',
                          answerDate: '2025.08.30 14:30',
                          answerer: '김기술',
                          content: '프린터 대기열에 오류가 발생했습니다.',
                          answerContent: '인쇄 대기열을 초기화하고 프린터를 재시작해 주세요.'
                        },
                        {
                          id: '11',
                          inquiryDate: '2025.08.30 13:00',
                          title: '시스템 업데이트 문의',
                          inquirer: '박준호',
                          answerDate: '',
                          answerer: '',
                          content: '시스템 업데이트가 필요한지 확인하고 싶습니다.'
                        },
                        {
                          id: '12',
                          inquiryDate: '2025.08.30 12:00',
                          title: '백업 시스템 문의',
                          inquirer: '한소영',
                          answerDate: '2025.08.30 12:30',
                          answerer: '이배정',
                          content: '백업 시스템이 정상 작동하는지 확인해 주세요.',
                          answerContent: '백업 시스템을 점검한 결과 정상 작동하고 있습니다. 일정한 시간에 자동 백업이 진행됩니다.'
                        }
                      ];

                      // 필터링된 데이터
                      let filteredInquiries = inquiries;
                      
                      // 미 답변만 조회 필터
                      if (showUnansweredOnly) {
                        filteredInquiries = inquiries.filter(inquiry => !inquiry.answerDate);
                      }

                      // 날짜 필터링 (간단한 예시)
                      const startDate = new Date(generalInquirySearchStartDate);
                      const endDate = new Date(generalInquirySearchEndDate);
                      filteredInquiries = filteredInquiries.filter(inquiry => {
                        const inquiryDate = new Date(inquiry.inquiryDate);
                        return inquiryDate >= startDate && inquiryDate <= endDate;
                      });

                      // 페이지네이션
                      const itemsPerPage = 10;
                      const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage);
                      const startIndex = (generalInquiryCurrentPage - 1) * itemsPerPage;
                      const endIndex = startIndex + itemsPerPage;
                      const currentInquiries = filteredInquiries.slice(startIndex, endIndex);

                      return (
                        <>
                          {currentInquiries.map((inquiry) => (
                            <tr key={inquiry.id} className="hover:bg-gray-50">
                              <td className="px-2 py-2 text-gray-900 text-center">{inquiry.inquiryDate}</td>
                              <td className="px-2 py-2 text-gray-900">{inquiry.title}</td>
                              <td className="px-2 py-2 text-gray-900 text-center">{inquiry.inquirer}</td>
                              <td className="px-2 py-2 text-gray-900 text-center">{inquiry.answerDate || '-'}</td>
                              <td className="px-2 py-2 text-gray-900 text-center">
                                <div className="flex items-center justify-center">
                                  {inquiry.answerer && <Icon name="lock" size={16} className="text-gray-400 mr-1" />}
                                  {inquiry.answerer || '-'}
                                </div>
                              </td>
                              <td className="px-2 py-2 text-center">
                                <div className="flex justify-center space-x-2">
                                  {inquiry.answerDate ? (
                                    <>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedInquiry(inquiry);
                                          setShowGeneralInquiryEditModal(true);
                                        }}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                      >
                                        수정
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedInquiry(inquiry);
                                          setShowGeneralInquiryDeleteModal(true);
                                        }}
                                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                                      >
                                        삭제
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedInquiry(inquiry);
                                        setShowGeneralInquiryReplyModal(true);
                                      }}
                                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                                    >
                                      답변하기
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </>
                      );
                    })()}
                  </tbody>
                </table>
              </div>

              {/* 페이지네이션 */}
              {(() => {
                // 동일한 데이터와 필터링 로직 사용
                const inquiries = [
                  { id: '1', inquiryDate: '2025.08.31 14:00', title: '모니터 전원 문의', inquirer: '홍길순', answerDate: '2025.08.31 15:00', answerer: '이배정' },
                  { id: '2', inquiryDate: '2025.08.31 13:00', title: '네트워크 문의', inquirer: '김영자', answerDate: '', answerer: '' },
                  { id: '3', inquiryDate: '2025.08.31 12:00', title: '프린터 드라이버 업데이트', inquirer: '이영희', answerDate: '', answerer: '' },
                  { id: '4', inquiryDate: '2025.08.31 11:00', title: '이메일 문의', inquirer: '박달자', answerDate: '2025.08.31 12:00', answerer: '이배정' },
                  { id: '5', inquiryDate: '2025.08.31 10:00', title: '소프트웨어 설치 요청', inquirer: '최민수', answerDate: '', answerer: '' },
                  { id: '6', inquiryDate: '2025.08.31 09:30', title: '키보드 고장 문의', inquirer: '정수진', answerDate: '2025.08.31 10:30', answerer: '김기술' },
                  { id: '7', inquiryDate: '2025.08.31 09:00', title: '웹사이트 접속 불가', inquirer: '강지훈', answerDate: '', answerer: '' },
                  { id: '8', inquiryDate: '2025.08.30 16:30', title: '마우스 반응 지연', inquirer: '윤서연', answerDate: '2025.08.30 17:00', answerer: '이배정' },
                  { id: '9', inquiryDate: '2025.08.30 15:00', title: '폴더 권한 문의', inquirer: '송현우', answerDate: '', answerer: '' },
                  { id: '10', inquiryDate: '2025.08.30 14:00', title: '인쇄 대기열 오류', inquirer: '임지영', answerDate: '2025.08.30 14:30', answerer: '김기술' },
                  { id: '11', inquiryDate: '2025.08.30 13:00', title: '시스템 업데이트 문의', inquirer: '박준호', answerDate: '', answerer: '' },
                  { id: '12', inquiryDate: '2025.08.30 12:00', title: '백업 시스템 문의', inquirer: '한소영', answerDate: '2025.08.30 12:30', answerer: '이배정' }
                ];
                
                let filteredInquiries = inquiries;
                if (showUnansweredOnly) {
                  filteredInquiries = inquiries.filter(inquiry => !inquiry.answerDate);
                }
                
                // 날짜 필터링
                const startDate = new Date(generalInquirySearchStartDate);
                const endDate = new Date(generalInquirySearchEndDate);
                filteredInquiries = filteredInquiries.filter(inquiry => {
                  const inquiryDate = new Date(inquiry.inquiryDate);
                  return inquiryDate >= startDate && inquiryDate <= endDate;
                });
                
                const totalPages = Math.ceil(filteredInquiries.length / 10);
                
                return totalPages > 1 ? (
                  <div className="flex justify-center mt-4 pt-4 pb-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setGeneralInquiryCurrentPage(Math.max(1, generalInquiryCurrentPage - 1))}
                        disabled={generalInquiryCurrentPage === 1}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        이전
                      </button>
                      <span className="px-2 py-1 bg-blue-500 text-white rounded text-xs">
                        {generalInquiryCurrentPage}/{totalPages}
                      </span>
                      <button 
                        onClick={() => setGeneralInquiryCurrentPage(Math.min(totalPages, generalInquiryCurrentPage + 1))}
                        disabled={generalInquiryCurrentPage >= totalPages}
                        className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        다음
                      </button>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          </div>
        </div>
      )}

      {/* 답변하기 프레임 */}
      {showGeneralInquiryReplyModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="message-square" size={24} className="mr-2 text-green-600" />
                답변 하기
              </h2>
              <button
                onClick={() => setShowGeneralInquiryReplyModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="py-6 px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 문의 정보 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="user" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">문의 정보</h3>
                  </div>
                  
                  <div className="space-y-0">
                    <div>
                      <span className="text-sm font-medium text-gray-600">문의 일시: </span>
                      <span className="text-sm">{selectedInquiry.inquiryDate}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">문의자: </span>
                      <span className="text-sm">{selectedInquiry.inquirer}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">문의 내용: </span>
                      <div className="text-sm mt-1 p-3 bg-gray-50 rounded text-gray-700 min-h-24 max-h-48 overflow-y-auto whitespace-pre-wrap">
                        {selectedInquiry.content}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 답변 작성 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="edit" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">답변 하기</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        답변 내용
                      </label>
                      <textarea
                        rows={8}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="답변 내용을 입력하세요"
                        defaultValue="네트워크 케이블이 정확히 꼽혀 있는지 확인 해 주세요!"
                      />
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">답변자: </span>
                      <span className="text-sm">이배정 (관리팀)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex gap-3 py-4 px-6 border-t border-gray-200">
              <button
                onClick={() => setShowGeneralInquiryReplyModal(false)}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setShowGeneralInquiryReplyModal(false);
                  // 답변 완료 로직 추가
                  alert('답변이 완료되었습니다.');
                }}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                답변 하기
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 답변수정하기 프레임 */}
      {showGeneralInquiryEditModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="edit" size={24} className="mr-2 text-blue-600" />
                답변 수정하기
              </h2>
              <button
                onClick={() => setShowGeneralInquiryEditModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="py-6 px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 문의 정보 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="user" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">문의 정보</h3>
                  </div>
                  
                  <div className="space-y-0">
                    <div>
                      <span className="text-sm font-medium text-gray-600">문의 일시: </span>
                      <span className="text-sm">{selectedInquiry.inquiryDate}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">문의자: </span>
                      <span className="text-sm">{selectedInquiry.inquirer}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">문의 내용: </span>
                      <div className="text-sm mt-1 p-3 bg-gray-50 rounded text-gray-700 min-h-24 max-h-48 overflow-y-auto whitespace-pre-wrap">
                        {selectedInquiry.content}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 답변 수정 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="edit" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">답변 수정</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        답변 내용
                      </label>
                      <textarea
                        rows={8}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="답변 내용을 입력하세요"
                        defaultValue={selectedInquiry.answerContent || "모니터 전원 케이블를 한번 더 꼽아 주세요! 모니터 전원 버튼을 켜 주십시요 이상과 같이 조치가 되지 않을 따는 서비스 신청 해 주세요!"}
                      />
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">답변자: </span>
                      <span className="text-sm">이배정 (관리팀)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex gap-3 py-4 px-6 border-t border-gray-200">
              <button
                onClick={() => setShowGeneralInquiryEditModal(false)}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setShowGeneralInquiryEditModal(false);
                  // 수정 완료 로직 추가
                  alert('답변이 수정되었습니다.');
                }}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                수정 하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 답변삭제하기 프레임 */}
      {showGeneralInquiryDeleteModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-enter">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200" style={{paddingTop: '30px'}}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="trash" size={24} className="mr-2 text-red-600" />
                답변 삭제하기
              </h2>
              <button
                onClick={() => setShowGeneralInquiryDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="py-6 px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 문의 정보 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="user" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">문의 정보</h3>
                  </div>
                  
                  <div className="space-y-0">
                    <div>
                      <span className="text-sm font-medium text-gray-600">문의 일시: </span>
                      <span className="text-sm">{selectedInquiry.inquiryDate}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">문의자: </span>
                      <span className="text-sm">{selectedInquiry.inquirer}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">문의 내용: </span>
                      <div className="text-sm mt-1 p-3 bg-gray-50 rounded text-gray-700 min-h-24 max-h-48 overflow-y-auto whitespace-pre-wrap">
                        {selectedInquiry.content}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 답변 정보 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="edit" size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">답변 정보</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        답변 내용
                      </label>
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 min-h-32 max-h-48 overflow-y-auto whitespace-pre-wrap">
                        {selectedInquiry.answerContent || "모니터 전원 케이블를 한번 더 꼽아 주세요! 모니터 전원 버튼을 켜 주십시요 이상과 같이 조치가 되지 않을 따는 서비스 신청 해 주세요!"}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">답변자: </span>
                      <span className="text-sm">이배정 (관리팀)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex gap-3 py-4 px-6 border-t border-gray-200">
              <button
                onClick={() => setShowGeneralInquiryDeleteModal(false)}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setShowGeneralInquiryDeleteModal(false);
                  // 삭제 완료 로직 추가
                  alert('답변이 삭제되었습니다.');
                }}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200 button-smooth"
              >
                삭제 하기
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 애니메이션 스타일 */}
      <style jsx>{`
        @keyframes slideInLeft {
          0% {
            opacity: 0;
            transform: translateX(-100px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInBottom {
          0% {
            opacity: 0;
            transform: translateY(100px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInRight {
          0% {
            opacity: 0;
            transform: translateX(100px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>

    </div>
  )
}

export default ServiceManagerPage;
