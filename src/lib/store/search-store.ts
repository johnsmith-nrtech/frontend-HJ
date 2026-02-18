import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Product,
  ProductVariant,
  ProductImage,
  Category,
  getProducts,
} from "@/lib/api/products";
import { getCategories } from "@/lib/api/categories";

// ====================== TYPES ==========================
export interface ProductSearchData extends Product {
  category?: Category;
  variants?: ProductVariant[];
  images?: ProductImage[];
  tags?: string;
  material?: string;
  brand?: string;
  featured?: boolean;
}

export interface CategoryWithChildren extends Category {
  children?: Category[];
}

export interface SearchInitData {
  products: ProductSearchData[];
  categories: CategoryWithChildren[];
}

export interface SearchResult {
  id: string;
  name: string;
  description: string;
  base_price: number;
  discount_offer?: number;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  images?: {
    url: string;
    type: string;
  }[];
  variants?: {
    id: string;
    price: number;
    size: string;
    color: string;
    stock: number;
    assemble_charges?: number;
  }[];
  tags?: string;
  material?: string;
  brand?: string;
  featured?: boolean;
}

// ====================== FETCH INITIAL DATA ==========================
export async function getSearchInitData(): Promise<SearchInitData> {
  try {
    console.log("Fetching search initialization data...");

    const [productsResponse, categoriesResponse] = await Promise.all([
      getProducts({
        includeVariants: true,
        includeImages: true,
        includeCategory: true,
        limit: 1000,
      }),
      getCategories(true),
    ]);

    const products: ProductSearchData[] = productsResponse.items.map(
      (product) => ({
        ...product,
        tags: product.variants
          ?.map((v) => v.tags)
          .flat()
          .filter(Boolean)
          .join(", "),
        material: product.variants?.[0]?.material,
        brand: product.variants?.[0]?.brand,
        featured: product.variants?.[0]?.featured,
      })
    );

    const categories: CategoryWithChildren[] = categoriesResponse;

    return {
      products,
      categories,
    };
  } catch (error) {
    console.error("Failed to fetch search initialization data:", error);
    throw new Error(`Failed to fetch search data: ${error}`);
  }
}

// ====================== SEARCH UTILS ==========================
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim();
}

function fuzzyMatch(text: string, query: string): boolean {
  if (!query || !text) return false;
  const normalizedText = text.toLowerCase().trim();
  const normalizedQuery = query.toLowerCase().trim();
  if (normalizedText.includes(normalizedQuery)) return true;
  return false;
}

function calculateRelevanceScore(
  product: ProductSearchData,
  query: string
): number {
  const normalizedQuery = normalizeString(query);
  const queryLower = query.toLowerCase().trim();
  let score = 0;

  const searchableFields = [
    { field: product.name, weight: 10 },
    { field: product.description, weight: 3 },
    { field: product.category?.name, weight: 5 },
    { field: product.tags, weight: 9 },
    { field: product.material, weight: 2 },
    { field: product.brand, weight: 6 },
  ];

  if (product.variants && Array.isArray(product.variants)) {
    product.variants.forEach((variant) => {
      if (variant.color)
        searchableFields.push({ field: variant.color, weight: 3 });
      if (variant.size)
        searchableFields.push({ field: variant.size, weight: 2 });
    });
  }

  for (const { field, weight } of searchableFields) {
    if (!field) continue;
    const fieldLower = field.toLowerCase().trim();
    const normalizedField = normalizeString(field);

    if (fieldLower === queryLower) {
      score += weight * 100;
      continue;
    }
    if (fieldLower.startsWith(queryLower)) {
      score += weight * 50;
      continue;
    }
    if (fieldLower.includes(queryLower)) {
      score += weight * 25;
      continue;
    }
    if (normalizedField.includes(normalizedQuery)) {
      score += weight * 15;
      continue;
    }
    if (fuzzyMatch(field, query)) {
      score += weight * 5;
    }
  }

  return score;
}

function convertToSearchResult(product: ProductSearchData): SearchResult {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    base_price: product.base_price,
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
        }
      : undefined,
    images: product.images?.map((img: ProductImage) => ({
      url: img.url,
      type: img.type,
    })),
    variants: product.variants?.map((variant: ProductVariant) => ({
      id: variant.id,
      price: variant.price,
      size: variant.size,
      color: variant.color,
      stock: variant.stock,
    })),
    tags: product.tags,
    material: product.material,
    brand: product.brand,
    featured: product.featured,
  };
}

// ====================== STORE ==========================
// ====================== STORE ==========================
const CACHE_DURATION = 30 * 1000;

interface SearchState {
  products: ProductSearchData[];
  categories: CategoryWithChildren[];
  isInitialized: boolean;
  lastUpdated: number | null;
  searchQuery: string;
  filteredResults: SearchResult[];

  initializeSearchData: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  searchProducts: (query: string) => SearchResult[];
  forceRefresh: () => Promise<void>;
}

// Utility function to search products
function searchProducts(
  products: ProductSearchData[],
  query: string
): SearchResult[] {
  if (!query.trim() || query.length < 2) return [];

  const productsWithScores = products
    .map((product) => ({
      product,
      score: calculateRelevanceScore(product, query),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return productsWithScores
    .map(({ product }) => convertToSearchResult(product))
    .slice(0, 50);
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      products: [],
      categories: [],
      isInitialized: false,
      lastUpdated: null,
      searchQuery: "",
      filteredResults: [],

      initializeSearchData: async () => {
        const state = get();
        const now = Date.now();

        if (
          state.isInitialized &&
          state.lastUpdated &&
          state.products.length > 0 &&
          now - state.lastUpdated < CACHE_DURATION
        ) {
          console.log("Using cached search data from localStorage");
          return;
        }

        try {
          const data = await getSearchInitData();
          set({
            products: data.products,
            categories: data.categories,
            isInitialized: true,
            lastUpdated: now,
          });
        } catch (error) {
          console.error("Failed to fetch search data:", error);
        }
      },

      setSearchQuery: (query: string) => {
        const results = searchProducts(get().products, query);
        set({
          searchQuery: query,
          filteredResults: results,
        });
      },

      clearSearch: () => {
        set({
          searchQuery: "",
          filteredResults: [],
        });
      },

      searchProducts: (query: string): SearchResult[] => {
        return searchProducts(get().products, query);
      },

      forceRefresh: async () => {
        set({
          isInitialized: false,
          lastUpdated: null,
        });
        await get().initializeSearchData();
      },
    }),
    {
      name: "search-store",
      partialize: (state) => ({
        products: state.products,
        categories: state.categories,
        isInitialized: state.isInitialized,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);
