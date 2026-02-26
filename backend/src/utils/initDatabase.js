const db = require('../config/db');

/**
 * Sunucuda otomatik olarak tüm gerekli tabloları oluşturur.
 * Backend başlatıldığında çalışır - tablolar zaten varsa tekrar oluşturmaz.
 */
async function initDatabase() {
  try {
    console.log('🔄 Veritabanı tabloları kontrol ediliyor...');

    // Users tablosu
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Site Settings tablosu
    await db.execute(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Videos tablosu
    await db.execute(`
      CREATE TABLE IF NOT EXISTS videos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255),
        video_url VARCHAR(500) NOT NULL,
        platform ENUM('youtube', 'instagram', 'vimeo', 'tiktok', 'other') DEFAULT 'youtube',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Works tablosu
    await db.execute(`
      CREATE TABLE IF NOT EXISTS works (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        media_type ENUM('image', 'video') DEFAULT 'image',
        media_url VARCHAR(500),
        video_platform ENUM('youtube', 'instagram', 'vimeo', 'tiktok', 'other') DEFAULT 'youtube',
        thumbnail_url VARCHAR(500),
        link_url VARCHAR(500),
        instagram_url VARCHAR(500),
        linkedin_url VARCHAR(500),
        youtube_url VARCHAR(500),
        tiktok_url VARCHAR(500),
        category VARCHAR(100),
        is_featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Works Layout tablosu
    await db.execute(`
      CREATE TABLE IF NOT EXISTS works_layout (
        id INT AUTO_INCREMENT PRIMARY KEY,
        layout_data JSON,
        layout_type ENUM('main', 'featured') DEFAULT 'main',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Announcements tablosu
    await db.execute(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        short_description TEXT,
        full_content TEXT,
        image_url VARCHAR(500),
        link_url VARCHAR(500),
        link_text VARCHAR(100) DEFAULT 'Read More',
        is_active BOOLEAN DEFAULT TRUE,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Team Members tablosu
    await db.execute(`
      CREATE TABLE IF NOT EXISTS team_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        surname VARCHAR(100),
        title VARCHAR(150),
        image_url VARCHAR(500),
        linkedin_url VARCHAR(500),
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Brands tablosu
    await db.execute(`
      CREATE TABLE IF NOT EXISTS brands (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        logo_url VARCHAR(500),
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Contact Messages tablosu
    await db.execute(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Services tablosu
    await db.execute(`
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Security Logs tablosu
    await db.execute(`
      CREATE TABLE IF NOT EXISTS security_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_event_type (event_type),
        INDEX idx_created_at (created_at)
      )
    `);

    // Site Contents tablosu
    await db.execute(`
      CREATE TABLE IF NOT EXISTS site_contents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        content_key VARCHAR(100) NOT NULL UNIQUE,
        content_value TEXT,
        page_name VARCHAR(50) DEFAULT 'general',
        section_name VARCHAR(50) DEFAULT 'general',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Default hero image ayarını ekle
    await db.execute(`
      INSERT IGNORE INTO site_settings (setting_key, setting_value) VALUES ('hero_image', '')
    `);

    // Password Reset Tokens tablosu
    await db.execute(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_token_hash (token_hash),
        INDEX idx_expires (expires_at),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 2FA sütunlarını ekle (yoksa)
    try {
      await db.execute(`ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255) DEFAULT NULL`);
      await db.execute(`ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE`);
    } catch (e) {
      // Sütunlar zaten varsa hata vermesini engelle
    }

    // tiktok_url sütununu ekle (mevcut production DB için migration)
    try {
      await db.execute(`ALTER TABLE works ADD COLUMN IF NOT EXISTS tiktok_url VARCHAR(500) DEFAULT NULL`);
    } catch (e) {
      // Sütun zaten varsa hata vermesini engelle
    }

    console.log('✅ Tüm veritabanı tabloları hazır!');
  } catch (error) {
    console.error('❌ Veritabanı tabloları oluşturulurken hata:', error.message);
    // Hata olsa bile uygulama çalışmaya devam etsin
  }
}

module.exports = { initDatabase };
