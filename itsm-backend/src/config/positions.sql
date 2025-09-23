-- 직급 테이블 생성
CREATE TABLE positions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 기본 직급 데이터 삽입
INSERT INTO positions (name, description, sort_order) VALUES
('부장', '부장급', 1),
('과장', '과장급', 2),
('차장', '차장급', 3),
('대리', '대리급', 4),
('사원', '사원급', 5),
('촉탁', '촉탁직', 6)
ON CONFLICT (name) DO NOTHING;

-- users 테이블의 position 컬럼을 positions 테이블의 id로 참조하도록 변경
-- 먼저 position_id 컬럼 추가
ALTER TABLE users ADD COLUMN position_id INTEGER REFERENCES positions(id);

-- 기존 position 데이터를 position_id로 변환
UPDATE users SET position_id = (
    SELECT id FROM positions WHERE name = users.position
);

-- position 컬럼 제거 (선택사항 - 기존 데이터 보존을 위해 주석 처리)
-- ALTER TABLE users DROP COLUMN position;
