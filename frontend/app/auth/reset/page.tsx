"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { confirmPasswordReset } from "@/services/auth";
import { getErrorMessage } from "@/lib/errors";
import { ROUTES } from "@/lib/routes";

function ResetPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setToken(searchParams.get("token"));
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    if (!token) {
      setStatus("error");
      setMessage("Missing token. Please use the link from your email.");
      return;
    }
    if (!password || !confirm) {
      setStatus("error");
      setMessage("Please fill in all fields.");
      return;
    }
    if (password !== confirm) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    setStatus("loading");
    try {
      const res = await confirmPasswordReset(token, password);
      setStatus("success");
      setMessage(res.message);
      setTimeout(() => router.replace(ROUTES.login), 1500);
    } catch (err) {
      setStatus("error");
      setMessage(getErrorMessage(err, "Unable to reset password."));
    }
  };

  const isLoading = status === "loading";
  const isSuccess = status === "success";
  const isError = status === "error";

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center text-center space-y-4">
          {isLoading && <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />}
          {isSuccess && <CheckCircle2 className="h-12 w-12 text-emerald-500" />}
          {isError && <AlertCircle className="h-12 w-12 text-destructive" />}
          <h1 className="text-2xl font-semibold">Reset your password</h1>

          <form className="w-full space-y-4 text-left" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium">New password</label>
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm"
                  placeholder="Enter a new password"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm password</label>
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm"
                  placeholder="Re-enter your new password"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Resetting..." : "Reset password"}
            </Button>
          </form>

          {message && <p className="text-sm text-muted-foreground">{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default function ResetPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      }
    >
      <ResetPageContent />
    </Suspense>
  );
}


