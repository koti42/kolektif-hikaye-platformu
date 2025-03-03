<template>
  <div class="app">
    <header v-if="showHeader">
      <nav>
        <router-link to="/">Ana Sayfa</router-link>
        <router-link to="/stories">Hikayeler</router-link>
        <div class="auth-links" v-if="!isLoggedIn">
          <router-link to="/login">Giriş Yap</router-link>
          <router-link to="/register">Kayıt Ol</router-link>
        </div>
        <div class="user-menu" v-else>
          <span>{{ user?.username }}</span>
          <button @click="logout">Çıkış Yap</button>
        </div>
      </nav>
    </header>

    <main>
      <router-view />
    </main>

    <footer v-if="showFooter">
      <p>&copy; {{ new Date().getFullYear() }} Kolektif Yaratıcı Hikaye Platformu</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from './stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isLoggedIn = computed(() => authStore.isLoggedIn);
const user = computed(() => authStore.user);

// Bazı sayfalarda header ve footer göstermek istemeyebiliriz
const showHeader = computed(() => {
  return !['login', 'register'].includes(route.name as string);
});

const showFooter = computed(() => {
  return !['login', 'register'].includes(route.name as string);
});

onMounted(() => {
  // Sayfa yüklendiğinde kullanıcı bilgilerini kontrol et
  authStore.checkAuth();
});

const logout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f8f9fa;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  background-color: #343a40;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

nav a {
  color: #fff;
  text-decoration: none;
  margin-right: 1.5rem;
  font-weight: 500;
  transition: color 0.3s;
}

nav a:hover {
  color: #17a2b8;
}

.auth-links, .user-menu {
  display: flex;
  align-items: center;
}

.user-menu span {
  color: #fff;
  margin-right: 1rem;
}

button {
  background-color: #17a2b8;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #138496;
}

main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

footer {
  background-color: #343a40;
  color: #fff;
  text-align: center;
  padding: 1rem;
  margin-top: auto;
}
</style> 