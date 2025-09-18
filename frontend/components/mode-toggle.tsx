"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

import { Toggle } from "@/components/ui/toggle";

export function ModeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  const isDark = (resolvedTheme ?? theme) === "dark";

  // Prevent hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder that matches the server-side render
    return (
      <Toggle
        aria-label="Toggle theme"
        variant="outline"
        size="default"
        pressed={false}
        disabled={true}
        onPressedChange={() => {}} // Provide empty handler to prevent hydration issues
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Toggle>
    );
  }

  return (
    <Toggle
      aria-label="Toggle theme"
      variant="outline"
      size="default"
      pressed={isDark}
      onPressedChange={() => setTheme(isDark ? "light" : "dark")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Toggle>
  );
}


