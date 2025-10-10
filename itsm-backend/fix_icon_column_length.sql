-- Fix icon column length issue
-- Increase varchar length to accommodate SVG file paths

-- Alter the icon column to allow longer paths
ALTER TABLE faqs 
ALTER COLUMN icon TYPE VARCHAR(100);

-- Update the default value to use SVG path
ALTER TABLE faqs 
ALTER COLUMN icon SET DEFAULT '/faq_icon/question.svg';

-- Update existing FAQs with emoji icons to use SVG paths
UPDATE faqs 
SET icon = '/faq_icon/question.svg' 
WHERE icon = '❓' OR icon IS NULL OR LENGTH(icon) <= 2;

-- Update other potential emoji icons to appropriate SVG paths (if any exist)
UPDATE faqs SET icon = '/faq_icon/solution.svg' WHERE icon LIKE '%💡%';
UPDATE faqs SET icon = '/faq_icon/tool.svg' WHERE icon LIKE '%🔧%';
UPDATE faqs SET icon = '/faq_icon/computer.svg' WHERE icon LIKE '%💻%';
UPDATE faqs SET icon = '/faq_icon/email.svg' WHERE icon LIKE '%📧%';
UPDATE faqs SET icon = '/faq_icon/network.svg' WHERE icon LIKE '%🌐%';
UPDATE faqs SET icon = '/faq_icon/security.svg' WHERE icon LIKE '%🔒%';
UPDATE faqs SET icon = '/faq_icon/mobile.svg' WHERE icon LIKE '%📱%';
UPDATE faqs SET icon = '/faq_icon/monitor.svg' WHERE icon LIKE '%🖥%';
UPDATE faqs SET icon = '/faq_icon/settings.svg' WHERE icon LIKE '%⚙%';
UPDATE faqs SET icon = '/faq_icon/analytics.svg' WHERE icon LIKE '%📊%';
UPDATE faqs SET icon = '/faq_icon/search.svg' WHERE icon LIKE '%🔍%';
UPDATE faqs SET icon = '/faq_icon/storage.svg' WHERE icon LIKE '%💾%';
UPDATE faqs SET icon = '/faq_icon/printer.svg' WHERE icon LIKE '%🖨%';
UPDATE faqs SET icon = '/faq_icon/phone.svg' WHERE icon LIKE '%📞%';
UPDATE faqs SET icon = '/faq_icon/office.svg' WHERE icon LIKE '%🏢%';

-- Add comment
COMMENT ON COLUMN faqs.icon IS 'SVG icon file path for FAQ (max 100 characters)';