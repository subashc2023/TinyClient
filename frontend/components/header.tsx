"use client";

import * as React from "react";
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
import { User, Settings, LogOut, Shield, PanelLeft, PanelRight } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";


export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

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
      <div className="container mx-auto grid h-14 grid-cols-[1fr_auto_1fr] items-center px-4">
        {/* Center section - logo */}
        <div className="col-start-2 justify-self-center flex items-center gap-2">
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

        {/* Right section - user controls */}
        <div className="col-start-3 justify-self-end flex items-center gap-2">
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