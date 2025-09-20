"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { allowSignup } from "@/lib/config";
import { ROUTES } from "@/lib/routes";

export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    if (allowSignup) {
      router.replace(`${ROUTES.login}?mode=signup`);
      return;
    }

    const timeout = window.setTimeout(() => {
      router.replace(ROUTES.login);
    }, 2400);

    return () => window.clearTimeout(timeout);
  }, [router]);

  if (allowSignup) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 text-center space-y-4">
        <ShieldAlert className="mx-auto h-12 w-12 text-amber-500" />
        <h1 className="text-2xl font-semibold">Signups are invite-only</h1>
        <p className="text-sm text-muted-foreground">
          Ask an administrator to send you an invitation email. Once it arrives, follow the link to finish onboarding.
        </p>
        <Button onClick={() => router.replace(ROUTES.login)}>Go to sign in</Button>
      </div>
    </div>
  );
}

