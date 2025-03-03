import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
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

// Kimlik doğrulama gerektiren yollar
const authRoutes = [
  '/api/stories/create',
  '/api/chapters/create',
  '/api/options/create',
  '/api/votes',
  '/api/user/profile',
];

// Kimlik doğrulama gerektiren API route kontrol fonksiyonu
const isAuthRequiredRoute = (path: string) => {
  return authRoutes.some((route) => path.startsWith(route));
};

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Sadece API isteklerini ele al ve auth gerektiren rotaları kontrol et
  if (path.startsWith('/api/') && isAuthRequiredRoute(path)) {
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
    
    // Token geçerli ise isteği devam ettir
    return NextResponse.next();
  }
  
  // Diğer tüm rotalar için normal akışa devam et
  return NextResponse.next();
}

// Middleware'i çalıştıracak yolları belirt
export const config = {
  matcher: [
    '/api/:path*',
  ],
}; 