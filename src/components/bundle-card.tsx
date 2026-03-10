"use client";

import React, { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "./button-custom";
import { Bundle } from "@/lib/api/bundles";
// import { useCart, useCartAnimationStore } from "@/lib/store/cart-store";
import { useCartStore, useCartAnimationStore } from "@/lib/store/cart-store";
import { formatPrice } from "@/lib/utils";

interface BundleCardProps {
  bundle: Bundle;
  variant?: "layout1" | "layout2";
  className?: string;
}

export function BundleCard({
  bundle,
  variant = "layout1",
  className = "",
}: BundleCardProps) {
    const [isAddingToCart, setIsAddingToCart] = useState(false);
const { addItemLocally, calculateTotals } = useCartStore();
const { addToCart } = useCartAnimationStore();
    

  // ─── Compute final price ──────────────────────────────
  const finalPrice =
    bundle.discount_value > 0
      ? bundle.discount_type === "percentage"
        ? bundle.bundleprice - (bundle.bundleprice * bundle.discount_value) / 100
        : bundle.bundleprice - bundle.discount_value
      : bundle.bundleprice;

  const hasDiscount = bundle.discount_value > 0;
  const discountLabel = hasDiscount
    ? bundle.discount_type === "percentage"
      ? `${bundle.discount_value}% off`
      : `£${bundle.discount_value} off`
    : null;

  // ─── Bundle image: bundleimage or first product image ─
  const mainImage =
    bundle.bundleimage ||
    bundle.products?.[0]?.images?.find((i) => i.type === "main")?.url ||
    bundle.products?.[0]?.images?.[0]?.url ||
    "/placeholder.svg";

  // ─── Items count label ────────────────────────────────
  const itemsLabel = `${bundle.products.length} item${bundle.products.length !== 1 ? "s" : ""} included`;

  // ─── Klarna installments ──────────────────────────────
  const klarnaAmount = Math.round((finalPrice / 3) * 100) / 100;

  const handleAddToCart = () => {
  setIsAddingToCart(true);
  try {
    const bundleCartItem = {
      id: bundle.id,
      variant_id: bundle.id,
      name: bundle.bundlename,
      price: finalPrice,
      quantity: 1,
      assembly_required: false,
      image: mainImage,
      size: undefined,
      color: undefined,
      stock: 999,
      assemble_charges: 0,
      delivery_time_days: "Bundle",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addItemLocally(bundleCartItem);
    calculateTotals();
    toast.success(`${bundle.bundlename} added to cart!`);
    addToCart({ item: bundle.bundlename, type: "bundle" });
  } catch {
    toast.error("Failed to add to cart");
  } finally {
    setIsAddingToCart(false);
  }
};

  const fmt = (amount: number) => amount.toFixed(2);

  // ─── Mobile Layout ────────────────────────────────────
  const MobileLayout = () => (
    <div className="space-y-3">
      <Link href={`/bundles/${bundle.id}`}>
        <h3 className="font-bebas text-dark-gray hover:text-blue overflow-hidden text-lg leading-tight text-ellipsis whitespace-nowrap uppercase transition-colors">
          {bundle.bundlename}
        </h3>
      </Link>

      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-[#222222]">
            £{fmt(finalPrice)}
          </span>
          {hasDiscount && (
            <span className="text-base text-gray-500 line-through">
              £{fmt(bundle.bundleprice)}
            </span>
          )}
        </div>
        <div className="line-clamp-1 inline-block rounded-xl bg-[#3293a8] px-4 py-2 text-xs font-medium text-white">
          {itemsLabel}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-block rounded px-2 py-1 text-xs font-bold"
            style={{ backgroundColor: "#FFA8CD", color: "#222222" }}
          >
            Klarna
          </span>
        </div>
        <div className="text-xs text-gray-600">
          Make 3 payments of £{fmt(klarnaAmount)}
        </div>
      </div>

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

  // ─── Desktop Layout1 Content ──────────────────────────
  const Layout1Content = () => (
    <>
      <div className="flex items-center gap-5">
        <span
          className="inline-block rounded-[48.28px] px-7 py-2.5 text-[14px] font-bold"
          style={{ backgroundColor: "#FFA8CD", color: "var(--dark-gray)" }}
        >
          Klarna
        </span>
        <div>
          <span className="text-gray lg:text-[20px]">
            Make 3 Payments Of <br />£{fmt(klarnaAmount)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-[#999999] lg:text-[20px]">
            £{fmt(finalPrice)}
          </span>
          {hasDiscount && (
            <span className="text-[10px] text-gray-500 line-through lg:text-sm">
              £{fmt(bundle.bundleprice)}
            </span>
          )}
        </div>
        <span className="line-clamp-1 inline-block rounded-xl bg-[#56748e] px-4 py-2 text-xs font-medium text-white">
          {itemsLabel}
        </span>
      </div>
    </>
  );

  // ─── Desktop Layout2 Content ──────────────────────────
  const Layout2Content = () => (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-[#999999] lg:text-[20px]">
            £{fmt(finalPrice)}
          </span>
          {hasDiscount && (
            <span className="text-[10px] text-gray-500 line-through lg:text-sm">
              £{fmt(bundle.bundleprice)}
            </span>
          )}
        </div>
        <span className="line-clamp-1 inline-block rounded-xl bg-[#56748e] px-4 py-2 text-xs font-medium text-white">
          {itemsLabel}
        </span>
      </div>

      <div className="flex items-center gap-5">
        <span
          className="inline-block rounded-[48.28px] px-7 py-2.5 text-[14px] font-bold"
          style={{ backgroundColor: "#FFA8CD", color: "#222222" }}
        >
          Klarna
        </span>
        <div>
          <span className="text-[#999999] lg:text-[20px]">
            Make 3 Payments Of <br />£{fmt(klarnaAmount)}
          </span>
        </div>
      </div>
    </>
  );

  // ─── Desktop Layout ───────────────────────────────────
  const DesktopLayout = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Link href={`/bundles/${bundle.id}`}>
          <h3 className="font-bebas text-dark-gray hover:text-blue line-clamp-1 text-xl uppercase transition-colors md:text-[34px]">
            {bundle.bundlename}
          </h3>
        </Link>
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-600">4.9</span>
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        </div>
      </div>

      {variant === "layout1" ? <Layout1Content /> : <Layout2Content />}

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
      {/* Image — clicking navigates to bundle detail */}
      <Link href={`/bundles/${bundle.id}`} className="block">
        <div
          className={`group relative mb-3 h-[160px] sm:h-[220px] md:h-[300px] w-full overflow-hidden rounded-lg bg-white`}
        >
          <Image
            src={mainImage}
            alt={bundle.bundlename}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-105"
          />

          {/* Discount Badge */}
          {discountLabel && (
            <div className="absolute top-2 left-2">
              <span className="bg-blue rounded px-2 py-1 text-xs font-bold text-white">
                {discountLabel}
              </span>
            </div>
          )}

          {/* Products count badge - top right */}
          <div className="absolute top-2 right-2">
            <span className="rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white">
              {bundle.products.length} items
            </span>
          </div>
        </div>
      </Link>

      {/* Info - Mobile */}
      <div className="md:hidden">
        <MobileLayout />
      </div>

      {/* Info - Desktop */}
      <div className="hidden md:block">
        <DesktopLayout />
      </div>
    </div>
  );
}