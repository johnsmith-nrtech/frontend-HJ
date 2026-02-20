"use client";

import { useFeaturedProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/product-card";
import Link from "next/link";
import { Button } from "../button-custom";
import Image from "next/image";
import { FeaturedProduct } from "@/lib/api/products";

const ShopOurBestSeller = () => {
  const { data: featuredProducts, isLoading, error } = useFeaturedProducts({
    limit: 4,
    includeCategory: true,
  });

  // Helper function to process product
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
      currentPrice,
      originalPrice,
      hasDiscount,
      discountPercentage,
      productImage,
      default_variant: product.default_variant
        ? {
            ...product.default_variant,
            assemble_charges: product.default_variant.assemble_charges || 0,
          }
        : undefined,
    };
  };

  // Loading/Error States
  if (error) {
    return (
      <div className="py-10 md:py-16 px-8 text-center text-red-600">
        Failed to load best sellers. Please try again later.
      </div>
    );
  }

  if (isLoading || !featuredProducts || featuredProducts.length === 0) {
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

  const getDesktopProducts = () => featuredProducts.slice(0, 2);
  const getDesktopProductsLg = () => featuredProducts.slice(0, 3);

  return (
    <div className="py-10 md:py-16">
      <div className="px-4 sm:px-[32px]">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between md:mb-10">
          <h1 className="text-3xl sm:text-6xl lg:text-[85px]">SHOP OUR BEST SELLER</h1>
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

        {/* Mobile: 2x2 Grid */}
        <div className="grid grid-cols-2 gap-4 md:hidden">
          {featuredProducts.slice(0, 4).map((product, index) => {
            const processed = processProduct(product);
            return (
              <ProductCard
                key={product.id}
                variant={index % 2 === 0 ? "layout1" : "layout2"}
                id={product.id}
                name={product.name || "SUNSET TURKISH SOFA"}
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
            );
          })}
        </div>

        {/* Desktop: 2-column grid */}
        <div className="hidden md:block lg:hidden">
          <div className="grid grid-cols-2 gap-6 md:gap-8">
            {getDesktopProducts().map((product, index) => {
              const processed = processProduct(product);
              return (
                <ProductCard
                  key={product.id}
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
              );
            })}
          </div>
        </div>

        {/* Desktop: 3-column grid */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-2 gap-6 md:gap-8 lg:grid-cols-3">
            {getDesktopProductsLg().map((product, index) => {
              const processed = processProduct(product);
              return (
                <ProductCard
                  key={product.id}
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
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopOurBestSeller;
