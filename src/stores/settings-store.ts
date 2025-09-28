import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AppSettings {
  darkMode: boolean;
  locationServices: boolean;
  analytics: boolean;
}

interface SettingsActions {
  updateSettings: (settings: Partial<AppSettings>) => void;
  toggleDarkMode: () => void;
  toggleLocationServices: () => void;
  toggleAnalytics: () => void;
}

type SettingsStore = AppSettings & SettingsActions;

const defaultSettings: AppSettings = {
  darkMode: false,
  locationServices: true,
  analytics: true,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      updateSettings: (newSettings) => set((state) => ({ ...state, ...newSettings })),

      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      toggleLocationServices: () => set((state) => ({ locationServices: !state.locationServices })),

      toggleAnalytics: () => set((state) => ({ analytics: !state.analytics })),
    }),
    {
      name: 'app-settings',
      storage: createJSONStorage(() => {
        try {
          return require('@react-native-async-storage/async-storage').default;
        } catch (e) {
          console.warn('AsyncStorage not available, settings will not persist');
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
      }),
    }
  )
);