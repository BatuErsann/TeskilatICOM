# 🚑 Olası Bir Çöküş/Saldırı Durumunda Yedekten Geri Dönüş Rehberi

Bu belge, otomatik olarak `/var/backups/teskilat` dizinine alınan yedek dosyalarının sunucuya nasıl geri yükleneceğini anlatır.

## 1. Yedeği Bulmak

Öncelikle sunucuya SSH ile bağlanıp yedeklerin olduğu klasöre gidin:

```bash
cd /var/backups/teskilat
ls -la
```

Karşınıza tarihlere göre sıralanmış (örneğin: `2026-04-06-03-00-00`) yedek klasörleri çıkacaktır. En güncel (veya sağlam olduğuna emin olduğunuz) klasörün ismini not edin ve içine girin:

```bash
cd /var/backups/teskilat/YEDEK_KLASOR_TARIHI
```

Bu klasörün içinde iki şey olacak:
1. `database_backup.sql` (Veritabanı dökümü)
2. `uploads/` (Kullanıcı resimleri vb. dosyalar)

---

## 2. Veritabanını Geri Yükleme (MySQL)

Docker üzerinde çalışan MySQL veritabanını kurtarmak için şu komutu çalıştırın:
*(Not: `yo48c80oskgw4wwg84ssggs0` sizin MySQL container adınızdır. Eğer Coolify panelinde bu isim değiştiyse docker ps ile yeni isme bakmanız gerekebilir).*

```bash
docker exec -i yo48c80oskgw4wwg84ssggs0 mysql -u root -p"1234" teskilat_db < database_backup.sql
```

Bu komut herhangi bir onay beklemeden `teskilat_db` içindeki tüm tabloları silip yedekteki tertemiz versiyona çekecektir. Eğer hata vermeden terminal yeni satıra geçerse **başarılı olmuş** demektir.

---

## 3. Upload (Yüklenen Görseller) Dosyalarını Geri Yükleme

Eğer saldırgan yüklenen görselleri (Uploads) silmiş veya bozmuşsa, yedeklediğiniz uploads klasörünü sisteminize geri atmalısınız. 
Sunucudaki ortam belirtecinizde Upload dizinini `/data/uploads` olarak ayarlamıştınız. O halde yedekte saklanan klasörü doğrudan ana dizinin üzerine yazıyoruz:

```bash
# Önce sistemi kirletmiş olabilecek mevcut klasörün içini boşaltın:
rm -rf /data/uploads/*

# Şimdi yedeklenen dosyaları oraya aktarın:
cp -r uploads/* /data/uploads/
```

*(Ortam değişkeninde `/data/uploads` olarak belirlendiği için dosyalar otomatik olarak uygulamanız tarafından anında görülecektir).*

---

## 4. Sisteme Format Atıldıysa ve Coolify Yoksa Ne Olacak?

Eğer sunucu **tamamen silindiyse** (Yani Coolify, Docker, her şey gitmişse ve sıfırdan Ubuntu kurduysanız):

1. Bu backup klasörünü kendi bilgisayarınıza `scp` (veya FileZilla) ile acilen indirin.
2. Yeni bir sunucu açın, Coolify'ı baştan kurun.
3. Projeyi GitHub'dan tekrar Coolify ile deploy edin.
4. Çevre değişkenlerini (`.env`) aynı eskisi gibi ayarlayın. (`BACKUP_DIR`, `UPLOAD_DIR` vs.)
5. Proje ayaklandığında bu rehberdeki **Adım 2** ve **Adım 3**'ü izleyerek tüm içeriği aynı şekilde geri basabilirsiniz.

Geçmiş olsun!
