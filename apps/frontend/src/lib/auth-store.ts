import { create } from 'zustand';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  tenantId: string;
  tenantName?: string;
  role?: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('itsm_token') : null,
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('itsm_user') || 'null') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('itsm_token') : false,

  login: (token: string, user: AuthUser) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('itsm_token', token);
      localStorage.setItem('itsm_user', JSON.stringify(user));
    }
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('itsm_token');
      localStorage.removeItem('itsm_user');
    }
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
