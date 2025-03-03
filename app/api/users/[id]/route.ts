import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

// Belirli bir kullanıcıyı getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Geçersiz kullanıcı ID formatı' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        role: true,
        points: true,
        createdAt: true,
        // Hassas bilgileri gönderme
        password: false,
        // İlişkili verileri de al
        createdStories: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        userBadges: {
          include: {
            badge: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Kullanıcı alınırken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Kullanıcı alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Kullanıcıyı güncelle
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Geçersiz kullanıcı ID formatı' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { username, email, avatar, bio } = body;
    
    // Kullanıcının varlığını kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }
    
    // Eğer username değişiyorsa, benzersiz olup olmadığını kontrol et
    if (username && username !== existingUser.username) {
      const usernameExists = await prisma.user.findFirst({
        where: { username },
      });
      
      if (usernameExists) {
        return NextResponse.json(
          { error: 'Bu kullanıcı adı zaten kullanılıyor' },
          { status: 409 }
        );
      }
    }
    
    // Eğer email değişiyorsa, benzersiz olup olmadığını kontrol et
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findFirst({
        where: { email },
      });
      
      if (emailExists) {
        return NextResponse.json(
          { error: 'Bu e-posta adresi zaten kullanılıyor' },
          { status: 409 }
        );
      }
    }

    // Güncelleme işlemini yap
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(username && { username }),
        ...(email && { email }),
        ...(avatar !== undefined && { avatar }),
        ...(bio !== undefined && { bio }),
      },
    });

    // Şifreyi yanıtta gönderme
    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(
      { message: 'Kullanıcı başarıyla güncellendi', user: userWithoutPassword },
      { status: 200 }
    );
  } catch (error) {
    console.error('Kullanıcı güncellenirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Kullanıcı güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Kullanıcıyı sil
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Geçersiz kullanıcı ID formatı' },
        { status: 400 }
      );
    }

    // Kullanıcının varlığını kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Kullanıcıyı sil
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Kullanıcı başarıyla silindi' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Kullanıcı silinirken hata oluştu:', error);
    
    // İlişkisel kısıtlamadan kaynaklanan hatalar için özel mesaj
    if (error instanceof Error && error.message.includes('foreign key constraint')) {
      return NextResponse.json(
        { error: 'Bu kullanıcı, hikayeleri veya diğer içerikleri olduğu için silinemiyor. Önce ilişkili verileri silin.' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Kullanıcı silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 