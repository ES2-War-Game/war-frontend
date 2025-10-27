import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserAuth } from "../types/user";

interface AuthState {
  // single user object (persisted)
  user: UserAuth | null;
  // primary setters/getters
  setUser: (user: UserAuth | null) => void;
  clearUser: () => void;
  getUser: () => UserAuth | null;
  // convenience accessors kept for backward compatibility
  getToken: () => string | null;
  getUserId: () => string | null;
  getUsername: () => string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user: UserAuth | null) => set({ user }),
      clearUser: () => set({ user: null }),
      getUser: () => get().user,
      // convenience derived getters
      getToken: () => {
        const u = get().user;
        return u ? u.token : null;
      },
      getUserId: () => {
        const u = get().user;
        return u ? String(u.id) : null;
      },
      getUsername: () => {
        const u = get().user;
        return u ? u.username : null;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);