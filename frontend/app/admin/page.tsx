"use client";

import { useEffect, useState } from "react";
import { Shield, Users, RefreshCw, CheckCircle2, XCircle, MailPlus, ShieldAlert } from "lucide-react";
import { ProtectedRoute } from "@/components/protected-route";
import { fetchUsers, inviteUser, updateUserStatus } from "@/services/users";
import type { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { allowSignup } from "@/lib/config";
import { getErrorMessage } from "@/lib/errors";

// centralized error helper

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
      setError(getErrorMessage(err, "Unable to load users."));
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
      setError(getErrorMessage(err, "Unable to update user status."));
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
      setInviteError(getErrorMessage(err, "Unable to send invitation."));
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


          <Card>
            <CardHeader>
              <CardTitle>Invite users</CardTitle>
              <CardDescription>Onboard teammates without re-enabling public signup.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end" onSubmit={handleInvite}>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Invite by email</Label>
                  <div className="mt-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MailPlus className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Input
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={(event) => setInviteEmail(event.target.value)}
                      className="pl-10"
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <CardTitle>Users</CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={() => loadUsers()} disabled={isLoading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  {error}
                </Alert>
              )}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-6 text-center">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                          No users found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((userRecord) => (
                        <TableRow key={userRecord.id}>
                          <TableCell>
                            <div className="font-medium">{userRecord.username}</div>
                            <div className="text-xs text-muted-foreground">{userRecord.email}</div>
                          </TableCell>
                          <TableCell>
                            {userRecord.is_admin ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-500">
                                <Shield className="h-3 w-3" /> Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                                Member
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {userRecord.is_verified ? (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-500">
                                <CheckCircle2 className="h-4 w-4" /> Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                <XCircle className="h-4 w-4" /> Pending
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {userRecord.is_active ? (
                              <span className="text-xs font-medium text-emerald-500">Active</span>
                            ) : (
                              <span className="text-xs font-medium text-destructive">Inactive</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleActive(userRecord)}
                              disabled={userRecord.is_admin}
                            >
                              {userRecord.is_active ? "Deactivate" : "Activate"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
