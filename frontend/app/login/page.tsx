"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Lock, Mail, AlertCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouteOverlay } from "@/lib/route-overlay-context";

export default function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { startTransition, stopTransition } = useRouteOverlay();

  // Prefetch workspace and redirect if already authenticated
  useEffect(() => {
    router.prefetch("/workspace");
  }, [router]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      startTransition("Opening workspace...");
      router.replace("/workspace");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!emailOrUsername || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      await login(emailOrUsername, password);
      startTransition("Opening workspace...");
      router.replace("/workspace");
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Login failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {isRedirecting && (
        <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-center justify-center">
          <div className="flex items-center gap-3 text-sm">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            Redirecting to workspace...
          </div>
        </div>
      )}
      {/* Left side - Login form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8 max-w-md mx-auto w-full">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          {/* Logo */}
          <div className="flex items-center justify-center mb-6">
            <img
              src="/mcplight.png"
              alt="TinyClient logo light"
              className="block h-8 w-auto dark:hidden"
            />
            <img
              src="/mcp.png"
              alt="TinyClient logo dark"
              className="hidden h-8 w-auto dark:block"
            />
            <span className="ml-2 text-xl font-semibold">TinyClient</span>
          </div>

          <h2 className="text-center text-2xl font-bold leading-9 tracking-tight">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Welcome back! Please sign in to continue.
          </p>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <div className="ml-3">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="emailOrUsername" className="block text-sm font-medium leading-6">
                Email or Username
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="emailOrUsername"
                  name="emailOrUsername"
                  type="text"
                  autoComplete="username"
                  required
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-input bg-background rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="Enter your email or username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium leading-6">
                Password
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2 border border-input bg-background rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-muted-foreground">Demo credentials</span>
              </div>
            </div>

            <div className="mt-4 text-xs text-center text-muted-foreground space-y-1">
              <p><strong>Admin:</strong> admin@example.com (or 'admin') / admin123!</p>
              <p><strong>User:</strong> user@example.com (or 'user') / user123!</p>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Want to go back?{" "}
            <Link
              href="/"
              className="font-semibold leading-6 text-primary hover:underline"
            >
              Return to home
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Background gradient */}
      <div className="hidden lg:block flex-1 relative">
        <div className="absolute inset-0">
          {/* Multi-layered gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-tl from-accent/20 via-transparent to-transparent" />

          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.035] [background-image:url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZmlsdGVyIGlkPSJub2lzZSI+CiAgICA8ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC45IiBudW1PY3RhdmVzPSI0IiBzZWVkPSIxIi8+CiAgICA8ZmVDb2xvck1hdHJpeCBpbj0iVHVyYnVsZW5jZSIgdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPgogIDwvZmlsdGVyPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiLz4KPC9zdmc+')] [background-size:128px_128px]" />
        </div>
      </div>
    </div>
  );
}