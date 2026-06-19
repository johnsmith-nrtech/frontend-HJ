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


const handleAddToCart = async () => {
  if (!variantId) {
    toast.error("Variant ID is missing");
    return;
  }
  
  // Calculate final discounted price
  let finalPrice = price;
  
  setIsAddingToCart(true);
  try {
    await addItem({
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
      show_installments: showInstallments
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
        <h3 className="font-bebas text-dark-gray hover:text-blue text-lg leading-tight uppercase transition-colors break-words w-full" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {name}
        </h3>
      </Link>
      {/* 2. Prices */}
      {/* <div className="space-y-1">
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

      <div className="text-xs text-gray-600">
        {showInstallments ? `Finance from £${((price * 0.90) / 36).toFixed(2)}/month over 36 months` : '\u00A0'}
      </div> */}


      <div style={{ minHeight: '90px', display: 'flex', alignItems: 'flex-start' }}>
        {/* Left: price */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <span className="font-bold text-blue-700 text-[18px] mt-8">
            £{formatPrice(price)}
          </span>
          {showInstallments && (
            // <span className="line-clamp-1 inline-block rounded-xl bg-[#3293a8] px-2 py-1 text-xs 
            // font-medium text-white w-fit mt-1">
            //   {deliveryInfo}
            // </span>
            <span className="line-clamp-1 inline-flex items-center gap-1 rounded-xl bg-[#3293a8] px-2 py-1 text-xs font-medium text-white w-fit mt-1">
              <Truck className="h-3 w-3 shrink-0" />
              {deliveryInfo}
            </span>
          )}
        </div>

        {/* Right side */}
        {showInstallments ? (
          <>
            {/* <div style={{ width: '3px', alignSelf: 'stretch', backgroundColor: '#2563eb', flexShrink: 0, margin: '0 8px' }} /> */}
            <div style={{ width: '1px', alignSelf: 'stretch', backgroundColor: '#2563eb', flexShrink: 0, margin: '0 8px' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <span className="text-xs text-gray-400">36 monthly payments of</span>
              <span className="text-[18px] font-bold text-blue-700">
                £{((price * 0.90) / 36).toFixed(2)}
              </span>
              <span className="text-xs text-gray-400">0% APR - 10% deposit.</span>
            </div>
          </>
          ) : (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
            {!showInstallments && (
              <span className="line-clamp-1 inline-block mt-8 rounded-xl bg-[#3293a8] px-2 py-1 text-xs font-medium text-white w-fit">
                {deliveryInfo}
              </span>
            )}
          </div>
        )}
      </div>

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
  // const Layout1Content = () => (
  //   <>
  //     <div style={{ height: '32px', display: 'flex', alignItems: 'center', borderBottom: showInstallments ? '2px solid #2563eb' : '2px solid transparent' }} className="text-[12px] lg:text-[14px] text-gray-500">
  //       {showInstallments ? `Finance from £${((price * 0.90) / 36).toFixed(2)}/month over 36 months` : ''}
  //     </div>
      
  //     <div className="flex items-center justify-between">
  //       <div className="flex items-baseline gap-2">
  //         <span className="text-[#999999] lg:text-[20px]">
  //           £{formatPrice(price)}
  //         </span>
  //         {originalPrice && originalPrice > price && (
  //           <span className="text-[10px] text-gray-500 line-through lg:text-sm">
  //             £{formatPrice(originalPrice)}
  //           </span>
  //         )}
  //       </div>
  //       {deliveryInfo && (
  //         <span className="line-clamp-1 inline-block rounded-xl bg-[#56748e] px-4 py-2 text-xs font-medium text-white">
  //           {deliveryInfo}
  //         </span>
  //       )}
  //     </div>
  //   </>
  // );


  // const Layout2Content = () => (
  //   <>
  //     <div style={{ height: '32px', display: 'flex', alignItems: 'center', borderBottom: showInstallments ? '2px solid #2563eb' : '2px solid transparent' }} className="text-[12px] lg:text-[14px] text-gray-500">
  //       {showInstallments ? `Finance from £${((price * 0.90) / 36).toFixed(2)}/month over 36 months` : ''}
  //     </div>
      
  //     <div className="flex items-center justify-between">
  //       <div className="flex items-baseline gap-2">
  //         <span className="text-[#999999] lg:text-[20px]">
  //           £{formatPrice(price)}
  //         </span>
  //         {originalPrice && originalPrice > price && (
  //           <span className="text-[10px] text-gray-500 line-through lg:text-sm">
  //             £{formatPrice(originalPrice)}
  //           </span>
  //         )}
  //       </div>
  //       {deliveryInfo && (
  //         <span className="line-clamp-1 inline-block rounded-xl bg-[#56748e] px-4 py-2 text-xs font-medium text-white">
  //           {deliveryInfo}
  //         </span>
  //       )}
  //     </div>
  //   </>
  // );


  const DesktopLayout = () => {
    const { isInWishlist: checkWishlist, toggleItem, isItemLoading } = useWishlist();
    const isInWishlist = checkWishlist(variantId || id.toString());
    const isWishlistLoading = isItemLoading(variantId || id.toString());

    const toggleWishlistItem = async () => {
      try {
        const added = await toggleItem(variantId || id.toString(), { name, price, image: imageSrc, size, color, stock });
        toast.success(added ? `Added ${name} to wishlist` : `Removed ${name} from wishlist`);
      } catch {
        toast.error("Failed to update wishlist");
      }
    };

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

      <div style={{ minHeight: '70px', display: 'flex', alignItems: 'flex-start' }}>
        {/* Left: price + delivery */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <span className="font-bold text-blue-700 text-[20px] mt-4">
            £{formatPrice(price)}
          </span>
          {showInstallments && (
            // <span className="line-clamp-1 inline-block rounded-xl bg-[#56748e] px-2 py-1 text-xs font-medium text-white w-fit mt-1">
            //   {deliveryInfo}
            // </span>
            <span className="line-clamp-1 inline-flex items-center gap-1 rounded-xl bg-[#56748e] px-2 py-1 text-xs font-medium text-white w-fit mt-1">
              <Truck className="h-3 w-3 shrink-0" />
              {deliveryInfo}
            </span>
          )}
        </div>

        {/* Right side: divider + installments OR delivery badge justify-between */}
        {showInstallments ? (
          <>
            {/* <div style={{ width: '1px', borderLeft: '3px solid #2563eb', alignSelf: 'stretch', flexShrink: 0, margin: '0 10px' }} /> */}
            <div style={{ width: '1px', borderLeft: '1px solid #2563eb', alignSelf: 'stretch', flexShrink: 0, margin: '0 10px' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span className="text-xs text-gray-400">36 monthly payments of</span>
                <span className="text-[20px] font-bold text-blue-700">
                  £{((price * 0.90) / 36).toFixed(2)}
                </span>
                <span className="text-xs text-gray-400">0% APR - 10% deposit.</span>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
            {!showInstallments && (
              <span className="line-clamp-1 inline-block mt-5 rounded-xl bg-[#56748e] px-2 py-1 text-xs font-medium text-white w-fit">
                {deliveryInfo}
              </span>
            )}
          </div>
        )}
      </div>

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
}


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

          {/* Wishlist Button - Top Right */}
          {/* <div className="absolute top-2 right-2">
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
                className="rounded-full bg-white !p-1 !h-7 !w-7 [&_svg]:h-6 [&_svg]:w-6"
              />
            </div>
          </div> */}
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
