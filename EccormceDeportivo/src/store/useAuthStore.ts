import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';

interface User {
  id: string;
  email: string;
  nombre: string;
  rol: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      login: async (email, pass) => {
        try {
          const { accessToken, user } = await authService.login({ email, password: pass });
          set({ isAuthenticated: true, user, token: accessToken });
          return true;
        } catch (error) {
          console.error('Login failed', error);
          return false;
        }
      },
      logout: () => set({ isAuthenticated: false, user: null, token: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
