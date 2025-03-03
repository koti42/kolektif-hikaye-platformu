# Kolektif Yaratıcı Hikaye Platformu Kurulum Kılavuzu

Bu kılavuz, Kolektif Yaratıcı Hikaye Platformu'nun yerel geliştirme ortamında kurulumu ve çalıştırılması için adımları içermektedir.

## Gereksinimler

### Backend (Next.js) için:
- Node.js (v14.0.0 veya üzeri)
- npm (v6.0.0 veya üzeri)
- MySQL veya PostgreSQL veritabanı

### Admin Panel (PHP Filament) için:
- PHP (v7.4 veya üzeri)
- Composer
- Laravel (v8.0 veya üzeri)

### Frontend (Vue.js) için:
- Node.js (v14.0.0 veya üzeri)
- npm (v6.0.0 veya üzeri)

## Kurulum Adımları

### 1. Projeyi Klonlama

```bash
# Projeyi klonlayın
git clone https://github.com/kullanici/story-time.git

# Proje dizinine gidin
cd story-time
```

### 2. Backend (Next.js) Kurulumu

```bash
# Backend dizinine gidin
cd server

# Bağımlılıkları yükleyin
npm install

# .env.example dosyasını .env olarak kopyalayın
cp .env.example .env

# .env dosyasını düzenleyin ve veritabanı bağlantı bilgilerinizi girin
# DATABASE_URL=mysql://kullanici:sifre@localhost:3306/story_platform

# Veritabanı tablolarını oluşturun
npx prisma migrate dev

# Örnek verileri yükleyin (opsiyonel)
npx prisma db seed

# Geliştirme sunucusunu başlatın
npm run dev
```

Backend sunucusu varsayılan olarak http://localhost:3000 adresinde çalışacaktır.

### 3. Admin Panel (PHP Filament) Kurulumu

```bash
# Admin panel dizinine gidin
cd admin

# Composer bağımlılıklarını yükleyin
composer install

# .env.example dosyasını .env olarak kopyalayın
cp .env.example .env

# Uygulama anahtarını oluşturun
php artisan key:generate

# .env dosyasını düzenleyin ve veritabanı bağlantı bilgilerinizi girin
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=story_platform
# DB_USERNAME=kullanici
# DB_PASSWORD=sifre

# Veritabanı tablolarını oluşturun
php artisan migrate

# Örnek verileri yükleyin (opsiyonel)
php artisan db:seed

# Admin kullanıcısı oluşturun
php artisan make:filament-user

# Geliştirme sunucusunu başlatın
php artisan serve
```

Admin panel sunucusu varsayılan olarak http://localhost:8000 adresinde çalışacaktır.

### 4. Frontend (Vue.js) Kurulumu

```bash
# Frontend dizinine gidin
cd client

# Bağımlılıkları yükleyin
npm install

# .env.example dosyasını .env olarak kopyalayın
cp .env.example .env

# .env dosyasını düzenleyin ve API URL'sini ayarlayın
# VITE_API_URL=http://localhost:3000/api

# Geliştirme sunucusunu başlatın
npm run dev
```

Frontend sunucusu varsayılan olarak http://localhost:5173 adresinde çalışacaktır.

## Docker ile Kurulum (Opsiyonel)

Eğer Docker kullanmak isterseniz, projenin kök dizininde bulunan `docker-compose.yml` dosyasını kullanabilirsiniz:

```bash
# Docker container'larını oluşturun ve başlatın
docker-compose up -d

# Veritabanı tablolarını oluşturun
docker-compose exec backend npx prisma migrate dev

# Örnek verileri yükleyin (opsiyonel)
docker-compose exec backend npx prisma db seed

# Admin kullanıcısı oluşturun
docker-compose exec admin php artisan make:filament-user
```

Docker ile kurulumda, servislere aşağıdaki adreslerden erişebilirsiniz:
- Backend API: http://localhost:3000
- Admin Panel: http://localhost:8000
- Frontend: http://localhost:8080

## Sorun Giderme

### Veritabanı Bağlantı Hatası

Eğer veritabanı bağlantı hatası alıyorsanız:
1. Veritabanı servisinin çalıştığından emin olun
2. `.env` dosyasındaki veritabanı bağlantı bilgilerinin doğru olduğunu kontrol edin
3. Veritabanının oluşturulduğundan emin olun

```bash
# MySQL için veritabanı oluşturma
mysql -u root -p
CREATE DATABASE story_platform;
GRANT ALL PRIVILEGES ON story_platform.* TO 'kullanici'@'localhost' IDENTIFIED BY 'sifre';
FLUSH PRIVILEGES;
EXIT;
```

### CORS Hatası

Eğer API isteklerinde CORS hatası alıyorsanız:
1. Backend `.env` dosyasında `CORS_ORIGIN` değişkeninin frontend URL'sini içerdiğinden emin olun
2. Frontend `.env` dosyasında `VITE_API_URL` değişkeninin doğru backend URL'sini içerdiğinden emin olun

### Port Çakışması

Eğer belirtilen portlar başka uygulamalar tarafından kullanılıyorsa:
1. Backend için: `server/package.json` dosyasında `dev` script'ini düzenleyin ve farklı bir port belirtin
2. Admin Panel için: `php artisan serve --port=8001` komutu ile farklı bir port belirtin
3. Frontend için: `client/.env` dosyasında `VITE_PORT=5174` ekleyerek farklı bir port belirtin

## Canlı Ortama Dağıtım

Canlı ortama dağıtım için aşağıdaki adımları izleyebilirsiniz:

### Backend (Next.js)

```bash
# Üretim için build alın
cd server
npm run build

# Uygulamayı başlatın
npm start
```

### Admin Panel (PHP Filament)

```bash
# Üretim için optimize edin
cd admin
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Frontend (Vue.js)

```bash
# Üretim için build alın
cd client
npm run build
```

Oluşturulan `dist` klasörünü bir web sunucusuna (Nginx, Apache vb.) dağıtabilirsiniz.

## Yardım ve Destek

Kurulum veya kullanım sırasında herhangi bir sorunla karşılaşırsanız, lütfen GitHub üzerinden bir issue açın veya proje ekibiyle iletişime geçin. 