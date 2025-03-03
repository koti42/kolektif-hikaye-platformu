import { PrismaClient } from '@prisma/client';

// PrismaClient global nesnesini tanımla
declare global {
  var prisma: PrismaClient | undefined;
}

// PrismaClient'ın tek bir örneğini oluştur
const prisma = global.prisma || new PrismaClient();

// Geliştirme ortamında global nesneye ata (hot reloading sırasında yeni bağlantılar oluşturmamak için)
if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;
}

export default prisma; 