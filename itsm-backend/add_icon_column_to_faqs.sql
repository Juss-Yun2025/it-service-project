-- Add icon column to FAQs table
-- This script adds an icon column to store emoji icons for FAQs

ALTER TABLE faqs 
ADD COLUMN icon VARCHAR(10) DEFAULT '❓';

-- Update existing FAQs with default icon if they don't have one
UPDATE faqs 
SET icon = '❓' 
WHERE icon IS NULL;

-- Add comment to the column
COMMENT ON COLUMN faqs.icon IS 'Emoji icon for the FAQ entry';