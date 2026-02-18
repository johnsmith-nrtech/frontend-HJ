"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Loader2Icon } from "lucide-react";

import { ProductCard } from "@/components/product-card";
import { MarqueeStrip } from "@/components/marquee-strip";
import { Button } from "@/components/button-custom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ProductsPageHeroSection } from "./components/products-page-hero-section";
import { ProductsLoading } from "./components/products-loading";

import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { useProductsPageFilters } from "./_hooks/use-products-page-filter";
import { useSearchStore } from "@/lib/store/search-store";
import { cn } from "@/lib/utils";

//
// ────────────────────────────────────────────────────────────────
//   INTERFACES
// ────────────────────────────────────────────────────────────────
//

interface PageProduct {
  id: string | number;
  name: string;
  price: number;
  deliveryInfo: string;
  category?: string;
  type?: string;
  rating?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  isSale?: boolean;
  discount?: number;
  discount_offer?: number;
  image?: string;
  variantId?: string;
  size?: string;
  color?: string;
  stock?: number;
  assemble_charges: number;
}

//
// ────────────────────────────────────────────────────────────────
//   MAIN PRODUCTS CONTENT COMPONENT
// ────────────────────────────────────────────────────────────────
//

function ProductsContent() {
  const { filters, actions, isLoading: isFiltering } = useProductsPageFilters();
  const [viewMode, setViewMode] = useState("grid");
  const filterSectionRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 12;

  const categoriesQuery = useCategories();
  const { filteredResults, isInitialized } = useSearchStore();

  //
  // ─── SEARCH MODE DETECTION ─────────────────────────────
  //
  const isSearchMode = !!filters.search && filters.search.trim().length >= 2;
  const [searchProducts, setSearchProducts] = useState<PageProduct[]>([]);

  //
  // ─── SEARCH MODE FILTERING + SORTING ─────────────────────────────
  //
  useEffect(() => {
    if (isSearchMode && isInitialized && filteredResults.length > 0) {
      let transformed = filteredResults.map((result): PageProduct => {
        const selectedVariant = result.variants?.[0];
        const mainImage = result.images?.find((i) => i.type === "main");
        const firstImage = result.images?.[0];
        const imageUrl =
          mainImage?.url || firstImage?.url || "/placeholder.svg";

        return {
          id: result.id,
          name: result.name,
          deliveryInfo: "3 To 4 Days Delivery",
          price: selectedVariant?.price || result.base_price,
          category: result.category?.name,
          type: result.category?.name,
          rating: 4.9,
          inStock: selectedVariant ? selectedVariant.stock > 0 : true,
          isFeatured: result.featured,
          isNew: false,
          isSale: true,
          discount: 15,
          discount_offer: result.discount_offer,
          image: imageUrl,
          variantId: selectedVariant?.id,
          size: selectedVariant?.size,
          color: selectedVariant?.color,
          stock: selectedVariant?.stock,
          assemble_charges: selectedVariant?.assemble_charges || 0,
        };
      });

      // ─── Apply Category Filter ───────────────────────
      if (filters.categoryId && filters.categoryId !== "all") {
        const selectedCategory = categoriesQuery.data
          ?.find((c) => c.id === filters.categoryId)
          ?.name?.toLowerCase();
        if (selectedCategory) {
          transformed = transformed.filter(
            (p) => p.category?.toLowerCase() === selectedCategory
          );
        }
      }

      // ─── Apply Price Filter ──────────────────────────
      if (filters.priceRange && filters.priceRange !== "all") {
        transformed = transformed.filter((p) => {
          const price = p.price;
          switch (filters.priceRange) {
            case "under-500":
              return price < 500;
            case "500-1000":
              return price >= 500 && price <= 1000;
            case "1000-2000":
              return price >= 1000 && price <= 2000;
            case "over-2000":
              return price > 2000;
            default:
              return true;
          }
        });
      }

      // ─── Apply Sort By ────────────────────────────────
      if (filters.sortBy) {
        transformed = [...transformed].sort((a, b) => {
          switch (filters.sortBy) {
            case "price_low_high":
              return a.price - b.price;
            case "price_high_low":
              return b.price - a.price;
            case "rating":
              return (b.rating || 0) - (a.rating || 0);
            case "created_at":
              return b.id.toString().localeCompare(a.id.toString());
            default:
              return 0;
          }
        });
      }

      setSearchProducts(transformed);
    } else {
      setSearchProducts([]);
    }
  }, [
    isSearchMode,
    filteredResults,
    isInitialized,
    filters.categoryId,
    filters.priceRange,
    filters.sortBy,
    categoriesQuery.data,
  ]);

  //
  // ─── API CALL (Only if NOT in search mode) ─────────────
  //
  const {
    data: apiProducts,
    isLoading: isProductsLoading,
    error,
  } = useProducts({
    includeImages: true,
    includeCategory: true,
    includeVariants: true,
    limit: itemsPerPage,
    page: filters.currentPage,
    categoryId: filters.categoryId || undefined,
    size: filters.size || undefined,
    material: filters.material || undefined,
    priceRange: filters.priceRange !== "all" ? filters.priceRange : undefined,
    sortBy: filters.sortBy || undefined,
    search: isSearchMode ? undefined : filters.search || undefined,
  });

  //
  // ─── MARQUEE ITEMS ────────────────────────────────────
  //
  const marqueeItems = [
    { text: "10-YEARS GUARANTEE", icon: "/sofa-icon.png" },
    { text: "100-NIGHT TRIAL", icon: "/sofa-icon.png" },
    { text: "EASY RETURN", icon: "/sofa-icon.png" },
    { text: "FREE DELIVERY", icon: "/sofa-icon.png" },
    { text: "10-YEARS GUARANTEE", icon: "/sofa-icon.png" },
  ];

  const showLoading = isFiltering || (isProductsLoading && !isSearchMode);

  //
  // ─── TRANSFORM API PRODUCTS (Only when NOT in search mode) ──
  //
  const transformedApiProducts: PageProduct[] =
    !isSearchMode && apiProducts?.items
      ? apiProducts.items.map((product) => {
          let selectedVariant = product.variants?.[0];

          if (product.variants && product.variants.length > 0) {
            const featured = product.variants.find((v) => v.featured);
            const inStock = product.variants.find((v) => v.stock > 0);
            const sizeMatch = filters.size
              ? product.variants.find(
                  (v) => v.size?.toLowerCase() === filters.size?.toLowerCase()
                )
              : null;
            const materialMatch = filters.material
              ? product.variants.find(
                  (v) =>
                    v.material?.toLowerCase() ===
                    filters.material?.toLowerCase()
                )
              : null;

            selectedVariant =
              sizeMatch ||
              materialMatch ||
              featured ||
              inStock ||
              product.variants[0];
          }

          const mainImage = product.images?.find((img) => img.type === "main");
          const firstImage = product.images?.[0];
          const variantImage = product.images
            ?.filter((img) => img.variant_id === selectedVariant?.id)
            .sort((a, b) => a.order - b.order)[0];

          const imageUrl =
            variantImage?.url ||
            mainImage?.url ||
            firstImage?.url ||
            "/placeholder.svg";

          return {
            id: product.id,
            name: product.name || "Product",
            deliveryInfo:
              selectedVariant?.delivery_time_days ??
              product.delivery_info?.text ??
              "3 To 4 Days Delivery",
            price: selectedVariant?.price || product.base_price,
            category: product.category?.name,
            type: product.category?.name,
            rating: 4.9,
            inStock: selectedVariant ? selectedVariant.stock > 0 : true,
            isFeatured: selectedVariant?.featured,
            isNew: false,
            
            isSale: true,
            discount: 15,
            discount_offer: product.discount_offer,
            image: imageUrl,
            variantId: selectedVariant?.id,
            size: selectedVariant?.size,
            color: selectedVariant?.color,
            stock: selectedVariant?.stock,
            assemble_charges: selectedVariant?.assemble_charges || 0,
          };
        })
      : [];

  //
  // ─── FINAL DISPLAY PRODUCTS ───────────────────────────
  //
  const displayProducts = isSearchMode
    ? searchProducts
    : transformedApiProducts;
  const totalPages = isSearchMode ? 1 : apiProducts?.meta?.totalPages || 1;

  //
  // ─── CATEGORY CHANGE HANDLER ──────────────────────────
  //
  const handleCategoryChange = (categoryId: string) => {
    actions.setCategoryId(categoryId === "all" ? null : categoryId);
  };

  //
  // ─── ERROR STATE ─────────────────────────────────────
  //
  if (error && !isSearchMode) {
    return (
      <div className="container-1440 px-4 py-12">
        <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          <p>Error loading products. Please try again later.</p>
        </div>
      </div>
    );
  }

  //
  // ─── MAIN RENDER ─────────────────────────────────────
  //
  return (
    <div className="w-full">
      <ProductsPageHeroSection />

      <MarqueeStrip
        items={marqueeItems}
        backgroundColor="bg-blue"
        textColor="text-white"
        className="py-3 sm:py-4 md:mt-[-70px] 2xl:mt-[0px]"
      />

      <div className="bg-gray-50 py-8 md:py-12">
        <div className="px-4 sm:px-[32px]">
          {/* FILTERS SECTION */}
          <div id="filters-section" className="mb-8" ref={filterSectionRef}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              {/* LEFT FILTERS */}
              <div className="flex justify-between gap-4 sm:flex-row">
                {/* CATEGORY FILTER */}
                <div className="flex flex-col items-start gap-2">
                  <span className="text-sm font-medium tracking-wide text-gray-400 uppercase">
                    Categories
                  </span>
                  <Select
                    value={filters.categoryId || "all"}
                    onValueChange={handleCategoryChange}
                    disabled={categoriesQuery.isLoading}
                  >
                    <SelectTrigger className="text-blue border-blue h-16 w-[130px] rounded-full px-4 disabled:opacity-50 sm:w-[280px]">
                      <div className="flex items-center gap-2">
                        {categoriesQuery.isLoading && (
                          <Loader2Icon className="h-4 w-4 animate-spin" />
                        )}
                        <SelectValue placeholder="Select" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categoriesQuery.data?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* PRICE FILTER */}
                <div className="flex flex-col items-start gap-2">
                  <span className="text-sm font-medium tracking-wide text-gray-400 uppercase">
                    Prices
                  </span>
                  <Select
                    value={filters.priceRange}
                    onValueChange={actions.setPriceRange}
                    disabled={isFiltering}
                  >
                    <SelectTrigger className="text-blue border-blue h-16 w-[130px] rounded-full px-4 disabled:opacity-50 sm:w-[280px]">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="under-500">Under £500</SelectItem>
                      <SelectItem value="500-1000">£500 - £1000</SelectItem>
                      <SelectItem value="1000-2000">£1000 - £2000</SelectItem>
                      <SelectItem value="over-2000">Over £2000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* RIGHT FILTERS: SORT & VIEW MODE */}
              <div className="flex items-center gap-6">
                <Select
                  value={filters.sortBy}
                  onValueChange={actions.setSortBy}
                  disabled={isFiltering}
                >
                  <SelectTrigger className="flex h-auto w-auto items-center gap-1 border-0 bg-transparent p-0 shadow-none">
                    <span className="text-sm font-medium text-[#999]">
                      Sort By
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price_low_high">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price_high_low">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                    <SelectItem value="created_at">Newest</SelectItem>
                  </SelectContent>
                </Select>

                {/* VIEW MODE BUTTONS */}
                <div className="hidden items-center lg:flex">
                  {["grid", "grid-small", "list", "list-detailed"].map(
                    (mode) => (
                      <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className="border-gray border p-3"
                      >
                        <Image
                          src={
                            viewMode === mode
                              ? `/l-${
                                  mode === "grid"
                                    ? "11"
                                    : mode === "grid-small"
                                      ? "22"
                                      : mode === "list"
                                        ? "33"
                                        : "44"
                                }.png`
                              : `/l-${
                                  mode === "grid"
                                    ? "1"
                                    : mode === "grid-small"
                                      ? "2"
                                      : mode === "list"
                                        ? "3"
                                        : "4"
                                }.png`
                          }
                          alt={mode}
                          width={20}
                          height={20}
                        />
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* PRODUCTS GRID */}
          {showLoading ? (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="h-96 animate-pulse rounded-lg bg-gray-200"
                />
              ))}
            </div>
          ) : displayProducts.length > 0 ? (
            <div
              className={cn("grid gap-6", {
                "grid-cols-2 lg:grid-cols-3": viewMode === "grid",
                "grid-cols-2 md:grid-cols-3 lg:grid-cols-4":
                  viewMode === "grid-small",
                "grid-cols-2 md:grid-cols-2": viewMode === "list",
                "grid-cols-1": viewMode === "list-detailed",
              })}
            >
            {displayProducts.map((product, index) => {
              const discount = Number(product.discount_offer) || 0;

              const originalPrice = product.price;

              const discountedPrice =
                discount > 0
                  ? Math.round(originalPrice - (originalPrice * discount) / 100)
                  : originalPrice;

              return (
                <ProductCard
                  key={product.id}
                  variant={index % 2 === 0 ? "layout1" : "layout2"}
                  id={product.id}
                  name={product.name}

                  price={discountedPrice}                 // ✅ final price (479)
                  originalPrice={discount > 0 ? originalPrice : undefined} // ✅ crossed price (599)

                  discount={discount > 0 ? `${discount}% off` : undefined}

                  imageSrc={product.image}
                  rating={product.rating || 4.9}
                  deliveryInfo={product.deliveryInfo}
                  paymentOption={{
                    service: "Klarna",
                    installments: 3,
                    amount: Math.round((discountedPrice / 3) * 100) / 100,
                  }}
                  isSale={discount > 0}
                  className={
                    viewMode === "list-detailed" ? "list-detailed-view" : ""
                  }
                  variantId={product.variantId}
                  size={product.size}
                  color={product.color}
                  stock={product.stock}
                  assemble_charges={product.assemble_charges || 0}
                />
              );
            })}




            </div>
          ) : (
            <div className="rounded-lg border bg-white py-12 text-center">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium">No products found</h3>
              <p className="mx-auto mt-2 max-w-md text-gray-500">
                {isSearchMode
                  ? `No results for "${filters.search}". Try different keywords.`
                  : "Try adjusting your filters."}
              </p>
              <Button
                variant="primary"
                size="md"
                className="mt-4"
                onClick={actions.resetFilters}
              >
                Reset Filters
              </Button>
            </div>
          )}

          {/* PAGINATION (Only if NOT in search mode) */}
          {!isSearchMode && !isProductsLoading && totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  actions.setCurrentPage(Math.max(1, filters.currentPage - 1));
                  filterSectionRef.current?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
                disabled={filters.currentPage === 1}
              >
                Previous
              </Button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page =
                    Math.max(
                      1,
                      Math.min(totalPages - 4, filters.currentPage - 2)
                    ) + i;
                  if (page > totalPages) return null;
                  return (
                    <Button
                      key={page}
                      variant={
                        filters.currentPage === page ? "primary" : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        actions.setCurrentPage(page);
                        filterSectionRef.current?.scrollIntoView({
                          behavior: "smooth",
                        });
                      }}
                      className="h-10 w-10 p-0"
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  actions.setCurrentPage(
                    Math.min(totalPages, filters.currentPage + 1)
                  );
                  filterSectionRef.current?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
                disabled={filters.currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

//
// ────────────────────────────────────────────────────────────────
//   WRAPPER WITH SUSPENSE FALLBACK
// ────────────────────────────────────────────────────────────────
//

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsContent />
    </Suspense>
  );
}
