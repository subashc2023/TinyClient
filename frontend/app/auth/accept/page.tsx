"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Lock, Mail, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PasswordChecklist } from "@/components/password-checklist";
import { ROUTES } from "@/lib/routes";
import { getErrorMessage } from "@/lib/errors";
import { acceptInviteService, fetchInviteDetails } from "@/services/auth";

// centralized error helper

function InviteAcceptPageContent() {
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
        setError(getErrorMessage(err, "Invitation not found."));
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
      setError(getErrorMessage(err, "Unable to accept invitation."));
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
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />

      <div className="relative z-10 w-full max-w-5xl">
        <div className="grid gap-8 rounded-[34px] border border-border/60 bg-background/70 p-6 shadow-2xl backdrop-blur xl:grid-cols-[420px_minmax(0,1fr)] xl:p-10">
          <div className="space-y-8">
            <header className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Complete your invitation</h2>
                {message && <p className="text-sm text-muted-foreground">{message}</p>}
              </div>
            </header>

            <div>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-5 w-5" />
                  <AlertDescription className="ml-2">{error}</AlertDescription>
                </Alert>
              )}

              {isCompleted ? (
                <div className="space-y-4 text-center">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
                  <p className="text-sm text-muted-foreground">
                    Invitation accepted for <strong>{email}</strong>. You can now sign in using your new credentials.
                  </p>
                  <Button onClick={() => router.push(ROUTES.login)}>Go to sign in</Button>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Mail className="h-5 w-5" />
                      </div>
                      <Input type="email" value={email} disabled className="h-11 pl-12 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Username</Label>
                    <div className="relative">
                      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <User className="h-5 w-5" />
                      </div>
                      <Input
                        type="text"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        required
                        className="h-11 pl-12"
                        placeholder="Choose a username"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative">
                      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Lock className="h-5 w-5" />
                      </div>
                      <Input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        className="h-11 pl-12"
                        placeholder="Create a password"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Confirm password</Label>
                    <div className="relative">
                      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Lock className="h-5 w-5" />
                      </div>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        required
                        className="h-11 pl-12"
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
                Contact your administrator for help with invitations or account setup.
              </p>
            </div>
          </div>

          <aside className="hidden xl:flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Set up your account</CardTitle>
                <CardDescription>Complete your invitation to start collaborating.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <User className="mt-1 h-4 w-4 text-primary" />
                    <div>
                      <span>Choose a username and secure password.</span>
                      <div className="mt-2">
                        <PasswordChecklist password={password} className="text-xs" />
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-4 w-4 text-primary" />
                    <span>Your email has been pre-verified through the invitation link.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Lock className="mt-1 h-4 w-4 text-primary" />
                    <span>Once complete, you can sign in immediately with your new credentials.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Already have an account?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>If you already have access, you can return to the sign-in page instead.</p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function InviteAcceptPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    }>
      <InviteAcceptPageContent />
    </Suspense>
  );
}



