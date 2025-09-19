"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { getProjectName } from "@/lib/config";

const projectName = getProjectName();

export function BrandLogo({ className = "", showText = true }: { className?: string; showText?: boolean }) {
  return (
    <Link href={ROUTES.home} className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${className}`}>
      <img src="/mcplight.png" alt={`${projectName} logo light`} className="block h-6 w-auto dark:hidden" />
      <img src="/mcp.png" alt={`${projectName} logo dark`} className="hidden h-6 w-auto dark:block" />
      {showText && <div className="text-lg font-semibold tracking-tight">{projectName}</div>}
    </Link>
  );
}
