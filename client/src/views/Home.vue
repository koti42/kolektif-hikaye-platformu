<template>
  <div class="home-page">
    <section class="hero">
      <div class="hero-content">
        <h1>Kolektif Yaratıcı Hikaye Platformu</h1>
        <p>Hikayeler birlikte yazılır, kararlar birlikte verilir.</p>
        <div class="hero-buttons">
          <router-link to="/stories" class="btn btn-primary">Hikayelere Göz At</router-link>
          <router-link v-if="!isLoggedIn" to="/register" class="btn btn-secondary">Hemen Kayıt Ol</router-link>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="feature-card">
        <h2>Dinamik Hikayeler</h2>
        <p>Her bölüm sonunda sunulan seçenekler için oy kullanın ve hikayenin gidişatını belirleyin.</p>
      </div>
      
      <div class="feature-card">
        <h2>Kolektif Yazım</h2>
        <p>Diğer yazarlarla birlikte çalışarak benzersiz hikayeler oluşturun.</p>
      </div>
      
      <div class="feature-card">
        <h2>Özel İçerik Ödülleri</h2>
        <p>Aktif katılımınızla rozetler kazanın ve özel içeriklere erişim elde edin.</p>
      </div>
    </section>

    <section v-if="isLoggedIn && user" class="welcome-back">
      <h2>Tekrar Hoş Geldin, {{ user.username }}!</h2>
      <p>Şu ana kadar {{ user.points }} puan topladın.</p>
      <router-link to="/profile" class="btn btn-primary">Profilime Git</router-link>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

const isLoggedIn = computed(() => authStore.isLoggedIn);
const user = computed(() => authStore.user);
</script>

<style scoped>
.home-page {
  padding: 0;
}

.hero {
  background-color: var(--dark-color);
  color: white;
  padding: 4rem 2rem;
  text-align: center;
  margin-bottom: 2rem;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.hero-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 0 2rem;
  margin-bottom: 3rem;
}

.feature-card {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.feature-card h2 {
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.welcome-back {
  background-color: var(--light-color);
  padding: 2rem;
  text-align: center;
  border-radius: 8px;
  margin: 0 2rem 2rem;
}

.welcome-back h2 {
  margin-bottom: 1rem;
  color: var(--dark-color);
}

.welcome-back p {
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 2rem;
  }
  
  .hero-buttons {
    flex-direction: column;
  }
  
  .features {
    grid-template-columns: 1fr;
  }
}
</style> 