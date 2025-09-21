-- ITSM Database Schema
-- PostgreSQL Database Schema for ITSM System

-- Create Database (run this separately)
-- CREATE DATABASE itsm_db;

-- Connect to the database
-- \c itsm_db;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (?ъ슜??愿由?
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

-- Service Categories (?쒕퉬??移댄뀒怨좊━)
CREATE TABLE service_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service Requests (?쒕퉬???붿껌)
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
    stage VARCHAR(20) DEFAULT '?묒닔' CHECK (stage IN ('?묒닔', '諛곗젙', '?щ같??, '?뺤씤', '?덉젙', '?묒뾽', '?꾨즺', '誘멸껐')),
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

-- General Inquiries (?쇰컲臾몄쓽)
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

-- FAQ (?먯＜?섎뒗 吏덈Ц)
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

-- System Logs (?쒖뒪??濡쒓렇)
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

-- Password Reset Tokens (鍮꾨?踰덊샇 ?ъ꽕???좏겙)
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
('?쒖뒪???ㅻ쪟', '?쒖뒪??愿???ㅻ쪟 諛?臾몄젣'),
('?뚰봽?몄썾???ㅼ튂', '?뚰봽?몄썾???ㅼ튂 諛??ㅼ젙'),
('?섎뱶?⑥뼱 臾몄젣', '?섎뱶?⑥뼱 愿??臾몄젣'),
('?ㅽ듃?뚰겕 臾몄젣', '?ㅽ듃?뚰겕 ?곌껐 諛??ㅼ젙'),
('怨꾩젙 愿由?, '?ъ슜??怨꾩젙 愿??臾몄젣'),
('湲고?', '湲고? ?쒕퉬???붿껌');

-- Default admin user (password: admin123)
INSERT INTO users (email, password_hash, name, department, position, role, phone) VALUES
('admin@itsm.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '?쒖뒪?쒓?由ъ옄', 'IT?', '?由?, 'system_admin', '010-0000-0000'),
('service@itsm.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '?쒕퉬?ㅻℓ?덉?', 'IT?', '?由?, 'service_manager', '010-1111-1111'),
('assignment@itsm.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '諛곗젙?대떦??, 'IT?', '?由?, 'assignment_manager', '010-2222-2222'),
('tech@itsm.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '議곗튂?대떦??, 'IT?', '?由?, 'technician', '010-3333-3333'),
('user@itsm.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '?쇰컲?ъ슜??, '?몄궗?', '?ъ썝', 'user', '010-4444-4444');

-- Sample FAQ
INSERT INTO faqs (question, answer, category, created_by) VALUES
('鍮꾨?踰덊샇瑜??딆뼱踰꾨졇?듬땲?? ?대뼸寃??댁빞 ?섎굹??', '濡쒓렇???섏씠吏?먯꽌 "鍮꾨?踰덊샇 李얘린"瑜??대┃?섏뿬 ?대찓?쇰줈 ?ъ꽕??留곹겕瑜?諛쏆쑝?????덉뒿?덈떎.', '怨꾩젙愿由?, (SELECT id FROM users WHERE email = 'admin@itsm.com')),
('?쒕퉬???붿껌? ?대뼸寃??섎굹??', '濡쒓렇????"?쒕퉬???붿껌" 硫붾돱?먯꽌 ?꾩슂???쒕퉬?ㅻ? ?좎껌?섏떎 ???덉뒿?덈떎.', '?쒕퉬?ㅼ슂泥?, (SELECT id FROM users WHERE email = 'admin@itsm.com')),
('?묒뾽 吏꾪뻾 ?곹솴? ?대뵒???뺤씤?섎굹??', '濡쒓렇????"?붿껌 吏꾪뻾?ы빆" 硫붾돱?먯꽌 蹂몄씤???좎껌???쒕퉬?ㅼ쓽 吏꾪뻾 ?곹솴???뺤씤?섏떎 ???덉뒿?덈떎.', '吏꾪뻾?곹솴', (SELECT id FROM users WHERE email = 'admin@itsm.com'));
