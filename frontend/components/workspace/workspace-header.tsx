"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useWorkspaceLayout } from "@/lib/workspace-layout-context";
import { PanelLeft, PanelRight } from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { ApiDocsButton } from "@/components/api-docs-button";
import { UserMenu } from "@/components/user-menu";
import { ROUTES } from "@/lib/routes";

export function WorkspaceHeader() {
  const { user } = useAuth();
  const {
    leftSidebarOpen,
    rightSidebarOpen,
    toggleLeftSidebar,
    toggleRightSidebar,
  } = useWorkspaceLayout();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="relative w-full h-14">
        {/* Left corner - 4x4 rem square for left sidebar toggle */}
        <div className="absolute top-0 left-0 w-16 h-16 flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLeftSidebar}
            aria-label={`${leftSidebarOpen ? "Hide" : "Show"} left sidebar`}
            title={`${leftSidebarOpen ? "Hide" : "Show"} left sidebar (Ctrl+B)`}
          >
            <PanelLeft className={`h-4 w-4 ${leftSidebarOpen ? "" : "rotate-180"}`} />
          </Button>
        </div>

        {/* Center section - logo with API status */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-14 flex items-center gap-2">
          <BrandLogo />
          <ApiDocsButton />
        </div>

        {/* Right corner - 4x4 rem square for right sidebar toggle */}
        <div className="absolute top-0 right-0 w-16 h-16 flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleRightSidebar}
            aria-label={`${rightSidebarOpen ? "Hide" : "Show"} right sidebar`}
            title={`${rightSidebarOpen ? "Hide" : "Show"} right sidebar (Ctrl+J)`}
          >
            <PanelRight className={`h-4 w-4 ${rightSidebarOpen ? "" : "rotate-180"}`} />
          </Button>
        </div>

        {/* User controls - positioned to the left of the right corner */}
        <div className="absolute top-0 right-16 h-14 flex items-center gap-2 pr-4">
          {user ? (
            <UserMenu />
          ) : (
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
