import { StoredSession, AuthUserResponse } from "@/lib/types/auth";

/**
 * SessionManager handles storing and retrieving authentication session data
 * Uses localStorage for persistence across browser sessions
 */
export class SessionManager {
  private static readonly SESSION_KEY = "auth_session";
  private static readonly TOKEN_KEY = "auth_token";
  private static readonly REFRESH_TOKEN_KEY = "refresh_token";
  private static readonly USER_KEY = "auth_user";

  /**
   * Check if we're in a browser environment
   */
  private static isBrowser(): boolean {
    return typeof window !== "undefined" && typeof localStorage !== "undefined";
  }

  /**
   * Store the complete session data
   */
  static setSession(session: StoredSession): void {
    if (!this.isBrowser()) {
      return;
    }

    try {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      localStorage.setItem(this.TOKEN_KEY, session.access_token);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, session.refresh_token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(session.user));
    } catch (error) {
      console.error("Error storing session:", error);
    }
  }

  /**
   * Get the complete session data
   */
  static getSession(): StoredSession | null {
    if (!this.isBrowser()) {
      return null;
    }

    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY);
      if (!sessionData) return null;

      const session = JSON.parse(sessionData) as StoredSession;

      // Check if token is expired
      if (this.isTokenExpired(session.expires_at)) {
        this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error("Error retrieving session:", error);
      return null;
    }
  }

  /**
   * Get just the access token
   */
  static getAccessToken(): string | null {
    if (!this.isBrowser()) {
      return null;
    }

    try {
      const session = this.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error("Error retrieving access token:", error);
      return null;
    }
  }

  /**
   * Get just the refresh token
   */
  static getRefreshToken(): string | null {
    if (!this.isBrowser()) {
      return null;
    }

    try {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error("Error retrieving refresh token:", error);
      return null;
    }
  }

  /**
   * Get the current user
   */
  static getUser(): AuthUserResponse | null {
    if (!this.isBrowser()) {
      return null;
    }

    try {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error retrieving user:", error);
      return null;
    }
  }

  /**
   * Update just the tokens (for refresh operations)
   */
  static updateTokens(
    accessToken: string,
    refreshToken: string,
    expiresIn: number
  ): void {
    if (!this.isBrowser()) {
      return;
    }

    try {
      const session = this.getSession();
      if (session) {
        const updatedSession: StoredSession = {
          ...session,
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: Date.now() + expiresIn * 1000,
        };
        this.setSession(updatedSession);
      }
    } catch (error) {
      console.error("Error updating tokens:", error);
    }
  }

  /**
   * Clear all session data
   */
  static clearSession(): void {
    if (!this.isBrowser()) {
      return;
    }

    try {
      localStorage.removeItem(this.SESSION_KEY);
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    } catch (error) {
      console.error("Error clearing session:", error);
    }
  }

  /**
   * Check if a token is expired
   */
  static isTokenExpired(expiresAt: number): boolean {
    return Date.now() >= expiresAt;
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const session = this.getSession();
    return session !== null && !this.isTokenExpired(session.expires_at);
  }

  /**
   * Get time until token expires (in milliseconds)
   */
  static getTimeUntilExpiry(): number {
    const session = this.getSession();
    if (!session) return 0;
    return Math.max(0, session.expires_at - Date.now());
  }
}
