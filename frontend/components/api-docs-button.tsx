"use client";

import { ApiStatusDot } from "@/components/api-status";
import { getDocsUrl } from "@/lib/config";

export function ApiDocsButton({ className = "" }: { className?: string }) {
  return (
    <button
      onClick={() => window.open(getDocsUrl(), "_blank", "noopener,noreferrer")}
      className={`hover:opacity-80 transition-opacity ${className}`}
      title="Open API Documentation"
      aria-label="Open API Documentation"
    >
      <ApiStatusDot />
    </button>
  );
}


