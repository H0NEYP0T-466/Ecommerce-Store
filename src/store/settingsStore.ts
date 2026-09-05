import { create } from 'zustand';
import type { SiteSettings } from '../types';
import api from '../services/api';

interface SettingsState {
  settings: SiteSettings | null;
  isLoading: boolean;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  isLoading: false,

  loadSettings: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/api/settings');
      set({ settings: res.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
