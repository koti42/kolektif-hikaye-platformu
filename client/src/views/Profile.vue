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
          <div class="avatar-upload">
            <label for="avatar-upload" class="avatar-upload-label">
              <i class="fas fa-camera"></i>
            </label>
            <input 
              type="file" 
              id="avatar-upload" 
              @change="handleAvatarUpload" 
              accept="image/*" 
              class="hidden-input"
            />
          </div>
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
const avatarLoading = ref(false);

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
    // Kullanıcı ID'sini doğru şekilde alıyoruz
    const userId = user.value.id;
    
    // Eğer userId undefined ise hata fırlat
    if (!userId) {
      throw new Error('Kullanıcı kimliği bulunamadı. Lütfen sayfayı yenileyip tekrar deneyin.');
    }
    
    console.log('Biyografi güncelleniyor, kullanıcı ID:', userId);
    
    // API isteği ile biyografiyi güncelle
    const response = await axios.patch(`/api/users/${userId}`, {
      bio: editedBio.value
    });
    
    console.log('Biyografi güncelleme yanıtı:', response.data);
    
    // Kullanıcı bilgilerini güncelle
    await authStore.checkAuth();
    
    // Düzenleme modunu kapat
    isEditingBio.value = false;
    
    // Başarı mesajı
    alert('Biyografiniz başarıyla güncellendi!');
  } catch (err) {
    console.error('Biyografi güncellenirken hata:', err);
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = 'Biyografi güncellenirken bir hata oluştu';
    }
    
    // Hata mesajı
    alert('Biyografi güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
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

// Profil fotoğrafı yükleme
const handleAvatarUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    
    // Dosya boyutu kontrolü (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Profil fotoğrafı 2MB\'dan küçük olmalıdır.');
      return;
    }
    
    // Dosya türü kontrolü
    if (!file.type.match('image.*')) {
      alert('Lütfen bir görsel dosyası seçin.');
      return;
    }
    
    avatarLoading.value = true;
    
    try {
      // Kullanıcı ID'sini doğru şekilde alıyoruz
      const userId = user.value?.id;
      
      if (!userId) {
        throw new Error('Kullanıcı kimliği bulunamadı. Lütfen sayfayı yenileyip tekrar deneyin.');
      }
      
      // Form verilerini hazırla
      const formData = new FormData();
      formData.append('avatar', file);
      
      console.log('Avatar yükleme isteği gönderiliyor, kullanıcı ID:', userId);
      
      // API isteği gönder
      const response = await axios.patch(`/api/users/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Avatar yükleme yanıtı:', response.data);
      
      // Kullanıcı bilgilerini güncelle
      await authStore.checkAuth();
      
      // Başarı mesajı
      alert('Profil fotoğrafı başarıyla güncellendi!');
    } catch (err) {
      console.error('Profil fotoğrafı yüklenirken hata:', err);
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = 'Profil fotoğrafı yüklenirken bir hata oluştu';
      }
      
      // Hata durumunda kullanıcıya bildir
      alert('Profil fotoğrafı yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      avatarLoading.value = false;
    }
  }
};
</script>

<style scoped>
.profile-page {
  padding: 2rem 0;
  background-color: var(--gray-100);
  min-height: 85vh;
}

.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: var(--secondary-color);
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.profile-header {
  display: flex;
  padding: 2rem;
  background-image: linear-gradient(135deg, var(--primary-color), var(--primary-dark-color));
  border-bottom: 1px solid #eee;
  color: white;
}

.profile-avatar {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 2rem;
  border: 3px solid white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  background-color: white;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-upload {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: var(--primary-color);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s, background-color 0.2s;
}

.avatar-upload:hover {
  transform: scale(1.1);
  background-color: var(--primary-dark-color);
}

.avatar-upload-label {
  color: white;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.hidden-input {
  display: none;
}

.profile-info {
  flex: 1;
}

.profile-info h1 {
  margin: 0 0 0.5rem 0;
  color: white;
  font-size: 2rem;
}

.profile-email {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.5rem;
}

.profile-role {
  display: inline-block;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.profile-points {
  font-weight: bold;
  color: white;
  margin-bottom: 0.5rem;
}

.profile-joined {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
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
  font-size: 1.5rem;
  position: relative;
  padding-bottom: 0.5rem;
}

.profile-bio h2::after,
.profile-badges h2::after,
.profile-contributions h2::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 50px;
  height: 3px;
  background-color: var(--primary-color);
  border-radius: 3px;
}

.bio-edit-form {
  margin-top: 1rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
  resize: vertical;
}

.form-input:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.bio-edit-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-dark-color);
}

.btn-secondary {
  background-color: var(--secondary-color);
  color: white;
}

.btn-secondary:hover {
  background-color: #6a7a7c;
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
  transition: transform 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.badge-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.badge-item img {
  width: 50px;
  height: 50px;
  margin-right: 1rem;
  border-radius: 8px;
}

.badge-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: var(--dark-color);
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
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.contribution-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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