import { create } from 'zustand';
import { saveToken, deleteToken } from '../utils/secureStore';

interface User {
  _id: string;
  username: string;
  displayName: string;
  email: string;
  profileImage?: string;
  bio?: string;
  followingCount?: number;
  followersCount?: number;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (user: User, token: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: true, // Initial loading state for checking token
  login: async (user, token, refreshToken) => {
    await saveToken('accessToken', token);
    await saveToken('refreshToken', refreshToken);
    set({ user, accessToken: token, isLoading: false });
  },
  logout: async () => {
    await deleteToken('accessToken');
    await deleteToken('refreshToken');
    set({ user: null, accessToken: null, isLoading: false });
  },
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}));
