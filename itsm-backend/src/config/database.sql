-- ITSM Database Schema
-- PostgreSQL Database Schema for ITSM System

-- Create Database (run this separately)
-- CREATE DATABASE itsm_db;

-- Connect to the database
-- \c itsm_db;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (사용자 관리)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    position VARCHAR(50) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'technician', 'assignment_manager', 'service_manager', 'system_admin')),
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Service Categories (서비스 카테고리)
CREATE TABLE service_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service Requests (서비스 요청)
CREATE TABLE service_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_number VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category_id UUID REFERENCES service_categories(id),
    requester_id UUID REFERENCES users(id),
    requester_department VARCHAR(100) NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
    stage VARCHAR(20) DEFAULT '신청' CHECK (stage IN ('신청', '배정', '확인', '예정', '작업', '완료', '미결')),
    service_type VARCHAR(50) NOT NULL,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assignment_date TIMESTAMP,
    assignment_manager_id UUID REFERENCES users(id),
    estimated_completion_date TIMESTAMP,
    work_start_date TIMESTAMP,
    work_completion_date TIMESTAMP,
    technician_id UUID REFERENCES users(id),
    technician_department VARCHAR(100),
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- General Inquiries (일반문의)
CREATE TABLE general_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inquiry_number VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    requester_id UUID REFERENCES users(id),
    requester_department VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'closed')),
    inquiry_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    answer_content TEXT,
    answer_date TIMESTAMP,
    answerer_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FAQ (자주하는 질문)
CREATE TABLE faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(50),
    view_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System Logs (시스템 로그)
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Password Reset Tokens (비밀번호 재설정 토큰)
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_service_requests_requester ON service_requests(requester_id);
CREATE INDEX idx_service_requests_technician ON service_requests(technician_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_stage ON service_requests(stage);
CREATE INDEX idx_service_requests_request_date ON service_requests(request_date);
CREATE INDEX idx_general_inquiries_requester ON general_inquiries(requester_id);
CREATE INDEX idx_general_inquiries_status ON general_inquiries(status);
CREATE INDEX idx_general_inquiries_inquiry_date ON general_inquiries(inquiry_date);
CREATE INDEX idx_faqs_category ON faqs(category);
CREATE INDEX idx_faqs_active ON faqs(is_active);
CREATE INDEX idx_system_logs_user ON system_logs(user_id);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON service_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_general_inquiries_updated_at BEFORE UPDATE ON general_inquiries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial data
-- Service Categories
INSERT INTO service_categories (name, description) VALUES
('시스템 오류', '시스템 관련 오류 및 문제'),
('소프트웨어 설치', '소프트웨어 설치 및 설정'),
('하드웨어 문제', '하드웨어 관련 문제'),
('네트워크 문제', '네트워크 연결 및 설정'),
('계정 관리', '사용자 계정 관련 문제'),
('기타', '기타 서비스 요청');

-- Default admin user (password: admin123)
INSERT INTO users (email, password_hash, name, department, position, role, phone) VALUES
('admin@itsm.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '시스템관리자', 'IT팀', '대리', 'system_admin', '010-0000-0000'),
('service@itsm.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '서비스매니저', 'IT팀', '대리', 'service_manager', '010-1111-1111'),
('assignment@itsm.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '배정담당자', 'IT팀', '대리', 'assignment_manager', '010-2222-2222'),
('tech@itsm.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '조치담당자', 'IT팀', '대리', 'technician', '010-3333-3333'),
('user@itsm.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '일반사용자', '인사팀', '사원', 'user', '010-4444-4444');

-- Sample FAQ
INSERT INTO faqs (question, answer, category, created_by) VALUES
('비밀번호를 잊어버렸습니다. 어떻게 해야 하나요?', '로그인 페이지에서 "비밀번호 찾기"를 클릭하여 이메일로 재설정 링크를 받으실 수 있습니다.', '계정관리', (SELECT id FROM users WHERE email = 'admin@itsm.com')),
('서비스 요청은 어떻게 하나요?', '로그인 후 "서비스 요청" 메뉴에서 필요한 서비스를 신청하실 수 있습니다.', '서비스요청', (SELECT id FROM users WHERE email = 'admin@itsm.com')),
('작업 진행 상황은 어디서 확인하나요?', '로그인 후 "요청 진행사항" 메뉴에서 본인이 신청한 서비스의 진행 상황을 확인하실 수 있습니다.', '진행상황', (SELECT id FROM users WHERE email = 'admin@itsm.com'));
