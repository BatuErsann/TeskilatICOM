-- Add WWF GIGI Awards announcement
USE teskilat_db;

-- Insert the WWF-Türkiye GIGI Awards announcement
INSERT INTO announcements (title, short_description, full_content, link_url, link_text, is_active, display_order) VALUES
(
    'WWF-Türkiye - GIGI AWARDS 2025 Strateji Kategorisi Ezber Bozan Markalar Ödülü',
    'WWF-Türkiye için hazırladığımız "Ne Kutlama Ama..." kampanyamızla GIGI AWARDS 2025''te Strateji Kategorisi Ezber Bozan Markalar Ödülü''ne layık görüldük.',
    'WWF-Türkiye için hazırladığımız "Ne Kutlama Ama..." kampanyamızla GIGI AWARDS 2025''te Strateji Kategorisi Ezber Bozan Markalar Ödülü''ne layık görüldük. Kampanyamız, yılbaşı gibi özel bir dönemde alışılagelmiş kutlama mesajları yerine, ekolojik krizi ve doğanın karşı karşıya olduğu tehlikeleri öne çıkarıyor.',
    'https://www.linkedin.com/feed/update/urn:li:activity:7384248351292059648/',
    'View on LinkedIn',
    TRUE,
    1
);

-- Note: To add the award image, please upload it and update the image_url:
-- UPDATE announcements SET image_url = 'YOUR_IMAGE_URL' WHERE title LIKE '%GIGI AWARDS%';

SELECT 'WWF GIGI Awards announcement added successfully!' AS message;
