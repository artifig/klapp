'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/Card';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { embedServer } from '@/lib/embed';
import { ErrorBoundary } from '@/components/providers/ErrorBoundary';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

export default function EmbedTestPage() {
  return (
    <ErrorBoundary>
      <EmbedTestContent />
    </ErrorBoundary>
  );
}

function EmbedTestContent() {
  const [embedCode, setEmbedCode] = useState<string>('');
  const [width, setWidth] = useState<string>('100%');
  const [height, setHeight] = useState<string>('600px');
  const [allowFullscreen, setAllowFullscreen] = useState<boolean>(true);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const baseUrl = window.location.origin;
      setPreviewUrl(`${baseUrl}/embed`);
    }
  }, []);
  
  // Function to generate embed code based on current settings
  const generateEmbedCode = () => {
    if (!previewUrl) return;
    
    const code = embedServer.generateEmbedCode({
      url: previewUrl,
      width,
      height,
      allowFullscreen,
    });
    
    setEmbedCode(code);
  };
  
  useEffect(() => {
    generateEmbedCode();
  }, [width, height, allowFullscreen, previewUrl]);
  
  return (
    <ResponsiveLayout>
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-2">AI-valmiduse hindaja</h1>
        <p className="text-muted-foreground mb-6">Sisesta see kood oma veebilehele, et pakkuda kasutajatele AI-valmiduse hindamist.</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Manusta seaded</CardTitle>
                <CardDescription>Kohanda, kuidas hindaja sinu veebilehel kuvatakse</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Laius
                    </label>
                    <div className="flex gap-4">
                      <Button 
                        variant={width === '100%' ? 'default' : 'outline'} 
                        onClick={() => setWidth('100%')}
                        size="sm"
                      >
                        100%
                      </Button>
                      <Button 
                        variant={width === '500px' ? 'default' : 'outline'} 
                        onClick={() => setWidth('500px')}
                        size="sm"
                      >
                        500px
                      </Button>
                      <Button 
                        variant={width === '800px' ? 'default' : 'outline'} 
                        onClick={() => setWidth('800px')}
                        size="sm"
                      >
                        800px
                      </Button>
                      <Input 
                        placeholder="Kohandatud laius" 
                        value={!['100%', '500px', '800px'].includes(width) ? width : ''} 
                        onChange={(e) => setWidth(e.target.value)}
                        className="max-w-[150px]"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Kõrgus
                    </label>
                    <div className="flex gap-4">
                      <Button 
                        variant={height === '400px' ? 'default' : 'outline'} 
                        onClick={() => setHeight('400px')}
                        size="sm"
                      >
                        400px
                      </Button>
                      <Button 
                        variant={height === '600px' ? 'default' : 'outline'} 
                        onClick={() => setHeight('600px')}
                        size="sm"
                      >
                        600px
                      </Button>
                      <Button 
                        variant={height === '800px' ? 'default' : 'outline'} 
                        onClick={() => setHeight('800px')}
                        size="sm"
                      >
                        800px
                      </Button>
                      <Input 
                        placeholder="Kohandatud kõrgus" 
                        value={!['400px', '600px', '800px'].includes(height) ? height : ''} 
                        onChange={(e) => setHeight(e.target.value)}
                        className="max-w-[150px]"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={allowFullscreen} 
                        onChange={(e) => setAllowFullscreen(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">Luba täisekraan</span>
                    </label>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col items-start border-t pt-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  HTML kood
                  <Badge variant="outline" className="ml-2">Kopeeri see oma veebilehele</Badge>
                </label>
                <div className="relative w-full">
                  <pre className="bg-accent p-4 rounded-md overflow-x-auto text-xs">
                    <code>{embedCode}</code>
                  </pre>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute top-2 right-2"
                    onClick={() => {
                      navigator.clipboard.writeText(embedCode);
                      alert('HTML kood kopeeritud!');
                    }}
                  >
                    Kopeeri
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Eelvaade</CardTitle>
                <CardDescription>Nii näeb hindaja välja teie veebilehel</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {previewUrl && (
                  <div className="border rounded-md overflow-hidden bg-muted/20">
                    <iframe 
                      src={previewUrl}
                      width={width}
                      height={height}
                      style={{ border: 'none' }}
                      allowFullScreen={allowFullscreen}
                      className="mx-auto"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
} 