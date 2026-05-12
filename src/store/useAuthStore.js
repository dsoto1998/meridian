import { create } from 'zustand';

const useAuthStore = create((set) => ({
  isUnlocked: false,
  unlock: () => set({ isUnlocked: true }),
  lock: () => set({ isUnlocked: false }),
}));

export default useAuthStore;
