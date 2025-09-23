-- 서비스 유형 관리를 위한 service_types 테이블 생성

-- 1. service_types 테이블 생성
CREATE TABLE IF NOT EXISTS service_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(20) DEFAULT 'blue',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. 기본 서비스 유형 데이터 입력
INSERT INTO service_types (name, description, color, sort_order) VALUES
('요청', '일반적인 서비스 요청', 'blue', 1),
('장애', '시스템 장애 및 오류 관련', 'red', 2),
('변경', '시스템 변경 및 업데이트', 'orange', 3),
('문제', '문제 해결 및 분석', 'yellow', 4),
('적용', '패치 및 업데이트 적용', 'green', 5),
('구성', '시스템 구성 및 설정', 'purple', 6),
('자산', 'IT 자산 관리 관련', 'gray', 7)
ON CONFLICT (name) DO NOTHING;

-- 3. service_requests 테이블에 service_type_id 컬럼 추가
ALTER TABLE service_requests 
ADD COLUMN IF NOT EXISTS service_type_id INTEGER;

-- 4. 기존 service_type 값을 service_type_id로 매핑
UPDATE service_requests 
SET service_type_id = st.id
FROM service_types st
WHERE service_requests.service_type = st.name;

-- 5. service_type_id를 NOT NULL로 설정
ALTER TABLE service_requests 
ALTER COLUMN service_type_id SET NOT NULL;

-- 6. 외래키 제약조건 추가
ALTER TABLE service_requests 
ADD CONSTRAINT fk_service_requests_service_type 
FOREIGN KEY (service_type_id) REFERENCES service_types(id);

-- 7. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_service_requests_service_type_id ON service_requests(service_type_id);

-- 8. 기존 service_type 컬럼 제거 (선택사항 - 나중에 제거)
-- ALTER TABLE service_requests DROP COLUMN IF EXISTS service_type;

-- 9. 확인
SELECT 
    'Service types created' as status,
    COUNT(*) as total_service_types,
    (SELECT COUNT(*) FROM service_requests WHERE service_type_id IS NOT NULL) as mapped_requests
FROM service_types;

-- 10. 서비스 유형별 요청 수 확인
SELECT 
    st.name as service_type_name,
    st.color,
    COUNT(sr.id) as request_count
FROM service_types st
LEFT JOIN service_requests sr ON st.id = sr.service_type_id
GROUP BY st.id, st.name, st.color
ORDER BY st.sort_order;
