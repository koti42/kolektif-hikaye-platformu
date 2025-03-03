# Kolektif Yaratıcı Hikaye Platformu API Dokümantasyonu

Bu dokümantasyon, Kolektif Yaratıcı Hikaye Platformu'nun API endpoint'lerini ve kullanım örneklerini içermektedir. API, Next.js ile geliştirilmiş ve RESTful prensiplere uygun olarak tasarlanmıştır.

## Temel URL

```
http://localhost:3000/api
```

## Kimlik Doğrulama

API'nin çoğu endpoint'i kimlik doğrulama gerektirir. Kimlik doğrulama, JWT (JSON Web Token) kullanılarak yapılır. Token, `Authorization` başlığında `Bearer` şeması ile gönderilmelidir.

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Kullanıcı İşlemleri

### Kullanıcı Kaydı

Yeni bir kullanıcı hesabı oluşturur.

**URL:** `POST /auth/register`

**Kimlik Doğrulama Gerekli:** Hayır

**İstek (Request) Örneği:**

```json
{
  "username": "ahmetyazar",
  "email": "ahmet@example.com",
  "password": "guvenli_sifre123",
  "passwordConfirm": "guvenli_sifre123"
}
```

**Başarılı Yanıt (200 OK):**

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

**Hata Yanıtı (400 Bad Request):**

```json
{
  "error": "Bu e-posta adresi zaten kullanılıyor"
}
```

### Kullanıcı Girişi

Mevcut bir kullanıcı hesabına giriş yapar.

**URL:** `POST /auth/login`

**Kimlik Doğrulama Gerekli:** Hayır

**İstek (Request) Örneği:**

```json
{
  "email": "ahmet@example.com",
  "password": "guvenli_sifre123"
}
```

**Başarılı Yanıt (200 OK):**

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

**Hata Yanıtı (401 Unauthorized):**

```json
{
  "error": "Geçersiz e-posta veya şifre"
}
```

### Mevcut Kullanıcı Bilgilerini Getir

Giriş yapmış kullanıcının bilgilerini getirir.

**URL:** `GET /auth/me`

**Kimlik Doğrulama Gerekli:** Evet

**Başarılı Yanıt (200 OK):**

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

**Hata Yanıtı (401 Unauthorized):**

```json
{
  "error": "Kimlik doğrulama gerekli"
}
```

### Kullanıcı Profilini Güncelle

Giriş yapmış kullanıcının profil bilgilerini günceller.

**URL:** `PATCH /users/{id}`

**Kimlik Doğrulama Gerekli:** Evet

**İstek (Request) Örneği:**

```json
{
  "bio": "Hikaye yazmayı seven bir yazılım geliştiricisi",
  "avatar": "/avatars/ahmet.jpg"
}
```

**Başarılı Yanıt (200 OK):**

```json
{
  "id": 1,
  "username": "ahmetyazar",
  "email": "ahmet@example.com",
  "avatar": "/avatars/ahmet.jpg",
  "bio": "Hikaye yazmayı seven bir yazılım geliştiricisi",
  "role": "user",
  "points": 0,
  "createdAt": "2023-03-01T12:00:00Z",
  "updatedAt": "2023-03-10T15:30:00Z"
}
```

**Hata Yanıtı (403 Forbidden):**

```json
{
  "error": "Bu kullanıcıyı güncelleme yetkiniz yok"
}
```

## Hikaye İşlemleri

### Tüm Hikayeleri Listele

Platformdaki tüm hikayeleri listeler.

**URL:** `GET /stories`

**Kimlik Doğrulama Gerekli:** Hayır

**Sorgu Parametreleri:**

- `status` (isteğe bağlı): Hikayeleri duruma göre filtrele (active, completed, archived)
- `limit` (isteğe bağlı): Sayfa başına hikaye sayısı (varsayılan: 10)
- `page` (isteğe bağlı): Sayfa numarası (varsayılan: 1)

**Başarılı Yanıt (200 OK):**

```json
{
  "stories": [
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
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "pages": 2
  }
}
```

### Belirli Bir Hikayeyi Getir

ID'si belirtilen hikayenin detaylarını getirir.

**URL:** `GET /stories/{id}`

**Kimlik Doğrulama Gerekli:** Hayır

**Başarılı Yanıt (200 OK):**

```json
{
  "id": 1,
  "title": "Gizemli Orman",
  "description": "Küçük bir kasabanın yakınındaki ormanda garip olaylar yaşanmaya başlar. Kasabalılar, ormanda kaybolan insanların hikayelerini anlatırken, genç bir gazeteci gerçeği ortaya çıkarmak için ormana girer.",
  "coverImage": "/stories/forest.jpg",
  "status": "active",
  "author": "ahmetyazar",
  "authorId": 1,
  "createdAt": "2023-02-15T10:30:00Z",
  "updatedAt": "2023-02-15T10:30:00Z"
}
```

**Hata Yanıtı (404 Not Found):**

```json
{
  "error": "Hikaye bulunamadı"
}
```

### Yeni Hikaye Oluştur

Yeni bir hikaye oluşturur.

**URL:** `POST /stories`

**Kimlik Doğrulama Gerekli:** Evet

**İstek (Request) Örneği:**

```json
{
  "title": "Uzay Yolculuğu",
  "description": "İnsanlığın ilk uzun mesafe uzay yolculuğuna çıkan bir ekibin başından geçen olaylar.",
  "coverImage": "/stories/space.jpg"
}
```

**Başarılı Yanıt (201 Created):**

```json
{
  "id": 3,
  "title": "Uzay Yolculuğu",
  "description": "İnsanlığın ilk uzun mesafe uzay yolculuğuna çıkan bir ekibin başından geçen olaylar.",
  "coverImage": "/stories/space.jpg",
  "status": "active",
  "author": "ahmetyazar",
  "authorId": 1,
  "createdAt": "2023-03-25T09:45:00Z",
  "updatedAt": "2023-03-25T09:45:00Z"
}
```

**Hata Yanıtı (400 Bad Request):**

```json
{
  "error": "Başlık alanı zorunludur"
}
```

### Hikaye Güncelle

Mevcut bir hikayeyi günceller.

**URL:** `PATCH /stories/{id}`

**Kimlik Doğrulama Gerekli:** Evet

**İstek (Request) Örneği:**

```json
{
  "title": "Uzay Yolculuğu: Yeni Gezegenler",
  "description": "İnsanlığın ilk uzun mesafe uzay yolculuğuna çıkan bir ekibin başından geçen olaylar ve keşfettikleri yeni gezegenler.",
  "status": "completed"
}
```

**Başarılı Yanıt (200 OK):**

```json
{
  "id": 3,
  "title": "Uzay Yolculuğu: Yeni Gezegenler",
  "description": "İnsanlığın ilk uzun mesafe uzay yolculuğuna çıkan bir ekibin başından geçen olaylar ve keşfettikleri yeni gezegenler.",
  "coverImage": "/stories/space.jpg",
  "status": "completed",
  "author": "ahmetyazar",
  "authorId": 1,
  "createdAt": "2023-03-25T09:45:00Z",
  "updatedAt": "2023-04-10T11:20:00Z"
}
```

**Hata Yanıtı (403 Forbidden):**

```json
{
  "error": "Bu hikayeyi güncelleme yetkiniz yok"
}
```

### Hikaye Sil

Mevcut bir hikayeyi siler.

**URL:** `DELETE /stories/{id}`

**Kimlik Doğrulama Gerekli:** Evet

**Başarılı Yanıt (200 OK):**

```json
{
  "message": "Hikaye başarıyla silindi",
  "id": 3
}
```

**Hata Yanıtı (403 Forbidden):**

```json
{
  "error": "Bu hikayeyi silme yetkiniz yok"
}
```

## Bölüm İşlemleri

### Hikayeye Ait Bölümleri Getir

Belirli bir hikayeye ait tüm bölümleri listeler.

**URL:** `GET /stories/{storyId}/chapters`

**Kimlik Doğrulama Gerekli:** Hayır

**Başarılı Yanıt (200 OK):**

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

### Belirli Bir Bölümü Getir

ID'si belirtilen bölümün detaylarını getirir.

**URL:** `GET /chapters/{id}`

**Kimlik Doğrulama Gerekli:** Hayır

**Başarılı Yanıt (200 OK):**

```json
{
  "id": 1,
  "storyId": 1,
  "title": "Kayıp İnsanlar",
  "content": "<p>Kasabada son aylarda artan kayıp vakalarının ardındaki gizem. Gazeteci Ayşe, bu olayları araştırmak için kasabaya gelir.</p><p>Kasabalılar, ormanda kaybolan insanların hikayelerini anlatırken, Ayşe notlar alır ve ipuçlarını birleştirmeye çalışır.</p>",
  "author": "ahmetyazar",
  "authorId": 1,
  "publishedAt": "2023-02-20T14:30:00Z",
  "readTime": 8,
  "hasOptions": true,
  "votingDeadline": "2023-03-01T23:59:59Z"
}
```

**Hata Yanıtı (404 Not Found):**

```json
{
  "error": "Bölüm bulunamadı"
}
```

### Yeni Bölüm Oluştur

Belirli bir hikayeye yeni bir bölüm ekler.

**URL:** `POST /stories/{storyId}/chapters`

**Kimlik Doğrulama Gerekli:** Evet

**İstek (Request) Örneği:**

```json
{
  "title": "Karanlık Kulübe",
  "content": "<p>Ormanın derinliklerinde bulunan eski bir kulübe, kayıp insanların sırrını barındırıyor olabilir mi?</p><p>Ayşe, kulübeye yaklaştıkça, içeriden hafif bir ışık sızdığını fark etti...</p>",
  "parentChapterId": 2,
  "readTime": 12,
  "hasOptions": true,
  "options": [
    {
      "title": "Kaçmaya Çalış",
      "description": "Ayşe, tehlikede olduğunu hissederek hızla kulübeden kaçmaya çalışır."
    },
    {
      "title": "Yaşlı Kişiyle Konuş",
      "description": "Ayşe, sakin kalmaya çalışarak yaşlı kişiyle konuşmaya karar verir ve kayıp insanları sorar."
    },
    {
      "title": "Kitabı Al ve Kaç",
      "description": "Ayşe, kitabı alıp hızla kulübeden kaçmaya çalışır, belki kitap kayıp insanların sırrını barındırıyordur."
    }
  ],
  "votingDeadline": "2023-04-01T23:59:59Z"
}
```

**Başarılı Yanıt (201 Created):**

```json
{
  "id": 3,
  "storyId": 1,
  "title": "Karanlık Kulübe",
  "content": "<p>Ormanın derinliklerinde bulunan eski bir kulübe, kayıp insanların sırrını barındırıyor olabilir mi?</p><p>Ayşe, kulübeye yaklaştıkça, içeriden hafif bir ışık sızdığını fark etti...</p>",
  "parentChapterId": 2,
  "author": "ahmetyazar",
  "authorId": 1,
  "publishedAt": "2023-03-18T16:45:00Z",
  "readTime": 12,
  "hasOptions": true,
  "votingDeadline": "2023-04-01T23:59:59Z",
  "options": [
    {
      "id": 1,
      "title": "Kaçmaya Çalış",
      "description": "Ayşe, tehlikede olduğunu hissederek hızla kulübeden kaçmaya çalışır."
    },
    {
      "id": 2,
      "title": "Yaşlı Kişiyle Konuş",
      "description": "Ayşe, sakin kalmaya çalışarak yaşlı kişiyle konuşmaya karar verir ve kayıp insanları sorar."
    },
    {
      "id": 3,
      "title": "Kitabı Al ve Kaç",
      "description": "Ayşe, kitabı alıp hızla kulübeden kaçmaya çalışır, belki kitap kayıp insanların sırrını barındırıyordur."
    }
  ]
}
```

## Seçenek ve Oy İşlemleri

### Bölüme Ait Seçenekleri Getir

Belirli bir bölüme ait tüm seçenekleri listeler.

**URL:** `GET /chapters/{chapterId}/options`

**Kimlik Doğrulama Gerekli:** Hayır

**Başarılı Yanıt (200 OK):**

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
  },
  {
    "id": 3,
    "title": "Kitabı Al ve Kaç",
    "description": "Ayşe, kitabı alıp hızla kulübeden kaçmaya çalışır, belki kitap kayıp insanların sırrını barındırıyordur.",
    "votes": 18
  }
]
```

### Seçeneğe Oy Ver

Belirli bir seçeneğe oy verir.

**URL:** `POST /options/{optionId}/vote`

**Kimlik Doğrulama Gerekli:** Evet

**Başarılı Yanıt (200 OK):**

```json
{
  "message": "Oy başarıyla kaydedildi",
  "optionId": 2,
  "userId": 1
}
```

**Hata Yanıtı (400 Bad Request):**

```json
{
  "error": "Bu seçenek için zaten oy kullanmışsınız"
}
```

### Bölüme Ait Oy Dağılımını Getir

Belirli bir bölüme ait oy dağılımını getirir.

**URL:** `GET /chapters/{chapterId}/votes`

**Kimlik Doğrulama Gerekli:** Hayır

**Başarılı Yanıt (200 OK):**

```json
{
  "totalVotes": 84,
  "options": [
    {
      "id": 1,
      "title": "Kaçmaya Çalış",
      "votes": 24,
      "percentage": 28.57
    },
    {
      "id": 2,
      "title": "Yaşlı Kişiyle Konuş",
      "votes": 42,
      "percentage": 50.00
    },
    {
      "id": 3,
      "title": "Kitabı Al ve Kaç",
      "votes": 18,
      "percentage": 21.43
    }
  ]
}
```

## Yorum İşlemleri

### Bölüme Ait Yorumları Getir

Belirli bir bölüme ait tüm yorumları listeler.

**URL:** `GET /chapters/{chapterId}/comments`

**Kimlik Doğrulama Gerekli:** Hayır

**Başarılı Yanıt (200 OK):**

```json
[
  {
    "id": 1,
    "username": "OkuyucuEla",
    "userAvatar": "/avatars/ela.jpg",
    "content": "Bu bölüm gerçekten gerilim doluydu! Yaşlı kişinin kim olduğunu çok merak ediyorum.",
    "createdAt": "2023-03-19T10:15:00Z"
  },
  {
    "id": 2,
    "username": "MaceraciCan",
    "userAvatar": "/avatars/can.jpg",
    "content": "Bence Ayşe kitabı alıp kaçmalı, o kitapta kesinlikle önemli bilgiler var.",
    "createdAt": "2023-03-19T14:30:00Z"
  }
]
```

### Yorum Ekle

Belirli bir bölüme yorum ekler.

**URL:** `POST /chapters/{chapterId}/comments`

**Kimlik Doğrulama Gerekli:** Evet

**İstek (Request) Örneği:**

```json
{
  "content": "Atmosfer çok iyi kurulmuş, ormanın derinliklerindeki o tekinsiz hissi gerçekten yaşadım okurken."
}
```

**Başarılı Yanıt (201 Created):**

```json
{
  "id": 3,
  "username": "EdebiyatSever",
  "userAvatar": null,
  "content": "Atmosfer çok iyi kurulmuş, ormanın derinliklerindeki o tekinsiz hissi gerçekten yaşadım okurken.",
  "createdAt": "2023-03-20T09:45:00Z"
}
```

## Rozet İşlemleri

### Kullanıcının Rozetlerini Getir

Belirli bir kullanıcının kazandığı rozetleri listeler.

**URL:** `GET /users/{userId}/badges`

**Kimlik Doğrulama Gerekli:** Hayır

**Başarılı Yanıt (200 OK):**

```json
[
  {
    "id": 1,
    "name": "Hikaye Anlatıcısı",
    "description": "İlk hikayenizi oluşturdunuz",
    "image": "/badges/storyteller.png",
    "points": 10,
    "awardedAt": "2023-03-01T15:30:00Z"
  },
  {
    "id": 2,
    "name": "Aktif Katılımcı",
    "description": "10 bölüme oy verdiniz",
    "image": "/badges/voter.png",
    "points": 20,
    "awardedAt": "2023-03-15T09:45:00Z"
  }
]
```

## Etkinlik İşlemleri

### Yaklaşan Etkinlikleri Listele

Yaklaşan etkinlikleri listeler.

**URL:** `GET /events`

**Kimlik Doğrulama Gerekli:** Hayır

**Başarılı Yanıt (200 OK):**

```json
[
  {
    "id": 1,
    "title": "Yeni Bölüm: Karanlık Orman",
    "description": "Gizemli Orman hikayesinin yeni bölümü yayınlanacak",
    "type": "chapter_release",
    "relatedId": 4,
    "scheduledAt": "2023-04-15T12:00:00Z",
    "status": "pending"
  },
  {
    "id": 2,
    "title": "Hikaye Yarışması",
    "description": "En iyi hikaye önerisi için yarışma başlıyor",
    "type": "contest",
    "scheduledAt": "2023-05-01T09:00:00Z",
    "status": "pending"
  }
]
```

## Bildirim İşlemleri

### Kullanıcı Bildirimlerini Getir

Giriş yapmış kullanıcının bildirimlerini listeler.

**URL:** `GET /notifications`

**Kimlik Doğrulama Gerekli:** Evet

**Başarılı Yanıt (200 OK):**

```json
[
  {
    "id": 1,
    "title": "Yeni Bölüm Yayınlandı",
    "content": "Takip ettiğiniz 'Gizemli Orman' hikayesine yeni bir bölüm eklendi.",
    "type": "new_chapter",
    "relatedId": 3,
    "isRead": false,
    "createdAt": "2023-03-18T16:45:00Z"
  },
  {
    "id": 2,
    "title": "Rozet Kazandınız",
    "content": "'Aktif Katılımcı' rozetini kazandınız. Tebrikler!",
    "type": "badge_earned",
    "relatedId": 2,
    "isRead": true,
    "createdAt": "2023-03-15T09:45:00Z"
  }
]
```

### Bildirimi Okundu Olarak İşaretle

Belirli bir bildirimi okundu olarak işaretler.

**URL:** `PUT /notifications/{id}/read`

**Kimlik Doğrulama Gerekli:** Evet

**Başarılı Yanıt (200 OK):**

```json
{
  "message": "Bildirim okundu olarak işaretlendi",
  "id": 1
}
```

### Tüm Bildirimleri Okundu Olarak İşaretle

Kullanıcının tüm bildirimlerini okundu olarak işaretler.

**URL:** `PUT /notifications/read-all`

**Kimlik Doğrulama Gerekli:** Evet

**Başarılı Yanıt (200 OK):**

```json
{
  "message": "Tüm bildirimler okundu olarak işaretlendi",
  "count": 3
}
```

## Hata Kodları

- `400 Bad Request`: İstek formatı hatalı veya eksik
- `401 Unauthorized`: Kimlik doğrulama gerekli veya geçersiz
- `403 Forbidden`: Yetkilendirme hatası
- `404 Not Found`: İstenen kaynak bulunamadı
- `409 Conflict`: Kaynak çakışması (örn. aynı e-posta ile kayıt)
- `500 Internal Server Error`: Sunucu hatası 