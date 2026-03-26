"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CartApiService,
  type Cart as ApiCart,
  type CartItem as ApiCartItem,
} from "../api/cart";

import { SessionManager } from "../services/session-manager";

export interface LocalCartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  assembly_required: boolean;
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
  bundleVariants?: string[];
  variant?: {
    color?: string;
    size?: string;
    material?: string;
    delivery_time_days?: string;
    assemble_charges?: number;
    sku?: string;
    availableColors?: string[];
    compare_price?: number;
    discount_percentage?: number;
  };
}

interface ShippingInfo {
  method: "free" | "express" | "pickup";
  cost: number;
  label: string;
}

interface CartState {
  items: LocalCartItem[];
  totalItems: number;
  subtotal: number;
  assemblyTotal: number;
  shippingInfo: ShippingInfo;
  discount: number;
  couponCode: string;
  isLoading: boolean;
  error: string | null;
  loadingItems: Set<string>;
  serverCart: ApiCart | null;
  lastSyncedAt: number | null;

  addItem: (
    item: Omit<LocalCartItem, "quantity" | "created_at" | "updated_at">,
    quantity?: number
  ) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  updateAssemblyRequired: (id: string, required: boolean) => Promise<void>;
  updateItemColor: (id: string, color: string) => void;
  clearCart: () => Promise<void>;
  setItemLoading: (itemId: string, loading: boolean) => void;
  isItemLoading: (itemId: string) => boolean;

  checkAuthStatus: () => boolean;
  syncWithServer: () => Promise<void>;
  syncCartWithServerAfterLogin: () => Promise<void>;

  addItemLocally: (item: LocalCartItem) => void;
  removeItemLocally: (id: string) => void;
  updateQuantityLocally: (id: string, quantity: number) => void;
  updateAssemblyRequiredLocally: (id: string, required: boolean) => void;
  clearCartLocally: () => void;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setShippingInfo: (shipping: ShippingInfo) => void;
  setCouponCode: (code: string) => void;
  setDiscount: (discount: number) => void;
  calculateTotals: () => void;
  getCartTotal: () => number;

  performActionForAuthUser: ({
    action,
    revertAction,
    extraParams,
  }: {
    action: () => Promise<void>;
    revertAction: () => void;
    extraParams?: { id: string };
  }) => Promise<void>;
}


const resolveDisplayPrice = (variant: ApiCartItem["variant"]): number => {
  const basePrice = variant.price;

  // Priority 1: explicit discount_percentage on variant
  if (variant.discount_percentage && Number(variant.discount_percentage) > 0) {
    const pct = Number(variant.discount_percentage);
    const salePrice = basePrice - (basePrice * pct) / 100;
    return Math.round(salePrice * 100) / 100;
  }

  // Priority 2: product-level discount_offer
  const productDiscountOffer = (variant as any).product?.discount_offer;
  if (productDiscountOffer && Number(productDiscountOffer) > 0) {
    const salePrice = basePrice - (basePrice * Number(productDiscountOffer)) / 100;
    return Math.round(salePrice * 100) / 100;
  }

  // Priority 3: compare_price only (no explicit % set)
  if (variant.compare_price && variant.compare_price > basePrice) {
    return basePrice;
  }

  return basePrice;
};


const convertApiItemToLocal = (apiItem: ApiCartItem): LocalCartItem => {
  const variant = apiItem.variant;
  const finalPrice = resolveDisplayPrice(variant);

  return {
    id: apiItem.id,
    variant_id: variant.id,
    name: variant.product.name,
    price: finalPrice,
    quantity: apiItem.quantity,
    assembly_required: apiItem.assembly_required,
    assemble_charges: variant.assemble_charges,
    size: variant.size,
    color: variant.color,
    stock: variant.stock,
    created_at: apiItem.created_at,
    updated_at: apiItem.updated_at,
    delivery_time_days: variant.delivery_time_days ?? "N/A",
    image:
      variant.variant_images?.[0]?.url ||
      variant.product.images?.[0]?.url,
    variant: {
      color: variant.color,
      size: variant.size,
      material: variant.material,
      delivery_time_days: variant.delivery_time_days,
      assemble_charges: variant.assemble_charges,
      sku: variant.sku,
      compare_price: variant.compare_price,
      discount_percentage: variant.discount_percentage,
    },
  };
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      subtotal: 0,
      assemblyTotal: 0,
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

      addItem: async (item, quantity = 1) => {
        const { addItemLocally, performActionForAuthUser } = get();

        const optimisticItem: LocalCartItem = {
          id: item.variant_id,
          variant_id: item.variant_id,
          name: item.name,
          // Price passed from UI is already correctly discounted —
          // trust it for the optimistic update before sync.
          price: item.price,
          quantity: quantity,
          assembly_required: false,
          image: item.image,
          size: item.size,
          color: item.color,
          stock: item.stock,
          assemble_charges: item.assemble_charges,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        addItemLocally(optimisticItem);
        get().calculateTotals();

        await performActionForAuthUser({
          action: async () => {
            await CartApiService.addToCart({
              variant_id: item.variant_id,
              quantity,
            });
          },
          revertAction: () => {
            const { removeItemLocally } = get();
            removeItemLocally(item.variant_id);
            get().calculateTotals();
          },
        });
      },

      removeItem: async (id) => {
        const { items, removeItemLocally, performActionForAuthUser } = get();

        const itemToRemove = items.find((item) => item.id === id);
        if (!itemToRemove) {
          console.warn(`Item with id ${id} not found in cart`);
          return;
        }

        if (itemToRemove.delivery_time_days === "Bundle") {
          removeItemLocally(id);
          return;
        }

        if (!get().checkAuthStatus()) {
          removeItemLocally(id);
          return;
        }

        await performActionForAuthUser({
          action: async () => {
            await CartApiService.removeFromCart(id);
          },
          revertAction: () => {},
          extraParams: { id },
        });
      },

      updateQuantity: async (id, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(id);
          return;
        }

        const { updateQuantityLocally, performActionForAuthUser } = get();
        const currentItem = get().items.find((item) => item.id === id);
        updateQuantityLocally(id, quantity);

        await performActionForAuthUser({
          action: async () => {
            await CartApiService.updateCartItem(id, { quantity });
          },
          revertAction: () => {
            if (currentItem) {
              updateQuantityLocally(id, currentItem.quantity);
            }
          },
          extraParams: { id },
        });
      },

      updateAssemblyRequired: async (id, required) => {
        const { updateAssemblyRequiredLocally, performActionForAuthUser } =
          get();

        updateAssemblyRequiredLocally(id, required);

        await performActionForAuthUser({
          action: async () => {
            await CartApiService.updateCartItem(id, {
              assembly_required: required,
            });
          },
          revertAction: () => {
            updateAssemblyRequiredLocally(id, !required);
          },
          extraParams: { id },
        });
      },

      performActionForAuthUser: async ({
        action,
        revertAction,
        extraParams,
      }) => {
        if (!get().checkAuthStatus()) {
          console.warn("User not authenticated, action aborted.");
          return;
        }

        if (extraParams && extraParams.id) {
          get().setItemLoading(extraParams.id, true);
        } else {
          get().setLoading(true);
        }

        get().setError(null);

        try {
          await action();
          await get().syncWithServer();
        } catch (error) {
          console.error("Action failed, reverting changes:", error);
          revertAction();
          get().setError(
            error instanceof Error ? error.message : "Action failed"
          );
          throw error;
        } finally {
          if (extraParams && extraParams.id) {
            get().setItemLoading(extraParams.id, false);
          } else {
            get().setLoading(false);
          }
        }
      },

      updateItemColor: (id, color) => {
        set((state) => {
          const updatedItems = state.items.map((item) => {
            if (item.id === id) {
              const availableColors =
                item.variant?.availableColors ||
                item.availableColors || [
                  item.variant?.color || item.color || "Black",
                ];

              if (availableColors.includes(color)) {
                return {
                  ...item,
                  color,
                  variant: item.variant
                    ? { ...item.variant, color }
                    : { color, availableColors },
                };
              }
            }
            return item;
          });

          return { items: updatedItems };
        });
      },

      setShippingInfo: (shipping) => set({ shippingInfo: shipping }),
      setCouponCode: (code) => set({ couponCode: code }),
      setDiscount: (discount) => set({ discount }),

      clearCart: async () => {
        const { setLoading, setError, clearCartLocally, syncWithServer } =
          get();

        setLoading(true);
        setError(null);

        try {
          const currentAuthStatus = get().checkAuthStatus();
          if (currentAuthStatus) {
            await CartApiService.clearCart();
            await syncWithServer();
          } else {
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

      calculateTotals: () => {
        set((state) => {
          const totalItems = state.items.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          const subtotal = state.items.reduce((sum, item) => {
            return sum + item.price * item.quantity;
          }, 0);
          const assemblyTotal = state.items.reduce((sum, item) => {
            const variantAssemblyCharge =
              item.variant?.assemble_charges || item.assemble_charges || 0;
            const assemblyCharges = item.assembly_required
              ? variantAssemblyCharge * item.quantity
              : 0;
            return sum + assemblyCharges;
          }, 0);

          return { totalItems, subtotal, assemblyTotal };
        });
      },

      getCartTotal: () => {
        const state = get();
        return state.subtotal + state.assemblyTotal;
      },

      checkAuthStatus: () => {
        const user = SessionManager.getUser();
        const isAuthenticated = SessionManager.isAuthenticated();
        return !!(user && isAuthenticated);
      },

      syncWithServer: async () => {
        const { setError, calculateTotals } = get();

        try {
          const serverCart = await CartApiService.getCartItems();

          // Preserve bundle items (local-only, not on server)
          const bundleItems = get().items.filter(
            (i) => i.delivery_time_days === "Bundle"
          );

          // Convert server items — resolveDisplayPrice handles
          // compare_price and discount_percentage correctly
          const serverItems = serverCart.items.map(convertApiItemToLocal);

          set({
            serverCart,
            items: [...serverItems, ...bundleItems],
            lastSyncedAt: Date.now(),
          });
          calculateTotals();
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
            const syncableItems = items.filter(
              (i) => i.delivery_time_days !== "Bundle"
            );

            await CartApiService.syncCartAfterLogin({
              data: syncableItems.map((i) => ({
                variant_id: i.variant_id,
                quantity: i.quantity,
                assembly_required: i.assembly_required,
              })),
            });

            clearCartLocally();
            await syncWithServer();

            const bundleItems = items.filter(
              (i) => i.delivery_time_days === "Bundle"
            );
            bundleItems.forEach((bundle) => {
              get().addItemLocally(bundle);
            });
          }
        } catch (error) {
          console.error("Failed to sync guest cart after login:", error);
        } finally {
          setLoading(false);
        }
      },

      addItemLocally: (item) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (i) =>
              i.variant_id === item.variant_id && i.color === item.color
          );

          let newItems;
          if (existingItemIndex >= 0) {
            const updatedItems = [...state.items];
            // updatedItems[existingItemIndex] = {
            //   ...updatedItems[existingItemIndex],
            //   quantity:
            //     updatedItems[existingItemIndex].quantity + item.quantity,
            //   updated_at: new Date().toISOString(),
            // };
            // AFTER
updatedItems[existingItemIndex] = {
  ...updatedItems[existingItemIndex],
  quantity: updatedItems[existingItemIndex].quantity + item.quantity,
  price: item.price, // ← always use the latest price (may now be discounted)
  updated_at: new Date().toISOString(),
};
            newItems = updatedItems;
          } else {
            newItems = [...state.items, item];
          }

          return { items: newItems };
        });

        get().calculateTotals();
      },

      removeItemLocally: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
        get().calculateTotals();
      },

      updateQuantityLocally: (id, quantity) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id
              ? { ...i, quantity, updated_at: new Date().toISOString() }
              : i
          ),
        }));
        get().calculateTotals();
      },

      updateAssemblyRequiredLocally: (id, required) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id
              ? {
                  ...i,
                  assembly_required: required,
                  updated_at: new Date().toISOString(),
                }
              : i
          ),
        }));
        get().calculateTotals();
      },

      clearCartLocally: () => {
        set({
          items: [],
          totalItems: 0,
          subtotal: 0,
          assemblyTotal: 0,
          discount: 0,
          couponCode: "",
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

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
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        subtotal: state.subtotal,
        assemblyTotal: state.assemblyTotal,
        shippingInfo: state.shippingInfo,
        discount: state.discount,
        couponCode: state.couponCode,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
);

export const useCart = () => {
  const {
    items,
    totalItems,
    subtotal,
    assemblyTotal,
    shippingInfo,
    discount,
    couponCode,
    isLoading,
    error,
    addItem,
    removeItem,
    updateQuantity,
    updateAssemblyRequired,
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

  return {
    items,
    totalItems,
    subtotal,
    assemblyTotal,
    shippingInfo,
    discount,
    couponCode,
    isLoading,
    error,
    addItem,
    removeItem,
    updateQuantity,
    updateAssemblyRequired,
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
  addedItemType: "product" | "bundle";
  openCart: () => void;
  closeCart: () => void;
  openSuccessModal: () => void;
  closeSuccessModal: () => void;
  addToCart: (item: { item: string; type?: "product" | "bundle" }) => void;
  toggleCart: () => void;
}

export const useCartAnimationStore = create<CartAnimationState>((set) => ({
  isOpen: false,
  isSuccessModalOpen: false,
  addedItemType: "product",
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  openSuccessModal: () => set({ isSuccessModalOpen: true }),
  closeSuccessModal: () => set({ isSuccessModalOpen: false }),
  addToCart: (item) => {
    console.log(item);
    set({ isSuccessModalOpen: true, addedItemType: item.type || "product" });
    setTimeout(() => {
      set({ isSuccessModalOpen: false, isOpen: true });
    }, 3000);
  },
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
}));