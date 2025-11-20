import {
  AuthResponse,
  SignUpRequest,
  SignInRequest,
  MagicLinkRequest,
  ResetPasswordRequest,
  AuthUserResponse,
  AuthError,
  StoredSession,
  User,
} from "@/lib/types/auth";
import { SessionManager } from "./session-manager";

// Get API URL from environment
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Internal API response types
interface AuthApiResponse {
  data?: {
    session: {
      access_token: string;
      token_type: string;
      expires_in: number;
      refresh_token: string;
    };
    user: User;
  };
  session?: {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
  };
  user?: User;
}

interface UserApiResponse {
  data?: {
    user: User;
  };
  user?: User;
}

/**
 * AuthApiService handles all authentication-related API calls
 */
export class AuthApiService {
  /**
   * Make an API request with error handling
   */
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_URL}${endpoint}`;

    const defaultHeaders = {
      "Content-Type": "application/json",
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        const error: AuthError = {
          statusCode: response.status,
          message:
            data.message || `Request failed with status ${response.status}`,
        };
        throw error;
      }

      return data;
    } catch (error) {
      if (error instanceof Error && "statusCode" in error) {
        throw error; // Re-throw AuthError
      }

      // Handle network errors
      const authError: AuthError = {
        statusCode: 500,
        message:
          error instanceof Error ? error.message : "Network error occurred",
      };
      throw authError;
    }
  }

  /**
   * Make an authenticated API request
   */
  private static async makeAuthenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = SessionManager.getAccessToken();
    const refreshToken = SessionManager.getRefreshToken();

    if (!token) {
      const error: AuthError = {
        statusCode: 401,
        message: "No authentication token available",
      };
      throw error;
    }

    return this.makeRequest<T>(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        "x-refresh-token": refreshToken || "",
      },
    });
  }

  /**
   * Sign up a new user
   */
  static async signUp(request: SignUpRequest): Promise<AuthResponse> {
    const apiResponse = await this.makeRequest<AuthApiResponse>(
      "/auth/signup",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );

    // Handle the wrapped response format
    const responseData = apiResponse.data || apiResponse;
    const sessionData = responseData.session;
    const userData = responseData.user;

    if (!sessionData || !userData) {
      throw new Error("Invalid response format from signup API");
    }

    // Wrap user data in AuthUserResponse format
    const wrappedUser: AuthUserResponse = {
      data: {
        user: userData,
      },
      error: null,
    };

    // Create the expected response format
    const response: AuthResponse = {
      access_token: sessionData.access_token,
      token_type: sessionData.token_type,
      expires_in: sessionData.expires_in,
      refresh_token: sessionData.refresh_token,
      user: wrappedUser,
    };

    // Store session data
    const session: StoredSession = {
      access_token: sessionData.access_token,
      refresh_token: sessionData.refresh_token,
      expires_at: Date.now() + sessionData.expires_in * 1000,
      user: wrappedUser,
    };
    SessionManager.setSession(session);

    return response;
  }

  /**
   * Sign in an existing user
   */
  static async signIn(request: SignInRequest): Promise<AuthResponse> {
    const apiResponse = await this.makeRequest<AuthApiResponse>(
      "/auth/signin",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );

    // Handle the wrapped response format
    const responseData = apiResponse.data || apiResponse;
    const sessionData = responseData.session;
    const userData = responseData.user;

    if (!sessionData || !userData) {
      throw new Error("Invalid response format from signin API");
    }

    // Wrap user data in AuthUserResponse format
    const wrappedUser: AuthUserResponse = {
      data: {
        user: userData,
      },
      error: null,
    };

    // Create the expected response format
    const response: AuthResponse = {
      access_token: sessionData.access_token,
      token_type: sessionData.token_type,
      expires_in: sessionData.expires_in,
      refresh_token: sessionData.refresh_token,
      user: wrappedUser,
    };

    // Store session data
    const session: StoredSession = {
      access_token: sessionData.access_token,
      refresh_token: sessionData.refresh_token,
      expires_at: Date.now() + sessionData.expires_in * 1000,
      user: wrappedUser,
    };
    SessionManager.setSession(session);

    return response;
  }

  /**
   * Send magic link for passwordless authentication
   */
  static async sendMagicLink(
    request: MagicLinkRequest
  ): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>("/auth/magic-link", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  /**
   * Send password reset email
   */
  static async resetPassword(
    request: ResetPasswordRequest
  ): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  /**
   * Sign out the current user
   */
  static async signOut(): Promise<{ message: string }> {
    try {
      const response = await this.makeAuthenticatedRequest<{ message: string }>(
        "/auth/signout",
        {
          method: "POST",
        }
      );

      // Clear session data regardless of API response
      SessionManager.clearSession();

      return response;
    } catch (error) {
      // Clear session data even if API call fails
      SessionManager.clearSession();
      throw error;
    }
  }

  /**
   * Get current user information
   */
  static async getCurrentUser(): Promise<AuthUserResponse> {
    const userData = await this.makeAuthenticatedRequest<UserApiResponse>(
      "/auth/user",
      {
        method: "GET",
      }
    );

    // If the API already returns the wrapped format, use it directly
    if (userData.data && userData.data.user) {
      return {
        data: userData.data,
        error: null,
      };
    }

    // Otherwise, wrap the user data
    if (userData.user) {
      return {
        data: {
          user: userData.user,
        },
        error: null,
      };
    }

    // Fallback - treat the response as a direct user object
    return {
      data: {
        user: userData as unknown as User,
      },
      error: null,
    };
  }

  /**
   * GET CURRENT USER USING ACCESS TOKEN
   */
  static async getUserFromToken(
    accessToken: string,
    refreshToken: string
  ): Promise<AuthUserResponse> {
    try {
      const userData = await this.makeRequest<UserApiResponse>("/auth/user", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "x-refresh-token": refreshToken,
        },
      });

      // If the API already returns the wrapped format, use it directly
      if (userData.data && userData.data.user) {
        return {
          data: userData.data,
          error: null,
        };
      }

      // Otherwise, wrap the user data
      if (userData.user) {
        return {
          data: {
            user: userData.user,
          },
          error: null,
        };
      }

      // Fallback - treat the response as a direct user object
      return {
        data: {
          user: userData as unknown as User,
        },
        error: null,
      };
    } catch (error) {
      if (error instanceof Error && "statusCode" in error) {
        throw error; // Re-throw AuthError
      }

      // Handle network errors
      const authError: AuthError = {
        statusCode: 500,
        message:
          error instanceof Error ? error.message : "Network error occurred",
      };
      throw authError;
    }
  }

  /**
   * Refresh the access token using refresh token
   * Note: This endpoint needs to be implemented in the backend API
   */
  static async refreshToken(): Promise<AuthResponse> {
    const refreshToken = SessionManager.getRefreshToken();

    if (!refreshToken) {
      const error: AuthError = {
        statusCode: 401,
        message: "No refresh token available",
      };
      throw error;
    }

    try {
      // Try to refresh using a hypothetical refresh endpoint
      // This endpoint needs to be implemented in the backend
      const response = await this.makeRequest<AuthResponse>("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      // Update session with new tokens
      SessionManager.updateTokens(
        response.access_token,
        response.refresh_token,
        response.expires_in
      );

      return response;
    } catch (error) {
      // If refresh fails, clear the session and throw error
      SessionManager.clearSession();
      throw error;
    }
  }

  /**
   * Check if user is currently authenticated
   */
  static isAuthenticated(): boolean {
    return SessionManager.isAuthenticated();
  }

  /**
   * Get current session
   */
  static getCurrentSession(): StoredSession | null {
    return SessionManager.getSession();
  }

  /**
   * Get current user from session
   */
  static getCurrentUserFromSession(): AuthUserResponse | null {
    return SessionManager.getUser();
  }

  /**
   * Sign in with OAuth (Google, etc.)
   */
  static async signInWithOauth(
    provider: string,
    oauthToken: string
  ): Promise<AuthResponse> {
    // Call your backend /auth/oauth endpoint (or directly Supabase if you prefer)
    const apiResponse = await this.makeRequest<AuthApiResponse>("/auth/oauth", {
      method: "POST",
      body: JSON.stringify({
        provider,
        token: oauthToken,
      }),
    });

    // Handle wrapped response format
    const responseData = apiResponse.data || apiResponse;
    const sessionData = responseData.session;
    const userData = responseData.user;

    // Even if token/session is null, user should still exist (like in your example)
    if (!userData) {
      throw new Error("Invalid response format from oauth signin API");
    }

    // Wrap user data in AuthUserResponse format
    const wrappedUser: AuthUserResponse = {
      data: {
        user: userData,
      },
      error: null,
    };

    // Create the expected AuthResponse
    const response: AuthResponse = {
      access_token: sessionData?.access_token || "",
      token_type: sessionData?.token_type || "bearer",
      expires_in: sessionData?.expires_in || 0,
      refresh_token: sessionData?.refresh_token || "",
      user: wrappedUser,
    };

    // Store session data (if present)
    if (sessionData?.access_token) {
      const session: StoredSession = {
        access_token: sessionData.access_token,
        refresh_token: sessionData.refresh_token,
        expires_at: Date.now() + sessionData.expires_in * 1000,
        user: wrappedUser,
      };
      SessionManager.setSession(session);
    }

    return response;
  }
}
