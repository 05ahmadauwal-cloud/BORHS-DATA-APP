import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => {
        if (token) localStorage.setItem('accessToken', token);
        else localStorage.removeItem('accessToken');
        set({ accessToken: token });
      },

      login: async (identifier, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authAPI.login({ identifier, password });
          const { user, accessToken } = data;
          get().setToken(accessToken);
          set({ user, isAuthenticated: true });
          return { success: true, user };
        } catch (error) {
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (formData) => {
        set({ isLoading: true });
        try {
          const { data } = await authAPI.register(formData);
          const { user, accessToken } = data;
          get().setToken(accessToken);
          set({ user, isAuthenticated: true });
          return { success: true, user };
        } catch (error) {
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await authAPI.logout();
        } catch {}
        get().setToken(null);
        set({ user: null, isAuthenticated: false });
      },

      refreshUser: async () => {
        try {
          const { data } = await authAPI.getMe();
          set({ user: data.user, isAuthenticated: true });
          return data.user;
        } catch {
          get().logout();
          return null;
        }
      },

      updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),
    }),
    {
      name: 'borhs-auth',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;
