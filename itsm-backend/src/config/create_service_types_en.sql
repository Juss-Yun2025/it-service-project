-- Create service_types table for service type management

-- 1. Create service_types table
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

-- 2. Insert default service type data
INSERT INTO service_types (name, description, color, sort_order) VALUES
('request', 'General service request', 'blue', 1),
('incident', 'System incident and error related', 'red', 2),
('change', 'System change and update', 'orange', 3),
('problem', 'Problem resolution and analysis', 'yellow', 4),
('deployment', 'Patch and update deployment', 'green', 5),
('configuration', 'System configuration and setup', 'purple', 6),
('asset', 'IT asset management related', 'gray', 7)
ON CONFLICT (name) DO NOTHING;

-- 3. Add service_type_id column to service_requests table
ALTER TABLE service_requests 
ADD COLUMN IF NOT EXISTS service_type_id INTEGER;

-- 4. Map existing service_type values to service_type_id
UPDATE service_requests 
SET service_type_id = st.id
FROM service_types st
WHERE service_requests.service_type = 'general' AND st.name = 'request';

-- 5. Set default service_type_id for remaining records
UPDATE service_requests 
SET service_type_id = (SELECT id FROM service_types WHERE name = 'request' LIMIT 1)
WHERE service_type_id IS NULL;

-- 6. Set service_type_id as NOT NULL
ALTER TABLE service_requests 
ALTER COLUMN service_type_id SET NOT NULL;

-- 7. Add foreign key constraint
ALTER TABLE service_requests 
ADD CONSTRAINT fk_service_requests_service_type 
FOREIGN KEY (service_type_id) REFERENCES service_types(id);

-- 8. Create index
CREATE INDEX IF NOT EXISTS idx_service_requests_service_type_id ON service_requests(service_type_id);

-- 9. Verification
SELECT 
    'Service types created' as status,
    COUNT(*) as total_service_types,
    (SELECT COUNT(*) FROM service_requests WHERE service_type_id IS NOT NULL) as mapped_requests
FROM service_types;

-- 10. Check service type distribution
SELECT 
    st.name as service_type_name,
    st.color,
    COUNT(sr.id) as request_count
FROM service_types st
LEFT JOIN service_requests sr ON st.id = sr.service_type_id
GROUP BY st.id, st.name, st.color
ORDER BY st.sort_order;
