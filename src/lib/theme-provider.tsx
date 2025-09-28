import React, { createContext, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/theme';
import { useSettingsStore } from '../stores/settings-store';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  colors: typeof Colors.light;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const { darkMode, toggleDarkMode } = useSettingsStore();

  // Use manual setting if set, otherwise follow system
  const theme: ThemeType = darkMode ? 'dark' : 'light';
  const colors = Colors[theme];
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    toggleDarkMode();
  };

  // Update status bar style when theme changes
  useEffect(() => {
    // This will be handled by individual screens with StatusBar component
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    colors,
    isDark,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};