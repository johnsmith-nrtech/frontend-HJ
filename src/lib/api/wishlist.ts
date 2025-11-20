import { ApiService } from "../api-service";

// Image interface
export interface ProductImage {
  id: string;
  url: string;
  type: "main" | "gallery";
  order: number;
  created_at: string;
  updated_at: string;
}

// Category interface
export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  description: string;
  order: number;
  image_url: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

// Product interface
export interface Product {
  id: string;
  name: string;
  description: string;
  category_id: string;
  base_price: number;
  created_at: string;
  updated_at: string;
  category: Category;
  images: ProductImage[];
  delivery_info?: {
    text?: string;
    max_days?: number;
    min_days?: number;
  };
}

// Variant interface
export interface Variant {
  id: string;
  product_id: string;
  sku: string;
  price: number;
  size: string;
  color: string;
  stock: number;
  tags: string;
  material: string;
  brand: string;
  featured: boolean;
  delivery_time_days?: string;
  assemble_charges?: number;
  created_at: string;
  updated_at: string;
  product: Product;
  variant_images: ProductImage[];
}

// Updated WishlistItem interface based on API documentation
export interface WishlistItem {
  id: string;
  created_at: string;
  variant: Variant;
}

export interface AddToWishlistRequest {
  variant_id: string;
}

export interface AddToWishlistResponse {
  id: string;
  user_id?: string;
  session_id?: string;
  variant_id: string;
  created_at: string;
}

export interface MigrateWishlistRequest {
  session_id: string;
}

export interface WishlistMigrationResponse {
  migrated: number;
  items: Array<{
    id: string;
    user_id: string;
    variant_id: string;
    created_at: string;
  }>;
}

/**
 * Wishlist API service for authenticated users only
 * Guest wishlist functionality is handled by localStorage in the frontend
 */
export class WishlistApiService {
  /**
   * Get wishlist items for authenticated user
   */
  static async getWishlistItems(): Promise<WishlistItem[]> {
    const response = await ApiService.fetchWithAuth("/wishlist");
    return ApiService.handleResponse<WishlistItem[]>(response);
  }

  /**
   * Add item to wishlist (authenticated user)
   */
  static async addToWishlist(
    data: AddToWishlistRequest
  ): Promise<AddToWishlistResponse> {
    const response = await ApiService.fetchWithAuth("/wishlist", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return ApiService.handleResponse<AddToWishlistResponse>(
      response,
      "Failed to add item to wishlist"
    );
  }

  /**
   * Remove item from wishlist (authenticated user)
   */
  static async removeFromWishlist(
    itemId: string
  ): Promise<AddToWishlistResponse> {
    const response = await ApiService.fetchWithAuth(`/wishlist/${itemId}`, {
      method: "DELETE",
    });

    return ApiService.handleResponse<AddToWishlistResponse>(
      response,
      "Failed to remove item from wishlist"
    );
  }

  /**
   * Clear entire wishlist (authenticated user)
   */
  static async clearWishlist(): Promise<AddToWishlistResponse[]> {
    const response = await ApiService.fetchWithAuth("/wishlist", {
      method: "DELETE",
    });

    return ApiService.handleResponse<AddToWishlistResponse[]>(
      response,
      "Failed to clear wishlist"
    );
  }

  /**
   * Check if a variant is in the wishlist
   */
  static async isInWishlist(variantId: string): Promise<boolean> {
    try {
      const items = await this.getWishlistItems();
      return items.some((item) => item.variant.id === variantId);
    } catch (error) {
      console.error("Failed to check wishlist status:", error);
      return false;
    }
  }

  /**
   * Toggle item in wishlist (add if not present, remove if present)
   */
  static async toggleWishlistItem(
    variantId: string
  ): Promise<{ added: boolean; item?: AddToWishlistResponse }> {
    try {
      const items = await this.getWishlistItems();
      const existingItem = items.find((item) => item.variant.id === variantId);

      if (existingItem) {
        // Remove from wishlist
        await this.removeFromWishlist(existingItem.id);
        return { added: false };
      } else {
        // Add to wishlist
        const item = await this.addToWishlist({ variant_id: variantId });
        return { added: true, item };
      }
    } catch (error) {
      console.error("Failed to toggle wishlist item:", error);
      throw error;
    }
  }

  /**
   * Migrate guest wishlist to authenticated user
   */
  static async migrateGuestWishlist(
    data: MigrateWishlistRequest
  ): Promise<WishlistMigrationResponse> {
    const response = await ApiService.fetchWithAuth("/wishlist/migrate", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return ApiService.handleResponse<WishlistMigrationResponse>(
      response,
      "Failed to migrate guest wishlist"
    );
  }
}
