import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// Sayfa bileşenlerini içe aktarıyoruz
const Home = () => import('../views/Home.vue');
const Login = () => import('../views/Login.vue');
const Register = () => import('../views/Register.vue');
const Stories = () => import('../views/Stories.vue');
const StoryDetail = () => import('../views/StoryDetail.vue');
const ChapterDetail = () => import('../views/ChapterDetail.vue');
const Profile = () => import('../views/Profile.vue');
const NotFound = () => import('../views/NotFound.vue');

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: { title: 'Ana Sayfa' }
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { title: 'Giriş Yap', guest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: { title: 'Kayıt Ol', guest: true }
  },
  {
    path: '/stories',
    name: 'stories',
    component: Stories,
    meta: { title: 'Hikayeler' }
  },
  {
    path: '/stories/:id',
    name: 'story-detail',
    component: StoryDetail,
    props: true,
    meta: { title: 'Hikaye Detayı' }
  },
  {
    path: '/chapters/:id',
    name: 'chapter-detail',
    component: ChapterDetail,
    props: true,
    meta: { title: 'Bölüm Detayı' }
  },
  {
    path: '/profile',
    name: 'profile',
    component: Profile,
    meta: { title: 'Profilim', requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound,
    meta: { title: 'Sayfa Bulunamadı' }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    // Sayfa değiştiğinde en üste kaydır
    return { top: 0 };
  }
});

// Gezinme koruması (Navigation Guard)
router.beforeEach((to, from, next) => {
  // Sayfa başlığını güncelle
  document.title = `${to.meta.title} | Kolektif Yaratıcı Hikaye Platformu`;
  
  const authStore = useAuthStore();
  const isLoggedIn = authStore.isLoggedIn;
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isGuestRoute = to.matched.some(record => record.meta.guest);

  // Kimlik doğrulama gerektiren sayfalar için kontrol
  if (requiresAuth && !isLoggedIn) {
    next({ name: 'login', query: { redirect: to.fullPath } });
  } 
  // Misafir sayfaları için kontrol (giriş yapmış kullanıcılar erişemez)
  else if (isGuestRoute && isLoggedIn) {
    next({ name: 'home' });
  } 
  // Diğer tüm durumlar için normal akışa devam et
  else {
    next();
  }
});

export default router; 