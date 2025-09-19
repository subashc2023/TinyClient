"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyEmailService } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { CheckCircle2, AlertCircle } from "lucide-react";

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

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("Verifying your email...");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token. Please use the link from your email.");
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
        setMessage(resolveErrorMessage(err, "Verification failed."));
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
