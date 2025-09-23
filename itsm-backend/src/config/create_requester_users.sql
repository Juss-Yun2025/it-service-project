-- Create users for service_requests requester_name values
-- Insert users with names and departments from service_requests

INSERT INTO users (id, name, email, department, position, role, status, created_at, updated_at) VALUES
-- Generate UUIDs for each user
(gen_random_uuid(), '강감찬', 'kang@company.com', '재무팀', '대리', 'user', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), '김영수', 'kim.youngsu@company.com', '구매팀', '대리', 'user', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), '김영자', 'kim.youngja@company.com', '운영팀', '대리', 'user', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), '김철수', 'kim.chulsu@company.com', '생산부', '대리', 'user', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), '박민수', 'park.minsu@company.com', '생산부', '대리', 'user', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), '박지민', 'park.jimin@company.com', '재무팀', '대리', 'user', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), '배수정', 'bae.sujeong@company.com', '관리부', '대리', 'user', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), '배수정2', 'bae.sujeong2@company.com', '운영팀', '대리', 'user', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), '송미래', 'song.mirae@company.com', '고객서비스팀', '대리', 'user', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), '송현우', 'song.hyunwoo@company.com', '품질관리팀', '대리', 'user', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), '윤서연', 'yoon.seoyeon@company.com', '고객서비스팀', '대리', 'user', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), '윤지민', 'yoon.jimin@company.com', '영업팀', '대리', 'user', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), '윤지훈', 'yoon.jihun@company.com', '영업팀', '대리', 'user', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), '이지훈', 'lee.jihun@company.com', '재무팀', '대리', 'user', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), '이철수', 'lee.chulsu@company.com', '관리부', '대리', 'user', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), '임다은', 'lim.daeun@company.com', '연구개발팀', '대리', 'user', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), '임수진', 'lim.sujin@company.com', '품질관리팀', '대리', 'user', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), '정다은', 'jung.daeun@company.com', '인사팀', '대리', 'user', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), '정소영', 'jung.soyoung@company.com', '인사팀', '대리', 'user', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), '정수진', 'jung.sujin@company.com', '마케팅팀', '대리', 'user', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), '조미래', 'cho.mirae@company.com', '운영팀', '대리', 'user', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), '조현우', 'cho.hyunwoo@company.com', '연구개발팀', '대리', 'user', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), '최민수', 'choi.minsu@company.com', '인사팀', '대리', 'user', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), '최영희', 'choi.younghee@company.com', '구매팀', '대리', 'user', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), '한민수', 'han.minsu@company.com', '마케팅팀', '대리', 'user', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), '한소영', 'han.soyoung@company.com', '마케팅팀', '대리', 'user', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), '한지우', 'han.jiwoo@company.com', '영업팀', '대리', 'user', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), '홍길동', 'hong.gildong@company.com', '관리부', '대리', 'user', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), '홍길순', 'hong.gilsun@company.com', '생산부', '대리', 'user', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Update service_requests to map to the new users
UPDATE service_requests 
SET requester_id = u.id
FROM users u
WHERE service_requests.requester_name = u.name 
  AND service_requests.requester_department = u.department;

-- Show results
SELECT 
  sr.request_number,
  sr.requester_name,
  sr.requester_department,
  u.name as actual_user_name,
  u.department as actual_user_department,
  sr.requester_id
FROM service_requests sr
LEFT JOIN users u ON sr.requester_id = u.id
ORDER BY sr.request_number;
