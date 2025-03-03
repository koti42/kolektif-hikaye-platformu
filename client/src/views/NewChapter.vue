<template>
  <div class="new-chapter-page">
    <div v-if="loading" class="loading">
      Yükleniyor...
    </div>
    
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>
    
    <div v-else class="new-chapter-container">
      <h1>Yeni Bölüm Ekle</h1>
      <p class="story-title">Hikaye: {{ storyTitle }}</p>
      
      <form @submit.prevent="submitChapter" class="chapter-form">
        <div class="form-group">
          <label for="title">Bölüm Başlığı</label>
          <input 
            type="text" 
            id="title" 
            v-model="chapterData.title" 
            class="form-control" 
            required 
            placeholder="Bölüm başlığını girin"
          />
        </div>
        
        <div class="form-group">
          <label for="content">Bölüm İçeriği</label>
          <textarea 
            id="content" 
            v-model="chapterData.content" 
            class="form-control" 
            rows="10" 
            required 
            placeholder="Bölüm içeriğini girin (en az 100 karakter)"
          ></textarea>
          <div class="character-count" :class="{ 'text-danger': chapterData.content.length < 100 }">
            {{ chapterData.content.length }} / 100 karakter (minimum)
          </div>
        </div>
        
        <div class="form-group">
          <label for="image">Bölüm Görseli (Opsiyonel)</label>
          <div class="image-upload-container">
            <div class="image-preview" v-if="imagePreview">
              <img :src="imagePreview" alt="Bölüm görseli önizleme" />
              <button type="button" class="btn-remove-image" @click="removeImage">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="upload-button" v-if="!imagePreview">
              <label for="image" class="btn btn-outline-primary">
                <i class="fas fa-upload"></i> Görsel Seç
              </label>
              <input 
                type="file" 
                id="image" 
                @change="handleImageUpload" 
                accept="image/*" 
                class="hidden-input"
              />
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <label for="options">Seçenekler (Hikayenin devamı için)</label>
          <div class="options-container">
            <div v-for="(option, index) in chapterData.options" :key="index" class="option-item">
              <div class="option-input-group">
                <input 
                  type="text" 
                  v-model="option.title" 
                  class="form-control" 
                  :placeholder="`Seçenek ${index + 1}`" 
                  required
                />
                <button 
                  type="button" 
                  class="btn btn-danger btn-sm" 
                  @click="removeOption(index)"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            
            <button 
              type="button" 
              class="btn btn-outline-secondary btn-add-option" 
              @click="addOption" 
              v-if="chapterData.options.length < 3"
            >
              <i class="fas fa-plus"></i> Seçenek Ekle
            </button>
          </div>
        </div>
        
        <div class="form-actions">
          <button 
            type="submit" 
            class="btn btn-primary" 
            :disabled="isSubmitting || !isFormValid"
          >
            {{ isSubmitting ? 'Gönderiliyor...' : 'Bölümü Gönder' }}
          </button>
          <router-link 
            :to="`/hikaye/${storyId}/${storySlug}`" 
            class="btn btn-secondary"
          >
            İptal
          </router-link>
        </div>
      </form>
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

const storyId = computed(() => route.params.storyId as string);
const storySlug = computed(() => route.params.storySlug as string);
const storyTitle = ref('');
const loading = ref(true);
const error = ref<string | null>(null);
const isSubmitting = ref(false);
const imagePreview = ref<string | null>(null);
const imageFile = ref<File | null>(null);

// Bölüm verileri
const chapterData = ref({
  title: '',
  content: '',
  options: [{ title: '' }]
});

// Form geçerliliği kontrolü
const isFormValid = computed(() => {
  return (
    chapterData.value.title.trim().length > 0 &&
    chapterData.value.content.trim().length >= 100 &&
    chapterData.value.options.every(option => option.title.trim().length > 0)
  );
});

// Hikaye bilgilerini yükle
onMounted(async () => {
  if (!authStore.isLoggedIn) {
    router.push('/login?redirect=' + route.fullPath);
    return;
  }
  
  try {
    loading.value = true;
    const response = await axios.get(`/api/stories/${storyId.value}`);
    
    if (response.data) {
      const storyData = response.data.story || response.data;
      storyTitle.value = storyData.title;
    } else {
      throw new Error('Hikaye bilgileri alınamadı');
    }
  } catch (err) {
    console.error('Hikaye bilgileri yüklenirken hata:', err);
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = 'Hikaye bilgileri yüklenirken bir hata oluştu';
    }
    
    // Hata durumunda örnek veri kullan
    storyTitle.value = 'Hikaye';
  } finally {
    loading.value = false;
  }
});

// Seçenek ekle
const addOption = () => {
  if (chapterData.value.options.length < 3) {
    chapterData.value.options.push({ title: '' });
  }
};

// Seçenek kaldır
const removeOption = (index: number) => {
  if (chapterData.value.options.length > 1) {
    chapterData.value.options.splice(index, 1);
  }
};

// Görsel yükleme
const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    
    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Görsel boyutu 5MB\'dan küçük olmalıdır.');
      return;
    }
    
    // Dosya türü kontrolü
    if (!file.type.match('image.*')) {
      alert('Lütfen bir görsel dosyası seçin.');
      return;
    }
    
    imageFile.value = file;
    
    // Görsel önizleme
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

// Görseli kaldır
const removeImage = () => {
  imagePreview.value = null;
  imageFile.value = null;
  const input = document.getElementById('image') as HTMLInputElement;
  if (input) {
    input.value = '';
  }
};

// Bölümü gönder
const submitChapter = async () => {
  if (!isFormValid.value) return;
  
  isSubmitting.value = true;
  
  try {
    // Form verilerini hazırla
    const formData = new FormData();
    formData.append('title', chapterData.value.title);
    formData.append('content', chapterData.value.content);
    formData.append('storyId', storyId.value);
    
    // Seçenekleri ekle
    chapterData.value.options.forEach((option, index) => {
      formData.append(`options[${index}][title]`, option.title);
    });
    
    // Görsel varsa ekle
    if (imageFile.value) {
      formData.append('image', imageFile.value);
    }
    
    // API isteği gönder
    const response = await axios.post('/api/chapters', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    // Başarılı yanıt
    if (response.data && response.data.chapter) {
      alert('Bölüm başarıyla eklendi!');
      router.push(`/hikaye/${storyId.value}/${storySlug.value}`);
    } else {
      throw new Error('Bölüm eklenirken bir hata oluştu');
    }
  } catch (err) {
    console.error('Bölüm gönderilirken hata:', err);
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = 'Bölüm gönderilirken bir hata oluştu';
    }
    
    // Hata durumunda kullanıcıya bildir
    alert('Bölüm eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.new-chapter-page {
  padding: 2rem 0;
}

.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
}

.new-chapter-container {
  max-width: 800px;
  margin: 0 auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

h1 {
  margin-top: 0;
  color: var(--primary-color);
}

.story-title {
  font-size: 1.2rem;
  color: var(--secondary-color);
  margin-bottom: 2rem;
}

.chapter-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: bold;
  color: var(--dark-color);
}

.form-control {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

textarea.form-control {
  resize: vertical;
  min-height: 200px;
}

.character-count {
  font-size: 0.8rem;
  color: #666;
  text-align: right;
}

.text-danger {
  color: var(--danger-color);
}

.image-upload-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.image-preview {
  position: relative;
  width: 100%;
  max-width: 300px;
  border-radius: 4px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.btn-remove-image {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.upload-button {
  display: flex;
  align-items: center;
  justify-content: center;
}

.hidden-input {
  display: none;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.option-item {
  margin-bottom: 0.5rem;
}

.option-input-group {
  display: flex;
  gap: 0.5rem;
}

.btn-add-option {
  align-self: flex-start;
  margin-top: 0.5rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-dark-color);
}

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: var(--dark-color);
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

.btn-outline-primary {
  background-color: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
}

.btn-outline-primary:hover {
  background-color: var(--primary-color);
  color: white;
}

.btn-outline-secondary {
  background-color: transparent;
  border: 1px solid #666;
  color: #666;
}

.btn-outline-secondary:hover {
  background-color: #f0f0f0;
}

.btn-danger {
  background-color: var(--danger-color);
  color: white;
}

.btn-danger:hover {
  background-color: var(--danger-dark-color);
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
}

.alert {
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style> 