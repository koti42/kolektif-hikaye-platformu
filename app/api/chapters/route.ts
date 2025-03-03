import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

// GET: Tüm bölümleri listele
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storyId = searchParams.get('storyId');
    const status = searchParams.get('status');
    
    const where: any = {};
    
    // Eğer hikaye ID'si belirtilmişse, o hikayeye ait bölümleri getir
    if (storyId) {
      where.storyId = parseInt(storyId);
    }
    
    // Eğer durum belirtilmişse, o durumdaki bölümleri getir
    if (status) {
      where.status = status;
    }
    
    const chapters = await prisma.chapter.findMany({
      where,
      include: {
        story: {
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
        options: {
          select: {
            id: true,
            title: true,
            _count: {
              select: {
                votes: true,
              },
            },
          },
        },
      },
      orderBy: {
        sequence: 'asc',
      },
    });

    return NextResponse.json({ chapters }, { status: 200 });
  } catch (error) {
    console.error('Bölümler alınırken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Bölümler alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST: Yeni bölüm oluştur
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { storyId, title, content, parentChapterId, sequence, userId, status } = body;

    // Gerekli alanları kontrol et
    if (!storyId || !title || !content || !userId || sequence === undefined) {
      return NextResponse.json(
        { error: 'Hikaye ID, başlık, içerik, sıra numarası ve kullanıcı ID zorunludur' },
        { status: 400 }
      );
    }

    // Hikayenin varlığını kontrol et
    const story = await prisma.story.findUnique({
      where: { id: parseInt(storyId) },
    });

    if (!story) {
      return NextResponse.json(
        { error: 'Hikaye bulunamadı' },
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

    // Eğer parent bölüm belirtilmişse, varlığını kontrol et
    if (parentChapterId) {
      const parentChapter = await prisma.chapter.findUnique({
        where: { id: parseInt(parentChapterId) },
      });

      if (!parentChapter) {
        return NextResponse.json(
          { error: 'Üst bölüm bulunamadı' },
          { status: 404 }
        );
      }
    }

    // Yeni bölüm oluştur
    const newChapter = await prisma.chapter.create({
      data: {
        storyId: parseInt(storyId),
        title,
        content,
        parentChapterId: parentChapterId ? parseInt(parentChapterId) : null,
        sequence: parseInt(sequence),
        status: status || 'draft', // Varsayılan olarak taslak
        createdById: parseInt(userId),
        publishedAt: status === 'published' ? new Date() : null,
      },
      include: {
        story: {
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
      { message: 'Bölüm başarıyla oluşturuldu', chapter: newChapter },
      { status: 201 }
    );
  } catch (error) {
    console.error('Bölüm oluşturulurken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Bölüm oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
} 