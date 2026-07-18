import { create } from 'zustand';

const useToastStore = create((set) => ({
  toasts: [],
  
  showToast: (message, type = 'success') => {
    const id = Date.now();
    const newToast = { id, message, type };
    
    set((state) => ({
      toasts: [...state.toasts, newToast]
    }));

    // Auto remove after 3.5 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter(t => t.id !== id)
      }));
    }, 3500);
  },

  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter(t => t.id !== id)
  }))
}));

export default useToastStore;
