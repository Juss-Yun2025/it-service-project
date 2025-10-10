-- Create FAQ Icons management table
-- This table manages available icons for FAQ system

CREATE TABLE faq_icons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    label VARCHAR(100) NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default FAQ icons
INSERT INTO faq_icons (name, file_path, label, category, sort_order) VALUES
('question', '/faq_icon/question.svg', '일반 질문', 'general', 1),
('solution', '/faq_icon/solution.svg', '해결책', 'general', 2),
('tool', '/faq_icon/tool.svg', '도구/수리', 'hardware', 3),
('computer', '/faq_icon/computer.svg', '컴퓨터', 'hardware', 4),
('email', '/faq_icon/email.svg', '이메일', 'software', 5),
('network', '/faq_icon/network.svg', '네트워크', 'network', 6),
('security', '/faq_icon/security.svg', '보안', 'security', 7),
('mobile', '/faq_icon/mobile.svg', '모바일', 'hardware', 8),
('monitor', '/faq_icon/monitor.svg', '모니터', 'hardware', 9),
('settings', '/faq_icon/settings.svg', '설정', 'system', 10),
('analytics', '/faq_icon/analytics.svg', '분석', 'system', 11),
('search', '/faq_icon/search.svg', '검색', 'general', 12),
('storage', '/faq_icon/storage.svg', '저장소', 'system', 13),
('printer', '/faq_icon/printer.svg', '프린터', 'hardware', 14),
('phone', '/faq_icon/phone.svg', '전화', 'communication', 15),
('office', '/faq_icon/office.svg', '사무실', 'general', 16);

-- Create indexes for better performance
CREATE INDEX idx_faq_icons_category ON faq_icons(category);
CREATE INDEX idx_faq_icons_active ON faq_icons(is_active);
CREATE INDEX idx_faq_icons_sort ON faq_icons(sort_order);

-- Create trigger for updated_at
CREATE TRIGGER update_faq_icons_updated_at BEFORE UPDATE ON faq_icons 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE faq_icons IS 'FAQ 시스템에서 사용할 수 있는 아이콘 관리 테이블';