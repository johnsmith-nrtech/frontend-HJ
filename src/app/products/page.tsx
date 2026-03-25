// "use client";

// import { Suspense, useEffect, useRef, useState } from "react";
// import Image from "next/image";
// import { Loader2Icon } from "lucide-react";

// import { ProductCard } from "@/components/product-card";
// import { MarqueeStrip } from "@/components/marquee-strip";
// import { Button } from "@/components/button-custom";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// import { ProductsPageHeroSection } from "./components/products-page-hero-section";
// import { ProductsLoading } from "./components/products-loading";

// import { useProducts } from "@/hooks/use-products";
// import { useCategories } from "@/hooks/use-categories";
// import { useProductsPageFilters } from "./_hooks/use-products-page-filter";
// import { useSearchStore } from "@/lib/store/search-store";
// import { cn } from "@/lib/utils";

// // ─────────────────────────────────────────────────────────────────
// //  INTERFACES
// // ─────────────────────────────────────────────────────────────────

// interface PageProduct {
//   id: string | number;
//   name: string;
//   price: number;
//   deliveryInfo: string;
//   category?: string;
//   type?: string;
//   rating?: number;
//   inStock?: boolean;
//   isFeatured?: boolean;
//   isNew?: boolean;
//   isSale?: boolean;
//   discount?: number;
//   discount_offer?: number;
//   image?: string;
//   variantId?: string;
//   size?: string;
//   color?: string;
//   stock?: number;
//   assemble_charges: number;
// }

// // ─────────────────────────────────────────────────────────────────
// //  HELPER: calculate best discount from a variant
// //
// //  IMPORTANT: This is only called AFTER the default variant has
// //  already been selected. It does NOT influence which variant is
// //  picked — it only derives the discount % to display.
// //
// //  Priority 1 → compare_price  (if compare_price > price)
// //  Priority 2 → discount_percentage  (direct field on variant)
// //  Priority 3 → product-level discount_offer (passed as fallback)
// // ─────────────────────────────────────────────────────────────────

// const getVariantDiscount = (
//   variant: any,
//   productDiscountOffer?: number,
// ): number => {
//   if (variant) {
//     // compare_price takes precedence
//     if (variant.compare_price && variant.compare_price > variant.price) {
//       const d =
//         ((variant.compare_price - variant.price) / variant.compare_price) * 100;
//       return Math.round(d);
//     }

//     // direct discount_percentage on variant
//     if (
//       variant.discount_percentage &&
//       Number(variant.discount_percentage) > 0
//     ) {
//       return Number(variant.discount_percentage);
//     }
//   }

//   // fall back to product-level discount_offer
//   if (productDiscountOffer && Number(productDiscountOffer) > 0) {
//     return Number(productDiscountOffer);
//   }

//   return 0;
// };

// // ─────────────────────────────────────────────────────────────────
// //  HELPER: pick the default variant to display for a product
// //
// //  FIX: Discount / compare_price is NO LONGER a selection factor.
// //  A non-default variant must NOT be promoted just because it has
// //  a compare_price set.
// //
// //  Priority: featured → oldest (first created_at)
// //
// //  The compare_price discount will still be SHOWN once the default
// //  variant is selected — it just won't cause a different variant
// //  to be chosen.
// // ─────────────────────────────────────────────────────────────────

// const pickBestVariant = (variants: any[]): any | null => {
//   if (!variants || variants.length === 0) return null;

//   // 1. featured first
//   const featured = variants.find((v) => v.featured);
//   if (featured) return featured;

//   // 2. fallback: oldest (first created_at) — stable, predictable default
//   return [...variants].sort(
//     (a, b) =>
//       new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
//   )[0];
// };

// // ─────────────────────────────────────────────────────────────────
// //  MAIN PRODUCTS CONTENT COMPONENT
// // ─────────────────────────────────────────────────────────────────

// function ProductsContent() {
//   const { filters, actions, isLoading: isFiltering } =
//     useProductsPageFilters();
//   const [viewMode, setViewMode] = useState("grid");
//   const filterSectionRef = useRef<HTMLDivElement>(null);
//   const itemsPerPage = 12;

//   const categoriesQuery = useCategories();
//   const { filteredResults, isInitialized } = useSearchStore();

//   // ── search mode detection ──────────────────────────────────────
//   const isSearchMode =
//     !!filters.search && filters.search.trim().length >= 2;
//   const [searchProducts, setSearchProducts] = useState<PageProduct[]>([]);

//   // ── search mode: transform + filter + sort locally ─────────────
//   useEffect(() => {
//     if (isSearchMode && isInitialized && filteredResults.length > 0) {
//       let transformed = filteredResults.map((result): PageProduct => {
//         // Use the fixed pickBestVariant (featured → oldest only)
//         const selectedVariant = pickBestVariant(result.variants ?? []);
//         const mainImage = result.images?.find((i: any) => i.type === "main");
//         const firstImage = result.images?.[0];
//         const imageUrl =
//           mainImage?.url || firstImage?.url || "/placeholder.svg";

//         // Discount is derived from the chosen default variant
//         const discount = getVariantDiscount(
//           selectedVariant,
//           result.discount_offer,
//         );

//         return {
//           id: result.id,
//           name: result.name,
//           deliveryInfo: "3 To 4 Days Delivery",
//           price: selectedVariant?.price ?? result.base_price,
//           category: result.category?.name,
//           type: result.category?.name,
//           rating: 4.9,
//           inStock: selectedVariant ? selectedVariant.stock > 0 : true,
//           isFeatured: result.featured,
//           isNew: false,
//           isSale: discount > 0,
//           discount,
//           discount_offer: discount,
//           image: imageUrl,
//           variantId: selectedVariant?.id,
//           size: selectedVariant?.size,
//           color: selectedVariant?.color,
//           stock: selectedVariant?.stock,
//           assemble_charges: selectedVariant?.assemble_charges ?? 0,
//         };
//       });

//       // apply category filter
//       if (filters.categoryId && filters.categoryId !== "all") {
//         const selectedCategoryName = categoriesQuery.data
//           ?.find((c) => c.id === filters.categoryId)
//           ?.name?.toLowerCase();
//         if (selectedCategoryName) {
//           transformed = transformed.filter(
//             (p) => p.category?.toLowerCase() === selectedCategoryName,
//           );
//         }
//       }

//       // apply price filter
//       if (filters.priceRange && filters.priceRange !== "all") {
//         transformed = transformed.filter((p) => {
//           const price = p.price;
//           switch (filters.priceRange) {
//             case "under-500":
//               return price < 500;
//             case "500-1000":
//               return price >= 500 && price <= 1000;
//             case "1000-2000":
//               return price >= 1000 && price <= 2000;
//             case "over-2000":
//               return price > 2000;
//             default:
//               return true;
//           }
//         });
//       }

//       // apply sort
//       if (filters.sortBy) {
//         transformed = [...transformed].sort((a, b) => {
//           switch (filters.sortBy) {
//             case "price_low_high":
//               return a.price - b.price;
//             case "price_high_low":
//               return b.price - a.price;
//             case "rating":
//               return (b.rating ?? 0) - (a.rating ?? 0);
//             case "created_at":
//               return b.id.toString().localeCompare(a.id.toString());
//             default:
//               return 0;
//           }
//         });
//       }

//       setSearchProducts(transformed);
//     } else {
//       setSearchProducts([]);
//     }
//   }, [
//     isSearchMode,
//     filteredResults,
//     isInitialized,
//     filters.categoryId,
//     filters.priceRange,
//     filters.sortBy,
//     categoriesQuery.data,
//   ]);

//   // ── API call (only when NOT in search mode) ────────────────────
//   const {
//     data: apiProducts,
//     isLoading: isProductsLoading,
//     error,
//   } = useProducts({
//     includeImages: true,
//     includeCategory: true,
//     includeVariants: true,
//     limit: itemsPerPage,
//     page: filters.currentPage,
//     categoryId: filters.categoryId || undefined,
//     size: filters.size || undefined,
//     material: filters.material || undefined,
//     priceRange:
//       filters.priceRange !== "all" ? filters.priceRange : undefined,
//     sortBy: filters.sortBy || undefined,
//     search: isSearchMode ? undefined : filters.search || undefined,
//   });

//   // ── marquee items ──────────────────────────────────────────────
//   const marqueeItems = [
//     { text: "10-YEARS GUARANTEE", icon: "/sofa-icon.png" },
//     { text: "100-NIGHT TRIAL", icon: "/sofa-icon.png" },
//     { text: "EASY RETURN", icon: "/sofa-icon.png" },
//     { text: "FREE DELIVERY", icon: "/sofa-icon.png" },
//     { text: "10-YEARS GUARANTEE", icon: "/sofa-icon.png" },
//   ];

//   const showLoading =
//     isFiltering || (isProductsLoading && !isSearchMode);

//   // ── transform API products (only when NOT in search mode) ──────
//   const transformedApiProducts: PageProduct[] =
//     !isSearchMode && apiProducts?.items
//       ? apiProducts.items.map((product) => {
//           // ── Pick the default variant using the fixed function
//           //    (featured → oldest). Discount does NOT influence this.
//           let selectedVariant = pickBestVariant(product.variants ?? []);

//           // If the user is filtering by size/material, prefer the
//           // matching variant — but only if one is found.
//           if (product.variants && product.variants.length > 0) {
//             const sizeMatch = filters.size
//               ? product.variants.find(
//                   (v) =>
//                     v.size?.toLowerCase() === filters.size?.toLowerCase(),
//                 )
//               : null;
//             const materialMatch = filters.material
//               ? product.variants.find(
//                   (v) =>
//                     v.material?.toLowerCase() ===
//                     filters.material?.toLowerCase(),
//                 )
//               : null;

//             if (sizeMatch || materialMatch) {
//               selectedVariant = sizeMatch || materialMatch;
//             }
//           }

//           // image: sort by order, prefer type=main
//           const sortedImages = [...(product.images ?? [])].sort(
//             (a, b) => (a.order ?? 0) - (b.order ?? 0),
//           );
//           const imageUrl =
//             sortedImages.find((img) => img.type === "main")?.url ||
//             sortedImages[0]?.url ||
//             "/placeholder.svg";

//           // ── Discount is derived from the SELECTED default variant.
//           //    If that variant has compare_price → show discount.
//           //    If not → fall back to product.discount_offer.
//           //    A different variant's compare_price is NOT used here.
//           const discount = getVariantDiscount(
//             selectedVariant,
//             product.discount_offer,
//           );

//           return {
//             id: product.id,
//             name: product.name ?? "Product",
//             deliveryInfo:
//               selectedVariant?.delivery_time_days ??
//               product.delivery_info?.text ??
//               "3 To 4 Days Delivery",
//             price: selectedVariant?.price ?? product.base_price,
//             category: product.category?.name,
//             type: product.category?.name,
//             rating: 4.9,
//             inStock: selectedVariant
//               ? selectedVariant.stock > 0
//               : true,
//             isFeatured: selectedVariant?.featured,
//             isNew: false,
//             isSale: discount > 0,
//             discount,
//             discount_offer: discount,
//             image: imageUrl,
//             variantId: selectedVariant?.id,
//             size: selectedVariant?.size,
//             color: selectedVariant?.color,
//             stock: selectedVariant?.stock,
//             assemble_charges: selectedVariant?.assemble_charges ?? 0,
//           };
//         })
//       : [];

//   // ── final display products ─────────────────────────────────────
//   const displayProducts = isSearchMode
//     ? searchProducts
//     : transformedApiProducts;
//   const totalPages = isSearchMode
//     ? 1
//     : apiProducts?.meta?.totalPages ?? 1;

//   // ── handlers ──────────────────────────────────────────────────
//   const handleCategoryChange = (categoryId: string) => {
//     actions.setCategoryId(categoryId === "all" ? null : categoryId);
//   };

//   // ── error state ───────────────────────────────────────────────
//   if (error && !isSearchMode) {
//     return (
//       <div className="container-1440 px-4 py-12">
//         <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
//           <p>Error loading products. Please try again later.</p>
//         </div>
//       </div>
//     );
//   }

//   // ── render ────────────────────────────────────────────────────
//   return (
//     <div className="w-full">
//       <ProductsPageHeroSection />

//       <MarqueeStrip
//         items={marqueeItems}
//         backgroundColor="bg-blue"
//         textColor="text-white"
//         className="py-3 sm:py-4 md:mt-[-70px] 2xl:mt-[0px]"
//       />

//       <div className="bg-gray-50 py-8 md:py-12">
//         <div className="px-4 sm:px-[32px]">
//           {/* FILTERS */}
//           <div id="filters-section" className="mb-8" ref={filterSectionRef}>
//             <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
//               {/* LEFT: category + price */}
//               <div className="flex justify-between gap-4 sm:flex-row">
//                 {/* category */}
//                 <div className="flex flex-col items-start gap-2">
//                   <span className="text-sm font-medium tracking-wide text-gray-400 uppercase">
//                     Categories
//                   </span>
//                   <Select
//                     value={filters.categoryId || "all"}
//                     onValueChange={handleCategoryChange}
//                     disabled={categoriesQuery.isLoading}
//                   >
//                     <SelectTrigger className="text-blue border-blue h-16 w-[130px] rounded-full px-4 disabled:opacity-50 sm:w-[280px]">
//                       <div className="flex items-center gap-2">
//                         {categoriesQuery.isLoading && (
//                           <Loader2Icon className="h-4 w-4 animate-spin" />
//                         )}
//                         <SelectValue placeholder="Select" />
//                       </div>
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">All Categories</SelectItem>
//                       {categoriesQuery.data?.map((cat) => (
//                         <SelectItem key={cat.id} value={cat.id}>
//                           {cat.name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {/* price */}
//                 <div className="flex flex-col items-start gap-2">
//                   <span className="text-sm font-medium tracking-wide text-gray-400 uppercase">
//                     Prices
//                   </span>
//                   <Select
//                     value={filters.priceRange}
//                     onValueChange={actions.setPriceRange}
//                     disabled={isFiltering}
//                   >
//                     <SelectTrigger className="text-blue border-blue h-16 w-[130px] rounded-full px-4 disabled:opacity-50 sm:w-[280px]">
//                       <SelectValue placeholder="Select" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">All Prices</SelectItem>
//                       <SelectItem value="under-500">Under £500</SelectItem>
//                       <SelectItem value="500-1000">£500 - £1000</SelectItem>
//                       <SelectItem value="1000-2000">
//                         £1000 - £2000
//                       </SelectItem>
//                       <SelectItem value="over-2000">Over £2000</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               {/* RIGHT: sort + view mode */}
//               <div className="flex items-center gap-6">
//                 <Select
//                   value={filters.sortBy}
//                   onValueChange={actions.setSortBy}
//                   disabled={isFiltering}
//                 >
//                   <SelectTrigger className="flex h-auto w-auto items-center gap-1 border-0 bg-transparent p-0 shadow-none">
//                     <span className="text-sm font-medium text-[#999]">
//                       Sort By
//                     </span>
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="price_low_high">
//                       Price: Low to High
//                     </SelectItem>
//                     <SelectItem value="price_high_low">
//                       Price: High to Low
//                     </SelectItem>
//                     <SelectItem value="rating">Top Rated</SelectItem>
//                     <SelectItem value="created_at">Newest</SelectItem>
//                   </SelectContent>
//                 </Select>

//                 {/* view mode buttons */}
//                 <div className="hidden items-center lg:flex">
//                   {["grid", "grid-small", "list", "list-detailed"].map(
//                     (mode) => (
//                       <button
//                         key={mode}
//                         onClick={() => setViewMode(mode)}
//                         className="border-gray border p-3"
//                       >
//                         <Image
//                           src={
//                             viewMode === mode
//                               ? `/l-${
//                                   mode === "grid"
//                                     ? "11"
//                                     : mode === "grid-small"
//                                       ? "22"
//                                       : mode === "list"
//                                         ? "33"
//                                         : "44"
//                                 }.png`
//                               : `/l-${
//                                   mode === "grid"
//                                     ? "1"
//                                     : mode === "grid-small"
//                                       ? "2"
//                                       : mode === "list"
//                                         ? "3"
//                                         : "4"
//                                 }.png`
//                           }
//                           alt={mode}
//                           width={20}
//                           height={20}
//                         />
//                       </button>
//                     ),
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* PRODUCTS GRID */}
//           {showLoading ? (
//             <div className="grid grid-cols-2 gap-6 md:grid-cols-2 lg:grid-cols-3">
//               {Array.from({ length: 12 }).map((_, i) => (
//                 <div
//                   key={i}
//                   className="h-96 animate-pulse rounded-lg bg-gray-200"
//                 />
//               ))}
//             </div>
//           ) : displayProducts.length > 0 ? (
//             <div
//               className={cn("grid gap-6", {
//                 "grid-cols-2 lg:grid-cols-3": viewMode === "grid",
//                 "grid-cols-2 md:grid-cols-3 lg:grid-cols-4":
//                   viewMode === "grid-small",
//                 "grid-cols-2 md:grid-cols-2": viewMode === "list",
//                 "grid-cols-1": viewMode === "list-detailed",
//               })}
//             >
//               {displayProducts.map((product, index) => {
//                 const discount = Number(product.discount) || 0;
//                 const originalPrice = product.price;

//                 // discounted price shown to customer
//                 const discountedPrice =
//                   discount > 0
//                     ? parseFloat(
//                         (
//                           originalPrice -
//                           (originalPrice * discount) / 100
//                         ).toFixed(2),
//                       )
//                     : originalPrice;

//                 return (
//                   <ProductCard
//                     key={product.id}
//                     variant={index % 2 === 0 ? "layout1" : "layout2"}
//                     id={product.id}
//                     name={product.name}
//                     price={discountedPrice}
//                     originalPrice={
//                       discount > 0 ? originalPrice : undefined
//                     }
//                     discount={
//                       discount > 0 ? `${discount}% off` : undefined
//                     }
//                     imageSrc={product.image}
//                     rating={product.rating ?? 4.9}
//                     deliveryInfo={product.deliveryInfo}
//                     paymentOption={{
//                       service: "Klarna",
//                       installments: 3,
//                       amount:
//                         Math.round((discountedPrice / 3) * 100) / 100,
//                     }}
//                     isSale={discount > 0}
//                     className={
//                       viewMode === "list-detailed"
//                         ? "list-detailed-view"
//                         : ""
//                     }
//                     variantId={product.variantId}
//                     size={product.size}
//                     color={product.color}
//                     stock={product.stock}
//                     assemble_charges={product.assemble_charges ?? 0}
//                   />
//                 );
//               })}
//             </div>
//           ) : (
//             <div className="rounded-lg border bg-white py-12 text-center">
//               <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="48"
//                   height="48"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                 >
//                   <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
//                 </svg>
//               </div>
//               <h3 className="text-lg font-medium">No products found</h3>
//               <p className="mx-auto mt-2 max-w-md text-gray-500">
//                 {isSearchMode
//                   ? `No results for "${filters.search}". Try different keywords.`
//                   : "Try adjusting your filters."}
//               </p>
//               <Button
//                 variant="primary"
//                 size="md"
//                 className="mt-4"
//                 onClick={actions.resetFilters}
//               >
//                 Reset Filters
//               </Button>
//             </div>
//           )}

//           {/* PAGINATION (only when NOT in search mode) */}
//           {!isSearchMode && !isProductsLoading && totalPages > 1 && (
//             <div className="mt-12 flex items-center justify-center gap-2">
//               <Button
//                 variant="outline"
//                 size="md"
//                 onClick={() => {
//                   actions.setCurrentPage(
//                     Math.max(1, filters.currentPage - 1),
//                   );
//                   filterSectionRef.current?.scrollIntoView({
//                     behavior: "smooth",
//                   });
//                 }}
//                 disabled={filters.currentPage === 1}
//               >
//                 Previous
//               </Button>

//               <div className="flex gap-1">
//                 {Array.from(
//                   { length: Math.min(5, totalPages) },
//                   (_, i) => {
//                     const page =
//                       Math.max(
//                         1,
//                         Math.min(
//                           totalPages - 4,
//                           filters.currentPage - 2,
//                         ),
//                       ) + i;
//                     if (page > totalPages) return null;
//                     return (
//                       <Button
//                         key={page}
//                         variant={
//                           filters.currentPage === page
//                             ? "primary"
//                             : "outline"
//                         }
//                         size="sm"
//                         onClick={() => {
//                           actions.setCurrentPage(page);
//                           filterSectionRef.current?.scrollIntoView({
//                             behavior: "smooth",
//                           });
//                         }}
//                         className="h-10 w-10 p-0"
//                       >
//                         {page}
//                       </Button>
//                     );
//                   },
//                 )}
//               </div>

//               <Button
//                 variant="outline"
//                 size="md"
//                 onClick={() => {
//                   actions.setCurrentPage(
//                     Math.min(totalPages, filters.currentPage + 1),
//                   );
//                   filterSectionRef.current?.scrollIntoView({
//                     behavior: "smooth",
//                   });
//                 }}
//                 disabled={filters.currentPage === totalPages}
//               >
//                 Next
//               </Button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// //  WRAPPER WITH SUSPENSE
// // ─────────────────────────────────────────────────────────────────

// export default function ProductsPage() {
//   return (
//     <Suspense fallback={<ProductsLoading />}>
//       <ProductsContent />
//     </Suspense>
//   );
// }








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

// ─────────────────────────────────────────────────────────────────
//  INTERFACES
// ─────────────────────────────────────────────────────────────────

interface PageProduct {
  id: string | number;
  name: string;
  // finalPrice = the sale price to display and send to cart
  finalPrice: number;
  // originalPrice = the "was" price to show struck-through (undefined if no discount)
  originalPrice?: number;
  deliveryInfo: string;
  category?: string;
  type?: string;
  rating?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  isSale?: boolean;
  discountLabel?: string;
  image?: string;
  variantId?: string;
  size?: string;
  color?: string;
  stock?: number;
  assemble_charges: number;
}

// ─────────────────────────────────────────────────────────────────
//  PRICE HELPERS
//
//  Backend stores:
//    variant.price             = BASE price
//    variant.compare_price     = "was" price (higher), struck-through
//    variant.discount_percentage = direct % off base price
//    product.discount_offer    = product-level % fallback
//
//  These helpers are IDENTICAL to what cart-store uses so prices
//  are always consistent between listing, detail, and cart.
// ─────────────────────────────────────────────────────────────────

/**
 * Returns the discount % to display (0 if no discount).
 * Priority: compare_price → discount_percentage → product.discount_offer
 */
const getDiscountPct = (
  variant: any,
  productDiscountOffer?: number,
): number => {
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

/**
 * Returns the final sale price to show and pass to cart.
 * Matches resolveDisplayPrice in cart-store exactly.
 */
const getSalePrice = (variant: any, discountPct: number): number => {
  if (discountPct <= 0) return variant.price;
  const sale = variant.price - (variant.price * discountPct) / 100;
  return Math.round(sale * 100) / 100;
};

/**
 * Returns the "was" price to show struck-through.
 * For compare_price: the compare_price itself is the "was" price.
 * For discount_percentage / discount_offer: the base variant.price is the "was" price.
 */
const getOriginalPrice = (variant: any, discountPct: number): number | undefined => {
  if (discountPct <= 0) return undefined;
  if (variant?.compare_price && variant.compare_price > variant.price) {
    return variant.compare_price;
  }
  return variant.price;
};

// ─────────────────────────────────────────────────────────────────
//  HELPER: pick the default variant to display for a product
//  Priority: featured → oldest (first created_at)
//  Discount / compare_price does NOT influence which variant is picked.
// ─────────────────────────────────────────────────────────────────

const pickBestVariant = (variants: any[]): any | null => {
  if (!variants || variants.length === 0) return null;

  const featured = variants.find((v) => v.featured);
  if (featured) return featured;

  return [...variants].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )[0];
};

// ─────────────────────────────────────────────────────────────────
//  BUILD PageProduct from a raw API/search product
// ─────────────────────────────────────────────────────────────────

const buildPageProduct = (
  product: any,
  selectedVariant: any,
  imageUrl: string,
): PageProduct => {
  const discountPct = getDiscountPct(selectedVariant, product.discount_offer);
  const finalPrice = selectedVariant
    ? getSalePrice(selectedVariant, discountPct)
    : product.base_price;
  const originalPrice = selectedVariant
    ? getOriginalPrice(selectedVariant, discountPct)
    : undefined;

  return {
    id: product.id,
    name: product.name ?? "Product",
    finalPrice,
    originalPrice,
    deliveryInfo:
      selectedVariant?.delivery_time_days ??
      product.delivery_info?.text ??
      "3 To 4 Days Delivery",
    category: product.category?.name,
    type: product.category?.name,
    rating: 4.9,
    inStock: selectedVariant ? selectedVariant.stock > 0 : true,
    isFeatured: selectedVariant?.featured,
    isNew: false,
    isSale: discountPct > 0,
    discountLabel: discountPct > 0 ? `${discountPct}% off` : undefined,
    image: imageUrl,
    variantId: selectedVariant?.id,
    size: selectedVariant?.size,
    color: selectedVariant?.color,
    stock: selectedVariant?.stock,
    assemble_charges: selectedVariant?.assemble_charges ?? 0,
  };
};

// ─────────────────────────────────────────────────────────────────
//  MAIN PRODUCTS CONTENT COMPONENT
// ─────────────────────────────────────────────────────────────────

function ProductsContent() {
  const { filters, actions, isLoading: isFiltering } =
    useProductsPageFilters();
  const [viewMode, setViewMode] = useState("grid");
  const filterSectionRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 12;

  const categoriesQuery = useCategories();
  const { filteredResults, isInitialized } = useSearchStore();

  // ── search mode detection ──────────────────────────────────────
  const isSearchMode =
    !!filters.search && filters.search.trim().length >= 2;
  const [searchProducts, setSearchProducts] = useState<PageProduct[]>([]);

  // ── search mode: transform + filter + sort locally ─────────────
  useEffect(() => {
    if (isSearchMode && isInitialized && filteredResults.length > 0) {
      let transformed = filteredResults.map((result): PageProduct => {
        const selectedVariant = pickBestVariant(result.variants ?? []);
        const mainImage = result.images?.find((i: any) => i.type === "main");
        const firstImage = result.images?.[0];
        const imageUrl =
          mainImage?.url || firstImage?.url || "/placeholder.svg";
        return buildPageProduct(result, selectedVariant, imageUrl);
      });

      // apply category filter
      if (filters.categoryId && filters.categoryId !== "all") {
        const selectedCategoryName = categoriesQuery.data
          ?.find((c) => c.id === filters.categoryId)
          ?.name?.toLowerCase();
        if (selectedCategoryName) {
          transformed = transformed.filter(
            (p) => p.category?.toLowerCase() === selectedCategoryName,
          );
        }
      }

      // apply price filter (against finalPrice)
      if (filters.priceRange && filters.priceRange !== "all") {
        transformed = transformed.filter((p) => {
          const price = p.finalPrice;
          switch (filters.priceRange) {
            case "under-500":   return price < 500;
            case "500-1000":    return price >= 500 && price <= 1000;
            case "1000-2000":   return price >= 1000 && price <= 2000;
            case "over-2000":   return price > 2000;
            default:            return true;
          }
        });
      }

      // apply sort
      if (filters.sortBy) {
        transformed = [...transformed].sort((a, b) => {
          switch (filters.sortBy) {
            case "price_low_high":  return a.finalPrice - b.finalPrice;
            case "price_high_low":  return b.finalPrice - a.finalPrice;
            case "rating":          return (b.rating ?? 0) - (a.rating ?? 0);
            case "created_at":      return b.id.toString().localeCompare(a.id.toString());
            default:                return 0;
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

  // ── API call (only when NOT in search mode) ────────────────────
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
    priceRange:
      filters.priceRange !== "all" ? filters.priceRange : undefined,
    sortBy: filters.sortBy || undefined,
    search: isSearchMode ? undefined : filters.search || undefined,
  });

  // ── marquee items ──────────────────────────────────────────────
  const marqueeItems = [
    { text: "10-YEARS GUARANTEE", icon: "/sofa-icon.png" },
    { text: "100-NIGHT TRIAL", icon: "/sofa-icon.png" },
    { text: "EASY RETURN", icon: "/sofa-icon.png" },
    { text: "FREE DELIVERY", icon: "/sofa-icon.png" },
    { text: "10-YEARS GUARANTEE", icon: "/sofa-icon.png" },
  ];

  const showLoading = isFiltering || (isProductsLoading && !isSearchMode);

  // ── transform API products (only when NOT in search mode) ──────
  const transformedApiProducts: PageProduct[] =
    !isSearchMode && apiProducts?.items
      ? apiProducts.items.map((product) => {
          // Pick default variant (featured → oldest). Discount does NOT influence this.
          let selectedVariant = pickBestVariant(product.variants ?? []);

          // If filtering by size/material, prefer the matching variant
          if (product.variants && product.variants.length > 0) {
            const sizeMatch = filters.size
              ? product.variants.find(
                  (v) => v.size?.toLowerCase() === filters.size?.toLowerCase(),
                )
              : null;
            const materialMatch = filters.material
              ? product.variants.find(
                  (v) =>
                    v.material?.toLowerCase() ===
                    filters.material?.toLowerCase(),
                )
              : null;
            if (sizeMatch || materialMatch) {
              selectedVariant = sizeMatch || materialMatch;
            }
          }

          const sortedImages = [...(product.images ?? [])].sort(
            (a, b) => (a.order ?? 0) - (b.order ?? 0),
          );
          const imageUrl =
            sortedImages.find((img) => img.type === "main")?.url ||
            sortedImages[0]?.url ||
            "/placeholder.svg";

          return buildPageProduct(product, selectedVariant, imageUrl);
        })
      : [];

  // ── final display products ─────────────────────────────────────
  const displayProducts = isSearchMode ? searchProducts : transformedApiProducts;
  const totalPages = isSearchMode ? 1 : apiProducts?.meta?.totalPages ?? 1;

  const handleCategoryChange = (categoryId: string) => {
    actions.setCategoryId(categoryId === "all" ? null : categoryId);
  };

  if (error && !isSearchMode) {
    return (
      <div className="container-1440 px-4 py-12">
        <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          <p>Error loading products. Please try again later.</p>
        </div>
      </div>
    );
  }

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
          {/* FILTERS */}
          <div id="filters-section" className="mb-8" ref={filterSectionRef}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex justify-between gap-4 sm:flex-row">
                {/* category */}
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

                {/* price */}
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

              {/* sort + view mode */}
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
                    <SelectItem value="price_low_high">Price: Low to High</SelectItem>
                    <SelectItem value="price_high_low">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                    <SelectItem value="created_at">Newest</SelectItem>
                  </SelectContent>
                </Select>

                <div className="hidden items-center lg:flex">
                  {["grid", "grid-small", "list", "list-detailed"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className="border-gray border p-3"
                    >
                      <Image
                        src={
                          viewMode === mode
                            ? `/l-${mode === "grid" ? "11" : mode === "grid-small" ? "22" : mode === "list" ? "33" : "44"}.png`
                            : `/l-${mode === "grid" ? "1" : mode === "grid-small" ? "2" : mode === "list" ? "3" : "4"}.png`
                        }
                        alt={mode}
                        width={20}
                        height={20}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* PRODUCTS GRID */}
          {showLoading ? (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-96 animate-pulse rounded-lg bg-gray-200" />
              ))}
            </div>
          ) : displayProducts.length > 0 ? (
            <div
              className={cn("grid gap-6", {
                "grid-cols-2 lg:grid-cols-3": viewMode === "grid",
                "grid-cols-2 md:grid-cols-3 lg:grid-cols-4": viewMode === "grid-small",
                "grid-cols-2 md:grid-cols-2": viewMode === "list",
                "grid-cols-1": viewMode === "list-detailed",
              })}
            >
              {displayProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  variant={index % 2 === 0 ? "layout1" : "layout2"}
                  id={product.id}
                  name={product.name}
                  // finalPrice is passed as `price` — this is what
                  // goes into the cart. It is already the sale price.
                  price={product.finalPrice}
                  originalPrice={product.originalPrice}
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
                  className={viewMode === "list-detailed" ? "list-detailed-view" : ""}
                  variantId={product.variantId}
                  size={product.size}
                  color={product.color}
                  stock={product.stock}
                  assemble_charges={product.assemble_charges ?? 0}
                />
              ))}
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

          {/* PAGINATION */}
          {!isSearchMode && !isProductsLoading && totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  actions.setCurrentPage(Math.max(1, filters.currentPage - 1));
                  filterSectionRef.current?.scrollIntoView({ behavior: "smooth" });
                }}
                disabled={filters.currentPage === 1}
              >
                Previous
              </Button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page =
                    Math.max(1, Math.min(totalPages - 4, filters.currentPage - 2)) + i;
                  if (page > totalPages) return null;
                  return (
                    <Button
                      key={page}
                      variant={filters.currentPage === page ? "primary" : "outline"}
                      size="sm"
                      onClick={() => {
                        actions.setCurrentPage(page);
                        filterSectionRef.current?.scrollIntoView({ behavior: "smooth" });
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
                  actions.setCurrentPage(Math.min(totalPages, filters.currentPage + 1));
                  filterSectionRef.current?.scrollIntoView({ behavior: "smooth" });
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

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsContent />
    </Suspense>
  );
}