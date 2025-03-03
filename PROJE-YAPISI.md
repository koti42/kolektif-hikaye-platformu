# Kolektif Yaratıcı Hikaye Platformu - Proje Yapısı

Bu belge, Kolektif Yaratıcı Hikaye Platformu'nun dosya ve dizin yapısını açıklamaktadır.

## Kök Dizin

```
story-time/
├── .git/                  # Git deposu
├── .next/                 # Next.js derleme çıktıları
├── admin/                 # PHP Filament Admin Paneli
├── app/                   # Next.js uygulama dizini
├── client/                # Vue.js Frontend
├── lib/                   # Next.js yardımcı kütüphaneler
├── node_modules/          # Node.js bağımlılıkları
├── prisma/                # Prisma ORM şemaları ve migration'lar
├── public/                # Statik dosyalar
├── server/                # Next.js API sunucusu
├── src/                   # Kaynak kodlar
├── .env                   # Ortam değişkenleri
├── .gitignore             # Git tarafından yok sayılacak dosyalar
├── API-README.md          # API dokümantasyonu
├── CONTRIBUTING.md        # Katkıda bulunma kılavuzu
├── docker-compose.yml     # Docker Compose yapılandırması
├── eslint.config.mjs      # ESLint yapılandırması
├── KURULUM.md             # Kurulum kılavuzu
├── LICENSE                # MIT lisansı
├── middleware.ts          # Next.js middleware
├── next-env.d.ts          # Next.js tip tanımlamaları
├── next.config.ts         # Next.js yapılandırması
├── package-lock.json      # NPM bağımlılık kilitleri
├── package.json           # NPM paket yapılandırması
├── postcss.config.mjs     # PostCSS yapılandırması
├── README.md              # Proje açıklaması
└── tsconfig.json          # TypeScript yapılandırması
```

## Admin Paneli (PHP Filament)

```
admin/
├── .env.example           # Örnek ortam değişkenleri
├── apache.conf            # Apache web sunucusu yapılandırması
└── Dockerfile             # Docker yapılandırması
```

## Frontend (Vue.js)

```
client/
├── node_modules/          # Node.js bağımlılıkları
├── public/                # Statik dosyalar
├── src/                   # Kaynak kodlar
│   ├── assets/            # Resimler, fontlar, vb.
│   ├── components/        # Yeniden kullanılabilir Vue bileşenleri
│   ├── router/            # Vue Router yapılandırması
│   ├── services/          # API servisleri
│   ├── stores/            # Pinia/Vuex durum yönetimi
│   ├── types/             # TypeScript tip tanımlamaları
│   ├── utils/             # Yardımcı fonksiyonlar
│   ├── views/             # Sayfa bileşenleri
│   │   ├── ChapterDetail.vue  # Bölüm detay sayfası
│   │   ├── Home.vue           # Ana sayfa
│   │   ├── Login.vue          # Giriş sayfası
│   │   ├── NotFound.vue       # 404 sayfası
│   │   ├── Profile.vue        # Profil sayfası
│   │   ├── Register.vue       # Kayıt sayfası
│   │   ├── Stories.vue        # Hikayeler listesi sayfası
│   │   └── StoryDetail.vue    # Hikaye detay sayfası
│   ├── App.vue            # Ana Vue bileşeni
│   └── main.ts            # Vue uygulaması başlangıç noktası
├── .env.example           # Örnek ortam değişkenleri
├── Dockerfile             # Docker yapılandırması
├── index.html             # HTML şablonu
├── nginx.conf             # Nginx web sunucusu yapılandırması
├── package-lock.json      # NPM bağımlılık kilitleri
├── package.json           # NPM paket yapılandırması
├── tsconfig.json          # TypeScript yapılandırması
├── tsconfig.node.json     # Node.js için TypeScript yapılandırması
└── vite.config.ts         # Vite yapılandırması
```

## Backend API (Next.js)

```
server/
├── .env.example           # Örnek ortam değişkenleri
└── Dockerfile             # Docker yapılandırması
```

## Docker Yapılandırması

Proje, Docker ile çalıştırılabilir. `docker-compose.yml` dosyası aşağıdaki servisleri içerir:

- **db**: MySQL veritabanı
- **redis**: Redis önbellek
- **backend**: Next.js API sunucusu
- **admin**: PHP Filament Admin Paneli
- **frontend**: Vue.js Frontend

## Dokümantasyon

Proje, aşağıdaki dokümantasyon dosyalarını içerir:

- **README.md**: Proje açıklaması, özellikleri ve genel bilgiler
- **API-README.md**: API endpoint'leri ve kullanım örnekleri
- **KURULUM.md**: Kurulum ve çalıştırma adımları
- **CONTRIBUTING.md**: Katkıda bulunma kılavuzu
- **LICENSE**: MIT lisansı
- **PROJE-YAPISI.md**: Bu dosya, proje yapısını açıklar 