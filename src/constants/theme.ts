export const Colors = {
  light: {
    text: '#000000', // Improved contrast
    background: '#fff',
    tint: '#138AFE',
    icon: '#333333', // Darker for better visibility
    tabIconDefault: '#666666',
    tabIconSelected: '#138AFE',
    secondaryText: '#555555', // For less important text
    mutedText: '#888888', // For timestamps, etc.
    border: '#E5E7EB',
    cardBackground: '#FFFFFF',
    inputBackground: '#F9FAFB',
  },
  dark: {
    text: '#FFFFFF', // Pure white for dark mode
    background: '#000000', // Pure black background
    tint: '#138AFE',
    icon: '#CCCCCC', // Lighter for dark mode
    tabIconDefault: '#888888',
    tabIconSelected: '#138AFE',
    secondaryText: '#BBBBBB',
    mutedText: '#777777',
    border: '#333333',
    cardBackground: '#1A1A1A',
    inputBackground: '#2A2A2A',
  },
};

// Enhanced Typography System for Better Readability
export const Typography = {
  // Display/Headlines
  displayLarge: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  displayMedium: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '600' as const,
    letterSpacing: -0.25,
  },
  displaySmall: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as const,
    letterSpacing: 0,
  },

  // Headlines
  headlineLarge: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600' as const,
    letterSpacing: 0,
  },
  headlineMedium: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600' as const,
    letterSpacing: 0,
  },
  headlineSmall: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
    letterSpacing: 0,
  },

  // Titles
  titleLarge: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '500' as const,
    letterSpacing: 0,
  },
  titleMedium: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '500' as const,
    letterSpacing: 0.15,
  },
  titleSmall: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
  },

  // Body Text
  bodyLarge: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '400' as const,
    letterSpacing: 0.5,
  },
  bodyMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
    letterSpacing: 0.25,
  },

  // Labels
  labelLarge: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
  },
};

// Spacing constants for consistent layout
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Border radius constants
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};