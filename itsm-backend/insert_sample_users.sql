-- 사용자 샘플 데이터 삽입 (일반문의용)
-- 기존 사용자가 있는지 확인
SELECT COUNT(*) as user_count FROM users;

-- 일반 사용자 샘플 데이터 삽입 (비밀번호: user123)
INSERT INTO users (email, password_hash, name, department, position, role, phone) VALUES
('user1@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '김영희', '영업팀', '대리', 'user', '010-1000-1000'),
('user2@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '박민수', '마케팅팀', '과장', 'user', '010-2000-2000'),
('user3@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '이지영', '인사팀', '부장', 'user', '010-3000-3000'),
('user4@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '최현우', '개발팀', '팀장', 'user', '010-4000-4000'),
('user5@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '정수진', '재무팀', '차장', 'user', '010-5000-5000'),
('user6@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '한동민', '운영팀', '대리', 'user', '010-6000-6000'),
('user7@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '윤서연', '경영진', '이사', 'user', '010-7000-7000'),
('user8@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '강태호', '경영진', '부사장', 'user', '010-8000-8000')
ON CONFLICT (email) DO NOTHING;

-- 삽입된 사용자 확인
SELECT id, email, name, department, role FROM users WHERE email LIKE 'user%' ORDER BY email;
