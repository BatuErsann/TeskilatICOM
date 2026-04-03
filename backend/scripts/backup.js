// scripts/backup.js
// Bu betik veritabanını ve yüklenen dosyaları yedekler.
// Çalıştırmak için: node scripts/backup.js

require('dotenv').config();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Yedeklerin kaydedileceği ana dizin (Sunucu kök dizini dışında bir yer seçmek daha güvenlidir)
// Örnek: Linux için '/var/backups/teskilat', Windows için 'C:\\backups\\teskilat'
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, '../../backups');
const UPLOADS_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');

// Veritabanı bilgileri
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'teskilat_db';

// Bugünkü yedek klasörünü oluştur
const dateStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
const timestamp = Date.now();
const currentBackupDir = path.join(BACKUP_DIR, `${dateStr}_${timestamp}`);

if (!fs.existsSync(currentBackupDir)) {
  fs.mkdirSync(currentBackupDir, { recursive: true });
}

console.log(`\n🛡️ Yedekleme işlemi başlatılıyor: ${currentBackupDir}`);

// 1. Veritabanı Yedeği (mysqldump)
const sqlFile = path.join(currentBackupDir, 'database_backup.sql');
const dumpCmd = `mysqldump -h ${DB_HOST} -u ${DB_USER} ${DB_PASS ? `-p"${DB_PASS}"` : ''} ${DB_NAME} > "${sqlFile}"`;

console.log('1️⃣ Veritabanı yedekleniyor...');
exec(dumpCmd, (error) => {
  if (error) {
    console.error('❌ Veritabanı yedekleme hatası! mysqldump kurulu olduğundan emin olun.');
    console.error(error.message);
  } else {
    console.log('✅ Veritabanı başarıyla yedeklendi.');
    
    // Güvenlik için SQL dosyasını şifreleyebiliriz (İsteğe bağlı)
    encryptFile(sqlFile);
  }

  // 2. Uploads Klasörü Yedeği
  console.log('2️⃣ Yüklenen dosyalar (Uploads) yedekleniyor...');
  
  // Windows ve Linux için farklı kopyalama komutları
  const isWindows = process.platform === 'win32';
  const uploadsBackupDir = path.join(currentBackupDir, 'uploads_backup');
  const copyCmd = isWindows 
    ? `xcopy "${UPLOADS_DIR}" "${uploadsBackupDir}\\" /E /I /H /Y /C`
    : `cp -r "${UPLOADS_DIR}" "${uploadsBackupDir}"`;

  exec(copyCmd, (copyError) => {
    if (copyError && copyError.code !== 0) { // xcopy bazen boş klasörde hata kodu dönebilir
      console.log('⚠️ Uploads kopyalanırken bazı dosyalar atlanmış olabilir veya klasör boş.');
    } else {
      console.log('✅ Yüklenen dosyalar başarıyla yedeklendi.');
    }
    
    console.log('\n🔒 YEDEKLEME TAMAMLANDI! 🔒');
    console.log(`Tüm yedekler "${currentBackupDir}" klasöründe güvende.`);
    console.log('Not: Tam izolasyon için bu klasörün içeriğini AWS S3, Google Cloud veya farklı fiziksel bir sunucuya göndermeniz önerilir.');
  });
});

// Ekstra Güvenlik: Yedeği AES-256 ile şifreleme fonksiyonu (Ransomware'e karşı)
function encryptFile(filePath) {
  if (!process.env.BACKUP_ENCRYPTION_KEY) {
    console.log('ℹ️ BACKUP_ENCRYPTION_KEY .env dosyasında bulunamadı. Şifreleme atlandı.');
    return;
  }
  
  try {
    const algorithm = 'aes-256-cbc';
    // Key must be 32 bytes
    const key = crypto.scryptSync(process.env.BACKUP_ENCRYPTION_KEY, 'salt', 32);
    const iv = crypto.randomBytes(16);

    const input = fs.createReadStream(filePath);
    const output = fs.createWriteStream(`${filePath}.enc`);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    // Write IV to the beginning of the file to use it during decryption
    output.write(iv);

    input.pipe(cipher).pipe(output);

    output.on('finish', () => {
      console.log('✅ Veritabanı yedeği şifrelendi (.enc uzantılı dosya).');
      // Orijinal şifresiz SQL dosyasını silebiliriz
      fs.unlinkSync(filePath);
    });
  } catch (err) {
    console.error('❌ Şifreleme işlemi başarısız:', err.message);
  }
}
