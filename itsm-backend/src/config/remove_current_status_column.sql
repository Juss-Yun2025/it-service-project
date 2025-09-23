-- service_requests 테이블에서 current_status 컬럼을 제거하고 current_statuses 테이블 참조로 변경

-- 1. current_status 컬럼 제거
ALTER TABLE service_requests DROP COLUMN IF EXISTS current_status;

-- 2. current_status_id 컬럼을 NOT NULL로 설정 (기본값 설정)
UPDATE service_requests 
SET current_status_id = 1 
WHERE current_status_id IS NULL;

ALTER TABLE service_requests 
ALTER COLUMN current_status_id SET NOT NULL;

-- 3. current_status 관련 인덱스 제거 (있다면)
DROP INDEX IF EXISTS idx_service_requests_current_status;

-- 4. current_status_id 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_service_requests_current_status_id ON service_requests(current_status_id);

-- 5. 변경 완료 확인
SELECT 
  'Current status column removed' as status,
  COUNT(*) as total_records,
  COUNT(CASE WHEN current_status_id IS NOT NULL THEN 1 END) as records_with_current_status_id,
  COUNT(CASE WHEN stage IS NOT NULL THEN 1 END) as records_with_stage
FROM service_requests;

-- 6. current_statuses 테이블과 JOIN하여 데이터 확인
SELECT 
  sr.id,
  sr.request_number,
  sr.title,
  cs.name as current_status_name,
  cs.color as current_status_color,
  sr.stage
FROM service_requests sr
LEFT JOIN current_statuses cs ON sr.current_status_id = cs.id
LIMIT 5;
