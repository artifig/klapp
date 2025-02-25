import { Theme, createTheme } from './theme';

/**
 * Brand interface for customizing the application look and feel
 */
export interface Brand {
  name: string;               // Company/brand name
  logo: {                     // Logo information
    src: string;              // URL to the logo image
    alt: string;              // Alt text for the logo
    width: number;            // Logo width
    height: number;           // Logo height
  };
  colors: {                   // Brand colors
    primary: string;          // Primary brand color
    secondary?: string;       // Secondary brand color
    accent?: string;          // Accent color
    background?: string;      // Background color
    foreground?: string;      // Text color
    gradient1?: string;       // Dark orange for gradient
    gradient2?: string;       // Primary orange for gradient
    gradient3?: string;       // Light orange for gradient
    success?: string;         // Success color
  };
  fonts?: {                   // Optional custom fonts
    headings?: string;        // Font for headings
    body?: string;            // Font for body text
    condensed?: string;       // Font for condensed bold text
  };
  slogan?: string;            // Brand slogan
}

/**
 * Default brand configuration based on the new brand identity
 */
export const defaultBrand: Brand = {
  name: 'Tehnopol',
  logo: {
    src: '/logo.svg',
    alt: 'Tehnopol Logo',
    width: 120,
    height: 40,
  },
  colors: {
    primary: '#EB8B00',         // Primary Orange
    secondary: '#FF6600',       // Dark Orange (Tumeoranž)
    accent: '#FFCC00',          // Light Orange (Heleoranž)
    foreground: '#4D4D4D',      // Gray (Hall)
    success: '#70AF34',         // Green (Roheline)
    gradient1: '#FF6600',       // Dark orange
    gradient2: '#EB8B00',       // Primary orange
    gradient3: '#FFCC00',       // Light orange
  },
  slogan: 'UNLOCKING THE POTENTIAL',
};

/**
 * Creates a full theme from brand settings
 */
export function createBrandTheme(brand: Partial<Brand> = {}): Theme {
  // Merge with default brand
  const mergedBrand: Brand = {
    ...defaultBrand,
    ...brand,
    colors: {
      ...defaultBrand.colors,
      ...(brand.colors || {}),
    },
    logo: {
      ...defaultBrand.logo,
      ...(brand.logo || {}),
    },
  };

  // Create theme from brand
  return createTheme({
    colors: {
      primary: mergedBrand.colors.primary,
      secondary: mergedBrand.colors.secondary ?? defaultBrand.colors.secondary as string,
      accent: mergedBrand.colors.accent ?? defaultBrand.colors.accent as string,
      background: mergedBrand.colors.background ?? '#ffffff',
      foreground: mergedBrand.colors.foreground ?? '#4D4D4D',
      muted: '#f3f4f6',
      mutedForeground: '#6b7280',
      border: '#e5e7eb',
      input: '#e5e7eb',
      success: mergedBrand.colors.success ?? '#70AF34',
      warning: '#FFCC00',
      error: '#FF6600',
      gradient1: mergedBrand.colors.gradient1 ?? '#FF6600',
      gradient2: mergedBrand.colors.gradient2 ?? '#EB8B00',
      gradient3: mergedBrand.colors.gradient3 ?? '#FFCC00',
    },
    // Custom font family if provided
    fontFamily: {
      sans: mergedBrand.fonts?.body || '"Helvetica Neue", Arial, "Helvetica", sans-serif',
      mono: 'var(--font-geist-mono)',
      condensed: mergedBrand.fonts?.condensed || '"Helvetica Neue Condensed Bold", "Arial Narrow Bold", sans-serif',
    },
  });
}

/**
 * Example brand configurations based on the brand identity
 */
export const brandConfigurations = {
  default: defaultBrand,
  
  // Modern Orange Theme (Primary Brand)
  modern: {
    name: 'Modern Orange',
    logo: {
      src: '/orange-logo.svg',
      alt: 'Modern Orange Logo',
      width: 120,
      height: 40,
    },
    colors: {
      primary: '#EB8B00',      // Primary Orange
      secondary: '#FF6600',    // Dark Orange
      accent: '#FFCC00',       // Light Orange
      foreground: '#4D4D4D',   // Gray
      success: '#70AF34',      // Green
    },
    slogan: 'UNLOCKING THE POTENTIAL',
  },
  
  // Dark Theme with Orange Accents
  dark: {
    name: 'Dark Theme',
    logo: {
      src: '/dark-logo.svg',
      alt: 'Dark Theme Logo',
      width: 120,
      height: 40,
    },
    colors: {
      primary: '#EB8B00',      // Primary Orange
      secondary: '#FF6600',    // Dark Orange
      accent: '#FFCC00',       // Light Orange
      background: '#1A1A1A',   // Dark background
      foreground: '#FFFFFF',   // White text
      success: '#70AF34',      // Green
    },
    slogan: 'UNLOCKING THE POTENTIAL',
  },
  
  // Light Theme with Minimal Orange
  light: {
    name: 'Light Theme',
    logo: {
      src: '/light-logo.svg',
      alt: 'Light Theme Logo',
      width: 120,
      height: 40,
    },
    colors: {
      primary: '#EB8B00',      // Primary Orange
      secondary: '#FF6600',    // Dark Orange  
      accent: '#FFCC00',       // Light Orange
      background: '#F5F5F5',   // Light Gray background
      foreground: '#4D4D4D',   // Gray text
      success: '#70AF34',      // Green
    },
    slogan: 'UNLOCKING THE POTENTIAL',
  },
} as const; 