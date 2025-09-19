"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MailPlus,
  ShieldAlert,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { PasswordChecklist } from "@/components/password-checklist";
import { useAuth } from "@/lib/auth-context";
import { ROUTES } from "@/lib/routes";
import { useRouteOverlay } from "@/lib/route-overlay-context";
import { signupService } from "@/services/auth";
import { allowSignup, getProjectName } from "@/lib/config";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "signup";

const projectName = getProjectName();

type ErrorLike = {
  response?: {
    data?: {
      detail?: string;
    };
    status?: number;
  };
};

function extractErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null) {
    const response = (error as ErrorLike).response;
    const detail = response?.data?.detail;
    if (typeof detail === "string" && detail.length > 0) {
      return detail;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { startTransition } = useRouteOverlay();
  const { login, isAuthenticated, isLoading } = useAuth();

  const modeFromParams = useMemo<AuthMode>(() => {
    if (!allowSignup) {
      return "login";
    }
    return searchParams.get("mode") === "signup" ? "signup" : "login";
  }, [searchParams]);

  const [mode, setMode] = useState<AuthMode>(modeFromParams);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSubmit, setActiveSubmit] = useState<AuthMode | null>(null);

  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [signupEmail, setSignupEmail] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState("");
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null);

  useEffect(() => {
    setMode(modeFromParams);
  }, [modeFromParams]);

  useEffect(() => {
    router.prefetch(ROUTES.workspace);
  }, [router]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      startTransition("Opening workspace...");
      router.replace(ROUTES.workspace);
    }
  }, [isAuthenticated, isLoading, router, startTransition]);

  useEffect(() => {
    if (mode === "login") {
      setSignupSuccess(null);
    }
    setLoginError(null);
    setSignupError(null);
  }, [mode]);

  const isLoginMode = mode === "login" || !allowSignup;
  const isSignupMode = !isLoginMode;
  const isLoginSubmitting = isSubmitting && activeSubmit === "login";
  const isSignupSubmitting = isSubmitting && activeSubmit === "signup";

  const handleModeSwitch = (nextMode: AuthMode) => {
    if (nextMode === mode || (nextMode === "signup" && !allowSignup)) {
      return;
    }

    setMode(nextMode);
    const nextUrl = nextMode === "signup" ? `${ROUTES.login}?mode=signup` : ROUTES.login;
    router.replace(nextUrl);
  };

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);

    if (!loginIdentifier || !loginPassword) {
      setLoginError("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    setActiveSubmit("login");

    try {
      await login(loginIdentifier, loginPassword);
      startTransition("Opening workspace...");
      router.replace(ROUTES.workspace);
    } catch (error) {
      setLoginError(extractErrorMessage(error, "Login failed. Please check your credentials."));
    } finally {
      setIsSubmitting(false);
      setActiveSubmit(null);
    }
  };

  const handleSignupSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSignupError(null);
    setSignupSuccess(null);

    if (!signupEmail || !signupUsername || !signupPassword || !signupPasswordConfirm) {
      setSignupError("All fields are required.");
      return;
    }

    if (signupPassword !== signupPasswordConfirm) {
      setSignupError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setActiveSubmit("signup");

    try {
      const response = await signupService(signupEmail.trim(), signupUsername.trim(), signupPassword);
      setSignupSuccess(response.message);
      setSignupPassword("");
      setSignupPasswordConfirm("");
    } catch (error) {
      setSignupError(extractErrorMessage(error, "Unable to create your account."));
    } finally {
      setIsSubmitting(false);
      setActiveSubmit(null);
    }
  };

  if (isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 min-h-full items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(16,185,129,0.14),_transparent_60%)]" />
      <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.15] [background-image:url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZmlsdGVyIGlkPSJub2lzZSI+CiAgICA8ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC45IiBudW1PY3RhdmVzPSI0IiBzZWVkPSIxIi8+CiAgICA8ZmVDb2xvck1hdHJpeCBpbj0iVHVyYnVsZW5jZSIgdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPgogIDwvZmlsdGVyPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiLz4KPC9zdmc+')]" />

      <div className="relative z-10 w-full max-w-5xl">
        <div className="grid gap-8 rounded-[34px] border border-border/60 bg-background/70 p-6 shadow-2xl backdrop-blur xl:grid-cols-[420px_minmax(0,1fr)] xl:p-10">
          <div className="space-y-8">
            <header className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src="/mcplight.png" alt={`${projectName} logo light`} className="block h-9 w-auto dark:hidden" />
                  <img src="/mcp.png" alt={`${projectName} logo dark`} className="hidden h-9 w-auto dark:block" />
                  <span className="ml-2 text-xl font-semibold">{projectName}</span>
                </div>

                {allowSignup && (
                  <div className="flex items-center gap-2 rounded-full bg-muted/50 p-1 text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => handleModeSwitch("login")}
                      className={cn(
                        "rounded-full px-4 py-2 transition",
                        isLoginMode ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Sign in
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModeSwitch("signup")}
                      className={cn(
                        "rounded-full px-4 py-2 transition",
                        isSignupMode ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Sign up
                    </button>
                  </div>
                )}
              </div>

              {!allowSignup && (
                <div className="flex gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-600 dark:text-amber-300">
                  <ShieldAlert className="h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-medium">Signups are invite-only right now.</p>
                    <p className="mt-1 text-xs leading-relaxed">
                      Ask an administrator to send you an email invitation. Invited users can create accounts even while
                      self-serve signups are disabled.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">
                  {isLoginMode ? `Sign in to ${projectName}` : `Create your ${projectName} account`}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isLoginMode
                    ? "Welcome back! Use your email or username to continue."
                    : "We’ll send a verification email before you sign in for the first time."}
                </p>
              </div>
            </header>

            <div>
              {isLoginMode ? (
                <form className="space-y-6" onSubmit={handleLoginSubmit}>
                  {loginError && (
                    <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4">
                      <div className="flex">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        <div className="ml-3">
                          <p className="text-sm text-destructive">{loginError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="login-identifier" className="text-sm font-medium">
                      Email or username
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Mail className="h-5 w-5" />
                      </div>
                      <input
                        id="login-identifier"
                        type="text"
                        required
                        value={loginIdentifier}
                        onChange={(event) => setLoginIdentifier(event.target.value)}
                        className="h-11 w-full rounded-xl border border-input bg-background/80 pl-12 pr-4 text-sm shadow-sm outline-none ring-offset-background transition focus:border-transparent focus:ring-2 focus:ring-primary/60"
                        placeholder="you@example.com or username"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="login-password" className="text-sm font-medium">
                      Password
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Lock className="h-5 w-5" />
                      </div>
                      <input
                        id="login-password"
                        type={showLoginPassword ? "text" : "password"}
                        required
                        value={loginPassword}
                        onChange={(event) => setLoginPassword(event.target.value)}
                        className="h-11 w-full rounded-xl border border-input bg-background/80 pl-12 pr-12 text-sm shadow-sm outline-none ring-offset-background transition focus:border-transparent focus:ring-2 focus:ring-primary/60"
                        placeholder="Your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center text-muted-foreground hover:text-foreground"
                        aria-label={showLoginPassword ? "Hide password" : "Show password"}
                      >
                        {showLoginPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="h-11 w-full rounded-xl" disabled={isSubmitting}>
                    {isLoginSubmitting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current" />
                        Signing in...
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </form>
              ) : (
                <form className="space-y-6" onSubmit={handleSignupSubmit}>
                  {signupError && (
                    <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4">
                      <div className="flex">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        <div className="ml-3">
                          <p className="text-sm text-destructive">{signupError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {signupSuccess && (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                      <div className="flex">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        <div className="ml-3">
                          <p className="text-sm text-emerald-500">{signupSuccess}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="signup-email" className="text-sm font-medium">
                      Email address
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Mail className="h-5 w-5" />
                      </div>
                      <input
                        id="signup-email"
                        type="email"
                        required
                        value={signupEmail}
                        onChange={(event) => setSignupEmail(event.target.value)}
                        className="h-11 w-full rounded-xl border border-input bg-background/80 pl-12 pr-4 text-sm shadow-sm outline-none ring-offset-background transition focus:border-transparent focus:ring-2 focus:ring-primary/60"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="signup-username" className="text-sm font-medium">
                      Username
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <User className="h-5 w-5" />
                      </div>
                      <input
                        id="signup-username"
                        type="text"
                        required
                        value={signupUsername}
                        onChange={(event) => setSignupUsername(event.target.value)}
                        className="h-11 w-full rounded-xl border border-input bg-background/80 pl-12 pr-4 text-sm shadow-sm outline-none ring-offset-background transition focus:border-transparent focus:ring-2 focus:ring-primary/60"
                        placeholder="Choose a username"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="signup-password" className="text-sm font-medium">
                      Password
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Lock className="h-5 w-5" />
                      </div>
                      <input
                        id="signup-password"
                        type="password"
                        required
                        value={signupPassword}
                        onChange={(event) => setSignupPassword(event.target.value)}
                        className="h-11 w-full rounded-xl border border-input bg-background/80 pl-12 pr-4 text-sm shadow-sm outline-none ring-offset-background transition focus:border-transparent focus:ring-2 focus:ring-primary/60"
                        placeholder="Create a password"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
                  </div>
                  <PasswordChecklist password={signupPassword} className="pt-1 pl-1" />

                  <div className="space-y-2">
                    <label htmlFor="signup-password-confirm" className="text-sm font-medium">
                      Confirm password
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Lock className="h-5 w-5" />
                      </div>
                      <input
                        id="signup-password-confirm"
                        type="password"
                        required
                        value={signupPasswordConfirm}
                        onChange={(event) => setSignupPasswordConfirm(event.target.value)}
                        className="h-11 w-full rounded-xl border border-input bg-background/80 pl-12 pr-4 text-sm shadow-sm outline-none ring-offset-background transition focus-border-transparent focus:ring-2 focus:ring-primary/60"
                        placeholder="Re-enter your password"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="h-11 w-full rounded-xl" disabled={isSubmitting}>
                    {isSignupSubmitting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current" />
                        Creating account...
                      </>
                    ) : (
                      "Create account"
                    )}
                  </Button>
                </form>
              )}
            </div>

            {allowSignup && (
              <div className="text-center text-sm text-muted-foreground">
                <Button
                  type="button"
                  variant="link"
                  className="font-medium"
                  onClick={() => handleModeSwitch(isLoginMode ? "signup" : "login")}
                >
                  {isLoginMode ? "Need an account? Sign up" : "Already have an account? Sign in"}
                </Button>
              </div>
            )}

            <div className="space-y-4 text-center text-xs text-muted-foreground">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-2">Demo credentials</span>
                </div>
              </div>
              <div className="space-y-1">
                <p><strong>Admin:</strong> admin@example.com (or &apos;admin&apos;) / admin123!</p>
                <p><strong>User:</strong> user@example.com (or &apos;user&apos;) / user123!</p>
              </div>
              <p className="pt-2 text-sm">
                Want to go back?{" "}
                <Link href={ROUTES.home} className="font-semibold text-primary hover:underline">
                  Return to home
                </Link>
              </p>
            </div>
          </div>

          <aside className="hidden xl:flex flex-col justify-between rounded-[28px] border border-border/50 bg-gradient-to-br from-background/70 via-background/40 to-background/20 p-10 backdrop-blur">
            {isLoginMode ? (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold">Welcome back</h3>
                <p className="text-sm text-muted-foreground">
                  Sign in to pick up where you left off. Your settings and recent activity load automatically.
                </p>
                <ul className="space-y-4 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <Mail className="mt-1 h-4 w-4 text-primary" />
                    <span>Use either your email address or username in the first field.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Lock className="mt-1 h-4 w-4 text-primary" />
                    <span>Passwords are case-sensitive, and inactive accounts will be prompted to contact an admin.</span>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold">Three quick steps</h3>
                <p className="text-sm text-muted-foreground">
                  {`${projectName} signups require email verification. Follow the steps to get access.`}
                </p>
                <ol className="space-y-4 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <User className="mt-1 h-4 w-4 text-primary" />
                    <span>Create your username and password above.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-4 w-4 text-primary" />
                    <span>Check your inbox for the verification email from {projectName}.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <MailPlus className="mt-1 h-4 w-4 text-primary" />
                    <span>After confirming, sign in to explore the workspace and invite teammates.</span>
                  </li>
                </ol>
              </div>
            )}

            <div className="rounded-2xl border border-border/40 bg-background/60 p-6 text-sm text-muted-foreground shadow-inner">
              <p className="font-semibold text-foreground">Need a hand?</p>
              <p className="mt-2 leading-relaxed">
                Reach out to your {projectName} admin if you need a fresh invite or help activating your account.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
