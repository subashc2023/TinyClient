"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyEmailService } from "@/services/auth";
import { getErrorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { CheckCircle2, AlertCircle } from "lucide-react";

// centralized error helper

function VerifyPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("Verifying...");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Missing token. Please use the link from your email.");
      return;
    }

    const verify = async () => {
      setStatus("loading");
      try {
        const response = await verifyEmailService(token);
        setStatus("success");
        setMessage(response.message);
      } catch (err) {
        setStatus("error");
        setMessage(getErrorMessage(err, "Operation failed."));
      }
    };

    void verify();
  }, [searchParams]);

  const handleReturn = () => {
    router.push(ROUTES.login);
  };

  const isLoading = status === "loading";
  const isSuccess = status === "success";
  const isError = status === "error";

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center text-center space-y-4">
          {isLoading && (
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          )}

          {isSuccess && <CheckCircle2 className="h-12 w-12 text-emerald-500" />}
          {isError && <AlertCircle className="h-12 w-12 text-destructive" />}

          <h1 className="text-2xl font-semibold">
            {isSuccess ? "Email verified" : isError ? "Verification issue" : "Verifying"}
          </h1>
          <p className="text-sm text-muted-foreground">{message}</p>

          {(isSuccess || isError) && (
            <Button onClick={handleReturn} className="mt-2">
              Go to sign in
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    }>
      <VerifyPageContent />
    </Suspense>
  );
}
