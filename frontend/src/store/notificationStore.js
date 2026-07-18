import { create } from 'zustand';

const useNotificationStore = create((set, get) => ({
  notifications: [
    { id: 1, message: 'Welcome to StockerAI Enterprise ERP!', time: 'Just now', type: 'info', read: false },
    { id: 2, message: 'Low Stock Alert: SKU-1092 count under minimum threshold.', time: '10m ago', type: 'warning', read: false },
    { id: 3, message: 'New Purchase Order PO-0294 compiled successfully.', time: '1h ago', type: 'success', read: false },
    { id: 4, message: 'Supplier "Tech Components Ltd" catalog synchronized.', time: '2h ago', type: 'info', read: true }
  ],
  isOpen: false,
  setOpen: (isOpen) => set({ isOpen }),
  addNotification: (message, type = 'info') => {
    const newNotif = {
      id: Date.now(),
      message,
      time: 'Just now',
      type,
      read: false
    };
    set((state) => ({
      notifications: [newNotif, ...state.notifications]
    }));
  },
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
  })),
  markAllRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true }))
  })),
  clearNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  clearAll: () => set({ notifications: [] })
}));

export default useNotificationStore;
