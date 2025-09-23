// ITSM Backend Types
export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  department: string;
  position: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  created_at: Date;
}

export interface ServiceRequest {
  id: string;
  request_number: string;
  title: string;
  description: string;
  requester_id: string;
  requester_department: string;
  actual_requester_name?: string;
  actual_requester_department?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  stage: '접수' | '배정' | '재배정' | '확인' | '예정' | '작업' | '완료' | '미결';
  service_type: string; // This will be populated from service_types table
  service_type_id: number;
  request_date: Date;
  assignment_date?: Date;
  assignment_manager_id?: string;
  assignee_id?: string;
  assignee_name?: string;
  assignee_department?: string;
  estimated_completion_date?: Date;
  work_start_date?: Date;
  work_completion_date?: Date;
  technician_id?: string;
  technician_name?: string;
  technician_department?: string;
  resolution_notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface GeneralInquiry {
  id: string;
  inquiry_number: string;
  title: string;
  content: string;
  requester_id: string;
  requester_department: string;
  status: 'pending' | 'answered' | 'closed';
  inquiry_date: Date;
  answer_content?: string;
  answer_date?: Date;
  answerer_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  view_count: number;
  is_active: boolean;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface SystemLog {
  id: string;
  user_id: string;
  action: string;
  table_name?: string;
  record_id?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export interface PasswordResetToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  used: boolean;
  created_at: Date;
}

// API Request/Response Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: Omit<User, 'password_hash'>;
  message?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  department: string;
  position: string;
  role: 'user' | 'technician' | 'assignment_manager' | 'service_manager' | 'system_admin';
  phone?: string;
}

export interface ServiceRequestCreate {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  service_type_id: number;
}

export interface GeneralInquiryCreate {
  title: string;
  content: string;
}

export interface FAQCreate {
  question: string;
  answer: string;
  category?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface SearchParams extends PaginationParams {
  search?: string;
  status?: string;
  stage?: string;
  department?: string;
  role?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
}

// Database Query Types
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

export interface QueryResult<T> {
  rows: T[];
  rowCount: number;
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// API Response Wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
