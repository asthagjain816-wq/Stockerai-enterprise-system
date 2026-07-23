import { create } from 'zustand';
import { getApiBaseUrl } from '../config/apiConfig';

const API_URL = `${getApiBaseUrl()}/api/auth`;

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,

  checkAuth: async (retries = 2) => {
    set({ loading: true, error: null });

    // Check local storage fallback first
    const storedUser = localStorage.getItem('stockerai_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        set({ user: parsedUser, isAuthenticated: true, loading: false });
        return;
      } catch (e) {}
    }

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(`${API_URL}/me`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        const data = await response.json();
        if (data.success) {
          set({ user: data.user, isAuthenticated: true, loading: false });
          localStorage.setItem('stockerai_user', JSON.stringify(data.user));
          return;
        } else {
          set({ user: null, isAuthenticated: false, loading: false });
          localStorage.removeItem('stockerai_user');
          return;
        }
      } catch (err) {
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 2500));
        } else {
          set({ user: null, isAuthenticated: false, loading: false });
        }
      }
    }
  },

  login: async (email, password) => {
    set({ user: null, isAuthenticated: false, loading: true, error: null });
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
        localStorage.setItem('stockerai_user', JSON.stringify(data.user));
        return data;
      } else {
        set({ user: null, isAuthenticated: false, error: data.message, loading: false });
        localStorage.removeItem('stockerai_user');
        throw new Error(data.message);
      }
    } catch (err) {
      set({ user: null, isAuthenticated: false, error: err.message, loading: false });
      localStorage.removeItem('stockerai_user');
      throw err;
    }
  },

  register: async (formData) => {
    set({ user: null, isAuthenticated: false, loading: true, error: null });
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
        localStorage.setItem('stockerai_user', JSON.stringify(data.user));
        return data;
      } else {
        set({ user: null, isAuthenticated: false, error: data.message, loading: false });
        localStorage.removeItem('stockerai_user');
        throw new Error(data.message);
      }
    } catch (err) {
      set({ user: null, isAuthenticated: false, error: err.message, loading: false });
      localStorage.removeItem('stockerai_user');
      throw err;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      localStorage.removeItem('stockerai_user');
      localStorage.removeItem('stockerai_token');
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