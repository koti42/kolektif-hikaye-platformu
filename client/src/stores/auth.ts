import { defineStore } from 'pinia';
import authService, { 
  LoginCredentials, 
  RegisterData, 
  User 
} from '../services/auth.service';

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: authService.getStoredUser(),
    isLoggedIn: authService.isLoggedIn(),
    loading: false,
    error: null,
  }),
  
  actions: {
    /**
     * Kullanıcı girişi yapar
     */
    async login(credentials: LoginCredentials) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await authService.login(credentials);
        this.user = response.user;
        this.isLoggedIn = true;
        
        // Kullanıcı bilgilerini ve token'ı kaydet
        authService.saveUserData(response.user, response.token);
        
        return response;
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Giriş yapılırken bir hata oluştu';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Yeni kullanıcı kaydı yapar
     */
    async register(data: RegisterData) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await authService.register(data);
        this.user = response.user;
        this.isLoggedIn = true;
        
        // Kullanıcı bilgilerini ve token'ı kaydet
        authService.saveUserData(response.user, response.token);
        
        return response;
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Kayıt olurken bir hata oluştu';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Kullanıcı çıkışı yapar
     */
    async logout() {
      authService.logout();
      this.user = null;
      this.isLoggedIn = false;
    },
    
    /**
     * Kullanıcı bilgilerini kontrol eder ve günceller
     */
    async checkAuth() {
      if (!this.isLoggedIn) return;
      
      this.loading = true;
      
      try {
        const user = await authService.getCurrentUser();
        this.user = user;
      } catch (error) {
        // Hata durumunda çıkış yap
        this.logout();
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Hata mesajını temizler
     */
    clearError() {
      this.error = null;
    }
  }
}); 