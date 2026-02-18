"use client";

import { useFeaturedProducts } from "@/hooks/use-products";
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

const NewArrivals = () => {
  const {
    data: featuredProducts,
    isLoading,
    error,
  } = useFeaturedProducts({
    limit: 4, // Changed from 3 to 4 for mobile 2x2 grid
    includeCategory: true,
  });

  // Error state
  if (error) {
    return (
      <div className="py-10 md:py-16">
        <div className="px-[32px]">
          <div className="mb-8 md:mb-10">
            <h1 className="text-3xl sm:text-6xl lg:text-[85px]">
              NEW ARRIVALS
            </h1>
          </div>

          <div className="py-8 text-center">
            <p className="font-open-sans text-red-600">
              Failed to load featured products. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading || !featuredProducts || featuredProducts.length === 0) {
    return (
      <div className="py-10 md:py-16">
        <div className="px-[32px]">
          <div className="mb-8 md:mb-10">
            <h1 className="text-3xl sm:text-6xl lg:text-[85px]">
              NEW ARRIVALS
            </h1>
          </div>

          {/* Mobile Loading - 2x2 grid */}
          <div className="grid grid-cols-2 gap-4 md:hidden">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-96 animate-pulse rounded-lg bg-gray-100"
              ></div>
            ))}
          </div>

          {/* Desktop Loading - 3 columns */}
          <div className="hidden grid-cols-3 gap-6 md:grid md:gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-96 animate-pulse rounded-lg bg-gray-100"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Helper function to process product data
  const processProduct = (product: FeaturedProduct) => {
    const currentPrice = product.default_variant?.price || product.base_price;
    const hasDiscount = currentPrice < product.base_price;

    const getValidImageUrl = (imageUrl?: string) => {
      try {
        if (imageUrl && typeof imageUrl === "string") {
          if (imageUrl.startsWith("http") || imageUrl.startsWith("/")) {
            return imageUrl;
          }
        }
        return "/hero-img.png";
      } catch (error) {
        console.warn("Error processing product image:", error);
        return "/hero-img.png";
      }
    };

    const productImage = getValidImageUrl(product.main_image?.url);

    let discountPercentage = "";
    if (hasDiscount) {
      const percentage = Math.round(
        ((product.base_price - currentPrice) / product.base_price) * 100
      );
      discountPercentage = `${percentage}% off`;
    }

    return {
      ...product,
      default_variant: product.default_variant
        ? {
            ...product.default_variant,
            delivery_time_days:
              product.default_variant.delivery_time_days || "3 to 4 days",
            assemble_charges: product.default_variant.assemble_charges || 0,
          }
        : product.default_variant,
      currentPrice,
      hasDiscount,
      productImage,
      discountPercentage,
    };
  };

  const getDesktopProducts = () => {
    if (featuredProducts.length === 0) return [];
    return featuredProducts.slice(0, 2);
  };

  const getDesktopProductsLg = () => {
    if (featuredProducts.length === 0) return [];
    return featuredProducts.slice(0, 3);
  };

  return (
    <div className="bg-light-blue py-10 md:py-16">
      <div className="px-4 sm:px-[32px]">
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
                  className="text-blue absolute top-1/2 right-2 h-[30px] w-[30px] -translate-y-1/2 rounded-full bg-[#fff] object-contain p-2 md:h-[40px] md:w-[40px]"
                />
              }
            >
              View More
            </Button>
          </Link>
        </div>

        <Carousel
          className="w-full pb-8 md:hidden"
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[Autoplay({ delay: 5000 })]}
        >
          <CarouselContent>
            {featuredProducts.slice(0, 4).map((product, index) => {
              const currentPrice =
                product.default_variant?.price || product.base_price;
              const hasDiscount = currentPrice < product.base_price;

              const getValidImageUrl = (imageUrl?: string) => {
                try {
                  if (imageUrl && typeof imageUrl === "string") {
                    if (
                      imageUrl.startsWith("http") ||
                      imageUrl.startsWith("/")
                    ) {
                      return imageUrl;
                    }
                  }
                  return "/hero-img.png";
                } catch (error) {
                  console.warn("Error processing product image:", error);
                  return "/hero-img.png";
                }
              };

              const productImage = getValidImageUrl(product.main_image?.url);

              let discountPercentage = "";
              if (hasDiscount) {
                const percentage = Math.round(
                  ((product.base_price - currentPrice) / product.base_price) *
                    100
                );
                discountPercentage = `${percentage}% off`;
              }

              return (
                <CarouselItem key={product.id} className="basis-1/2">
                  <ProductCard
                    variant={index % 2 === 0 ? "layout1" : "layout2"}
                    id={product.id}
                    name={product.name || "SUNSET TURKISH SOFA"}
                    price={currentPrice}
                    originalPrice={
                      hasDiscount
                        ? product.base_price
                        : Math.round(currentPrice * 1.25)
                    }
                    imageSrc={productImage}
                    rating={4.9}
                    discount={discountPercentage || "15% off"}
                    paymentOption={{
                      service: "Klarna",
                      installments: 3,
                      amount: Math.round((currentPrice / 3) * 100) / 100,
                    }}
                    isSale={hasDiscount}
                    variantId={product.default_variant?.id}
                    size={product.default_variant?.size}
                    color={product.default_variant?.color}
                    stock={product.default_variant?.stock}
                    deliveryInfo={product.default_variant?.delivery_time_days}
                    assemble_charges={
                      product.default_variant?.assemble_charges || 0
                    }
                  />
                </CarouselItem>
              );
            })}
          </CarouselContent>

          {/* Optional Navigation */}
          <CarouselPrevious className="top-full left-0 shadow-lg">
            {/* You can customize the arrow icon here */}
            &lt;
          </CarouselPrevious>
          <CarouselNext className="top-full right-0 shadow-lg">
            {/* You can customize the arrow icon here */}
            &gt;
          </CarouselNext>
        </Carousel>

        {/* Desktop: 2 column grid */}
        <div className="hidden md:block lg:hidden">
          <div className="grid grid-cols-2 gap-6 md:gap-8 lg:grid-cols-3">
            {getDesktopProducts().map((product, index) => {
              const processedProduct = processProduct(product);

              return (
                <ProductCard
                  variant={index % 2 === 0 ? "layout1" : "layout2"}
                  key={product.id}
                  id={product.id}
                  name={product.name || "SUNSET TURKISH SOFA"}
                  price={processedProduct.currentPrice}
                  originalPrice={
                    processedProduct.hasDiscount
                      ? product.base_price
                      : Math.round(processedProduct.currentPrice * 1.25)
                  }
                  imageSrc={processedProduct.productImage}
                  rating={4.9}
                  discount={processedProduct.discountPercentage || "15% off"}
                  paymentOption={{
                    service: "Klarna",
                    installments: 3,
                    amount:
                      Math.round((processedProduct.currentPrice / 3) * 100) /
                      100,
                  }}
                  isSale={processedProduct.hasDiscount}
                  variantId={product.default_variant?.id}
                  size={product.default_variant?.size}
                  color={product.default_variant?.color}
                  stock={product.default_variant?.stock}
                  deliveryInfo={product.default_variant?.delivery_time_days}
                  assemble_charges={
                    product.default_variant?.assemble_charges || 0
                  }
                />
              );
            })}
          </div>
        </div>
        {/* Desktop: 3 column grid */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-2 gap-6 md:gap-8 lg:grid-cols-3">
            {getDesktopProductsLg().map((product, index) => {
              const processedProduct = processProduct(product);

              return (
                <ProductCard
                  variant={index % 2 === 0 ? "layout1" : "layout2"}
                  key={product.id}
                  id={product.id}
                  name={product.name || "SUNSET TURKISH SOFA"}
                  price={processedProduct.currentPrice}
                  originalPrice={
                    processedProduct.hasDiscount
                      ? product.base_price
                      : Math.round(processedProduct.currentPrice * 1.25)
                  }
                  imageSrc={processedProduct.productImage}
                  rating={4.9}
                  discount={processedProduct.discountPercentage || "15% off"}
                  paymentOption={{
                    service: "Klarna",
                    installments: 3,
                    amount:
                      Math.round((processedProduct.currentPrice / 3) * 100) /
                      100,
                  }}
                  isSale={processedProduct.hasDiscount}
                  variantId={product.default_variant?.id}
                  size={product.default_variant?.size}
                  color={product.default_variant?.color}
                  stock={product.default_variant?.stock}
                  deliveryInfo={product.default_variant?.delivery_time_days}
                  assemble_charges={
                    product.default_variant?.assemble_charges || 0
                  }
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewArrivals;
