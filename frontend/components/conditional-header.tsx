"use client";

import { usePathname } from "next/navigation";
import { Header } from "./header";

export function ConditionalHeader() {
  const pathname = usePathname();

  // Don't show the main header on workspace pages since they have their own header
  if (pathname === "/workspace") {
    return null;
  }

  return <Header />;
}