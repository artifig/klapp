'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import ClientOnly from '@/components/ClientOnly';

interface EmbedContextType {
  isEmbedded: boolean;
  frameHeight: number;
}

const EmbedContext = createContext<EmbedContextType>({
  isEmbedded: false,
  frameHeight: 0
});

export function EmbedProvider({ children }: { children: React.ReactNode }) {
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [frameHeight, setFrameHeight] = useState(0);

  useEffect(() => {
    try {
      setIsEmbedded(window !== window.parent);
    } catch (e) {
      setIsEmbedded(false);
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'resize') {
        setFrameHeight(event.data.height);
      }
    };

    window.addEventListener('message', handleMessage);
    
    const resizeObserver = new ResizeObserver((entries) => {
      const height = entries[0].contentRect.height;
      if (window !== window.parent) {
        window.parent.postMessage({ type: 'resize', height }, '*');
      }
    });

    const body = document.body;
    resizeObserver.observe(body);

    return () => {
      window.removeEventListener('message', handleMessage);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <ClientOnly>
      <EmbedContext.Provider value={{ isEmbedded, frameHeight }}>
        {children}
      </EmbedContext.Provider>
    </ClientOnly>
  );
}

export const useEmbed = () => useContext(EmbedContext); 
