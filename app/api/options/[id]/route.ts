import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

// Belirli bir seçeneği getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Geçersiz seçenek ID formatı' },
        { status: 400 }
      );
    }

    const option = await prisma.option.findUnique({
      where: { id },
      include: {
        chapter: {
          select: {
            id: true,
            title: true,
            storyId: true,
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
        votes: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
          take: 10, // Son 10 oy
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!option) {
      return NextResponse.json(
        { error: 'Seçenek bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ option }, { status: 200 });
  } catch (error) {
    console.error('Seçenek alınırken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Seçenek alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Seçeneği güncelle
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Geçersiz seçenek ID formatı' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, description } = body;
    
    // Seçeneğin varlığını kontrol et
    const existingOption = await prisma.option.findUnique({
      where: { id },
    });

    if (!existingOption) {
      return NextResponse.json(
        { error: 'Seçenek bulunamadı' },
        { status: 404 }
      );
    }
    
    // Güncelleme işlemini yap
    const updatedOption = await prisma.option.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
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
      { message: 'Seçenek başarıyla güncellendi', option: updatedOption },
      { status: 200 }
    );
  } catch (error) {
    console.error('Seçenek güncellenirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Seçenek güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Seçeneği sil
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Geçersiz seçenek ID formatı' },
        { status: 400 }
      );
    }

    // Seçeneğin varlığını kontrol et
    const existingOption = await prisma.option.findUnique({
      where: { id },
      include: {
        votes: true,
      },
    });

    if (!existingOption) {
      return NextResponse.json(
        { error: 'Seçenek bulunamadı' },
        { status: 404 }
      );
    }

    // Önce ilgili oyları sil (cascade delete yapılmışsa gerek olmayabilir)
    if (existingOption.votes.length > 0) {
      await prisma.vote.deleteMany({
        where: { optionId: id },
      });
    }

    // Seçeneği sil
    await prisma.option.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Seçenek başarıyla silindi' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Seçenek silinirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Seçenek silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 