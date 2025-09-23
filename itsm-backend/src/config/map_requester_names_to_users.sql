-- service_requests 테이블의 requester_name을 users 테이블의 실제 사용자와 매핑
-- requester_id를 실제 사용자 ID로 업데이트

-- 1. 먼저 모든 requester_id를 NULL로 설정
UPDATE service_requests SET requester_id = NULL;

-- 2. 실제 사용자와 매핑 (이름이 일치하는 경우)
-- 김기술 (생산부) -> 김기술 (생산부)
UPDATE service_requests 
SET requester_id = '166aa672-c1e0-479b-9dfb-4bd46753a8b1'
WHERE requester_name = '김기술' AND requester_department = '생산부';

-- 김기술 (IT팀) -> 김기술 (IT팀)  
UPDATE service_requests 
SET requester_id = 'c7d30093-065a-433c-a0ed-92cc0f4630e9'
WHERE requester_name = '김기술' AND requester_department = 'IT팀';

-- 이영희 (생산부) -> 이영희 (생산부)
UPDATE service_requests 
SET requester_id = '4c538062-a7af-4505-9ca4-9c82133481e8'
WHERE requester_name = '이영희' AND requester_department = '생산부';

-- 이배정 (관리부) -> 이배정 (관리부)
UPDATE service_requests 
SET requester_id = 'c85854ff-8345-4f1c-accd-e3600550c34f'
WHERE requester_name = '이배정' AND requester_department = '관리부';

-- 박배정 (운영팀) -> 박배정 (운영팀)
UPDATE service_requests 
SET requester_id = '99a8da42-26f3-45af-9200-62d188f5cb4d'
WHERE requester_name = '박배정' AND requester_department = '운영팀';

-- 송기술 (운영팀) -> 송기술 (운영팀)
UPDATE service_requests 
SET requester_id = '47e8a432-39fb-4bc6-9c5e-79b367cc83ba'
WHERE requester_name = '송기술' AND requester_department = '운영팀';

-- 황매니저 (IT팀) -> 황매니저 (IT팀)
UPDATE service_requests 
SET requester_id = '7afb679a-72dd-4f23-bb14-73e12bc0d94b'
WHERE requester_name = '황매니저' AND requester_department = 'IT팀';

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
