# Kolektif Yaratıcı Hikaye Platformu

Kullanıcıların ortaklaşa interaktif hikayeler oluşturabileceği dinamik bir platform. Her bölüm sonunda kullanıcılar, oy kullanarak hikayenin alternatif gelişimlerini belirler. Böylece hikaye, toplu kararlarla farklı sonlara evrilebilir.

## Özellikler

- **Dinamik Hikaye Oluşturma**: Kullanıcılar tarafından eklenen hikaye bölümleri ve dalların veritabanında dinamik olarak yönetilmesi.
- **Oy Sistemi**: Her bölüm sonrasında sunulan seçenekler için toplu oy kullanımı. En yüksek oyu alan seçenek, bir sonraki bölümün temelini oluşturur.
- **Zamanlanmış Hikaye Açma Etkinlikleri**: Belirli zaman aralıklarında veya önceden tanımlı etkinliklerde yeni hikaye bölümlerinin otomatik olarak yayınlanması.
- **Özel İçerik Ödülleri**: Aktif katılımcılara, hikayeye katkıları veya oy kullanma aktiviteleri sonucunda rozetler ve ödüller verilmesi.
- **Yönetici & Moderatör İşlevleri**: PHP Filament tabanlı güçlü bir admin paneli ile hikaye, kullanıcı ve içerik yönetiminin sağlanması.

## Teknoloji Yığını

- **Backend**: [Next.js](https://nextjs.org/) – API endpoint'leri ve dinamik veri yönetimi için.
- **Admin Panel**: [PHP Filament](https://filamentphp.com/) – Hikaye, kullanıcı ve içerik yönetimi.
- **Frontend**: [Vue.js](https://vuejs.org/) – Gerçek zamanlı interaktif hikaye akışı ve kullanıcı deneyimini zenginleştiren arayüz.

## Sistem Mimarisi

### Next.js API (Backend)
- **Veri Yönetimi**: Hikaye bölümleri, kullanıcı oyları, içerik ve hikaye dalları için CRUD işlemleri.
- **Gerçek Zamanlı İşlemler**: WebSocket veya Server-Sent Events (SSE) entegrasyonu ile anlık güncellemeler.
- **Zamanlanmış İşlemler**: CRON job veya benzeri bir scheduler aracılığıyla belirli aralıklarla hikaye bölümlerinin açılması.
- **Kimlik Doğrulama**: JWT veya OAuth gibi yöntemlerle güvenli kullanıcı giriş/çıkış işlemleri.

### PHP Filament Admin Paneli
- **İçerik Yönetimi**: Hikayelerin, bölümlerin ve dalların yönetimi.
- **Kullanıcı Yönetimi**: Roller, moderasyon işlemleri, kullanıcı raporları.
- **Planlama & Yayınlama**: Zamanlanmış hikaye açma etkinliklerinin ve özel içerik ödüllerinin kontrolü.

### Vue.js Frontend
- **Interaktif Arayüz**: Gerçek zamanlı hikaye akışı, oy kullanma işlemleri, canlı bildirimler.
- **Kullanıcı Deneyimi**: Akıcı animasyonlar, responsive tasarım, sezgisel navigasyon.
- **API Entegrasyonu**: Next.js üzerinden sağlanan API endpoint'leri ile veri alışverişi.

## Veritabanı Şeması

### Tablolar

#### 1. users
- `id` (PK) - Otomatik artan benzersiz tanımlayıcı
- `username` - Kullanıcı adı (benzersiz)
- `email` - E-posta adresi (benzersiz)
- `password` - Şifrelenmiş kullanıcı şifresi
- `avatar` - Profil resmi yolu
- `bio` - Kullanıcı biyografisi
- `role` - Kullanıcı rolü (user, moderator, admin)
- `points` - Kazanılan toplam puan
- `created_at` - Kayıt tarihi
- `updated_at` - Son güncelleme tarihi

#### 2. stories
- `id` (PK) - Otomatik artan benzersiz tanımlayıcı
- `title` - Hikaye başlığı
- `description` - Hikaye açıklaması
- `cover_image` - Kapak resmi yolu
- `status` - Hikaye durumu (active, completed, archived)
- `created_by` (FK -> users.id) - Hikayeyi oluşturan kullanıcı
- `created_at` - Oluşturulma tarihi
- `updated_at` - Son güncelleme tarihi

#### 3. chapters
- `id` (PK) - Otomatik artan benzersiz tanımlayıcı
- `story_id` (FK -> stories.id) - Bağlı olduğu hikaye
- `title` - Bölüm başlığı
- `content` - Bölüm içeriği
- `parent_chapter_id` (FK -> chapters.id, nullable) - Bağlı olduğu üst bölüm
- `sequence` - Hikaye akışındaki sıra numarası
- `status` - Bölüm durumu (draft, published, locked)
- `created_by` (FK -> users.id) - Bölümü yazan kullanıcı
- `published_at` - Yayınlanma tarihi
- `created_at` - Oluşturulma tarihi
- `updated_at` - Son güncelleme tarihi

#### 4. options
- `id` (PK) - Otomatik artan benzersiz tanımlayıcı
- `chapter_id` (FK -> chapters.id) - Bağlı olduğu bölüm
- `title` - Seçenek başlığı
- `description` - Seçenek açıklaması
- `created_by` (FK -> users.id) - Seçeneği oluşturan kullanıcı
- `created_at` - Oluşturulma tarihi
- `updated_at` - Son güncelleme tarihi

#### 5. votes
- `id` (PK) - Otomatik artan benzersiz tanımlayıcı
- `option_id` (FK -> options.id) - Oy verilen seçenek
- `user_id` (FK -> users.id) - Oy veren kullanıcı
- `created_at` - Oy verme tarihi

#### 6. badges
- `id` (PK) - Otomatik artan benzersiz tanımlayıcı
- `name` - Rozet adı
- `description` - Rozet açıklaması
- `image` - Rozet görseli yolu
- `points` - Rozet için verilen puan
- `created_at` - Oluşturulma tarihi
- `updated_at` - Son güncelleme tarihi

#### 7. user_badges
- `id` (PK) - Otomatik artan benzersiz tanımlayıcı
- `user_id` (FK -> users.id) - Kullanıcı
- `badge_id` (FK -> badges.id) - Kazanılan rozet
- `awarded_at` - Rozet kazanma tarihi

#### 8. scheduled_events
- `id` (PK) - Otomatik artan benzersiz tanımlayıcı
- `title` - Etkinlik başlığı
- `description` - Etkinlik açıklaması
- `type` - Etkinlik türü (chapter_release, contest, etc.)
- `related_id` - İlgili içerik ID'si (chapter_id, story_id, etc.)
- `scheduled_at` - Planlanan tarih/saat
- `status` - Etkinlik durumu (pending, completed, cancelled)
- `created_by` (FK -> users.id) - Etkinliği oluşturan kullanıcı
- `created_at` - Oluşturulma tarihi
- `updated_at` - Son güncelleme tarihi

#### 9. notifications
- `id` (PK) - Otomatik artan benzersiz tanımlayıcı
- `user_id` (FK -> users.id) - Bildirim alıcısı
- `title` - Bildirim başlığı
- `content` - Bildirim içeriği
- `type` - Bildirim türü (new_chapter, vote_result, badge_earned, etc.)
- `related_id` - İlgili içerik ID'si
- `is_read` - Okunma durumu
- `created_at` - Oluşturulma tarihi

## API Endpoint'leri ve Postman Örnekleri

### Kullanıcı İşlemleri

#### Kullanıcı Kaydı
```
POST /api/auth/register
```

**İstek (Request):**
```json
{
  "username": "ahmetyazar",
  "email": "ahmet@example.com",
  "password": "guvenli_sifre123",
  "passwordConfirm": "guvenli_sifre123"
}
```

**Yanıt (Response):**
```json
{
  "message": "Kullanıcı başarıyla kaydedildi",
  "user": {
    "id": 1,
    "username": "ahmetyazar",
    "email": "ahmet@example.com",
    "avatar": null,
    "bio": null,
    "role": "user",
    "points": 0,
    "createdAt": "2023-03-01T12:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Kullanıcı Girişi
```
POST /api/auth/login
```

**İstek (Request):**
```json
{
  "email": "ahmet@example.com",
  "password": "guvenli_sifre123"
}
```

**Yanıt (Response):**
```json
{
  "message": "Giriş başarılı",
  "user": {
    "id": 1,
    "username": "ahmetyazar",
    "email": "ahmet@example.com",
    "avatar": null,
    "bio": null,
    "role": "user",
    "points": 0,
    "createdAt": "2023-03-01T12:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Mevcut Kullanıcı Bilgilerini Getir
```
GET /api/auth/me
```

**Yanıt (Response):**
```json
{
  "id": 1,
  "username": "ahmetyazar",
  "email": "ahmet@example.com",
  "avatar": null,
  "bio": null,
  "role": "user",
  "points": 0,
  "createdAt": "2023-03-01T12:00:00Z"
}
```

### Hikaye İşlemleri

#### Tüm Hikayeleri Listele
```
GET /api/stories
```

**Yanıt (Response):**
```json
[
  {
    "id": 1,
    "title": "Gizemli Orman",
    "description": "Küçük bir kasabanın yakınındaki ormanda garip olaylar yaşanmaya başlar...",
    "coverImage": "/stories/forest.jpg",
    "status": "active",
    "author": "ahmetyazar",
    "createdAt": "2023-02-15T10:30:00Z"
  },
  {
    "id": 2,
    "title": "Karanlık Şato",
    "description": "Eski bir şatoda geçen bu hikayede, miras kalan şatoya taşınan bir aile...",
    "coverImage": "/stories/castle.jpg",
    "status": "active",
    "author": "elifyazar",
    "createdAt": "2023-03-22T14:15:00Z"
  }
]
```

#### Belirli Bir Hikayeyi Getir
```
GET /api/stories/1
```

**Yanıt (Response):**
```json
{
  "id": 1,
  "title": "Gizemli Orman",
  "description": "Küçük bir kasabanın yakınındaki ormanda garip olaylar yaşanmaya başlar. Kasabalılar, ormanda kaybolan insanların hikayelerini anlatırken, genç bir gazeteci gerçeği ortaya çıkarmak için ormana girer.",
  "coverImage": "/stories/forest.jpg",
  "status": "active",
  "author": "ahmetyazar",
  "createdAt": "2023-02-15T10:30:00Z",
  "updatedAt": "2023-02-15T10:30:00Z"
}
```

#### Yeni Hikaye Oluştur
```
POST /api/stories
```

**İstek (Request):**
```json
{
  "title": "Uzay Yolculuğu",
  "description": "İnsanlığın ilk uzun mesafe uzay yolculuğuna çıkan bir ekibin başından geçen olaylar.",
  "coverImage": "/stories/space.jpg"
}
```

**Yanıt (Response):**
```json
{
  "id": 3,
  "title": "Uzay Yolculuğu",
  "description": "İnsanlığın ilk uzun mesafe uzay yolculuğuna çıkan bir ekibin başından geçen olaylar.",
  "coverImage": "/stories/space.jpg",
  "status": "active",
  "author": "ahmetyazar",
  "createdAt": "2023-03-25T09:45:00Z",
  "updatedAt": "2023-03-25T09:45:00Z"
}
```

### Bölüm İşlemleri

#### Hikayeye Ait Bölümleri Getir
```
GET /api/stories/1/chapters
```

**Yanıt (Response):**
```json
[
  {
    "id": 1,
    "title": "Kayıp İnsanlar",
    "summary": "Kasabada son aylarda artan kayıp vakalarının ardındaki gizem.",
    "publishedAt": "2023-02-20T14:30:00Z",
    "readTime": 8
  },
  {
    "id": 2,
    "title": "Ormana Giriş",
    "summary": "Ayşe, kasabalıların uyarılarına rağmen ormana girmeye karar verir.",
    "publishedAt": "2023-03-05T11:15:00Z",
    "readTime": 10
  }
]
```

#### Belirli Bir Bölümü Getir
```
GET /api/chapters/1
```

**Yanıt (Response):**
```json
{
  "id": 1,
  "storyId": 1,
  "title": "Kayıp İnsanlar",
  "content": "<p>Kasabada son aylarda artan kayıp vakalarının ardındaki gizem...</p>",
  "author": "ahmetyazar",
  "publishedAt": "2023-02-20T14:30:00Z",
  "readTime": 8,
  "hasOptions": true,
  "votingDeadline": "2023-03-01T23:59:59Z"
}
```

### Seçenek ve Oy İşlemleri

#### Bölüme Ait Seçenekleri Getir
```
GET /api/chapters/1/options
```

**Yanıt (Response):**
```json
[
  {
    "id": 1,
    "title": "Kaçmaya Çalış",
    "description": "Ayşe, tehlikede olduğunu hissederek hızla kulübeden kaçmaya çalışır.",
    "votes": 24
  },
  {
    "id": 2,
    "title": "Yaşlı Kişiyle Konuş",
    "description": "Ayşe, sakin kalmaya çalışarak yaşlı kişiyle konuşmaya karar verir ve kayıp insanları sorar.",
    "votes": 42
  }
]
```

#### Seçeneğe Oy Ver
```
POST /api/options/2/vote
```

**Yanıt (Response):**
```json
{
  "message": "Oy başarıyla kaydedildi",
  "optionId": 2,
  "userId": 1
}
```

## Kurulum ve Çalıştırma

### Gereksinimler
- Backend İçin: Node.js (LTS), Next.js
- Admin Panel İçin: PHP (7.4+), Composer, Laravel & Filament
- Frontend İçin: Node.js, Vue CLI
- Veritabanı: MySQL veya tercih ettiğiniz başka bir ilişkisel veritabanı

### Backend (Next.js) Kurulum
```bash
# Proje klasörüne git
cd server

# Gereksinimleri yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Veya üretim için build
npm run build
npm start
```

### Frontend (Vue.js) Kurulum
```bash
# Proje klasörüne git
cd client

# Gereksinimleri yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Veya üretim için build
npm run build
```

## Erişim Bilgileri

- **Backend API**: http://localhost:3000/api
- **Frontend**: http://localhost:5173
- **Admin Panel**: http://localhost:8000/admin

## Katkıda Bulunma

1. Bu depoyu fork edin
2. Yeni bir özellik dalı oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Dalınıza push edin (`git push origin feature/amazing-feature`)
5. Bir Pull Request açın

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına bakın.
