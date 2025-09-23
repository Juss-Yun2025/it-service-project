-- service_requests 테이블 담당자 컬럼 재설계
-- requester와 동일한 패턴으로 배정담당자, 조치담당자 설계

-- 1. 배정담당자 컬럼 추가
ALTER TABLE service_requests ADD COLUMN assignment_manager_id UUID;
ALTER TABLE service_requests ADD COLUMN assignment_manager_name VARCHAR(100);
ALTER TABLE service_requests ADD COLUMN assignment_manager_department VARCHAR(100);

-- 2. 조치담당자 컬럼 수정 (기존 assignee_name, assignee_department는 이미 존재)
-- assignee_id는 이미 존재하므로 추가 작업 불필요

-- 3. 외래키 제약조건 추가
ALTER TABLE service_requests ADD CONSTRAINT fk_service_requests_assignment_manager 
FOREIGN KEY (assignment_manager_id) REFERENCES users(id);

-- assignee_id 외래키 제약조건이 이미 있는지 확인 후 추가
-- (이미 존재할 수 있음)

-- 4. 인덱스 추가 (조회 성능 향상)
CREATE INDEX idx_service_requests_assignment_manager_id ON service_requests(assignment_manager_id);
CREATE INDEX idx_service_requests_assignee_id ON service_requests(assignee_id);

-- 5. 결과 확인
SELECT 
  '신청자' as role_type,
  'requester_id, requester_name, requester_department' as columns
UNION ALL
SELECT 
  '배정담당자' as role_type,
  'assignment_manager_id, assignment_manager_name, assignment_manager_department' as columns
UNION ALL
SELECT 
  '조치담당자' as role_type,
  'assignee_id, assignee_name, assignee_department' as columns;
