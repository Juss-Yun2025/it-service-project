-- Revert service_requests table to original status, current_status, stage columns

-- 1. Add status column
ALTER TABLE service_requests 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'pending';

-- 2. Add current_status column
ALTER TABLE service_requests 
ADD COLUMN IF NOT EXISTS current_status VARCHAR(50) NOT NULL DEFAULT 'normal';

-- 3. Add stage column (instead of stage_id)
ALTER TABLE service_requests 
ADD COLUMN IF NOT EXISTS stage VARCHAR(50) NOT NULL DEFAULT 'received';

-- 4. Restore values based on stage_id
UPDATE service_requests 
SET 
  stage = COALESCE(s.name, 'received'),
  status = CASE 
    WHEN s.name = 'received' THEN 'pending'
    WHEN s.name = 'assigned' THEN 'assigned'
    WHEN s.name = 'reassigned' THEN 'assigned'
    WHEN s.name = 'confirmed' THEN 'in_progress'
    WHEN s.name = 'scheduled' THEN 'in_progress'
    WHEN s.name = 'working' THEN 'in_progress'
    WHEN s.name = 'completed' THEN 'completed'
    WHEN s.name = 'pending' THEN 'cancelled'
    ELSE 'pending'
  END,
  current_status = COALESCE(s.progress_name, 'normal')
FROM stages s 
WHERE service_requests.stage_id = s.id;

-- 5. Remove stage_id column
ALTER TABLE service_requests DROP COLUMN IF EXISTS stage_id;

-- 6. Recreate indexes
DROP INDEX IF EXISTS idx_service_requests_stage_id;
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_stage ON service_requests(stage);

-- 7. Verify revert completion
SELECT 
  'Revert completed' as status,
  COUNT(*) as total_records,
  COUNT(CASE WHEN status IS NOT NULL THEN 1 END) as records_with_status,
  COUNT(CASE WHEN current_status IS NOT NULL THEN 1 END) as records_with_current_status,
  COUNT(CASE WHEN stage IS NOT NULL THEN 1 END) as records_with_stage
FROM service_requests;
