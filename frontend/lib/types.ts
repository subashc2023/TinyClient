export interface User {
  id: number;
  email: string;
  username: string;
  is_admin: boolean;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at?: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginResponse {
  user: User;
  tokens: TokenPair;
}

export interface TokenVerifyResponse {
  valid: boolean;
  user: User;
}

export interface MessageResponse {
  message: string;
}

export interface InviteDetail {
  email: string;
  expires_at: string;
  accepted: boolean;
}

export interface InviteResponse {
  id: number;
  email: string;
  expires_at: string;
  invited_by_user_id?: number | null;
  accepted_at?: string | null;
}
