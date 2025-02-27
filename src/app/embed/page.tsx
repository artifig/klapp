'use client';

import { useEffect } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { embedClient } from '@/lib/embed';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useRouter } from 'next/navigation';

export default function EmbedPage() {
  const { setIsEmbedded } = useTheme();
  const router = useRouter();
  
  useEffect(() => {
    // Force embedded mode
    setIsEmbedded(true);
    
    // Initialize embed client
    embedClient.initialize({
      autoResize: true,
    });
  }, [setIsEmbedded]);
  
  const handleStartAssessment = () => {
    router.push('/assessment');
  };
  
  const handleViewResults = () => {
    // Ideally, this would check if there's a recent assessment and go directly to it
    router.push('/assessment');
  };
  
  return (
    <ResponsiveLayout>
      <div className="p-4 max-w-screen-md mx-auto">
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-primary/10 pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-foreground">
                AI-valmiduse hindamine
              </CardTitle>
              <div className="text-xs text-muted-foreground rounded-full bg-background/80 px-3 py-1">
                Embedded Mode
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="space-y-6">
              <p className="text-muted-foreground">
                See tööriist aitab hinnata teie organisatsiooni valmisolekut tehisintellekti kasutuselevõtuks.
                Vastake küsimustele ja saate kohese ülevaate koos soovitustega.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <Button 
                  onClick={handleStartAssessment} 
                  size="lg" 
                  className="w-full"
                >
                  Alusta uut hindamist
                </Button>
                
                <Button 
                  onClick={handleViewResults}
                  variant="outline" 
                  size="lg"
                  className="w-full"
                >
                  Vaata varasemat tulemust
                </Button>
              </div>
              
              <div className="mt-6 pt-6 border-t border-border text-center">
                <p className="text-xs text-muted-foreground">
                  See hindamistööriist on integreeritud teie veebilehele, et pakkuda kasutajatele parimat kogemust.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsiveLayout>
  );
} 