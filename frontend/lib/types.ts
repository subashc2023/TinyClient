export interface User {
  id: number;
  email: string;
  username: string;
  is_admin: boolean;
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


