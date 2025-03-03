<template>
  <div class="story-detail-page">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      Hikaye yükleniyor...
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else-if="story" class="story-container">
      <div class="story-header">
        <div class="story-cover">
          <img :src="story.coverImage || '/images/korku1.jpg'" :alt="story.title" />
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
            <router-link 
              :to="`/bolum/${chapter.id}/${slugify(chapter.title)}`" 
              class="btn btn-primary"
            >
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
          :to="`/hikaye/${story.id}/${slugify(story.title)}/yeni-bolum`" 
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
import { processImageUrl } from '../utils/imageUtils';

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
  userId: number | null;
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
    // API'den hikaye detaylarını al - doğru endpoint kullan
    const response = await axios.get(`http://localhost:3001/api/stories/${storyId}`);
    console.log('Hikaye detayı yanıtı:', response.data);
    
    // API yanıtını kontrol et ve hikaye verisini ayarla
    if (response.data) {
      // API yanıtı doğrudan hikaye nesnesi olabilir veya { story: {...} } formatında olabilir
      const storyData = response.data.story || response.data;
      
      story.value = {
        id: storyData.id,
        title: storyData.title,
        description: storyData.description || '',
        coverImage: processImageUrl(storyData.coverImage),
        status: storyData.status,
        author: storyData.createdBy?.username || 'Anonim',
        createdAt: storyData.createdAt,
        userId: storyData.createdBy?.id || null
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
        // API'den bölümleri ayrıca al
        try {
          const chaptersResponse = await axios.get(`/api/stories/${storyId}/chapters`);
          if (chaptersResponse.data && Array.isArray(chaptersResponse.data)) {
            chapters.value = chaptersResponse.data.map((chapter: any) => ({
              id: chapter.id,
              title: chapter.title,
              summary: chapter.content ? truncateText(chapter.content, 150) : 'Bölüm özeti bulunmuyor.',
              publishedAt: chapter.publishedAt || chapter.createdAt,
              readTime: estimateReadTime(chapter.content || '')
            }));
          }
        } catch (chapterErr) {
          console.error('Bölümler yüklenirken hata:', chapterErr);
          // Örnek veri kullan
          useExampleChapters(Number(storyId));
        }
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
    coverImage: '/images/korku1.jpg',
    status: 'active',
    author: 'AhmetYazar',
    createdAt: '2023-02-15T10:30:00Z',
    userId: null
  };
  
  // Örnek bölümleri de yükle
  useExampleChapters(storyId);
};

// Örnek bölüm verileri
const useExampleChapters = (storyId: number) => {
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
.story-detail-page {
  padding: 2rem 0;
  background-color: var(--gray-100);
  min-height: 85vh;
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

.story-container {
  max-width: 900px;
  margin: 0 auto;
}

.story-header {
  display: flex;
  gap: 2rem;
  margin-bottom: 3rem;
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.story-cover {
  position: relative;
  flex: 0 0 300px;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.story-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.story-cover:hover img {
  transform: scale(1.05);
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
  font-size: 2.2rem;
  line-height: 1.2;
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
  font-size: 1.05rem;
}

.story-chapters,
.story-contribute {
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.story-chapters h2,
.story-contribute h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--dark-color);
  font-size: 1.5rem;
  position: relative;
  padding-bottom: 0.5rem;
}

.story-chapters h2::after,
.story-contribute h2::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 50px;
  height: 3px;
  background-color: var(--primary-color);
  border-radius: 3px;
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
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.chapter-item:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #f0f7ff;
}

.chapter-info {
  flex: 1;
}

.chapter-info h3 {
  margin: 0 0 0.5rem 0;
  color: var(--primary-color);
  font-size: 1.2rem;
}

.chapter-info p {
  margin: 0 0 0.5rem 0;
  color: var(--secondary-color);
  line-height: 1.5;
}

.chapter-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: var(--secondary-color);
}

.story-contribute {
  text-align: center;
  padding: 3rem 2rem;
  background-color: #f0f7ff;
}

.story-contribute p {
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
  color: var(--dark-color);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
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
  display: inline-block;
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

.btn-secondary {
  background-color: var(--secondary-color);
  color: white;
}

.btn-secondary:hover {
  background-color: #6a7a7c;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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