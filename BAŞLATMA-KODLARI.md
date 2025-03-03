# Kolektif Yaratıcı Hikaye Platformu Başlatma Kodları

Bu dosya, projeyi başlatmak için gerekli komutları içerir.

## Backend (Next.js) Başlatma

Backend API'yi başlatmak için aşağıdaki komutu kullanın:

```bash
# Proje ana dizininde
npm run dev
```

Bu komut, Next.js API'yi geliştirme modunda başlatacaktır. Varsayılan olarak http://localhost:3000 adresinde çalışır, ancak bu port kullanımdaysa otomatik olarak başka bir port seçilir (örneğin 3001, 3002, vb.).

## Frontend (Vue.js) Başlatma

Frontend uygulamasını başlatmak için aşağıdaki komutu kullanın:

```bash
# client dizininde
cd client && npm run dev
```

Bu komut, Vue.js uygulamasını geliştirme modunda başlatacaktır. Varsayılan olarak http://localhost:5173 adresinde çalışır, ancak bu port kullanımdaysa otomatik olarak başka bir port seçilir (örneğin 5174, 5175, vb.).

## Her İkisini Birden Başlatma

Hem backend hem de frontend'i aynı anda başlatmak için iki ayrı terminal penceresi kullanabilirsiniz:

**Terminal 1:**
```bash
# Proje ana dizininde
npm run dev
```

**Terminal 2:**
```bash
# Proje ana dizininde
cd client && npm run dev
```

## Olası Hatalar ve Çözümleri

### jose Modülü Hatası

Eğer aşağıdaki gibi bir hata alırsanız:

```
Module not found: Can't resolve 'jose'
```

Bu, JWT işlemleri için gerekli olan `jose` modülünün eksik olduğunu gösterir. Yüklemek için:

```bash
# Proje ana dizininde
npm install jose
```

### PostCSS Yapılandırma Hatası

Eğer frontend başlatılırken PostCSS ile ilgili bir hata alırsanız:

```
Error: Invalid PostCSS Plugin found at: plugins[0]
```

Bu durumda, client dizininde doğru bir PostCSS yapılandırma dosyası oluşturun:

```bash
# client dizininde
cd client
```

Ardından `postcss.config.cjs` dosyasını aşağıdaki içerikle oluşturun:

```javascript
module.exports = {
  plugins: {
    autoprefixer: {}
  }
}
```

Ve gerekli bağımlılığı yükleyin:

```bash
npm install autoprefixer
```

## Erişim Bilgileri

Uygulamalar başarıyla başlatıldığında:

- **Backend API:** http://localhost:3000 (veya alternatif port)
- **Frontend:** http://localhost:5173 (veya alternatif port)

## Örnek API Endpoint'leri

- Hikayeleri Listele: `GET /api/stories`
- Hikaye Detayı: `GET /api/stories/{id}`
- Kullanıcı Girişi: `POST /api/auth/login`
- Kullanıcı Kaydı: `POST /api/users`
- Kullanıcı Bilgileri: `GET /api/auth/me` 