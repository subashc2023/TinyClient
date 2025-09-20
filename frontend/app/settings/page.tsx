"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Activity, Mail, Save, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/lib/auth-context";
import { updatePassword, updateProfile } from "@/services/users";
import { getErrorMessage } from "@/lib/errors";


// centralized error helper

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState(user?.email ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  if (!user) {
    return null;
  }

  const handleProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileError(null);
    setProfileMessage(null);

    if (email === user.email && username === user.username) {
      setProfileMessage("No changes detected.");
      return;
    }

    setIsUpdatingProfile(true);

    try {
      await updateProfile({
        email: email !== user.email ? email.trim() : undefined,
        username: username !== user.username ? username.trim() : undefined,
      });

      const updatedEmail = email !== user.email;
      if (updatedEmail) {
        setProfileMessage("Email updated. Please verify your inbox; you'll be asked to sign in again.");
        setTimeout(() => logout(), 1500);
      } else {
        setProfileMessage("Profile updated successfully.");
      }
    } catch (err) {
      setProfileError(getErrorMessage(err, "Unable to update profile."));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError(null);
    setPasswordMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please complete all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const response = await updatePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPasswordMessage(response.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => logout(), 1500);
    } catch (err) {
      setPasswordError(getErrorMessage(err, "Unable to update password."));
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl - font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences.</p>
          </div>

          <div className="grid gap-6">
            <section className="rounded-lg border bg-card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5" /> Update Profile
              </h2>
              <form className="grid gap-4" onSubmit={handleProfileSubmit}>
                <div className="grid gap-2">
                  <Label>Email address</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="pl-9"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Username</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      type="text"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      className="pl-9"
                      placeholder="Username"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit" disabled={isUpdatingProfile}>
                    {isUpdatingProfile ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                        Saving
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" /> Save changes
                      </>
                    )}
                  </Button>
                  {profileMessage && <span className="text-sm text-emerald-500">{profileMessage}</span>}
                  {profileError && <span className="text-sm text-destructive">{profileError}</span>}
                </div>
              </form>
            </section>

            <section className="rounded-lg border bg-card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Lock className="h-5 w-5" /> Change Password
              </h2>
              <form className="grid gap-4" onSubmit={handlePasswordSubmit}>
                <div className="grid gap-2">
                  <Label>Current password</Label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    placeholder="Enter your current password"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label>New password</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="Choose a new password"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Confirm new password</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Re-enter new password"
                    required
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit" variant="outline" disabled={isUpdatingPassword}>
                    {isUpdatingPassword ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                        Updating
                      </>
                    ) : (
                      "Update password"
                    )}
                  </Button>
                  {passwordMessage && <span className="text-sm text-emerald-500">{passwordMessage}</span>}
                  {passwordError && <span className="text-sm text-destructive">{passwordError}</span>}
                </div>
              </form>
            </section>

            <section className="rounded-lg border bg-card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5" /> Account status
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-emerald-500 mb-1">{user.is_active ? "Active" : "Inactive"}</div>
                  <div className="text-xs text-muted-foreground">Account</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-primary mb-1">{user.is_verified ? "Verified" : "Pending"}</div>
                  <div className="text-xs text-muted-foreground">Verification</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-muted-foreground mb-1">{new Date(user.created_at).toLocaleDateString()}</div>
                  <div className="text-xs text-muted-foreground">Joined</div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}


