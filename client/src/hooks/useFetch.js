import { useState, useCallback } from "react";

export function useFetch(token) {
  const [networkError, setNetworkError] = useState(false);

  const fetchWithHandling = useCallback(
    async (url, options = {}) => {
      setNetworkError(false);
      try {
        const res = await fetch(url, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers,
          },
        });

        // Token expiré
        if (res.status === 401) {
          window.location.href = "/connect";
          return null;
        }

        return res;
      } catch {
        // Erreur réseau — serveur inaccessible
        setNetworkError(true);
        return null;
      }
    },
    [token],
  );

  return { fetchWithHandling, networkError, setNetworkError };
}
