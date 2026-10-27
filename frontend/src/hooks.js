import { useCallback, useEffect, useState } from 'react';

// Loads data from the API on mount (useEffect) and exposes a reload function.
export function useFetch(fetcher) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await fetcher());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}

// Short-lived success/error banner message.
export function useFlash(timeout = 3000) {
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), timeout);
    return () => clearTimeout(t);
  }, [flash, timeout]);

  return [flash, setFlash];
}

export const LOW_STOCK_LIMIT = 2;
