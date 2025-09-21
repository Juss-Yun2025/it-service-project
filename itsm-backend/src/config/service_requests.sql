-- Service requests table creation
CREATE TABLE IF NOT EXISTS service_requests (
    id SERIAL PRIMARY KEY,
    request_number VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT '신청',
    current_status VARCHAR(50) NOT NULL DEFAULT '신청',
    request_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    request_time TIME,
    requester_id INTEGER REFERENCES users(id),
    requester_name VARCHAR(100) NOT NULL,
    requester_department VARCHAR(100) NOT NULL,
    stage VARCHAR(50) NOT NULL DEFAULT '신청',
    assign_time TIME,
    assign_date TIMESTAMP WITH TIME ZONE,
    assignee_id INTEGER REFERENCES users(id),
    assignee_name VARCHAR(100),
    assignee_department VARCHAR(100),
    content TEXT NOT NULL,
    contact VARCHAR(20),
    location VARCHAR(200),
    actual_contact VARCHAR(20),
    service_type VARCHAR(50) NOT NULL DEFAULT '일반',
    completion_date TIMESTAMP WITH TIME ZONE,
    assignment_opinion TEXT,
    previous_assign_date TIMESTAMP WITH TIME ZONE,
    previous_assignee VARCHAR(100),
    previous_assignment_opinion TEXT,
    rejection_date TIMESTAMP WITH TIME ZONE,
    rejection_opinion TEXT,
    scheduled_date DATE,
    work_start_date TIMESTAMP WITH TIME ZONE,
    work_content TEXT,
    work_complete_date TIMESTAMP WITH TIME ZONE,
    problem_issue TEXT,
    is_unresolved BOOLEAN DEFAULT false,
    current_work_stage VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sample data insertion
INSERT INTO service_requests (
    request_number, title, status, current_status, request_date, request_time,
    requester_name, requester_department, stage, assign_time, assign_date,
    assignee_name, assignee_department, content, contact, location,
    service_type, assignment_opinion, work_content, current_work_stage
) VALUES
('SR-20250101-001', 'Monitor Power Issue', '진행중', '오류발생', '2025-01-01 09:30:00', '09:30:00',
 'Kim Youngja', '운영팀', '확인', '11:40:00', '2025-01-01 11:10:00',
 'Kim Gisul', 'IT팀', 'Monitor power does not turn on', '010-6543-9874', '본사 2층 운영팀',
 '자산', 'Monitor replacement needed', 'Power cable check and replacement', '작업중'),

('SR-20250101-002', 'Printer Print Error', '진행중', '진행중', '2025-01-01 10:15:00', '10:15:00',
 'Lee Younghee', '관리부', '배정', '14:20:00', '2025-01-01 14:00:00',
 'Park Gisul', 'IT팀', 'Printer does not print', '010-1234-5678', '본사 3층 관리부',
 '장비', 'Driver reinstall needed', 'Printer driver reinstall and test', '대기'),

('SR-20250101-003', 'Network Connection Unstable', '완료', '완료', '2025-01-01 11:00:00', '11:00:00',
 'Choi Minsu', '개발팀', '완료', '13:30:00', '2025-01-01 13:00:00',
 'Jung Gisul', 'IT팀', 'Internet connection is unstable', '010-9876-5432', '본사 4층 개발팀',
 '네트워크', 'Resolved by router restart', 'Router restart and network check', '완료'),

('SR-20250102-001', 'Computer Speed Slow', '진행중', '진행중', '2025-01-02 08:45:00', '08:45:00',
 'Kang Jiyeong', '영업팀', '작업중', '10:30:00', '2025-01-02 10:00:00',
 'Kim Gisul', 'IT팀', 'Computer is very slow', '010-5555-1234', '본사 1층 영업팀',
 '소프트웨어', 'System cleanup and optimization needed', 'Remove unnecessary programs and disk cleanup', '작업중'),

('SR-20250102-002', 'Email Access Failed', '신청', '신청', '2025-01-02 14:20:00', '14:20:00',
 'Yoon Seoyeon', '마케팅팀', '신청', NULL, NULL,
 NULL, NULL, 'Cannot access email program', '010-7777-8888', '본사 2층 마케팅팀',
 '소프트웨어', NULL, NULL, '신청'),

('SR-20250103-001', 'Keyboard Key Malfunction', '진행중', '진행중', '2025-01-03 09:10:00', '09:10:00',
 'Song Minho', '생산부', '배정', '11:15:00', '2025-01-03 11:00:00',
 'Park Gisul', 'IT팀', 'Some keyboard keys do not work', '010-3333-4444', '공장 1층 생산부',
 '자산', 'Keyboard replacement needed', 'Keyboard replacement and test', '대기'),

('SR-20250103-002', 'Program Installation Request', '완료', '완료', '2025-01-03 13:30:00', '13:30:00',
 'Han Jieun', '재무팀', '완료', '15:45:00', '2025-01-03 15:30:00',
 'Jung Gisul', 'IT팀', 'Request accounting program installation', '010-6666-9999', '본사 3층 재무팀',
 '소프트웨어', 'Program installation completed', 'Accounting program installation and license registration', '완료'),

('SR-20250104-001', 'Server Access Error', '진행중', '오류발생', '2025-01-04 10:00:00', '10:00:00',
 'Lim Donghyun', 'IT팀', '작업중', '10:30:00', '2025-01-04 10:15:00',
 'Kim Gisul', 'IT팀', 'Cannot access internal server', '010-1111-2222', '본사 5층 IT팀',
 '서버', 'Server check in progress', 'Server status check and recovery', '작업중'),

('SR-20250104-002', 'Screen Resolution Issue', '진행중', '진행중', '2025-01-04 11:45:00', '11:45:00',
 'Oh Sujin', '인사팀', '배정', '14:00:00', '2025-01-04 13:45:00',
 'Park Gisul', 'IT팀', 'Monitor screen appears blurry', '010-8888-7777', '본사 2층 인사팀',
 '자산', 'Resolution setting adjustment needed', 'Monitor resolution setting adjustment', '대기'),

('SR-20250105-001', 'Backup System Error', '신청', '신청', '2025-01-05 08:30:00', '08:30:00',
 'Shin Yerin', '보안팀', '신청', NULL, NULL,
 NULL, NULL, 'Automatic backup does not run', '010-9999-0000', '본사 4층 보안팀',
 '서버', NULL, NULL, '신청');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_service_requests_request_date ON service_requests(request_date);
CREATE INDEX IF NOT EXISTS idx_service_requests_requester_id ON service_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_assignee_id ON service_requests(assignee_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_stage ON service_requests(stage);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);