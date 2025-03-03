<template>
  <div class="stories-page">
    <div class="stories-header">
      <h1>Hikayeler</h1>
      <div class="stories-actions">
        <div class="stories-filter">
          <select v-model="filter" class="form-input">
            <option value="all">Tüm Hikayeler</option>
            <option value="active">Aktif Hikayeler</option>
            <option value="completed">Tamamlanan Hikayeler</option>
          </select>
        </div>
        <router-link v-if="isLoggedIn" to="/stories/create" class="btn btn-primary">
          Yeni Hikaye Oluştur
        </router-link>
      </div>
    </div>

    <div v-if="loading" class="loading">
      Hikayeler yükleniyor...
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else-if="filteredStories.length === 0" class="no-stories">
      <p>Henüz hikaye bulunmuyor.</p>
      <router-link v-if="isLoggedIn" to="/stories/create" class="btn btn-primary">
        İlk Hikayeyi Oluştur
      </router-link>
    </div>

    <div v-else class="stories-grid">
      <div v-for="story in filteredStories" :key="story.id" class="story-card">
        <div class="story-image">
          <img :src="story.coverImage || '/default-story.jpg'" :alt="story.title" />
          <div class="story-status" :class="getStatusClass(story.status)">
            {{ getStatusText(story.status) }}
          </div>
        </div>
        <div class="story-content">
          <h2 class="story-title">{{ story.title }}</h2>
          <p class="story-description">{{ truncateText(story.description, 100) }}</p>
          <div class="story-meta">
            <span class="story-author">Yazar: {{ story.author }}</span>
            <span class="story-date">{{ formatDate(story.createdAt) }}</span>
          </div>
          <router-link :to="`/stories/${story.id}`" class="btn btn-primary">
            Hikayeyi Oku
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import axios from 'axios';

const authStore = useAuthStore();
const isLoggedIn = computed(() => authStore.isLoggedIn);

// Hikaye verileri
interface Story {
  id: number;
  title: string;
  description: string;
  coverImage?: string;
  status: 'active' | 'completed' | 'archived';
  author: string;
  createdAt: string;
}

const stories = ref<Story[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const filter = ref('all');

// Filtrelenmiş hikayeler
const filteredStories = computed(() => {
  if (filter.value === 'all') {
    return stories.value;
  }
  return stories.value.filter(story => story.status === filter.value);
});

// Hikayeleri yükle
onMounted(async () => {
  try {
    // API'den hikayeleri al
    const response = await axios.get('/api/stories');
    
    // API yanıtını kontrol et
    if (Array.isArray(response.data)) {
      stories.value = response.data.map((story: any) => ({
        id: story.id,
        title: story.title,
        description: story.description || '',
        coverImage: story.coverImage || '/default-story.jpg',
        status: story.status,
        author: story.createdBy?.username || 'Anonim',
        createdAt: story.createdAt
      }));
    } else if (response.data.stories && Array.isArray(response.data.stories)) {
      stories.value = response.data.stories.map((story: any) => ({
        id: story.id,
        title: story.title,
        description: story.description || '',
        coverImage: story.coverImage || '/default-story.jpg',
        status: story.status,
        author: story.createdBy?.username || 'Anonim',
        createdAt: story.createdAt
      }));
    } else {
      console.error('Beklenmeyen API yanıt formatı:', response.data);
      throw new Error('Hikayeler alınamadı: Geçersiz veri formatı');
    }
    
    console.log('Hikayeler başarıyla yüklendi:', stories.value);
  } catch (err) {
    console.error('Hikayeler yüklenirken hata:', err);
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = 'Hikayeler yüklenirken bir hata oluştu';
    }
    
    // Hata durumunda örnek veri kullan
    useExampleData();
  } finally {
    loading.value = false;
  }
});

// Örnek veri kullanma fonksiyonu
const useExampleData = () => {
  console.log('Örnek hikaye verileri kullanılıyor');
  stories.value = [
    {
      id: 1,
      title: 'Gizemli Orman',
      description: 'Küçük bir kasabanın yakınındaki ormanda garip olaylar yaşanmaya başlar. Kasabalılar, ormanda kaybolan insanların hikayelerini anlatırken, genç bir gazeteci gerçeği ortaya çıkarmak için ormana girer.',
      coverImage: '/stories/forest.jpg',
      status: 'active',
      author: 'AhmetYazar',
      createdAt: '2023-02-15T10:30:00Z'
    },
    {
      id: 2,
      title: 'Karanlık Şato',
      description: 'Eski bir şatoda geçen bu hikayede, miras kalan şatoya taşınan bir aile, geceleri duydukları seslerle huzursuz olmaya başlar. Şatonun karanlık geçmişi, aileyi beklenmedik bir maceraya sürükler.',
      coverImage: '/stories/castle.jpg',
      status: 'active',
      author: 'ElifYazar',
      createdAt: '2023-03-22T14:15:00Z'
    },
    {
      id: 3,
      title: 'Uzay Yolculuğu',
      description: 'İnsanlığın ilk uzun mesafe uzay yolculuğuna çıkan bir ekibin başından geçen olaylar. Yeni bir gezegen keşfeden ekip, orada beklenmedik yaşam formlarıyla karşılaşır.',
      coverImage: '/stories/space.jpg',
      status: 'completed',
      author: 'MehmetYazar',
      createdAt: '2023-01-10T09:45:00Z'
    },
    {
      id: 4,
      title: 'Zaman Yolcuları',
      description: 'Bir grup bilim insanı, zaman yolculuğunu mümkün kılan bir makine icat eder. Ancak geçmişe yaptıkları bir yolculuk, beklenmedik sonuçlar doğurur ve tarih değişmeye başlar.',
      coverImage: '/stories/time.jpg',
      status: 'active',
      author: 'ZeynepYazar',
      createdAt: '2023-04-05T16:20:00Z'
    },
    {
      id: 5,
      title: 'Kayıp Hazine',
      description: 'Eski bir haritayı bulan bir grup arkadaş, efsanevi bir hazinenin peşine düşer. Macera dolu yolculukları, onları dünyanın dört bir yanına sürükler ve beklenmedik tehlikelerle karşı karşıya bırakır.',
      coverImage: '/stories/treasure.jpg',
      status: 'active',
      author: 'CanYazar',
      createdAt: '2023-05-18T11:10:00Z'
    }
  ];
};

// Yardımcı fonksiyonlar
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

const getStatusClass = (status: string) => {
  switch (status) {
    case 'active': return 'status-active';
    case 'completed': return 'status-completed';
    case 'archived': return 'status-archived';
    default: return '';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return 'Devam Ediyor';
    case 'completed': return 'Tamamlandı';
    case 'archived': return 'Arşivlendi';
    default: return status;
  }
};
</script>

<style scoped>
.stories-page {
  padding: 2rem 0;
}

.stories-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.stories-header h1 {
  margin: 0;
  color: var(--dark-color);
}

.stories-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.stories-filter select {
  min-width: 180px;
}

.loading {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: var(--secondary-color);
}

.no-stories {
  text-align: center;
  padding: 3rem;
}

.no-stories p {
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
  color: var(--secondary-color);
}

.stories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.story-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.story-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.story-image {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.story-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.story-status {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
}

.status-active {
  background-color: var(--primary-color);
}

.status-completed {
  background-color: var(--success-color);
}

.status-archived {
  background-color: var(--secondary-color);
}

.story-content {
  padding: 1.5rem;
}

.story-title {
  margin: 0 0 0.75rem 0;
  font-size: 1.4rem;
  color: var(--dark-color);
}

.story-description {
  margin-bottom: 1rem;
  color: var(--secondary-color);
  line-height: 1.5;
}

.story-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  color: var(--secondary-color);
}

@media (max-width: 768px) {
  .stories-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .stories-actions {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }
  
  .stories-filter {
    width: 100%;
  }
  
  .stories-filter select {
    width: 100%;
  }
  
  .stories-grid {
    grid-template-columns: 1fr;
  }
}
</style> 