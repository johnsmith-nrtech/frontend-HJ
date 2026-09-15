"use client";

import React, { Suspense, useMemo, useRef, useState, ReactElement } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Loader2Icon } from "lucide-react";

import { ProductCard } from "@/components/product-card";
import { MarqueeStrip } from "@/components/marquee-strip";
import { Button } from "@/components/button-custom";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { Category } from "@/lib/api/categories";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────
//  CONFIG
//  When this page needs to be restricted to Beds only, set this to
//  the parent "Beds" category's id (or slug lookup) and the strip
//  will only render its subcategories instead of all top-level
//  categories. Leave null for now ("Beds & More" shows everything).
// ─────────────────────────────────────────────────────────────────
// const BEDS_ONLY_PARENT_CATEGORY_ID: string | null = null;

interface PageProduct {
  id: string | number;
  name: string;
  finalPrice: number;
  originalPrice?: number;
  isCompareDiscount?: boolean;
  deliveryInfo: string;
  category?: string;
  rating?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  isSale?: boolean;
  discountLabel?: string;
  image?: string;
  variantId?: string;
  size?: string;
  color?: string;
  stock?: number;
  assemble_charges: number;
  showInstallments?: boolean;
}

// ─────────────────────────────────────────────────────────────────
//  PRICE HELPERS — identical logic to /products so pricing stays
//  consistent everywhere (listing, detail, cart, this page).
// ─────────────────────────────────────────────────────────────────

const getDiscountPct = (variant: any, productDiscountOffer?: number): number => {
  if (variant) {
    if (variant.compare_price && variant.compare_price > variant.price) {
      return Math.round(
        ((variant.compare_price - variant.price) / variant.compare_price) * 100,
      );
    }
    if (variant.discount_percentage && Number(variant.discount_percentage) > 0) {
      return Number(variant.discount_percentage);
    }
  }
  if (productDiscountOffer && Number(productDiscountOffer) > 0) {
    return Number(productDiscountOffer);
  }
  return 0;
};

const getSalePrice = (variant: any, discountPct: number): number => {
  if (discountPct <= 0) return variant.price;
  if (variant?.compare_price && variant.compare_price > variant.price) {
    return variant.price;
  }
  const sale = variant.price - (variant.price * discountPct) / 100;
  return Math.round(sale * 100) / 100;
};

const getOriginalPrice = (variant: any, discountPct: number): number | undefined => {
  if (discountPct <= 0) return undefined;
  if (variant?.compare_price && variant.compare_price > variant.price) {
    return variant.compare_price;
  }
  return variant.price;
};

const pickBestVariant = (variants: any[]): any | null => {
  if (!variants || variants.length === 0) return null;
  const sorted = [...variants].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  return sorted[0];
};

const mapApiProductToPageProduct = (product: any): PageProduct => {
  const selectedVariant = pickBestVariant(product.variants ?? []);
  const sortedImages = [...(product.images ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  const imageUrl =
    sortedImages.find((img) => img.type === "main")?.url ||
    sortedImages[0]?.url ||
    "/placeholder.svg";

  const discountPct = getDiscountPct(selectedVariant, product.discount_offer);
  const finalPrice = selectedVariant
    ? getSalePrice(selectedVariant, discountPct)
    : product.base_price;
  const originalPrice = selectedVariant
    ? getOriginalPrice(selectedVariant, discountPct)
    : undefined;
  const isCompareDiscount = !!(
    selectedVariant?.compare_price && selectedVariant.compare_price > selectedVariant.price
  );

  return {
    id: product.id,
    name: product.name ?? "Product",
    finalPrice,
    originalPrice,
    isCompareDiscount,
    deliveryInfo: (() => {
      const raw =
        selectedVariant?.delivery_time_days || product.delivery_info?.text || "3-5 days";
      return raw
        .replace(/\s*delivery\s*/gi, "")
        .replace(/\s+to\s+/gi, "-")
        .replace(/\bdays\b/gi, "days")
        .trim();
    })(),
    category: product.category?.name,
    rating: 4.9,
    inStock: selectedVariant ? selectedVariant.stock > 0 : true,
    isFeatured: selectedVariant?.featured,
    isSale: discountPct > 0,
    discountLabel: discountPct > 0 ? `${discountPct}% off` : undefined,
    image: imageUrl,
    variantId: selectedVariant?.id,
    size: selectedVariant?.size,
    color: selectedVariant?.color,
    stock: selectedVariant?.stock,
    assemble_charges: selectedVariant?.assemble_charges ?? 0,
    showInstallments: product.show_installments ?? true,
  };
};

// ─────────────────────────────────────────────────────────────────
//  CATEGORY VECTOR ICONS
//  Prefers a real icon from the category record (icon_url /
//  image_url — add whichever field the backend ends up exposing).
//  Falls back to a keyword-matched inline SVG so the strip never
//  shows a broken image while that field doesn't exist yet.
// ─────────────────────────────────────────────────────────────────

const FALLBACK_ICONS: Record<string, ReactElement> = {
  bed: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 18v2M21 18v2" strokeLinecap="round" />
      <path d="M3 12V7a1 1 0 0 1 1-1h6v4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6.5" cy="8" r="1.2" />
    </svg>
  ),
  mattress: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="7" width="18" height="10" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 12h18" strokeLinecap="round" />
    </svg>
  ),
  sofa: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 12V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 12h18v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 16v3M20 16v3" strokeLinecap="round" />
    </svg>
  ),
  wardrobe: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="3" width="16" height="18" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 3v18" strokeLinecap="round" />
      <circle cx="9.5" cy="12" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="12" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  ),
  drawer: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="3" width="16" height="18" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 9h16M4 15h16" strokeLinecap="round" />
      <path d="M10 12h4M10 18h4" strokeLinecap="round" />
    </svg>
  ),
  table: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 8h18M5 8v11M19 8v11" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 8l2.5-4h15L22 8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  lighting: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 18h6M10 21h4" strokeLinecap="round" />
      <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  default: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const getFallbackIcon = (name: string) => {
  const key = name.toLowerCase();
  const match = Object.keys(FALLBACK_ICONS).find((k) => key.includes(k));
  return FALLBACK_ICONS[match ?? "default"];
};

function CategoryIcon({ category, active }: { category: any; active: boolean }) {
  const iconUrl = category.icon_url || category.image_url;

  return (
    <div
      className={cn(
        "flex h-16 w-16 items-center justify-center rounded-full border-2 transition-colors sm:h-20 sm:w-20",
        active ? "border-blue bg-blue text-white" : "border-blue/20 bg-white text-blue",
      )}
    >
      {iconUrl ? (
        <div className="relative h-8 w-8 sm:h-10 sm:w-10">
          <Image
            src={iconUrl}
            alt={category.name}
            fill
            className={cn("object-contain", active && "brightness-0 invert")}
          />
        </div>
      ) : (
        <div className="h-8 w-8 sm:h-10 sm:w-10">{getFallbackIcon(category.name)}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  MAIN CONTENT
// ─────────────────────────────────────────────────────────────────

function BedsAndMoreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stripRef = useRef<HTMLDivElement>(null);

  const itemsPerPage = 12;
  const currentPage = Number(searchParams.get("page") || 1);

  const selectedCategoryId = searchParams.get("categoryId") || "all";
  const selectedSubcategoryId = searchParams.get("subcategoryId") || "all";

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    // switching category/subcategory always resets pagination
    if (key !== "page") params.delete("page");
    router.push(`/beds?${params.toString()}`, { scroll: false });
    stripRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const nestedCategoriesQuery = useCategories(true, true);

  // Backend now only returns is_bed: true categories for this query,
  const topLevelCategories: Category[] = nestedCategoriesQuery.data ?? [];

  const activeCategory = topLevelCategories.find((c: Category) => c.id === selectedCategoryId);
  const subcategories = activeCategory?.subcategories ?? [];

  const effectiveCategoryId =
    selectedSubcategoryId !== "all" ? selectedSubcategoryId : selectedCategoryId;

  const { data: productsData, isLoading: isProductsLoading, error } = useProducts({
    includeImages: true,
    includeCategory: true,
    includeVariants: true,
    categoryId: effectiveCategoryId !== "all" ? effectiveCategoryId : undefined,
    isBed: true,
    limit: itemsPerPage,
    page: currentPage,
  });

  const displayProducts: PageProduct[] = (productsData?.items ?? []).map(
    mapApiProductToPageProduct,
  );
  const totalPages = Math.max(1, productsData?.meta?.totalPages ?? 1);

  const marqueeItems = [
    { text: "Interest-free credit ", 
      // icon: "/sofa-icon.png" 
    },
    { text: "Free delivery offers", 
      // icon: "/sofa-icon.png" 
    },
    { text: "Finance availability", 
      // icon: "/sofa-icon.png" 
    },
    { text: "Referral rewards", 
      // icon: "/sofa-icon.png" 
    },
    { text: "Protection cover offers ", 
      // icon: "/sofa-icon.png" 
    },
    { text: "Discount campaigns", 
      // icon: "/sofa-icon.png" 
    },
  ];

  return (
    <div className="w-full">
      {/* HERO */}
      <div className="bg-blue-400 relative h-[350px] overflow-hidden md:h-[450px] 2xl:h-[550px] py-10 text-white sm:py-14">
        <div className="px-4 sm:px-[32px]">
          <h1 className="text-3xl font-bold sm:text-4xl">Beds & More</h1>
          <p className="mt-2 max-w-xl text-white/80">
            Beds, mattresses, wardrobes and everything else for the bedroom — all in one place.
          </p>
        </div>
      </div>


      <MarqueeStrip
        items={marqueeItems}
        backgroundColor="bg-blue"
        textColor="text-white"
        className="py-3 sm:py-4"
      />

      <div className="bg-gray-50 py-8 md:py-12">
        <div className="px-4 sm:px-[32px]">
          {/* CATEGORY STRIP */}
          <div ref={stripRef} className="mb-10">
            <div className="scrollbar-hide flex gap-6 overflow-x-auto pb-2">
              <button
                onClick={() => setParam("categoryId", "all")}
                className="flex flex-shrink-0 flex-col items-center gap-2"
              >
                <div
                  className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-full border-2 sm:h-20 sm:w-20",
                    selectedCategoryId === "all"
                      ? "border-blue bg-blue text-white"
                      : "border-blue/20 bg-white text-blue",
                  )}
                >
                  <div className="h-8 w-8 sm:h-10 sm:w-10">{FALLBACK_ICONS.default}</div>
                </div>
                <span
                  className={cn(
                    "text-sm font-medium",
                    selectedCategoryId === "all" ? "text-blue" : "text-gray-600",
                  )}
                >
                  All
                </span>
              </button>

              {nestedCategoriesQuery.isLoading ? (
                <div className="flex items-center px-4">
                  <Loader2Icon className="h-5 w-5 animate-spin text-blue" />
                </div>
              ) : (
                topLevelCategories.map((category: Category) => (
                  <button
                    key={category.id}
                    onClick={() => setParam("categoryId", category.id)}
                    className="flex flex-shrink-0 flex-col items-center gap-2"
                  >
                    <CategoryIcon category={category} active={selectedCategoryId === category.id} />
                    <span
                      className={cn(
                        "max-w-[80px] truncate text-center text-sm font-medium",
                        selectedCategoryId === category.id ? "text-blue" : "text-gray-600",
                      )}
                    >
                      {category.name}
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* SUBCATEGORY PILLS — only when a category with children is active */}
            {subcategories.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setParam("subcategoryId", "all")}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                    selectedSubcategoryId === "all"
                      ? "border-blue bg-blue text-white"
                      : "border-blue/30 text-blue hover:bg-blue/5",
                  )}
                >
                  All {activeCategory?.name}
                </button>
                {subcategories.map((sub: Category) => (
                  <button
                    key={sub.id}
                    onClick={() => setParam("subcategoryId", sub.id)}
                    className={cn(
                      "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                      selectedSubcategoryId === sub.id
                        ? "border-blue bg-blue text-white"
                        : "border-blue/30 text-blue hover:bg-blue/5",
                    )}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PRODUCTS GRID */}
          {isProductsLoading ? (
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-96 animate-pulse rounded-lg bg-gray-200" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
              <p>Error loading products. Please try again later.</p>
            </div>
          ) : displayProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
              {displayProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  variant={index % 2 === 0 ? "layout1" : "layout2"}
                  id={product.id}
                  name={product.name}
                  price={product.finalPrice}
                  originalPrice={product.originalPrice}
                  isCompareDiscount={product.isCompareDiscount}
                  discount={product.discountLabel}
                  imageSrc={product.image}
                  rating={product.rating ?? 4.9}
                  deliveryInfo={product.deliveryInfo}
                  paymentOption={{
                    service: "Klarna",
                    installments: 3,
                    amount: Math.round((product.finalPrice / 3) * 100) / 100,
                  }}
                  isSale={product.isSale}
                  variantId={product.variantId}
                  size={product.size}
                  color={product.color}
                  stock={product.stock}
                  assemble_charges={product.assemble_charges ?? 0}
                  showInstallments={product.showInstallments}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border bg-white py-12 text-center">
              <h3 className="text-lg font-medium">No products found</h3>
              <p className="mx-auto mt-2 max-w-md text-gray-500">
                Try a different category, or check back soon.
              </p>
              <Button
                variant="primary"
                size="md"
                className="mt-4"
                onClick={() => {
                  setParam("categoryId", "all");
                  setParam("subcategoryId", "all");
                }}
              >
                Reset
              </Button>
            </div>
          )}

          {/* PAGINATION */}
          {!isProductsLoading && totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setParam("page", String(Math.max(1, currentPage - 1)))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (page > totalPages) return null;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setParam("page", String(page))}
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
                onClick={() => setParam("page", String(Math.min(totalPages, currentPage + 1)))}
                disabled={currentPage === totalPages}
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

export default function BedsAndMorePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2Icon className="h-8 w-8 animate-spin text-blue" />
        </div>
      }
    >
      <BedsAndMoreContent />
    </Suspense>
  );
}