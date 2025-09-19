import apiClient from "@/lib/api-client";
import type {
  InviteDetail,
  LoginResponse,
  MessageResponse,
  TokenVerifyResponse,
} from "@/lib/types";

export async function loginService(emailOrUsername: string, password: string): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>("/api/auth/login", {
    email_or_username: emailOrUsername,
    password,
  });
  return res.data;
}

export async function signupService(email: string, username: string, password: string): Promise<MessageResponse> {
  const res = await apiClient.post<MessageResponse>("/api/auth/signup", {
    email,
    username,
    password,
  });
  return res.data;
}

export async function verifyService(accessToken: string): Promise<TokenVerifyResponse> {
  const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
  const res = await apiClient.get<TokenVerifyResponse>("/api/auth/verify", { headers });
  return res.data;
}

export async function logoutService(accessToken: string): Promise<MessageResponse> {
  const res = await apiClient.post<MessageResponse>("/api/auth/logout", undefined, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data;
}

export async function verifyEmailService(token: string): Promise<MessageResponse> {
  const res = await apiClient.post<MessageResponse>("/api/auth/verify-email", { token });
  return res.data;
}

export async function resendVerificationEmail(identifier: string): Promise<MessageResponse> {
  // identifier can be email or username
  const res = await apiClient.post<MessageResponse>("/api/auth/verify-email/resend", { email_or_username: identifier });
  return res.data;
}

export async function requestPasswordReset(email: string): Promise<MessageResponse> {
  const res = await apiClient.post<MessageResponse>("/api/auth/password/reset", { email });
  return res.data;
}

export async function confirmPasswordReset(token: string, newPassword: string): Promise<MessageResponse> {
  const res = await apiClient.post<MessageResponse>("/api/auth/password/reset/confirm", { token, new_password: newPassword });
  return res.data;
}

export async function fetchInviteDetails(token: string): Promise<InviteDetail> {
  const res = await apiClient.get<InviteDetail>(`/api/auth/invite/${token}`);
  return res.data;
}

export async function acceptInviteService(
  token: string,
  username: string,
  password: string,
): Promise<MessageResponse> {
  const res = await apiClient.post<MessageResponse>("/api/auth/invite/accept", {
    token,
    username,
    password,
  });
  return res.data;
}
