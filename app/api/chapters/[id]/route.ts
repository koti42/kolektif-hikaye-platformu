import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

// Belirli bir bölümü getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: chapterId } = params;
    const id = parseInt(chapterId);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Geçersiz bölüm ID formatı' },
        { status: 400 }
      );
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id },
      include: {
        story: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        parentChapter: {
          select: {
            id: true,
            title: true,
          },
        },
        childChapters: {
          select: {
            id: true,
            title: true,
          },
        },
        options: {
          include: {
            createdBy: {
              select: {
                id: true,
                username: true,
                avatar: true,
              }
            },
            _count: {
              select: {
                votes: true,
              },
            },
          },
        },
      },
    });

    if (!chapter) {
      return NextResponse.json(
        { error: 'Bölüm bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ chapter }, { status: 200 });
  } catch (error) {
    console.error('Bölüm alınırken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Bölüm alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Bölümü güncelle
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: chapterId } = params;
    const id = parseInt(chapterId);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Geçersiz bölüm ID formatı' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, content, status, sequence, parentChapterId } = body;
    
    // Bölümün varlığını kontrol et
    const existingChapter = await prisma.chapter.findUnique({
      where: { id },
    });

    if (!existingChapter) {
      return NextResponse.json(
        { error: 'Bölüm bulunamadı' },
        { status: 404 }
      );
    }
    
    // Eğer parentChapterId değiştiyse kontrolünü yap
    if (parentChapterId !== undefined && parentChapterId !== existingChapter.parentChapterId) {
      // Null değilse varlığını kontrol et
      if (parentChapterId !== null) {
        const parentChapter = await prisma.chapter.findUnique({
          where: { id: parseInt(parentChapterId) },
        });
        
        if (!parentChapter) {
          return NextResponse.json(
            { error: 'Belirtilen üst bölüm bulunamadı' },
            { status: 404 }
          );
        }
        
        // Kendisini üst bölüm olarak seçmeyi engelle
        if (parseInt(parentChapterId) === id) {
          return NextResponse.json(
            { error: 'Bir bölüm kendisini üst bölüm olarak seçemez' },
            { status: 400 }
          );
        }
      }
    }

    // Status değiştiyse ve published oluyorsa publishedAt'i güncelle
    const now = new Date();
    const publishedAt = 
      status === 'published' && existingChapter.status !== 'published'
        ? now
        : existingChapter.publishedAt;

    // Güncelleme işlemini yap
    const updatedChapter = await prisma.chapter.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content !== undefined && { content }),
        ...(status && { status }),
        ...(sequence !== undefined && { sequence: parseInt(sequence) }),
        ...(parentChapterId !== undefined && { 
          parentChapterId: parentChapterId ? parseInt(parentChapterId) : null 
        }),
        ...(publishedAt && { publishedAt }),
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
      { message: 'Bölüm başarıyla güncellendi', chapter: updatedChapter },
      { status: 200 }
    );
  } catch (error) {
    console.error('Bölüm güncellenirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Bölüm güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Bölümü sil
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: chapterId } = params;
    const id = parseInt(chapterId);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Geçersiz bölüm ID formatı' },
        { status: 400 }
      );
    }

    // Bölümün varlığını kontrol et
    const existingChapter = await prisma.chapter.findUnique({
      where: { id },
      include: {
        childChapters: true,
        options: true,
      },
    });

    if (!existingChapter) {
      return NextResponse.json(
        { error: 'Bölüm bulunamadı' },
        { status: 404 }
      );
    }

    // Önce alt bölümlerin ve seçeneklerin olup olmadığını kontrol et
    if (existingChapter.childChapters.length > 0) {
      return NextResponse.json(
        { 
          error: 'Bu bölümün alt bölümleri bulunmaktadır. Önce alt bölümleri silin.',
          childChapterCount: existingChapter.childChapters.length
        },
        { status: 409 }
      );
    }

    if (existingChapter.options.length > 0) {
      return NextResponse.json(
        { 
          error: 'Bu bölümün seçenekleri bulunmaktadır. Önce seçenekleri silin.',
          optionCount: existingChapter.options.length
        },
        { status: 409 }
      );
    }

    // Bölümü sil
    await prisma.chapter.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Bölüm başarıyla silindi' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Bölüm silinirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Bölüm silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 