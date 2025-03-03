<template>
  <div class="register-page">
    <div class="form-container">
      <h1 class="form-title">Kayıt Ol</h1>
      
      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>
      
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="username" class="form-label">Kullanıcı Adı</label>
          <input
            id="username"
            v-model="username"
            type="text"
            class="form-input"
            placeholder="Kullanıcı adınızı girin"
            required
          />
          <div v-if="validationErrors.username" class="form-error">
            {{ validationErrors.username }}
          </div>
        </div>
        
        <div class="form-group">
          <label for="email" class="form-label">E-posta</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="form-input"
            placeholder="E-posta adresinizi girin"
            required
          />
          <div v-if="validationErrors.email" class="form-error">
            {{ validationErrors.email }}
          </div>
        </div>
        
        <div class="form-group">
          <label for="password" class="form-label">Şifre</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-input"
            placeholder="Şifrenizi girin"
            required
          />
          <div v-if="validationErrors.password" class="form-error">
            {{ validationErrors.password }}
          </div>
        </div>
        
        <div class="form-group">
          <label for="passwordConfirm" class="form-label">Şifre Tekrar</label>
          <input
            id="passwordConfirm"
            v-model="passwordConfirm"
            type="password"
            class="form-input"
            placeholder="Şifrenizi tekrar girin"
            required
          />
          <div v-if="validationErrors.passwordConfirm" class="form-error">
            {{ validationErrors.passwordConfirm }}
          </div>
        </div>
        
        <button type="submit" class="form-button" :disabled="loading || !isFormValid">
          {{ loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol' }}
        </button>
      </form>
      
      <router-link to="/login" class="form-link">
        Zaten hesabınız var mı? Giriş yapın
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

// Form alanları
const username = ref('');
const email = ref('');
const password = ref('');
const passwordConfirm = ref('');

// Store'dan değerleri al
const loading = computed(() => authStore.loading);
const error = computed(() => authStore.error);

// Form doğrulama hataları
const validationErrors = reactive({
  username: '',
  email: '',
  password: '',
  passwordConfirm: ''
});

// Form geçerli mi?
const isFormValid = computed(() => {
  return (
    username.value.length >= 3 &&
    email.value.includes('@') &&
    password.value.length >= 6 &&
    password.value === passwordConfirm.value &&
    !validationErrors.username &&
    !validationErrors.email &&
    !validationErrors.password &&
    !validationErrors.passwordConfirm
  );
});

// Kullanıcı adı doğrulama
watch(username, (value) => {
  if (value.length < 3) {
    validationErrors.username = 'Kullanıcı adı en az 3 karakter olmalıdır';
  } else {
    validationErrors.username = '';
  }
});

// E-posta doğrulama
watch(email, (value) => {
  if (!value.includes('@')) {
    validationErrors.email = 'Geçerli bir e-posta adresi girin';
  } else {
    validationErrors.email = '';
  }
});

// Şifre doğrulama
watch(password, (value) => {
  if (value.length < 6) {
    validationErrors.password = 'Şifre en az 6 karakter olmalıdır';
  } else {
    validationErrors.password = '';
  }
  
  // Şifre tekrarını da kontrol et
  if (passwordConfirm.value && value !== passwordConfirm.value) {
    validationErrors.passwordConfirm = 'Şifreler eşleşmiyor';
  } else if (passwordConfirm.value) {
    validationErrors.passwordConfirm = '';
  }
});

// Şifre tekrar doğrulama
watch(passwordConfirm, (value) => {
  if (value !== password.value) {
    validationErrors.passwordConfirm = 'Şifreler eşleşmiyor';
  } else {
    validationErrors.passwordConfirm = '';
  }
});

// Sayfa yüklendiğinde hata mesajını temizle
onMounted(() => {
  authStore.clearError();
});

// Kayıt işlemi
const handleRegister = async () => {
  if (!isFormValid.value) return;
  
  try {
    await authStore.register({
      username: username.value,
      email: email.value,
      password: password.value,
      passwordConfirm: passwordConfirm.value
    });
    
    // Başarılı kayıt sonrası ana sayfaya yönlendir
    router.push('/');
  } catch (error) {
    // Hata zaten store'da işleniyor
    console.error('Kayıt hatası:', error);
  }
};
</script>

<style scoped>
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
}
</style> 