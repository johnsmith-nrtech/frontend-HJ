import React from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  WishlistApiService,
  type WishlistItem as ApiWishlistItem,
} from "../api/wishlist";
import {
  getGuestWishlist,
  addToGuestWishlist,
  removeFromGuestWishlist,
  clearGuestWishlist,
  type GuestWishlistItem,
} from "../utils/localStorage";
import { SessionManager } from "../services/session-manager";

// Local wishlist item interface for UI compatibility
interface LocalWishlistItem {
  id: string;
  variant_id: string;
  name: string;
  price: number;
  image?: string;
  size?: string;
  color?: string;
  stock?: number;
  created_at: string;
}

interface WishlistState {
  // State
  items: LocalWishlistItem[];
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  loadingItems: Set<string>; // Track which items are currently loading

  // Server sync state (for authenticated users)
  serverItems: ApiWishlistItem[];
  lastSyncedAt: number | null;

  // Actions
  addItem: (
    variant_id: string,
    productData?: Partial<LocalWishlistItem>
  ) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  toggleItem: (
    variant_id: string,
    productData?: Partial<LocalWishlistItem>
  ) => Promise<boolean>; // Returns true if added, false if removed

  // Authentication and sync actions
  checkAuthStatus: () => Promise<void>;
  syncWithServer: () => Promise<void>;
  syncGuestToServer: () => Promise<void>;

  // Local state management
  addItemLocally: (item: LocalWishlistItem) => void;
  removeItemLocally: (id: string) => void;
  clearWishlistLocally: () => void;
  loadGuestWishlist: () => void;

  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setItemLoading: (variant_id: string, loading: boolean) => void;
  isItemLoading: (variant_id: string) => boolean;
  isInWishlist: (variant_id: string) => boolean;
  getWishlistItem: (variant_id: string) => LocalWishlistItem | undefined;
}

// Helper function to convert API wishlist item to local wishlist item
const convertApiItemToLocal = (
  apiItem: ApiWishlistItem
): LocalWishlistItem => ({
  id: apiItem.id,
  variant_id: apiItem.variant.id,
  name: apiItem.variant.product.name,
  price: apiItem.variant.price,
  size: apiItem.variant.size,
  color: apiItem.variant.color,
  stock: apiItem.variant.stock,
  created_at: apiItem.created_at,
  image:
    apiItem.variant.variant_images?.[0]?.url ||
    apiItem.variant.product.images?.[0]?.url,
});

// Helper function to convert guest wishlist item to local wishlist item
const convertGuestItemToLocal = (
  guestItem: GuestWishlistItem
): LocalWishlistItem => ({
  id: guestItem.id,
  variant_id: guestItem.variant_id,
  name: guestItem.name,
  price: guestItem.price,
  size: guestItem.size,
  color: guestItem.color,
  stock: guestItem.stock,
  created_at: guestItem.created_at,
  image: guestItem.image,
});

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      isLoading: false,
      error: null,
      isAuthenticated: false,
      loadingItems: new Set(),
      serverItems: [],
      lastSyncedAt: null,

      // Add item to wishlist
      addItem: async (variant_id, productData) => {
        const {
          setError,
          syncWithServer,
          addItemLocally,
          setItemLoading,
          isAuthenticated,
        } = get();

        setItemLoading(variant_id, true);
        setError(null);

        // Create optimistic item for immediate UI feedback
        if (productData) {
          const optimisticItem: LocalWishlistItem = {
            id: variant_id,
            variant_id,
            name: productData.name || "Unknown Product",
            price: productData.price || 0,
            image: productData.image,
            size: productData.size,
            color: productData.color,
            stock: productData.stock,
            created_at: new Date().toISOString(),
          };

          // Add optimistically for immediate UI feedback
          addItemLocally(optimisticItem);
        }

        try {
          // Use cached authentication status first, only check if needed
          let currentAuthStatus = isAuthenticated;

          // Only check auth if we don't have a cached status
          if (currentAuthStatus === false) {
            try {
              const user = SessionManager.getUser();
              const isAuth = SessionManager.isAuthenticated();
              currentAuthStatus = !!(user && isAuth);
              set({ isAuthenticated: currentAuthStatus });
            } catch (authError) {
              console.warn("Failed to check auth status:", authError);
              currentAuthStatus = false;
            }
          }

          if (currentAuthStatus) {
            // Add to server for authenticated users
            await WishlistApiService.addToWishlist({ variant_id });
            // Sync with server to get the actual server state
            await syncWithServer();
          } else {
            // For guest users, persist to localStorage
            if (!productData) {
              throw new Error("Product data is required for guest users");
            }

            addToGuestWishlist({
              variant_id,
              name: productData.name || "Unknown Product",
              price: productData.price || 0,
              image: productData.image,
              size: productData.size,
              color: productData.color,
              stock: productData.stock,
            });
          }
        } catch (error) {
          // Revert optimistic update on error
          const { removeItemLocally } = get();
          removeItemLocally(variant_id);

          setError(
            error instanceof Error
              ? error.message
              : "Failed to add item to wishlist"
          );
          throw error;
        } finally {
          setItemLoading(variant_id, false);
        }
      },

      // Remove item from wishlist
      removeItem: async (id) => {
        const {
          isAuthenticated,
          setError,
          removeItemLocally,
          syncWithServer,
          setItemLoading,
          items,
        } = get();

        // Find the item to get its variant_id for loading state
        const item = items.find((item) => item.id === id);
        const variant_id = item?.variant_id || id;

        setItemLoading(variant_id, true);
        setError(null);

        try {
          // Check authentication status first if not already set
          let currentAuthStatus = isAuthenticated;
          if (!currentAuthStatus) {
            try {
              const user = SessionManager.getUser();
              const isAuth = SessionManager.isAuthenticated();
              currentAuthStatus = !!(user && isAuth);
              set({ isAuthenticated: currentAuthStatus });
            } catch (authError) {
              console.warn("Failed to check auth status:", authError);
              currentAuthStatus = false;
            }
          }

          if (currentAuthStatus) {
            // Remove from server for authenticated users
            console.log(
              "Removing from wishlist via API for authenticated user"
            );
            await WishlistApiService.removeFromWishlist(id);
            await syncWithServer();
          } else {
            // Remove from localStorage for guest users
            console.log(
              "Removing from wishlist via localStorage for guest user"
            );
            removeFromGuestWishlist(id);
            removeItemLocally(id);
          }
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to remove item from wishlist"
          );
          throw error;
        } finally {
          setItemLoading(variant_id, false);
        }
      },

      // Clear entire wishlist
      clearWishlist: async () => {
        const {
          isAuthenticated,
          setLoading,
          setError,
          clearWishlistLocally,
          syncWithServer,
        } = get();

        setLoading(true);
        setError(null);

        try {
          if (isAuthenticated) {
            // Clear server wishlist for authenticated users
            await WishlistApiService.clearWishlist();
            await syncWithServer();
          } else {
            // Clear localStorage for guest users
            clearGuestWishlist();
            clearWishlistLocally();
          }
        } catch (error) {
          setError(
            error instanceof Error ? error.message : "Failed to clear wishlist"
          );
          throw error;
        } finally {
          setLoading(false);
        }
      },

      // Toggle item in wishlist (add if not present, remove if present)
      toggleItem: async (variant_id, productData) => {
        const { items, setError, setItemLoading } = get();
        const existingItem = items.find(
          (item) => item.variant_id === variant_id
        );

        setItemLoading(variant_id, true);
        setError(null);

        try {
          if (existingItem) {
            await get().removeItem(existingItem.id);
            return false;
          } else {
            await get().addItem(variant_id, productData);
            return true;
          }
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to toggle wishlist item"
          );
          throw error;
        } finally {
          setItemLoading(variant_id, false);
        }
      },

      // Check authentication status
      checkAuthStatus: async () => {
        try {
          const user = SessionManager.getUser();
          const isAuthenticated = SessionManager.isAuthenticated();
          const authStatus = !!(user && isAuthenticated);

          // console.log("CheckAuthStatus result:", {
          //   user: !!user,
          //   isAuthenticated,
          //   authStatus,
          // });
          set({ isAuthenticated: authStatus });

          if (authStatus) {
            // If user just logged in, sync guest data to server
            await get().syncGuestToServer();
            // Then load server data
            await get().syncWithServer();
          } else {
            // If user logged out, load guest data
            get().loadGuestWishlist();
          }
        } catch (error) {
          console.error("Failed to check auth status:", error);
          set({ isAuthenticated: false });
          get().loadGuestWishlist();
        }
      },

      // Sync guest wishlist to server (when user logs in)
      syncGuestToServer: async () => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) return;

        try {
          const guestItems = getGuestWishlist();

          // Add each guest item to server
          for (const guestItem of guestItems) {
            try {
              await WishlistApiService.addToWishlist({
                variant_id: guestItem.variant_id,
              });
            } catch (error) {
              console.warn(
                `Failed to sync guest item ${guestItem.id} to server:`,
                error
              );
            }
          }

          // Clear guest data after successful sync
          clearGuestWishlist();
        } catch (error) {
          console.error("Failed to sync guest wishlist to server:", error);
        }
      },

      // Sync with server
      syncWithServer: async () => {
        const { setError } = get();

        try {
          const serverItems = await WishlistApiService.getWishlistItems();

          set({
            serverItems,
            items: serverItems.map(convertApiItemToLocal),
            lastSyncedAt: Date.now(),
          });
        } catch (error) {
          console.error("Failed to sync wishlist with server:", error);
          setError(
            error instanceof Error
              ? error.message
              : "Failed to sync with server"
          );
        }
      },

      // Local state management (for instant feedback)
      addItemLocally: (item) =>
        set((state) => {
          // Check if item already exists
          const existingItem = state.items.find(
            (i) => i.variant_id === item.variant_id
          );

          if (existingItem) {
            return state; // Don't add duplicates
          }

          return {
            items: [...state.items, item],
          };
        }),

      removeItemLocally: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      clearWishlistLocally: () =>
        set({
          items: [],
        }),

      // Load guest wishlist from localStorage
      loadGuestWishlist: () => {
        try {
          const guestItems = getGuestWishlist();
          set({
            items: guestItems.map(convertGuestItemToLocal),
          });
        } catch (error) {
          console.error("Failed to load guest wishlist:", error);
        }
      },

      // Utility actions
      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      setAuthenticated: (authenticated) =>
        set({ isAuthenticated: authenticated }),

      // Individual item loading management
      setItemLoading: (variant_id, loading) =>
        set((state) => {
          const newLoadingItems = new Set(state.loadingItems);
          if (loading) {
            newLoadingItems.add(variant_id);
          } else {
            newLoadingItems.delete(variant_id);
          }
          return { loadingItems: newLoadingItems };
        }),

      isItemLoading: (variant_id) => {
        const { loadingItems } = get();
        return loadingItems.has(variant_id);
      },

      // Check if a variant is in the wishlist
      isInWishlist: (variant_id) => {
        const { items } = get();
        return items.some((item) => item.variant_id === variant_id);
      },

      // Get wishlist item by variant_id
      getWishlistItem: (variant_id) => {
        const { items } = get();
        return items.find((item) => item.variant_id === variant_id);
      },
    }),
    {
      name: "wishlist-storage",
      // Only persist essential data, not loading states
      partialize: (state) => ({
        items: state.items,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
);

// Hook to auto-sync wishlist on mount
export const useWishlistSync = () => {
  const syncWithServer = useWishlistStore((state) => state.syncWithServer);
  const lastSyncedAt = useWishlistStore((state) => state.lastSyncedAt);

  // Auto-sync every 5 minutes or on mount if never synced
  const shouldSync = !lastSyncedAt || Date.now() - lastSyncedAt > 5 * 60 * 1000;

  if (shouldSync && typeof window !== "undefined") {
    syncWithServer();
  }
};

// Hook for wishlist operations
export const useWishlist = () => {
  const {
    items,
    isLoading,
    error,
    isAuthenticated,
    addItem,
    removeItem,
    clearWishlist,
    toggleItem,
    isInWishlist,
    getWishlistItem,
    checkAuthStatus,
    isItemLoading,
  } = useWishlistStore();

  // Auto-check authentication status on first use if not already set
  React.useEffect(() => {
    if (!isAuthenticated && typeof window !== "undefined") {
      checkAuthStatus().catch(console.error);
    }
  }, [checkAuthStatus, isAuthenticated]);

  return {
    items,
    isLoading,
    error,
    isAuthenticated,
    addItem,
    removeItem,
    clearWishlist,
    toggleItem,
    isInWishlist,
    getWishlistItem,
    checkAuthStatus,
    isItemLoading,
    totalItems: items.length,
  };
};
