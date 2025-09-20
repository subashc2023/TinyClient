"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useRouteOverlay } from "@/lib/route-overlay-context";
import { ROUTES } from "@/lib/routes";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  redirectTo = ROUTES.login,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { startTransition } = useRouteOverlay();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        startTransition("Redirecting to login...");
        router.replace(redirectTo);
        return;
      }

      if (requireAdmin && user && !user.is_admin) {
        startTransition("Redirecting...");
        router.replace("/workspace");
      }
    }
  }, [isAuthenticated, isLoading, user, requireAdmin, router, redirectTo, startTransition]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requireAdmin && user && !user.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You need administrator privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
