import { useState, useEffect } from "react";

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState(
    navigator.connection?.effectiveType || "unknown"
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleConnectionChange = () => {
      setConnectionType(navigator.connection?.effectiveType || "unknown");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (navigator.connection) {
      navigator.connection.addEventListener("change", handleConnectionChange);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);

      if (navigator.connection) {
        navigator.connection.removeEventListener(
          "change",
          handleConnectionChange
        );
      }
    };
  }, []);

  return { isOnline, connectionType };
};
