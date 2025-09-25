// API 통신을 위한 유틸리티 함수들

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-api.com' 
  : 'http://localhost:3001';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    department?: string;
    position?: string;
    status: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  department?: string;
  position?: string;
  status: string;
  created_at: string;
}

export interface UserUpdateRequest {
  email?: string;
  name?: string;
  department?: string;
  position?: string;
  phone?: string;
  role?: string;
  status?: string;
}

// ===== 단계 관리 인터페이스 =====
export interface Stage {
  id: number;
  name: string;
  description?: string;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

export interface StageCreateRequest {
  name: string;
  description?: string;
  sort_order?: number;
}

export interface StageUpdateRequest {
  name?: string;
  description?: string;
  sort_order?: number;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Position {
  id: number;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PositionCreateRequest {
  name: string;
  description?: string;
  sort_order?: number;
}

export interface PositionUpdateRequest {
  name?: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface DepartmentCreateRequest {
  name: string;
  description?: string;
}

export interface DepartmentUpdateRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface ServiceType {
  id: number;
  name: string;
  description?: string;
  color?: string;
  is_active?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

// ===== 일반문의 관련 인터페이스 =====
export interface GeneralInquiry {
  id: string;
  inquiry_number: string;
  title: string;
  content: string;
  requester_id: string;
  requester_name: string;
  requester_department: string;
  status: 'pending' | 'answered' | 'closed';
  inquiry_date: string;
  answer_content?: string;
  answer_date?: string;
  answerer_id?: string;
  answerer_name?: string;
  is_secret?: boolean;
  created_at: string;
  updated_at: string;
}

export interface GeneralInquiryCreateRequest {
  title: string;
  content: string;
}

export interface GeneralInquiryUpdateRequest {
  title?: string;
  content?: string;
  answer_content?: string;
}

export interface GeneralInquiryListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  department?: string;
  startDate?: string;
  endDate?: string;
  unansweredOnly?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface GeneralInquiryAnswerRequest {
  answer_content: string;
}

// ===== 서비스 요청 관련 인터페이스 =====

export interface ServiceRequest {
  id: number;
  request_number: string;
  title: string;
  current_status: string;
  request_date: string;
  request_time?: string;
  requester_id?: number;
  requester_name: string;
  requester_department: string;
  stage: string;
  assign_time?: string;
  assign_date?: string;
  assignee_id?: number;
  assignee_name?: string;
  assignee_department?: string;
  content: string;
  contact?: string;
  location?: string;
  actual_contact?: string;
  service_type: string;
  completion_date?: string;
  assignment_opinion?: string;
  previous_assign_date?: string;
  previous_assignee?: string;
  previous_assignment_opinion?: string;
  rejection_date?: string;
  rejection_opinion?: string;
  scheduled_date?: string;
  work_start_date?: string;
  work_content?: string;
  work_complete_date?: string;
  problem_issue?: string;
  is_unresolved?: boolean;
  created_at: string;
  updated_at: string;
}


export interface ServiceRequestCreateRequest {
  title: string;
  content: string;
  requester_id?: number;
  requester_name: string;
  requester_department: string;
  contact?: string;
  location?: string;
  service_type?: string;
}

export interface ServiceRequestUpdateRequest {
  title?: string;
  current_status?: string;
  stage?: string;
  assign_time?: string;
  assign_date?: string;
  assignee_id?: number;
  assignee_name?: string;
  assignee_department?: string;
  content?: string;
  contact?: string;
  location?: string;
  actual_contact?: string;
  service_type?: string;
  completion_date?: string;
  assignment_opinion?: string;
  // 작업정보 필드들
  scheduled_date?: string;
  work_start_date?: string;
  work_content?: string;
  work_complete_date?: string;
  problem_issue?: string;
  is_unresolved?: boolean;
  previous_assign_date?: string;
  previous_assignee?: string;
  previous_assignment_opinion?: string;
  rejection_date?: string;
  rejection_opinion?: string;
  scheduled_date?: string;
  work_start_date?: string;
  work_content?: string;
  work_complete_date?: string;
  problem_issue?: string;
  is_unresolved?: boolean;
}

export interface ServiceRequestListParams {
  startDate?: string;
  endDate?: string;
  department?: string;
  status?: string;
  stage_id?: number;
  showIncompleteOnly?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ===== 현재상태 관리 인터페이스 =====
export interface CurrentStatus {
  id: number;
  name: string;
  description?: string;
  color?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CurrentStatusCreateRequest {
  name: string;
  description?: string;
  color?: string;
}

export interface CurrentStatusUpdateRequest {
  name?: string;
  description?: string;
  color?: string;
  is_active?: boolean;
}


// 권한 관련 인터페이스
export interface Permission {
  name: string;
  resource: string;
  action: string;
  description: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: number;
  user_id: string;
  role_id: number;
  created_at: string;
  updated_at: string;
}

export interface PermissionCheckRequest {
  userId: string;
  resource: string;
  action: string;
}

export interface RoleAssignmentRequest {
  userId: string;
  roleId: number;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // localStorage에서 토큰 불러오기
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // 응답이 JSON이 아닌 경우 처리
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        data = { message: `서버 오류 (${response.status})` };
      }

      if (!response.ok) {
        const errorMessage = data.message || data.error || `HTTP error! status: ${response.status}`;
        console.error(`API Error [${response.status}]:`, errorMessage);
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      
      // 네트워크 오류인지 서버 오류인지 구분
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          error: '서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.'
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      };
    }
  }

  // 인증 관련 API
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      this.token = response.data.token;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }

    return response;
  }

  async logout(): Promise<void> {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  async register(userData: any): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data) {
      this.token = response.data.token;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }

    return response;
  }

  // 사용자 관리 API
  async getUsers(params?: {
    page?: number;
    limit?: number;
    department?: string;
    role?: string;
    name?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{ users: User[]; total: number; totalPages: number }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/api/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request(endpoint);
    
    // 백엔드 응답 구조를 프론트엔드가 기대하는 구조로 변환
    if (response.success && response.data) {
      return {
        success: true,
        data: {
          users: response.data as User[],
          total: (response as any).pagination?.total || 0,
          totalPages: (response as any).pagination?.totalPages || 1
        }
      };
    }
    
    return response as ApiResponse<{ users: User[]; total: number; totalPages: number }>;
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/api/users/${id}`);
  }

  async updateUser(id: string, userData: UserUpdateRequest): Promise<ApiResponse<User>> {
    return this.request<User>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }

  async resetUserPassword(id: string): Promise<ApiResponse<{ temporaryPassword: string }>> {
    return this.request<{ temporaryPassword: string }>(`/api/users/${id}/reset-password`, {
      method: 'POST',
    });
  }

  // 현재 사용자 정보 가져오기
  getCurrentUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  // 토큰 유효성 확인
  isAuthenticated(): boolean {
    return !!this.token;
  }

  // 권한 확인
  hasRole(requiredRole: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === requiredRole;
  }

  // 권한 목록 확인
  hasAnyRole(requiredRoles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? requiredRoles.includes(user.role) : false;
  }

  // ===== 부서 관리 API =====
  
  // 모든 부서 조회
  async getDepartments(): Promise<ApiResponse<Department[]>> {
    return this.request<Department[]>('/api/departments');
  }

  // 특정 부서 조회
  async getDepartment(id: number): Promise<ApiResponse<Department>> {
    return this.request<Department>(`/api/departments/${id}`);
  }

  // 새 부서 생성
  async createDepartment(data: DepartmentCreateRequest): Promise<ApiResponse<Department>> {
    return this.request<Department>('/api/departments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // 부서 수정
  async updateDepartment(id: number, data: DepartmentUpdateRequest): Promise<ApiResponse<Department>> {
    return this.request<Department>(`/api/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // 부서 삭제 (비활성화)
  async deleteDepartment(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/departments/${id}`, {
      method: 'DELETE'
    });
  }

  // ===== 서비스 요청 관리 API =====
  
  // 모든 서비스 요청 조회 (페이지네이션 지원)
  async getServiceRequests(params?: ServiceRequestListParams): Promise<ApiResponse<ServiceRequest[]>> {
    const queryParams = new URLSearchParams();
    
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.department) queryParams.append('department', params.department);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.stage_id) queryParams.append('stage_id', params.stage_id.toString());
    if (params?.showIncompleteOnly !== undefined) queryParams.append('showIncompleteOnly', params.showIncompleteOnly.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const url = queryString ? `/api/service-requests?${queryString}` : '/api/service-requests';
    
    return this.request<ServiceRequest[]>(url);
  }

  // 특정 서비스 요청 조회
  async getServiceRequest(id: number): Promise<ApiResponse<ServiceRequest>> {
    return this.request<ServiceRequest>(`/api/service-requests/${id}`);
  }

  // 새 서비스 요청 생성
  async createServiceRequest(data: ServiceRequestCreateRequest): Promise<ApiResponse<ServiceRequest>> {
    return this.request<ServiceRequest>('/api/service-requests', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // 서비스 요청 수정
  async updateServiceRequest(id: number, data: ServiceRequestUpdateRequest): Promise<ApiResponse<ServiceRequest>> {
    return this.request<ServiceRequest>(`/api/service-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // 서비스 요청 삭제
  async deleteServiceRequest(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/service-requests/${id}`, {
      method: 'DELETE'
    });
  }

  // 배정취소 처리
  async cancelAssignment(data: {
    requestId: number;
    rejectionOpinion: string;
    rejectionDate: string;
    rejectionName: string;
    stageId: number;
    previousAssigneeDate?: string;
    previousAssignee?: string;
  }): Promise<ApiResponse<void>> {
    return this.request<void>('/api/service-requests/cancel-assignment', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // ===== 현재상태 관리 API =====
  
  // 모든 현재상태 조회
  async getCurrentStatuses(): Promise<ApiResponse<CurrentStatus[]>> {
    return this.request<CurrentStatus[]>('/api/current-statuses');
  }

  // 특정 현재상태 조회
  async getCurrentStatus(id: number): Promise<ApiResponse<CurrentStatus>> {
    return this.request<CurrentStatus>(`/api/current-statuses/${id}`);
  }

  // 새 현재상태 생성
  async createCurrentStatus(data: CurrentStatusCreateRequest): Promise<ApiResponse<CurrentStatus>> {
    return this.request<CurrentStatus>('/api/current-statuses', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // 현재상태 수정
  async updateCurrentStatus(id: number, data: CurrentStatusUpdateRequest): Promise<ApiResponse<CurrentStatus>> {
    return this.request<CurrentStatus>(`/api/current-statuses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // 현재상태 삭제
  async deleteCurrentStatus(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/current-statuses/${id}`, {
      method: 'DELETE'
    });
  }


  // ===== 단계-진행 매칭 API =====
  
  // 모든 단계-진행 매칭 조회
  async getStageProgressMappings(): Promise<ApiResponse<StageProgressMapping[]>> {
    return this.request<StageProgressMapping[]>('/api/stage-progress-mappings');
  }

  // 특정 단계-진행 매칭 조회
  async getStageProgressMapping(id: number): Promise<ApiResponse<StageProgressMapping>> {
    return this.request<StageProgressMapping>(`/api/stage-progress-mappings/${id}`);
  }

  // 새 단계-진행 매칭 생성
  async createStageProgressMapping(data: StageProgressMappingCreateRequest): Promise<ApiResponse<StageProgressMapping>> {
    return this.request<StageProgressMapping>('/api/stage-progress-mappings', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // 단계-진행 매칭 수정
  async updateStageProgressMapping(id: number, data: StageProgressMappingUpdateRequest): Promise<ApiResponse<StageProgressMapping>> {
    return this.request<StageProgressMapping>(`/api/stage-progress-mappings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // 단계-진행 매칭 삭제
  async deleteStageProgressMapping(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/stage-progress-mappings/${id}`, {
      method: 'DELETE'
    });
  }

  // 단계명으로 진행명 조회
  async getProgressByStageName(stageName: string): Promise<ApiResponse<string>> {
    return this.request<string>(`/api/stages/progress/${encodeURIComponent(stageName)}`);
  }

  // ===== 단계 관리 API =====
  
  // 모든 단계 조회
  async getStages(): Promise<ApiResponse<Stage[]>> {
    return this.request<Stage[]>('/api/stages');
  }

  // 특정 단계 조회
  async getStage(id: number): Promise<ApiResponse<Stage>> {
    return this.request<Stage>(`/api/stages/${id}`);
  }

  // 새 단계 생성
  async createStage(data: StageCreateRequest): Promise<ApiResponse<Stage>> {
    return this.request<Stage>('/api/stages', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // 단계 수정
  async updateStage(id: number, data: StageUpdateRequest): Promise<ApiResponse<Stage>> {
    return this.request<Stage>(`/api/stages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // 단계 삭제
  async deleteStage(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/stages/${id}`, {
      method: 'DELETE'
    });
  }

  // ===== 권한 관련 API =====
  
  // 사용자 권한 조회
  async getUserPermissions(userId: string): Promise<ApiResponse<Permission[]>> {
    return this.request<Permission[]>(`/api/permissions/user/${userId}`);
  }

  // 사용자 역할 조회
  async getUserRoles(userId: string): Promise<ApiResponse<Role[]>> {
    return this.request<Role[]>(`/api/permissions/user/${userId}/roles`);
  }

  // 특정 권한 확인
  async checkPermission(userId: string, resource: string, action: string): Promise<ApiResponse<{ hasPermission: boolean }>> {
    return this.request<{ hasPermission: boolean }>(`/api/permissions/check/${userId}/${resource}/${action}`);
  }

  // 사용자에게 역할 할당
  async assignRole(userId: string, roleId: number): Promise<ApiResponse<UserRole>> {
    return this.request<UserRole>('/api/permissions/assign-role', {
      method: 'POST',
      body: JSON.stringify({ userId, roleId })
    });
  }

  // 사용자에서 역할 제거
  async removeRole(userId: string, roleId: number): Promise<ApiResponse<void>> {
    return this.request<void>('/api/permissions/remove-role', {
      method: 'DELETE',
      body: JSON.stringify({ userId, roleId })
    });
  }

  // 모든 역할 목록 조회
  async getAllRoles(): Promise<ApiResponse<Role[]>> {
    return this.request<Role[]>('/api/permissions/roles');
  }

  // 모든 권한 목록 조회
  async getAllPermissions(): Promise<ApiResponse<Permission[]>> {
    return this.request<Permission[]>('/api/permissions/permissions');
  }

  // ===== 직급 관련 API =====
  
  // 모든 직급 조회
  async getPositions(): Promise<ApiResponse<Position[]>> {
    return this.request<Position[]>('/api/positions');
  }

  // 특정 직급 조회
  async getPosition(id: number): Promise<ApiResponse<Position>> {
    return this.request<Position>(`/api/positions/${id}`);
  }

  // 새 직급 생성
  async createPosition(data: PositionCreateRequest): Promise<ApiResponse<Position>> {
    return this.request<Position>('/api/positions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // 직급 수정
  async updatePosition(id: number, data: PositionUpdateRequest): Promise<ApiResponse<Position>> {
    return this.request<Position>(`/api/positions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // 직급 삭제
  async deletePosition(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/positions/${id}`, {
      method: 'DELETE'
    });
  }

  // ===== 서비스 유형 관련 API =====

  // 모든 서비스 유형 조회
  async getServiceTypes(): Promise<ApiResponse<ServiceType[]>> {
    return this.request<ServiceType[]>('/api/service-types');
  }

  // 서비스 유형 ID로 조회
  async getServiceType(id: number): Promise<ApiResponse<ServiceType>> {
    return this.request<ServiceType>(`/api/service-types/${id}`);
  }

  // 새 서비스 유형 생성
  async createServiceType(data: Partial<ServiceType>): Promise<ApiResponse<ServiceType>> {
    return this.request<ServiceType>('/api/service-types', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // 서비스 유형 수정
  async updateServiceType(id: number, data: Partial<ServiceType>): Promise<ApiResponse<ServiceType>> {
    return this.request<ServiceType>(`/api/service-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // 서비스 유형 삭제
  async deleteServiceType(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/service-types/${id}`, {
      method: 'DELETE'
    });
  }


  // ===== 범용 HTTP 메서드 =====
  
  // PUT 요청
  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(`/api${url}`, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  // POST 요청
  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(`/api${url}`, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  // DELETE 요청
  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>(`/api${url}`, {
      method: 'DELETE'
    });
  }

  // 모든 역할 조회
  async getRoles(): Promise<ApiResponse<Role[]>> {
    return this.request<Role[]>('/api/roles');
  }

  // ===== 일반문의 관련 API =====

  // 모든 일반문의 조회
  async getInquiries(params?: GeneralInquiryListParams): Promise<ApiResponse<GeneralInquiry[]>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.department) queryParams.append('department', params.department);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.unansweredOnly !== undefined) queryParams.append('unansweredOnly', params.unansweredOnly.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/api/inquiries?${queryString}` : '/api/inquiries';
    
    return this.request<GeneralInquiry[]>(url);
  }

  // 특정 일반문의 조회
  async getInquiry(id: string): Promise<ApiResponse<GeneralInquiry>> {
    return this.request<GeneralInquiry>(`/api/inquiries/${id}`);
  }

  // 일반문의 생성
  async createInquiry(data: GeneralInquiryCreateRequest): Promise<ApiResponse<GeneralInquiry>> {
    return this.request<GeneralInquiry>('/api/inquiries', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // 일반문의 수정
  async updateInquiry(id: string, data: GeneralInquiryUpdateRequest): Promise<ApiResponse<GeneralInquiry>> {
    return this.request<GeneralInquiry>(`/api/inquiries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // 일반문의 삭제
  async deleteInquiry(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/inquiries/${id}`, {
      method: 'DELETE'
    });
  }

  // 일반문의 답변하기
  async answerInquiry(id: string, data: GeneralInquiryAnswerRequest): Promise<ApiResponse<GeneralInquiry>> {
    return this.request<GeneralInquiry>(`/api/inquiries/${id}/answer`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
