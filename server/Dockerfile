FROM node:18-alpine

WORKDIR /app

# Bağımlılıkları kopyala ve yükle
COPY package.json package-lock.json* ./
RUN npm ci

# Kaynak kodları kopyala
COPY . .

# Geliştirme ortamı için
ENV NODE_ENV development

# Prisma istemcisini oluştur
RUN npx prisma generate

# Uygulamayı derle
RUN npm run build

# Uygulamayı çalıştır
EXPOSE 3000
CMD ["npm", "run", "dev"] 