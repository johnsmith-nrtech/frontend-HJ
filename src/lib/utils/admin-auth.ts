import { SessionManager } from "@/lib/services/session-manager";
import { AuthUserResponse } from "@/lib/types/auth";

/**
 * Check if the current user has admin role
 */
export function isUserAdmin(): boolean {
  try {
    const user = SessionManager.getUser();
    if (!user || !user.data?.user) {
      return false;
    }

    return user.data.user.role === "admin";
  } catch (error) {
    console.error("Error checking admin role:", error);
    return false;
  }
}

/**
 * Check if a specific user has admin role
 */
export function isAdmin(user: AuthUserResponse | null): boolean {
  if (!user || !user.data?.user) {
    return false;
  }

  return user.data.user.role === "admin";
}

/**
 * Get current user role
 */
export function getCurrentUserRole(): string | null {
  try {
    const user = SessionManager.getUser();
    if (!user || !user.data?.user) {
      return null;
    }

    return user.data.user.role;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
}

/**
 * Check if user is authenticated and has admin role
 */
export function isAuthenticatedAdmin(): boolean {
  return SessionManager.isAuthenticated() && isUserAdmin();
}
