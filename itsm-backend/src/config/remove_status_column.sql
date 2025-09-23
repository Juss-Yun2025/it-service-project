-- service_requests 테이블에서 status 컬럼만 제거하는 스크립트

-- 1. status 컬럼 제거
ALTER TABLE service_requests DROP COLUMN IF EXISTS status;

-- 2. status 관련 인덱스 제거
DROP INDEX IF EXISTS idx_service_requests_status;

-- 3. 제거 완료 확인
SELECT 
  'Status column removed' as status,
  COUNT(*) as total_records,
  COUNT(CASE WHEN current_status IS NOT NULL THEN 1 END) as records_with_current_status,
  COUNT(CASE WHEN stage IS NOT NULL THEN 1 END) as records_with_stage
FROM service_requests;
