import { create } from 'zustand';

const useConfirmStore = create((set) => ({
  isOpen: false,
  title: '',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  type: 'danger', // danger / warning / info
  onConfirm: () => {},
  onCancel: () => {},
  
  askConfirm: ({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger', onConfirm, onCancel }) => {
    set({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      type,
      onConfirm: () => {
        if (onConfirm) onConfirm();
        set({ isOpen: false });
      },
      onCancel: () => {
        if (onCancel) onCancel();
        set({ isOpen: false });
      }
    });
  },
  
  closeConfirm: () => set({ isOpen: false })
}));

export default useConfirmStore;
