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
  };
  fonts?: {                   // Optional custom fonts
    headings?: string;        // Font for headings
    body?: string;            // Font for body text
  };
  // Add more brand properties as needed
}

/**
 * Default brand configuration
 */
export const defaultBrand: Brand = {
  name: 'AI Readiness',
  logo: {
    src: '/logo.svg',
    alt: 'AI Readiness Logo',
    width: 120,
    height: 40,
  },
  colors: {
    primary: '#0070f3',
    secondary: '#7928ca',
    accent: '#f59e0b',
  },
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
      foreground: mergedBrand.colors.foreground ?? '#000000',
      muted: '#f3f4f6',
      mutedForeground: '#6b7280',
      border: '#e5e7eb',
      input: '#e5e7eb',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    // Custom font family if provided
    ...(mergedBrand.fonts && {
      fontFamily: {
        sans: mergedBrand.fonts.body || 'var(--font-geist-sans)',
        mono: 'var(--font-geist-mono)',
      },
    }),
  });
}

/**
 * Example brand configurations
 */
export const brandConfigurations = {
  default: defaultBrand,
  
  // Example brand: Blue theme
  blue: {
    name: 'Blue Theme',
    logo: {
      src: '/blue-logo.svg',
      alt: 'Blue Theme Logo',
      width: 120,
      height: 40,
    },
    colors: {
      primary: '#2563eb',
      secondary: '#4f46e5',
      accent: '#0ea5e9',
    },
  },
  
  // Example brand: Green theme
  green: {
    name: 'Green Theme',
    logo: {
      src: '/green-logo.svg',
      alt: 'Green Theme Logo',
      width: 120,
      height: 40,
    },
    colors: {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#84cc16',
    },
  },
} as const; 