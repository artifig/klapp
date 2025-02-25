// ThemeProvider: Applies theme variables to CSS variables for the application
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeColors, defaultTheme, Theme, createTheme } from '@/lib/theme';

type ThemeContextType = {
  theme: Theme;
  updateTheme: (newTheme: Partial<Theme>) => void;
  isEmbedded: boolean;
  setIsEmbedded: (value: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

type ThemeProviderProps = {
  children: React.ReactNode;
  initialTheme?: Partial<Theme>;
};

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(createTheme(initialTheme));
  const [isEmbedded, setIsEmbedded] = useState<boolean>(false);

  useEffect(() => {
    // Check if the page is embedded in an iframe
    const checkIfEmbedded = () => {
      try {
        return window.self !== window.top;
      } catch (e) {
        return true; // If access to window.top throws an error, we're in an iframe
      }
    };

    setIsEmbedded(checkIfEmbedded());
  }, []);

  useEffect(() => {
    // Apply theme variables to CSS
    const root = document.documentElement;
    
    // Apply colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    // Apply additional custom CSS variables if needed
    // ...
  }, [theme]);

  const updateTheme = (newTheme: Partial<Theme>) => {
    setTheme(createTheme(newTheme));
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, isEmbedded, setIsEmbedded }}>
      <div className={`theme ${isEmbedded ? 'embedded' : 'standalone'}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
} 