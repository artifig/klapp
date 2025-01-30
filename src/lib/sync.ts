import { useState, useEffect, useCallback, useRef } from 'react';

export type SyncStatus = 'synced' | 'pending' | 'error';

interface SyncConfig<T> {
  key: string;                    // localStorage key
  initialData?: T;               // Initial data
  onSync: (data: T) => Promise<void>; // Function to sync with backend
  debounceMs?: number;           // Debounce time in milliseconds
  retryMs?: number;              // Retry time in milliseconds
}

export function useSync<T>({ 
  key, 
  initialData, 
  onSync, 
  debounceMs = 2000, 
  retryMs = 5000 
}: SyncConfig<T>) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [isOffline, setIsOffline] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const syncTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const syncDebounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Load cached data from localStorage
  useEffect(() => {
    const cached = localStorage.getItem(key);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setData(parsed);
      } catch (err) {
        console.error(`Error parsing cached data for ${key}:`, err);
      }
    }
  }, [key]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      syncData(); // Try to sync when coming back online
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      setSyncStatus('pending');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOffline(!window.navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync data with backend
  const syncData = useCallback(async () => {
    if (isOffline || !data) return;

    try {
      // Clear any existing debounce timeout
      if (syncDebounceRef.current) {
        clearTimeout(syncDebounceRef.current);
      }

      // Debounce the sync operation
      syncDebounceRef.current = setTimeout(async () => {
        setSyncStatus('pending');
        
        // Clear any existing sync retry timeout
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }

        try {
          await onSync(data);
          setSyncStatus('synced');
          localStorage.setItem(key, JSON.stringify(data));
        } catch (err) {
          console.error(`Error syncing ${key}:`, err);
          setSyncStatus('error');
          // Retry sync after delay
          syncTimeoutRef.current = setTimeout(syncData, retryMs);
        }
      }, debounceMs);
    } catch (err) {
      console.error(`Error in sync operation for ${key}:`, err);
      setSyncStatus('error');
    }
  }, [data, isOffline, key, onSync, debounceMs, retryMs]);

  // Update data and trigger sync
  const updateData = useCallback((newData: T | ((prev: T | undefined) => T)) => {
    setData(prev => {
      const updated = typeof newData === 'function' 
        ? (newData as ((prev: T | undefined) => T))(prev)
        : newData;
      
      // Cache immediately
      localStorage.setItem(key, JSON.stringify(updated));
      return updated;
    });
  }, [key]);

  // Sync whenever data changes
  useEffect(() => {
    syncData();
    
    // Cleanup timeouts
    return () => {
      if (syncDebounceRef.current) {
        clearTimeout(syncDebounceRef.current);
      }
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [data, syncData]);

  return {
    data,
    updateData,
    isOffline,
    syncStatus,
    syncData
  };
} 