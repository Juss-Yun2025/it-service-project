-- 한글 테스트 데이터
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
('INQ-2025-001', '시스템 로그인 문제', '로그인이 안됩니다', (SELECT id FROM users WHERE email = 'user1@company.com' LIMIT 1), '영업팀', 'answered', '2025-09-20 09:30:00', '문제를 해결했습니다', '2025-09-20 14:15:00', (SELECT id FROM users WHERE email = 'admin@itsm.com' LIMIT 1), false);

SELECT * FROM general_inquiries;
