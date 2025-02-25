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

function BrandHeader() {
  const { theme } = useTheme();
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-condensed tracking-wide">TEHNOPOL</h1>
        <p className="brand-slogan">{theme.colors.primary === '#EB8B00' ? 'UNLOCKING THE POTENTIAL' : 'Choose a brand theme below'}</p>
      </div>
    </div>
  );
}

function ThemeDemoContent() {
  return (
    <ResponsiveLayout 
      withDiagonalHeader={true} 
      withBrandGradient={true}
      header={<BrandHeader />}
    >
      <div className="py-8 space-y-8">
        <div className="flex flex-col space-y-4">
          <h1 className="text-3xl font-condensed uppercase">Brand Identity Demo</h1>
          <p className="text-muted-foreground">
            This page demonstrates the new brand identity with its angular design elements, orange color palette, and modern UI components.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-8">
          {/* Theme Selector */}
          <section>
            <Card variant="gradient" diagonal={true} className="shadow-modern">
              <CardHeader>
                <CardTitle className="font-condensed">THEME SELECTOR</CardTitle>
              </CardHeader>
              <CardContent>
                <ThemeSelector />
              </CardContent>
            </Card>
          </section>
          
          {/* Color Palette */}
          <section className="space-y-4">
            <h2 className="text-2xl font-condensed uppercase">Brand Color Palette</h2>
            <Card diagonal={true} className="shadow-modern">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Primary Colors</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <ColorSwatch name="Primary" color="primary" hex="#EB8B00" />
                      <ColorSwatch name="Secondary" color="secondary" hex="#FF6600" />
                      <ColorSwatch name="Accent" color="accent" hex="#FFCC00" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Supporting Colors</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <ColorSwatch name="Background" color="background" hex="#FFFFFF" />
                      <ColorSwatch name="Foreground" color="foreground" hex="#4D4D4D" />
                      <ColorSwatch name="Success" color="success" hex="#70AF34" />
                      <ColorSwatch name="Error" color="error" hex="#FF6600" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Brand Gradient</h3>
                    <div className="h-12 rounded-md brand-gradient"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
          
          {/* Typography */}
          <section className="space-y-4">
            <h2 className="text-2xl font-condensed uppercase">Typography</h2>
            <Card diagonal={true} className="shadow-modern">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Headers</h3>
                  <div className="space-y-4 border-l-4 border-primary pl-4">
                    <h1 className="text-4xl font-condensed">Heading 1 - Condensed Bold</h1>
                    <h2 className="text-3xl font-condensed">Heading 2 - Condensed Bold</h2>
                    <h3 className="text-2xl font-bold">Heading 3 - Bold</h3>
                    <h4 className="text-xl font-bold">Heading 4 - Bold</h4>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Body Text</h3>
                  <div className="space-y-4">
                    <p className="text-base">
                      Regular paragraph text in Helvetica Neue. The brand tone is &ldquo;UNLOCKING THE POTENTIAL.&rdquo; 
                      It conveys optimism, forward momentum, and a can-do attitude. The aesthetic is clean, 
                      modern, and innovative, with a focus on technology.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Small muted text for secondary information.
                    </p>
                    <div>
                      <a href="#" className="text-primary hover:underline">Primary Link</a>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Brand Slogan</h3>
                  <div className="brand-slogan">UNLOCKING THE POTENTIAL</div>
                </div>
              </CardContent>
            </Card>
          </section>
          
          {/* UI Components */}
          <section className="space-y-4">
            <h2 className="text-2xl font-condensed uppercase">UI Components</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Buttons */}
              <Card diagonal={true} className="shadow-modern">
                <CardHeader>
                  <CardTitle>Buttons</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Button variant="default" diagonal={true}>Primary</Button>
                    <Button variant="secondary" diagonal={true}>Secondary</Button>
                    <Button variant="gradient" diagonal={true}>Gradient</Button>
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" diagonal={true}>Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive" diagonal={true}>Destructive</Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Cards */}
              <Card diagonal={true} className="shadow-modern">
                <CardHeader>
                  <CardTitle>Cards</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card variant="elevated" diagonal={true} className="p-4">
                      <p className="text-sm">Elevated Card</p>
                    </Card>
                    <Card variant="gradient" diagonal={true} className="p-4">
                      <p className="text-sm">Gradient Card</p>
                    </Card>
                  </div>
                  <Card variant="outlined" diagonal={true} className="p-4">
                    <p className="text-sm">Outlined Card with Diagonal Cut</p>
                  </Card>
                </CardContent>
              </Card>
            </div>
          </section>
          
          {/* Angular Design Elements */}
          <section className="space-y-4">
            <h2 className="text-2xl font-condensed uppercase">Angular Design Elements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card diagonal={true} className="shadow-modern">
                <CardHeader>
                  <CardTitle>Diagonal Elements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="diagonal-top h-32 bg-muted">
                    <div className="p-4 pt-8">Diagonal Top Section</div>
                  </div>
                  <div className="diagonal-bottom h-32 bg-muted">
                    <div className="p-4">Diagonal Bottom Section</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card diagonal={true} className="shadow-modern">
                <CardHeader>
                  <CardTitle>Intersection Motif</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative h-40 bg-muted rounded-md overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full">
                      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient1 opacity-20" 
                           style={{ transform: 'skewX(45deg)', transformOrigin: 'bottom left' }}></div>
                      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient3 opacity-20"
                           style={{ transform: 'skewX(45deg)', transformOrigin: 'top right' }}></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-foreground font-medium">Brand Pattern Example</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </ResponsiveLayout>
  );
}

function ColorSwatch({ name, color, hex }: { name: string; color: string; hex: string }) {
  return (
    <div className="flex flex-col">
      <div className={`h-12 rounded-md bg-${color}`} style={{ backgroundColor: `var(--${color})` }}></div>
      <div className="mt-1">
        <div className="text-sm font-medium">{name}</div>
        <div className="text-xs text-muted-foreground">{hex}</div>
      </div>
    </div>
  );
} 