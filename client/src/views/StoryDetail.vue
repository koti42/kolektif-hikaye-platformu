<template>
  <div class="story-detail-page">
    <div v-if="loading" class="loading">
      Hikaye yükleniyor...
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else-if="story" class="story-container">
      <div class="story-header">
        <div class="story-cover">
          <img :src="story.coverImage || '/default-story.jpg'" :alt="story.title" />
          <div class="story-status" :class="getStatusClass(story.status)">
            {{ getStatusText(story.status) }}
          </div>
        </div>
        <div class="story-info">
          <h1>{{ story.title }}</h1>
          <div class="story-meta">
            <div class="story-author">
              <span>Yazar:</span> {{ story.author }}
            </div>
            <div class="story-date">
              <span>Oluşturulma:</span> {{ formatDate(story.createdAt) }}
            </div>
          </div>
          <p class="story-description">{{ story.description }}</p>
        </div>
      </div>

      <div class="story-chapters">
        <h2>Bölümler</h2>
        
        <div v-if="chapters.length === 0" class="no-chapters">
          <p>Bu hikayede henüz bölüm bulunmuyor.</p>
        </div>
        
        <div v-else class="chapters-list">
          <div v-for="chapter in chapters" :key="chapter.id" class="chapter-item">
            <div class="chapter-info">
              <h3>{{ chapter.title }}</h3>
              <p>{{ truncateText(chapter.summary, 120) }}</p>
              <div class="chapter-meta">
                <span>{{ formatDate(chapter.publishedAt) }}</span>
                <span>{{ chapter.readTime }} dk okuma</span>
              </div>
            </div>
            <router-link :to="`/chapters/${chapter.id}`" class="btn btn-primary">
              Oku
            </router-link>
          </div>
        </div>
      </div>
      
      <div v-if="story.status === 'active'" class="story-contribute">
        <h2>Hikayeye Katkıda Bulun</h2>
        <p>Bu hikayeye yeni bir bölüm ekleyerek katkıda bulunabilirsiniz.</p>
        <router-link 
          v-if="isLoggedIn" 
          :to="`/stories/${story.id}/contribute`" 
          class="btn btn-primary"
        >
          Yeni Bölüm Ekle
        </router-link>
        <router-link 
          v-else 
          to="/login" 
          class="btn btn-secondary"
        >
          Katkıda bulunmak için giriş yapın
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import axios from 'axios';

const route = useRoute();
const authStore = useAuthStore();
const isLoggedIn = computed(() => authStore.isLoggedIn);

// Hikaye ve bölüm verileri
interface Story {
  id: number;
  title: string;
  description: string;
  coverImage?: string;
  status: 'active' | 'completed' | 'archived';
  author: string;
  createdAt: string;
}

interface Chapter {
  id: number;
  title: string;
  summary: string;
  publishedAt: string;
  readTime: number;
}

const story = ref<Story | null>(null);
const chapters = ref<Chapter[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Hikaye detaylarını yükle
onMounted(async () => {
  const storyId = route.params.id;
  
  if (!storyId) {
    error.value = 'Hikaye ID\'si bulunamadı';
    loading.value = false;
    return;
  }
  
  try {
    // API'den hikaye detaylarını al
    const response = await axios.get(`/api/stories/${storyId}`);
    console.log('Hikaye detayı yanıtı:', response.data);
    
    // API yanıtını kontrol et ve hikaye verisini ayarla
    if (response.data) {
      // API yanıtı doğrudan hikaye nesnesi olabilir veya { story: {...} } formatında olabilir
      const storyData = response.data.story || response.data;
      
      story.value = {
        id: storyData.id,
        title: storyData.title,
        description: storyData.description || '',
        coverImage: storyData.coverImage || '/default-story.jpg',
        status: storyData.status,
        author: storyData.createdBy?.username || 'Anonim',
        createdAt: storyData.createdAt
      };
      
      // Bölümleri ayarla (API yanıtında varsa)
      if (storyData.chapters && Array.isArray(storyData.chapters)) {
        chapters.value = storyData.chapters.map((chapter: any) => ({
          id: chapter.id,
          title: chapter.title,
          summary: chapter.content ? truncateText(chapter.content, 150) : 'Bölüm özeti bulunmuyor.',
          publishedAt: chapter.publishedAt || chapter.createdAt,
          readTime: estimateReadTime(chapter.content || '')
        }));
      } else {
        // Ayrı bir API çağrısı yapmaya gerek yok, zaten hikaye verisinde bölümler var
        console.log('Hikaye verisinde bölümler zaten mevcut');
      }
    } else {
      throw new Error('Geçersiz API yanıtı');
    }
  } catch (err) {
    console.error('Hikaye detayı yüklenirken hata:', err);
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = 'Hikaye detayları yüklenirken bir hata oluştu';
    }
    
    // Hata durumunda örnek veri kullan
    useExampleData(Number(storyId));
  } finally {
    loading.value = false;
  }
});

// Örnek veri kullanma fonksiyonu
const useExampleData = (storyId: number) => {
  console.log('Örnek hikaye detayı verileri kullanılıyor');
  
  story.value = {
    id: storyId,
    title: 'Gizemli Orman',
    description: 'Küçük bir kasabanın yakınındaki ormanda garip olaylar yaşanmaya başlar. Kasabalılar, ormanda kaybolan insanların hikayelerini anlatırken, genç bir gazeteci gerçeği ortaya çıkarmak için ormana girer. Bu hikaye, doğaüstü olaylar, gizem ve macera dolu bir yolculuğu anlatıyor.',
    coverImage: '/stories/forest.jpg',
    status: 'active',
    author: 'AhmetYazar',
    createdAt: '2023-02-15T10:30:00Z'
  };
  
  chapters.value = [
    {
      id: 1,
      title: 'Kayıp İnsanlar',
      summary: 'Kasabada son aylarda artan kayıp vakalarının ardındaki gizem. Gazeteci Ayşe, bu olayları araştırmak için kasabaya gelir.',
      publishedAt: '2023-02-20T14:30:00Z',
      readTime: 8
    },
    {
      id: 2,
      title: 'Ormana Giriş',
      summary: 'Ayşe, kasabalıların uyarılarına rağmen ormana girmeye karar verir. Ormanda karşılaştığı garip işaretler ve sesler onu tedirgin eder.',
      publishedAt: '2023-03-05T11:15:00Z',
      readTime: 10
    },
    {
      id: 3,
      title: 'Karanlık Kulübe',
      summary: 'Ormanın derinliklerinde bulunan eski bir kulübe, kayıp insanların sırrını barındırıyor olabilir mi?',
      publishedAt: '2023-03-18T16:45:00Z',
      readTime: 12
    }
  ];
};

// Okuma süresini tahmin et (her 1000 karakter için yaklaşık 1 dakika)
const estimateReadTime = (text: string): number => {
  if (!text) return 1;
  const wordCount = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200)); // Ortalama 200 kelime/dakika
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
.story-detail-page {
  padding: 2rem 0;
}

.loading {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: var(--secondary-color);
}

.story-container {
  max-width: 900px;
  margin: 0 auto;
}

.story-header {
  display: flex;
  gap: 2rem;
  margin-bottom: 3rem;
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.story-cover {
  position: relative;
  flex: 0 0 300px;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
}

.story-cover img {
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

.story-info {
  flex: 1;
}

.story-info h1 {
  margin: 0 0 1rem 0;
  color: var(--dark-color);
  font-size: 2rem;
}

.story-meta {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
  color: var(--secondary-color);
}

.story-meta span {
  font-weight: bold;
  color: var(--dark-color);
}

.story-description {
  line-height: 1.6;
  color: var(--dark-color);
}

.story-chapters,
.story-contribute {
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.story-chapters h2,
.story-contribute h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--dark-color);
}

.no-chapters {
  text-align: center;
  padding: 2rem;
  color: var(--secondary-color);
}

.chapters-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chapter-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background-color: var(--light-color);
  border-radius: 8px;
  transition: transform 0.2s;
}

.chapter-item:hover {
  transform: translateX(5px);
}

.chapter-info {
  flex: 1;
}

.chapter-info h3 {
  margin: 0 0 0.5rem 0;
  color: var(--primary-color);
}

.chapter-info p {
  margin: 0 0 0.5rem 0;
  color: var(--secondary-color);
}

.chapter-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: var(--secondary-color);
}

.story-contribute {
  text-align: center;
}

.story-contribute p {
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .story-header {
    flex-direction: column;
  }
  
  .story-cover {
    flex: 0 0 auto;
    height: 250px;
    margin-bottom: 1.5rem;
  }
  
  .story-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .chapter-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .chapter-item .btn {
    margin-top: 1rem;
    align-self: flex-end;
  }
}
</style> 