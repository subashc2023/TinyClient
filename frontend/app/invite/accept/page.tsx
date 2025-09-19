"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Lock, Mail, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PasswordChecklist } from "@/components/password-checklist";
import { ROUTES } from "@/lib/routes";
import { acceptInviteService, fetchInviteDetails } from "@/services/auth";

function resolveErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null) {
    const response = (error as { response?: { data?: { detail?: string } } }).response;
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

export default function InviteAcceptPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setError("Missing invitation token.");
      setIsLoading(false);
      return;
    }

    const loadInvite = async () => {
      setIsLoading(true);
      try {
        const invite = await fetchInviteDetails(token);
        setEmail(invite.email);
        setMessage(`Invitation for ${invite.email} expires ${new Date(invite.expires_at).toLocaleString()}.`);
      } catch (err) {
        setError(resolveErrorMessage(err, "Invitation not found."));
      } finally {
        setIsLoading(false);
      }
    };

    void loadInvite();
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const token = searchParams.get("token");
    if (!token) {
      setError("Missing invitation token.");
      return;
    }

    if (!username || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await acceptInviteService(token, username.trim(), password);
      setMessage(response.message);
      setIsCompleted(true);
    } catch (err) {
      setError(resolveErrorMessage(err, "Unable to accept invitation."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPasswordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (error && !email) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-4 rounded-2xl border bg-card p-8 text-center shadow-xl">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="text-2xl font-semibold">Invitation issue</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button className="mt-2" onClick={() => router.push(ROUTES.login)}>
            Back to sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 min-h-full items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(16,185,129,0.14),_transparent_60%)]" />
      <div className="absolute inset-0 opacity-[0.09] dark:opacity-[0.15] [background-image:url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZmlsdGVyIGlkPSJub2lzZSI+CiAgICA8ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC45IiBudW1PY3RhdmVzPSI0IiBzZWVkPSIxIi8+CiAgICA8ZmVDb2xvck1hdHJpeCBpbj0iVHVyYnVsZW5jZSIgdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPgogIDwvZmlsdGVyPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiLz4KPC9zdmc+')]" />

      <div className="relative z-10 w-full max-w-3xl">
        <div className="rounded-[28px] border border-border/60 bg-background/75 p-6 shadow-2xl backdrop-blur sm:p-10">
          <div className="space-y-3 text-center">
            <h1 className="text-3xl font-semibold">Complete your invitation</h1>
            {message && <p className="text-sm text-muted-foreground">{message}</p>}
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          )}

          {isCompleted ? (
            <div className="mt-6 space-y-4 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
              <p className="text-sm text-muted-foreground">
                Invitation accepted for <strong>{email}</strong>. You can now sign in using your new credentials.
              </p>
              <Button onClick={() => router.push(ROUTES.login)}>Go to sign in</Button>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="h-11 w-full rounded-xl border border-input bg-muted pl-12 pr-4 text-sm text-muted-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    required
                    className="h-11 w-full rounded-xl border border-input bg-background/80 pl-12 pr-4 text-sm shadow-sm outline-none ring-offset-background transition focus:border-transparent focus:ring-2 focus:ring-primary/60"
                    placeholder="Choose a username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock className="h-5 w-5" />
                  </div>
                                    <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className="h-11 w-full rounded-xl border border-input bg-background/80 pl-12 pr-4 text-sm shadow-sm outline-none ring-offset-background transition focus:border-transparent focus:ring-2 focus:ring-primary/60"
                    placeholder="Create a password"
                  />
                </div>
                <PasswordChecklist password={password} className="pl-1" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm password</label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    className="h-11 w-full rounded-xl border border-input bg-background/80 pl-12 pr-4 text-sm shadow-sm outline-none ring-offset-background transition focus:border-transparent focus:ring-2 focus:ring-primary/60"
                    placeholder="Re-enter your password"
                  />
                </div>
                {isPasswordMismatch && (
                  <p className="text-xs text-destructive">Passwords do not match.</p>
                )}
              </div>

              <Button type="submit" className="h-11 w-full rounded-xl" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current" />
                    Creating account...
                  </>
                ) : (
                  "Accept invitation"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}



