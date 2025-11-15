import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth as useApiAuth } from "@/lib/providers/auth-provider";
import { AuthApiService } from "@/lib/services/auth-api";
import { SessionManager } from "@/lib/services/session-manager";

/**
 * Hook to manage authentication state and redirect unauthenticated users
 *
 * @param options Configuration options
 * @returns Authentication state and methods
 */
export function useAuth(
  options: {
    redirectTo?: string;
    requireAuth?: boolean;
  } = {}
) {
  const { redirectTo = "/login", requireAuth = true } = options;
  const { user, session, loading, signIn, signOut } = useApiAuth();
  const router = useRouter();

  // Ensure token validity and handle redirects
  useEffect(() => {
    const validateSession = async () => {
      if (loading) return;

      // If auth is required but user is not logged in, redirect to login
      if (requireAuth && !user) {
        router.push(redirectTo);
        return;
      }

      // If user is logged in, validate their session
      if (user && session) {
        try {
          // Check if the token is still valid
          if (SessionManager.isTokenExpired(session.expires_at)) {
            console.log("Token expired, signing out");
            await signOut();
            router.push(redirectTo);
            return;
          }

          // Optionally validate with the server
          try {
            await AuthApiService.getCurrentUser();
          } catch (error) {
            console.error("Session validation error:", error);
            await signOut();
            router.push(redirectTo);
          }
        } catch (error) {
          console.error("Error validating session:", error);
        }
      }
    };

    validateSession();
  }, [user, session, loading, requireAuth, redirectTo, router, signOut]);

  // Returns auth state and methods
  return {
    user,
    session,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
    // Helper to get the current token
    getToken: async () => {
      return SessionManager.getAccessToken();
    },
  };
}
