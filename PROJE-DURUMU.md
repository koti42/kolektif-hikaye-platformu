# Kolektif Yaratıcı Hikaye Platformu - Proje Durumu

## Çalışan Servisler

- **Backend API (Next.js)**: http://localhost:3002
  - JWT kimlik doğrulama ile güvenli API endpoint'leri
  - Prisma ORM ile veritabanı işlemleri
  - RESTful API tasarımı

- **Frontend (Vue.js)**: http://localhost:3001
  - Kullanıcı dostu arayüz
  - Responsive tasarım
  - Vue Router ile sayfa yönlendirme
  - Pinia ile durum yönetimi

## Kullanım Kılavuzu

### Backend API

Backend API'ye erişmek için:

```bash
curl http://localhost:3002/api/stories
```

Kimlik doğrulama gerektiren endpoint'ler için JWT token'ı gereklidir:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:3002/api/users/me
```

### Frontend

Frontend uygulamasına tarayıcınızdan http://localhost:3001 adresini ziyaret ederek erişebilirsiniz.

Kullanılabilir sayfalar:
- Ana Sayfa: `/`
- Giriş: `/login`
- Kayıt: `/register`
- Hikayeler: `/stories`
- Hikaye Detayı: `/stories/:id`
- Bölüm Detayı: `/stories/:storyId/chapters/:chapterId`
- Profil: `/profile`

## Veritabanı Şeması

Veritabanı şeması Prisma ile yönetilmektedir. Şema dosyası `prisma/schema.prisma` konumunda bulunmaktadır.

Ana tablolar:
- `User`: Kullanıcı bilgileri
- `Story`: Hikaye bilgileri
- `Chapter`: Hikaye bölümleri
- `Option`: Bölüm sonundaki seçenekler
- `Vote`: Kullanıcı oyları
- `Badge`: Rozetler
- `UserBadge`: Kullanıcı rozetleri
- `ScheduledEvent`: Zamanlanmış etkinlikler
- `Notification`: Kullanıcı bildirimleri

## Geliştirme Notları

### Tamamlanan İşler

- Backend API endpoint'leri
- Frontend sayfa yapısı
- Kimlik doğrulama sistemi
- Veritabanı şeması
- Docker yapılandırması

### Yapılacak İşler

- Admin panelinin tamamlanması (PHP Filament)
- WebSocket entegrasyonu
- Zamanlanmış görevler için CRON job'ları
- Kapsamlı test yazımı
- Performans optimizasyonları

## Sorun Giderme

Yaygın sorunlar ve çözümleri:

1. **JWT Hatası**: `jose` kütüphanesinin yüklü olduğundan emin olun.
2. **Veritabanı Bağlantı Hatası**: `.env` dosyasındaki veritabanı bağlantı bilgilerini kontrol edin.
3. **CORS Hatası**: Backend'in frontend'in origin'ine izin verdiğinden emin olun.

## Sonraki Adımlar

1. Admin panelinin geliştirilmesi
2. Gerçek zamanlı özellikler için WebSocket entegrasyonu
3. Kullanıcı deneyiminin iyileştirilmesi
4. Test kapsamının artırılması
5. Dokümantasyonun genişletilmesi 