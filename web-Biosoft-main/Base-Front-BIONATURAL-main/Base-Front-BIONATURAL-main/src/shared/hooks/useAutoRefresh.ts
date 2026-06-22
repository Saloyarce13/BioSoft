import { useEffect } from 'react';

/**
 * Hook que ejecuta un callback cada vez que:
 * 1. La pestaña vuelve a estar visible (el usuario cambia de pestaña y regresa)
 * 2. La ventana recupera el foco (alt+tab)
 *
 * Úsalo en cualquier componente que necesite datos frescos sin refresh manual.
 *
 * @param onRefresh - función que recarga los datos (normalmente la misma que usas en useEffect inicial)
 */
export function useAutoRefresh(onRefresh: () => void) {
  useEffect(() => {
    // Refrescar cuando la pestaña vuelve a ser visible
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') onRefresh();
    };

    // Refrescar cuando la ventana recupera el foco
    const handleFocus = () => onRefresh();

    // Refrescar con el evento global app:refresh (disparado desde App.tsx)
    const handleAppRefresh = () => onRefresh();

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('app:refresh', handleAppRefresh);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('app:refresh', handleAppRefresh);
    };
  }, [onRefresh]);
}
