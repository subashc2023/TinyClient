"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, Suspense } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PasswordChecklist } from "@/components/password-checklist";
import { useAuth } from "@/lib/auth-context";
import { ROUTES } from "@/lib/routes";
import { useRouteOverlay } from "@/lib/route-overlay-context";
import { signupService, resendVerificationEmail } from "@/services/auth";
import { requestPasswordReset } from "@/services/auth";
import { getErrorMessage } from "@/lib/errors";
import { allowSignup, getProjectName } from "@/lib/config";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "signup";

const projectName = getProjectName();

// Error helper centralized

function LoginPageContent() {
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
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

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
      setLoginError(getErrorMessage(error, "Login failed. Please check your credentials."));
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
      setSignupError(getErrorMessage(error, "Unable to create your account."));
    } finally {
      setIsSubmitting(false);
      setActiveSubmit(null);
    }
  };

  const handleResendVerification = async () => {
    setResendMessage(null);
    setResendLoading(true);
    try {
      const identifier = signupEmail || signupUsername;
      if (!identifier) {
        setResendMessage("Enter your email or username first.");
        return;
      }
      const res = await resendVerificationEmail(identifier.trim());
      setResendMessage(res.message);
    } catch (error) {
      setResendMessage(getErrorMessage(error, "Unable to resend verification email."));
    } finally {
      setResendLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setForgotMessage(null);
    setForgotLoading(true);
    try {
      if (!forgotEmail) {
        setForgotMessage("Enter your email first.");
        return;
      }
      const res = await requestPasswordReset(forgotEmail.trim());
      setForgotMessage(res.message);
    } catch (err) {
      setForgotMessage(getErrorMessage(err, "Unable to request reset."));
    } finally {
      setForgotLoading(false);
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
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />

      <div className="relative z-10 w-full max-w-5xl">
        <div className="grid gap-8 rounded-[34px] border border-border/60 bg-background/70 p-6 shadow-2xl backdrop-blur xl:grid-cols-[420px_minmax(0,1fr)] xl:p-10">
          <div className="space-y-8">
            <header className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image
                    src="/mcplight.png"
                    alt={`${projectName} logo light`}
                    width={36}
                    height={36}
                    className="block dark:hidden"
                    priority
                  />
                  <Image
                    src="/mcp.png"
                    alt={`${projectName} logo dark`}
                    width={36}
                    height={36}
                    className="hidden dark:block"
                    priority
                  />
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
                    : "We'll send a verification email before you sign in for the first time."}
                </p>
              </div>
            </header>

            <div>
              {isLoginMode ? (
                <form className="space-y-6" onSubmit={handleLoginSubmit}>
                  {loginError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-5 w-5" />
                      <AlertDescription className="ml-2">{loginError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="login-identifier">Email or username</Label>
                    <div className="relative">
                      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Mail className="h-5 w-5" />
                      </div>
                      <Input
                        id="login-identifier"
                        type="text"
                        required
                        value={loginIdentifier}
                        onChange={(event) => setLoginIdentifier(event.target.value)}
                        className="h-11 pl-12"
                        placeholder="you@example.com or username"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Lock className="h-5 w-5" />
                      </div>
                      <Input
                        id="login-password"
                        type={showLoginPassword ? "text" : "password"}
                        required
                        value={loginPassword}
                        onChange={(event) => setLoginPassword(event.target.value)}
                        className="h-11 pl-12 pr-12"
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
                  <div className="text-xs text-muted-foreground text-center">
                    <details>
                      <summary className="cursor-pointer">Forgot password?</summary>
                      <div className="mt-2 flex items-center gap-2">
                        <Input
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="h-9 text-xs"
                        />
                        <Button type="button" size="sm" variant="outline" disabled={forgotLoading} onClick={handleForgotPassword}>
                          {forgotLoading ? "Sending..." : "Send reset"}
                        </Button>
                      </div>
                      {forgotMessage && <p className="mt-2 text-xs">{forgotMessage}</p>}
                    </details>
                  </div>
                </form>
              ) : (
                <form className="space-y-6" onSubmit={handleSignupSubmit}>
                  {signupError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-5 w-5" />
                      <AlertDescription className="ml-2">{signupError}</AlertDescription>
                    </Alert>
                  )}

                  {signupSuccess && null}

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email address</Label>
                    <div className="relative">
                      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Mail className="h-5 w-5" />
                      </div>
                      <Input
                        id="signup-email"
                        type="email"
                        required
                        value={signupEmail}
                        onChange={(event) => setSignupEmail(event.target.value)}
                        className="h-11 pl-12"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Username</Label>
                    <div className="relative">
                      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <User className="h-5 w-5" />
                      </div>
                      <Input
                        id="signup-username"
                        type="text"
                        required
                        value={signupUsername}
                        onChange={(event) => setSignupUsername(event.target.value)}
                        className="h-11 pl-12"
                        placeholder="Choose a username"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Lock className="h-5 w-5" />
                      </div>
                      <Input
                        id="signup-password"
                        type="password"
                        required
                        value={signupPassword}
                        onChange={(event) => setSignupPassword(event.target.value)}
                        className="h-11 pl-12"
                        placeholder="Create a password"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password-confirm">Confirm password</Label>
                    <div className="relative">
                      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Lock className="h-5 w-5" />
                      </div>
                      <Input
                        id="signup-password-confirm"
                        type="password"
                        required
                        value={signupPasswordConfirm}
                        onChange={(event) => setSignupPasswordConfirm(event.target.value)}
                        className="h-11 pl-12"
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
                  <span className="bg-card px-2">Need access?</span>
                </div>
              </div>
              <p className="text-sm">
                Contact your {projectName} administrator for an invite or help resetting your credentials.
              </p>
              <p className="text-xs">
                Invitations arrive by email and include a secure link to finish setup.
              </p>
              <p className="pt-2 text-sm">
                Want to go back?{" "}
                <Link href={ROUTES.home} className="font-semibold text-primary hover:underline">
                  Return to home
                </Link>
              </p>
            </div>
          </div>

          <aside className="hidden xl:flex flex-col gap-6">
            {isLoginMode ? (
              <Card>
                <CardHeader>
                  <CardTitle>Welcome back</CardTitle>
                  <CardDescription>Sign in to pick up where you left off.</CardDescription>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Three quick steps</CardTitle>
                  <CardDescription>{`${projectName} signups require email verification.`}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-4 text-sm text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <User className="mt-1 h-4 w-4 text-primary" />
                      <div>
                        <span>Create your username and password in the form.</span>
                        <div className="mt-2">
                          <PasswordChecklist password={signupPassword} className="text-xs" />
                        </div>
                      </div>
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
                  {signupSuccess && (
                    <Alert className="mt-4">
                      <CheckCircle2 className="h-5 w-5" />
                      <AlertDescription className="ml-2">
                        {signupSuccess} <span className="text-xs text-muted-foreground">If you don’t see it, check your spam folder.</span>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Need a hand?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  Reach out to your {projectName} admin if you need a fresh invite or help activating your account.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}

