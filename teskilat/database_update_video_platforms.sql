-- Migration: Add video platform support for multiple platforms (YouTube, Instagram, Vimeo, TikTok)
-- Date: 2026-01-19

USE teskilat_db;

-- Update videos table to support multiple platforms
ALTER TABLE videos 
  CHANGE COLUMN youtube_url video_url VARCHAR(500) NOT NULL,
  ADD COLUMN platform ENUM('youtube', 'instagram', 'vimeo', 'tiktok', 'other') DEFAULT 'youtube' AFTER video_url;

-- Update works table to add video_platform column
ALTER TABLE works 
  ADD COLUMN video_platform ENUM('youtube', 'instagram', 'vimeo', 'tiktok', 'other') DEFAULT 'youtube' AFTER media_url;

-- Update existing records to set default platform based on media_type
UPDATE works 
SET video_platform = 'youtube' 
WHERE media_type = 'video' AND video_platform IS NULL;

UPDATE videos 
SET platform = 'youtube' 
WHERE platform IS NULL;

-- Migration complete
SELECT 'Video platforms migration completed successfully!' AS status;
