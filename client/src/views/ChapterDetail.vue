<template>
  <div class="chapter-detail-page">
    <div v-if="loading" class="loading">
      Bölüm yükleniyor...
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else-if="chapter" class="chapter-container">
      <div class="chapter-header">
        <div class="chapter-navigation">
          <router-link :to="`/stories/${chapter.storyId}`" class="btn btn-secondary">
            <span>&larr;</span> Hikayeye Dön
          </router-link>
          
          <div class="chapter-nav-buttons">
            <router-link 
              v-if="prevChapterId" 
              :to="`/chapters/${prevChapterId}`" 
              class="btn btn-secondary"
            >
              <span>&larr;</span> Önceki Bölüm
            </router-link>
            
            <router-link 
              v-if="nextChapterId" 
              :to="`/chapters/${nextChapterId}`" 
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
              Oyunuz
            </div>
            
            <button 
              v-else-if="!isLoggedIn" 
              @click="redirectToLogin" 
              class="btn btn-secondary"
            >
              Oy vermek için giriş yapın
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
            class="form-input" 
            rows="3" 
            placeholder="Yorumunuzu yazın..."
          ></textarea>
          <button 
            @click="addComment" 
            class="btn btn-primary"
            :disabled="!newComment.trim() || commentLoading"
          >
            {{ commentLoading ? 'Gönderiliyor...' : 'Yorum Yap' }}
          </button>
        </div>
        
        <div v-else class="login-to-comment">
          <p>Yorum yapmak için <router-link to="/login">giriş yapın</router-link>.</p>
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

// Bölüm ve seçenek verileri
interface Chapter {
  id: number;
  storyId: number;
  title: string;
  content: string;
  author: string;
  publishedAt: string;
  readTime: number;
  hasOptions: boolean;
  votingDeadline: string;
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
    const response = await axios.get(`/api/chapters/${chapterId}`);
    chapter.value = response.data;
    
    // API'den bölüme ait seçenekleri al
    if (chapter.value?.hasOptions) {
      const optionsResponse = await axios.get(`/api/chapters/${chapterId}/options`);
      options.value = optionsResponse.data;
      
      // Kullanıcının oyunu kontrol et
      if (isLoggedIn.value) {
        const voteResponse = await axios.get(`/api/chapters/${chapterId}/votes/user`);
        if (voteResponse.data && voteResponse.data.optionId) {
          userVote.value = voteResponse.data.optionId;
        }
      }
    }
    
    // API'den bölüme ait yorumları al
    const commentsResponse = await axios.get(`/api/chapters/${chapterId}/comments`);
    comments.value = commentsResponse.data;
    
    // Önceki ve sonraki bölümleri al
    const navigationResponse = await axios.get(`/api/chapters/${chapterId}/navigation`);
    if (navigationResponse.data) {
      prevChapterId.value = navigationResponse.data.prevChapterId;
      nextChapterId.value = navigationResponse.data.nextChapterId;
    }
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = 'Bölüm detayları yüklenirken bir hata oluştu';
    }
  } finally {
    loading.value = false;
  }
  
  // Örnek veri (API bağlantısı olmadığında)
  if (!chapter.value) {
    chapter.value = {
      id: Number(chapterId),
      storyId: 1,
      title: 'Karanlık Kulübe',
      content: `
        <p>Ayşe, ormanın derinliklerinde ilerlerken, ağaçların arasından sızan son ışık huzmeleri de kaybolmaya başlamıştı. Yanında sadece küçük bir fener ve not defteri vardı. Kasabalıların anlattığı hikayeleri düşündükçe, içinde bir tedirginlik hissediyordu.</p>
        
        <p>Birkaç saat yürüdükten sonra, ağaçların arasında küçük bir açıklıkta eski bir kulübe gördü. Kulübenin ahşap duvarları yılların etkisiyle kararmış, pencereleri ise kalın bir toz tabakasıyla kaplanmıştı. Kapısı hafifçe aralıktı.</p>
        
        <p>Ayşe, kulübeye yaklaştıkça, içeriden hafif bir ışık sızdığını fark etti. Birisi orada mıydı? Yoksa bu, kayıp insanların sığınağı olabilir miydi?</p>
        
        <p>Kapıya yaklaştı ve hafifçe itti. Gıcırdayan kapı açıldığında, içeride gördükleri onu şaşkına çevirdi. Kulübe, beklediğinden çok daha büyük görünüyordu ve duvarlar tuhaf sembollerle doluydu. Ortada küçük bir masa ve üzerinde açık bir kitap vardı.</p>
        
        <p>Kitaba yaklaştığında, sayfaların üzerinde tanıdık isimler gördü. Bunlar, son aylarda kaybolan insanların isimleri miydi? Tam o sırada, arkasından gelen bir ses onu irkiltti.</p>
        
        <p>"Sonunda geldin," dedi yaşlı bir ses. "Seni bekliyorduk."</p>
      `,
      author: 'AhmetYazar',
      publishedAt: '2023-03-18T16:45:00Z',
      readTime: 12,
      hasOptions: true,
      votingDeadline: '2023-04-01T23:59:59Z'
    };
    
    options.value = [
      {
        id: 1,
        title: 'Kaçmaya Çalış',
        description: 'Ayşe, tehlikede olduğunu hissederek hızla kulübeden kaçmaya çalışır.',
        votes: 24
      },
      {
        id: 2,
        title: 'Yaşlı Kişiyle Konuş',
        description: 'Ayşe, sakin kalmaya çalışarak yaşlı kişiyle konuşmaya karar verir ve kayıp insanları sorar.',
        votes: 42
      },
      {
        id: 3,
        title: 'Kitabı Al ve Kaç',
        description: 'Ayşe, kitabı alıp hızla kulübeden kaçmaya çalışır, belki kitap kayıp insanların sırrını barındırıyordur.',
        votes: 18
      }
    ];
    
    comments.value = [
      {
        id: 1,
        username: 'OkuyucuEla',
        userAvatar: '/avatars/ela.jpg',
        content: 'Bu bölüm gerçekten gerilim doluydu! Yaşlı kişinin kim olduğunu çok merak ediyorum.',
        createdAt: '2023-03-19T10:15:00Z'
      },
      {
        id: 2,
        username: 'MaceraciCan',
        userAvatar: '/avatars/can.jpg',
        content: 'Bence Ayşe kitabı alıp kaçmalı, o kitapta kesinlikle önemli bilgiler var.',
        createdAt: '2023-03-19T14:30:00Z'
      },
      {
        id: 3,
        username: 'EdebiyatSever',
        content: 'Atmosfer çok iyi kurulmuş, ormanın derinliklerindeki o tekinsiz hissi gerçekten yaşadım okurken.',
        createdAt: '2023-03-20T09:45:00Z'
      }
    ];
    
    prevChapterId.value = 2;
    nextChapterId.value = null; // Henüz sonraki bölüm yok
  }
});

// İçeriği formatla (paragraflar, vb.)
const formattedContent = computed(() => {
  if (!chapter.value) return '';
  return chapter.value.content;
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
  if (!isLoggedIn.value || !chapter.value) return;
  
  voting.value = true;
  
  try {
    // API'ye oy gönder
    await axios.post(`/api/options/${optionId}/vote`);
    
    // Kullanıcının oyunu güncelle
    userVote.value = optionId;
    
    // Seçeneğin oy sayısını artır
    const option = options.value.find(o => o.id === optionId);
    if (option) {
      option.votes++;
    }
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = 'Oy verirken bir hata oluştu';
    }
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
  if (!isLoggedIn.value || !chapter.value || !newComment.value.trim()) return;
  
  commentLoading.value = true;
  
  try {
    // API'ye yorum gönder
    const response = await axios.post(`/api/chapters/${chapter.value.id}/comments`, {
      content: newComment.value
    });
    
    // Yorumu listeye ekle
    comments.value.unshift(response.data);
    
    // Formu temizle
    newComment.value = '';
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = 'Yorum eklenirken bir hata oluştu';
    }
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
}

.loading {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: var(--secondary-color);
}

.chapter-container {
  max-width: 800px;
  margin: 0 auto;
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
}

.chapter-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--secondary-color);
}

.chapter-meta span {
  font-weight: bold;
  color: var(--dark-color);
}

.chapter-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  line-height: 1.8;
}

.chapter-content p {
  margin-bottom: 1.5rem;
}

.chapter-options {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.chapter-options h2,
.chapter-comments h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--dark-color);
}

.chapter-options p {
  margin-bottom: 1.5rem;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.option-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background-color: var(--light-color);
  border-radius: 8px;
  transition: transform 0.2s;
}

.option-item:hover {
  transform: translateY(-3px);
}

.option-voted {
  border: 2px solid var(--primary-color);
}

.option-content {
  flex: 1;
}

.option-content h3 {
  margin: 0 0 0.5rem 0;
  color: var(--primary-color);
}

.option-content p {
  margin: 0 0 1rem 0;
  color: var(--secondary-color);
}

.option-progress {
  position: relative;
  height: 20px;
  background-color: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
}

.option-progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: var(--primary-color);
  transition: width 0.3s;
}

.option-vote-count {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
}

.voted-badge {
  background-color: var(--primary-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
}

.voting-deadline {
  text-align: center;
  font-size: 0.9rem;
  color: var(--secondary-color);
}

.chapter-comments {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.comment-form {
  margin-bottom: 2rem;
}

.comment-form textarea {
  margin-bottom: 1rem;
}

.login-to-comment {
  text-align: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: var(--light-color);
  border-radius: 8px;
}

.login-to-comment a {
  color: var(--primary-color);
  font-weight: bold;
  text-decoration: none;
}

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
}

.comment-avatar {
  flex: 0 0 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
}

.comment-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  font-size: 0.8rem;
  color: var(--secondary-color);
}

.comment-content p {
  margin: 0;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .chapter-navigation,
  .chapter-nav-buttons {
    flex-direction: column;
    gap: 0.5rem;
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