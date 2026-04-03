// services/backupService.js
// Otomatik veritabanı ve dosya yedekleme servisi
// Backend başlatıldığında otomatik olarak çalışır.
// Manuel tetikleme endpoint'i YOKTUR (güvenlik gereği).

const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const db = require('../config/db');

// Ayarlar
const BACKUP_ROOT = process.env.BACKUP_DIR || path.join(__dirname, '../../backups');
const UPLOADS_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
const MAX_BACKUPS = 3; // Son 3 yedeği tut
const BACKUP_CRON = process.env.BACKUP_CRON || '0 3 * * 0'; // Her Pazar gece 03:00

/**
 * Tüm tabloları SQL formatında yedekler (mysqldump gerektirmez)
 */
async function dumpDatabase(backupDir) {
  console.log('   📂 Veritabanı tabloları okunuyor...');
  
  const [tables] = await db.query('SHOW TABLES');
  const dbName = process.env.DB_NAME || 'teskilat_db';
  const tableKey = `Tables_in_${dbName}`;
  
  let sqlContent = '';
  sqlContent += `-- Teskilat ICOM Database Backup\n`;
  sqlContent += `-- Tarih: ${new Date().toISOString()}\n`;
  sqlContent += `-- Veritabanı: ${dbName}\n`;
  sqlContent += `-- ==========================================\n\n`;
  sqlContent += `SET FOREIGN_KEY_CHECKS = 0;\n`;
  sqlContent += `SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";\n\n`;

  for (const tableRow of tables) {
    const tableName = tableRow[tableKey];
    console.log(`   📋 Tablo: ${tableName}`);
    
    // CREATE TABLE ifadesini al
    const [createResult] = await db.query(`SHOW CREATE TABLE \`${tableName}\``);
    const createStatement = createResult[0]['Create Table'];
    
    sqlContent += `-- -------------------------------------------\n`;
    sqlContent += `-- Tablo: ${tableName}\n`;
    sqlContent += `-- -------------------------------------------\n`;
    sqlContent += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
    sqlContent += `${createStatement};\n\n`;
    
    // Tablo verilerini al
    const [rows] = await db.query(`SELECT * FROM \`${tableName}\``);
    
    if (rows.length > 0) {
      const columns = Object.keys(rows[0]);
      const columnList = columns.map(c => `\`${c}\``).join(', ');
      
      // Batch insert (her 100 satırda bir)
      for (let i = 0; i < rows.length; i += 100) {
        const batch = rows.slice(i, i + 100);
        const values = batch.map(row => {
          const vals = columns.map(col => {
            const val = row[col];
            if (val === null) return 'NULL';
            if (typeof val === 'number') return val;
            if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
            return `'${String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r')}'`;
          });
          return `(${vals.join(', ')})`;
        });
        
        sqlContent += `INSERT INTO \`${tableName}\` (${columnList}) VALUES\n${values.join(',\n')};\n\n`;
      }
    }
  }
  
  sqlContent += `SET FOREIGN_KEY_CHECKS = 1;\n`;
  
  const sqlFile = path.join(backupDir, 'database_backup.sql');
  fs.writeFileSync(sqlFile, sqlContent, 'utf8');
  
  const sizeMB = (Buffer.byteLength(sqlContent, 'utf8') / (1024 * 1024)).toFixed(2);
  console.log(`   ✅ Veritabanı yedeklendi. (${tables.length} tablo, ${sizeMB} MB)`);
}

/**
 * Uploads klasörünü yedekler
 */
function backupUploads(backupDir) {
  const uploadsBackup = path.join(backupDir, 'uploads');
  
  if (!fs.existsSync(UPLOADS_DIR)) {
    console.log('   ℹ️  Uploads klasörü bulunamadı, atlanıyor.');
    return;
  }
  
  copyDirSync(UPLOADS_DIR, uploadsBackup);
  
  const fileCount = countFiles(uploadsBackup);
  console.log(`   ✅ Upload dosyaları yedeklendi. (${fileCount} dosya)`);
}

/**
 * Klasörü recursive olarak kopyalar
 */
function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Klasördeki dosya sayısını sayar
 */
function countFiles(dir) {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      count += countFiles(path.join(dir, entry.name));
    } else {
      count++;
    }
  }
  return count;
}

/**
 * Son 3 yedeği tut, gerisini sil (en eskiden başlayarak)
 */
function cleanOldBackups() {
  if (!fs.existsSync(BACKUP_ROOT)) return;
  
  // Tüm yedek klasörlerini tarih sırasına göre al
  const entries = fs.readdirSync(BACKUP_ROOT, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => ({
      name: e.name,
      path: path.join(BACKUP_ROOT, e.name),
      time: fs.statSync(path.join(BACKUP_ROOT, e.name)).mtimeMs
    }))
    .sort((a, b) => b.time - a.time); // En yeniden en eskiye

  if (entries.length <= MAX_BACKUPS) {
    console.log(`   ℹ️  ${entries.length} yedek var, temizleme gerekmiyor. (Limit: ${MAX_BACKUPS})`);
    return;
  }

  // İlk 3'ü (en yeni) koru, kalanları sil
  const toDelete = entries.slice(MAX_BACKUPS);
  
  for (const backup of toDelete) {
    fs.rmSync(backup.path, { recursive: true, force: true });
    console.log(`   🗑️  Silindi: ${backup.name}`);
  }
  
  console.log(`   ✅ ${toDelete.length} eski yedek silindi. (${MAX_BACKUPS} yedek korundu)`);
}

/**
 * Ana yedekleme fonksiyonu (sadece dahili kullanım)
 */
async function _runBackup() {
  const dateStr = new Date().toISOString().replace(/[T:]/g, '-').slice(0, 19);
  const backupDir = path.join(BACKUP_ROOT, dateStr);
  
  console.log('');
  console.log('🛡️ =============================================');
  console.log('   OTOMATİK YEDEKLEME BAŞLATILDI');
  console.log(`   Zaman: ${new Date().toLocaleString('tr-TR')}`);
  console.log(`   Hedef: ${backupDir}`);
  console.log('==============================================');
  
  try {
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // 1. Veritabanı yedeği
    console.log('');
    console.log('1️⃣  Veritabanı yedekleniyor...');
    await dumpDatabase(backupDir);
    
    // 2. Uploads yedeği
    console.log('');
    console.log('2️⃣  Upload dosyaları yedekleniyor...');
    backupUploads(backupDir);
    
    // 3. Eski yedekleri temizle
    console.log('');
    console.log('3️⃣  Eski yedekler temizleniyor...');
    cleanOldBackups();
    
    console.log('');
    console.log('🔒 YEDEKLEME TAMAMLANDI!');
    console.log(`   Konum: ${backupDir}`);
    console.log('');
    
  } catch (error) {
    console.error('❌ Yedekleme hatası:', error.message);
  }
}

/**
 * Cron job'u başlat — dışarıdan sadece bu çağrılabilir
 */
function initBackupScheduler() {
  cron.schedule(BACKUP_CRON, async () => {
    console.log('⏰ Zamanlanmış yedekleme tetiklendi...');
    await _runBackup();
  });
  
  console.log(`📅 Otomatik yedekleme aktif. Program: "${BACKUP_CRON}" (varsayılan: her Pazar 03:00)`);
  console.log(`📂 Yedek dizini: ${BACKUP_ROOT}`);
  console.log(`🗑️  Saklanan yedek sayısı: son ${MAX_BACKUPS} adet`);
}

// Sadece scheduler export ediliyor — manuel tetikleme yok
module.exports = { initBackupScheduler };
