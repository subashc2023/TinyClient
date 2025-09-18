"use client";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Shield, Activity, Calendar } from "lucide-react";
import { ProtectedRoute } from "@/components/protected-route";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        {/* User Information */}
        <div className="grid gap-6">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Username</label>
                <p className="text-sm font-mono bg-muted p-2 rounded">{user.username}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-sm font-mono bg-muted p-2 rounded">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Account Type</label>
                <p className="text-sm font-mono bg-muted p-2 rounded flex items-center gap-2">
                  {user.is_admin && <Shield className="h-4 w-4 text-amber-500" />}
                  {user.is_admin ? "Administrator" : "User"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="text-sm font-mono bg-muted p-2 rounded flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Status
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-emerald-500 mb-1">Active</div>
                <div className="text-xs text-muted-foreground">API Status</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-blue-500 mb-1">Online</div>
                <div className="text-xs text-muted-foreground">Connection</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-purple-500 mb-1">Ready</div>
                <div className="text-xs text-muted-foreground">System</div>
              </div>
            </div>
          </div>

          {/* Debug Info (Development only) */}
          {process.env.NODE_ENV === "development" && (
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-xl font-semibold mb-4 text-muted-foreground">
                Debug Information
              </h2>
              <div className="bg-muted/50 p-4 rounded-lg">
                <pre className="text-xs text-muted-foreground overflow-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}