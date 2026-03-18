"use client";

import { useRef } from "react";
import { CountdownTimer } from "../count-down-timer";
import { ProductCard } from "../product-card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Types defined locally
interface SaleProductVariant {
  id: string;
  price: number;
  color?: string;
  size?: string;
  stock: number;
  delivery_time_days?: string;
  assemble_charges?: number;
  featured?: boolean;
}

interface SaleProductImage {
  id: string;
  url: string;
  type: string;
  order: number;
}

interface SaleProductData {
  id: string;
  name: string;
  base_price: number;
  discount_offer?: number;
  images?: SaleProductImage[];
  variants?: SaleProductVariant[];
}

interface SaleProduct {
  id: string;
  product_id: string;
  created_at: string;
  product?: SaleProductData;
}

interface ProcessedProduct {
  id: string;
  name: string;
  currentPrice: number;
  originalPrice: number;
  hasDiscount: boolean;
  discountPercentage: string;
  productImage: string;
  variantId?: string;
  color?: string;
  size?: string;
  stock: number;
  deliveryInfo: string;
  assembleCharges: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function useSaleProducts() {
  return useQuery<SaleProduct[]>({
    queryKey: ["saleProducts"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/sales`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch sale products");
      return res.json();
    },
  });
}

const FeaturedProducts = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: saleProducts = [], isLoading, error } = useSaleProducts();

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    // Scroll exactly one card width + gap
    scrollRef.current.scrollBy({
      left: direction === "left" ? -390 : 390,
      behavior: "smooth",
    });
  };

  const processProduct = (saleProduct: SaleProduct): ProcessedProduct | null => {
    const product = saleProduct.product;
    if (!product) return null;

    const defaultVariant: SaleProductVariant | undefined =
      product.variants?.find((v: SaleProductVariant) => v.featured) ||
      product.variants?.[0];

    const variantPrice = defaultVariant?.price || product.base_price;
    const discount = Number(product.discount_offer) || 0;

    const discountedPrice =
      discount > 0
        ? Math.round(variantPrice - (variantPrice * discount) / 100)
        : variantPrice;

    const hasDiscount = discount > 0;
    const discountPercentage = hasDiscount ? `${discount}% off` : "15% off";

    const mainImage =
      [...(product.images || [])]
        .sort((a: SaleProductImage, b: SaleProductImage) => (a.order || 0) - (b.order || 0))
        .find((img: SaleProductImage) => img.type === "main")?.url ||
      product.images?.[0]?.url;

    const productImage =
      mainImage?.startsWith("http") || mainImage?.startsWith("/")
        ? mainImage
        : "/hero-img.png";

    return {
      id: product.id,
      name: product.name,
      currentPrice: discountedPrice,
      originalPrice: variantPrice,
      hasDiscount,
      discountPercentage,
      productImage,
      variantId: defaultVariant?.id,
      color: defaultVariant?.color,
      size: defaultVariant?.size,
      stock: defaultVariant?.stock ?? 0,
      deliveryInfo: defaultVariant?.delivery_time_days || "3 to 4 days",
      assembleCharges: defaultVariant?.assemble_charges || 0,
    };
  };

  if (error) {
    return (
      <div className="py-10 md:py-16">
        <div className="px-8">
          <div className="mb-8 md:mb-10">
            <h1 className="text-4xl lg:text-[85px]">SALES ENDS SOON</h1>
            <CountdownTimer />
          </div>
          <div className="py-8 text-center">
            <p className="text-red-600">
              Failed to load sale products. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-10 md:py-16">
        <div className="px-4 sm:px-8">
          <div className="mb-8 md:mb-10">
            <h1 className="text-4xl lg:text-[85px]">SALES ENDS SOON</h1>
            <CountdownTimer />
          </div>
          {/* Show exactly 3 skeleton cards */}
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-96 w-[calc(33.333%-11px)] shrink-0 animate-pulse rounded-lg bg-gray-100"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (saleProducts.length === 0) return null;

  const processed = saleProducts
    .map((sp: SaleProduct) => processProduct(sp))
    .filter((p: ProcessedProduct | null): p is ProcessedProduct => p !== null);

  if (processed.length === 0) return null;

  return (
    <div className="py-4 pb-8 md:py-8">
      <div className="px-4 sm:px-8">
        {/* Header */}
        <div className="mb-8 flex w-full items-center justify-center md:justify-between md:mb-10">
          <h1 className="text-3xl sm:text-6xl lg:text-[85px]">
            SALES ENDS SOON
          </h1>
          <span className="ml-4 hidden lg:flex">
            <CountdownTimer />
          </span>
        </div>

        {/* Scrollable row — exactly 3 cards visible at a time */}
        <div className="relative">
          {/* Left button */}
          <button
            onClick={() => scroll("left")}
            className="absolute -left-5 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-md transition-colors hover:bg-gray-50"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Outer wrapper clips to exactly 3 cards */}
          <div className="overflow-hidden mx-2">
            {/* Inner scrollable row */}
            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {processed.map((product: ProcessedProduct, index: number) => (
                <div
                  key={product.id}
                  // Each card takes exactly 1/3 of container minus gaps
                  className="w-[calc(33.333%-11px)] shrink-0 min-w-[260px]"
                >
                  <ProductCard
                    variant={index % 2 === 0 ? "layout1" : "layout2"}
                    id={product.id}
                    name={product.name}
                    price={product.currentPrice}
                    originalPrice={
                      product.hasDiscount
                        ? product.originalPrice
                        : Math.round(product.currentPrice * 1.25)
                    }
                    imageSrc={product.productImage}
                    rating={4.9}
                    discount={product.discountPercentage}
                    deliveryInfo={product.deliveryInfo}
                    paymentOption={{
                      service: "Klarna",
                      installments: 3,
                      amount: Math.round((product.currentPrice / 3) * 100) / 100,
                    }}
                    isSale={product.hasDiscount}
                    variantId={product.variantId}
                    size={product.size}
                    color={product.color}
                    stock={product.stock}
                    assemble_charges={product.assembleCharges}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right button */}
          <button
            onClick={() => scroll("right")}
            className="absolute -right-5 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-md transition-colors hover:bg-gray-50"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProducts;