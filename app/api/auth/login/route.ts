import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Gerekli alanları kontrol et
    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-posta ve şifre zorunludur' },
        { status: 400 }
      );
    }

    // Kullanıcıyı e-posta ile bul
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Kullanıcı bulunamadıysa
    if (!user) {
      return NextResponse.json(
        { error: 'Geçersiz e-posta veya şifre' },
        { status: 401 }
      );
    }

    // Şifre karşılaştırma (gerçek uygulamada bcrypt.compare kullanılır)
    // Not: Bu örnekte şifreleri düz metin olarak sakladığımız için doğrudan karşılaştırma yapıyoruz
    // Gerçek uygulamada aşağıdaki satır yerine şunu kullanmalısınız:
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    const isPasswordValid = password === user.password;

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Geçersiz e-posta veya şifre' },
        { status: 401 }
      );
    }

    // JWT oluştur
    const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Kullanıcı bilgilerini döndür (şifre hariç)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: 'Giriş başarılı',
      user: userWithoutPassword,
      token
    }, { status: 200 });
  } catch (error) {
    console.error('Giriş yapılırken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Giriş yapılırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 