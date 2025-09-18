"use client";

import * as React from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { ApiDocsButton } from "@/components/api-docs-button";
import { UserMenu } from "@/components/user-menu";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { useAuth } from "@/lib/auth-context";


export function Header() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto grid h-14 grid-cols-[1fr_auto_1fr] items-center px-4">
        {/* Center section - logo */}
        <div className="col-start-2 justify-self-center flex items-center gap-2">
          <BrandLogo />
          <ApiDocsButton />
        </div>

        {/* Right section - user controls */}
        <div className="col-start-3 justify-self-end flex items-center gap-2">
          <UserMenu />
          {!user && (
            <Button asChild size="sm">
              <Link href={ROUTES.login}>Sign In</Link>
            </Button>
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}