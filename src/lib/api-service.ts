import { SessionManager } from "@/lib/services/session-manager";
import { AuthApiService } from "@/lib/services/auth-api";

// Base API URL from environment or fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
/**
 * ApiService provides centralized methods for making API calls with authentication
 */
export class ApiService {
  // Store the last token refresh time to prevent too many refresh attempts
  private static lastTokenRefresh: number = 0;
  // Minimum interval between token refreshes (15 seconds)
  private static readonly REFRESH_INTERVAL = 15000;
  // Maximum number of retries for a request
  private static readonly MAX_RETRIES = 3;

  /**
   * Get the current auth token from session storage
   */
  static getAuthToken(): string | null {
    try {
      return SessionManager.getAccessToken();
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  }

  /**
   * Get the current refresh token from session storage
   */
  static getRefreshToken(): string | null {
    try {
      return SessionManager.getRefreshToken();
    } catch (error) {
      console.error("Error getting refresh token:", error);
      return null;
    }
  }

  /**
   * Refresh the auth token using the API
   */
  static async refreshToken(): Promise<string | null> {
    const now = Date.now();

    // Prevent excessive refresh calls
    if (now - this.lastTokenRefresh < this.REFRESH_INTERVAL) {
      return this.getAuthToken();
    }

    try {
      this.lastTokenRefresh = now;
      const response = await AuthApiService.refreshToken();
      return response.access_token;
    } catch (error) {
      console.error("Error refreshing token:", error);
      // If refresh fails, clear the session
      SessionManager.clearSession();
      return null;
    }
  }

  /**
   * Make an authenticated API request with automatic token refresh and retries
   */
  static async fetchWithAuth(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<Response> {
    // Always try to get a fresh token first
    let token = this.getAuthToken();

    if (!token) {
      // If no token, try to refresh once
      token = await this.refreshToken();
      if (!token) {
        throw new Error("No authentication token available");
      }
    }

    const headers: HeadersInit = {
      Authorization: `Bearer ${token}`,
      "x-refresh-token": this.getRefreshToken() || "",
      ...options.headers,
    };

    // Only set Content-Type to application/json if it's not FormData
    // For FormData, the browser will set the correct Content-Type with boundary
    if (!(options.body instanceof FormData)) {
      (headers as Record<string, string>)["Content-Type"] = "application/json";
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      // If unauthorized and we haven't exceeded max retries
      if (response.status === 401 && retryCount < this.MAX_RETRIES) {
        // Try to refresh the token
        const newToken = await this.refreshToken();
        if (newToken) {
          // Retry the request with the new token
          return this.fetchWithAuth(endpoint, options, retryCount + 1);
        }
      }

      return response;
    } catch (error) {
      // If it's a network error and we haven't exceeded max retries
      if (error instanceof Error && retryCount < this.MAX_RETRIES) {
        // Wait for a short time before retrying
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (retryCount + 1))
        );
        return this.fetchWithAuth(endpoint, options, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Make a public API request (no auth required)
   */
  static async fetchPublic(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const headers: HeadersInit = {
      ...options.headers,
    };

    // Only set Content-Type to application/json if it's not FormData
    if (!(options.body instanceof FormData)) {
      (headers as Record<string, string>)["Content-Type"] = "application/json";
    }

    return fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  }

  /**
   * Handle API response, parsing JSON and handling errors
   */
  static async handleResponse<T>(
    response: Response,
    errorMessage?: string
  ): Promise<T> {
    if (!response.ok) {
      let message = errorMessage || `API request failed: ${response.status}`;

      try {
        const errorData = await response.json();
        if (errorData.message) {
          message = errorData.message;
        }
      } catch {
        // If parsing fails, use the default message
      }

      throw new Error(message);
    }

    return response.json();
  }
}
