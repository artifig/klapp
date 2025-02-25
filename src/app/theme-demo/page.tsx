'use client';

import React from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { ThemeSelector } from '@/components/ui/ThemeSelector';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/components/providers/ThemeProvider';
import { ErrorBoundary } from '@/components/providers/ErrorBoundary';

export default function ThemeDemoPage() {
  return (
    <ErrorBoundary>
      <ThemeDemoContent />
    </ErrorBoundary>
  );
}

function ThemeDemoContent() {
  const { theme } = useTheme();
  
  return (
    <ResponsiveLayout>
      <div className="py-8 space-y-8">
        <div className="flex flex-col space-y-4">
          <h1 className="text-3xl font-bold">Theme Demo</h1>
          <p className="text-muted-foreground">
            This page demonstrates how the theme variables are applied to different UI components.
          </p>
        </div>
        
        <ThemeSelector />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Theme Variables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Colors</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(theme.colors).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <div 
                        className="w-6 h-6 rounded border border-border" 
                        style={{ backgroundColor: value }}
                      />
                      <span className="text-sm">{key}: {value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Typography</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h1 className="text-4xl font-bold">Heading 1</h1>
            <h2 className="text-3xl font-bold">Heading 2</h2>
            <h3 className="text-2xl font-bold">Heading 3</h3>
            <h4 className="text-xl font-bold">Heading 4</h4>
            <p className="text-base">Regular paragraph text</p>
            <p className="text-sm text-muted-foreground">Small muted text</p>
            <div>
              <a href="#" className="text-primary hover:underline">Primary Link</a>
            </div>
          </CardContent>
        </Card>
        
        <div className="pt-4">
          <Card interactive>
            <CardHeader>
              <CardTitle>Interactive Elements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Input Field</label>
                  <input 
                    type="text" 
                    placeholder="Type something..." 
                    className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Select</label>
                  <select className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:outline-none">
                    <option>Option 1</option>
                    <option>Option 2</option>
                    <option>Option 3</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Checkbox</label>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="check1" 
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <label htmlFor="check1" className="ml-2 text-sm">Check me</label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ResponsiveLayout>
  );
} 