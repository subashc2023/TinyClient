"use client";

import { useAuth } from "@/lib/auth-context";
import { ProtectedRoute } from "@/components/protected-route";
import { WorkspaceLayoutProvider } from "@/lib/workspace-layout-context";
import { WorkspaceLayout, WorkspaceContent } from "@/components/workspace/workspace-layout";
import { Textarea } from "@/components/ui/textarea";

export default function WorkspacePage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <WorkspaceLayoutProvider>
        <WorkspaceLayout>
          <WorkspaceContent>
          {/* Simple text entry area for testing */}
          <div className="h-full flex flex-col">
            <div className="mb-4">
              <h1 className="text-xl font-semibold">Workspace</h1>
              <p className="text-sm text-muted-foreground">Enter your text below</p>
            </div>

            <div className="flex-1">
              <Textarea
                className="h-full resize-none"
                placeholder="Start typing here..."
              />
            </div>
          </div>
          </WorkspaceContent>
        </WorkspaceLayout>
      </WorkspaceLayoutProvider>
    </ProtectedRoute>
  );
}