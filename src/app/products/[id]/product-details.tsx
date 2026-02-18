"use client";

import React, { useState } from "react";
import "@/components/ui/modern-image-gallery.css";
import { useProduct, useRelatedProducts } from "@/hooks/use-products";
import { useCartAnimationStore, useCartStore } from "@/lib/store/cart-store";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/button-custom";
import { MarqueeStrip } from "@/components/marquee-strip";
import { Testimonials } from "@/components/landing-page/testimonials";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChevronRight, Package, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product-card";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import ViewInRoom from "../components/view-in-room";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInView } from "@/hooks/use-in-view";
// import { de } from "zod/v4/locales";

// Extended ProductVariant interface to include all possible properties
interface ExtendedProductVariant {
  id: string;
  product_id: string;
  sku: string;
  price: number;
  color?: string;
  size?: string;
  material?: string;
  stock: number;
  images?: {
    url: string;
    order: number;
    variant_id: string | null;
    created_at?: string;
    updated_at?: string;
  }[];
  created_at?: string;
  updated_at?: string;
  dimensions?: {
    width?: { cm: number; inches: number };
    depth?: { cm: number; inches: number };
    height?: { cm: number; inches: number };
    seat_width?: { cm: number; inches: number };
    seat_depth?: { cm: number; inches: number };
    seat_height?: { cm: number; inches: number };
    bed_width?: { cm: number; inches: number };
    bed_length?: { cm: number; inches: number };
  };
  payment_options?: Array<{
    provider: string;
    type: string;
    installments?: number;
    amount_per_installment?: number;
    total_amount?: number;
    amount?: number;
    description?: string;
  }>;
}

interface ProductDetailsProps {
  productId: string;
}

// Type guard functions
function hasExtendedProperties(
  variant: unknown
): variant is ExtendedProductVariant {
  return (
    variant !== null &&
    typeof variant === "object" &&
    "id" in variant &&
    "color" in variant &&
    "size" in variant &&
    "material" in variant &&
    "stock" in variant &&
    "price" in variant
  );
}

function hasPaymentOptions(
  variant: unknown
): variant is ExtendedProductVariant & {
  payment_options: NonNullable<ExtendedProductVariant["payment_options"]>;
} {
  return (
    hasExtendedProperties(variant) &&
    Array.isArray(variant.payment_options) &&
    variant.payment_options.length > 0
  );
}

function hasDimensions(variant: unknown): variant is ExtendedProductVariant & {
  dimensions: NonNullable<ExtendedProductVariant["dimensions"]>;
} {
  return Boolean(
    hasExtendedProperties(variant) &&
      variant.dimensions &&
      typeof variant.dimensions === "object"
  );
}

interface DimensionItem {
  label: string;
  cm: string | number;
  inches: string | number;
  letter: string;
}

const marqueeItems = [
  { text: "10-YEARS GUARANTEE", icon: "/sofa-icon.png" },
  { text: "100-NIGHT TRAIL", icon: "/sofa-icon.png" },
  { text: "EASY RETURN", icon: "/sofa-icon.png" },
  { text: "FREE DELIVERY", icon: "/sofa-icon.png" },
];

export default function ProductDetails({ productId }: ProductDetailsProps) {
  const isMobile = useIsMobile();
  const { targetRef: featuresRef, isIntersecting: featuresInView } = useInView({
    threshold: 0.1,
  });

  const {
    data: product,
    isLoading,
    error,
  } = useProduct(productId, {
    includeVariants: true,
    includeImages: true,
    includeCategory: true,
  });

  const { data: relatedProducts } = useRelatedProducts(productId, {
    limit: 4,
    includeCategory: true,
  });

  // Variant selection states
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  // UI states
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showViewInRoom, setShowViewInRoom] = useState(false);
  const [selectedTab, setSelectedTab] = useState("images");
  const [showMobileOptionsSheet, setShowMobileOptionsSheet] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const { isInWishlist, toggleItem } = useWishlistStore();

  // Create variants from images and product data since API doesn't include variants array
  const createVariantsFromImages = React.useCallback(() => {
    if (!product?.images) return [];

    // Group images by variant_id to identify variants
    const variantGroups = product.images.reduce(
      (acc, image) => {
        if (image.variant_id) {
          if (!acc[image.variant_id]) {
            acc[image.variant_id] = [];
          }
          acc[image.variant_id].push(image);
        }
        return acc;
      },
      {} as Record<
        string,
        {
          url: string;
          order: number;
          variant_id: string | null;
          created_at?: string;
          updated_at?: string;
        }[]
      >
    );

    // Create variant objects from image groups
    const variants = Object.entries(variantGroups).map(
      ([variantId, images]) => {
        // Extract color from image URL or filename
        const firstImage = images[0];
        let color = "Unknown";

        // Try to extract color from URL
        const urlLower = firstImage.url.toLowerCase();
        if (urlLower.includes("grey") || urlLower.includes("gray"))
          color = "Grey";
        else if (urlLower.includes("beige")) color = "Beige";
        else if (urlLower.includes("mocha")) color = "Mocha";
        else if (urlLower.includes("cream")) color = "Cream";
        else if (urlLower.includes("black")) color = "Black";
        else if (urlLower.includes("white")) color = "White";
        else if (urlLower.includes("blue")) color = "Blue";
        else if (urlLower.includes("red")) color = "Red";
        else if (urlLower.includes("brown")) color = "Brown";
        else if (urlLower.includes("green")) color = "Green";

        return {
          id: variantId,
          product_id: product.id,
          sku: `${product.name}-${color}`.replace(/\s+/g, "-"),
          price: product.base_price,
          color: color,
          delivery_time_days: "3 To 4 Days Delivery", // Default delivery time
          size: "Standard", // Default size since not specified in current data
          material: "Premium Fabric", // Default material
          stock: 10, // Default stock
          images: images.sort((a, b) => a.order - b.order),
          created_at: firstImage.created_at,
          updated_at: firstImage.updated_at,
          assemble_charges: 0,
        };
      }
    );

    return variants;
  }, [product]);

  const allVariants = React.useMemo(() => {
    // First check if we have actual variants from the API
    if (product?.variants && product.variants.length > 0) {
      return product.variants;
    }

    // If no variants but we have images with variant_id, create variants from images
    if (product?.images && product.images.some((img) => img.variant_id)) {
      return createVariantsFromImages();
    }

    // If no variants and no variant-specific images, create a default variant
    if (product) {
      return [
        {
          id: `default-${product.id}`,
          product_id: product.id,
          sku: `${product.name.replace(/\s+/g, "-")}-default`,
          price: product.base_price,
          color: "Default",
          size: "Standard",
          material: "Premium Fabric",
          delivery_time_days: "3 To 4 Days Delivery",
          stock: 10,
          images: product.images?.filter((img) => !img.variant_id) || [],
          assemble_charges: 0,
        },
      ];
    }

    return [];
  }, [product, createVariantsFromImages]);

  // Initialize variant selections when product loads
  React.useEffect(() => {
    if (allVariants && allVariants.length > 0 && !selectedVariant) {
      const firstAvailableVariant =
        allVariants.find((v) => v.stock > 0) || allVariants[0];

      if (firstAvailableVariant) {
        setSelectedColor(firstAvailableVariant.color || null);
        setSelectedSize(firstAvailableVariant.size || null);
        setSelectedMaterial(firstAvailableVariant.material || null);
        setSelectedVariant(firstAvailableVariant.id);
      }
    }
  }, [allVariants, selectedVariant]);

  // Get all unique options from variants
  const uniqueColors = [
    ...new Set((allVariants || []).map((v) => v.color).filter(Boolean)),
  ];
  const uniqueSizes = [
    ...new Set((allVariants || []).map((v) => v.size).filter(Boolean)),
  ];
  const uniqueMaterials = [
    ...new Set(
      (allVariants || [])
        .map((v) => v.material || "No Material")
        .filter(Boolean)
    ),
  ];

  // Find current variant based on selections
  const getCurrentVariant = React.useCallback(() => {
    if (!allVariants || allVariants.length === 0) return null;

    if (!selectedColor && !selectedSize && !selectedMaterial) {
      return allVariants.find((v) => v.stock > 0) || allVariants[0];
    }

    const currentVariant = allVariants.find(
      (v) =>
        (!selectedColor || v.color === selectedColor) &&
        (!selectedSize || v.size === selectedSize) &&
        (!selectedMaterial ||
          v.material === selectedMaterial ||
          (selectedMaterial === null && v.material === null) ||
          (selectedMaterial === "No Material" && v.material === null))
    );

    if (currentVariant) {
      if (!currentVariant.delivery_time_days) {
        currentVariant.delivery_time_days = "3 To 4 Days Delivery";
      }

      return currentVariant;
    }
  }, [allVariants, selectedColor, selectedSize, selectedMaterial]);

  const currentVariant = getCurrentVariant();

  // Current variant data with dynamic updates
  const selectedVariantData = currentVariant;
  const currentVariantId = currentVariant?.id || product?.variants?.[0]?.id;
  const currentPrice = currentVariant?.price || product?.base_price || 0;
  const currentStock = currentVariant?.stock || 0;

  // Enhanced image handling for all variant images
  const getAllImages = React.useMemo(() => {
    if (!product?.images)
      return {
        all: [],
        main: [],
        byVariant: {} as Record<
          string,
          {
            url: string;
            order: number;
            variant_id?: string;
            created_at?: string;
            updated_at?: string;
          }[]
        >,
      };

    // Get all images and organize them
    const allImages = [...product.images];

    // Separate main product images (variant_id = null) and variant images
    const mainImages = allImages
      .filter((img) => !img.variant_id)
      .sort((a, b) => (a.order || 0) - (b.order || 0)); // Sort main images by order

    const variantImages = allImages.filter((img) => img.variant_id);

    // Group variant images by variant_id and sort each group by order
    const byVariant = variantImages.reduce(
      (acc, img) => {
        if (img.variant_id && !acc[img.variant_id]) acc[img.variant_id] = [];
        if (img.variant_id) acc[img.variant_id].push(img);
        return acc;
      },
      {} as Record<
        string,
        {
          url: string;
          order: number;
          variant_id: string | null;
          created_at?: string;
          updated_at?: string;
        }[]
      >
    );

    // Sort images within each variant group by order
    Object.keys(byVariant).forEach((variantId) => {
      byVariant[variantId].sort((a, b) => (a.order || 0) - (b.order || 0));
    });

    // Now, add fallback for variants without images
    // You might have variants which don't appear as keys in byVariant, add main images for them
    // or, when you use byVariant, check if key exists, else use mainImages.

    return {
      all: allImages,
      main: mainImages,
      byVariant,
    };
  }, [product?.images]);

  // Use the current variant's images for display
  const variantImages = React.useMemo(() => {
    if (!currentVariant?.id) return [];
    return getAllImages.byVariant[currentVariant.id] || [];
  }, [currentVariant?.id, getAllImages]);

  const hasVariantImages = variantImages.length > 0;

  const displayImages = hasVariantImages ? variantImages : getAllImages.main;

  // Update image index when color changes (not size/material)
  React.useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedColor]);

  const isWishlisted = isInWishlist(currentVariantId || "");
  const { addToCart } = useCartAnimationStore();

  const handleAddToCart = () => {
  addToCart({ item: "item added" });

  if (product && currentVariant && currentStock > 0) {
    const productImage = displayImages.length > 0 ? displayImages[0].url : undefined;

    // Build variant description
    const variantParts = [];
    if (selectedColor) variantParts.push(selectedColor);
    if (selectedSize) variantParts.push(selectedSize);
    if (selectedMaterial) variantParts.push(selectedMaterial);
    const variantDescription =
      variantParts.length > 0 ? ` - ${variantParts.join(", ")}` : "";

    // Calculate final price after discount
    const finalPrice = product.discount_offer && product.discount_offer > 0
      ? Math.round(currentPrice * (1 - product.discount_offer / 100) * 100) / 100
      : currentPrice;

    addItem({
      id: currentVariant.id,
      name: `${product.name}${variantDescription}`,
      price: finalPrice, // ✅ discounted price
      image: productImage,
      variant_id: currentVariant.id,
      color: selectedColor || currentVariant.color,
      assembly_required: false,
      assemble_charges: currentVariant.assemble_charges || 0,
      variant: {
        color: selectedColor || currentVariant.color,
        size: selectedSize || currentVariant.size,
        material: selectedMaterial || currentVariant.material,
        sku: currentVariant.sku,
      },
    });
  }
};


  const handleWishlistToggle = async () => {
    if (currentVariantId && product && currentVariant) {
      try {
        // Build variant description for wishlist
        const variantParts = [];
        if (selectedColor) variantParts.push(selectedColor);
        if (selectedSize) variantParts.push(selectedSize);
        if (selectedMaterial) variantParts.push(selectedMaterial);
        const variantDescription =
          variantParts.length > 0 ? ` - ${variantParts.join(", ")}` : "";

        await toggleItem(currentVariantId, {
          name: `${product.name}${variantDescription}`,
          price: currentPrice,
          image: displayImages[0]?.url || product.images?.[0]?.url,
          variant_id: currentVariantId,
        });
      } catch (error) {
        console.error("Failed to toggle wishlist item:", error);
      }
    }
  };

  // Dynamic color mapping - only for colors that exist in variants
  const getColorHex = (colorName: string): string => {
    const colorMap: Record<string, string> = {
      Black: "#000000",
      White: "#FFFFFF",
      Gray: "#808080",
      Grey: "#808080",
      Brown: "#8B4513",
      Beige: "#F5F5DC",
      Navy: "#000080",
      Blue: "#0000FF",
      Green: "#008000",
      Red: "#FF0000",
      Pink: "#FFC0CB",
      Purple: "#800080",
      Orange: "#FFA500",
      Yellow: "#FFFF00",
      Cream: "#FFFDD0",
      Charcoal: "#36454F",
      Emerald: "#50C878",
      Burgundy: "#800020",
      Teal: "#008080",
      Olive: "#808000",
      Maroon: "#800000",
    };
    return colorMap[colorName] || "#000000";
  };

  // Update selected variant when filters change
  React.useEffect(() => {
    const variant = getCurrentVariant();
    if (variant && variant.id !== selectedVariant) {
      setSelectedVariant(variant.id);
    }
  }, [
    selectedColor,
    selectedSize,
    selectedMaterial,
    getCurrentVariant,
    selectedVariant,
  ]);

  const handleScrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === displayImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const toggleViewInRoom = () => {
    setShowViewInRoom(!showViewInRoom);
  };

  const getDeliveryDetails = () => {
    if (!currentVariant) {
      return "Not Available";
    }

    return (
      currentVariant.delivery_time_days ||
      product?.delivery_info?.text ||
      "3 To 4 Days Delivery"
    );
  };

  if (isLoading) {
    return (
      <div className="px-2 py-12 md:px-[32px]">
        <div className="flex h-[400px] items-center justify-center">
          <div className="text-center">
            <Image
              src="/favicon.ico"
              alt="Loading"
              width={48}
              height={48}
              className="text-muted-foreground mx-auto mb-4 h-12 w-12 animate-pulse"
            />
            <p className="text-lg font-medium">Loading product details...</p>
            <p className="text-muted-foreground text-sm">
              Please wait while we fetch the information
            </p>
          </div>
        </div>
      </div>
    );
  }
  if (error || !product) {
    return (
      <div className="mx-auto mt-10 px-2 py-12 md:px-[32px]">
        <Card className="mx-auto max-w-md">
          <CardContent className="p-8 text-center">
            <Package className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">Product Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The product you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
            <Button variant="primary">
              <Link href="/products">Browse All Products</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tabList = [
    { key: "images", label: "Images", section: "style" },
    // { key: "style", label: "Style", section: "style" },
    { key: "dimensions", label: "Dimensions", section: "dimensions" },
    { key: "material", label: "Material", section: "material" },
    { key: "recommended", label: "Recommended", section: "recommended" },
    { key: "reviews", label: "Reviews", section: "reviews" },
  ];

  return (
    <div className="w-full overflow-hidden">
      {/* Sticky Action Buttons - Mobile & Desktop */}
      <div
        className={cn(
          "fixed right-0 bottom-0 left-0 z-50 block border-t border-gray-200 bg-white px-3 py-2 shadow-lg sm:px-4 sm:py-3 md:hidden",
          {
            hidden: featuresInView,
          }
        )}
      >
        <div className="mx-auto flex max-w-7xl gap-2 sm:gap-3">
          {/* Asked to be removed */}
          {/* <Button
            onClick={handleAddToCart}
            disabled={currentStock === 0}
            variant="outline"
            size="sm"
            rounded="full"
            className="group !border-blue hover:border-dark-gray relative flex-1 items-center justify-start !border-1 hover:bg-transparent text-xs sm:text-sm sm:size-lg"
            icon={
              <Image
                src="/arrow-right1.png"
                alt="arrow-right"
                width={20}
                height={20}
                className="bg-blue group-hover:bg-dark-gray absolute top-1/2 right-1 sm:right-2 h-5 w-5 sm:h-6 sm:w-6 -translate-y-1/2 rounded-full object-contain p-1"
              />
            }
          >
            Shop Now
          </Button> */}
          <Button
            onClick={handleAddToCart}
            disabled={currentStock === 0 || !currentVariant}
            variant="primary"
            size="sm"
            rounded="full"
            className={cn(
              "sm:size-lg relative mx-auto max-w-[75%] flex-1 items-center justify-start py-4 text-xs sm:text-sm",
              currentStock === 0 || !currentVariant
                ? "cursor-not-allowed opacity-50"
                : ""
            )}
            icon={
              <Image
                src="/arrow-right.png"
                alt="arrow-right"
                width={20}
                height={20}
                className={cn(
                  "absolute top-1/2 right-1 h-5 w-5 -translate-y-1/2 rounded-full bg-[#fff] object-contain p-1 sm:right-2 sm:h-6 sm:w-6",
                  currentStock === 0 || !currentVariant
                    ? "opacity-50"
                    : "text-blue"
                )}
              />
            }
          >
            {currentStock === 0
              ? "Out of Stock"
              : !currentVariant
                ? "Select Variant"
                : "Add To Cart"}
          </Button>
        </div>
      </div>

      {/* Main Content with bottom padding to account for sticky footer */}
      <div className="mt-10 px-4 py-8 md:px-[32px] lg:mt-0">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Homepage</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/products?categoryId=${product.category_id}`}>
                  {product.category?.name}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink className="font-medium">
                {product.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Product Details */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Mobile: Product Title First */}
          {isMobile && (
            <div className="flex items-center justify-between lg:hidden">
              <h1 className="text-dark-gray text-[32px] leading-tight uppercase md:text-[48px]">
                {product.name}
              </h1>
              <div>
                <Badge className="rounded-full bg-[#56748e] px-3 py-1 text-[14px] text-white md:px-6 md:py-2 md:text-[18px] lg:text-[20px]">
                  {getDeliveryDetails()}
                </Badge>
              </div>
            </div>
          )}

          {/* Product Image Gallery with Fixed Layout */}
          <div className="relative">
            <div className="flex gap-2 md:gap-4">
              {/* Main Image Gallery */}
              <div className="w-full flex-1 md:max-w-[calc(100%-80px)]">
                <div
                  className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-lg bg-gray-100"
                  onClick={toggleZoom}
                >
                  {displayImages && displayImages.length > 0 ? (
                    <>
                      <Image
                        src={
                          displayImages[currentImageIndex]?.url ||
                          "/placeholder.svg"
                        }
                        alt={`${product.name} - Image ${currentImageIndex + 1}`}
                        fill
                        className={cn(
                          "bg-white object-contain transition-transform duration-300",
                          isZoomed
                            ? "scale-150 cursor-zoom-out"
                            : "group-hover:scale-105"
                        )}
                      />
                      {/* Visual indicator for variant-specific images */}
                      {hasVariantImages && (
                        <div className="absolute top-2 left-2 z-10">
                          <div className="bg-blue/90 rounded-full px-2 py-1 text-xs font-medium text-white">
                            {currentVariant?.color || "Variant"} View
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      No image available
                    </div>
                  )}

                  {/* Zoom Overlay on Hover */}
                  {!isZoomed && (
                    <div className="bg-opacity-0 group-hover:bg-opacity-10 absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-all duration-300 group-hover:opacity-100">
                      <div className="bg-opacity-50 rounded-full px-3 py-1 text-sm font-medium text-white">
                        Click to zoom
                      </div>
                    </div>
                  )}

                  {/* Zoom Exit Button */}
                  {isZoomed && (
                    <div className="absolute top-4 right-4 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsZoomed(false);
                        }}
                        className="bg-opacity-50 hover:bg-opacity-70 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  {/* Wishlist Button for Small Screens */}
                  <div className="absolute top-4 right-4 z-10 md:hidden">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWishlistToggle();
                      }}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center transition-all",
                        isWishlisted
                          ? ""
                          : "border-white bg-white/90 backdrop-blur-sm"
                      )}
                    >
                      <Image
                        src={isWishlisted ? "/fav-filled.png" : "/fav.png"}
                        alt="Wishlist"
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    </button>
                  </div>
                </div>

                {/* Thumbnail Gallery */}
                {isMobile ? (
                  <div className="mt-4">
                    <div
                      className="flex gap-2 overflow-x-auto pb-2"
                      style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                      }}
                    >
                      {displayImages.map((image, index) => (
                        <button
                          key={`current-${index}`}
                          onClick={() => setCurrentImageIndex(index)}
                          className={cn(
                            "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                            currentImageIndex === index
                              ? "border-blue border-2"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          <Image
                            src={image.url}
                            alt={`${product.name} - Thumbnail ${index + 1}`}
                            fill
                            className="bg-white object-contain"
                          />
                          {hasVariantImages && (
                            <div className="absolute top-1 right-1">
                              <div className="bg-blue h-2 w-2 rounded-full border border-white"></div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {displayImages.map((image, index) => (
                        <button
                          key={`current-${index}`}
                          onClick={() => setCurrentImageIndex(index)}
                          className={cn(
                            "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 bg-white transition-all",
                            currentImageIndex === index
                              ? "ring-offset-1"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          <Image
                            src={image.url}
                            alt={`${product.name} - Thumbnail ${index + 1}`}
                            fill
                            className="bg-white object-contain"
                          />
                          {hasVariantImages && (
                            <div className="absolute top-1 right-1">
                              <div className="bg-blue h-2 w-2 rounded-full border border-white"></div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Fixed Action Buttons Column */}
              <div className="hidden h-[400px] w-12 flex-shrink-0 flex-col items-center justify-between gap-2 md:flex md:h-[500px] md:w-16 md:gap-3 2xl:h-[600px]">
                <div className="space-y-1 md:space-y-2">
                  {/* <button className="bg-blue flex h-10 w-10 items-center justify-center rounded-full text-[12px] font-medium text-white md:h-12 md:w-12 md:text-[14px]">
                    360
                  </button> */}
                  <button
                    onClick={toggleViewInRoom}
                    className="bg-blue flex h-10 w-10 items-center justify-center rounded-full text-[6px] font-medium text-white md:h-12 md:w-12 md:text-[8px]"
                  >
                    View in <br /> Room
                  </button>
                  <button
                    onClick={handleWishlistToggle}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center md:h-12 md:w-12",
                      isWishlisted ? "border-red-200 bg-red-50" : "bg-white"
                    )}
                  >
                    <Image
                      src={isWishlisted ? "/fav-filled.png" : "/fav.png"}
                      alt="Wishlist"
                      width={40}
                      height={40}
                      className="object-contain md:h-[50px] md:w-[50px]"
                    />
                  </button>
                </div>
                <div>
                  {displayImages.length > 1 && (
                    <div className="flex flex-col gap-1 md:gap-2">
                      <button
                        onClick={prevImage}
                        className="group border-dark-gray hover:bg-blue flex h-8 w-8 items-center justify-center rounded-full border shadow-sm transition-all hover:border-white hover:shadow-md md:h-10 md:w-10"
                      >
                        <ChevronLeft className="text-dark-gray h-3 w-3 group-hover:text-white md:h-4 md:w-4" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="group border-dark-gray hover:bg-blue flex h-8 w-8 items-center justify-center rounded-full border shadow-sm transition-all hover:border-white hover:shadow-md md:h-10 md:w-10"
                      >
                        <ChevronRight className="text-dark-gray h-3 w-3 group-hover:text-white md:h-4 md:w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div className="space-y-3">
            {/* Desktop: Product Title */}
            {!isMobile && (
              <div>
                <h1 className="text-dark-gray text-[32px] leading-tight uppercase md:text-[48px] lg:text-[56px]">
                  {product.name}
                </h1>
                <div>
                  <Badge className="rounded-full bg-[#56748e] px-3 py-1 text-[14px] text-white md:px-6 md:py-2 md:text-[18px] lg:text-[20px]">
                    {getDeliveryDetails()}
                  </Badge>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center justify-between gap-8">
                  <div className="font-bebas flex items-baseline gap-2 md:gap-3">
                    {product.discount_offer && product.discount_offer > 0 ? (
                      <>
                        {/* Discounted price */}
                        <span className="text-dark-gray text-[28px] md:text-[36px] lg:text-[42px]">
                          £{(currentPrice * (1 - product.discount_offer / 100)).toFixed(2)}
                        </span>

                        {/* Original price struck-through */}
                        <span className="text-gray text-[20px] line-through md:text-[24px] lg:text-[30px]">
                          £{currentPrice.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="text-dark-gray text-[28px] md:text-[36px] lg:text-[42px]">
                        £{currentPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Klarna badge */}
                  <span className="w-fit rounded-full bg-[#FFA8CD] px-4 py-1 text-sm font-bold text-[#000] md:px-6 md:py-2">
                    Klarna
                  </span>
                </div>
              </div>
            </div>


            {/* Color Selection - Rounded Color Swatches */}
            {uniqueColors.length > 0 && (
              <div className="space-y-2">
                <span className="text-gray text-base">
                  Color - {selectedColor || "Select Color"}
                </span>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {uniqueColors.map((color) => {
                    const isSelected = selectedColor === color;
                    const colorCode = getColorHex(color);

                    // Check if this color has any available variants
                    const colorVariants = (allVariants || []).filter(
                      (v) => v.color === color && v.stock > 0
                    );
                    const isInStock = colorVariants.length > 0;

                    return (
                      <button
                        key={color}
                        onClick={() => {
                          if (isInStock) {
                            setSelectedColor(color);

                            // Auto-select first available size and material for this color
                            const colorVariants = (allVariants || []).filter(
                              (v) => v.color === color && v.stock > 0
                            );
                            if (colorVariants.length > 0) {
                              const firstVariant = colorVariants[0];
                              setSelectedSize(firstVariant.size || null);
                              setSelectedMaterial(
                                firstVariant.material || null
                              );
                            }
                          }
                        }}
                        disabled={!isInStock}
                        className={cn(
                          "relative h-7 w-7 rounded-full border-2 transition-all sm:h-8 sm:w-8",
                          isSelected
                            ? "ring-blue ring-1 ring-offset-1"
                            : isInStock
                              ? "border-gray-300 hover:border-gray-400"
                              : "cursor-not-allowed border-gray-200 opacity-50"
                        )}
                        style={{
                          backgroundColor: isInStock ? colorCode : "#f5f5f5",
                        }}
                        title={`${color}${!isInStock ? " (Out of Stock)" : ""}`}
                      >
                        {!isInStock && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-[1px] w-4 rotate-45 bg-red-500 sm:w-6"></div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Enhanced Size Selection */}
            {uniqueSizes.length > 0 && (
              <div className="space-y-3">
                <span className="text-gray text-base font-medium">
                  Size - {selectedSize || "Select Size"}
                </span>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {uniqueSizes.map((size) => {
                    const isSelected = selectedSize === size;

                    // Check if this size has any available variants
                    const sizeVariants = (allVariants || []).filter(
                      (v) => v.size === size && v.stock > 0
                    );
                    const isInStock = sizeVariants.length > 0;

                    return (
                      <button
                        key={size}
                        onClick={() => {
                          if (isInStock) {
                            setSelectedSize(size);

                            // Auto-select first available material for this size and current color
                            const sizeVariants = (allVariants || []).filter(
                              (v) =>
                                v.size === size &&
                                (!selectedColor || v.color === selectedColor) &&
                                v.stock > 0
                            );
                            if (sizeVariants.length > 0) {
                              const firstVariant = sizeVariants[0];
                              if (!selectedColor)
                                setSelectedColor(firstVariant.color || null);
                              setSelectedMaterial(
                                firstVariant.material || null
                              );
                            }
                          }
                        }}
                        disabled={!isInStock}
                        className={cn(
                          "relative rounded-lg border-2 px-3 py-2 text-xs font-medium transition-all sm:px-4 sm:text-sm",
                          isSelected
                            ? "border-blue bg-blue ring-blue text-white ring-2 ring-offset-2"
                            : isInStock
                              ? "border-gray-300 bg-white text-gray-700 hover:scale-105 hover:border-gray-400"
                              : "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                        )}
                        title={!isInStock ? `${size} (Out of Stock)` : size}
                      >
                        {size}
                        {!isInStock && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-[1px] w-4 rotate-45 bg-red-500 sm:w-6"></div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Enhanced Material Selection */}
            {uniqueMaterials.length > 0 && (
              <div className="space-y-3">
                <span className="text-gray text-base font-medium">
                  Material - {selectedMaterial || "Select Material"}
                </span>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {uniqueMaterials.map((material: string) => {
                    const isSelected =
                      selectedMaterial === material ||
                      (selectedMaterial === null && material === "No Material");

                    // Check if this material has any available variants
                    const materialVariants = (allVariants || []).filter(
                      (v) =>
                        (material === "No Material"
                          ? v.material === null || v.material === "No Material"
                          : v.material === material) && v.stock > 0
                    );
                    const isInStock = materialVariants.length > 0;

                    return (
                      <button
                        key={material}
                        onClick={() => {
                          if (isInStock) {
                            setSelectedMaterial(
                              material === "No Material" ? null : material
                            );

                            // Auto-select first available color and size for this material
                            const materialVariants = (allVariants || []).filter(
                              (v) =>
                                (material === "No Material"
                                  ? v.material === null
                                  : v.material === material) &&
                                (!selectedColor || v.color === selectedColor) &&
                                (!selectedSize || v.size === selectedSize) &&
                                v.stock > 0
                            );
                            if (materialVariants.length > 0) {
                              const firstVariant = materialVariants[0];
                              if (!selectedColor)
                                setSelectedColor(firstVariant.color || null);
                              if (!selectedSize)
                                setSelectedSize(firstVariant.size || null);
                            }
                          }
                        }}
                        disabled={!isInStock}
                        className={cn(
                          "relative rounded-lg border-2 px-3 py-2 text-xs font-medium transition-all sm:px-4 sm:text-sm",
                          isSelected
                            ? "border-blue bg-blue ring-blue text-white ring-2 ring-offset-2"
                            : isInStock
                              ? "border-gray-300 bg-white text-gray-700 hover:scale-105 hover:border-gray-400"
                              : "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                        )}
                        title={
                          !isInStock ? `${material} (Out of Stock)` : material
                        }
                      >
                        {material}
                        {!isInStock && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-[1px] w-4 rotate-45 bg-red-500 sm:w-6"></div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock Status */}
            <div className="space-y-1">
              {/* <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "h-3 w-3 rounded-full",
                    currentStock > 0 ? "bg-green-500" : "bg-red-500"
                  )}
                ></div>
                <span
                  className={cn(
                    "text-sm font-medium",
                    currentStock > 0 ? "text-green-600" : "text-red-600"
                  )}
                >
                  {currentStock > 0
                    ? `In Stock (${currentStock} available)`
                    : "Out of Stock"}
                </span>
              </div> */}
              {currentVariant && (
                <p className="text-xs text-gray-500">
                  SKU: {currentVariant.sku || "N/A"}
                </p>
              )}
            </div>

            {/* Klarna Payment */}
            <div className="mt-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-8">
                  <span className="text-[16px] text-[#999] md:text-[18px] lg:text-[20px]">
                    Make 3 Payments Of £{(currentPrice / 3).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <h3 className="text-[18px] text-[#222222] md:text-[22px] lg:text-[25px]">
                DESCRIPTION:
              </h3>
              <p className="text-sm leading-relaxed text-[#999] md:text-base">
                {product.description}
              </p>
            </div>

            {/* Quantity and Add to Cart - Hidden on mobile (will be shown in sticky footer) */}
            <div className="hidden space-y-4 md:block">
              {/* Desktop: Original layout */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                {/* <Button
                  onClick={handleAddToCart}
                  disabled={currentStock === 0}
                  variant="outline"
                  size="xl"
                  rounded="full"
                  className="group md:size-xxl !border-blue hover:border-dark-gray relative w-full flex-1 items-center justify-start !border-1 hover:bg-transparent"
                  icon={
                    <Image
                      src="/arrow-right1.png"
                      alt="arrow-right"
                      width={24}
                      height={24}
                      className="bg-blue group-hover:bg-dark-gray absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 rounded-full object-contain p-1 md:h-10 md:w-10 md:p-2"
                    />
                  }
                >
                  Shop Now
                </Button> */}
                <Button
                  onClick={handleAddToCart}
                  disabled={currentStock === 0 || !currentVariant}
                  variant="primary"
                  size="xl"
                  rounded="full"
                  className={cn(
                    "md:size-xxl relative w-full flex-1 items-center justify-start py-4",
                    currentStock === 0 || !currentVariant
                      ? "cursor-not-allowed opacity-50"
                      : ""
                  )}
                  icon={
                    <Image
                      src="/arrow-right.png"
                      alt="arrow-right"
                      width={24}
                      height={24}
                      className={cn(
                        "absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 rounded-full bg-[#fff] object-contain p-1 md:h-10 md:w-10 md:p-2",
                        currentStock === 0 || !currentVariant
                          ? "opacity-50"
                          : "text-blue"
                      )}
                    />
                  }
                >
                  {currentStock === 0
                    ? "Out of Stock"
                    : !currentVariant
                      ? "Select Variant"
                      : "Add To Cart"}
                </Button>
              </div>
            </div>
            <div className="relative right-1/2 left-1/2 -mr-[50vw] mb-5 -ml-[50vw] w-screen sm:hidden">
              <MarqueeStrip
                items={marqueeItems}
                backgroundColor="bg-blue"
                textColor="text-white"
                className="py-3 sm:py-4"
              />
            </div>
            {/* Mobile: Options Sheet Trigger / Desktop: Dropdowns */}
            {isMobile ? (
              <div className="space-y-3">
                <Sheet
                  open={showMobileOptionsSheet}
                  onOpenChange={setShowMobileOptionsSheet}
                >
                  <SheetTrigger asChild>
                    <button className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-4 text-left hover:bg-gray-50">
                      <span className="font-medium">Delivery</span>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </button>
                  </SheetTrigger>
                  <SheetContent side="right" className="h-[100vh]">
                    <SheetHeader>
                      <SheetTitle>Product Options</SheetTitle>
                      <SheetDescription>
                        Delivery, payment, and other product information
                      </SheetDescription>
                    </SheetHeader>
                    <div className="scrollbar-hide mt-6 h-full overflow-y-auto">
                      <div className="space-y-6 pb-6">
                        {/* Product Summary in Sheet */}
                        <div className="flex gap-4 rounded-lg bg-gray-50 p-4">
                          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                            <Image
                              src={displayImages[0]?.url || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{product.name}</h3>
                            <p className="text-sm text-gray-600">
                              £{currentPrice.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Options Accordion in Sheet */}
                        <ScrollArea className="scrollbar-hide h-[400px]">
                          <Accordion
                            type="single"
                            collapsible
                            className="w-full"
                          >
                            <AccordionItem value="delivery">
                              <AccordionTrigger className="font-normal">
                                Delivery
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="text-sm text-[#999]">
                                  {getDeliveryDetails()}
                                  {/* {product?.delivery_info?.text ? (
                                    <>
                                      {product.delivery_info.text}
                                      {product.delivery_info.min_days &&
                                        product.delivery_info.max_days && (
                                          <span className="mt-1 block">
                                            Delivery time:{" "}
                                            {product.delivery_info.min_days}-
                                            {product.delivery_info.max_days}{" "}
                                            days
                                          </span>
                                        )}
                                    </>
                                  ) : (
                                    "We offer three delivery options: Basic, Standard, and Premium. Sofas are delivered with our Premium option. 7-day delivery subject to stock and postcode."
                                  )} */}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="payment">
                              <AccordionTrigger>Payment</AccordionTrigger>
                              <AccordionContent>
                                <div className="text-sm text-[#999]">
                                  We accept all major credit/debit cards,
                                  Klarna, and PayPal. Pay in 3 with Klarna
                                  available at checkout.
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="warranty">
                              <AccordionTrigger>Warranty</AccordionTrigger>
                              <AccordionContent>
                                <div className="text-sm text-[#999]">
                                  {product?.warranty_info ||
                                    "All sofas come with a 10-year frame warranty and 2-year fabric warranty. See our warranty policy for details."}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="availability">
                              <AccordionTrigger>Availability</AccordionTrigger>
                              <AccordionContent>
                                <div className="text-sm text-[#999]">
                                  Most products are in stock for fast delivery.
                                  Stock status is shown above. Contact us for
                                  special orders.
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </ScrollArea>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Additional option buttons for mobile */}
                <button
                  className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-4 text-left hover:bg-gray-50"
                  onClick={() => setShowMobileOptionsSheet(true)}
                >
                  <span className="font-medium">Payment</span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
                <button
                  className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-4 text-left hover:bg-gray-50"
                  onClick={() => setShowMobileOptionsSheet(true)}
                >
                  <span className="font-medium">Other Options</span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            ) : (
              /* Desktop: Original Dropdowns */
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="delivery">
                    <AccordionTrigger className="font-normal">
                      Delivery
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="text-sm text-[#999]">
                        {getDeliveryDetails()}
                        {/* {product?.delivery_info?.text ? (
                          <>
                            {product.delivery_info.text}
                            {product.delivery_info.min_days &&
                              product.delivery_info.max_days && (
                                <span className="mt-1 block">
                                  Delivery time:{" "}
                                  {product.delivery_info.min_days}-
                                  {product.delivery_info.max_days} days
                                </span>
                              )}
                          </>
                        ) : (
                          "We offer three delivery options: Basic, Standard, and Premium. Sofas are delivered with our Premium option. 7-day delivery subject to stock and postcode."
                        )} */}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="payment">
                    <AccordionTrigger>Payment</AccordionTrigger>
                    <AccordionContent>
                      <div className="text-sm text-[#999]">
                        We accept all major credit/debit cards, Klarna, and
                        PayPal. Pay in 3 with Klarna available at checkout.
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="warranty">
                    <AccordionTrigger>Warranty</AccordionTrigger>
                    <AccordionContent>
                      <div className="text-sm text-[#999]">
                        {product?.warranty_info ||
                          "All sofas come with a 10-year frame warranty and 2-year fabric warranty. See our warranty policy for details."}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="availability">
                    <AccordionTrigger>Availability</AccordionTrigger>
                    <AccordionContent>
                      <div className="text-sm text-[#999]">
                        Most products are in stock for fast delivery. Stock
                        status is shown above. Contact us for special orders.
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}

            {/* T&C */}
            <p className="text-gray hidden text-sm lg:flex">Delivery T&C</p>
          </div>
        </div>

        {/* Marquee Strip */}
        <div className="relative right-1/2 left-1/2 -mr-[50vw] mb-5 -ml-[50vw] hidden w-screen sm:block">
          <MarqueeStrip
            items={marqueeItems}
            backgroundColor="bg-blue"
            textColor="text-white"
            className="py-3 sm:py-4"
          />
        </div>

        <div ref={featuresRef}>
          {/* Tabs Navigation. Dont remove this empty div. when below tabs get fixed position, it causes layout shift and mess up with intersection observer */}
          {featuresInView && <div className="h-16 md:h-20" />}
          <div
            className={cn(
              "rounded-full shadow-md sm:mt-0",
              {
                "fixed right-4 bottom-0 left-4 z-100 mb-4 bg-white":
                  featuresInView,
              },
              { "mt-5 mb-8 w-full md:mt-12 md:mb-8": !featuresInView }
            )}
          >
            <div className="flex items-center justify-center">
              {/* Mobile: Horizontal Scrolling Tabs */}
              {isMobile ? (
                <Carousel
                  opts={{
                    align: "start",
                    loop: false,
                  }}
                  className="w-full p-2"
                >
                  <CarouselContent className="justify-center">
                    {tabList.map((tab) => (
                      <CarouselItem key={tab.key} className="basis-auto">
                        <button
                          onClick={() => {
                            setSelectedTab(tab.key);
                            handleScrollToSection(tab.section);
                          }}
                          className={`min-w-fit shrink-0 rounded-full border px-2 py-2 text-xs font-medium whitespace-nowrap transition-all ${
                            selectedTab === tab.key
                              ? "bg-blue border-blue text-white"
                              : "text-blue hover:bg-blue/10 border-blue"
                          }`}
                        >
                          {tab.label}
                        </button>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              ) : (
                /* Desktop: Original Layout */
                <div className="border-blue scrollbar-hide flex w-full overflow-x-auto rounded-full border px-2 py-1 md:justify-between md:px-4 md:py-2">
                  {tabList.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => {
                        setSelectedTab(tab.key);
                        handleScrollToSection(tab.section);
                      }}
                      className={`min-w-fit shrink-0 rounded-full px-2 py-2 text-xs font-medium whitespace-nowrap transition-all md:px-3 md:py-4 md:text-sm ${
                        selectedTab === tab.key
                          ? "bg-blue text-white md:w-[20%]"
                          : "text-blue hover:bg-white"
                      } `}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Style Section */}
          {/* <section id="style" className="pb-6 md:py-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
              <div className="space-y-3 md:space-y-4">
                <h1 className="text-[36px] leading-tight md:text-[56px] lg:text-[72px]">
                  MALVERN STYLE
                </h1>
                <div className="space-y-2 text-sm text-[#999] md:space-y-3 md:text-base">
                  <p>
                    &quot;Malvern style&quot; is not a single defined style but
                    refers to designs from specific companies like G Plan and
                    Oak Furnitureland, which offer classic, comfortable, and
                    elegant furniture with features like high backs and curved
                    arms. It can also describe contemporary designs, such as
                    modern farmhouse styles using neutral tones and natural
                    textures or contemporary architectural styles with linear
                    forms and earthy materials.
                  </p>
                  <p>
                    The term is also applied to contemporary quartz countertops
                    by Cambria, which use a warm vanilla palette and gray
                    accents, and even to specific features on a product, like a
                    &quot;modern Malvern style&quot; cabinet knob.
                  </p>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="relative h-[300px] w-full max-w-[500px] md:h-[380px] md:max-w-[600px] lg:h-[430px] lg:max-w-[640px]">
                  <Image
                    src={displayImages[0]?.url || "/placeholder.svg"}
                    alt="Style showcase"
                    fill
                    className="rounded-4xl border border-[#D5EBFF] bg-white object-contain object-center"
                  />
                </div>
              </div>
            </div>
          </section> */}

          {/* Delivery Section */}
          <section className="py-6 md:py-8">
            <div className="space-y-3 md:space-y-4">
              <h1 className="text-[36px] leading-tight md:text-[56px] lg:text-[72px]">
                DELIVERY
              </h1>
              <p className="text-sm leading-relaxed text-[#999] md:text-base">
                {getDeliveryDetails()}
                {/* {product?.delivery_info?.text ? (
                  <>
                    {product.delivery_info.text}
                    {product.delivery_info.min_days &&
                      product.delivery_info.max_days && (
                        <span className="mt-2 block">
                          Delivery timeframe: {product.delivery_info.min_days}{" "}
                          to {product.delivery_info.max_days} days.
                        </span>
                      )}
                    {product.delivery_info.free_shipping_threshold && (
                      <span className="mt-1 block">
                        Free shipping on orders over £
                        {product.delivery_info.free_shipping_threshold}.
                      </span>
                    )}
                  </>
                ) : (
                  "We Have Three Delivery Options To Choose From, Including Basic, Standard And Premium, Each Offering Different Features Depending On Your Needs. Due To Their Weight And Size, Our Sofas Are Only Available With Our Premium Delivery Option. You Can Find Our Terms And Conditions Here. Please Note That 7 Day Delivery Is Subject To Stock Availability And Delivery Postcode."
                )} */}
              </p>
            </div>
          </section>

          {/* Dimensions Section */}
          <section
            id="dimensions"
            className="bg-light-blue/50 md:py-12 lg:py-16"
          >
            <div className="px-2 sm:px-[32px]">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
                {/* Left Side - Title and Description */}
                <div className="space-y-3 md:space-y-4">
                  <h1 className="text-[36px] leading-tight md:text-[56px] lg:text-[72px]">
                    DIMENSIONS & ASSEMBLY
                  </h1>
                  <p className="text-gray text-sm leading-relaxed md:text-base">
                    {product?.assembly_instructions}
                  </p>

                  {/* Dimensions Diagram */}
                  <div className="mt-6 md:mt-8">
                    <div className="relative w-full max-w-[500px] md:max-w-[600px]">
                      <Image
                        src={
                          displayImages[displayImages.length - 1]?.url ||
                          "/dimensions-diagram.png"
                        }
                        alt="Product Dimensions Diagram"
                        width={500}
                        height={350}
                        className="h-auto w-full rounded-4xl border border-[#D5EBFF] bg-white object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Side - Dimensions Table */}
                <div className="mt-8 lg:mt-24">
                  {/* Table Header */}
                  <div className="grid grid-cols-4 gap-2 rounded-t-lg bg-[#ffffff] px-3 py-3 text-xs font-semibold text-[#222222] md:gap-4 md:px-6 md:py-4 md:text-sm">
                    <div className="text-center">Dimension</div>
                    <div className="text-center"></div>
                    <div className="text-center">CM</div>
                    <div className="text-center">Inches</div>
                  </div>

                  {/* Table Rows */}
                  <div className="overflow-hidden rounded-b-lg bg-white shadow-sm">
                    {(() => {
                      // Use dimensions from API variant if available, otherwise fallback to static data
                      const apiDimensions = hasDimensions(selectedVariantData)
                        ? selectedVariantData.dimensions
                        : null;

                      let dimensions: DimensionItem[] = [];

                      if (apiDimensions) {
                        // Transform API dimensions to table format
                        const dimensionMap = [
                          { key: "width", label: "Width", letter: "A" },
                          { key: "depth", label: "Depth", letter: "B" },
                          { key: "height", label: "Height", letter: "C" },
                          {
                            key: "seat_width",
                            label: "Seat Width",
                            letter: "D",
                          },
                          {
                            key: "seat_depth",
                            label: "Seat Depth",
                            letter: "E",
                          },
                          {
                            key: "seat_height",
                            label: "Seat Height",
                            letter: "F",
                          },
                          { key: "bed_width", label: "Bed Width", letter: "G" },
                          {
                            key: "bed_length",
                            label: "Bed Length",
                            letter: "H",
                          },
                        ];

                        dimensions = dimensionMap
                          .filter(
                            (dim) =>
                              apiDimensions[
                                dim.key as keyof typeof apiDimensions
                              ]
                          ) // Only include dimensions that exist in API
                          .map((dim) => {
                            const dimensionData =
                              apiDimensions[
                                dim.key as keyof typeof apiDimensions
                              ];
                            return {
                              label: dim.label,
                              cm: dimensionData?.cm || 0,
                              inches: dimensionData?.inches || 0,
                              letter: dim.letter,
                            };
                          });
                      }

                      // Fallback to static data if no API dimensions
                      if (dimensions.length === 0) {
                        dimensions = [
                          {
                            label: "Width",
                            cm: "215",
                            inches: "84.65",
                            letter: "A",
                          },
                          {
                            label: "Depth",
                            cm: "96",
                            inches: "37.80",
                            letter: "B",
                          },
                          {
                            label: "Height",
                            cm: "88",
                            inches: "34.65",
                            letter: "C",
                          },
                          {
                            label: "Seat Width",
                            cm: "180",
                            inches: "70.87",
                            letter: "D",
                          },
                          {
                            label: "Seat Depth",
                            cm: "56",
                            inches: "22.05",
                            letter: "E",
                          },
                          {
                            label: "Seat Height",
                            cm: "52",
                            inches: "20.47",
                            letter: "F",
                          },
                          {
                            label: "Bed Width",
                            cm: "180",
                            inches: "70.87",
                            letter: "G",
                          },
                          {
                            label: "Bed Length",
                            cm: "110",
                            inches: "43.31",
                            letter: "H",
                          },
                        ];
                      }

                      return dimensions.map((item, index) => {
                        // Convert cm to inches if only cm is provided
                        const cmValue =
                          typeof item.cm === "string"
                            ? parseFloat(item.cm)
                            : item.cm;
                        const inchesValue =
                          item.inches || (cmValue / 2.54).toFixed(2);

                        return (
                          <div
                            key={index}
                            className={`grid grid-cols-4 gap-2 px-3 py-3 md:gap-4 md:px-6 md:py-4 ${
                              index % 2 === 0 ? "bg-[#f2f2f2]" : "bg-white"
                            }`}
                          >
                            <div className="flex justify-center">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8396a6] text-xs font-bold text-white md:h-8 md:w-8 md:text-sm">
                                {item.letter || String.fromCharCode(65 + index)}
                              </div>
                            </div>
                            <div className="text-center text-xs font-medium text-gray-700 md:text-sm">
                              {item.label}
                            </div>
                            <div className="text-center text-xs font-medium text-gray-900 md:text-sm">
                              {item.cm}
                            </div>
                            <div className="text-center text-xs font-medium text-gray-900 md:text-sm">
                              {inchesValue}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Materials Section */}
          <div className="px-2 sm:px-[32px]">
            <section id="material" className="py-8 md:py-16">
              <div className="">
                <h1 className="mb-3 text-[36px] leading-tight md:mb-4 md:text-[56px] lg:text-[72px]">
                  MATERIALS & CARE
                </h1>
                <p className="mb-6 text-sm leading-relaxed text-[#999] md:mb-8 md:text-base">
                  {product?.care_instructions ||
                    "Upholstered In Fabric With A Soft, Textured Touch. Together With The Coordinating Scatter Cushions, It's Really Cosy And Snuggly. We're Choosy When It Comes To Our Upholstery, Using Only The Highest Quality Fabrics. All Our Fabrics Are Rated For Heavy Domestic Use To Stand Up To The Demands Of Family Life. Our Fabric Sofas Have Flat Weave Fabrics Which Are Hard Wearing And Luxurious To Touch."}
                </p>

                <div className="space-y-6 md:space-y-8">
                  <div>
                    <h1 className="mb-3 text-[28px] leading-tight md:mb-4 md:text-[42px] lg:text-[56px]">
                      MATERIAL COMPOSITION:
                    </h1>
                    <div className="space-y-1 text-sm text-[#999] md:space-y-2 md:text-base">
                      {selectedVariantData?.material ? (
                        <p>
                          <span className="text-dark-gray font-semibold">
                            Main Material:
                          </span>{" "}
                          {selectedVariantData.material}
                        </p>
                      ) : (
                        <p>
                          <span className="text-dark-gray font-semibold">
                            {" "}
                            Main Material:{" "}
                          </span>{" "}
                          81% Polyester, 19% Viscose
                        </p>
                      )}
                      <p>
                        <span className="text-dark-gray font-semibold">
                          Scatter Cushion Cover:{" "}
                        </span>
                        100% Polyester, 56% Polyester, 40% Viscose, 4% Cotton /
                        100% Polyester
                      </p>
                      <p>
                        <span className="text-dark-gray font-semibold">
                          Scatter Cushion Filling:
                        </span>{" "}
                        These Fibre-Filled Cushions Give Extra Cosiness.
                        They&apos;re Made To Match The Sofa Range In Style And
                        Colour, Too.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h1 className="mb-3 text-[28px] leading-tight md:mb-4 md:text-[42px] lg:text-[56px]">
                      MATERIAL CONSTRUCTION:
                    </h1>
                    <div className="space-y-2 text-sm text-[#999] md:space-y-3 md:text-base">
                      <p>
                        <span className="text-dark-gray font-semibold">
                          Frame:
                        </span>
                        All Our Sofa And Armchair Frames Feature Solid Hardwood.
                        It Forms Part Of A Strong Frame That&apos;s Made To Last
                        - And Designed Not To Creak. Joints Are Strongly Fixed
                        Using Classic Carpentry Skills, So You Can Enjoy The
                        Support And Comfort Of A Well-Made Sofa.
                      </p>
                      <p>
                        <span className="text-dark-gray font-semibold">
                          Seat Base:{" "}
                        </span>{" "}
                        Serpentine Springs Spread The Load Of The Seat Cushions,
                        A Sprung Platform With Plenty Of Springs Mean Our Sofas
                        Have Great Support At The Base. That Means No Sagging -
                        And More Comfort For You.
                      </p>
                      <p>
                        <span className="text-dark-gray font-semibold">
                          Seat Cushion:{" "}
                        </span>{" "}
                        Sink Into The Comfort Of Our Foam-Filled, Fibre-Topped
                        Seat Cushions. Their Plump-Free Design Means They
                        Require Minimal Attention To Stay Looking Their Best.
                      </p>
                      <p>
                        <span className="text-dark-gray font-semibold">
                          Back Support:{" "}
                        </span>{" "}
                        Tensioned Webbing Keeps The Back Cushions In Place. When
                        You Relax Back At The End Of The Day, You Want Just The
                        Right Kind Of Secure Feeling That This Gives.
                      </p>
                      <p>
                        <span className="text-dark-gray font-semibold">
                          Back Cushion:{" "}
                        </span>{" "}
                        These Are Fibre-Filled And Designed To Keep Their Shape.
                        Fibre Is So Luxurious When You Want To Settle Back And
                        Relax.
                      </p>
                      <p>
                        <span className="text-dark-gray font-semibold">
                          Feet:{" "}
                        </span>
                        Black Glides
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Related Products */}
          <section id="recommended" className="bg-light-blue py-8 md:py-12">
            <div className="px-2 py-3 sm:px-[32px]">
              <div className="mb-6 flex items-center justify-between md:mb-8">
                <h1 className="text-3xl md:text-[85px]">Related Products</h1>
                <Link href="/products">
                  <Button
                    variant="main"
                    size="xl"
                    rounded="full"
                    className="bg-blue relative items-center justify-start"
                    icon={
                      <Image
                        src="/arrow-right.png"
                        alt="arrow-right"
                        width={20}
                        height={20}
                        className="text-blue absolute top-1/2 right-2 h-[30px] w-[30px] -translate-y-1/2 rounded-full bg-white object-contain p-2 md:h-10 md:w-10"
                      />
                    }
                  >
                    View More
                  </Button>
                </Link>
              </div>

              {relatedProducts && relatedProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:hidden md:gap-8 lg:grid-cols-3">
                {relatedProducts
                  .filter((p) => p.variants && p.variants.length > 0)
                  .slice(0, 4)
                  .map((relatedProduct, index) => {
                    const firstVariant = relatedProduct.variants?.[0];
                    const basePrice = relatedProduct.base_price;
                    const discountOffer = Number(relatedProduct.discount_offer) || 0; // ✅ get discount offer from DB

                    // Calculate final price after discount
                    const currentPrice = firstVariant?.price || basePrice;
                    const finalPrice =
                      discountOffer > 0
                        ? Math.round(currentPrice * (1 - discountOffer / 100) * 100) / 100
                        : currentPrice;

                    // Determine if product has discount
                    const hasDiscount = discountOffer > 0;

                    // Discount badge
                    const discountPercentage = hasDiscount ? `${discountOffer}% off` : undefined;

                    const assembleCharges = firstVariant?.assemble_charges || 0;
                    const deliverInfo = firstVariant?.delivery_time_days || "3 To 4 Days Delivery";

                    // Get main image URL with fallback
                    const productImage = (() => {
                      try {
                        const imageUrl = relatedProduct.images?.[0]?.url;
                        if (imageUrl && (imageUrl.startsWith("http") || imageUrl.startsWith("/"))) return imageUrl;
                        return "/hero-img.png";
                      } catch {
                        return "/hero-img.png";
                      }
                    })();

                    return (
                      <ProductCard
                        key={relatedProduct.id}
                        variant={index % 2 === 0 ? "layout1" : "layout2"}
                        id={relatedProduct.id}
                        name={relatedProduct.name || "SUNSET TURKISH SOFA"}

                        // Price handling
                        price={finalPrice} // ✅ discounted price
                        originalPrice={hasDiscount ? basePrice : undefined} // ✅ show MRP only if discount exists
                        discount={discountPercentage} // ✅ discount badge if exists

                        imageSrc={productImage}
                        rating={4.9}
                        paymentOption={
                          hasPaymentOptions(selectedVariantData)
                            ? {
                                service: selectedVariantData.payment_options[0].provider || "Klarna",
                                installments: selectedVariantData.payment_options[0].installments || 3,
                                amount:
                                  selectedVariantData.payment_options[0].amount ||
                                  Math.round((finalPrice / 3) * 100) / 100,
                              }
                            : {
                                service: "Klarna",
                                installments: 3,
                                amount: Math.round((finalPrice / 3) * 100) / 100,
                              }
                        }
                        isSale={hasDiscount}
                        deliveryInfo={deliverInfo}
                        assemble_charges={assembleCharges}
                        variantId={firstVariant?.id}
                      />
                    );
                  })}
              </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="font-open-sans text-gray-600">
                    No related products available at the moment.
                  </p>
                </div>
              )}

              {relatedProducts && relatedProducts.length > 0 ? (
                <div className="hidden grid-cols-2 gap-6 sm:grid-cols-2 md:grid md:gap-8 lg:grid-cols-3">
                  {relatedProducts
                    .filter((p) => p.variants && p.variants.length > 0)
                    .slice(0, 3)
                    .map((relatedProduct, index) => {
                      // Get the variant price or use base price as fallback
                      const firstVariant = relatedProduct.variants?.[0];
                      const currentPrice =
                        firstVariant?.price || relatedProduct.base_price;
                      const hasDiscount =
                        currentPrice < relatedProduct.base_price;
                      const assembleCharges =
                        firstVariant?.assemble_charges || 0;
                      const deliverInfo =
                        firstVariant?.delivery_time_days ||
                        "3 To 4 Days Delivery";

                      // Get main image URL with validation
                      const getValidImageUrl = (imageUrl?: string) => {
                        try {
                          if (imageUrl && typeof imageUrl === "string") {
                            // Check if it's a valid URL or relative path
                            if (
                              imageUrl.startsWith("http") ||
                              imageUrl.startsWith("/")
                            ) {
                              return imageUrl;
                            }
                          }
                          return "/hero-img.png"; // Fallback to hero image
                        } catch (error) {
                          console.warn(
                            "Error processing product image:",
                            error
                          );
                          return "/hero-img.png";
                        }
                      };

                      const productImage = getValidImageUrl(
                        relatedProduct.images?.[0]?.url
                      );

                      // Calculate discount percentage if there's a discount
                      let discountPercentage = "";
                      if (hasDiscount) {
                        const percentage = Math.round(
                          ((relatedProduct.base_price - currentPrice) / relatedProduct.base_price) * 100
                        );
                        discountPercentage = `${percentage}% off`;
                      }

                      return (
                        <ProductCard
                          variant={index % 2 === 0 ? "layout1" : "layout2"} // Alternating layouts
                          key={relatedProduct.id}
                          id={relatedProduct.id}
                          name={relatedProduct.name || "SUNSET TURKISH SOFA"} // Fallback name
                          price={currentPrice}
                          originalPrice={
                            hasDiscount
                              ? relatedProduct.base_price
                              : undefined // Only show original price if there's a discount
                          }
                          imageSrc={productImage}
                          rating={4.9} // Static rating
                          discount={discountPercentage || undefined} // ✅ Use only calculated discount
                          paymentOption={
                            hasPaymentOptions(selectedVariantData)
                              ? {
                                  service:
                                    selectedVariantData.payment_options[0].provider || "Klarna",
                                  installments:
                                    selectedVariantData.payment_options[0].installments || 3,
                                  amount:
                                    selectedVariantData.payment_options[0].amount ||
                                    Math.round((currentPrice / 3) * 100) / 100,
                                }
                              : {
                                  service: "Klarna",
                                  installments: 3,
                                  amount: Math.round((currentPrice / 3) * 100) / 100,
                                }
                          }
                          isSale={hasDiscount}
                          deliveryInfo={deliverInfo}
                          assemble_charges={assembleCharges}
                          variantId={firstVariant?.id}
                        />
                      );

                    })}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="font-open-sans text-gray-600">
                    No related products available at the moment.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Testimonials Section */}
          <section id="reviews" className="">
            <Testimonials showBackground={false} />
          </section>
        </div>
      </div>

      {/* View in Room Modal */}
      <ViewInRoom
        isOpen={showViewInRoom}
        onClose={() => setShowViewInRoom(false)}
        productImage={
          displayImages[currentImageIndex]?.url || "/placeholder.svg"
        }
        productName={product.name}
        currentImageIndex={currentImageIndex}
        images={displayImages.map((img, index) => ({
          url: img.url,
          alt: `${product.name} - View ${index + 1}`,
        }))}
        onImageChange={setCurrentImageIndex}
      />

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none; /* Internet Explorer 10+ */
          scrollbar-width: none; /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none; /* Safari and Chrome */
        }
      `}</style>
    </div>
  );
}
