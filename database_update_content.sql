-- Comprehensive Database Update Script for Teşkilat Website
-- This script updates services and adds the WWF GIGI Awards announcement

USE teskilat_db;

-- ==============================================
-- 1. SERVICES UPDATE
-- ==============================================

-- Ensure display_order column exists (ignore error if already exists)
-- First check if column exists, if not add it
SET @dbname = DATABASE();
SET @tablename = 'services';
SET @columnname = 'display_order';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname
   AND TABLE_NAME = @tablename
   AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  'ALTER TABLE services ADD COLUMN display_order INT DEFAULT 0'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Clear existing services
TRUNCATE TABLE services;

-- Insert updated services (12 services total)
INSERT INTO services (title, description, icon, display_order) VALUES
('Communication Strategy', 'We build clear, future-proof communication strategies that align business goals with brand voice.', 'FaBullhorn', 1),
('Research & Insight', 'We turn data, culture, and human behavior into actionable insights that guide smarter decisions.', 'FaChartLine', 2),
('Brand Development', 'From positioning to tone of voice, we shape brands that are relevant, distinctive, and built to last.', 'FaPalette', 3),
('Digital Marketing', 'We design, build, and manage digital platforms — from websites and apps to performance-driven marketing strategies that deliver measurable growth.', 'FaMobileAlt', 4),
('Social Media', 'We manage social media as a living brand space — strategic, consistent, and culturally aware.', 'FaUsers', 5),
('Integrated Campaigns', 'We design campaigns that move seamlessly across channels, creating one strong, unified story.', 'FaBullhorn', 6),
('Design & Creative', 'We create visual and conceptual systems that elevate brands with clarity and aesthetic intelligence.', 'FaPalette', 7),
('Production', 'From film to photography, we handle production with a focus on quality, efficiency, and craft.', 'FaFilm', 8),
('Media Consultancy', 'We provide strategic guidance to help brands choose the right channels, formats, and moments.', 'FaChartLine', 9),
('Branded Spaces', 'We design physical brand experiences that translate identity into meaningful spatial storytelling.', 'FaPalette', 10),
('Celebrity Management', 'We manage talent partnerships strategically, ensuring authenticity, alignment, and long-term value.', 'FaUsers', 11),
('Influencer Marketing', 'We create influencer collaborations that feel natural, credible, and strategically effective.', 'FaUsers', 12);

-- ==============================================
-- 2. ANNOUNCEMENTS UPDATE
-- ==============================================

-- Insert the WWF-Türkiye GIGI Awards announcement
INSERT INTO announcements (title, short_description, full_content, image_url, link_url, link_text, is_active, display_order) VALUES
(
    'WWF-Türkiye - GIGI AWARDS 2025 Strateji Kategorisi Ezber Bozan Markalar Ödülü',
    'WWF-Türkiye için hazırladığımız "Ne Kutlama Ama..." kampanyamızla GIGI AWARDS 2025''te Strateji Kategorisi Ezber Bozan Markalar Ödülü''ne layık görüldük.',
    'WWF-Türkiye için hazırladığımız "Ne Kutlama Ama..." kampanyamızla GIGI AWARDS 2025''te Strateji Kategorisi Ezber Bozan Markalar Ödülü''ne layık görüldük. Kampanyamız, yılbaşı gibi özel bir dönemde alışılagelmiş kutlama mesajları yerine, ekolojik krizi ve doğanın karşı karşıya olduğu tehlikeleri öne çıkarıyor.',
    '',
    'https://www.linkedin.com/feed/update/urn:li:activity:7384248351292059648/',
    'View on LinkedIn',
    TRUE,
    1
);

-- ==============================================
-- COMPLETION MESSAGE
-- ==============================================

SELECT 'Database updated successfully!' AS status,
       '✓ Services updated (12 services)' AS services_status,
       '✓ WWF GIGI Awards announcement added' AS announcement_status;

-- ==============================================
-- NOTES
-- ==============================================
-- 1. To add the award image for the announcement, upload the image and then run:
--    UPDATE announcements SET image_url = 'YOUR_IMAGE_URL' WHERE title LIKE '%GIGI AWARDS%';
--
-- 2. The frontend pages have been updated with new content:
--    - About page: Updated company history (2007, 2015 ICOM, 2023 MKNDRS)
--    - Services: Now displays all 12 services from the database
--    - ICOM Network page: Content remains current
--    - Contact page: Google Maps link updated
--    - Announcements: WWF award will appear on home page and announcements page
