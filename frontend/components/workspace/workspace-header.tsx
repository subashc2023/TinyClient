"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { ApiStatusDot } from "@/components/api-status";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { useWorkspaceLayout } from "@/lib/workspace-layout-context";
import { User, Settings, LogOut, Shield, PanelLeft, PanelRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function WorkspaceHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const {
    leftSidebarOpen,
    rightSidebarOpen,
    toggleLeftSidebar,
    toggleRightSidebar
  } = useWorkspaceLayout();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="relative w-full h-14">
        {/* Left corner - 4x4 rem square for left sidebar toggle */}
        <div className="absolute top-0 left-0 w-16 h-16 flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLeftSidebar}
            title={`${leftSidebarOpen ? "Hide" : "Show"} left sidebar (Ctrl+B)`}
          >
            <PanelLeft className={`h-4 w-4 ${leftSidebarOpen ? "" : "rotate-180"}`} />
          </Button>
        </div>

        {/* Center section - logo with API status */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-14 flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            {/* Light logo */}
            <img
              src="/mcplight.png"
              alt="TinyClient logo light"
              className="block h-6 w-auto dark:hidden"
            />
            {/* Dark logo */}
            <img
              src="/mcp.png"
              alt="TinyClient logo dark"
              className="hidden h-6 w-auto dark:block"
            />
            <div className="text-lg font-semibold tracking-tight">TinyClient</div>
          </Link>
          <button
            onClick={() => window.open('http://localhost:8001/docs', '_blank')}
            className="hover:opacity-80 transition-opacity"
            title="Open API Documentation"
          >
            <ApiStatusDot />
          </button>
        </div>

        {/* Right corner - 4x4 rem square for right sidebar toggle */}
        <div className="absolute top-0 right-0 w-16 h-16 flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleRightSidebar}
            title={`${rightSidebarOpen ? "Hide" : "Show"} right sidebar (Ctrl+J)`}
          >
            <PanelRight className={`h-4 w-4 ${rightSidebarOpen ? "" : "rotate-180"}`} />
          </Button>
        </div>

        {/* User controls - positioned to the left of the right corner */}
        <div className="absolute top-0 right-16 h-14 flex items-center gap-2 pr-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  {user.is_admin && (
                    <span title="Admin">
                      <Shield className="h-4 w-4 text-amber-500" />
                    </span>
                  )}
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSettings}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Sign In</Link>
            </Button>
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}