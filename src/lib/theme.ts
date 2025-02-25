// Theme configuration for the application
// This file contains all the theme variables that can be adjusted for branding

export type ThemeColors = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  input: string;
  success: string;
  warning: string;
  error: string;
  gradient1: string; // Dark orange
  gradient2: string; // Primary orange
  gradient3: string; // Light orange
};

// Default theme colors based on the provided brand identity
export const defaultColors: ThemeColors = {
  // Primary brand color - Orange
  primary: '#EB8B00',
  // Dark Orange (Tumeoranž)
  secondary: '#FF6600',
  // Light Orange (Heleoranž)
  accent: '#FFCC00',
  background: '#ffffff',
  // Gray (Hall)
  foreground: '#4D4D4D',
  muted: '#f3f4f6',
  mutedForeground: '#6b7280',
  border: '#e5e7eb',
  input: '#e5e7eb',
  // Green (Roheline)
  success: '#70AF34',
  warning: '#FFCC00',
  error: '#FF6600',
  // Gradient colors
  gradient1: '#FF6600', // Dark orange
  gradient2: '#EB8B00', // Primary orange
  gradient3: '#FFCC00', // Light orange
};

// Theme configuration
export type Theme = {
  colors: ThemeColors;
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
    diagonal: string; // New diagonal cut for brand identity
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  fontFamily: {
    sans: string;
    mono: string;
    condensed: string; // For condensed bold headers
  };
  spacing: {
    [key: string]: string;
  };
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  angles: {
    brand1: string; // 135 degree angle
    brand2: string; // 90 degree angle
  };
};

// Default theme configuration based on the provided brand identity
export const defaultTheme: Theme = {
  colors: defaultColors,
  borderRadius: {
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px',
    diagonal: 'polygon(0 0, 100% 0, 100% calc(100% - 1rem), calc(100% - 1rem) 100%, 0 100%)', // Diagonal corner cut
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
  },
  fontFamily: {
    sans: '"Helvetica Neue", Arial, "Helvetica", sans-serif',
    mono: 'var(--font-geist-mono)',
    condensed: '"Helvetica Neue Condensed Bold", "Arial Narrow Bold", sans-serif',
  },
  spacing: {
    '0': '0',
    '1': '0.25rem',
    '2': '0.5rem',
    '3': '0.75rem',
    '4': '1rem',
    '5': '1.25rem',
    '6': '1.5rem',
    '8': '2rem',
    '10': '2.5rem',
    '12': '3rem',
    '16': '4rem',
    '20': '5rem',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  angles: {
    brand1: '135deg',
    brand2: '90deg',
  }
};

// Function to merge custom theme with default theme
export function createTheme(customTheme: Partial<Theme> = {}): Theme {
  return {
    ...defaultTheme,
    ...customTheme,
    colors: {
      ...defaultTheme.colors,
      ...(customTheme.colors || {}),
    },
  };
} 