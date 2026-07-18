import { create } from 'zustand';

const useActivityStore = create((set, get) => ({
  activities: JSON.parse(localStorage.getItem('erp_activities') || '[]'),
  recentlyVisited: JSON.parse(localStorage.getItem('erp_recently_visited') || '[]'),
  favorites: JSON.parse(localStorage.getItem('erp_favorites') || '[]'),
  recentExports: JSON.parse(localStorage.getItem('erp_recent_exports') || '[]'),

  addActivity: (message, type = 'info') => {
    const newAct = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toISOString()
    };
    const updated = [newAct, ...get().activities].slice(0, 50); // limit to 50
    localStorage.setItem('erp_activities', JSON.stringify(updated));
    set({ activities: updated });
  },

  trackVisit: (path, name) => {
    // Avoid double logging identical subsequent routes
    const list = get().recentlyVisited.filter(v => v.path !== path);
    const updated = [{ path, name, timestamp: Date.now() }, ...list].slice(0, 8); // limit to 8
    localStorage.setItem('erp_recently_visited', JSON.stringify(updated));
    set({ recentlyVisited: updated });
  },

  toggleFavorite: (path, name) => {
    const isFav = get().favorites.some(f => f.path === path);
    let updated;
    if (isFav) {
      updated = get().favorites.filter(f => f.path !== path);
    } else {
      updated = [...get().favorites, { path, name }];
    }
    localStorage.setItem('erp_favorites', JSON.stringify(updated));
    set({ favorites: updated });
  },

  addExport: (name, format) => {
    const newExport = {
      id: Date.now(),
      name,
      format,
      timestamp: new Date().toISOString()
    };
    const updated = [newExport, ...get().recentExports].slice(0, 20);
    localStorage.setItem('erp_recent_exports', JSON.stringify(updated));
    set({ recentExports: updated });
  },

  clearHistory: () => {
    localStorage.removeItem('erp_activities');
    localStorage.removeItem('erp_recently_visited');
    localStorage.removeItem('erp_favorites');
    localStorage.removeItem('erp_recent_exports');
    set({ activities: [], recentlyVisited: [], favorites: [], recentExports: [] });
  }
}));

export default useActivityStore;
