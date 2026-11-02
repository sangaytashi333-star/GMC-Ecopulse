import { useEffect, useState, useCallback } from 'react';

export function useOnlineStatus() {
  const [browserOnline, setBrowserOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const [simulatedOffline, setSimulatedOffline] = useState<boolean>(() => {
    try {
      return localStorage.getItem('gmc_simulated_offline') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleOnline = () => setBrowserOnline(true);
    const handleOffline = () => setBrowserOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleSimulatedOffline = useCallback(() => {
    setSimulatedOffline((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('gmc_simulated_offline', String(next));
      } catch (err) {
        console.warn('Storage error:', err);
      }
      return next;
    });
  }, []);

  // Effective online status (online only if browser is online AND user hasn't toggled simulated remote sector offline mode)
  const isOnline = browserOnline && !simulatedOffline;

  return {
    isOnline,
    browserOnline,
    simulatedOffline,
    toggleSimulatedOffline,
  };
}
