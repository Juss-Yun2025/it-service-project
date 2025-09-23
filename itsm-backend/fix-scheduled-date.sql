-- 예정조율일시 컬럼 타입을 DATE에서 TIMESTAMP WITH TIME ZONE으로 변경
-- 기존 데이터는 보존하면서 컬럼 타입만 변경

-- 1. 기존 scheduled_date 컬럼을 임시 컬럼으로 백업
ALTER TABLE service_requests ADD COLUMN scheduled_date_backup DATE;

-- 2. 기존 데이터를 백업 컬럼으로 복사
UPDATE service_requests SET scheduled_date_backup = scheduled_date;

-- 3. 기존 scheduled_date 컬럼 삭제
ALTER TABLE service_requests DROP COLUMN scheduled_date;

-- 4. 새로운 scheduled_date 컬럼을 TIMESTAMP WITH TIME ZONE으로 생성
ALTER TABLE service_requests ADD COLUMN scheduled_date TIMESTAMP WITH TIME ZONE;

-- 5. 백업된 데이터를 새로운 컬럼으로 복사 (날짜만 있는 경우 00:00:00으로 설정)
UPDATE service_requests 
SET scheduled_date = scheduled_date_backup::timestamp with time zone 
WHERE scheduled_date_backup IS NOT NULL;

-- 6. 백업 컬럼 삭제
ALTER TABLE service_requests DROP COLUMN scheduled_date_backup;

-- 7. work_start_date와 work_complete_date도 동일하게 처리 (이미 TIMESTAMP WITH TIME ZONE이지만 확인)
-- 이미 올바른 타입이므로 변경 불필요

-- 변경사항 확인
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'service_requests' 
AND column_name IN ('scheduled_date', 'work_start_date', 'work_complete_date');
