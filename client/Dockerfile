# Derleme aşaması
FROM node:18-alpine as build

WORKDIR /app

# Bağımlılıkları kopyala ve yükle
COPY package.json package-lock.json* ./
RUN npm ci

# Kaynak kodları kopyala
COPY . .

# Uygulamayı derle
RUN npm run build

# Çalıştırma aşaması
FROM nginx:alpine

# Nginx yapılandırmasını kopyala
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Derlenen dosyaları Nginx'e kopyala
COPY --from=build /app/dist /usr/share/nginx/html

# 80 portunu dışarı aç
EXPOSE 80

# Nginx'i başlat
CMD ["nginx", "-g", "daemon off;"] 