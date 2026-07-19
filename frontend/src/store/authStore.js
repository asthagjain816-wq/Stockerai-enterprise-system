import { create } from 'zustand';

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,

  checkAuth: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/me`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        set({ user: data.user, isAuthenticated: true, loading: false });
      } else {
        set({ user: null, isAuthenticated: false, loading: false });
      }
    } catch (err) {
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success) {
        set({ user: data.user, isAuthenticated: true, loading: false });
        return data;
      } else {
        set({ error: data.message, loading: false });
        throw new Error(data.message);
      }
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  register: async (formData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        set({ user: data.user, isAuthenticated: true, loading: false });
        return data;
      } else {
        set({ error: data.message, loading: false });
        throw new Error(data.message);
      }
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      set({ user: null, isAuthenticated: false, loading: false, error: null });
    }
  },

  clearError: () => set({ error: null }),
  updateUser: (updatedUser) => set((state) => ({ user: { ...state.user, ...updatedUser } })),
}));

export default useAuthStore;