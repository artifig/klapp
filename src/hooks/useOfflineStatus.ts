import { useState, useEffect } from 'react';

/**
 * Hook to track online/offline status
 * @returns boolean indicating if the app is currently offline
 */
const useOfflineStatus = (): boolean => {
  const [isOffline, setIsOffline] = useState<boolean>(
    typeof window !== 'undefined' ? !window.navigator.onLine : false
  );

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOffline;
};

export default useOfflineStatus; 