"use client";

import { useFeaturedProducts } from "@/hooks/use-products";
import { CountdownTimer } from "../count-down-timer";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import Autoplay from "embla-carousel-autoplay";
import { FeaturedProduct } from "@/lib/api/products";
import { ProductCard } from "../product-card";

const FeaturedProducts = () => {
  const { data: featuredProducts, isLoading, error } = useFeaturedProducts({
    limit: 6,
    includeCategory: true,
  });

  // ===============================
  // Helper to process product
  // ===============================
  const processProduct = (product: FeaturedProduct) => {
    const originalPrice = product.default_variant?.price || product.base_price || 0;
    const discount = Number(product.discount_offer) || 0;

    const currentPrice =
      discount > 0
        ? Math.round(originalPrice - (originalPrice * discount) / 100)
        : originalPrice;

    const hasDiscount = discount > 0;
    const discountPercentage = hasDiscount ? `${discount}% off` : undefined;

    const productImage =
      product.main_image?.url?.startsWith("http") ||
      product.main_image?.url?.startsWith("/")
        ? product.main_image.url
        : "/hero-img.png";

    return {
      ...product,
      originalPrice,
      currentPrice,
      discount,
      discountPercentage,
      hasDiscount,
      productImage,
      default_variant: product.default_variant
        ? {
            ...product.default_variant,
            delivery_time_days:
              product.default_variant.delivery_time_days || "3 to 4 days",
            assemble_charges: product.default_variant.assemble_charges || 0,
          }
        : undefined,
    };
  };

  // ===============================
  // Loading / Error States
  // ===============================
  if (error) {
    return (
      <div className="py-10 md:py-16 px-8 text-center text-red-600">
        Failed to load featured products.
      </div>
    );
  }

  if (isLoading || !featuredProducts?.length) {
    return (
      <div className="py-10 md:py-16 px-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-96 animate-pulse rounded-lg bg-gray-100"
            />
          ))}
        </div>
      </div>
    );
  }

  // ===============================
  // Render
  // ===============================
  return (
    <div className="py-4 pb-8 md:py-8">
      <div className="px-4 sm:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl sm:text-6xl lg:text-[85px]">
            SALES ENDS SOON
          </h1>
          <div className="hidden lg:block">
            <CountdownTimer />
          </div>
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden">
          <Carousel
            opts={{ align: "start", loop: true }}
            plugins={[Autoplay({ delay: 5000 })]}
            className="pb-10"
          >
            <CarouselContent>
              {featuredProducts.slice(0, 4).map((product, index) => {
                const processed = processProduct(product);

                return (
                  <CarouselItem key={product.id} className="basis-1/2">
                    <ProductCard
                      variant={index % 2 === 0 ? "layout1" : "layout2"}
                      id={product.id}
                      name={product.name}
                      price={processed.currentPrice} // individual discounted price
                      originalPrice={
                        processed.hasDiscount ? processed.originalPrice : undefined
                      }
                      discount={processed.discountPercentage} // individual discount
                      imageSrc={processed.productImage}
                      rating={4.9}
                      deliveryInfo={processed.default_variant?.delivery_time_days}
                      paymentOption={{
                        service: "Klarna",
                        installments: 3,
                        amount:
                          Math.round((processed.currentPrice / 3) * 100) / 100,
                      }}
                      isSale={processed.hasDiscount}
                      variantId={product.default_variant?.id}
                      size={product.default_variant?.size}
                      color={product.default_variant?.color}
                      stock={product.default_variant?.stock}
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

        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {featuredProducts.slice(0, 3).map((product, index) => {
            const processed = processProduct(product);

            return (
              <ProductCard
                key={product.id}
                variant={index % 2 === 0 ? "layout1" : "layout2"}
                id={product.id}
                name={product.name}
                price={processed.currentPrice} // individual discounted price
                originalPrice={
                  processed.hasDiscount ? processed.originalPrice : undefined
                }
                discount={processed.discountPercentage} // individual discount
                imageSrc={processed.productImage}
                rating={4.9}
                deliveryInfo={processed.default_variant?.delivery_time_days}
                paymentOption={{
                  service: "Klarna",
                  installments: 3,
                  amount:
                    Math.round((processed.currentPrice / 3) * 100) / 100,
                }}
                isSale={processed.hasDiscount}
                variantId={product.default_variant?.id}
                size={product.default_variant?.size}
                color={product.default_variant?.color}
                stock={product.default_variant?.stock}
                assemble_charges={processed.default_variant?.assemble_charges || 0}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FeaturedProducts;
