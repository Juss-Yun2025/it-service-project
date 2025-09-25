-- 일반문의 샘플 데이터 삽입 (실제 테이블 구조에 맞게 수정)
-- 먼저 사용자 ID를 확인
SELECT id, name, department FROM users WHERE email LIKE 'user%' LIMIT 5;

-- 일반문의 샘플 데이터 삽입
INSERT INTO general_inquiries (
    inquiry_number, 
    title, 
    content, 
    requester_id, 
    department, 
    status, 
    created_at,
    answer,
    answered_at,
    answered_by,
    is_secret
) VALUES 
-- 답변 완료된 문의
(
    'INQ-2025-001',
    '시스템 로그인 문제',
    '오늘부터 시스템에 로그인이 안됩니다. 비밀번호를 여러 번 변경해봤는데도 계속 로그인 오류가 발생합니다.',
    (SELECT id FROM users WHERE email = 'user1@company.com' LIMIT 1),
    '영업팀',
    'answered',
    '2025-09-20 09:30:00',
    '로그인 문제를 확인해보니 계정이 일시적으로 잠금 상태였습니다. 계정을 활성화했으니 다시 시도해보세요.',
    '2025-09-20 14:15:00',
    (SELECT id FROM users WHERE email = 'admin@itsm.com' LIMIT 1),
    false
),
(
    'INQ-2025-002',
    '프린터 연결 오류',
    '회의실 프린터가 연결되지 않습니다. 네트워크 설정을 확인해주세요.',
    (SELECT id FROM users WHERE email = 'user2@company.com' LIMIT 1),
    '마케팅팀',
    'answered',
    '2025-09-21 10:15:00',
    '프린터 드라이버를 업데이트하고 네트워크 설정을 재구성했습니다. 이제 정상적으로 작동할 것입니다.',
    '2025-09-21 16:30:00',
    (SELECT id FROM users WHERE email = 'service@itsm.com' LIMIT 1),
    false
),
(
    'INQ-2025-003',
    '이메일 계정 문제',
    '이메일이 수신되지 않습니다. 외부에서 보낸 메일이 차단되고 있는 것 같습니다.',
    (SELECT id FROM users WHERE email = 'user3@company.com' LIMIT 1),
    '인사팀',
    'answered',
    '2025-09-22 11:00:00',
    '스팸 필터 설정을 조정했습니다. 이제 외부 이메일도 정상적으로 수신될 것입니다.',
    '2025-09-22 15:45:00',
    (SELECT id FROM users WHERE email = 'admin@itsm.com' LIMIT 1),
    false
),
-- 답변 대기 중인 문의
(
    'INQ-2025-004',
    '소프트웨어 설치 요청',
    '새로운 프로젝트 관리 소프트웨어 설치가 필요합니다. 어떤 절차를 거쳐야 하나요?',
    (SELECT id FROM users WHERE email = 'user4@company.com' LIMIT 1),
    '개발팀',
    'pending',
    '2025-09-23 14:20:00',
    NULL,
    NULL,
    NULL,
    false
),
(
    'INQ-2025-005',
    '비밀번호 초기화',
    '비밀번호를 잊어버렸습니다. 초기화해주세요.',
    (SELECT id FROM users WHERE email = 'user5@company.com' LIMIT 1),
    '재무팀',
    'pending',
    '2025-09-24 09:45:00',
    NULL,
    NULL,
    NULL,
    false
),
(
    'INQ-2025-006',
    '네트워크 속도 문제',
    '인터넷 속도가 매우 느립니다. 네트워크 점검을 요청합니다.',
    (SELECT id FROM users WHERE email = 'user6@company.com' LIMIT 1),
    '운영팀',
    'pending',
    '2025-09-24 16:30:00',
    NULL,
    NULL,
    NULL,
    false
),
-- 비밀 문의
(
    'INQ-2025-007',
    '보안 관련 문의',
    '시스템 보안 정책에 대한 문의가 있습니다. 개인적으로 연락 부탁드립니다.',
    (SELECT id FROM users WHERE email = 'user7@company.com' LIMIT 1),
    '경영진',
    'pending',
    '2025-09-25 10:00:00',
    NULL,
    NULL,
    NULL,
    true
),
-- 답변 완료된 비밀 문의
(
    'INQ-2025-008',
    '데이터 백업 문의',
    '중요한 데이터의 백업 방법에 대해 문의드립니다.',
    (SELECT id FROM users WHERE email = 'user8@company.com' LIMIT 1),
    '경영진',
    'answered',
    '2025-09-19 15:30:00',
    '데이터 백업 절차와 정책에 대해 개인적으로 안내드렸습니다.',
    '2025-09-20 11:00:00',
    (SELECT id FROM users WHERE email = 'admin@itsm.com' LIMIT 1),
    true
);

-- 삽입된 데이터 확인
SELECT 
    inquiry_number,
    title,
    department,
    status,
    created_at,
    answered_at,
    is_secret
FROM general_inquiries 
ORDER BY created_at DESC;
