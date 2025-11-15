import { useSearchParams, useRouter } from "next/navigation";
import { useTransition, useCallback, useMemo } from "react";

// Valid filter options
const VALID_SORT_OPTIONS = [
  "price_low_high",
  "price_high_low",
  "rating",
  "created_at",
] as const;

const VALID_PRICE_RANGES = [
  "all",
  "under-500",
  "500-1000",
  "1000-2000",
  "over-2000",
] as const;

export type SortOption = (typeof VALID_SORT_OPTIONS)[number];
type PriceRange = (typeof VALID_PRICE_RANGES)[number];

interface FilterState {
  categoryId: string | null;
  sortBy: SortOption;
  size: string | null;
  material: string | null;
  priceRange: PriceRange;
  currentPage: number;
  search: string | null;
}

interface FilterActions {
  setCategoryId: (categoryId: string | null) => void;
  setSortBy: (sortBy: SortOption) => void;
  setSize: (size: string | null) => void;
  setMaterial: (material: string | null) => void;
  setPriceRange: (priceRange: PriceRange) => void;
  setCurrentPage: (page: number) => void;
  setSearch: (search: string | null) => void;
  resetFilters: () => void;
}

export function useProductsPageFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Parse and validate search params
  const filters = useMemo((): FilterState => {
    const categoryId = searchParams.get("categoryId");
    const sortByParam = searchParams.get("sortBy");
    const size = searchParams.get("size");
    const material = searchParams.get("material");
    const priceRangeParam = searchParams.get("priceRange");
    const pageParam = searchParams.get("currentPage");
    const search = searchParams.get("search");

    // Validate sortBy
    const sortBy = VALID_SORT_OPTIONS.includes(sortByParam as SortOption)
      ? (sortByParam as SortOption)
      : "created_at";

    // Validate priceRange
    const priceRange = VALID_PRICE_RANGES.includes(
      priceRangeParam as PriceRange
    )
      ? (priceRangeParam as PriceRange)
      : "all";

    // Validate and parse page number
    const parsedPage = pageParam ? parseInt(pageParam, 10) : 1;
    const currentPage = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1;

    return {
      categoryId,
      sortBy,
      size,
      material,
      priceRange,
      currentPage,
      search,
    };
  }, [searchParams]);

  // Generic function to update URL params
  const updateUrlParams = useCallback(
    (updates: Partial<FilterState>, resetPage = true) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());

        // Apply updates
        Object.entries(updates).forEach(([key, value]) => {
          if (value === null || value === "" || value === "all") {
            params.delete(key);
          } else {
            params.set(key, String(value));
          }
        });

        // Reset page to 1 when filters change (unless explicitly updating page)
        if (resetPage && !updates.hasOwnProperty("currentPage")) {
          params.delete("currentPage");
        }

        // Build new URL
        const newUrl = params.toString()
          ? `/products?${params.toString()}`
          : "/products";

        router.push(newUrl, { scroll: false });
      });
    },
    [searchParams, router]
  );

  // Individual filter setters
  const setCategoryId = useCallback(
    (categoryId: string | null) => {
      // When category changes, remove material and size filters
      updateUrlParams({ categoryId, material: null, size: null });
    },
    [updateUrlParams]
  );

  const setSortBy = useCallback(
    (sortBy: SortOption) => {
      if (VALID_SORT_OPTIONS.includes(sortBy)) {
        updateUrlParams({ sortBy });
      }
    },
    [updateUrlParams]
  );

  const setSize = useCallback(
    (size: string | null) => {
      updateUrlParams({ size });
    },
    [updateUrlParams]
  );

  const setMaterial = useCallback(
    (material: string | null) => {
      updateUrlParams({ material });
    },
    [updateUrlParams]
  );

  const setPriceRange = useCallback(
    (priceRange: PriceRange) => {
      if (VALID_PRICE_RANGES.includes(priceRange)) {
        updateUrlParams({ priceRange });
      }
    },
    [updateUrlParams]
  );

  const setCurrentPage = useCallback(
    (page: number) => {
      if (page > 0) {
        updateUrlParams({ currentPage: page }, false);
      }
    },
    [updateUrlParams]
  );

  const setSearch = useCallback(
    (search: string | null) => {
      updateUrlParams({ search });
    },
    [updateUrlParams]
  );

  const resetFilters = useCallback(() => {
    startTransition(() => {
      router.push("/products", { scroll: false });
    });
  }, [router]);

  const actions: FilterActions = {
    setCategoryId,
    setSortBy,
    setSize,
    setMaterial,
    setPriceRange,
    setCurrentPage,
    setSearch,
    resetFilters,
  };

  return {
    filters,
    actions,
    isLoading: isPending,
    // Convenience getters for common UI patterns
    hasActiveFilters:
      filters.categoryId !== null ||
      filters.sortBy !== "created_at" ||
      filters.size !== null ||
      filters.material !== null ||
      filters.priceRange !== "all" ||
      filters.search !== null,
  };
}
