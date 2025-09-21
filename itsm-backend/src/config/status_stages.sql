-- 현재상태 테이블 생성
CREATE TABLE IF NOT EXISTS current_statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 단계 테이블 생성
CREATE TABLE IF NOT EXISTS stages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 단계-진행 매칭 테이블 생성
CREATE TABLE IF NOT EXISTS stage_progress_mapping (
    id SERIAL PRIMARY KEY,
    stage_id INTEGER REFERENCES stages(id),
    progress_name VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 현재상태 데이터 삽입
INSERT INTO current_statuses (name, description, color) VALUES
('정상작동', '시스템이 정상적으로 작동하는 상태', 'green'),
('오류발생', '시스템에 오류가 발생한 상태', 'red'),
('메시지창', '메시지창 관련 문제가 있는 상태', 'blue'),
('부분불능', '일부 기능이 작동하지 않는 상태', 'yellow'),
('전체불능', '시스템 전체가 작동하지 않는 상태', 'red'),
('점검요청', '시스템 점검을 요청한 상태', 'purple'),
('기타상태', '기타 상태', 'gray');

-- 단계 데이터 삽입
INSERT INTO stages (name, description, color) VALUES
('접수', '서비스 요청이 접수된 단계', 'blue'),
('배정', '담당자가 배정된 단계', 'green'),
('재배정', '담당자가 재배정된 단계', 'orange'),
('확인', '요청사항을 확인한 단계', 'purple'),
('예정', '작업 일정이 예정된 단계', 'indigo'),
('작업', '실제 작업이 진행 중인 단계', 'yellow'),
('완료', '작업이 완료된 단계', 'green'),
('미결', '미결 처리된 단계', 'red');

-- 단계-진행 매칭 데이터 삽입
INSERT INTO stage_progress_mapping (stage_id, progress_name, description) VALUES
((SELECT id FROM stages WHERE name = '접수'), '정상접수', '서비스 요청이 정상적으로 접수됨'),
((SELECT id FROM stages WHERE name = '배정'), '담당배정', '담당자가 배정됨'),
((SELECT id FROM stages WHERE name = '재배정'), '담당배정', '담당자가 재배정됨'),
((SELECT id FROM stages WHERE name = '확인'), '담당배정', '요청사항을 확인함'),
((SELECT id FROM stages WHERE name = '예정'), '시간조율', '작업 일정이 조율됨'),
((SELECT id FROM stages WHERE name = '작업'), '작업진행', '실제 작업이 진행 중'),
((SELECT id FROM stages WHERE name = '완료'), '처리완료', '작업이 완료됨'),
((SELECT id FROM stages WHERE name = '미결'), '미결처리', '미결로 처리됨');

-- service_requests 테이블에 외래키 컬럼 추가
ALTER TABLE service_requests 
ADD COLUMN IF NOT EXISTS current_status_id INTEGER REFERENCES current_statuses(id),
ADD COLUMN IF NOT EXISTS stage_id INTEGER REFERENCES stages(id);

-- 기존 데이터를 새로운 외래키로 업데이트
UPDATE service_requests 
SET current_status_id = (SELECT id FROM current_statuses WHERE name = current_status),
    stage_id = (SELECT id FROM stages WHERE name = stage);

-- 기존 컬럼들을 제거하고 새로운 외래키만 사용하도록 변경
-- (실제 운영에서는 데이터 백업 후 진행해야 함)
-- ALTER TABLE service_requests DROP COLUMN current_status;
-- ALTER TABLE service_requests DROP COLUMN stage;

-- 업데이트 트리거 함수 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_current_statuses_updated_at BEFORE UPDATE ON current_statuses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stages_updated_at BEFORE UPDATE ON stages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stage_progress_mapping_updated_at BEFORE UPDATE ON stage_progress_mapping FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
