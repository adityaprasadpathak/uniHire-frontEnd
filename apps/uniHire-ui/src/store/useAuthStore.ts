import { create } from 'zustand';

interface User {
  id?: number;
  email: string;
  role: 'CANDIDATE' | 'EMPLOYER' | 'ADMIN';
  [key: string]: any;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  
  let user = null;
  if (userString) {
    try {
      user = JSON.parse(userString);
    } catch (e) {
      console.error('Failed to parse user from localStorage');
    }
  }

  return {
    isAuthenticated: !!token,
    user,
    token,
    login: (token: string, user: User) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ isAuthenticated: true, user, token });
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ isAuthenticated: false, user: null, token: null });
    },
  };
});
