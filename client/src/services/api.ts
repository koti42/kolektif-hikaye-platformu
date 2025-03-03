import axios from 'axios';

// Axios örneği oluştur
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// İstek gönderilmeden önce çalışacak interceptor
api.interceptors.request.use(
  (config) => {
    // LocalStorage'dan token'ı al
    const token = localStorage.getItem('token');
    
    // Eğer token varsa, isteğin header'ına ekle
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Yanıt alındıktan sonra çalışacak interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401 Unauthorized hatası alındığında
    if (error.response && error.response.status === 401) {
      // Profil sayfasında 401 hatası alındığında hemen çıkış yaptırma
      // Bunun yerine hatayı ilet ve kullanıcıya bilgi ver
      if (window.location.pathname === '/profile') {
        console.error('Kimlik doğrulama hatası: Oturum süresi dolmuş olabilir.');
        return Promise.reject(error);
      }
      
      // Diğer sayfalarda normal çıkış işlemi
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Eğer login sayfasında değilse, login sayfasına yönlendir
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?session=expired';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 