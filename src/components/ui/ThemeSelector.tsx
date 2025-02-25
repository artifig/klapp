'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { brandConfigurations, createBrandTheme } from '@/lib/brand';
import { Button } from './Button';

type ThemeSelectorProps = {
  className?: string;
};

export function ThemeSelector({ className }: ThemeSelectorProps) {
  const { updateTheme } = useTheme();
  
  // Get available theme names
  const themeNames = Object.keys(brandConfigurations) as Array<keyof typeof brandConfigurations>;
  
  // Handle theme change
  const handleThemeChange = (themeName: keyof typeof brandConfigurations) => {
    const brandConfig = brandConfigurations[themeName];
    const theme = createBrandTheme(brandConfig);
    updateTheme(theme);
  };
  
  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      <h3 className="text-lg font-medium">Choose Theme</h3>
      <div className="flex flex-wrap gap-2">
        {themeNames.map((name) => (
          <Button
            key={name}
            variant="outline"
            size="sm"
            onClick={() => handleThemeChange(name)}
          >
            {name}
          </Button>
        ))}
      </div>
    </div>
  );
} 