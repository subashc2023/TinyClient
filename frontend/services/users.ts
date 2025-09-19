import apiClient from "@/lib/api-client";
import type { InviteResponse, MessageResponse, User } from "@/lib/types";

export async function fetchUsers(includeInactive = true): Promise<User[]> {
  const res = await apiClient.get<User[]>("/api/users", {
    params: { include_inactive: includeInactive },
  });
  return res.data;
}

export async function updateUserStatus(userId: number, isActive: boolean): Promise<User> {
  const res = await apiClient.patch<User>(`/api/users/${userId}/status`, {
    is_active: isActive,
  });
  return res.data;
}

export async function inviteUser(email: string): Promise<InviteResponse> {
  const res = await apiClient.post<InviteResponse>("/api/users/invite", { email });
  return res.data;
}

export async function updateProfile(payload: { email?: string; username?: string }): Promise<User> {
  const res = await apiClient.patch<User>("/api/users/me", payload);
  return res.data;
}

export async function updatePassword(payload: { current_password: string; new_password: string }): Promise<MessageResponse> {
  const res = await apiClient.patch<MessageResponse>("/api/users/me/password", payload);
  return res.data;
}
