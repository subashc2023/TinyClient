"use client";

import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/lib/routes";
import { getProjectName } from "@/lib/config";

const projectName = getProjectName();

export function BrandLogo({ className = "", showText = true }: { className?: string; showText?: boolean }) {
  return (
    <Link href={ROUTES.home} className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${className}`}>
      <Image
        src="/mcplight.png"
        alt={`${projectName} logo light`}
        width={24}
        height={24}
        className="block dark:hidden"
        priority
      />
      <Image
        src="/mcp.png"
        alt={`${projectName} logo dark`}
        width={24}
        height={24}
        className="hidden dark:block"
        priority
      />
      {showText && <div className="text-lg font-semibold tracking-tight">{projectName}</div>}
    </Link>
  );
}
