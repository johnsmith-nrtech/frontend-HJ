"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/store/cart-store";
import { Plus, Minus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface AddToCartButtonProps {
  variant_id: string;
  product: {
    id: string;
    name: string;
    price: number;
    image?: string;
    size?: string;
    color?: string;
    stock?: number;
    variant: {
      color?: string;
      size?: string;
      material?: string;
      delivery_time_days?: string;
      assemble_charges?: number;
      sku?: string;
      availableColors?: string[];
    };
  };
  quantity?: number;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  className?: string;
  disabled?: boolean;
  showQuantityControls?: boolean;
}

export function AddToCartButton({
  variant_id,
  product,
  quantity = 1,
  size = "default",
  variant: buttonVariant = "default",
  className,
  disabled = false,
  showQuantityControls = false,
}: AddToCartButtonProps) {
  const [localQuantity, setLocalQuantity] = useState(quantity);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = async () => {
    if (!variant_id) {
      toast.error("Please select a product variant");
      return;
    }

    setIsAdding(true);
    try {
      await addItem(
        {
          id: variant_id,
          name: product.name,
          price: product.price,
          image: product.image,
          variant_id: variant_id,
          size: product.size,
          color: product.color,
          stock: product.stock,
          assembly_required: false,
          assemble_charges: product.variant.assemble_charges,
          variant: {
            color: product.variant.color,
            size: product.variant.size,
            material: product.variant.material,
            delivery_time_days: product.variant.delivery_time_days,
            assemble_charges: product.variant.assemble_charges,
            sku: product.variant.sku,
            availableColors: product.variant.availableColors,
          },
        },
        localQuantity
      );
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      console.error("Failed to add to cart:", err);
      toast.error("Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  const incrementQuantity = () => {
    if (product.stock && localQuantity >= product.stock) {
      toast.error("Cannot add more items", {
        description: `Only ${product.stock} items available in stock`,
      });
      return;
    }
    setLocalQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    if (localQuantity > 1) {
      setLocalQuantity((prev) => prev - 1);
    }
  };

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;
  const isDisabled = disabled || isOutOfStock || isAdding;

  if (showQuantityControls) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex items-center rounded-md border">
          <Button
            variant="ghost"
            size="sm"
            onClick={decrementQuantity}
            disabled={localQuantity <= 1 || isDisabled}
            className="h-8 w-8 p-0"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="min-w-[3ch] px-3 py-1 text-center text-sm font-medium">
            {localQuantity}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={incrementQuantity}
            disabled={
              isDisabled ||
              Boolean(product.stock && localQuantity >= product.stock)
            }
            className="h-8 w-8 p-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        <Button
          variant={buttonVariant}
          size={size}
          onClick={handleAddToCart}
          disabled={isDisabled}
          className="flex-1"
        >
          {isAdding ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Image
              src="/n-3.png"
              alt="cart"
              width={20}
              height={20}
              className="invert"
            />
          )}
          {isOutOfStock
            ? "Out of Stock"
            : isAdding
              ? "Adding..."
              : "Add to Cart"}
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant={buttonVariant}
      size={size}
      onClick={handleAddToCart}
      disabled={isDisabled}
      className={className}
    >
      {isAdding ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Image
          src="/n-3.png"
          alt="cart"
          width={20}
          height={20}
          className="invert"
        />
      )}
      {isOutOfStock ? "Out of Stock" : isAdding ? "Adding..." : "Add to Cart"}
    </Button>
  );
}
