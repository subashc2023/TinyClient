import apiClient from "@/lib/api-client";
import type { User, LoginResponse, TokenVerifyResponse } from "@/lib/types";

export async function loginService(emailOrUsername: string, password: string): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>("/api/auth/login", {
    email_or_username: emailOrUsername,
    password,
  });
  return res.data;
}

export async function verifyService(accessToken: string): Promise<TokenVerifyResponse> {
  const res = await apiClient.get<TokenVerifyResponse>("/api/auth/verify", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data;
}

export async function logoutService(accessToken: string): Promise<void> {
  await apiClient.post("/api/auth/logout", undefined, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}


