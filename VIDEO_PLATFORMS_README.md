# Video Platform Desteği Güncellemesi

## Genel Bakış
Bu güncelleme ile proje artık **YouTube, Instagram, Vimeo ve TikTok** platformlarından video linklerini desteklemektedir.

## Değişiklikler

### 1. Veritabanı Güncellemeleri

#### Videos Tablosu
- `youtube_url` kolonu `video_url` olarak yeniden adlandırıldı
- `platform` kolonu eklendi (youtube, instagram, vimeo, tiktok, other)

#### Works Tablosu
- `video_platform` kolonu eklendi (youtube, instagram, vimeo, tiktok, other)

### 2. Backend Güncellemeleri

**contentController.js**
- `addWork()` ve `updateWork()` fonksiyonları `video_platform` alanını destekliyor
- `addVideo()` fonksiyonu `platform` parametresini kabul ediyor

### 3. Frontend Güncellemeleri

**WorksManager.jsx**
- Video platform seçimi için UI eklendi (YouTube, Instagram, Vimeo, TikTok)
- Her platform için özel thumbnail desteği
- Platform algılama fonksiyonları:
  - `getYouTubeId()` - YouTube video ID'si çıkarma
  - `getVimeoId()` - Vimeo video ID'si çıkarma
  - `getInstagramId()` - Instagram post ID'si çıkarma
  - `getTikTokId()` - TikTok video ID'si çıkarma
  - `detectVideoPlatform()` - URL'den platform tespit etme

**Works.jsx**
- YouTube ve Vimeo videoları için embed player desteği
- Instagram ve TikTok için harici link yönlendirmesi
- Her platform için özel görsel gösterim

## Desteklenen Video Formatları

### YouTube
- `https://youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://youtube.com/embed/VIDEO_ID`
- `https://youtube.com/shorts/VIDEO_ID`

### Vimeo
- `https://vimeo.com/VIDEO_ID`

### Instagram
- `https://instagram.com/p/POST_ID`
- `https://instagram.com/reel/REEL_ID`
- `https://instagram.com/tv/TV_ID`

### TikTok
- `https://tiktok.com/@username/video/VIDEO_ID`
- `https://vm.tiktok.com/VIDEO_ID`
- `https://vt.tiktok.com/VIDEO_ID`

## Migration

Mevcut veritabanını güncellemek için:

```sql
-- Migration script'i çalıştırın
mysql -u username -p database_name < database_update_video_platforms.sql
```

veya

```bash
cd backend
node update_database.js
```

## Kullanım

### Yeni Video Ekleme

1. Dashboard > Works Management
2. "Add New Work" butonuna tıklayın
3. Content Type olarak "Video" seçin
4. Video platformunu seçin (YouTube, Instagram, Vimeo, TikTok)
5. Video URL'sini girin
6. Diğer bilgileri doldurun ve kaydedin

### Platform Özellikleri

- **YouTube & Vimeo**: Modal içinde embed player ile oynatılır
- **Instagram & TikTok**: Kullanıcı harici bağlantıya yönlendirilir (API kısıtlamaları nedeniyle)

## Geliştirici Notları

### Thumbnail Sistemi

YouTube için otomatik thumbnail alınır:
```javascript
`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
```

Diğer platformlar için placeholder görseller kullanılır. İsteğe bağlı olarak özel thumbnail yüklenebilir.

### Form Data Yapısı

```javascript
{
  title: string,
  description: string,
  media_type: 'image' | 'video',
  media_url: string,
  video_platform: 'youtube' | 'instagram' | 'vimeo' | 'tiktok' | 'other',
  thumbnail_url?: string,
  // ... diğer alanlar
}
```

## Gelecek Geliştirmeler

- [ ] Instagram ve TikTok API entegrasyonu ile embed player desteği
- [ ] Vimeo thumbnail API entegrasyonu
- [ ] Video önizleme süresi ve video detayları
- [ ] Otomatik platform algılama ve URL validasyonu

## Sorun Giderme

### Video Oynatılamıyor
- URL'nin doğru formatta olduğundan emin olun
- Platform seçiminin URL ile eşleştiğinden emin olun
- Instagram/TikTok videoları için harici bağlantının açıldığını kontrol edin

### Thumbnail Görünmüyor
- YouTube videoları için ID'nin doğru çıkarıldığını kontrol edin
- İsteğe bağlı özel thumbnail yükleyin
- Tarayıcı konsolunu kontrol edin

## Lisans
Bu güncelleme mevcut proje lisansı altındadır.
