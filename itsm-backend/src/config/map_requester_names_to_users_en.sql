-- Map service_requests requester_name to actual users table IDs
-- Update requester_id with actual user IDs based on name matching

-- 1. First, set all requester_id to NULL temporarily
ALTER TABLE service_requests ALTER COLUMN requester_id DROP NOT NULL;
UPDATE service_requests SET requester_id = NULL;

-- 2. Map to actual users where names match
-- Kim Gisul (Production) -> Kim Gisul (Production)
UPDATE service_requests 
SET requester_id = '166aa672-c1e0-479b-9dfb-4bd46753a8b1'
WHERE requester_name = '김기술' AND requester_department = '생산부';

-- Kim Gisul (IT Team) -> Kim Gisul (IT Team)  
UPDATE service_requests 
SET requester_id = 'c7d30093-065a-433c-a0ed-92cc0f4630e9'
WHERE requester_name = '김기술' AND requester_department = 'IT팀';

-- Lee Younghee (Production) -> Lee Younghee (Production)
UPDATE service_requests 
SET requester_id = '4c538062-a7af-4505-9ca4-9c82133481e8'
WHERE requester_name = '이영희' AND requester_department = '생산부';

-- Lee Baejeong (Management) -> Lee Baejeong (Management)
UPDATE service_requests 
SET requester_id = 'c85854ff-8345-4f1c-accd-e3600550c34f'
WHERE requester_name = '이배정' AND requester_department = '관리부';

-- Park Baejeong (Operations) -> Park Baejeong (Operations)
UPDATE service_requests 
SET requester_id = '99a8da42-26f3-45af-9200-62d188f5cb4d'
WHERE requester_name = '박배정' AND requester_department = '운영팀';

-- Song Gisul (Operations) -> Song Gisul (Operations)
UPDATE service_requests 
SET requester_id = '47e8a432-39fb-4bc6-9c5e-79b367cc83ba'
WHERE requester_name = '송기술' AND requester_department = '운영팀';

-- Hwang Manager (IT Team) -> Hwang Manager (IT Team)
UPDATE service_requests 
SET requester_id = '7afb679a-72dd-4f23-bb14-73e12bc0d94b'
WHERE requester_name = '황매니저' AND requester_department = 'IT팀';

-- 3. Assign remaining requests to default user (Yutest)
UPDATE service_requests 
SET requester_id = 'a2b976c4-3bda-4473-9c20-a9c507a65e4a'
WHERE requester_id IS NULL;

-- 4. Set requester_id as NOT NULL
ALTER TABLE service_requests ALTER COLUMN requester_id SET NOT NULL;

-- 5. Show results
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
