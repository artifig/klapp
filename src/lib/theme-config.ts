// Brand theme configuration based on Tehnopol CVI
// This file contains all the brand-specific design tokens

export type ThemeColors = {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  // Add more brand-specific colors as needed
};

// Tehnopol brand theme
export const brandTheme: ThemeColors = {
  primary: "29 100% 46%", // #EB8B00 - Primary Orange (converted to HSL)
  primaryDark: "22 100% 51%", // #FF6600 - Dark Orange
  primaryLight: "48 100% 50%", // #FFCC00 - Light Orange
  secondary: "0 0% 30%", // #4D4D4D - Gray
  accent: "99 54% 45%", // #70AF34 - Green
  background: "0 0% 100%", // White
  text: "0 0% 30%", // Dark Gray for text
};

// Dark variant of the Tehnopol theme
export const darkBrandTheme: ThemeColors = {
  primary: "29 100% 46%", // #EB8B00 - Primary Orange (maintained in dark mode)
  primaryDark: "22 100% 51%", // #FF6600 - Dark Orange
  primaryLight: "48 100% 50%", // #FFCC00 - Light Orange
  secondary: "0 0% 85%", // Light gray for dark mode
  accent: "99 54% 45%", // #70AF34 - Green
  background: "0 0% 15%", // Dark background
  text: "0 0% 90%", // Light text for dark mode
};

// Font configuration - Tehnopol uses Helvetica Neue with Arial as fallback
export const brandFonts = {
  heading: "'Helvetica Neue', Arial, sans-serif",
  body: "'Helvetica Neue', Arial, sans-serif",
};

// Border radius configuration - Tehnopol uses angular elements
export const brandRadius = {
  sm: "0", // More angular corners rather than rounded
  md: "0.25rem",
  lg: "0.5rem",
};

// Animation timing
export const brandAnimations = {
  fast: "150ms",
  medium: "300ms",
  slow: "500ms",
};

// Spacing scale
export const brandSpacing = {
  xs: "0.5rem",
  sm: "1rem",
  md: "1.5rem",
  lg: "2rem",
  xl: "3rem",
  xxl: "4rem",
}; 