-- service_requests 테이블의 status, current_status 컬럼을 stage로 통합하는 마이그레이션 스크립트

-- 1. 기존 데이터 백업 (선택사항)
-- CREATE TABLE service_requests_backup AS SELECT * FROM service_requests;

-- 2. stage_id 컬럼이 없으면 추가
ALTER TABLE service_requests 
ADD COLUMN IF NOT EXISTS stage_id INTEGER REFERENCES stages(id);

-- 3. 기존 stage 컬럼 값을 stage_id로 매핑
UPDATE service_requests 
SET stage_id = (
  SELECT s.id 
  FROM stages s 
  WHERE s.name = service_requests.stage 
  AND s.is_active = true
)
WHERE stage_id IS NULL;

-- 4. stage_id가 매핑되지 않은 레코드들을 기본값으로 설정
UPDATE service_requests 
SET stage_id = (SELECT id FROM stages WHERE name = '접수' AND is_active = true LIMIT 1)
WHERE stage_id IS NULL;

-- 5. stage_id 컬럼을 NOT NULL로 변경
ALTER TABLE service_requests 
ALTER COLUMN stage_id SET NOT NULL;

-- 6. 기존 status, current_status 컬럼 제거
ALTER TABLE service_requests DROP COLUMN IF EXISTS status;
ALTER TABLE service_requests DROP COLUMN IF EXISTS current_status;

-- 7. 기존 stage 컬럼 제거 (stage_id로 대체)
ALTER TABLE service_requests DROP COLUMN IF EXISTS stage;

-- 8. 인덱스 재생성
DROP INDEX IF EXISTS idx_service_requests_status;
DROP INDEX IF EXISTS idx_service_requests_stage;
CREATE INDEX IF NOT EXISTS idx_service_requests_stage_id ON service_requests(stage_id);

-- 9. 트리거 업데이트 (필요시)
-- 기존 트리거는 그대로 유지

-- 10. 마이그레이션 완료 확인
SELECT 
  'Migration completed' as status,
  COUNT(*) as total_records,
  COUNT(stage_id) as records_with_stage_id
FROM service_requests;
