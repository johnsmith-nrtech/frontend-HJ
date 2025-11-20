import { useEffect } from "react";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { WishlistApiService } from "@/lib/api/wishlist";
import { useAuth } from "@/lib/providers/auth-provider";

/**
 * Hook to handle app initialization and authentication state changes
 * This includes migrating guest wishlist to authenticated user
 * Note: Cart is now localStorage-only and doesn't require migration
 */
export function useAppInit() {
  const { user } = useAuth();
  const { syncWithServer: syncWishlist } = useWishlistStore();

  useEffect(() => {
    const handleUserAuthentication = async () => {
      if (!user) return;

      try {
        // Get guest session ID from localStorage or cookie
        const guestSessionId = localStorage.getItem("guest_session_id");

        if (guestSessionId) {
          // Migrate guest wishlist (cart is now localStorage-only)
          await migrateGuestWishlist(guestSessionId);

          // Clean up guest session
          localStorage.removeItem("guest_session_id");
        }

        // Sync wishlist with server (cart doesn't need sync anymore)
        await syncWishlist();
      } catch (error) {
        console.error("Failed to initialize user data:", error);
      }
    };

    handleUserAuthentication();
  }, [user, syncWishlist]);

  const migrateGuestWishlist = async (sessionId: string) => {
    try {
      await WishlistApiService.migrateGuestWishlist({ session_id: sessionId });
      console.log("Guest wishlist migrated successfully");
    } catch (error) {
      console.warn("Failed to migrate guest wishlist:", error);
    }
  };
}

/**
 * Hook to handle guest session initialization
 */
export function useGuestSession() {
  useEffect(() => {
    // Create a guest session ID if one doesn't exist
    if (
      typeof window !== "undefined" &&
      !localStorage.getItem("guest_session_id")
    ) {
      const guestSessionId = `guest_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      localStorage.setItem("guest_session_id", guestSessionId);
    }
  }, []);

  const getGuestSessionId = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("guest_session_id");
  };

  return { getGuestSessionId };
}
