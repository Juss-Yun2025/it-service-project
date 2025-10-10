-- Update default icon value in FAQs table
-- Change default icon from emoji to SVG path

-- Update the default value for icon column
ALTER TABLE faqs 
ALTER COLUMN icon SET DEFAULT '/faq_icon/question.svg';

-- Update existing FAQs with emoji icons to use SVG paths
UPDATE faqs 
SET icon = '/faq_icon/question.svg' 
WHERE icon = '❓' OR icon IS NULL;

-- Update other emoji icons to appropriate SVG paths
UPDATE faqs SET icon = '/faq_icon/solution.svg' WHERE icon = '💡';
UPDATE faqs SET icon = '/faq_icon/tool.svg' WHERE icon = '🔧';
UPDATE faqs SET icon = '/faq_icon/computer.svg' WHERE icon = '💻';
UPDATE faqs SET icon = '/faq_icon/email.svg' WHERE icon = '📧';
UPDATE faqs SET icon = '/faq_icon/network.svg' WHERE icon = '🌐';
UPDATE faqs SET icon = '/faq_icon/security.svg' WHERE icon = '🔒';
UPDATE faqs SET icon = '/faq_icon/mobile.svg' WHERE icon = '📱';
UPDATE faqs SET icon = '/faq_icon/monitor.svg' WHERE icon = '🖥️';
UPDATE faqs SET icon = '/faq_icon/settings.svg' WHERE icon = '⚙️';
UPDATE faqs SET icon = '/faq_icon/analytics.svg' WHERE icon = '📊';
UPDATE faqs SET icon = '/faq_icon/search.svg' WHERE icon = '🔍';
UPDATE faqs SET icon = '/faq_icon/storage.svg' WHERE icon = '💾';
UPDATE faqs SET icon = '/faq_icon/printer.svg' WHERE icon = '🖨️';
UPDATE faqs SET icon = '/faq_icon/phone.svg' WHERE icon = '📞';
UPDATE faqs SET icon = '/faq_icon/office.svg' WHERE icon = '🏢';