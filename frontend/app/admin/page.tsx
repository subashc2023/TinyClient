"use client";

import { useEffect, useState } from "react";
import { Shield, Users, RefreshCw, CheckCircle2, XCircle, MailPlus, ShieldAlert } from "lucide-react";
import { ProtectedRoute } from "@/components/protected-route";
import { fetchUsers, inviteUser, updateUserStatus } from "@/services/users";
import type { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { allowSignup } from "@/lib/config";

function resolveErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null) {
    const response = (error as { response?: { data?: { detail?: string } } }).response;
    const detail = response?.data?.detail;
    if (typeof detail === "string" && detail.length > 0) {
      return detail;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchUsers(true);
      setUsers(data);
    } catch (err) {
      setError(resolveErrorMessage(err, "Unable to load users."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const handleToggleActive = async (user: User) => {
    try {
      const updated = await updateUserStatus(user.id, !user.is_active);
      setUsers((prev) => prev.map((existing) => (existing.id === updated.id ? updated : existing)));
    } catch (err) {
      setError(resolveErrorMessage(err, "Unable to update user status."));
    }
  };

  const handleInvite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setInviteError(null);
    setInviteMessage(null);

    if (!inviteEmail) {
      setInviteError("Please enter an email address.");
      return;
    }

    setIsInviting(true);
    try {
      const invite = await inviteUser(inviteEmail.trim());
      setInviteMessage(`Invitation sent to ${invite.email}.`);
      setInviteEmail("");
    } catch (err) {
      setInviteError(resolveErrorMessage(err, "Unable to send invitation."));
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8 space-y-8">
          <header className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-semibold">Admin Panel</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Manage users, toggle account access, and send invitations.
            </p>
          </header>

          {!allowSignup && (
            <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-600 dark:text-amber-400 flex gap-3">
              <ShieldAlert className="h-5 w-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Self-serve signups are disabled.</p>
                <p className="mt-1 text-xs leading-relaxed">Send invitations below to onboard teammates securely.</p>
              </div>
            </div>
          )}


          <section className="rounded-lg border bg-card p-6 shadow-sm">
            <p className="mb-4 text-sm text-muted-foreground">Invites let you onboard teammates without re-enabling public signup.</p>
            <form className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end" onSubmit={handleInvite}>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Invite by email</label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MailPlus className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-input bg-background rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder="user@example.com"
                  />
                </div>
              </div>
              <Button type="submit" disabled={isInviting}>
                {isInviting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    Sending...
                  </>
                ) : (
                  "Send invite"
                )}
              </Button>
            </form>
            {inviteMessage && <p className="mt-2 text-sm text-emerald-500">{inviteMessage}</p>}
            {inviteError && <p className="mt-2 text-sm text-destructive">{inviteError}</p>}
          </section>

          <section className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Users</h2>
              </div>
              <Button variant="outline" size="sm" onClick={() => loadUsers()} disabled={isLoading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {error && (
              <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2 pr-4">User</th>
                    <th className="py-2 pr-4">Role</th>
                    <th className="py-2 pr-4">Verified</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    <tr>
                      <td className="py-6 text-center" colSpan={5}>
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                        </div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td className="py-6 text-center text-muted-foreground" colSpan={5}>
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((userRecord) => (
                      <tr key={userRecord.id}>
                        <td className="py-3 pr-4">
                          <div className="font-medium">{userRecord.username}</div>
                          <div className="text-xs text-muted-foreground">{userRecord.email}</div>
                        </td>
                        <td className="py-3 pr-4">
                          {userRecord.is_admin ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-500">
                              <Shield className="h-3 w-3" /> Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                              Member
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          {userRecord.is_verified ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-500">
                              <CheckCircle2 className="h-4 w-4" /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                              <XCircle className="h-4 w-4" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          {userRecord.is_active ? (
                            <span className="text-xs font-medium text-emerald-500">Active</span>
                          ) : (
                            <span className="text-xs font-medium text-destructive">Inactive</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(userRecord)}
                            disabled={userRecord.is_admin}
                          >
                            {userRecord.is_active ? "Deactivate" : "Activate"}
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}
