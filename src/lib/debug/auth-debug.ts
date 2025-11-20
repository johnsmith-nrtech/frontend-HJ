import { SessionManager } from "../services/session-manager";

/**
 * Debug function to check authentication status
 */
export async function debugAuthStatus() {
  try {
    console.log("=== AUTH DEBUG START ===");

    // Check user from SessionManager
    const user = SessionManager.getUser();
    console.log("SessionManager.getUser() result:", user);

    // Check session
    const session = SessionManager.getSession();
    console.log("SessionManager.getSession() result:", session);

    // Check authentication status
    const isAuthenticated = SessionManager.isAuthenticated();
    console.log("SessionManager.isAuthenticated() result:", isAuthenticated);

    // Check access token
    const accessToken = SessionManager.getAccessToken();
    console.log("Access token exists:", !!accessToken);

    // Final status
    const finalAuthStatus = !!(user && isAuthenticated);
    console.log("Final auth status:", finalAuthStatus);

    console.log("=== AUTH DEBUG END ===");

    return {
      user,
      session,
      isAuthenticated,
      accessToken: !!accessToken,
      finalAuthStatus,
    };
  } catch (error) {
    console.error("Auth debug error:", error);
    return {
      user: null,
      session: null,
      isAuthenticated: false,
      accessToken: false,
      finalAuthStatus: false,
      error,
    };
  }
}

/**
 * Add this to any component to debug auth status
 */
export function useAuthDebug() {
  const checkAuth = async () => {
    const result = await debugAuthStatus();
    console.log("Auth debug result:", result);
    return result;
  };

  return { checkAuth };
}
