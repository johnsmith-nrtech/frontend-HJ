import React from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CartApiService,
  type Cart as ApiCart,
  type CartItem as ApiCartItem,
} from "../api/cart";

import { SessionManager } from "../services/session-manager";

// Local cart item interface for UI compatibility
interface LocalCartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant_id: string;
  size?: string;
  color?: string;
  availableColors?: string[];
  stock?: number;
  delivery_time_days?: string;
  assemble_charges?: number;
  created_at: string;
  updated_at: string;
  variant?: {
    color?: string;
    size?: string;
    material?: string;
    delivery_time_days?: string;
    assemble_charges?: number;
    sku?: string;
    availableColors?: string[];
  };
}

interface ShippingInfo {
  method: "free" | "express" | "pickup";
  cost: number;
  label: string;
}

interface CartState {
  // State
  items: LocalCartItem[];
  totalItems: number;
  totalPrice: number;
  shippingInfo: ShippingInfo;
  discount: number;
  couponCode: string;
  isLoading: boolean;
  error: string | null;
  loadingItems: Set<string>;

  // Server sync state (for authenticated users)
  serverCart: ApiCart | null;
  lastSyncedAt: number | null;

  // Actions
  addItem: (
    item: Omit<LocalCartItem, "quantity" | "created_at" | "updated_at">,
    quantity?: number
  ) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  updateItemColor: (id: string, color: string) => void;
  clearCart: () => Promise<void>;
  setItemLoading: (itemId: string, loading: boolean) => void;
  isItemLoading: (itemId: string) => boolean;

  // Authentication and sync actions
  checkAuthStatus: () => boolean;
  syncWithServer: () => Promise<void>;
  syncCartWithServerAfterLogin: () => Promise<void>;

  // Local state management
  addItemLocally: (item: LocalCartItem) => void;
  removeItemLocally: (id: string) => void;
  updateQuantityLocally: (id: string, quantity: number) => void;
  clearCartLocally: () => void;

  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setShippingInfo: (shipping: ShippingInfo) => void;
  setCouponCode: (code: string) => void;
  setDiscount: (discount: number) => void;
  calculateTotals: () => void;
  getCartTotal: () => number;
}

// Helper function to convert API cart item to local cart item
const convertApiItemToLocal = (apiItem: ApiCartItem): LocalCartItem => ({
  id: apiItem.id,
  variant_id: apiItem.variant.id,
  name: apiItem.variant.product.name,
  price: apiItem.variant.price,
  quantity: apiItem.quantity,
  size: apiItem.variant.size,
  color: apiItem.variant.color,
  stock: apiItem.variant.stock,
  created_at: apiItem.created_at,
  updated_at: apiItem.updated_at,
  delivery_time_days: apiItem.variant.delivery_time_days,
  assemble_charges: apiItem.variant.assemble_charges,
  image:
    apiItem.variant.variant_images?.[0]?.url ||
    apiItem.variant.product.images?.[0]?.url,

  // ✅ Add variant object
  variant: {
    color: apiItem.variant.color,
    size: apiItem.variant.size,
    material: apiItem.variant.material,
    delivery_time_days: apiItem.variant.delivery_time_days,
    assemble_charges: apiItem.variant.assemble_charges,
    sku: apiItem.variant.sku,
  },
});


export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      totalItems: 0,
      totalPrice: 0,
      shippingInfo: {
        method: "free",
        cost: 0,
        label: "Free shipping",
      },
      discount: 0,
      couponCode: "",
      isLoading: false,
      error: null,
      loadingItems: new Set(),
      serverCart: null,
      lastSyncedAt: null,

      // Add item to cart
      addItem: async (item, quantity = 1) => {
        const { setLoading, setError, syncWithServer, addItemLocally } = get();

        setLoading(true);
        setError(null);

        // Create optimistic item for immediate UI feedback
        const optimisticItem: LocalCartItem = {
          id: item.variant_id,
          variant_id: item.variant_id,
          name: item.name,
          price: item.price,
          quantity: quantity,
          image: item.image,
          size: item.size,
          color: item.color,
          stock: item.stock,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Add optimistically for immediate UI feedback
        addItemLocally(optimisticItem);
        get().calculateTotals();

        try {
          const currentAuthStatus = get().checkAuthStatus();

          if (currentAuthStatus) {
            // Add to server for authenticated users
            await CartApiService.addToCart({
              variant_id: item.variant_id,
              quantity,
            });
            // Sync with server to get the actual server state
            await syncWithServer();
          }
        } catch (error) {
          // Revert optimistic update on error
          const { removeItemLocally } = get();
          removeItemLocally(item.variant_id);
          get().calculateTotals();

          setError(
            error instanceof Error
              ? error.message
              : "Failed to add item to cart"
          );
          throw error;
        } finally {
          setLoading(false);
        }
      },

      // Remove item from cart
      removeItem: async (id) => {
        const {
          setError,
          removeItemLocally,
          syncWithServer,
          setItemLoading,
          items,
        } = get();

        // Check if item exists
        const itemToRemove = items.find((item) => item.id === id);
        if (!itemToRemove) {
          console.warn(`Item with id ${id} not found in cart`);
          return;
        }

        setItemLoading(id, true);
        setError(null);

        try {
          const currentAuthStatus = get().checkAuthStatus();
          if (currentAuthStatus) {
            // Remove from server for authenticated users
            await CartApiService.removeFromCart(id);
            // Sync with server to get the actual server state
            await syncWithServer();
          } else {
            // Remove locally for guest users
            removeItemLocally(id);
            get().calculateTotals();
          }
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to remove item from cart"
          );
          throw error;
        } finally {
          setItemLoading(id, false);
        }
      },

      // Update item quantity
      updateQuantity: async (id, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(id);
          return;
        }

        const { setLoading, setError, updateQuantityLocally, syncWithServer } =
          get();

        setLoading(true);
        setError(null);

        try {
          const currentAuthStatus = get().checkAuthStatus();

          if (currentAuthStatus) {
            // Update on server for authenticated users
            try {
              await CartApiService.updateCartItem(id, { quantity });
              await syncWithServer();
            } catch (apiError) {
              console.warn(
                "Failed to update on server, trying local update:",
                apiError
              );
              // If server update fails, fall back to local update
              updateQuantityLocally(id, quantity);
              console.log("Updated item locally as fallback");
            }
          }
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to update cart item"
          );
          throw error;
        } finally {
          setLoading(false);
        }
      },

      // Update item color (with variant support)
      updateItemColor: (id, color) => {
        set((state) => {
          const updatedItems = state.items.map((item) => {
            if (item.id === id) {
              // Check if the color is available for this item
              const availableColors = item.variant?.availableColors ||
                item.availableColors || [
                  item.variant?.color || item.color || "Black",
                ];

              // Only update if the color is available
              if (availableColors.includes(color)) {
                return {
                  ...item,
                  color,
                  variant: item.variant
                    ? {
                        ...item.variant,
                        color,
                      }
                    : {
                        color,
                        availableColors,
                      },
                };
              }
            }
            return item;
          });

          return {
            items: updatedItems,
          };
        });
      },

      // Set shipping information
      setShippingInfo: (shipping) => {
        set({
          shippingInfo: shipping,
        });
      },

      // Set coupon code
      setCouponCode: (code) => {
        set({ couponCode: code });
      },

      // Set discount
      setDiscount: (discount) => {
        set({ discount });
      },

      // Clear entire cart
      clearCart: async () => {
        const { setLoading, setError, clearCartLocally, syncWithServer } =
          get();

        setLoading(true);
        setError(null);

        try {
          const currentAuthStatus = get().checkAuthStatus();
          if (currentAuthStatus) {
            // Clear server cart for authenticated users
            await CartApiService.clearCart();
            await syncWithServer();
          } else {
            // Clear localStorage for guest users
            clearCartLocally();
          }
        } catch (error) {
          setError(
            error instanceof Error ? error.message : "Failed to clear cart"
          );
          throw error;
        } finally {
          setLoading(false);
        }
      },

      // Calculate totals
      calculateTotals: () => {
        set((state) => {
          const totalItems = state.items.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          const totalPrice = state.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          return { totalItems, totalPrice };
        });
      },

      // Get cart total with shipping and discount
      getCartTotal: () => {
        const state = get();
        return state.totalPrice + state.shippingInfo.cost - state.discount;
      },

      // Check authentication status
      checkAuthStatus: () => {
        const user = SessionManager.getUser();
        const isAuthenticated = SessionManager.isAuthenticated();
        const authStatus = !!(user && isAuthenticated);

        return authStatus;
      },

      // Sync with server
      syncWithServer: async () => {
        const { setError } = get();

        try {
          const serverCart = await CartApiService.getCartItems();
          console.log("Fetched server cart:", serverCart);
          const items = serverCart.items.map(convertApiItemToLocal);
          const totalItems = items.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          const totalPrice = items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          set({
            serverCart,
            items,
            totalItems,
            totalPrice,
            lastSyncedAt: Date.now(),
          });
        } catch (error) {
          console.error("Failed to sync cart with server:", error);
          setError(
            error instanceof Error
              ? error.message
              : "Failed to sync with server"
          );
        }
      },

      syncCartWithServerAfterLogin: async () => {
        console.log("Syncing guest cart with server after login...");
        const { items, clearCartLocally, syncWithServer, setLoading } = get();

        try {
          setLoading(true);
          const currentAuthStatus = await get().checkAuthStatus();
          if (currentAuthStatus) {
            // Add to server for authenticated users
            await CartApiService.syncCartAfterLogin({
              data: items.map((i) => ({
                variant_id: i.variant_id,
                quantity: i.quantity,
              })),
            });

            // Clear local cart after syncing
            clearCartLocally();

            // Finally, sync local state with server
            await syncWithServer();
          }
        } catch (error) {
          console.error("Failed to sync guest cart after login:", error);
        } finally {
          setLoading(false);
        }
      },

      // Local state management (for instant feedback)
      addItemLocally: (item) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (i) => i.variant_id === item.variant_id && i.color === item.color
          );

          let newItems;
          if (existingItemIndex >= 0) {
            // Update quantity if item already exists
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity:
                updatedItems[existingItemIndex].quantity + item.quantity,
              updated_at: new Date().toISOString(),
            };
            newItems = updatedItems;
          } else {
            // Add new item
            newItems = [...state.items, item];
          }

          // Calculate totals
          const totalItems = newItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          const totalPrice = newItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          return { items: newItems, totalItems, totalPrice };
        });
      },

      removeItemLocally: (id) => {
        set((state) => {
          const newItems = state.items.filter((i) => i.id !== id);
          const totalItems = newItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          const totalPrice = newItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          return { items: newItems, totalItems, totalPrice };
        });
      },

      updateQuantityLocally: (id, quantity) => {
        set((state) => {
          const newItems = state.items.map((i) =>
            i.id === id
              ? { ...i, quantity, updated_at: new Date().toISOString() }
              : i
          );
          const totalItems = newItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          const totalPrice = newItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          return { items: newItems, totalItems, totalPrice };
        });
      },

      clearCartLocally: () => {
        set({
          items: [],
          totalItems: 0,
          totalPrice: 0,
          discount: 0,
          couponCode: "",
        });
      },

      // Utility actions
      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      // Item-specific loading state management
      setItemLoading: (itemId, loading) =>
        set((state) => {
          const newLoadingItems = new Set(state.loadingItems);
          if (loading) {
            newLoadingItems.add(itemId);
          } else {
            newLoadingItems.delete(itemId);
          }
          return { loadingItems: newLoadingItems };
        }),

      isItemLoading: (itemId) => {
        const { loadingItems } = get();
        return loadingItems.has(itemId);
      },
    }),

    {
      name: "cart-storage",
      // Persist essential data, not loading states
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice,
        shippingInfo: state.shippingInfo,
        discount: state.discount,
        couponCode: state.couponCode,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
);

// Hook for cart operations
export const useCart = () => {
  const {
    items,
    totalItems,
    totalPrice,
    shippingInfo,
    discount,
    couponCode,
    isLoading,
    error,
    addItem,
    removeItem,
    updateQuantity,
    updateItemColor,
    clearCart,
    setShippingInfo,
    setCouponCode,
    setDiscount,
    calculateTotals,
    getCartTotal,
    checkAuthStatus,
    isItemLoading,
    syncWithServer,
    syncCartWithServerAfterLogin,
  } = useCartStore();

  // Auto-check authentication status on first use if not already set
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      checkAuthStatus();
    }
  }, [checkAuthStatus]);

  return {
    items,
    totalItems,
    totalPrice,
    shippingInfo,
    discount,
    couponCode,
    isLoading,
    error,
    addItem,
    removeItem,
    updateQuantity,
    updateItemColor,
    clearCart,
    setShippingInfo,
    setCouponCode,
    setDiscount,
    calculateTotals,
    getCartTotal,
    checkAuthStatus,
    isItemLoading,
    syncWithServer,
    syncCartWithServerAfterLogin,
  };
};

interface CartAnimationState {
  isOpen: boolean;
  isSuccessModalOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  openSuccessModal: () => void;
  closeSuccessModal: () => void;
  addToCart: (item: { item: string }) => void;
  toggleCart: () => void;
}

export const useCartAnimationStore = create<CartAnimationState>((set) => ({
  isOpen: false,
  isSuccessModalOpen: false,
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  openSuccessModal: () => set({ isSuccessModalOpen: true }),
  closeSuccessModal: () => set({ isSuccessModalOpen: false }),
  addToCart: (item) => {
    console.log(item);
    set({ isSuccessModalOpen: true });

    setTimeout(() => {
      set({ isSuccessModalOpen: false, isOpen: true });
    }, 3000);
  },
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
}));
