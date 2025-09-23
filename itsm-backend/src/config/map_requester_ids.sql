-- service_requests 테이블의 requester_id를 실제 사용자 ID로 매핑
-- requester_name과 requester_department를 기반으로 매핑

-- 1. 먼저 모든 requester_id를 NULL로 설정
UPDATE service_requests SET requester_id = NULL;

-- 2. 실제 사용자와 매핑 (이름과 부서가 일치하는 경우)
UPDATE service_requests 
SET requester_id = u.id
FROM users u
WHERE service_requests.requester_name = u.name 
  AND service_requests.requester_department = u.department;

-- 3. 매핑되지 않은 경우를 위한 기본 사용자 할당
-- (매핑되지 않은 요청들을 '유테스' 사용자에게 할당)
UPDATE service_requests 
SET requester_id = 'a2b976c4-3bda-4473-9c20-a9c507a65e4a'
WHERE requester_id IS NULL;

-- 4. requester_id를 NOT NULL로 설정
ALTER TABLE service_requests ALTER COLUMN requester_id SET NOT NULL;

-- 5. 결과 확인
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
