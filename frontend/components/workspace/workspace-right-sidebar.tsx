"use client";

import { useWorkspaceLayout } from "@/lib/workspace-layout-context";

export function WorkspaceRightSidebar() {
  const { rightSidebarOpen } = useWorkspaceLayout();

  return (
    <div
      className={`
        relative border-l bg-background transition-all duration-300 ease-in-out
        ${rightSidebarOpen ? "w-80" : "w-0"}
        ${rightSidebarOpen ? "opacity-100" : "opacity-0"}
      `}
    >
      <div className={`h-full flex flex-col ${rightSidebarOpen ? "visible" : "invisible"}`}>
        {/* Empty for now - will be populated with actual content later */}
        <div className="flex-1 p-4">
          <div className="text-sm text-muted-foreground">Right sidebar content</div>
        </div>
      </div>
    </div>
  );
}