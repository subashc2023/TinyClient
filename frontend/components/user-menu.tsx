"use client";

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
import { ROUTES } from "@/lib/routes";
import { User as UserIcon, Settings, LogOut, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRouteOverlay } from "@/lib/route-overlay-context";

export function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { startTransition } = useRouteOverlay();

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout();
      startTransition("Signing out...");
      router.replace(ROUTES.home);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSettings = () => {
    router.push(ROUTES.settings);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          {user.is_admin && (
            <span title="Admin">
              <Shield className="h-4 w-4 text-amber-500" />
            </span>
          )}
          <UserIcon className="h-4 w-4" />
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
  );
}


