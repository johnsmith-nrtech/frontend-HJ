"use client";

import React, { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart, useCartAnimationStore } from "@/lib/store/cart-store";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import { toast } from "sonner";
import { Button } from "./button-custom";

interface ProductCardProps {
  id: string | number;
  name: string;
  price: number;
  originalPrice?: number;
  imageSrc?: string;
  rating?: number;
  ratingCount?: number;
  discount?: string;
  isNew?: boolean;
  isSale?: boolean;
  deliveryInfo?: string;
  paymentOption?: {
    service: string;
    installments: number;
    amount: number;
  };
  variant?: "layout1" | "layout2";
  className?: string;
  // Add variant information for proper cart/wishlist functionality
  variantId?: string;
  size?: string;
  color?: string;
  stock?: number;
  assemble_charges: number;
}

export function ProductCard({
  id,
  name,
  price,
  originalPrice,
  imageSrc = "/placeholder.svg",
  rating = 4.9,
  discount,
  deliveryInfo,
  paymentOption,
  variant = "layout1",
  className = "",
  variantId,
  size,
  color,
  stock,
  assemble_charges,
}: ProductCardProps) {
  const { addItem } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCartAnimationStore();

  const handleAddToCart = async () => {
    if (!variantId) {
      toast.error("Variant ID is missing");
      return;
    }
    setIsAddingToCart(true);
    try {
      await addItem({
        id: variantId,
        name,
        price,
        image: imageSrc,
        variant_id: variantId,
        size,
        color,
        stock,
        assembly_required: false,
        assemble_charges: assemble_charges,
      });

      toast.success(`${name} added to cart!`);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error("Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
      addToCart({ item: "item added" });
    }
  };

  const formatPrice = (amount: number) => {
    return `${amount.toFixed(2)}`;
  };

  // Mobile Layout Component
  const MobileLayout = () => (
    <div className="space-y-3">
      {/* 1. Product Name (Title) */}
      <Link href={`/products/${id}`}>
        <h3 className="font-bebas text-dark-gray hover:text-blue overflow-hidden text-lg leading-tight text-ellipsis whitespace-nowrap uppercase transition-colors">
          {name}
        </h3>
      </Link>
      {/* 2. Prices */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-[#222222]">
            £{formatPrice(price)}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-base text-gray-500 line-through">
              £{formatPrice(originalPrice)}
            </span>
          )}
        </div>
        {deliveryInfo && (
          <div className="line-clamp-1 inline-block rounded-xl bg-[#3293a8] px-4 py-2 text-xs font-medium text-white">
            {deliveryInfo}
          </div>
        )}
      </div>

      {/* 3. Klarna Payment Option (always after prices) */}
      {paymentOption && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className="inline-block rounded px-2 py-1 text-xs font-bold"
              style={{ backgroundColor: "#FFA8CD", color: "#222222" }}
            >
              {paymentOption.service}
            </span>
          </div>
          <div className="text-xs text-gray-600">
            Make {paymentOption.installments} payments of £
            {formatPrice(paymentOption.amount)}
          </div>
        </div>
      )}

      {/* 4. Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={isAddingToCart}
        className="font-open-sans flex h-[35px] w-full items-center justify-center rounded-lg bg-[#1b6db4] font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isAddingToCart ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : (
          "Add To Cart"
        )}
      </button>
    </div>
  );

  // Desktop Layout Components (original)
  const Layout1Content = () => (
    <>
      {paymentOption && (
        <div className="flex items-center gap-5">
          <span
            className="inline-block rounded-[48.28px] px-7 py-2.5 text-[14px] font-bold"
            style={{ backgroundColor: "#FFA8CD", color: "var(--dark-gray)" }}
          >
            {paymentOption.service}
          </span>
          <div>
            <span className="text-gray lg:text-[20px]">
              Make {paymentOption.installments} Payments Of <br />£
              {formatPrice(paymentOption.amount)}
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-[#999999] lg:text-[20px]">
            £{formatPrice(price)}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-[10px] text-gray-500 line-through lg:text-sm">
              £{formatPrice(originalPrice)}
            </span>
          )}
        </div>
        {deliveryInfo && (
          <span className="line-clamp-1 inline-block rounded-xl bg-[#56748e] px-4 py-2 text-xs font-medium text-white">
            {deliveryInfo}
          </span>
        )}
      </div>
    </>
  );

  const Layout2Content = () => (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-[#999999] lg:text-[20px]">
            £{formatPrice(price)}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-[10px] text-gray-500 line-through lg:text-sm">
              £{formatPrice(originalPrice)}
            </span>
          )}
        </div>
        {deliveryInfo && (
          <span className="line-clamp-1 inline-block rounded-xl bg-[#56748e] px-4 py-2 text-xs font-medium text-white">
            {deliveryInfo}
          </span>
        )}
      </div>

      {paymentOption && (
        <div className="flex items-center gap-5">
          <span
            className="inline-block rounded-[48.28px] px-7 py-2.5 text-[14px] font-bold"
            style={{ backgroundColor: "#FFA8CD", color: "#222222" }}
          >
            {paymentOption.service}
          </span>
          <div>
            <span className="text-[#999999] lg:text-[20px]">
              Make {paymentOption.installments} Payments Of <br />£
              {formatPrice(paymentOption.amount)}
            </span>
          </div>
        </div>
      )}
    </>
  );

  const DesktopLayout = () => (
    <div className="space-y-3">
      {/* Product Name and Rating Row */}
      <div className="flex items-center justify-between">
        <Link href={`/products/${id}`}>
          <h3 className="font-bebas text-dark-gray hover:text-blue line-clamp-1 text-xl uppercase transition-colors md:text-[34px]">
            {name}
          </h3>
        </Link>
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-600">{rating}</span>
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        </div>
      </div>
      {/* Render layout based on variant */}
      {variant === "layout1" ? <Layout1Content /> : <Layout2Content />}
      {/* Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        disabled={isAddingToCart}
        variant="primary"
        size="sm"
        rounded="full"
        className="bg-blue font-open-sans hover:bg-blue/80 relative flex h-[50px] w-full cursor-pointer items-center justify-start rounded-full px-4 font-medium text-white transition-colors ease-in-out disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span>{isAddingToCart ? "Adding..." : "Add To Cart"}</span>

        <div className="absolute top-1/2 right-2 -translate-y-1/2">
          {isAddingToCart ? (
            <Loader2 className="h-[30px] w-[30px] animate-spin rounded-full bg-white p-2 md:h-[40px] md:w-[40px]" />
          ) : (
            <Image
              src="/arrow-right.png"
              alt="arrow-right"
              width={20}
              height={20}
              className="h-[30px] w-[30px] rounded-full bg-white object-contain p-2 md:h-[40px] md:w-[40px]"
            />
          )}
        </div>
      </Button>
    </div>
  );

  return (
    <div className={`overflow-hidden bg-transparent ${className}`}>
      <Link href={`/products/${id}`} className="block">
        {/* Product Image */}
        <div
          className={`group relative mb-3 ${
            className.includes("list-detailed-view") ||
            className.includes("grid-view")
              ? "h-[700px] md:h-[700px]"
              : "h-[160px] sm:h-[220px] md:h-[300px]"
          } w-full overflow-hidden rounded-lg bg-white`}
        >
          <Image
            src={imageSrc}
            alt={name}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-105"
          />

          {/* Discount Badge - Top Left */}
          {discount && (
            <div className="absolute top-2 left-2">
              <span className="bg-blue rounded px-2 py-1 text-xs font-bold text-white">
                {discount}
              </span>
            </div>
          )}

          {/* Wishlist Button - Top Right */}
          <div className="absolute top-2 right-2">
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <WishlistButton
                variant_id={variantId || id.toString()}
                product={{
                  name,
                  price,
                  image: imageSrc,
                  size,
                  color,
                  stock,
                }}
                size="sm"
                variant="ghost"
                className="rounded-full bg-white/80 p-2 hover:bg-white"
              />
            </div>
          </div>
        </div>
      </Link>

      {/* Product Info - Mobile vs Desktop */}
      <div className="md:hidden">
        <MobileLayout />
      </div>

      <div className="hidden md:block">
        <DesktopLayout />
      </div>
    </div>
  );
}
