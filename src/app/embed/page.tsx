'use client';

import { useEffect } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { embedClient } from '@/lib/embed';

export default function EmbedPage() {
  const { setIsEmbedded } = useTheme();
  
  useEffect(() => {
    // Force embedded mode
    setIsEmbedded(true);
    
    // Initialize embed client
    embedClient.initialize({
      autoResize: true,
    });
  }, [setIsEmbedded]);
  
  return (
    <ResponsiveLayout>
      <div className="p-4">
        {/* Main content of the embedded application */}
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-foreground">
            AI Readiness Assessment
          </h1>
          
          <p className="text-muted-foreground">
            This tool helps you assess your organization's readiness for AI adoption.
          </p>
          
          {/* Your application's main functionality goes here */}
          {/* This should be the same as your main app, but adapted for embedded view */}
        </div>
      </div>
    </ResponsiveLayout>
  );
} 