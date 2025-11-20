/**
 * Utility functions for managing localStorage data for guest users
 * Handles wishlist and cart data with expiration and migration capabilities
 */

// Storage keys
export const STORAGE_KEYS = {
  GUEST_WISHLIST: "guest-wishlist",
  GUEST_CART: "guest-cart",
  GUEST_SESSION_ID: "guest-session-id",
} as const;

// Expiration time (30 days in milliseconds)
const EXPIRATION_TIME = 30 * 24 * 60 * 60 * 1000;

// Base interface for stored data with expiration
interface StoredData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// Guest wishlist item structure (simplified for localStorage)
export interface GuestWishlistItem {
  id: string; // Generated UUID for guest items
  variant_id: string;
  name: string;
  price: number;
  image?: string;
  size?: string;
  color?: string;
  stock?: number;
  created_at: string;
}

// Guest cart item structure (simplified for localStorage)
export interface GuestCartItem {
  id: string; // Generated UUID for guest items
  variant_id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
  color?: string;
  stock?: number;
  created_at: string;
  updated_at: string;
}

// Guest cart structure
export interface GuestCart {
  id: string; // Generated UUID for guest cart
  items: GuestCartItem[];
  created_at: string;
  updated_at: string;
}

/**
 * Generate a simple UUID for guest items
 */
export function generateGuestId(): string {
  return (
    "guest-" +
    Math.random().toString(36).substr(2, 9) +
    "-" +
    Date.now().toString(36)
  );
}

/**
 * Generate a guest session ID
 */
export function generateGuestSessionId(): string {
  return (
    "session-" +
    Math.random().toString(36).substr(2, 9) +
    "-" +
    Date.now().toString(36)
  );
}

/**
 * Get guest session ID from localStorage or create a new one
 */
export function getGuestSessionId(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.GUEST_SESSION_ID);
    if (stored) {
      const data: StoredData<string> = JSON.parse(stored);
      if (data.expiresAt > Date.now()) {
        return data.data;
      }
    }
  } catch (error) {
    console.error("Failed to get guest session ID:", error);
  }

  // Create new session ID
  const sessionId = generateGuestSessionId();
  setGuestSessionId(sessionId);
  return sessionId;
}

/**
 * Set guest session ID in localStorage
 */
export function setGuestSessionId(sessionId: string): void {
  try {
    const data: StoredData<string> = {
      data: sessionId,
      timestamp: Date.now(),
      expiresAt: Date.now() + EXPIRATION_TIME,
    };
    localStorage.setItem(STORAGE_KEYS.GUEST_SESSION_ID, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to set guest session ID:", error);
  }
}

/**
 * Generic function to get data from localStorage with expiration check
 */
function getStoredData<T>(key: string): T | null {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const data: StoredData<T> = JSON.parse(stored);

    // Check if data has expired
    if (data.expiresAt < Date.now()) {
      localStorage.removeItem(key);
      return null;
    }

    return data.data;
  } catch (error) {
    console.error(`Failed to get stored data for key ${key}:`, error);
    localStorage.removeItem(key);
    return null;
  }
}

/**
 * Generic function to set data in localStorage with expiration
 */
function setStoredData<T>(key: string, data: T): void {
  try {
    const storedData: StoredData<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + EXPIRATION_TIME,
    };
    localStorage.setItem(key, JSON.stringify(storedData));
  } catch (error) {
    console.error(`Failed to set stored data for key ${key}:`, error);
  }
}

/**
 * Get guest wishlist from localStorage
 */
export function getGuestWishlist(): GuestWishlistItem[] {
  return getStoredData<GuestWishlistItem[]>(STORAGE_KEYS.GUEST_WISHLIST) || [];
}

/**
 * Set guest wishlist in localStorage
 */
export function setGuestWishlist(items: GuestWishlistItem[]): void {
  setStoredData(STORAGE_KEYS.GUEST_WISHLIST, items);
}

/**
 * Add item to guest wishlist
 */
export function addToGuestWishlist(
  item: Omit<GuestWishlistItem, "id" | "created_at">
): GuestWishlistItem {
  const items = getGuestWishlist();

  // Check if item already exists
  const existingItem = items.find((i) => i.variant_id === item.variant_id);
  if (existingItem) {
    return existingItem;
  }

  const newItem: GuestWishlistItem = {
    ...item,
    id: generateGuestId(),
    created_at: new Date().toISOString(),
  };

  items.push(newItem);
  setGuestWishlist(items);
  return newItem;
}

/**
 * Remove item from guest wishlist
 */
export function removeFromGuestWishlist(itemId: string): boolean {
  const items = getGuestWishlist();
  const filteredItems = items.filter((item) => item.id !== itemId);

  if (filteredItems.length !== items.length) {
    setGuestWishlist(filteredItems);
    return true;
  }
  return false;
}

/**
 * Clear guest wishlist
 */
export function clearGuestWishlist(): void {
  localStorage.removeItem(STORAGE_KEYS.GUEST_WISHLIST);
}

/**
 * Check if variant is in guest wishlist
 */
export function isInGuestWishlist(variantId: string): boolean {
  const items = getGuestWishlist();
  return items.some((item) => item.variant_id === variantId);
}

/**
 * Get guest cart from localStorage
 */
export function getGuestCart(): GuestCart {
  const stored = getStoredData<GuestCart>(STORAGE_KEYS.GUEST_CART);
  if (stored) {
    return stored;
  }

  // Create empty cart
  const emptyCart: GuestCart = {
    id: generateGuestId(),
    items: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  setGuestCart(emptyCart);
  return emptyCart;
}

/**
 * Set guest cart in localStorage
 */
export function setGuestCart(cart: GuestCart): void {
  const updatedCart = {
    ...cart,
    updated_at: new Date().toISOString(),
  };
  setStoredData(STORAGE_KEYS.GUEST_CART, updatedCart);
}

/**
 * Add item to guest cart
 */
export function addToGuestCart(
  item: Omit<GuestCartItem, "id" | "created_at" | "updated_at">
): GuestCartItem {
  const cart = getGuestCart();

  // Check if item already exists
  const existingItemIndex = cart.items.findIndex(
    (i) =>
      i.variant_id === item.variant_id &&
      i.size === item.size &&
      i.color === item.color
  );

  if (existingItemIndex >= 0) {
    // Update quantity
    cart.items[existingItemIndex].quantity += item.quantity;
    cart.items[existingItemIndex].updated_at = new Date().toISOString();
    setGuestCart(cart);
    return cart.items[existingItemIndex];
  }

  // Add new item
  const newItem: GuestCartItem = {
    ...item,
    id: generateGuestId(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  cart.items.push(newItem);
  setGuestCart(cart);
  return newItem;
}

/**
 * Update guest cart item quantity
 */
export function updateGuestCartItem(itemId: string, quantity: number): boolean {
  const cart = getGuestCart();
  const itemIndex = cart.items.findIndex((item) => item.id === itemId);

  if (itemIndex >= 0) {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].updated_at = new Date().toISOString();
    }
    setGuestCart(cart);
    return true;
  }
  return false;
}

/**
 * Remove item from guest cart
 */
export function removeFromGuestCart(itemId: string): boolean {
  const cart = getGuestCart();
  const filteredItems = cart.items.filter((item) => item.id !== itemId);

  if (filteredItems.length !== cart.items.length) {
    cart.items = filteredItems;
    setGuestCart(cart);
    return true;
  }
  return false;
}

/**
 * Clear guest cart
 */
export function clearGuestCart(): void {
  localStorage.removeItem(STORAGE_KEYS.GUEST_CART);
}

/**
 * Clear all guest data
 */
export function clearAllGuestData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}
