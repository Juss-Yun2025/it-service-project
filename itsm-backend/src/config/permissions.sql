-- 권한 관련 테이블 생성

-- 역할(roles) 테이블
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 권한(permissions) 테이블
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    resource VARCHAR(50) NOT NULL, -- 'users', 'services', 'reports', 'system' 등
    action VARCHAR(50) NOT NULL,   -- 'read', 'write', 'delete', 'admin' 등
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 역할-권한 매핑 테이블
CREATE TABLE IF NOT EXISTS role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
);

-- 사용자-역할 매핑 테이블
CREATE TABLE IF NOT EXISTS user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_id)
);

-- 기본 역할 데이터 삽입
INSERT INTO roles (name, description) VALUES
('시스템관리', '시스템 전체 관리 권한'),
('관리매니저', '부서 및 사용자 관리 권한'),
('배정담당자', '서비스 요청 배정 및 관리 권한'),
('조치담당자', '서비스 요청 처리 권한'),
('일반사용자', '기본 사용자 권한')
ON CONFLICT (name) DO NOTHING;

-- 기본 권한 데이터 삽입
INSERT INTO permissions (name, description, resource, action) VALUES
-- 사용자 관리 권한
('users.read', '사용자 목록 조회', 'users', 'read'),
('users.write', '사용자 정보 수정', 'users', 'write'),
('users.create', '사용자 생성', 'users', 'create'),
('users.delete', '사용자 삭제', 'users', 'delete'),
('users.admin', '사용자 관리자 권한', 'users', 'admin'),

-- 서비스 요청 관리 권한
('services.read', '서비스 요청 조회', 'services', 'read'),
('services.write', '서비스 요청 수정', 'services', 'write'),
('services.create', '서비스 요청 생성', 'services', 'create'),
('services.delete', '서비스 요청 삭제', 'services', 'delete'),
('services.assign', '서비스 요청 배정', 'services', 'assign'),
('services.process', '서비스 요청 처리', 'services', 'process'),
('services.admin', '서비스 요청 관리자 권한', 'services', 'admin'),

-- 보고서 관리 권한
('reports.read', '보고서 조회', 'reports', 'read'),
('reports.write', '보고서 수정', 'reports', 'write'),
('reports.create', '보고서 생성', 'reports', 'create'),
('reports.delete', '보고서 삭제', 'reports', 'delete'),
('reports.admin', '보고서 관리자 권한', 'reports', 'admin'),

-- 시스템 관리 권한
('system.read', '시스템 설정 조회', 'system', 'read'),
('system.write', '시스템 설정 수정', 'system', 'write'),
('system.admin', '시스템 관리자 권한', 'system', 'admin'),

-- FAQ 관리 권한
('faq.read', 'FAQ 조회', 'faq', 'read'),
('faq.write', 'FAQ 수정', 'faq', 'write'),
('faq.create', 'FAQ 생성', 'faq', 'create'),
('faq.delete', 'FAQ 삭제', 'faq', 'delete'),
('faq.admin', 'FAQ 관리자 권한', 'faq', 'admin'),

-- 문의 관리 권한
('inquiry.read', '문의 조회', 'inquiry', 'read'),
('inquiry.write', '문의 수정', 'inquiry', 'write'),
('inquiry.create', '문의 생성', 'inquiry', 'create'),
('inquiry.delete', '문의 삭제', 'inquiry', 'delete'),
('inquiry.admin', '문의 관리자 권한', 'inquiry', 'admin')
ON CONFLICT (name) DO NOTHING;

-- 역할-권한 매핑 데이터 삽입
-- 시스템관리: 모든 권한
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = '시스템관리'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 관리매니저: 사용자, 서비스, 보고서 관리 권한
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = '관리매니저'
AND p.resource IN ('users', 'services', 'reports')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 배정담당자: 서비스 배정 및 조회 권한
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = '배정담당자'
AND (p.name LIKE 'services.%' AND p.name != 'services.admin')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 조치담당자: 서비스 처리 권한
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = '조치담당자'
AND p.name IN ('services.read', 'services.write', 'services.process')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 일반사용자: 기본 조회 및 생성 권한
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = '일반사용자'
AND p.name IN (
    'services.read', 'services.create',
    'faq.read', 'inquiry.read', 'inquiry.create'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 기존 사용자들에게 기본 역할 할당 (일반사용자)
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE r.name = '일반사용자'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
)
ON CONFLICT (user_id, role_id) DO NOTHING;

-- 관리자 계정에 시스템관리 역할 할당
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'admin' AND r.name = '시스템관리'
ON CONFLICT (user_id, role_id) DO NOTHING;
