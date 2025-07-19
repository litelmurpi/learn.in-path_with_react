import { useState, useEffect, useCallback, useRef } from "react";
import api from "../services/api";

export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const abortControllerRef = useRef(null);

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      if (!url) return;

      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new AbortController
      abortControllerRef.current = new AbortController();

      try {
        setLoading(true);
        setError(null);

        const response = await api.cachedGet(url, {
          ...options,
          forceRefresh,
          signal: abortControllerRef.current.signal,
        });

        setData(response.data);
        setIsFromCache(response.fromCache || false);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    },
    [url, JSON.stringify(options)]
  );

  useEffect(() => {
    fetchData();

    return () => {
      // Cleanup: cancel request on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  const refetch = useCallback(
    (forceRefresh = true) => {
      fetchData(forceRefresh);
    },
    [fetchData]
  );

  return { data, loading, error, refetch, isFromCache };
};
