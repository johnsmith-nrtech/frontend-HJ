import { ApiService } from "../api-service";

// Import shared types from wishlist
import type { Variant } from "./wishlist";

// Cart-specific types based on the API documentation
export interface CartItem {
  id: string;
  quantity: number;
  assembly_required: boolean;
  created_at: string;
  updated_at: string;
  variant: Variant;
}

export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
  created_at: string;
  updated_at: string;
}

export interface AddToCartRequest {
  variant_id: string;
  quantity: number;
}

export type UpdateCartItemRequest =
  | { quantity: number }
  | { assembly_required: boolean };

export interface MigrateCartRequest {
  session_id: string;
}

export interface SyncCartWithServerAfterLoginRequest {
  data: Array<{
    variant_id: string;
    quantity: number;
  }>;
}

export interface AddToCartResponse {
  success: boolean;
  message: string;
  item: {
    id: string;
    cart_id: string;
    variant_id: string;
    quantity: number;
    created_at: string;
  };
}

export interface CartMigrationResponse {
  success: boolean;
  message: string;
  migrated: Array<{
    status: "added" | "updated";
    item: {
      id: string;
      cart_id: string;
      variant_id: string;
      quantity: number;
    };
  }>;
}

/**
 * Cart API service for authenticated users only
 * Guest cart functionality is handled by localStorage in the frontend
 */
export class CartApiService {
  /**
   * Get cart items for authenticated user
   */
  static async getCartItems(): Promise<Cart> {
    const response = await ApiService.fetchWithAuth("/cart");
    return ApiService.handleResponse<Cart>(response);
  }

  /**
   * Add item to cart (authenticated user)
   */
  static async addToCart(data: AddToCartRequest): Promise<AddToCartResponse> {
    const response = await ApiService.fetchWithAuth("/cart", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return ApiService.handleResponse<AddToCartResponse>(
      response,
      "Failed to add item to cart"
    );
  }

  /**
   * Update cart item quantity (authenticated user)
   */
  static async updateCartItem(
    itemId: string,
    data: UpdateCartItemRequest
  ): Promise<AddToCartResponse> {
    const response = await ApiService.fetchWithAuth(`/cart/${itemId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });

    return ApiService.handleResponse<AddToCartResponse>(
      response,
      "Failed to update cart item"
    );
  }

  /**
   * Remove item from cart (authenticated user)
   */
  static async removeFromCart(
    itemId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await ApiService.fetchWithAuth(`/cart/${itemId}`, {
      method: "DELETE",
    });

    return ApiService.handleResponse<{ success: boolean; message: string }>(
      response,
      "Failed to remove item from cart"
    );
  }

  /**
   * Clear entire cart (authenticated user)
   */
  static async clearCart(): Promise<{ success: boolean; message: string }> {
    const response = await ApiService.fetchWithAuth("/cart", {
      method: "DELETE",
    });

    return ApiService.handleResponse<{ success: boolean; message: string }>(
      response,
      "Failed to clear cart"
    );
  }

  /**
   * Sync cart with server after user login
   */
  static async syncCartAfterLogin(
    data: SyncCartWithServerAfterLoginRequest
  ): Promise<{ success: boolean; message: string }> {
    const response = await ApiService.fetchWithAuth("/cart/sync", {
      method: "POST",
      body: JSON.stringify(data.data),
    });

    return ApiService.handleResponse<{ success: boolean; message: string }>(
      response,
      "Failed to sync cart after login"
    );
  }
}
