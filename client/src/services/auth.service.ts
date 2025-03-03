import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  role: string;
  points: number;
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

class AuthService {
  /**
   * Kullanıcı girişi yapar
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  }

  /**
   * Yeni kullanıcı kaydı yapar
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/users', {
      username: data.username,
      email: data.email,
      password: data.password
    });
    return response.data;
  }

  /**
   * Mevcut kullanıcı bilgilerini getirir
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data.user;
  }

  /**
   * Kullanıcı çıkışı yapar (sadece yerel depolamayı temizler)
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  /**
   * Kullanıcının giriş yapmış olup olmadığını kontrol eder
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * LocalStorage'dan kullanıcı bilgilerini alır
   */
  getStoredUser(): User | null {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      return JSON.parse(userJson);
    }
    return null;
  }

  /**
   * Kullanıcı bilgilerini ve token'ı LocalStorage'a kaydeder
   */
  saveUserData(user: User, token: string): void {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  }
}

export default new AuthService(); 