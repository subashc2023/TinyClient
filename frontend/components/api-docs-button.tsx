"use client";

import { ApiStatusDot } from "@/components/api-status";
import { getDocsUrl } from "@/lib/config";

export function ApiDocsButton({ className = "" }: { className?: string }) {
  const handleClick = () => {
    const docsUrl = getDocsUrl();
    console.log(`🔧 Opening docs URL: ${docsUrl}`);
    window.open(docsUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleClick}
      className={`hover:opacity-80 transition-opacity ${className}`}
      title="Open API Documentation"
      aria-label="Open API Documentation"
    >
      <ApiStatusDot />
    </button>
  );
}


