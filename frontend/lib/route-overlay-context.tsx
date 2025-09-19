"use client";

import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";

interface RouteOverlayContextValue {
  isActive: boolean;
  message: string | null;
  startTransition: (message?: string) => void;
  stopTransition: () => void;
}

const RouteOverlayContext = createContext<RouteOverlayContextValue | undefined>(undefined);

export function useRouteOverlay(): RouteOverlayContextValue {
  const ctx = useContext(RouteOverlayContext);
  if (!ctx) throw new Error("useRouteOverlay must be used within RouteOverlayProvider");
  return ctx;
}

export function RouteOverlayProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const pathname = usePathname();

  const startTransition = useCallback((msg?: string) => {
    setMessage(msg ?? null);
    setIsActive(true);
  }, []);

  const stopTransition = useCallback(() => {
    setIsActive(false);
    setMessage(null);
  }, []);

  // Auto-clear overlay shortly after route changes
  useEffect(() => {
    if (!isActive) {
      return;
    }
    const id = window.setTimeout(() => {
      stopTransition();
    }, 150);
    return () => window.clearTimeout(id);
  }, [pathname, isActive, stopTransition]);

  const value = useMemo(
    () => ({ isActive, message, startTransition, stopTransition }),
    [isActive, message, startTransition, stopTransition]
  );

  return (
    <RouteOverlayContext.Provider value={value}>
      {children}
      {isActive && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center transition-opacity">
          <div className="flex items-center gap-3 text-sm">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            {message ?? "Loading..."}
          </div>
        </div>
      )}
    </RouteOverlayContext.Provider>
  );
}
