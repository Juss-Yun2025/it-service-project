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
  role?: string;
  status?: string;
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
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
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
}

export const apiClient = new ApiClient(API_BASE_URL);
