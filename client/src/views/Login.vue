<template>
  <div class="login-page">
    <div class="form-container">
      <h1 class="form-title">Giriş Yap</h1>
      
      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>
      
      <form @submit.prevent="handleLogin">
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
        </div>
        
        <button type="submit" class="form-button" :disabled="loading">
          {{ loading ? 'Giriş Yapılıyor...' : 'Giriş Yap' }}
        </button>
      </form>
      
      <router-link to="/register" class="form-link">
        Hesabınız yok mu? Kayıt olun
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Form alanları
const email = ref('');
const password = ref('');

// Store'dan değerleri al
const loading = computed(() => authStore.loading);
const error = computed(() => authStore.error);

// Yönlendirme URL'ini al
const redirectPath = computed(() => {
  return (route.query.redirect as string) || '/';
});

// Sayfa yüklendiğinde hata mesajını temizle
onMounted(() => {
  authStore.clearError();
});

// Giriş işlemi
const handleLogin = async () => {
  try {
    await authStore.login({
      email: email.value,
      password: password.value
    });
    
    // Başarılı giriş sonrası yönlendirme
    router.push(redirectPath.value);
  } catch (error) {
    // Hata zaten store'da işleniyor
    console.error('Giriş hatası:', error);
  }
};
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
}
</style> 