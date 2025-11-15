// Authentication types for API-based authentication

export interface AppMetadata {
  provider: string;
  providers: string[];
}

export interface UserMetadata {
  email: string;
  email_verified: boolean;
  phone_verified: boolean;
  sub: string;
}

export interface IdentityData {
  email: string;
  email_verified: boolean;
  phone_verified: boolean;
  sub: string;
}

export interface Identity {
  identity_id: string;
  id: string;
  user_id: string;
  identity_data: IdentityData;
  provider: string;
  last_sign_in_at: string;
  created_at: string;
  updated_at: string;
  email: string;
}

export interface User {
  id: string;
  aud: string;
  role: string;
  email: string;
  email_confirmed_at: string;
  phone: string;
  confirmed_at: string;
  last_sign_in_at: string;
  app_metadata: AppMetadata;
  user_metadata: UserMetadata;
  identities: Identity[];
  created_at: string;
  updated_at: string;
  is_anonymous: boolean;
}

export interface AuthUserResponse {
  data: {
    user: User;
  };
  error: null | AuthError;
}

export interface AuthSession {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: AuthUserResponse;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: AuthUserResponse;
}

export interface SignUpData {
  name?: string;
  email?: string;
  phone?: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  data?: SignUpData;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface MagicLinkRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface AuthError {
  statusCode: number;
  message: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: AuthError;
}

// Session storage interface
export interface StoredSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: AuthUserResponse;
}
