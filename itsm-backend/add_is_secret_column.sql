-- general_inquiries 테이블에 is_secret 컬럼 추가
ALTER TABLE general_inquiries ADD COLUMN IF NOT EXISTS is_secret BOOLEAN DEFAULT FALSE;

-- 컬럼이 추가되었는지 확인
\d general_inquiries;
