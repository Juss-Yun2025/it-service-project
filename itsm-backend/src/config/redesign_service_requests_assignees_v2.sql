-- service_requests 테이블 담당자 컬럼 재설계
-- 명칭: 배정담당자(assignee), 조치담당자(technician)

-- 1. 조치담당자 컬럼 추가 (technician 명칭 사용)
ALTER TABLE service_requests ADD COLUMN technician_id UUID;
ALTER TABLE service_requests ADD COLUMN technician_name VARCHAR(100);
ALTER TABLE service_requests ADD COLUMN technician_department VARCHAR(100);

-- 2. 기존 assignee 컬럼은 배정담당자로 사용 (이미 존재)
-- assignee_id, assignee_name, assignee_department는 배정담당자로 사용

-- 3. 외래키 제약조건 추가
ALTER TABLE service_requests ADD CONSTRAINT fk_service_requests_technician 
FOREIGN KEY (technician_id) REFERENCES users(id);

-- assignee_id 외래키 제약조건이 이미 있는지 확인 후 추가
-- (이미 존재할 수 있음)

-- 4. 인덱스 추가 (조회 성능 향상)
CREATE INDEX idx_service_requests_technician_id ON service_requests(technician_id);
-- assignee_id 인덱스는 이미 존재할 수 있음

-- 5. 결과 확인
SELECT 
  '신청자' as role_type,
  'requester_id, requester_name, requester_department' as columns
UNION ALL
SELECT 
  '배정담당자' as role_type,
  'assignee_id, assignee_name, assignee_department' as columns
UNION ALL
SELECT 
  '조치담당자' as role_type,
  'technician_id, technician_name, technician_department' as columns;
