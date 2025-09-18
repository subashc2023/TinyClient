"use client";

import { useWorkspaceLayout } from "@/lib/workspace-layout-context";

export function WorkspaceLeftSidebar() {
  const { leftSidebarOpen } = useWorkspaceLayout();

  return (
    <div
      className={`
        relative border-r bg-background transition-all duration-300 ease-in-out
        ${leftSidebarOpen ? "w-64" : "w-0"}
        ${leftSidebarOpen ? "opacity-100" : "opacity-0"}
      `}
    >
      <div className={`h-full flex flex-col ${leftSidebarOpen ? "visible" : "invisible"}`}>
        {/* Empty for now - will be populated with actual content later */}
        <div className="flex-1 p-4">
          <div className="text-sm text-muted-foreground">Left sidebar content</div>
        </div>
      </div>
    </div>
  );
}