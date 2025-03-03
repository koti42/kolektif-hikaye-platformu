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
          <i class="fas fa-plus-circle"></i> Yeni Hikaye Oluştur
        </router-link>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      Hikayeler yükleniyor...
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else-if="filteredStories.length === 0" class="no-stories">
      <p>Henüz hikaye bulunmuyor.</p>
      <router-link v-if="isLoggedIn" to="/stories/create" class="btn btn-primary">
        <i class="fas fa-plus-circle"></i> İlk Hikayeyi Oluştur
      </router-link>
    </div>

    <div v-else class="stories-grid">
      <router-link 
        v-for="story in filteredStories" 
        :key="story.id" 
        :to="`/hikaye/${story.id}/${slugify(story.title)}`" 
        class="story-card"
      >
        <div class="story-image">
          <img :src="story.coverImage || '/default-story.jpg'" :alt="story.title" />
          <div class="story-status" :class="getStatusClass(story.status)">
            {{ getStatusText(story.status) }}
          </div>
        </div>
        <div class="story-content">
          <h2>{{ story.title }}</h2>
          <p class="story-description">{{ truncateText(story.description, 150) }}</p>
          <div class="story-meta">
            <span class="story-author">{{ story.author }}</span>
            <span class="story-date">{{ formatDate(story.createdAt) }}</span>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import axios from 'axios';
import { processImageUrl } from '../utils/imageUtils';

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
  userId: number | null;
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
    // API'den hikayeleri al - doğru endpoint'i kullan
    const response = await axios.get('http://localhost:3001/api/stories');
    console.log('API yanıtı:', response.data);
    
    // API yanıtını kontrol et
    if (Array.isArray(response.data)) {
      stories.value = response.data.map((story: any) => ({
        id: story.id,
        title: story.title,
        description: story.description || '',
        coverImage: processImageUrl(story.coverImage),
        status: story.status,
        author: story.createdBy?.username || 'Anonim',
        createdAt: story.createdAt,
        userId: story.createdBy?.id || null // UserId'yi kaydet
      }));
    } else if (response.data.stories && Array.isArray(response.data.stories)) {
      stories.value = response.data.stories.map((story: any) => ({
        id: story.id,
        title: story.title,
        description: story.description || '',
        coverImage: processImageUrl(story.coverImage),
        status: story.status,
        author: story.createdBy?.username || 'Anonim',
        createdAt: story.createdAt,
        userId: story.createdBy?.id || null // UserId'yi kaydet
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
      coverImage: '/images/korku1.jpg',
      status: 'active',
      author: 'AhmetYazar',
      createdAt: '2023-02-15T10:30:00Z',
      userId: null
    },
    {
      id: 2,
      title: 'Karanlık Şato',
      description: 'Eski bir şatoda geçen bu hikayede, miras kalan şatoya taşınan bir aile, geceleri duydukları seslerle huzursuz olmaya başlar. Şatonun karanlık geçmişi, aileyi beklenmedik bir maceraya sürükler.',
      coverImage: '/images/korku2.jpg',
      status: 'active',
      author: 'ElifYazar',
      createdAt: '2023-03-22T14:15:00Z',
      userId: null
    },
    {
      id: 3,
      title: 'Uzay Yolculuğu',
      description: 'İnsanlığın ilk uzun mesafe uzay yolculuğuna çıkan bir ekibin başından geçen olaylar. Yeni bir gezegen keşfeden ekip, orada beklenmedik yaşam formlarıyla karşılaşır.',
      coverImage: '/images/korku3.jpg',
      status: 'completed',
      author: 'MehmetYazar',
      createdAt: '2023-01-10T09:45:00Z',
      userId: null
    },
    {
      id: 4,
      title: 'Zaman Yolcuları',
      description: 'Bir grup bilim insanı, zaman yolculuğunu mümkün kılan bir makine icat eder. Ancak geçmişe yaptıkları bir yolculuk, beklenmedik sonuçlar doğurur ve tarih değişmeye başlar.',
      coverImage: '/images/korku4.jpg',
      status: 'active',
      author: 'ZeynepYazar',
      createdAt: '2023-04-05T16:20:00Z',
      userId: null
    },
    {
      id: 5,
      title: 'Kayıp Hazine',
      description: 'Eski bir haritayı bulan bir grup arkadaş, efsanevi bir hazinenin peşine düşer. Macera dolu yolculukları, onları dünyanın dört bir yanına sürükler ve beklenmedik tehlikelerle karşı karşıya bırakır.',
      coverImage: '/images/korku1.jpg',
      status: 'active',
      author: 'CanYazar',
      createdAt: '2023-05-18T11:10:00Z',
      userId: null
    }
  ];
};

// Yardımcı fonksiyonlar
const truncateText = (text: string, maxLength: number) => {
  if (!text) return '';
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

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Boşlukları tire ile değiştir
    .replace(/[^\w\-]+/g, '')       // Alfanumerik olmayan karakterleri kaldır
    .replace(/\-\-+/g, '-')         // Birden fazla tireyi tek tire ile değiştir
    .replace(/^-+/, '')             // Baştaki tireleri kaldır
    .replace(/-+$/, '');            // Sondaki tireleri kaldır
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
  background-color: var(--gray-100);
  min-height: 85vh;
}

.stories-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 1rem;
}

.stories-header h1 {
  margin: 0;
  color: var(--dark-color);
  font-size: 2rem;
  position: relative;
  padding-bottom: 0.5rem;
}

.stories-header h1::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 50px;
  height: 3px;
  background-color: var(--primary-color);
  border-radius: 3px;
}

.stories-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.stories-filter select {
  min-width: 180px;
  padding: 0.5rem;
  border: 1px solid var(--gray-300);
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.stories-filter select:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.loading {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: var(--secondary-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-left-color: var(--primary-color);
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-stories {
  text-align: center;
  padding: 3rem;
  background-color: white;
  border-radius: 12px;
  max-width: 500px;
  margin: 2rem auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.story-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
}

.story-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.story-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.story-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.story-card:hover .story-image img {
  transform: scale(1.1);
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 1;
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
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.story-content h2 {
  margin: 0 0 0.75rem 0;
  font-size: 1.4rem;
  color: var(--dark-color);
  line-height: 1.3;
}

.story-description {
  margin-bottom: 1rem;
  color: var(--secondary-color);
  line-height: 1.5;
  flex-grow: 1;
}

.story-meta {
  display: flex;
  justify-content: space-between;
  margin-top: auto;
  font-size: 0.9rem;
  color: var(--secondary-color);
  padding-top: 0.75rem;
  border-top: 1px solid var(--gray-200);
}

.btn {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn i {
  font-size: 1.1rem;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-dark-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.alert {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.alert-danger {
  background-color: #fbeaea;
  color: var(--danger-color);
  border: 1px solid #f8d7d7;
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

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style> 