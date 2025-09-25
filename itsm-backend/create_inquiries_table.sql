-- 일반문의 테이블 생성 (UTF-8 호환)
CREATE TABLE general_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inquiry_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    requester_id UUID REFERENCES users(id),
    department VARCHAR(100) NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'closed')),
    answer TEXT,
    answered_by UUID REFERENCES users(id),
    answered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_secret BOOLEAN DEFAULT FALSE
);

-- 인덱스 생성
CREATE INDEX idx_general_inquiries_created_at ON general_inquiries(created_at);
CREATE INDEX idx_general_inquiries_department ON general_inquiries(department);
CREATE INDEX idx_general_inquiries_requester_id ON general_inquiries(requester_id);
CREATE INDEX idx_general_inquiries_status ON general_inquiries(status);

-- 트리거 생성
CREATE TRIGGER update_general_inquiries_updated_at BEFORE UPDATE ON general_inquiries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
