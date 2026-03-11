# 🔧 teskilat.com.tr — SEO Göç Düzeltmeleri (Domain Ekibi İçin)

**Tarih:** 10 Mart 2026
**Konu:** Umbraco → React göçü sonrası Google index temizliği
**Öncelik:** 🔴 Yüksek

---

## Durum Özeti

Site Umbraco CMS'den React'a taşındı. Yeni site çalışıyor ancak Google hâlâ eski URL'leri gösteriyor. Kullanıcılar eski linklere tıkladığında boş sayfa veya yanlış içerik görüyor.

**Yapılması gereken 4 ana iş:**
1. 🏠 **Anasayfayı Google'da öne çıkarmak** (aşağıdaki özel bölüm)
2. Güncellenmiş `nginx.conf` dosyasını sunucuya deploy etmek
3. Google Search Console'da eski URL'leri temizlemek
4. Yeni sitemap'i Google'a göndermek

---

## 🏠 ÖNCELİK: Anasayfayı Google'da Öne Çıkarma

Şu an "teskilat" veya "teşkilat icom" arandığında Google eski alt sayfaları (services, works, brands vb.) üst sıralarda gösteriyor, anasayfa öne çıkmıyor. Bunu düzeltmek için:

### A. Google Search Console'da Anasayfayı Tarattırma
1. GSC → **URL Denetleme** (URL Inspection)
2. Şu URL'yi girin: `https://www.teskilat.com.tr/`
3. **"Canlı URL'yi Test Et"** (Test Live URL) tıklayın
4. Sonuç başarılı ise **"Dizine Ekleme İste"** (Request Indexing) tıklayın
5. Bu adımı **her gün 1 kez** tekrarlayın, Google anasayfayı tarayana kadar

### B. Eski Sayfaları Google'dan Kaldırma (Anasayfaya Yer Açma)
Google'da eski sayfalar anasayfanın önüne geçiyor. Bunları kaldırmak anasayfayı yukarı çıkarır:

1. GSC → **Kaldırmalar** (Removals) → **Yeni İstek**
2. Şu URL'leri kaldırma isteği olarak gönderin:
   ```
   https://www.teskilat.com.tr/about-us/
   https://www.teskilat.com.tr/what-we-do
   https://www.teskilat.com.tr/kvkk
   https://www.teskilat.com.tr/careers
   ```
3. Bu URL'ler arama sonuçlarından anında kaybolur → anasayfa yukarı çıkar

### C. www vs non-www Tutarlılığı (Çok Önemli)
Google Search Console'da **her iki domain versiyonu** da doğrulanmış olmalı:
- `https://www.teskilat.com.tr` (birincil)
- `https://teskilat.com.tr` (yönlendirme)

GSC → **Ayarlar** → **Tercih Edilen Alan** → `https://www.teskilat.com.tr` seçin.

> ⚠️ Eğer GSC'de sadece `teskilat.com.tr` (www'suz) doğrulanmışsa, `www.teskilat.com.tr` için de ayrıca doğrulama yapın. Şu an site `www` üzerinden sunuluyor ama eski canonical tag'ler `www`'suz domain'e işaret ediyordu — bu düzeltildi ama Google'ın her iki versiyonu da görmesi önemli.

### D. Google Business Profile (varsa)
Eğer Google Business Profile (Google Haritalar) kaydınız varsa:
1. business.google.com'a girin
2. Website URL'sini `https://www.teskilat.com.tr/` olarak güncelleyin
3. Bu, Google'ın anasayfayı birincil sayfa olarak tanımasını güçlendirir

### E. Sosyal Medya ve Dış Bağlantılar
Anasayfaya dış sinyal göndermek için:
- Instagram, LinkedIn, YouTube profil linklerini `https://www.teskilat.com.tr/` olarak güncelleyin
- Müşteri sitelerindeki veya dizinlerdeki linkleri güncelleyin
- Bunlar Google'a anasayfanın "en önemli sayfa" olduğunu sinyaller

---

## 1. Nginx Konfigürasyonu Deploy ⚙️

Güncellenmiş `nginx.conf` dosyası projenin `frontend/nginx.conf` dizininde hazır. Değişiklikler:

- **26 adet 301 redirect** — eski URL'ler yeni sayfalara yönlendiriliyor
- **Non-www → www redirect** — `teskilat.com.tr` → `www.teskilat.com.tr`
- **Umbraco sistem yolları engellenmiş** (410 Gone)

### Deploy Adımları:
```bash
# 1. Yeni config'i sunucuya kopyala
scp frontend/nginx.conf sunucu:/etc/nginx/sites-available/teskilat.conf

# 2. Syntax kontrolü
sudo nginx -t

# 3. Nginx'i yeniden yükle
sudo nginx -s reload
```

### Deploy Sonrası Kontrol:
```bash
# Eski URL redirect kontrolü (301 dönmeli)
curl -I https://www.teskilat.com.tr/about-us
# Beklenen: HTTP/2 301, Location: /about

curl -I https://www.teskilat.com.tr/what-we-do
# Beklenen: HTTP/2 301, Location: /services

curl -I https://www.teskilat.com.tr/careers
# Beklenen: HTTP/2 301, Location: /

# Umbraco yolu kontrolü (410 dönmeli)
curl -I https://www.teskilat.com.tr/umbraco
# Beklenen: HTTP/2 410

# Non-www kontrolü (301 dönmeli)
curl -I https://teskilat.com.tr/about
# Beklenen: HTTP/2 301, Location: https://www.teskilat.com.tr/about

# Yeni sayfa kontrolü (200 dönmeli)
curl -I https://www.teskilat.com.tr/
# Beklenen: HTTP/2 200
```

---

## 2. Google Search Console İşlemleri 🔍

### 2a. Yeni Sitemap Gönder
1. GSC → **Sitemaps** menüsüne gir
2. Eski sitemap varsa sil
3. Yeni sitemap URL'sini gir: `https://www.teskilat.com.tr/sitemap.xml`
4. **Gönder** butonuna bas
5. Durum "Başarılı" ve 9 URL keşfedilmiş olmalı

### 2b. Anasayfayı Tekrar Tarattır
1. GSC → **URL Denetleme** (URL Inspection)
2. Şu URL'yi gir: `https://www.teskilat.com.tr/`
3. **Dizine Ekleme İste** (Request Indexing) butonuna tıkla
4. Bu, Google'a anasayfanın güncel olduğunu bildirir

### 2c. Eski URL'leri Tek Tek Tarattır
Aşağıdaki URL'lerin her birini GSC → URL Denetleme'ye gir ve **"Dizine Ekleme İste"** tıkla:

| URL | Açıklama |
|-----|----------|
| `https://www.teskilat.com.tr/about-us/` | Eski "About Us" sayfası |
| `https://www.teskilat.com.tr/what-we-do` | Eski "What We Do" sayfası |
| `https://www.teskilat.com.tr/kvkk` | Eski KVKK sayfası |
| `https://www.teskilat.com.tr/careers` | Eski "Careers" sayfası |
| `https://www.teskilat.com.tr/about` | Yeni about (eski title ile çıkıyor) |
| `https://www.teskilat.com.tr/services` | Yeni services (eski title ile çıkıyor) |
| `https://www.teskilat.com.tr/works` | Yeni works (eski title ile çıkıyor) |
| `https://www.teskilat.com.tr/brands` | Yeni brands (eski title ile çıkıyor) |
| `https://www.teskilat.com.tr/contact` | Yeni contact (eski title ile çıkıyor) |

### 2d. İnatçı Eski URL'leri Kaldır
1. GSC → **Kaldırmalar** (Removals) → **Yeni İstek** (New Request)
2. Aşağıdaki URL'leri tek tek gir ve kaldırma isteği gönder:

```
https://www.teskilat.com.tr/about-us/
https://www.teskilat.com.tr/what-we-do
https://www.teskilat.com.tr/kvkk
https://www.teskilat.com.tr/careers
```

> ⚠️ Bu, URL'leri ~6 ay boyunca arama sonuçlarından gizler. Bu sürede Google 301 redirect'i işleyerek eski URL'yi kalıcı olarak kaldırır.

### 2e. Kapsam Raporunu İzle
1. GSC → **Sayfalar** (Pages / Coverage)
2. 2-4 hafta boyunca kontrol et:
   - Eski URL'ler "Yönlendirme" (Redirect) durumuna geçmeli ✅
   - "Bulunamadı (404)" hatası olmamalı
   - Tüm yeni URL'ler "Dizine eklendi" (Indexed) olmalı ✅

---

## 3. Google'daki Mevcut Durum (Ekran Görüntüsü)

`site:teskilat.com.tr` araması sonucu (10 Mart 2026):

| # | Google'da Görünen | URL | Durum |
|---|-------------------|-----|-------|
| 1 | "Our Services" | `/services` | Eski başlık, yeni URL — yeniden tarama gerekli |
| 2 | "Our Works" | `/works` | Eski başlık, yeni URL — yeniden tarama gerekli |
| 3 | "Brands / Clients" | `/brands` | Eski başlık, yeni URL — yeniden tarama gerekli |
| 4 | "KVKK" | `/kvkk` | ❌ Eski sayfa, kaldırılmalı |
| 5 | "Careers" | `/careers` | ❌ Eski sayfa, kaldırılmalı |
| 6 | "Contact" | `/contact` | Eski başlık, yeni URL — yeniden tarama gerekli |
| 7 | "About Us" | `/about-us/` | ❌ Eski sayfa, kaldırılmalı |
| 8 | "ICOM Network" | (teskilat.com.tr) | Eski başlık — yeniden tarama gerekli |
| 9 | "What We Do" | `/what-we-do` | ❌ Eski sayfa, kaldırılmalı |

---

## 4. Tam Redirect Listesi (Referans)

### Eski URL → Yeni URL (301 Redirect)

| Eski URL | Yeni URL |
|----------|----------|
| `/what-we-do` | `/services` |
| `/who-we-are` | `/about` |
| `/about-us` | `/about` |
| `/our-work` | `/works` |
| `/portfolio` | `/works` |
| `/our-team` | `/team` |
| `/our-brands` | `/brands` |
| `/contact-us` | `/contact` |
| `/icom` | `/icom-network` |
| `/icom-network-member` | `/icom-network` |
| `/kvkk` | `/` |
| `/careers` | `/` |
| `/home` | `/` |
| `/default` | `/` |
| `/default.aspx` | `/` |
| `/homepage` | `/` |
| `/index` | `/` |
| `/index.html` | `/` |
| `/hakkimizda` | `/about` |
| `/hizmetlerimiz` | `/services` |
| `/ekibimiz` | `/team` |
| `/markalarimiz` | `/brands` |
| `/islerimiz` | `/works` |
| `/iletisim` | `/contact` |
| `/haberler` | `/news` |

### Engellenen Yollar (410 Gone)

| Yol | Sebep |
|-----|-------|
| `/umbraco*` | Eski CMS admin paneli |
| `/media*` | Eski medya kütüphanesi |
| `/App_Plugins*` | Umbraco eklentileri |
| `/App_Data*` | Umbraco veri klasörü |
| `/bin*` | .NET binary dosyaları |
| `/Views*` | Razor view dosyaları |
| `*.aspx` | Tüm eski ASP.NET sayfaları |

---

## 5. Beklenen Zaman Çizelgesi

| Adım | Süre |
|------|------|
| Nginx deploy sonrası redirect'ler aktif | Anında |
| GSC'de sitemap işlenmesi | 1-2 gün |
| Google'ın redirect'leri işlemesi | 1-4 hafta |
| Eski URL'lerin tamamen kaybolması | 2-8 hafta |
| GSC kaldırma isteği ile gizleme | Anında (~6 ay) |

---

## Sorular?

Bu dosyayla ilgili sorularınız varsa geliştirme ekibine iletebilirsiniz. Nginx config dosyası projenin `frontend/nginx.conf` yolundadır.
