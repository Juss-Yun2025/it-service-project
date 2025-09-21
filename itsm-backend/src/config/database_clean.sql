-- ITSM Database Schema
-- PostgreSQL Database Schema for ITSM System

-- Create Database (run this separately)
-- CREATE DATABASE itsm_db;

-- Connect to the database
-- \c itsm_db;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (User Management)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    position VARCHAR(50) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('system_admin', 'service_manager', 'assignment_manager', 'technician', 'user')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service Categories table (Service Categories Management)
CREATE TABLE service_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service Requests table (Service Request Management)
CREATE TABLE service_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requester_id UUID NOT NULL REFERENCES users(id),
    category_id UUID NOT NULL REFERENCES service_categories(id),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
    stage VARCHAR(20) DEFAULT 'reception' CHECK (stage IN ('reception', 'assignment', 'reassignment', 'confirmation', 'scheduled', 'work', 'completed', 'unresolved')),
    technician_id UUID REFERENCES users(id),
    assignment_date TIMESTAMP,
    scheduled_date TIMESTAMP,
    work_start_date TIMESTAMP,
    work_completion_date TIMESTAMP,
    resolution TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- General Inquiries table (General Inquiry Management)
CREATE TABLE general_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inquiry_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    requester_id UUID NOT NULL REFERENCES users(id),
    department VARCHAR(100) NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'closed')),
    answer TEXT,
    answered_by UUID REFERENCES users(id),
    answered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FAQ table (FAQ Management)
CREATE TABLE faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System Logs table (System Log Management)
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_service_requests_requester_id ON service_requests(requester_id);
CREATE INDEX idx_service_requests_technician_id ON service_requests(technician_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_stage ON service_requests(stage);
CREATE INDEX idx_service_requests_created_at ON service_requests(created_at);

CREATE INDEX idx_general_inquiries_requester_id ON general_inquiries(requester_id);
CREATE INDEX idx_general_inquiries_status ON general_inquiries(status);
CREATE INDEX idx_general_inquiries_department ON general_inquiries(department);
CREATE INDEX idx_general_inquiries_created_at ON general_inquiries(created_at);

CREATE INDEX idx_faqs_category ON faqs(category);
CREATE INDEX idx_faqs_is_active ON faqs(is_active);

CREATE INDEX idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);
CREATE INDEX idx_system_logs_action ON system_logs(action);

-- Insert sample data
INSERT INTO service_categories (name, description) VALUES 
('Hardware Support', 'Computer hardware related issues'),
('Software Support', 'Software installation and configuration'),
('Network Support', 'Network connectivity and configuration'),
('Account Management', 'User account and permission management'),
('Security', 'Security related issues and policies');

-- Insert sample users
INSERT INTO users (email, password_hash, name, department, position, role) VALUES 
('admin@company.com', '$2b$10$example_hash_here', 'System Admin', 'IT Team', 'System Administrator', 'system_admin'),
('manager@company.com', '$2b$10$example_hash_here', 'Service Manager', 'IT Team', 'Service Manager', 'service_manager'),
('assignment@company.com', '$2b$10$example_hash_here', 'Assignment Manager', 'IT Team', 'Assignment Manager', 'assignment_manager'),
('tech1@company.com', '$2b$10$example_hash_here', 'Technician 1', 'IT Team', 'Senior Technician', 'technician'),
('tech2@company.com', '$2b$10$example_hash_here', 'Technician 2', 'IT Team', 'Junior Technician', 'technician'),
('user1@company.com', '$2b$10$example_hash_here', 'Regular User 1', 'Production Team', 'Operator', 'user'),
('user2@company.com', '$2b$10$example_hash_here', 'Regular User 2', 'Management Team', 'Manager', 'user');

-- Insert sample FAQs
INSERT INTO faqs (question, answer, category, created_by) VALUES 
('How to reset my password?', 'You can reset your password by clicking the "Forgot Password" link on the login page.', 'Account Management', (SELECT id FROM users WHERE email = 'admin@company.com')),
('How to submit a service request?', 'Go to the Service Request page and fill out the required information.', 'General', (SELECT id FROM users WHERE email = 'admin@company.com')),
('What is the response time for urgent requests?', 'Urgent requests are typically responded to within 2 hours during business hours.', 'Service Level', (SELECT id FROM users WHERE email = 'admin@company.com'));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_categories_updated_at BEFORE UPDATE ON service_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON service_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_general_inquiries_updated_at BEFORE UPDATE ON general_inquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
