import { create } from 'zustand';

export type UserRole = 'ROLE_EMPLOYER' | 'ROLE_CANDIDATE' | 'ROLE_ADMIN';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  profileId?: number; // EmployerProfile or CandidateProfile ID
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Initially true while checking SecureStore for token
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
