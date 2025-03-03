FROM php:8.1-apache

# Sistem bağımlılıklarını yükle
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev

# PHP eklentilerini yükle
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Composer'ı yükle
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Apache yapılandırması
RUN a2enmod rewrite
COPY ./apache.conf /etc/apache2/sites-available/000-default.conf

# Çalışma dizinini ayarla
WORKDIR /var/www/html

# Uygulama dosyalarını kopyala
COPY . /var/www/html/

# Composer bağımlılıklarını yükle
RUN composer install --no-interaction --no-dev --optimize-autoloader

# Dosya izinlerini ayarla
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage /var/www/html/bootstrap/cache

# Uygulamayı başlat
EXPOSE 80
CMD ["apache2-foreground"] 