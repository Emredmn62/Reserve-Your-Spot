import { create } from 'zustand';
import { User, AuthSession } from '../types';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  session: AuthSession | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  isBusinessOwner: boolean;

  setUser: (user: User | null) => void;
  setSession: (session: AuthSession | null) => void;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string, phone: string, isBusinessOwner: boolean) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  loadStoredSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isLoggedIn: false,
  isBusinessOwner: false,

  setUser: (user) => set({ user, isLoggedIn: !!user, isBusinessOwner: user?.is_business_owner ?? false }),
  setSession: (session) => set({ session }),

  signIn: async (email, password) => {
    set({ isLoading: true });
    const { session, error } = await authService.signIn(email, password);
    if (session) {
      set({
        session,
        user: session.user,
        isLoggedIn: true,
        isBusinessOwner: session.user.is_business_owner,
        isLoading: false,
      });
    } else {
      set({ isLoading: false });
    }
    return { error };
  },

  signUp: async (email, password, fullName, phone, isBusinessOwner) => {
    set({ isLoading: true });
    const { error } = await authService.signUp(email, password, fullName, phone, isBusinessOwner);
    set({ isLoading: false });
    return { error };
  },

  signOut: async () => {
    await authService.signOut();
    set({ user: null, session: null, isLoggedIn: false, isBusinessOwner: false });
  },

  loadStoredSession: async () => {
    set({ isLoading: true });
    const stored = await authService.getStoredSession();
    if (stored) {
      const user = await authService.getCurrentUser();
      set({
        session: stored,
        user,
        isLoggedIn: !!user,
        isBusinessOwner: user?.is_business_owner ?? false,
        isLoading: false,
      });
    } else {
      set({ isLoading: false });
    }
  },
}));
