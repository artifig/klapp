'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { embedServer } from '@/lib/embed';
import { ErrorBoundary } from '@/components/providers/ErrorBoundary';

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
  const [height, setHeight] = useState<string>('500px');
  const [allowFullscreen, setAllowFullscreen] = useState<boolean>(true);
  
  // Function to generate embed code based on current settings
  const generateEmbedCode = () => {
    const baseUrl = window.location.origin;
    const embedUrl = `${baseUrl}/embed`;
    
    const code = embedServer.generateEmbedCode({
      url: embedUrl,
      width,
      height,
      allowFullscreen,
    });
    
    setEmbedCode(code);
  };
  
  return (
    <ResponsiveLayout>
      <div className="py-8">
        <h1 className="text-2xl font-bold mb-6">Embed Configuration Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Embed Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Width</label>
                  <input
                    type="text"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="w-full p-2 border border-border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Height</label>
                  <input
                    type="text"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full p-2 border border-border rounded"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowFullscreen"
                    checked={allowFullscreen}
                    onChange={(e) => setAllowFullscreen(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="allowFullscreen">Allow Fullscreen</label>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={generateEmbedCode}>Generate Embed Code</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Embed Code</CardTitle>
            </CardHeader>
            <CardContent>
              {embedCode ? (
                <div className="space-y-4">
                  <pre className="bg-muted p-4 rounded overflow-x-auto text-sm">
                    {embedCode}
                  </pre>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(embedCode);
                      alert('Copied to clipboard!');
                    }}
                  >
                    Copy to Clipboard
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Click &quot;Generate Embed Code&quot; to see the embed code here.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        
        {embedCode && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Preview</h2>
            <div className="border border-border rounded p-4">
              <div dangerouslySetInnerHTML={{ __html: embedCode }} />
            </div>
          </div>
        )}
      </div>
    </ResponsiveLayout>
  );
} 