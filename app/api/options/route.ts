import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

// GET: Tüm seçenekleri listele (bölüm ID'sine göre filtreleme destekli)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get('chapterId');
    
    const where: any = {};
    
    // Eğer bölüm ID'si belirtilmişse, o bölüme ait seçenekleri getir
    if (chapterId) {
      where.chapterId = parseInt(chapterId);
    }
    
    const options = await prisma.option.findMany({
      where,
      include: {
        chapter: {
          select: {
            id: true,
            title: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ options }, { status: 200 });
  } catch (error) {
    console.error('Seçenekler alınırken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Seçenekler alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST: Yeni seçenek oluştur
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { chapterId, title, description, userId } = body;

    // Gerekli alanları kontrol et
    if (!chapterId || !title || !userId) {
      return NextResponse.json(
        { error: 'Bölüm ID, başlık ve kullanıcı ID zorunludur' },
        { status: 400 }
      );
    }

    // Bölümün varlığını kontrol et
    const chapter = await prisma.chapter.findUnique({
      where: { id: parseInt(chapterId) },
    });

    if (!chapter) {
      return NextResponse.json(
        { error: 'Bölüm bulunamadı' },
        { status: 404 }
      );
    }

    // Kullanıcının varlığını kontrol et
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Seçenek sayısını kontrol et (bir bölümde maksimum 5 seçenek olabilir)
    const optionCount = await prisma.option.count({
      where: { chapterId: parseInt(chapterId) },
    });

    if (optionCount >= 5) {
      return NextResponse.json(
        { error: 'Bir bölümde en fazla 5 seçenek olabilir' },
        { status: 400 }
      );
    }

    // Yeni seçenek oluştur
    const newOption = await prisma.option.create({
      data: {
        chapterId: parseInt(chapterId),
        title,
        description: description || null,
        createdById: parseInt(userId),
      },
      include: {
        chapter: {
          select: {
            id: true,
            title: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(
      { message: 'Seçenek başarıyla oluşturuldu', option: newOption },
      { status: 201 }
    );
  } catch (error) {
    console.error('Seçenek oluşturulurken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Seçenek oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
} 