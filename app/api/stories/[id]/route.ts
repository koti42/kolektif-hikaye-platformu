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
      { 
        id: 1, 
        title: 'Ormandaki Sesler', 
        content: 'Kasabanın yakınındaki orman, yıllardır gizemli hikayelere ev sahipliği yapıyordu. Geceleri duyulan tuhaf sesler, kaybolan insanlar ve açıklanamayan olaylar, kasabalıları korkutuyordu. Genç gazeteci Ahmet, bu hikayelerin peşine düşmeye karar verdi.',
        status: 'published',
        sequence: 1,
        publishedAt: '2023-02-16T10:30:00Z',
        parentChapterId: null,
        createdBy: {
          id: 1,
          username: 'AhmetYazar',
          avatar: '/avatars/ahmet.jpg'
        },
        options: [
          {
            id: 1,
            title: 'Ahmet gece ormana girer',
            _count: { votes: 15 }
          },
          {
            id: 2,
            title: 'Ahmet kasabalılarla konuşmaya devam eder',
            _count: { votes: 8 }
          }
        ]
      },
      { 
        id: 2, 
        title: 'Kayıp İnsanlar', 
        content: 'Ahmet, kasabada yaşayan ve yakınlarını ormanda kaybeden insanlarla görüşmeye başladı. Hikayeler birbirine benziyordu: Ormanda yürüyüşe çıkan insanlar, tuhaf bir sis içinde kayboluyordu. Bazıları geri dönüyor, bazıları ise bir daha hiç görülmüyordu.',
        status: 'published',
        sequence: 2,
        publishedAt: '2023-02-18T14:45:00Z',
        parentChapterId: 1,
        createdBy: {
          id: 3,
          username: 'MehmetYazar',
          avatar: '/avatars/mehmet.jpg'
        },
        options: [
          {
            id: 3,
            title: 'Ahmet, ormanda kaybolan ve geri dönen biriyle konuşur',
            _count: { votes: 20 }
          },
          {
            id: 4,
            title: 'Ahmet, yerel tarihçiyle görüşür',
            _count: { votes: 12 }
          }
        ]
      }
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
      { 
        id: 3, 
        title: 'Şatoya Taşınma', 
        content: 'Yılmaz ailesi, büyükbabadan kalan eski şatoya taşınmaya karar verdi. Şehrin gürültüsünden uzak, sakin bir hayat onları bekliyordu. Ancak şatoya vardıklarında, beklemedikleri bir manzarayla karşılaştılar: Yıllardır bakımsız kalan şato, neredeyse bir harabe gibiydi.',
        status: 'published',
        sequence: 1,
        publishedAt: '2023-03-23T09:30:00Z',
        parentChapterId: null,
        createdBy: {
          id: 2,
          username: 'ElifYazar',
          avatar: '/avatars/elif.jpg'
        },
        options: [
          {
            id: 5,
            title: 'Aile şatoyu tamir etmeye karar verir',
            _count: { votes: 18 }
          },
          {
            id: 6,
            title: 'Aile şatonun geçmişini araştırmaya başlar',
            _count: { votes: 10 }
          }
        ]
      },
      { 
        id: 4, 
        title: 'Gece Sesleri', 
        content: 'İlk gece, aile üyeleri odalarına çekildi. Gece yarısı, küçük kız Ayşe, koridordan gelen fısıltılarla uyandı. Önce rüya gördüğünü düşündü, ancak sesler giderek yükseliyordu. Korkuyla anne ve babasının odasına koştu.',
        status: 'published',
        sequence: 2,
        publishedAt: '2023-03-25T16:20:00Z',
        parentChapterId: 3,
        createdBy: {
          id: 4,
          username: 'ZeynepYazar',
          avatar: '/avatars/zeynep.jpg'
        },
        options: [
          {
            id: 7,
            title: 'Aile birlikte seslerin kaynağını araştırır',
            _count: { votes: 22 }
          },
          {
            id: 8,
            title: 'Aile şatodan ayrılmaya karar verir',
            _count: { votes: 7 }
          }
        ]
      }
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
      { 
        id: 5, 
        title: 'Kalkış', 
        content: 'İnsanlığın yıldızlara uzanma hayali, nihayet gerçekleşiyordu. Uzay gemisi Aurora, Dünya\'dan ayrılmak üzereydi. Mürettebat, uzun yolculuk için son hazırlıklarını tamamlıyordu. Kaptan Leyla, ekibine son talimatları verdi ve geri sayım başladı.',
        status: 'published',
        sequence: 1,
        publishedAt: '2023-01-11T08:15:00Z',
        parentChapterId: null,
        createdBy: {
          id: 3,
          username: 'MehmetYazar',
          avatar: '/avatars/mehmet.jpg'
        },
        options: []
      }
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
      { 
        id: 8, 
        title: 'Zaman Makinesi', 
        content: 'Profesör Demir ve ekibi, on yıldır zaman yolculuğu üzerine çalışıyordu. Nihayet, teorilerini pratiğe dökebilecekleri bir makine geliştirdiler. İlk testler başarılı oldu: Küçük nesneler geleceğe ve geçmişe gönderilebildi.',
        status: 'published',
        sequence: 1,
        publishedAt: '2023-04-06T10:10:00Z',
        parentChapterId: null,
        createdBy: {
          id: 4,
          username: 'ZeynepYazar',
          avatar: '/avatars/zeynep.jpg'
        },
        options: [
          {
            id: 9,
            title: 'Ekip, bir insan deneyine geçmeye karar verir',
            _count: { votes: 25 }
          },
          {
            id: 10,
            title: 'Ekip, daha fazla test yapmaya karar verir',
            _count: { votes: 15 }
          }
        ]
      }
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
      { 
        id: 10, 
        title: 'Haritanın Keşfi', 
        content: 'Deniz, büyükbabasının tavan arasını temizlerken eski bir sandık buldu. Sandığın içinde, yıpranmış bir harita ve gizemli sembollerle dolu bir günlük vardı. Hemen arkadaşlarını aradı ve buluşmaya çağırdı.',
        status: 'published',
        sequence: 1,
        publishedAt: '2023-05-19T14:30:00Z',
        parentChapterId: null,
        createdBy: {
          id: 5,
          username: 'CanYazar',
          avatar: '/avatars/can.jpg'
        },
        options: [
          {
            id: 11,
            title: 'Arkadaşlar haritayı çözmeye çalışır',
            _count: { votes: 19 }
          },
          {
            id: 12,
            title: 'Arkadaşlar bir tarih profesörüne danışır',
            _count: { votes: 14 }
          }
        ]
      }
    ]
  }
];

// Belirli bir hikayeyi getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Next.js uyarısına göre params.id kullanımını düzeltiyoruz
    const { id: storyId } = params;
    const id = parseInt(storyId);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Geçersiz hikaye ID formatı' },
        { status: 400 }
      );
    }

    // Örnek hikaye verilerinden ID'ye göre hikayeyi bul
    const story = sampleStories.find(story => story.id === id);

    if (!story) {
      return NextResponse.json(
        { error: 'Hikaye bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(story, { status: 200 });
  } catch (error) {
    console.error('Hikaye alınırken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Hikaye alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Hikayeyi güncelle
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: storyId } = params;
    const id = parseInt(storyId);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Geçersiz hikaye ID formatı' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Hikayenin varlığını kontrol et
    const storyIndex = sampleStories.findIndex(story => story.id === id);

    if (storyIndex === -1) {
      return NextResponse.json(
        { error: 'Hikaye bulunamadı' },
        { status: 404 }
      );
    }

    // Hikayeyi güncelle (örnek olarak)
    const updatedStory = {
      ...sampleStories[storyIndex],
      ...body,
      updatedAt: new Date().toISOString()
    };

    // Gerçek bir veritabanı olmadığı için sadece başarılı yanıt dönüyoruz
    return NextResponse.json(
      { message: 'Hikaye başarıyla güncellendi', story: updatedStory },
      { status: 200 }
    );
  } catch (error) {
    console.error('Hikaye güncellenirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Hikaye güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Hikayeyi sil
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Next.js uyarısına göre params.id kullanımını düzeltiyoruz
    const storyId = params.id;
    const id = parseInt(storyId);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Geçersiz hikaye ID formatı' },
        { status: 400 }
      );
    }

    // Hikayenin varlığını kontrol et
    const storyIndex = sampleStories.findIndex(story => story.id === id);

    if (storyIndex === -1) {
      return NextResponse.json(
        { error: 'Hikaye bulunamadı' },
        { status: 404 }
      );
    }

    // Gerçek bir veritabanı olmadığı için sadece başarılı yanıt dönüyoruz
    return NextResponse.json(
      { message: 'Hikaye başarıyla silindi' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Hikaye silinirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Hikaye silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 