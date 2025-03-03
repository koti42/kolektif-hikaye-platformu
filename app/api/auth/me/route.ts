import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// JWT tokenını doğrulama
const verifyJWT = async (token: string) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    return payload;
  } catch (error) {
    return null;
  }
};

export async function GET(request: Request) {
  try {
    // Authorization header'ından token al
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Kimlik doğrulama gerekli' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    const payload = await verifyJWT(token);
    
    // Token geçersizse
    if (!payload) {
      return NextResponse.json(
        { error: 'Geçersiz veya süresi dolmuş token' },
        { status: 401 }
      );
    }
    
    // Gerçek uygulamada veritabanından kullanıcı bilgilerini alırdık
    // Şimdilik örnek veri döndürüyoruz
    const user = {
      id: payload.sub,
      username: payload.username,
      email: payload.email,
      avatar: '/default-avatar.png',
      bio: payload.bio || 'Henüz bir biyografi eklenmemiş.',
      role: payload.role || 'user',
      points: payload.points || 0,
      createdAt: payload.createdAt || new Date().toISOString()
    };
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Kullanıcı bilgileri alınırken hata:', error);
    return NextResponse.json(
      { error: 'Kullanıcı bilgileri alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 