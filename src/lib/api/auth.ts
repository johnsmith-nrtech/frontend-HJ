import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthApiService } from "@/lib/services/auth-api";
import { SessionManager } from "@/lib/services/session-manager";
import { AuthUserResponse } from "@/lib/types/auth";

// User profile type
interface UserProfile {
  id: string;
  email: string;
  name?: string;
  phone_number?: string;
  created_at: string;
  updated_at: string;
}

// Get current user profile from session
export function useUserProfile() {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: async (): Promise<UserProfile | null> => {
      try {
        // Ensure we're in browser environment
        if (typeof window === "undefined") {
          return null;
        }

        if (!SessionManager.isAuthenticated()) {
          return null;
        }

        const user = SessionManager.getUser();
        if (!user) {
          return null;
        }

        // Convert the session user data to profile format
        const userData = user.data.user;
        return {
          id: userData.id,
          email: userData.email,
          name: userData.user_metadata?.email || "",
          phone_number: userData.phone || "",
          created_at: userData.created_at,
          updated_at: userData.updated_at || userData.created_at,
        };
      } catch (error) {
        console.error("Error getting user profile from session:", error);
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: typeof window !== "undefined" && SessionManager.isAuthenticated(), // Only run if in browser and authenticated
  });
}

// Update user profile (updates local session data)
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: Partial<UserProfile>) => {
      if (!SessionManager.isAuthenticated()) {
        throw new Error("Not authenticated");
      }

      const currentSession = SessionManager.getSession();
      if (!currentSession) {
        throw new Error("No session found");
      }

      // Update the user metadata in the session
      const currentUserData = currentSession.user.data.user;
      const updatedUserData = {
        ...currentUserData,
        user_metadata: {
          ...currentUserData.user_metadata,
          email: profile.name || currentUserData.user_metadata?.email,
        },
        phone: profile.phone_number || currentUserData.phone,
        updated_at: new Date().toISOString(),
      };

      const updatedUser: AuthUserResponse = {
        data: {
          user: updatedUserData,
        },
        error: null,
      };

      // Update the session with the new user data
      const updatedSession = {
        ...currentSession,
        user: updatedUser,
      };

      SessionManager.setSession(updatedSession);

      return {
        id: updatedUserData.id,
        email: updatedUserData.email,
        name: updatedUserData.user_metadata?.email || "",
        phone_number: updatedUserData.phone || "",
        created_at: updatedUserData.created_at,
        updated_at: updatedUserData.updated_at || updatedUserData.created_at,
      };
    },
    onSuccess: () => {
      // Invalidate user profile query to refetch with new data
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
}

// Sign out
export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await AuthApiService.signOut();
      return { success: true };
    },
    onSuccess: () => {
      // Clear all queries from cache on sign out
      queryClient.clear();
    },
  });
}
