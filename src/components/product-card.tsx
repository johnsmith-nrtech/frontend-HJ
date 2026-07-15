"use client";

import React, { useState } from "react";
import { Star, Loader2, Heart, Truck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart, useCartAnimationStore } from "@/lib/store/cart-store";
import { useWishlist } from "@/lib/store/wishlist-store";
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
  showInstallments?: boolean;
}

export function ProductCard({
  id,
  name,
  price,
  originalPrice,
  imageSrc = "/placeholder.svg",
  rating = 4.9,
  discount,
  deliveryInfo = "3-5 days",
  paymentOption,
  variant = "layout1",
  className = "",
  variantId,
  size,
  color,
  stock,
  assemble_charges,
  showInstallments = true,
}: ProductCardProps) {
  const { addItem } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCartAnimationStore();
  const [isSelectingQty, setIsSelectingQty] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { isInWishlist: checkWishlist, toggleItem, isItemLoading } = useWishlist();
  const isInWishlist = checkWishlist(variantId || id.toString());
  const isWishlistLoading = isItemLoading(variantId || id.toString());

  const toggleWishlistItem = async () => {
    try {
      const added = await toggleItem(variantId || id.toString(), {
        name,
        price,
        image: imageSrc,
        size,
        color,
        stock,
      });
      toast.success(added ? `Added ${name} to wishlist` : `Removed ${name} from wishlist`);
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  const handleAddToCart = async () => {
    if (!variantId) {
      toast.error("Variant ID is missing");
      return;
    }

    // Calculate final discounted price
    const finalPrice = price;

    setIsAddingToCart(true);
    try {
      await addItem(
      {
        id: variantId,
        name,
        price: finalPrice,
        image: imageSrc,
        variant_id: variantId,
        size,
        color,
        stock,
        assembly_required: false,
        assemble_charges: assemble_charges,
        show_installments: showInstallments,
      },
      quantity,
    );
      toast.success(`${name} added to cart!`);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error("Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
      setIsSelectingQty(false);
      setQuantity(1);
      addToCart({ item: "item added" });
    }
  };


  // first click reveals the quantity stepper, second click (outside +/-) confirms
  const handleButtonClick = () => {
    if (!isSelectingQty) {
      setIsSelectingQty(true);
      return;
    }
    handleAddToCart();
  };

  const incrementQty = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity((q) => q + 1);
  };

  const decrementQty = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity((q) => Math.max(1, q - 1));
  };


  const formatPrice = (amount: number) => {
    return `${amount.toFixed(2)}`;
  };

  // Mobile Layout Component
  const MobileLayout = () => (
    <div className="space-y-3">
      {/* 1. Product Name (Title) */}
      <Link href={`/products/${id}`}>
        <h3
          className="font-bebas text-dark-gray hover:text-blue text-lg leading-tight uppercase transition-colors break-words w-full"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "2.6rem", // reserves space for 2 lines so 1-line titles don't shrink the card
          }}
        >
          {name}
        </h3>
      </Link>

      <div style={{ minHeight: "90px", display: "flex", alignItems: "flex-start" }}>
        {/* Left: price */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <span className="font-bold text-red-500 text-[18px] mt-8">
            £{formatPrice(price)}
          </span>
          {showInstallments && (
            <span className="line-clamp-1 inline-flex items-center gap-1 rounded-xl bg-[#3293a8] px-2 py-1 text-xs font-medium text-white w-fit mt-1">
              <Truck className="h-3 w-3 shrink-0" />
              {deliveryInfo}
            </span>
          )}
        </div>

        {/* Right side */}
        {showInstallments ? (
          <>
            <div style={{ width: "1px", alignSelf: "stretch", backgroundColor: "#dc2626", flexShrink: 0, margin: "0 8px" }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingTop: "14px" }}>
              <span className="text-xs text-gray-400">36 monthly payments of</span>
              <span className="text-[18px] font-bold text-red-500">
                £{((price * 0.9) / 36).toFixed(2)}
              </span>
              <span className="text-xs text-gray-400">0% APR - 10% deposit.</span>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", alignItems: "flex-end" }}>
            <span className="line-clamp-1 inline-block mt-8 rounded-xl bg-[#3293a8] px-2 py-1 text-xs font-medium text-white w-fit">
              {deliveryInfo}
            </span>
          </div>
        )}
      </div>

      {/* 4. Add to Cart Button */}
      <button
        onClick={handleButtonClick}
        disabled={isAddingToCart}
        className="font-open-sans flex h-[35px] w-full items-center justify-center rounded-lg border border-transparent bg-[#1b6db4] font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isAddingToCart ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : isSelectingQty ? (
          <div className="flex w-full items-center justify-between px-4">
            <button onClick={decrementQty} className="px-2 text-lg leading-none">
              −
            </button>
            <span>{quantity}</span>
            <button onClick={incrementQty} className="px-2 text-lg leading-none">
              +
            </button>
          </div>
        ) : (
          "Add To Cart"
        )}
      </button>

      {/* Add to Wishlist Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlistItem();
        }}
        disabled={isWishlistLoading}
        className="font-open-sans flex h-[35px] w-full items-center justify-center gap-1 rounded-lg border border-blue font-medium text-blue transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isWishlistLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          isInWishlist ? "Remove From Wishlist" : "Add To Wishlist"
        )}
      </button>
    </div>
  );

  // Desktop Layout Component
  const DesktopLayout = () => {
    return (
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

        <div style={{ minHeight: "70px", display: "flex", alignItems: "flex-start" }}>
          {/* Left: price + delivery */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <span className="font-bold text-red-500 text-[20px] mt-4">
              £{formatPrice(price)}
            </span>
            {showInstallments && (
              <span className="line-clamp-1 inline-flex items-center gap-1 rounded-xl bg-[#56748e] px-2 py-1 text-xs font-medium text-white w-fit mt-1">
                <Truck className="h-3 w-3 shrink-0" />
                {deliveryInfo}
              </span>
            )}
          </div>

          {/* Right side: divider + installments OR delivery badge */}
          {showInstallments ? (
            <>
              <div style={{ width: "1px", borderLeft: "1px solid #dc2626", alignSelf: "stretch", flexShrink: 0, margin: "0 10px" }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <span className="text-xs text-gray-400">36 monthly payments of</span>
                <span className="text-[20px] font-bold text-red-500">
                  £{((price * 0.9) / 36).toFixed(2)}
                </span>
                <span className="text-xs text-gray-400">0% APR - 10% deposit.</span>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", alignItems: "flex-end" }}>
              <span className="line-clamp-1 inline-block mt-5 rounded-xl bg-[#56748e] px-2 py-1 text-xs font-medium text-white w-fit">
                {deliveryInfo}
              </span>
            </div>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleButtonClick}
          disabled={isAddingToCart}
          variant="primary"
          size="sm"
          rounded="full"
          className="bg-blue font-open-sans hover:bg-blue/80 relative flex h-[50px] w-full cursor-pointer items-center justify-start rounded-full px-4 font-bold text-white transition-colors ease-in-out disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isAddingToCart ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : isSelectingQty ? (
              <div
                className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-4"
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={decrementQty} className="text-xl leading-none">
                  −
                </button>
                <span className="min-w-[1.5ch] text-center">{quantity}</span>
                <button onClick={incrementQty} className="text-xl leading-none">
                  +
                </button>
              </div>
            ) : (
              <>
                <span>Add To Cart</span>
                <div className="absolute top-1/2 right-2 -translate-y-1/2">
                  <Image
                    src="/arrow-right.png"
                    alt="arrow-right"
                    width={20}
                    height={20}
                    className="h-[30px] w-[30px] rounded-full bg-white object-contain p-2 md:h-[40px] md:w-[40px]"
                  />
                </div>
              </>
            )}
        </Button>

        {/* Add to Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlistItem();
          }}
          disabled={isWishlistLoading}
          className="font-open-sans relative flex h-[50px] w-full cursor-pointer items-center justify-start rounded-full border border-blue px-4 font-medium text-blue transition-colors ease-in-out hover:bg-blue/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>{isInWishlist ? "Remove From Wishlist" : "Add To Wishlist"}</span>
          <div className="absolute top-1/2 right-2 -translate-y-1/2">
            {isWishlistLoading ? (
              <Loader2 className="h-[30px] w-[30px] rounded-full bg-blue/10 p-2 text-blue md:h-[40px] md:w-[40px] animate-spin" />
            ) : (
              <Image
                src={isInWishlist ? "/fav-filled.png" : "/fav.png"}
                alt={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                width={40}
                height={40}
                className="h-[30px] w-[30px] rounded-full bg-blue/10 object-contain p-2 md:h-[40px] md:w-[40px]"
              />
            )}
          </div>
        </button>
      </div>
    );
  };

  return (
    <div className={`overflow-hidden bg-transparent ${className}`}>
      <Link href={`/products/${id}`} className="block">
        {/* Product Image */}
        <div
          className={`group relative mb-3 ${
            className.includes("list-detailed-view") || className.includes("grid-view")
              ? "h-[700px] md:h-[700px]"
              : "h-[160px] sm:h-[220px] md:h-[300px]"
          } w-full overflow-hidden rounded-lg bg-white`}
        >
          <Image
            src={imageSrc}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Discount Badge - Top Left */}
          {discount && (
            <div className="absolute top-2 left-2">
              <span className="bg-blue rounded px-2 py-1 text-xs font-bold text-white">
                {discount}
              </span>
            </div>
          )}
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