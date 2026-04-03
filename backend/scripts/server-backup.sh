#!/bin/bash
# =============================================================
# Teşkilat ICOM - Sunucu Yedekleme Script'i
# =============================================================
# Bu script sunucuda (host makinede) çalışır.
# Docker container'larından veritabanı ve dosyaları yedekler.
#
# Kullanım:
#   chmod +x /root/server-backup.sh
#   /root/server-backup.sh
#
# Otomatik yedekleme (cron):
#   crontab -e
#   0 3 * * * /root/server-backup.sh >> /var/log/teskilat_backup.log 2>&1
# =============================================================

# --- AYARLAR ---
MYSQL_CONTAINER="yo48c80oskgw4wwg84ssggs0"
BACKEND_CONTAINER="l4cok0co8w08ss4o4ggsgc8g-113437379073"
DB_NAME="teskilat_db"
DB_USER="root"
DB_PASS="1234"  # Sunucudaki gerçek şifre ile değiştir!

BACKUP_ROOT="/var/backups/teskilat"
KEEP_DAYS=7  # Son kaç günün yedeğini tut

# --- YEDEK KLASÖRÜ OLUŞTUR ---
DATE_STR=$(date +"%Y-%m-%d_%H%M%S")
BACKUP_DIR="${BACKUP_ROOT}/${DATE_STR}"
mkdir -p "${BACKUP_DIR}"

echo ""
echo "🛡️ ============================================="
echo "   YEDEKLEME BAŞLATILDI: $(date)"
echo "   Hedef: ${BACKUP_DIR}"
echo "=============================================="

# --- 1. VERİTABANI YEDEĞİ ---
echo ""
echo "1️⃣  Veritabanı yedekleniyor..."
SQL_FILE="${BACKUP_DIR}/database_backup.sql"

docker exec "${MYSQL_CONTAINER}" mysqldump \
  -u "${DB_USER}" \
  -p"${DB_PASS}" \
  --single-transaction \
  --routines \
  --triggers \
  "${DB_NAME}" > "${SQL_FILE}" 2>/dev/null

if [ $? -eq 0 ] && [ -s "${SQL_FILE}" ]; then
  SQL_SIZE=$(du -h "${SQL_FILE}" | cut -f1)
  echo "   ✅ Veritabanı başarıyla yedeklendi. (${SQL_SIZE})"
  
  # SQL dosyasını sıkıştır
  gzip "${SQL_FILE}"
  echo "   📦 Sıkıştırıldı: database_backup.sql.gz"
else
  echo "   ❌ Veritabanı yedeği BAŞARISIZ!"
  echo "   ⚠️  MySQL container adını ve şifresini kontrol edin."
  rm -f "${SQL_FILE}"
fi

# --- 2. UPLOADS DOSYALARI YEDEĞİ ---
echo ""
echo "2️⃣  Upload dosyaları yedekleniyor..."
UPLOADS_BACKUP="${BACKUP_DIR}/uploads"
mkdir -p "${UPLOADS_BACKUP}"

# Backend container'dan uploads klasörünü kopyala
docker cp "${BACKEND_CONTAINER}:/app/uploads/." "${UPLOADS_BACKUP}/" 2>/dev/null

if [ $? -eq 0 ]; then
  FILE_COUNT=$(find "${UPLOADS_BACKUP}" -type f | wc -l)
  UPLOADS_SIZE=$(du -sh "${UPLOADS_BACKUP}" | cut -f1)
  echo "   ✅ Upload dosyaları yedeklendi. (${FILE_COUNT} dosya, ${UPLOADS_SIZE})"
else
  echo "   ⚠️  Upload dosyaları kopyalanamadı veya klasör boş."
  echo "   Not: Uploads yolu '/app/uploads' olarak varsayılıyor."
  echo "   Kontrol: docker exec ${BACKEND_CONTAINER} ls -la /app/uploads"
fi

# --- 3. .ENV YEDEĞİ (varsa) ---
echo ""
echo "3️⃣  Konfigürasyon dosyaları yedekleniyor..."
docker cp "${BACKEND_CONTAINER}:/app/.env" "${BACKUP_DIR}/env_backup.txt" 2>/dev/null
if [ $? -eq 0 ]; then
  echo "   ✅ .env dosyası yedeklendi."
else
  echo "   ℹ️  .env dosyası bulunamadı (Coolify ortam değişkenleri kullanılıyor olabilir)."
fi

# --- 4. ESKİ YEDEKLERİ TEMİZLE ---
echo ""
echo "4️⃣  Eski yedekler temizleniyor (${KEEP_DAYS} günden eski)..."
DELETED_COUNT=0
if [ -d "${BACKUP_ROOT}" ]; then
  for old_backup in $(find "${BACKUP_ROOT}" -maxdepth 1 -mindepth 1 -type d -mtime +${KEEP_DAYS}); do
    rm -rf "${old_backup}"
    DELETED_COUNT=$((DELETED_COUNT + 1))
    echo "   🗑️  Silindi: $(basename ${old_backup})"
  done
fi

if [ ${DELETED_COUNT} -eq 0 ]; then
  echo "   ℹ️  Silinecek eski yedek yok."
else
  echo "   ✅ ${DELETED_COUNT} eski yedek silindi."
fi

# --- 5. ÖZET ---
echo ""
TOTAL_SIZE=$(du -sh "${BACKUP_DIR}" | cut -f1)
TOTAL_BACKUPS=$(find "${BACKUP_ROOT}" -maxdepth 1 -mindepth 1 -type d | wc -l)

echo "🔒 ============================================="
echo "   YEDEKLEME TAMAMLANDI!"
echo "   Konum: ${BACKUP_DIR}"
echo "   Boyut: ${TOTAL_SIZE}"
echo "   Toplam yedek sayısı: ${TOTAL_BACKUPS}"
echo "   Zaman: $(date)"
echo "=============================================="
echo ""
