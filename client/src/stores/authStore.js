// stores/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { init, login as loginApi, logout as logoutApi, refreshToken } from '../lib/auth';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const data = await loginApi(email, password);
          set({ user: data.user, accessToken: data.accessToken });
          return { success: true };
        } catch (err) {
          set({ error: err.response?.data?.error || 'Login failed' });
          return { success: false };
        } finally {
          set({ loading: false });
        }
      },

      refresh: async () => {
        try {
          const data = await refreshToken();
          set({ accessToken: data.accessToken });
          return true;
        } catch {
          set({ user: null, accessToken: null });
          return false;
        }
      },

      logout: async () => {
        try {
          await logoutApi();
        } finally {
          set({ user: null, accessToken: null, error: null });
        }
      },

      init: async () => {
        set({ loading: true });
        try {
          const data = await init();
          set({ user: data.user, accessToken: data.accessToken });
          console.log('Auth init success:', data);
        } catch (err) {
          console.log('Auth init failed:', err);
          set({ user: null, accessToken: null });
        } finally {
          set({ loading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

export default useAuthStore;