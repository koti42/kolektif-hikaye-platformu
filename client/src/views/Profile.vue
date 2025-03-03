<template>
  <div class="profile-page">
    <div v-if="loading" class="loading">
      Yükleniyor...
    </div>
    
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>
    
    <div v-else-if="user" class="profile-container">
      <div class="profile-header">
        <div class="profile-avatar">
          <img :src="user.avatar || '/default-avatar.png'" alt="Profil Resmi" />
        </div>
        <div class="profile-info">
          <h1>{{ user.username }}</h1>
          <p class="profile-email">{{ user.email }}</p>
          <p class="profile-role">{{ user.role === 'admin' ? 'Yönetici' : user.role === 'moderator' ? 'Moderatör' : 'Kullanıcı' }}</p>
          <p class="profile-points">{{ user.points }} Puan</p>
          <p class="profile-joined">Katılım: {{ formatDate(user.createdAt) }}</p>
        </div>
      </div>
      
      <div class="profile-bio">
        <h2>Hakkımda</h2>
        <p v-if="user.bio">{{ user.bio }}</p>
        <p v-else>Henüz bir biyografi eklenmemiş.</p>
        <button @click="isEditingBio = true" class="btn btn-secondary" v-if="!isEditingBio">
          Düzenle
        </button>
        
        <div v-if="isEditingBio" class="bio-edit-form">
          <textarea v-model="editedBio" class="form-input" rows="4" placeholder="Kendiniz hakkında bir şeyler yazın..."></textarea>
          <div class="bio-edit-buttons">
            <button @click="saveBio" class="btn btn-primary" :disabled="bioLoading">
              {{ bioLoading ? 'Kaydediliyor...' : 'Kaydet' }}
            </button>
            <button @click="cancelBioEdit" class="btn btn-secondary">
              İptal
            </button>
          </div>
        </div>
      </div>
      
      <div class="profile-badges">
        <h2>Rozetlerim</h2>
        <div v-if="badges.length" class="badges-container">
          <div v-for="badge in badges" :key="badge.id" class="badge-item">
            <img :src="badge.image || '/default-badge.png'" :alt="badge.name" />
            <div class="badge-info">
              <h3>{{ badge.name }}</h3>
              <p>{{ badge.description }}</p>
            </div>
          </div>
        </div>
        <p v-else>Henüz rozet kazanmadınız.</p>
      </div>
      
      <div class="profile-contributions">
        <h2>Katkılarım</h2>
        <div v-if="contributions.length" class="contributions-container">
          <div v-for="contribution in contributions" :key="contribution.id" class="contribution-item">
            <h3>{{ contribution.title }}</h3>
            <p>{{ contribution.description }}</p>
            <router-link :to="contribution.link" class="btn btn-primary">Görüntüle</router-link>
          </div>
        </div>
        <p v-else>Henüz bir katkınız bulunmuyor.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import axios from 'axios';

const authStore = useAuthStore();
const user = computed(() => authStore.user);
const loading = ref(false);
const error = ref<string | null>(null);

// Biyografi düzenleme
const isEditingBio = ref(false);
const editedBio = ref('');
const bioLoading = ref(false);

// Rozetler ve katkılar (örnek veriler)
const badges = ref<any[]>([]);
const contributions = ref<any[]>([]);

onMounted(async () => {
  if (user.value) {
    loading.value = true;
    error.value = null;
    
    try {
      // Kullanıcı bilgilerini güncelle
      await authStore.checkAuth();
      
      // Eğer kullanıcı bilgileri alınamadıysa
      if (!authStore.user) {
        error.value = 'Oturum süresi dolmuş. Lütfen tekrar giriş yapın.';
        return;
      }
      
      // Kullanıcının biyografisini düzenleme formuna yükle
      if (user.value?.bio) {
        editedBio.value = user.value.bio;
      }
      
      // Rozetleri ve katkıları yükle (gerçek API'ler ile değiştirilecek)
      // Örnek veri
      badges.value = [
        { id: 1, name: 'Hikaye Anlatıcısı', description: 'İlk hikayenizi oluşturdunuz', image: '/badges/storyteller.png' },
        { id: 2, name: 'Aktif Katılımcı', description: '10 bölüme oy verdiniz', image: '/badges/voter.png' }
      ];
      
      contributions.value = [
        { id: 1, title: 'Gizemli Orman', description: 'Oluşturduğunuz hikaye', link: '/stories/1' },
        { id: 2, title: 'Karanlık Şato', description: 'Katkıda bulunduğunuz bölüm', link: '/chapters/5' }
      ];
      
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = 'Profil bilgileri yüklenirken bir hata oluştu. Lütfen tekrar giriş yapın.';
      }
      
      // Hata durumunda kullanıcıya yeniden giriş yapma seçeneği sun
      setTimeout(() => {
        if (confirm('Oturum süresi dolmuş olabilir. Giriş sayfasına yönlendirilmek ister misiniz?')) {
          authStore.logout();
          window.location.href = '/login';
        }
      }, 1000);
    } finally {
      loading.value = false;
    }
  } else {
    error.value = 'Kullanıcı bilgileri bulunamadı. Lütfen giriş yapın.';
  }
});

// Biyografi kaydetme
const saveBio = async () => {
  if (!user.value) return;
  
  bioLoading.value = true;
  
  try {
    // API isteği ile biyografiyi güncelle
    await axios.patch(`/api/users/${user.value.id}`, {
      bio: editedBio.value
    });
    
    // Kullanıcı bilgilerini güncelle
    await authStore.checkAuth();
    
    // Düzenleme modunu kapat
    isEditingBio.value = false;
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = 'Biyografi güncellenirken bir hata oluştu';
    }
  } finally {
    bioLoading.value = false;
  }
};

// Biyografi düzenlemeyi iptal et
const cancelBioEdit = () => {
  isEditingBio.value = false;
  if (user.value?.bio) {
    editedBio.value = user.value.bio;
  } else {
    editedBio.value = '';
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
.profile-page {
  padding: 2rem 0;
}

.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.profile-header {
  display: flex;
  padding: 2rem;
  background-color: var(--light-color);
  border-bottom: 1px solid #eee;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 2rem;
  border: 3px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-info {
  flex: 1;
}

.profile-info h1 {
  margin: 0 0 0.5rem 0;
  color: var(--dark-color);
}

.profile-email {
  color: var(--secondary-color);
  margin-bottom: 0.5rem;
}

.profile-role {
  display: inline-block;
  background-color: var(--primary-color);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.profile-points {
  font-weight: bold;
  color: var(--success-color);
  margin-bottom: 0.5rem;
}

.profile-joined {
  font-size: 0.9rem;
  color: var(--secondary-color);
}

.profile-bio,
.profile-badges,
.profile-contributions {
  padding: 2rem;
  border-bottom: 1px solid #eee;
}

.profile-bio h2,
.profile-badges h2,
.profile-contributions h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--dark-color);
}

.bio-edit-form {
  margin-top: 1rem;
}

.bio-edit-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.badges-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.badge-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: var(--light-color);
  border-radius: 8px;
}

.badge-item img {
  width: 50px;
  height: 50px;
  margin-right: 1rem;
}

.badge-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.badge-info p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--secondary-color);
}

.contributions-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.contribution-item {
  padding: 1.5rem;
  background-color: var(--light-color);
  border-radius: 8px;
}

.contribution-item h3 {
  margin: 0 0 0.5rem 0;
  color: var(--primary-color);
}

.contribution-item p {
  margin: 0 0 1rem 0;
  color: var(--secondary-color);
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .profile-avatar {
    margin-right: 0;
    margin-bottom: 1.5rem;
  }
  
  .badges-container,
  .contributions-container {
    grid-template-columns: 1fr;
  }
}
</style> 