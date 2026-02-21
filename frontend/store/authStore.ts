import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/lib/api';

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  hasRole: (...roles: string[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token, user) => {
        if (typeof window !== 'undefined') localStorage.setItem('token', token);
        set({ token, user });
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        set({ token: null, user: null });
      },
      isAuthenticated: () => !!get().token,
      hasRole: (...roles) => {
        const u = get().user;
        return !!u && roles.includes(u.role);
      },
    }),
    { name: 'fleet-auth', partialize: (s) => ({ token: s.token, user: s.user }) }
  )
);
