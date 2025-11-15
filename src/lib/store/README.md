# Store Documentation

## Overview

This directory contains the Zustand stores for state management in the application. The stores provide both local state management for instant UI feedback and server synchronization for persistence across devices and sessions.

## Stores Overview

### 1. Cart Store (`cart-store.ts`)

### 2. Wishlist Store (`wishlist-store.ts`)

### 3. Search Store (`search-store.ts`)

---

## Cart Store

Manages shopping cart state with server synchronization for both authenticated and guest users.

### Features

- **Dual Mode**: Works for both authenticated and guest users
- **Optimistic Updates**: Instant UI feedback with server sync
- **Auto-sync**: Automatically syncs with server every 5 minutes
- **Error Handling**: Graceful error handling with user feedback
- **Persistence**: Local storage persistence for offline usage
- **Migration**: Seamless guest-to-user cart migration

### Usage

```typescript
import { useCartStore, useCartSync } from "@/lib/store/cart-store";

function CartComponent() {
  const {
    items,
    totalItems,
    totalPrice,
    isLoading,
    error,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    addToServerCart,
  } = useCartStore();

  // Auto-sync with server
  useCartSync();

  const handleAddToCart = async () => {
    try {
      await addToServerCart({
        variant_id: "variant-uuid",
        quantity: 1,
      });
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  return (
    <div>
      {items.map((item) => (
        <div key={item.id}>
          {item.name} - £{item.price} x {item.quantity}
          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
            +
          </button>
          <button onClick={() => removeItem(item.id)}>Remove</button>
        </div>
      ))}
      <p>Total: £{totalPrice}</p>
    </div>
  );
}
```

### Cart API Integration

The cart store integrates with these API endpoints:

- `GET /cart` - Get cart items
- `POST /cart` - Add to cart (authenticated)
- `PUT /cart/{id}` - Update cart item (authenticated)
- `DELETE /cart/{id}` - Remove from cart (authenticated)
- `DELETE /cart` - Clear cart (authenticated)
- `POST /cart/guest` - Add to guest cart
- `PUT /cart/guest/{id}` - Update guest cart item
- `DELETE /cart/guest/{id}` - Remove from guest cart
- `POST /cart/migrate` - Migrate guest cart

---

## Wishlist Store

Manages wishlist state with server synchronization for both authenticated and guest users.

### Features

- **Dual Mode**: Works for both authenticated and guest users
- **Toggle Functionality**: Easy add/remove with single method
- **Auto-sync**: Automatically syncs with server
- **Error Handling**: Graceful error handling
- **Persistence**: Local storage persistence
- **Migration**: Seamless guest-to-user wishlist migration

### Usage

```typescript
import { useWishlist, useWishlistSync } from "@/lib/store/wishlist-store";

function WishlistComponent() {
  const {
    items,
    totalItems,
    isLoading,
    error,
    addItem,
    removeItem,
    toggleItem,
    isInWishlist,
    clearWishlist,
  } = useWishlist();

  // Auto-sync with server
  useWishlistSync();

  const handleToggleWishlist = async (variantId: string) => {
    try {
      const added = await toggleItem(variantId);
      console.log(added ? "Added to wishlist" : "Removed from wishlist");
    } catch (error) {
      console.error("Failed to toggle wishlist:", error);
    }
  };

  return (
    <div>
      {items.map((item) => (
        <div key={item.id}>
          {item.name} - £{item.price}
          <button onClick={() => removeItem(item.id)}>Remove</button>
        </div>
      ))}
      <p>Total items: {totalItems}</p>
    </div>
  );
}
```

### Wishlist API Integration

The wishlist store integrates with these API endpoints:

- `GET /wishlist` - Get wishlist items
- `POST /wishlist` - Add to wishlist (authenticated)
- `DELETE /wishlist/{id}` - Remove from wishlist (authenticated)
- `DELETE /wishlist` - Clear wishlist (authenticated)
- `POST /wishlist/guest` - Add to guest wishlist
- `DELETE /wishlist/guest/{id}` - Remove from guest wishlist
- `POST /wishlist/migrate` - Migrate guest wishlist

---

## Reusable Components

### AddToCartButton

Reusable component for adding items to cart with quantity controls and loading states.

```typescript
import { AddToCartButton } from "@/components/cart/add-to-cart-button";

<AddToCartButton
  variant_id="variant-uuid"
  product={{
    id: "product-id",
    name: "Product Name",
    price: 99.99,
    stock: 10,
    size: "Large",
    color: "Blue",
  }}
  showQuantityControls={true}
  quantity={1}
  size="default"
  variant="default"
/>;
```

### WishlistButton

Reusable component for wishlist toggle functionality.

```typescript
import { WishlistButton } from "@/components/wishlist/wishlist-button";

<WishlistButton
  variant_id="variant-uuid"
  product={{ name: "Product Name" }}
  showText={true}
  size="default"
  variant="outline"
/>;
```

---

## App Initialization & Migration

### useAppInit Hook

Handles app initialization and user authentication state changes, including cart and wishlist migration.

```typescript
import { useAppInit } from "@/lib/hooks/use-app-init";

function App() {
  useAppInit(); // Call this in your root component

  return <div>Your app content</div>;
}
```

### useGuestSession Hook

Manages guest session ID for anonymous users.

```typescript
import { useGuestSession } from "@/lib/hooks/use-app-init";

function Component() {
  const { getGuestSessionId } = useGuestSession();

  // Use guest session ID for API calls when not authenticated
}
```

### Migration Process

When a user logs in, the app automatically:

1. Retrieves the guest session ID from localStorage
2. Migrates guest cart items to the authenticated user's cart
3. Migrates guest wishlist items to the authenticated user's wishlist
4. Cleans up the guest session
5. Syncs with the server

This ensures a seamless experience where users don't lose their cart/wishlist items when they authenticate.

---

## Error Handling & Performance

### Error Handling Strategy

All stores include comprehensive error handling:

- Network errors are caught and displayed to users
- Loading states are managed for better UX
- Optimistic updates with rollback on failure
- Toast notifications for user feedback
- Graceful degradation when API calls fail

### Performance Optimizations

- **Optimistic Updates**: Instant UI feedback while syncing with server
- **Auto-sync Throttling**: Prevents excessive API calls (5-minute intervals)
- **Local Storage**: Efficient persistence with selective data storage
- **Smart API Methods**: Automatically choose between authenticated/guest endpoints
- **Loading States**: Prevent duplicate API calls during operations

---

# Search Store Documentation

## Overview

The search store provides client-side search functionality for the Sofa Deal e-commerce application. It fetches product and category data from the backend API and stores it locally for fast search operations.

## Features

- **Local Search**: Fast client-side searching through cached product data
- **Automatic Initialization**: Search data is loaded when the app loads
- **Caching**: Data is cached for 1 hour to reduce API calls
- **Comprehensive Search**: Searches across product names, descriptions, categories, materials, brands, and variants
- **Real-time Results**: Instant search results as you type

## Architecture

### Search Store (`search-store.ts`)

The search store uses Zustand with persistence middleware to manage search state:

```typescript
interface SearchState {
  // Search data
  products: ProductSearchData[];
  categories: CategoryWithChildren[];
  isInitialized: boolean;
  lastUpdated: number | null;

  // Search functionality
  searchQuery: string;
  filteredResults: SearchResult[];

  // Actions
  initializeSearchData: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  searchProducts: (query: string) => SearchResult[];
  forceRefresh: () => Promise<void>;
}
```

### Search Components

1. **SearchDropdown** (`search-dropdown.tsx`)
   - Dropdown-style search with real-time results
   - Shows product images, prices, and categories
   - Mobile-friendly design

2. **SearchCommand** (`search-command.tsx`)
   - Command palette style search (⌘K to open)
   - Better for power users
   - Keyboard navigation support

### Search Initialization Hook (`use-search-initialization.ts`)

Automatic search data initialization when the app loads:

```typescript
export function useSearchInitialization() {
  // Automatically initializes search data when app loads
  // Returns functions for manual control
}
```

## API Integration

### Search Initialization Endpoint

The search functionality uses the `/products/search-init-data` endpoint:

```
GET /products/search-init-data
```

**Response:**

```json
{
  "products": [
    {
      "id": "...",
      "name": "...",
      "description": "...",
      "category": { ... },
      "variants": [ ... ],
      "images": [ ... ],
      "tags": "...",
      "material": "...",
      "brand": "...",
      "featured": true
    }
  ],
  "categories": [
    {
      "id": "...",
      "name": "...",
      "children": [ ... ]
    }
  ]
}
```

## Usage

### Basic Usage

The search functionality is automatically available in the navbar:

```tsx
import { SearchCommand } from "@/components/search/search-command";
import { SearchDropdown } from "@/components/search/search-dropdown";

// Command palette style (recommended)
<SearchCommand />

// Dropdown style
<SearchDropdown placeholder="Search products..." />
```

### Manual Search Operations

```tsx
import { useSearchStore } from "@/lib/store/search-store";

function MyComponent() {
  const {
    searchQuery,
    filteredResults,
    setSearchQuery,
    clearSearch,
    initializeSearchData,
  } = useSearchStore();

  // Search for products
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // filteredResults will be automatically updated
  };

  // Clear search
  const handleClear = () => {
    clearSearch();
  };

  // Force refresh data
  const handleRefresh = async () => {
    await initializeSearchData();
  };
}
```

### Search Initialization

The search data is automatically initialized in several places:

1. **App Layout**: When the app loads (no authentication required)
2. **Manual**: Using the `useSearchInitialization` hook

```tsx
// Automatic initialization
import { useSearchInitialization } from "@/hooks/use-search-initialization";

function MyComponent() {
  const { initializeSearchData, forceRefresh, isInitialized } =
    useSearchInitialization();

  // Data is automatically initialized when app loads
  // Manual refresh if needed
  const handleRefresh = () => forceRefresh();
}
```

## Search Algorithm

The search function performs comprehensive matching across:

1. **Product Name**: Primary search field
2. **Description**: Secondary search field
3. **Category Name**: Product category
4. **Tags**: Custom product tags
5. **Material**: Product material
6. **Brand**: Product brand
7. **Variant Properties**: Colors and sizes

### Search Features

- **Case Insensitive**: All searches are case-insensitive
- **Partial Matching**: Matches partial words and phrases
- **Multi-field**: Searches across multiple product fields
- **Results Limit**: Limited to 50 results for performance
- **Minimum Query Length**: Requires at least 2 characters

## Caching Strategy

- **Cache Duration**: 1 hour (3,600,000 milliseconds)
- **Storage**: Browser localStorage via Zustand persist
- **Auto-refresh**: Checks cache validity on each initialization
- **Force Refresh**: Available for manual cache invalidation

## Performance Considerations

1. **Client-side Search**: Fast local searching without API calls
2. **Results Limiting**: Maximum 50 results to prevent UI lag
3. **Debouncing**: Search components should implement debouncing for real-time search
4. **Lazy Loading**: Search data only loads when needed
5. **Memory Efficient**: Uses normalized data structures

## Integration Points

### App Integration

Search data initialization happens automatically when the app loads:

```typescript
// In app layout
import { SearchInitializer } from "@/components/search/search-initializer";

// Component automatically initializes search data
<SearchInitializer />;
```

### Navbar Integration

Both search components are integrated into the main navbar:

- **Desktop**: Command palette style search
- **Mobile**: Dropdown search in mobile menu

### Product Pages Integration

Search results link to individual product pages with proper routing.

## Error Handling

- **API Failures**: Graceful degradation, keeps existing cached data
- **Network Issues**: Retries with exponential backoff
- **Invalid Data**: Validates response structure
- **Search Errors**: Fails silently, returns empty results

## Future Enhancements

1. **Search Analytics**: Track popular search terms
2. **Search Suggestions**: Auto-complete and suggestions
3. **Recent Searches**: Store and display recent search history
4. **Advanced Filters**: Integration with product filtering
5. **Search Highlighting**: Highlight matching terms in results
6. **Voice Search**: Voice input support
7. **Typo Tolerance**: Fuzzy matching for typos
