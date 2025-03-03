import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

// GET: Tüm kullanıcıları listele
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        role: true,
        points: true,
        createdAt: true,
        // Hassas bilgileri (şifre gibi) gönderme
        password: false,
      },
    });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Kullanıcılar alınırken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Kullanıcılar alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST: Yeni kullanıcı oluştur
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    // Gerekli alanları kontrol et
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Kullanıcı adı, e-posta ve şifre zorunludur' },
        { status: 400 }
      );
    }

    // E-posta ve kullanıcı adı benzersiz olmalı
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu e-posta veya kullanıcı adı zaten kullanılıyor' },
        { status: 409 }
      );
    }

    // Gerçek bir uygulamada şifreyi hashlemek için bcrypt kullanılmalıdır
    // Bu örnekte basitlik için açık metin kullanıyoruz
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password, // Gerçek uygulamada: await bcrypt.hash(password, 10)
        role: 'user',
      },
    });

    // Şifreyi yanıtta gönderme
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      { message: 'Kullanıcı başarıyla oluşturuldu', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error('Kullanıcı oluşturulurken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Kullanıcı oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
} 