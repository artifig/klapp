'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { brandConfigurations, createBrandTheme } from '@/lib/brand';
import { Button } from './Button';
import { Card, CardContent } from './Card';

type ThemeSelectorProps = {
  className?: string;
};

export function ThemeSelector({ className }: ThemeSelectorProps) {
  const { updateTheme, theme } = useTheme();
  
  // Get available theme names
  const themeNames = Object.keys(brandConfigurations) as Array<keyof typeof brandConfigurations>;
  
  // Handle theme change
  const handleThemeChange = (themeName: keyof typeof brandConfigurations) => {
    const brandConfig = brandConfigurations[themeName];
    const theme = createBrandTheme(brandConfig);
    updateTheme(theme);
  };
  
  // Calculate if a theme is active
  const isThemeActive = (themeName: keyof typeof brandConfigurations) => {
    const brandConfig = brandConfigurations[themeName];
    return theme.colors.primary === brandConfig.colors.primary;
  };
  
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-bold mb-2 font-condensed">BRAND THEMES</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {themeNames.map((name) => {
          const brandConfig = brandConfigurations[name];
          const isActive = isThemeActive(name);
          
          return (
            <Card 
              key={name} 
              variant={isActive ? "gradient" : "default"}
              diagonal={true}
              interactive={true}
              className="border border-border overflow-hidden"
              onClick={() => handleThemeChange(name)}
            >
              <CardContent className="p-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{brandConfig.name}</span>
                    {isActive && (
                      <span className="text-xs bg-success text-white px-2 py-0.5 rounded-full">Active</span>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 mt-2">
                    <div 
                      className="w-6 h-6 rounded-full border border-border" 
                      style={{ backgroundColor: brandConfig.colors.primary }}
                    />
                    <div 
                      className="w-6 h-6 rounded-full border border-border" 
                      style={{ backgroundColor: brandConfig.colors.secondary }}
                    />
                    <div 
                      className="w-6 h-6 rounded-full border border-border" 
                      style={{ backgroundColor: brandConfig.colors.accent }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="mt-6 pt-4 border-t border-border">
        <h4 className="text-sm font-bold mb-2 text-muted-foreground">QUICK THEME SELECT</h4>
        <div className="flex flex-wrap gap-2">
          {themeNames.map((name) => (
            <Button
              key={name}
              variant={isThemeActive(name) ? "gradient" : "outline"}
              size="sm"
              diagonal={true}
              onClick={() => handleThemeChange(name)}
            >
              {name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
} 