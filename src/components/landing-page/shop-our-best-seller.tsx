"use client";

import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/product-card";
import Link from "next/link";
import { Button } from "../button-custom";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface BestSellerVariant {
  id: string;
  price: number;
  color?: string;
  size?: string;
  stock: number;
  delivery_time_days?: string;
  assemble_charges?: number;
  featured?: boolean;
}

interface BestSellerImage {
  id: string;
  url: string;
  type: string;
  order: number;
}

interface BestSellerProductData {
  id: string;
  name: string;
  base_price: number;
  discount_offer?: number;
  images?: BestSellerImage[];
  variants?: BestSellerVariant[];
}

interface BestSellerItem {
  id: string;
  product_id: string;
  created_at: string;
  product?: BestSellerProductData;
}

interface ProcessedProduct {
  id: string;
  name: string;
  currentPrice: number;
  originalPrice: number;
  hasDiscount: boolean;
  discountPercentage?: string;
  productImage: string;
  variantId?: string;
  color?: string;
  size?: string;
  stock: number;
  deliveryInfo: string;
  assembleCharges: number;
}

function useBestSellerProducts() {
  return useQuery<BestSellerItem[]>({
    queryKey: ["bestSellerProducts"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/best-sellers`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch best sellers");
      return res.json();
    },
  });
}

const ShopOurBestSeller = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: bestSellers = [], isLoading, error } = useBestSellerProducts();

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -390 : 390,
      behavior: "smooth",
    });
  };

  const processProduct = (item: BestSellerItem): ProcessedProduct | null => {
    const product = item.product;
    if (!product) return null;

    const defaultVariant: BestSellerVariant | undefined =
      product.variants?.find((v: BestSellerVariant) => v.featured) ||
      product.variants?.[0];

    const originalPrice = defaultVariant?.price || product.base_price || 0;
    const discount = Number(product.discount_offer) || 0;

    const currentPrice =
      discount > 0
        ? Math.round(originalPrice - (originalPrice * discount) / 100)
        : originalPrice;

    const hasDiscount = discount > 0;
    const discountPercentage = hasDiscount ? `${discount}% off` : undefined;

    const mainImage =
      [...(product.images || [])]
        .sort((a: BestSellerImage, b: BestSellerImage) => (a.order || 0) - (b.order || 0))
        .find((img: BestSellerImage) => img.type === "main")?.url ||
      product.images?.[0]?.url;

    const productImage =
      mainImage?.startsWith("http") || mainImage?.startsWith("/")
        ? mainImage
        : "/hero-img.png";

    return {
      id: product.id,
      name: product.name,
      currentPrice,
      originalPrice,
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
      <div className="py-10 md:py-16 px-8 text-center text-red-600">
        Failed to load best sellers. Please try again later.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-10 md:py-16 px-8">
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-96 w-[calc(33.333%-11px)] shrink-0 animate-pulse rounded-lg bg-gray-100"
            />
          ))}
        </div>
      </div>
    );
  }

  if (bestSellers.length === 0) return null;

  const processed = bestSellers
    .map((item: BestSellerItem) => processProduct(item))
    .filter((p: ProcessedProduct | null): p is ProcessedProduct => p !== null);

  if (processed.length === 0) return null;

  return (
    <div className="py-10 md:py-16">
      <div className="px-4 sm:px-[32px]">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between md:mb-10">
          <h1 className="text-3xl sm:text-6xl lg:text-[85px]">
            SHOP OUR BEST SELLER
          </h1>
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
                  className="absolute top-1/2 right-2 h-[30px] w-[30px] -translate-y-1/2 rounded-full bg-[#fff] object-contain p-2 md:h-[40px] md:w-[40px]"
                />
              }
            >
              View More
            </Button>
          </Link>
        </div>

        {/* Scrollable row with nav buttons */}
        <div className="relative">
          {/* Left button */}
          <button
            onClick={() => scroll("left")}
            className="absolute -left-5 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-md transition-colors hover:bg-gray-50"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Outer clips to 3 cards */}
          <div className="overflow-hidden mx-2">
            {/* Inner scrollable */}
            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {processed.map((product: ProcessedProduct, index: number) => (
                <div
                  key={product.id}
                  className="w-[calc(33.333%-11px)] shrink-0 min-w-[260px]"
                >
                  <ProductCard
                    variant={index % 2 === 0 ? "layout1" : "layout2"}
                    id={product.id}
                    name={product.name}
                    price={product.currentPrice}
                    originalPrice={
                      product.hasDiscount ? product.originalPrice : undefined
                    }
                    discount={product.discountPercentage}
                    imageSrc={product.productImage}
                    rating={4.9}
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
                    deliveryInfo={product.deliveryInfo}
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

export default ShopOurBestSeller;