"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { WorkspaceLayoutProvider } from "@/lib/workspace-layout-context";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";

export default function WorkspaceRouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <WorkspaceLayoutProvider>
        <WorkspaceLayout>
          {children}
        </WorkspaceLayout>
      </WorkspaceLayoutProvider>
    </ProtectedRoute>
  );
}


