<template>
  <div class="chapter-detail-page">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      Bölüm yükleniyor...
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else-if="chapter" class="chapter-container">
      <div class="chapter-header">
        <div class="chapter-navigation">
          <router-link :to="`/hikaye/${chapter.storyId}/hikaye-${chapter.storyId}`" class="btn btn-secondary">
            <span>&larr;</span> Hikayeye Dön
          </router-link>
          
          <div class="chapter-nav-buttons">
            <router-link 
              v-if="prevChapterId" 
              :to="`/bolum/${prevChapterId}/bolum-${prevChapterId}`" 
              class="btn btn-secondary"
            >
              <span>&larr;</span> Önceki Bölüm
            </router-link>
            
            <router-link 
              v-if="nextChapterId" 
              :to="`/bolum/${nextChapterId}/bolum-${nextChapterId}`" 
              class="btn btn-secondary"
            >
              Sonraki Bölüm <span>&rarr;</span>
            </router-link>
          </div>
        </div>
        
        <h1>{{ chapter.title }}</h1>
        <div class="chapter-meta">
          <div class="chapter-author">
            <span>Yazar:</span> {{ chapter.author }}
          </div>
          <div class="chapter-date">
            <span>Yayınlanma:</span> {{ formatDate(chapter.publishedAt) }}
          </div>
          <div class="chapter-read-time">
            <span>Okuma Süresi:</span> {{ chapter.readTime }} dakika
          </div>
        </div>
      </div>

      <div class="chapter-content">
        <div v-html="formattedContent"></div>
      </div>

      <div v-if="chapter.hasOptions" class="chapter-options">
        <h2>Hikayenin Devamı İçin Oy Ver</h2>
        <p>Bu bölümün devamı için aşağıdaki seçeneklerden birini seçin. En çok oy alan seçenek, hikayenin gidişatını belirleyecek.</p>
        
        <div class="options-list">
          <div 
            v-for="option in options" 
            :key="option.id" 
            class="option-item"
            :class="{ 'option-voted': userVote === option.id }"
          >
            <div class="option-content">
              <h3>{{ option.title }}</h3>
              <p>{{ option.description }}</p>
              
              <div class="option-progress">
                <div 
                  class="option-progress-bar" 
                  :style="{ width: calculateVotePercentage(option.id) + '%' }"
                ></div>
                <span class="option-vote-count">{{ option.votes }} oy ({{ calculateVotePercentage(option.id) }}%)</span>
              </div>
            </div>
            
            <button 
              v-if="isLoggedIn && !userVote" 
              @click="voteForOption(option.id)" 
              class="btn btn-primary"
              :disabled="voting"
            >
              {{ voting ? 'Oy Veriliyor...' : 'Oy Ver' }}
            </button>
            
            <div v-else-if="userVote === option.id" class="voted-badge">
              <i class="fas fa-check-circle"></i> Oyunuz
            </div>
            
            <button 
              v-else-if="!isLoggedIn" 
              @click="redirectToLogin" 
              class="btn btn-secondary"
            >
              Oy Vermek İçin Giriş Yap
            </button>
          </div>
        </div>
        
        <div class="voting-deadline">
          <p>Oylama sona erme tarihi: {{ formatDate(chapter.votingDeadline) }}</p>
        </div>
      </div>
      
      <div class="chapter-comments">
        <h2>Yorumlar</h2>
        
        <div v-if="isLoggedIn" class="comment-form">
          <textarea 
            v-model="newComment" 
            placeholder="Yorumunuzu yazın..." 
            class="form-control"
          ></textarea>
          <button 
            @click="addComment" 
            class="btn btn-primary" 
            :disabled="!newComment.trim() || commentLoading"
          >
            {{ commentLoading ? 'Gönderiliyor...' : 'Yorum Ekle' }}
          </button>
        </div>
        
        <div v-else class="login-to-comment">
          <router-link to="/login" class="btn btn-secondary">Yorum yapmak için giriş yapın</router-link>
        </div>
        
        <div v-if="comments.length === 0" class="no-comments">
          <p>Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
        </div>
        
        <div v-else class="comments-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-avatar">
              <img :src="comment.userAvatar || '/default-avatar.png'" :alt="comment.username" />
            </div>
            <div class="comment-content">
              <div class="comment-header">
                <h4>{{ comment.username }}</h4>
                <span>{{ formatDate(comment.createdAt) }}</span>
              </div>
              <p>{{ comment.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const isLoggedIn = computed(() => authStore.isLoggedIn);

// Veri türleri
interface Chapter {
  id: number;
  storyId: number;
  title: string;
  content: string;
  author: string;
  publishedAt: string;
  readTime: number;
  hasOptions: boolean;
  votingDeadline?: string;
}

interface Option {
  id: number;
  title: string;
  description: string;
  votes: number;
}

interface Comment {
  id: number;
  username: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

const chapter = ref<Chapter | null>(null);
const options = ref<Option[]>([]);
const comments = ref<Comment[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const userVote = ref<number | null>(null);
const voting = ref(false);
const newComment = ref('');
const commentLoading = ref(false);

// Önceki ve sonraki bölüm ID'leri
const prevChapterId = ref<number | null>(null);
const nextChapterId = ref<number | null>(null);

// Bölüm detaylarını yükle
onMounted(async () => {
  const chapterId = route.params.id;
  
  if (!chapterId) {
    error.value = 'Bölüm ID\'si bulunamadı';
    loading.value = false;
    return;
  }
  
  try {
    // API'den bölüm detaylarını al
    console.log('Bölüm detayları yükleniyor: ID =', chapterId);
    const response = await axios.get(`/api/chapters/${chapterId}`);
    
    if (response.data) {
      console.log('Bölüm verisi:', response.data);
      chapter.value = response.data;
    } else {
      throw new Error('Geçersiz bölüm verisi');
    }
    
    // API'den bölüme ait seçenekleri al
    if (chapter.value?.hasOptions) {
      try {
        const optionsResponse = await axios.get(`/api/chapters/${chapterId}/options`);
        if (Array.isArray(optionsResponse.data)) {
          options.value = optionsResponse.data;
        }
      } catch (optionsErr) {
        console.error('Seçenekler yüklenirken hata:', optionsErr);
      }
      
      // Kullanıcının oyunu kontrol et
      if (isLoggedIn.value && authStore.user?.id) {
        try {
          const voteResponse = await axios.get(`/api/chapters/${chapterId}/votes/user`);
          if (voteResponse.data && voteResponse.data.optionId) {
            userVote.value = voteResponse.data.optionId;
          }
        } catch (voteErr) {
          console.error('Kullanıcı oyu kontrol edilirken hata:', voteErr);
        }
      }
    }
    
    // API'den bölüme ait yorumları al
    try {
      const commentsResponse = await axios.get(`/api/chapters/${chapterId}/comments`);
      if (Array.isArray(commentsResponse.data)) {
        comments.value = commentsResponse.data;
      }
    } catch (commentsErr) {
      console.error('Yorumlar yüklenirken hata:', commentsErr);
    }
    
    // Önceki ve sonraki bölümleri al
    try {
      const navigationResponse = await axios.get(`/api/chapters/${chapterId}/navigation`);
      if (navigationResponse.data) {
        prevChapterId.value = navigationResponse.data.prevChapterId;
        nextChapterId.value = navigationResponse.data.nextChapterId;
      }
    } catch (navErr) {
      console.error('Bölüm navigasyonu yüklenirken hata:', navErr);
    }
  } catch (err) {
    console.error('Bölüm detayları yüklenirken hata:', err);
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = 'Bölüm detayları yüklenirken bir hata oluştu';
    }
    
    // Hata durumunda örnek veri kullan
    useExampleData(Number(chapterId));
  } finally {
    loading.value = false;
  }
});

// Örnek veri kullanma fonksiyonu
const useExampleData = (chapterId: number) => {
  console.log('Örnek bölüm verileri kullanılıyor');
  
  // Bölüm verisi
  chapter.value = {
    id: chapterId,
    storyId: 1, // Varsayılan hikaye ID'si
    title: 'Gece Sesleri',
    content: `<p>Ayşe, kasabalıların tüm uyarılarına rağmen ormana girmeye karar verdi. Hava çoktan kararmıştı, ancak yanına aldığı güçlü el feneri, yolunu aydınlatmaya yetiyordu.</p>
    <p>Ormanda ilerlediği her adımda, etrafındaki sesler değişiyordu. Önce kuş cıvıltıları azaldı, sonra yaprak hışırtıları. Şimdi ise etrafında garip, tanımlayamadığı sesler duyuyordu.</p>
    <p>Bir süre sonra, ağaçların arasından uzakta bir ışık gördü. Işığa doğru yaklaştıkça, bunun küçük, eski bir kulübe olduğunu fark etti. Kulübenin penceresinden sızan ışık, içeride birinin olduğunu gösteriyordu.</p>
    <p>Kapıyı çalmaya karar verdi. Belki de burada, kayıp insanlar hakkında bilgi sahibi biri vardı...</p>`,
    author: 'ElifYazar',
    publishedAt: '2023-03-05T14:30:00Z',
    readTime: 5,
    hasOptions: true,
    votingDeadline: '2023-03-12T23:59:59Z'
  };
  
  // Seçenekler
  options.value = [
    {
      id: 1,
      title: 'Kapıyı Çal',
      description: 'Ayşe kapıyı çalmalı ve içerideki kişiden bilgi istemelidir.',
      votes: 24
    },
    {
      id: 2,
      title: 'Önce Pencereden Bak',
      description: 'Ayşe, içeride kimin olduğunu görmek için önce pencereden bakmalıdır.',
      votes: 18
    },
    {
      id: 3,
      title: 'Ormanın Derinliklerine İlerle',
      description: 'Ayşe, kulübeyi görmezden gelmeli ve ormanda daha derinlere ilerlemelidir.',
      votes: 12
    }
  ];
  
  // Yorumlar
  comments.value = [
    {
      id: 1,
      username: 'OkuyucuAhmet',
      userAvatar: '/images/korku1.jpg',
      content: 'Bu bölüm gerçekten gerilim dolu! Ormanın betimlemesi çok başarılı olmuş.',
      createdAt: '2023-03-06T10:15:00Z'
    },
    {
      id: 2,
      username: 'Meraklı123',
      userAvatar: '/images/korku2.jpg',
      content: 'Bence Ayşe pencereden bakmalı, kapıyı çalmak çok tehlikeli olabilir!',
      createdAt: '2023-03-06T15:30:00Z'
    },
    {
      id: 3,
      username: 'HikayeSever',
      userAvatar: '/images/korku3.jpg',
      content: 'Kulübenin ne olduğunu çok merak ediyorum. Bir sonraki bölümü sabırsızlıkla bekliyorum.',
      createdAt: '2023-03-07T09:45:00Z'
    }
  ];
  
  // Önceki ve sonraki bölümler
  prevChapterId.value = chapterId > 1 ? chapterId - 1 : null;
  nextChapterId.value = chapterId < 5 ? chapterId + 1 : null;
};

// İçeriği formatla (paragraflara ayır)
const formattedContent = computed(() => {
  if (!chapter.value?.content) return '';
  // Eğer içerik zaten HTML formatında ise, doğrudan döndür
  if (chapter.value.content.includes('<p>')) {
    return chapter.value.content;
  }
  // Değilse, paragraflara ayır
  return chapter.value.content.split('\n\n').map(p => `<p>${p}</p>`).join('');
});

// Oy yüzdesini hesapla
const calculateVotePercentage = (optionId: number) => {
  const totalVotes = options.value.reduce((sum, option) => sum + option.votes, 0);
  if (totalVotes === 0) return 0;
  
  const option = options.value.find(o => o.id === optionId);
  if (!option) return 0;
  
  return Math.round((option.votes / totalVotes) * 100);
};

// Seçenek için oy ver
const voteForOption = async (optionId: number) => {
  if (!isLoggedIn.value || !chapter.value || !authStore.user?.id) {
    // Eğer kullanıcı giriş yapmamışsa veya kullanıcı ID'si yoksa
    redirectToLogin();
    return;
  }
  
  voting.value = true;
  
  try {
    // API'ye oy gönder
    console.log(`Oy veriliyor: Seçenek ID = ${optionId}, Kullanıcı ID = ${authStore.user.id}`);
    await axios.post(`/api/options/${optionId}/vote`, {
      userId: authStore.user.id
    });
    
    // Kullanıcının oyunu güncelle
    userVote.value = optionId;
    
    // Seçeneğin oy sayısını artır
    const option = options.value.find(o => o.id === optionId);
    if (option) {
      option.votes++;
    }
    
    // Başarı mesajı
    alert('Oyunuz başarıyla kaydedildi!');
  } catch (err) {
    console.error('Oy verirken hata:', err);
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = 'Oy verirken bir hata oluştu';
    }
    
    // Hata mesajı göster
    alert('Oy verirken bir hata oluştu. Lütfen tekrar deneyin.');
  } finally {
    voting.value = false;
  }
};

// Giriş sayfasına yönlendir
const redirectToLogin = () => {
  router.push({
    path: '/login',
    query: { redirect: route.fullPath }
  });
};

// Yorum ekle
const addComment = async () => {
  if (!isLoggedIn.value || !chapter.value || !newComment.value.trim() || !authStore.user?.id) {
    if (!isLoggedIn.value || !authStore.user?.id) {
      redirectToLogin();
    }
    return;
  }
  
  commentLoading.value = true;
  
  try {
    // API'ye yorum gönder
    console.log(`Yorum ekleniyor: Bölüm ID = ${chapter.value.id}, Kullanıcı ID = ${authStore.user.id}`);
    const response = await axios.post(`/api/chapters/${chapter.value.id}/comments`, {
      content: newComment.value,
      userId: authStore.user.id
    });
    
    // Yorumu listeye ekle
    if (response.data) {
      comments.value.unshift(response.data);
    } else {
      // Örnek bir yorum ekle
      const newCommentObj: Comment = {
        id: Date.now(),
        username: authStore.user.username,
        userAvatar: authStore.user.avatar,
        content: newComment.value,
        createdAt: new Date().toISOString()
      };
      comments.value.unshift(newCommentObj);
    }
    
    // Formu temizle
    newComment.value = '';
    
    // Başarı mesajı
    alert('Yorumunuz başarıyla eklendi!');
  } catch (err) {
    console.error('Yorum eklenirken hata:', err);
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = 'Yorum eklenirken bir hata oluştu';
    }
    
    // Hata mesajı göster
    alert('Yorum eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
  } finally {
    commentLoading.value = false;
  }
};

// Tarih formatı
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};
</script>

<style scoped>
.chapter-detail-page {
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

.chapter-container {
  max-width: 800px;
  margin: 0 auto;
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.chapter-header {
  margin-bottom: 2rem;
}

.chapter-navigation {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.chapter-nav-buttons {
  display: flex;
  gap: 1rem;
}

.chapter-header h1 {
  margin: 0 0 1rem 0;
  color: var(--dark-color);
  font-size: 2rem;
  line-height: 1.2;
}

.chapter-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--secondary-color);
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--gray-200);
}

.chapter-meta span {
  font-weight: bold;
  color: var(--dark-color);
}

.chapter-content {
  line-height: 1.8;
  font-size: 1.1rem;
  color: var(--dark-color);
  margin-bottom: 3rem;
}

.chapter-content p {
  margin-bottom: 1.5rem;
}

.chapter-options,
.chapter-comments {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--gray-200);
}

.chapter-options h2,
.chapter-comments h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--dark-color);
  font-size: 1.5rem;
  position: relative;
  padding-bottom: 0.5rem;
}

.chapter-options h2::after,
.chapter-comments h2::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 50px;
  height: 3px;
  background-color: var(--primary-color);
  border-radius: 3px;
}

.chapter-options p {
  margin-bottom: 1.5rem;
  color: var(--secondary-color);
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.option-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background-color: var(--light-color);
  border-radius: 8px;
  transition: background-color 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.option-item:hover {
  background-color: #f0f7ff;
}

.option-voted {
  background-color: #eaf7ff;
  border: 2px solid var(--primary-color);
}

.option-content {
  flex: 1;
  margin-right: 1rem;
}

.option-content h3 {
  margin: 0 0 0.5rem 0;
  color: var(--primary-color);
  font-size: 1.2rem;
}

.option-content p {
  margin: 0 0 1rem 0;
  color: var(--secondary-color);
}

.option-progress {
  position: relative;
  height: 12px;
  background-color: #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.option-progress-bar {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background-color: var(--primary-color);
  border-radius: 6px;
  transition: width 0.5s ease;
}

.option-vote-count {
  font-size: 0.9rem;
  color: var(--secondary-color);
}

.voted-badge {
  display: flex;
  align-items: center;
  color: var(--primary-color);
  font-weight: bold;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.comment-form {
  margin-bottom: 2rem;
}

.comment-form textarea {
  width: 100%;
  min-height: 100px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid var(--gray-300);
  border-radius: 4px;
  resize: vertical;
  transition: border-color 0.2s;
}

.comment-form textarea:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.login-to-comment,
.no-comments {
  text-align: center;
  padding: 2rem;
  color: var(--secondary-color);
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.comment-item {
  display: flex;
  gap: 1rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--gray-200);
}

.comment-avatar {
  flex: 0 0 50px;
}

.comment-avatar img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.comment-header h4 {
  margin: 0;
  color: var(--dark-color);
}

.comment-header span {
  font-size: 0.9rem;
  color: var(--secondary-color);
}

.comment-content p {
  margin: 0;
  color: var(--dark-color);
  line-height: 1.5;
}

.btn {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  white-space: nowrap;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--primary-dark-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-secondary {
  background-color: var(--secondary-color);
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #6a7a7c;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.alert {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.alert-danger {
  background-color: #fbeaea;
  color: var(--danger-color);
  border: 1px solid #f8d7d7;
}

@media (max-width: 768px) {
  .chapter-container {
    padding: 1.5rem;
    margin: 0 1rem;
  }
  
  .chapter-navigation {
    flex-direction: column;
    gap: 1rem;
  }
  
  .chapter-nav-buttons {
    width: 100%;
    justify-content: space-between;
  }
  
  .chapter-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .option-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .option-item .btn,
  .option-item .voted-badge {
    margin-top: 1rem;
    align-self: flex-end;
  }
}
</style> 