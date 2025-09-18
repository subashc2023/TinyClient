"use client";

import { WorkspaceHeader } from "./workspace-header";
import { WorkspaceLeftSidebar } from "./workspace-left-sidebar";
import { WorkspaceRightSidebar } from "./workspace-right-sidebar";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
}

export function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Workspace-specific header with sidebar controls */}
      <WorkspaceHeader />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <WorkspaceLeftSidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="h-full">
            {children}
          </div>
        </main>

        {/* Right Sidebar */}
        <WorkspaceRightSidebar />
      </div>
    </div>
  );
}

// Content wrapper component for main workspace area
export function WorkspaceContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6 h-full">
      {children}
    </div>
  );
}