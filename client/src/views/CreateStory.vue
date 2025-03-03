<template>
  <div class="create-story-page">
    <div class="page-header">
      <h1>Yeni Hikaye Oluştur</h1>
      <router-link to="/stories" class="btn btn-secondary">
        <span>&larr;</span> Hikayelere Dön
      </router-link>
    </div>

    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div class="create-story-form">
      <form @submit.prevent="createStory">
        <div class="form-group">
          <label for="title" class="form-label">Başlık</label>
          <input
            type="text"
            id="title"
            v-model="story.title"
            class="form-control"
            placeholder="Hikayenizin başlığını girin"
            required
          />
        </div>

        <div class="form-group">
          <label for="description" class="form-label">Açıklama</label>
          <textarea
            id="description"
            v-model="story.description"
            class="form-control"
            rows="5"
            placeholder="Hikayenizin kısa bir açıklamasını girin"
            required
          ></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Hazır Korku Görselleri</label>
          <div class="preset-images">
            <div 
              v-for="(image, index) in presetImages" 
              :key="index" 
              class="preset-image-item"
              :class="{ 'selected': selectedPresetImage === index }"
              @click="selectPresetImage(index)"
            >
              <img :src="image.src" :alt="image.alt" />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Kapak Görseli (Opsiyonel)</label>
          
          <div v-if="previewImage" class="cover-image-preview">
            <img :src="previewImage" alt="Kapak görseli önizlemesi" />
          </div>
          
          <div class="cover-image-upload">
            <label for="cover-image" class="btn btn-secondary">
              <i class="fas fa-upload"></i> Görsel Yükle
            </label>
            <input 
              type="file" 
              id="cover-image" 
              @change="handleImageUpload" 
              accept="image/*"
              class="hidden-input"
            />
            <span v-if="story.coverImage && !selectedPresetImage" class="selected-file">
              {{ getFileName(story.coverImage) }}
            </span>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            <i class="fas fa-save"></i> {{ loading ? 'Kaydediliyor...' : 'Hikayeyi Oluştur' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import axios from 'axios';
import { processImageUrl, uploadImage } from '../utils/imageUtils';

const router = useRouter();
const authStore = useAuthStore();
const isLoggedIn = computed(() => authStore.isLoggedIn);

// Hazır korku görselleri
const presetImages = [
  { src: '/images/korku1.jpg', alt: 'Korku Teması 1' },
  { src: '/images/korku2.jpg', alt: 'Korku Teması 2' },
  { src: '/images/korku3.jpg', alt: 'Korku Teması 3' },
  { src: '/images/korku4.jpg', alt: 'Korku Teması 4' }
];

const selectedPresetImage = ref<number | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const previewImage = ref<string | null>(null);

// Kullanıcı giriş yapmamışsa, login sayfasına yönlendir
onMounted(() => {
  if (!isLoggedIn.value) {
    router.push('/login');
  }
});

interface NewStory {
  title: string;
  description: string;
  coverImage: File | null;
  status: 'active' | 'completed' | 'archived';
}

const story = ref<NewStory>({
  title: '',
  description: '',
  coverImage: null,
  status: 'active'
});

// Önizleme olarak kullanılacak bir preset görsel seç
const selectPresetImage = (index: number) => {
  selectedPresetImage.value = index;
  previewImage.value = presetImages[index].src;
  story.value.coverImage = null;
};

// Görsel yükleme işlemi
const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    
    // Dosya boyutu kontrolü (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Kapak görseli 2MB\'dan küçük olmalıdır.');
      return;
    }
    
    // Dosya türü kontrolü
    if (!file.type.match('image.*')) {
      alert('Lütfen bir görsel dosyası seçin.');
      return;
    }
    
    // Hazır seçili görseli temizle
    selectedPresetImage.value = null;
    
    story.value.coverImage = file;
    previewImage.value = URL.createObjectURL(file);
  }
};

// Dosya adını göster
const getFileName = (file: File | null) => {
  if (!file) return '';
  return file.name;
};

// Hikaye oluşturma
const createStory = async () => {
  if (!isLoggedIn.value) {
    error.value = 'Hikaye oluşturmak için giriş yapmalısınız';
    return;
  }
  
  if (!story.value.title.trim() || !story.value.description.trim()) {
    error.value = 'Başlık ve açıklama alanları zorunludur';
    return;
  }
  
  loading.value = true;
  error.value = null;
  
  try {
    const formData = new FormData();
    formData.append('title', story.value.title);
    formData.append('description', story.value.description);
    formData.append('status', story.value.status);
    
    // Kullanıcı ID'sini ekle - Kullanıcının giriş yapmış olduğunu kontrol ediyoruz
    const userId = authStore.user?.id;
    if (userId) {
      formData.append('userId', userId.toString());
    } else {
      throw new Error('Kullanıcı kimliği bulunamadı. Lütfen tekrar giriş yapın.');
    }
    
    // Hazır görsel seçilmişse onu kullan
    if (selectedPresetImage.value !== null) {
      const imageUrl = presetImages[selectedPresetImage.value].src;
      formData.append('coverImageUrl', imageUrl);
      console.log(`Hazır korku görseli kullanılıyor: ${imageUrl}`);
    } 
    // Kendi yüklediği görsel varsa onu kullan
    else if (story.value.coverImage) {
      formData.append('coverImage', story.value.coverImage);
      console.log('Kullanıcının yüklediği görsel kullanılıyor');
    }
    // Görsel yoksa varsayılan görsel kullan
    else {
      // Varsayılan görsel olarak şu an verilen örnek görsel kullanılıyor
      formData.append('coverImageUrl', 'https://sm.ign.com/t/ign_tr/news/f/fourth-gra/fourth-graders-distraught-after-winnie-the-pooh-blood-and-ho_3z5p.1280.jpg');
      console.log('Varsayılan korku görseli kullanılıyor');
    }
    
    console.log('Hikaye oluşturma isteği gönderiliyor...');
    
    const response = await axios.post('http://localhost:3001/api/stories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('Hikaye oluşturuldu:', response.data);
    
    // Başarılı oluşturmadan sonra hikaye detay sayfasına yönlendir
    if (response.data && response.data.id) {
      const storyId = response.data.id;
      const storySlug = slugify(story.value.title);
      router.push(`/hikaye/${storyId}/${storySlug}`);
    } else if (response.data && response.data.story && response.data.story.id) {
      const storyId = response.data.story.id;
      const storySlug = slugify(story.value.title);
      router.push(`/hikaye/${storyId}/${storySlug}`);
    } else {
      // Başarılı yanıt ama ID yoksa hikayelere yönlendir
      router.push('/stories');
      alert('Hikaye başarıyla oluşturuldu!');
    }
  } catch (err) {
    console.error('Hikaye oluşturulurken hata:', err);
    
    // API yanıtını kontrol et
    if (err.response && err.response.data) {
      console.error('API hata yanıtı:', err.response.data);
    }
    
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = 'Hikaye oluşturulurken bir hata oluştu. Lütfen tüm gerekli alanları doldurduğunuzdan emin olun.';
    }
    
    // API bağlantı hatası durumunda kullanıcıya bilgi ver
    if (err.message === 'Network Error') {
      error.value = 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.';
    }
  } finally {
    loading.value = false;
  }
};

// Slugify fonksiyonu
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
</script>

<style scoped>
.create-story-page {
  padding: 2rem 0;
  max-width: 800px;
  margin: 0 auto;
  background-color: var(--gray-100);
  min-height: 85vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 0 1rem;
}

.page-header h1 {
  margin: 0;
  color: var(--dark-color);
  font-size: 2rem;
  position: relative;
  padding-bottom: 0.5rem;
}

.page-header h1::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 50px;
  height: 3px;
  background-color: var(--primary-color);
  border-radius: 3px;
}

.create-story-form {
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin: 0 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: var(--dark-color);
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.preset-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.preset-image-item {
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.preset-image-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.preset-image-item.selected {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.3);
}

.preset-image-item img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
}

.hidden-input {
  display: none;
}

.cover-image-preview {
  margin-bottom: 1rem;
  border-radius: 8px;
  overflow: hidden;
  max-width: 300px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.cover-image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.cover-image-upload {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.selected-file {
  color: var(--secondary-color);
  font-size: 0.9rem;
}

.form-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
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

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--primary-dark-color);
}

.btn-secondary {
  background-color: var(--secondary-color);
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #6a7a7c;
}

.alert {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  margin-left: 1rem;
  margin-right: 1rem;
}

.alert-danger {
  background-color: #fbeaea;
  color: var(--danger-color);
  border: 1px solid #f8d7d7;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .create-story-form {
    padding: 1.5rem;
  }
  
  .preset-images {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .form-actions {
    justify-content: center;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style> 