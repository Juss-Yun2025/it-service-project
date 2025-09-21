-- Department management table creation
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default department data
INSERT INTO departments (name, description) VALUES
('IT팀', 'Information Technology Team'),
('운영팀', 'System Operations Team'),
('개발팀', 'Software Development Team'),
('관리부', 'Administrative Management Department'),
('생산부', 'Production Department'),
('구매팀', 'Procurement Team'),
('재무팀', 'Finance Team'),
('영업팀', 'Sales and Marketing Team'),
('마케팅팀', 'Marketing and PR Team'),
('인사팀', 'Human Resources Team'),
('보안팀', 'Information Security Team'),
('법무팀', 'Legal Affairs Team'),
('연구개발팀', 'Research and Development Team')
ON CONFLICT (name) DO NOTHING;

-- Trigger function to update user department when department name changes
CREATE OR REPLACE FUNCTION update_user_department_on_department_change()
RETURNS TRIGGER AS $$
BEGIN
    -- When department name is changed
    IF OLD.name != NEW.name THEN
        UPDATE users 
        SET department = NEW.name 
        WHERE department = OLD.name;
    END IF;
    
    -- When department is deactivated
    IF OLD.is_active = true AND NEW.is_active = false THEN
        -- Set users' department to default or NULL
        UPDATE users 
        SET department = 'IT팀' 
        WHERE department = NEW.name;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_user_department ON departments;
CREATE TRIGGER trigger_update_user_department
    AFTER UPDATE ON departments
    FOR EACH ROW
    EXECUTE FUNCTION update_user_department_on_department_change();
