"use client";

import { Button } from "@/components/ui/button";
import { useWishlist } from "@/lib/store/wishlist-store";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface WishlistButtonProps {
  variant_id: string;
  product?: {
    name: string;
    price?: number;
    image?: string;
    size?: string;
    color?: string;
    stock?: number;
  };
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  className?: string;
  disabled?: boolean;
  showText?: boolean;
}

export function WishlistButton({
  variant_id,
  product,
  size = "default",
  variant: buttonVariant = "outline",
  className,
  disabled = false,
  showText = false,
}: WishlistButtonProps) {
  const { isInWishlist, toggleItem, isItemLoading } = useWishlist();

  const isInList = isInWishlist(variant_id);
  const isLoading = isItemLoading(variant_id);

  const handleToggleWishlist = async () => {
    try {
      const added = await toggleItem(
        variant_id,
        product
          ? {
              name: product.name,
              price: product.price,
              image: product.image,
              size: product.size,
              color: product.color,
              stock: product.stock,
            }
          : undefined
      );

      if (added) {
        toast.success(
          product ? `Added ${product.name} to wishlist` : "Added to wishlist"
        );
      } else {
        toast.success(
          product
            ? `Removed ${product.name} from wishlist`
            : "Removed from wishlist"
        );
      }
    } catch (error) {
      toast.error("Failed to update wishlist", {
        description:
          error instanceof Error ? error.message : "Something went wrong",
      });
    }
  };

  const isDisabled = disabled || isLoading;

  return (
    <Button
      variant={buttonVariant}
      size={size}
      onClick={handleToggleWishlist}
      disabled={isDisabled}
      className={cn(
        "cursor-pointer transition-colors hover:bg-transparent",
        isInList && "text-blue hover:text-blue",
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Image
          src={isInList ? "/fav-filled.png" : "/fav.png"}
          alt={isInList ? "Remove from wishlist" : "Add to wishlist"}
          width={40}
          height={40}
          className="h-6 w-6 transition-all md:h-10 md:w-10"
        />
      )}
      {showText && (
        <span className="ml-2">
          {isInList ? "Remove from Wishlist" : "Add to Wishlist"}
        </span>
      )}
    </Button>
  );
}
