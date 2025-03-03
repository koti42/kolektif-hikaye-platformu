import { NextResponse } from 'next/server';

// Örnek hikaye verileri
const sampleStories = [
  {
    id: 1,
    title: 'Gizemli Orman',
    description: 'Küçük bir kasabanın yakınındaki ormanda garip olaylar yaşanmaya başlar. Kasabalılar, ormanda kaybolan insanların hikayelerini anlatırken, genç bir gazeteci gerçeği ortaya çıkarmak için ormana girer.',
    coverImage: '/stories/forest.jpg',
    status: 'active',
    createdBy: {
      id: 1,
      username: 'AhmetYazar',
      avatar: '/avatars/ahmet.jpg'
    },
    createdAt: '2023-02-15T10:30:00Z',
    chapters: [
      { id: 1, title: 'Ormandaki Sesler', status: 'published' },
      { id: 2, title: 'Kayıp İnsanlar', status: 'published' }
    ]
  },
  {
    id: 2,
    title: 'Karanlık Şato',
    description: 'Eski bir şatoda geçen bu hikayede, miras kalan şatoya taşınan bir aile, geceleri duydukları seslerle huzursuz olmaya başlar. Şatonun karanlık geçmişi, aileyi beklenmedik bir maceraya sürükler.',
    coverImage: '/stories/castle.jpg',
    status: 'active',
    createdBy: {
      id: 2,
      username: 'ElifYazar',
      avatar: '/avatars/elif.jpg'
    },
    createdAt: '2023-03-22T14:15:00Z',
    chapters: [
      { id: 3, title: 'Şatoya Taşınma', status: 'published' },
      { id: 4, title: 'Gece Sesleri', status: 'published' }
    ]
  },
  {
    id: 3,
    title: 'Uzay Yolculuğu',
    description: 'İnsanlığın ilk uzun mesafe uzay yolculuğuna çıkan bir ekibin başından geçen olaylar. Yeni bir gezegen keşfeden ekip, orada beklenmedik yaşam formlarıyla karşılaşır.',
    coverImage: '/stories/space.jpg',
    status: 'completed',
    createdBy: {
      id: 3,
      username: 'MehmetYazar',
      avatar: '/avatars/mehmet.jpg'
    },
    createdAt: '2023-01-10T09:45:00Z',
    chapters: [
      { id: 5, title: 'Kalkış', status: 'published' },
      { id: 6, title: 'Yeni Gezegen', status: 'published' },
      { id: 7, title: 'Karşılaşma', status: 'published' }
    ]
  },
  {
    id: 4,
    title: 'Zaman Yolcuları',
    description: 'Bir grup bilim insanı, zaman yolculuğunu mümkün kılan bir makine icat eder. Ancak geçmişe yaptıkları bir yolculuk, beklenmedik sonuçlar doğurur ve tarih değişmeye başlar.',
    coverImage: '/stories/time.jpg',
    status: 'active',
    createdBy: {
      id: 4,
      username: 'ZeynepYazar',
      avatar: '/avatars/zeynep.jpg'
    },
    createdAt: '2023-04-05T16:20:00Z',
    chapters: [
      { id: 8, title: 'Zaman Makinesi', status: 'published' },
      { id: 9, title: 'Geçmişe Yolculuk', status: 'published' }
    ]
  },
  {
    id: 5,
    title: 'Kayıp Hazine',
    description: 'Eski bir haritayı bulan bir grup arkadaş, efsanevi bir hazinenin peşine düşer. Macera dolu yolculukları, onları dünyanın dört bir yanına sürükler ve beklenmedik tehlikelerle karşı karşıya bırakır.',
    coverImage: '/stories/treasure.jpg',
    status: 'active',
    createdBy: {
      id: 5,
      username: 'CanYazar',
      avatar: '/avatars/can.jpg'
    },
    createdAt: '2023-05-18T11:10:00Z',
    chapters: [
      { id: 10, title: 'Haritanın Keşfi', status: 'published' },
      { id: 11, title: 'Yolculuk Başlıyor', status: 'published' }
    ]
  }
];

// GET: Tüm hikayeleri listele
export async function GET() {
  try {
    // Gerçek uygulamada veritabanından hikayeler alınır
    // Şimdilik örnek veri döndürüyoruz
    return NextResponse.json(sampleStories, { status: 200 });
  } catch (error) {
    console.error('Hikayeler alınırken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Hikayeler alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST: Yeni hikaye oluştur
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, coverImage, userId } = body;

    // Gerekli alanları kontrol et
    if (!title || !userId) {
      return NextResponse.json(
        { error: 'Başlık ve kullanıcı ID zorunludur' },
        { status: 400 }
      );
    }

    // Yeni hikaye oluştur (örnek)
    const newStory = {
      id: sampleStories.length + 1,
      title,
      description: description || null,
      coverImage: coverImage || '/stories/default.jpg',
      status: 'active',
      createdBy: {
        id: parseInt(userId),
        username: 'YeniYazar',
        avatar: '/avatars/default.jpg'
      },
      createdAt: new Date().toISOString(),
      chapters: []
    };

    // Gerçek uygulamada veritabanına kaydedilir
    // Şimdilik sadece başarılı yanıt döndürüyoruz
    return NextResponse.json(
      { message: 'Hikaye başarıyla oluşturuldu', story: newStory },
      { status: 201 }
    );
  } catch (error) {
    console.error('Hikaye oluşturulurken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Hikaye oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
} 