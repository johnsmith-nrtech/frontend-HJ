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
  const {
    data: featuredProducts,
    isLoading,
    error,
  } = useFeaturedProducts({
    limit: 6,
    includeCategory: true,
  });

  // Error state
  if (error) {
    return (
      <div className="py-10 md:py-16">
        <div className="px-8">
          <div className="mb-8 md:mb-10">
            <h1 className="text-4xl lg:text-[85px]">SALES ENDS SOON</h1>
            <CountdownTimer />
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
        <div className="px-8">
          <div className="mb-8 md:mb-10">
            <h1 className="text-4xl lg:text-[85px]">SALES ENDS SOON</h1>
            <CountdownTimer />
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

  // Get first 4 products for mobile 2x2 grid
  const getMobileProducts = () => {
    if (featuredProducts.length === 0) return [];
    return featuredProducts.slice(0, 4);
  };

  // Get first 2 products for desktop 2-column grid
  const getDesktopProducts = () => {
    if (featuredProducts.length === 0) return [];
    return featuredProducts.slice(0, 2);
  };

  // Get first 3 products for desktop 3-column grid
  const getDesktopProductsLg = () => {
    if (featuredProducts.length === 0) return [];
    return featuredProducts.slice(0, 3);
  };

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
          }
        : product.default_variant,
      currentPrice,
      hasDiscount,
      productImage,
      discountPercentage,
    };
  };

  return (
    <div className="py-4 pb-8 md:py-8">
      <div className="px-4 sm:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between md:mb-10">
          <div className="flex w-full items-center justify-center md:justify-between">
            <h1 className="text-3xl sm:text-6xl lg:text-[85px]">
              SALES ENDS SOON
            </h1>
            <span className="ml-4 hidden lg:flex">
              <CountdownTimer />
            </span>
          </div>
        </div>

        {/* Mobile Countdown Timer */}
        {/* <div className="mb-6 block lg:hidden">
          <CountdownTimer />
        </div> */}

        {/* Products Container */}
        <div className="relative">
          {/* Mobile Carousel: 2 items at a time */}
          <div className="md:hidden">
            <Carousel
              className="w-full pb-10"
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[Autoplay({ delay: 5000 })]} // Optional: auto slide every 5 seconds
            >
              <CarouselContent>
                {getMobileProducts().map((product, index) => {
                  const processedProduct = processProduct(product);

                  return (
                    <CarouselItem key={product.id} className="basis-1/2">
                      <ProductCard
                        variant={index % 2 === 0 ? "layout1" : "layout2"}
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
                        discount={
                          processedProduct.discountPercentage || "15% off"
                        }
                        deliveryInfo={
                          processedProduct.default_variant.delivery_time_days
                        }
                        paymentOption={{
                          service: "Klarna",
                          installments: 3,
                          amount:
                            Math.round(
                              (processedProduct.currentPrice / 3) * 100
                            ) / 100,
                        }}
                        isSale={processedProduct.hasDiscount}
                        variantId={product.default_variant?.id}
                        size={product.default_variant?.size}
                        color={product.default_variant?.color}
                        stock={product.default_variant?.stock}
                        assemble_charges={
                          processedProduct.default_variant.assemble_charges || 0
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
          </div>

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
                    deliveryInfo={
                      processedProduct.default_variant.delivery_time_days
                    }
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
                    assemble_charges={
                      processedProduct.default_variant.assemble_charges || 0
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
                    deliveryInfo={
                      processedProduct.default_variant.delivery_time_days
                    }
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
                    assemble_charges={
                      processedProduct.default_variant.assemble_charges || 0
                    }
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProducts;
