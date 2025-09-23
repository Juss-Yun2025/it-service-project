-- service_requests 테이블의 status, current_status 컬럼을 복구하는 스크립트

-- 1. status 컬럼 추가
ALTER TABLE service_requests 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT '신청';

-- 2. current_status 컬럼 추가
ALTER TABLE service_requests 
ADD COLUMN IF NOT EXISTS current_status VARCHAR(50) NOT NULL DEFAULT '신청';

-- 3. stage 컬럼 추가 (stage_id 대신)
ALTER TABLE service_requests 
ADD COLUMN IF NOT EXISTS stage VARCHAR(50) NOT NULL DEFAULT '신청';

-- 4. stage_id를 기반으로 stage, status, current_status 값 복구
UPDATE service_requests 
SET 
  stage = COALESCE(s.name, '신청'),
  status = CASE 
    WHEN s.name = '접수' THEN 'pending'
    WHEN s.name = '배정' THEN 'assigned'
    WHEN s.name = '재배정' THEN 'assigned'
    WHEN s.name = '확인' THEN 'in_progress'
    WHEN s.name = '예정' THEN 'in_progress'
    WHEN s.name = '작업' THEN 'in_progress'
    WHEN s.name = '완료' THEN 'completed'
    WHEN s.name = '미결' THEN 'cancelled'
    ELSE 'pending'
  END,
  current_status = COALESCE(s.progress_name, '정상접수')
FROM stages s 
WHERE service_requests.stage_id = s.id;

-- 5. stage_id 컬럼 제거
ALTER TABLE service_requests DROP COLUMN IF EXISTS stage_id;

-- 6. 인덱스 재생성
DROP INDEX IF EXISTS idx_service_requests_stage_id;
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_stage ON service_requests(stage);

-- 7. 복구 완료 확인
SELECT 
  'Revert completed' as status,
  COUNT(*) as total_records,
  COUNT(CASE WHEN status IS NOT NULL THEN 1 END) as records_with_status,
  COUNT(CASE WHEN current_status IS NOT NULL THEN 1 END) as records_with_current_status,
  COUNT(CASE WHEN stage IS NOT NULL THEN 1 END) as records_with_stage
FROM service_requests;
