import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

// GET: Oyları listele (seçenek ID'sine göre filtreleme destekli)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const optionId = searchParams.get('optionId');
    const userId = searchParams.get('userId');
    const chapterId = searchParams.get('chapterId');
    
    const where: any = {};
    
    // Filtreleme seçenekleri
    if (optionId) {
      where.optionId = parseInt(optionId);
    }
    
    if (userId) {
      where.userId = parseInt(userId);
    }
    
    // Bölüme ait oyları getirmek için
    if (chapterId) {
      where.option = {
        chapterId: parseInt(chapterId)
      };
    }
    
    const votes = await prisma.vote.findMany({
      where,
      include: {
        option: {
          select: {
            id: true,
            title: true,
            chapterId: true,
            chapter: {
              select: {
                id: true,
                title: true,
                storyId: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ votes }, { status: 200 });
  } catch (error) {
    console.error('Oylar alınırken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Oylar alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST: Oy ver
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { optionId, userId } = body;

    // Gerekli alanları kontrol et
    if (!optionId || !userId) {
      return NextResponse.json(
        { error: 'Seçenek ID ve kullanıcı ID zorunludur' },
        { status: 400 }
      );
    }

    // Seçeneğin varlığını kontrol et
    const option = await prisma.option.findUnique({
      where: { id: parseInt(optionId) },
      include: {
        chapter: true,
      },
    });

    if (!option) {
      return NextResponse.json(
        { error: 'Seçenek bulunamadı' },
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

    // Bu bölüm için kullanıcının daha önce oy kullanıp kullanmadığını kontrol et
    const existingVote = await prisma.vote.findFirst({
      where: {
        userId: parseInt(userId),
        option: {
          chapterId: option.chapterId,
        },
      },
    });

    if (existingVote) {
      // Eğer aynı seçeneğe oy verdiyse, işlemi iptal et (oy geri çekme)
      if (existingVote.optionId === parseInt(optionId)) {
        await prisma.vote.delete({
          where: { id: existingVote.id },
        });
        
        return NextResponse.json(
          { message: 'Oyunuz başarıyla geri çekildi' },
          { status: 200 }
        );
      }
      
      // Farklı bir seçeneğe oy verdiyse, mevcut oyu güncelle
      const updatedVote = await prisma.vote.update({
        where: { id: existingVote.id },
        data: { optionId: parseInt(optionId) },
        include: {
          option: {
            select: {
              id: true,
              title: true,
              chapterId: true,
            },
          },
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });
      
      return NextResponse.json(
        { message: 'Oyunuz başarıyla güncellendi', vote: updatedVote },
        { status: 200 }
      );
    }

    // Yeni oy oluştur
    const newVote = await prisma.vote.create({
      data: {
        optionId: parseInt(optionId),
        userId: parseInt(userId),
      },
      include: {
        option: {
          select: {
            id: true,
            title: true,
            chapterId: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    // Kullanıcıya puan ekle
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        points: {
          increment: 5, // Her oy için 5 puan
        },
      },
    });

    // Oy sonuçlarını hesapla
    const voteResults = await prisma.vote.groupBy({
      by: ['optionId'],
      where: {
        option: {
          chapterId: option.chapterId,
        },
      },
      _count: {
        optionId: true,
      },
    });

    // En yüksek oyu alan seçeneği bul
    let highestVoteCount = 0;
    let winningOptionId = null;

    voteResults.forEach(result => {
      if (result._count.optionId > highestVoteCount) {
        highestVoteCount = result._count.optionId;
        winningOptionId = result.optionId;
      }
    });

    return NextResponse.json({
      message: 'Oy başarıyla kaydedildi',
      vote: newVote,
      voteResults: voteResults,
      winningOptionId: winningOptionId,
    }, { status: 201 });
  } catch (error) {
    console.error('Oy verilirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Oy verilirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 