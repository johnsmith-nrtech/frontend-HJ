"use client";

import { useNewArrivals, useInfiniteProducts } from "@/hooks/use-products";
import { useRef, useEffect } from "react";
import { ProductCard } from "@/components/product-card";
import Link from "next/link";
import { Button } from "../button-custom";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import Autoplay from "embla-carousel-autoplay";
import { FeaturedProduct } from "@/lib/api/products";
import { useProducts } from "@/hooks/use-products";
import { ChevronLeft, ChevronRight } from "lucide-react";


const NewArrivals = () => {
  const { data, isLoading: isNewLoading, error } = useNewArrivals({
    limit: 4,
    includeCategory: true,
  });

  const {
  data: infiniteData,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteProducts({
  limit: 24,
  includeVariants: true,
  includeImages: true,
});

  const newArrivals = (data as FeaturedProduct[] | undefined) || [];
const isLoading = isNewLoading;

  interface RegularProductItem {
    id: string;
    name: string;
    base_price: number;
    discount_offer?: number;
    images?: { id: string; url: string; type: string; order: number }[];
    variants?: {
      id: string;
      price: number;
      color?: string;
      size?: string;
      stock: number;
      delivery_time_days?: string;
      assemble_charges?: number;
      featured?: boolean;
    }[];
  }

  const mapToFeaturedShape = (p: RegularProductItem): FeaturedProduct => {
    const defaultVariant =
      p.variants?.find((v) => v.featured) || p.variants?.[0];

    const mainImage =
      [...(p.images || [])]
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .find((img) => img.type === "main") || p.images?.[0];

    return {
      id: p.id,
      name: p.name,
      base_price: p.base_price,
      discount_offer: p.discount_offer,
      main_image: mainImage ? { id: mainImage.id, url: mainImage.url } : undefined,
      default_variant: defaultVariant,
    } as FeaturedProduct;
  };

  const newArrivalIds = new Set(newArrivals.map((p) => p.id));
const regularProducts: RegularProductItem[] =
  infiniteData?.pages.flatMap((page) => page.items) || [];
  const fallbackProducts = regularProducts
    .filter((p) => !newArrivalIds.has(p.id))
    .map(mapToFeaturedShape);

  const products: FeaturedProduct[] = [...newArrivals, ...fallbackProducts];

  const desktopScrollRef = useRef<HTMLDivElement>(null);
const lgScrollRef = useRef<HTMLDivElement>(null);

const maybeFetchNext = (el: HTMLDivElement) => {
  const nearEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 800;
  if (nearEnd && hasNextPage && !isFetchingNextPage) {
    fetchNextPage();
  }
};

const scrollDesktop = (direction: "left" | "right") => {
  if (!desktopScrollRef.current) return;
  desktopScrollRef.current.scrollBy({
    left: direction === "left" ? -390 : 390,
    behavior: "smooth",
  });
  if (direction === "right") maybeFetchNext(desktopScrollRef.current);
};

const scrollLg = (direction: "left" | "right") => {
  if (!lgScrollRef.current) return;
  lgScrollRef.current.scrollBy({
    left: direction === "left" ? -390 : 390,
    behavior: "smooth",
  });
  if (direction === "right") maybeFetchNext(lgScrollRef.current);
};

useEffect(() => {
  const desktopEl = desktopScrollRef.current;
  const lgEl = lgScrollRef.current;

  const handleDesktopScroll = () => desktopEl && maybeFetchNext(desktopEl);
  const handleLgScroll = () => lgEl && maybeFetchNext(lgEl);

  desktopEl?.addEventListener("scroll", handleDesktopScroll);
  lgEl?.addEventListener("scroll", handleLgScroll);

  return () => {
    desktopEl?.removeEventListener("scroll", handleDesktopScroll);
    lgEl?.removeEventListener("scroll", handleLgScroll);
  };
}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Helper function to process product
const processProduct = (product: FeaturedProduct) => {
    const basePrice = product.base_price || 0;
    const variantPrice = product.default_variant?.price || basePrice;
    const discount = Number((product as any).discount_offer) || 0;

    const discountedPrice =
      discount > 0
        ? Math.round(variantPrice - (variantPrice * discount) / 100)
        : variantPrice;

    const hasDiscount = discount > 0;
    const discountPercentage = hasDiscount ? `${discount}% off` : undefined;

    const productImage =
      product.main_image?.url?.startsWith("http") ||
      product.main_image?.url?.startsWith("/")
        ? product.main_image.url
        : "/hero-img.png";

    return {
      ...product,
      currentPrice: discountedPrice,
      originalPrice: variantPrice,
      discount,
      discountPercentage,
      hasDiscount,
      productImage,
      default_variant: product.default_variant
        ? {
            ...product.default_variant,
            assemble_charges: product.default_variant.assemble_charges || 0,
          }
        : undefined,
    };
  };

  // Loading / Error states
  if (error) {
    return (
      <div className="py-10 md:py-16 px-8 text-center text-red-600">
        Failed to load new arrivals. Please try again later.
      </div>
    );
  }

  if (isLoading || products.length === 0) {
    return (
      <div className="py-10 md:py-16 px-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-96 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  // Desktop helpers
  // const getDesktopProducts = () => products.slice(0, 2);
  // const getDesktopProductsLg = () => products.slice(0, 3);

  return (
    <div className="bg-light-blue py-10 md:py-16">
      <div className="px-4 sm:px-[32px]">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between md:mb-10">
          <h1 className="text-3xl sm:text-6xl lg:text-[85px]">NEW ARRIVALS</h1>
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

        {/* Mobile Carousel */}
        <div className="md:hidden">
          <Carousel
            opts={{ align: "start", loop: true }}
            plugins={[Autoplay({ delay: 5000 })]}
            className="pb-8"
          >
            <CarouselContent>
              {products.slice(0, 4).map((product: FeaturedProduct, index: number) => {
                const processed = processProduct(product);
                return (
                  <CarouselItem key={product.id} className="basis-1/2">
                    <ProductCard
                      variant={index % 2 === 0 ? "layout1" : "layout2"}
                      id={product.id}
                      name={product.name}
                      price={processed.currentPrice}
                      originalPrice={processed.hasDiscount ? processed.originalPrice : undefined}
                      discount={processed.discountPercentage}
                      imageSrc={processed.productImage}
                      rating={4.9}
                      paymentOption={{
                        service: "Klarna",
                        installments: 3,
                        amount: Math.round((processed.currentPrice / 3) * 100) / 100,
                      }}
                      isSale={processed.hasDiscount}
                      variantId={product.default_variant?.id}
                      size={product.default_variant?.size}
                      color={product.default_variant?.color}
                      stock={product.default_variant?.stock}
                      deliveryInfo={processed.default_variant?.delivery_time_days}
                      assemble_charges={processed.default_variant?.assemble_charges || 0}
                    />
                  </CarouselItem>
                );
              })}
            </CarouselContent>

            <CarouselPrevious className="top-full left-0 shadow-lg">&lt;</CarouselPrevious>
            <CarouselNext className="top-full right-0 shadow-lg">&gt;</CarouselNext>
          </Carousel>
        </div>

        {/* Desktop 2-col */}
        <div className="hidden md:block lg:hidden">
          <div className="relative">
            <button
              onClick={() => scrollDesktop("left")}
              className="absolute left-0 sm:-left-5 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-md transition-colors hover:bg-gray-50"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="overflow-hidden mx-2">
              <div
                ref={desktopScrollRef}
                className="flex gap-6 md:gap-8 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {products.map((product: FeaturedProduct, index: number) => {
                  const processed = processProduct(product);
                  return (
                    <div key={product.id} className="w-[calc(50%-12px)] shrink-0 min-w-[260px]">
                      <ProductCard
                        variant={index % 2 === 0 ? "layout1" : "layout2"}
                        id={product.id}
                        name={product.name}
                        price={processed.currentPrice}
                        originalPrice={processed.hasDiscount ? processed.originalPrice : undefined}
                        discount={processed.discountPercentage}
                        imageSrc={processed.productImage}
                        rating={4.9}
                        paymentOption={{
                          service: "Klarna",
                          installments: 3,
                          amount: Math.round((processed.currentPrice / 3) * 100) / 100,
                        }}
                        isSale={processed.hasDiscount}
                        variantId={product.default_variant?.id}
                        size={product.default_variant?.size}
                        color={product.default_variant?.color}
                        stock={product.default_variant?.stock}
                        deliveryInfo={processed.default_variant?.delivery_time_days}
                        assemble_charges={processed.default_variant?.assemble_charges || 0}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => scrollDesktop("right")}
              className="absolute right-0 sm:-right-5 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-md transition-colors hover:bg-gray-50"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Desktop 3-col */}
        <div className="hidden lg:block">
          <div className="relative">
            <button
              onClick={() => scrollLg("left")}
              className="absolute left-0 sm:-left-5 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-md transition-colors hover:bg-gray-50"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="overflow-hidden mx-2">
              <div
                ref={lgScrollRef}
                className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {products.map((product: FeaturedProduct, index: number) => {
                  const processed = processProduct(product);
                  return (
                    <div key={product.id} className="w-[calc(33.333%-11px)] shrink-0 min-w-[260px]">
                      <ProductCard
                        variant={index % 2 === 0 ? "layout1" : "layout2"}
                        id={product.id}
                        name={product.name}
                        price={processed.currentPrice}
                        originalPrice={processed.hasDiscount ? processed.originalPrice : undefined}
                        discount={processed.discountPercentage}
                        imageSrc={processed.productImage}
                        rating={4.9}
                        paymentOption={{
                          service: "Klarna",
                          installments: 3,
                          amount: Math.round((processed.currentPrice / 3) * 100) / 100,
                        }}
                        isSale={processed.hasDiscount}
                        variantId={product.default_variant?.id}
                        size={product.default_variant?.size}
                        color={product.default_variant?.color}
                        stock={product.default_variant?.stock}
                        deliveryInfo={processed.default_variant?.delivery_time_days}
                        assemble_charges={processed.default_variant?.assemble_charges || 0}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => scrollLg("right")}
              className="absolute right-0 sm:-right-5 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-md transition-colors hover:bg-gray-50"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewArrivals;