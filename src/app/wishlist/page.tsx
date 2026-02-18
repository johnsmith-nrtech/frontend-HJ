"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  Loader2,
  ChevronRight,
  AlertCircle,
  Trash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/lib/store/wishlist-store";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import { toast } from "sonner";
import Image from "next/image";

export default function WishlistPage() {
  const {
    items,
    totalItems,
    isLoading,
    error,
    removeItem,
    clearWishlist,
    isItemLoading,
  } = useWishlist();

  if (isLoading && items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center px-4 py-12">
          <Loader2 className="mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (totalItems === 0 && !isLoading) {
    return (
      <div className="px-[32px] py-12">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink className="font-medium">Wishlist</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="bg-muted/50 flex flex-col items-center justify-center rounded-lg px-4 py-12">
          <div className="relative mb-6">
            <div className="bg-muted flex h-24 w-24 items-center justify-center rounded-full">
              <Heart className="text-muted-foreground h-12 w-12" />
            </div>
          </div>
          <h1 className="mb-4 text-2xl font-bold">Your wishlist is empty</h1>
          <p className="text-muted-foreground mb-8 max-w-md text-center">
            Save your favorite products to your wishlist and easily find them
            later.
          </p>
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/products">Discover Products</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleClearWishlist = async () => {
    try {
      await clearWishlist();
      toast.success("Wishlist cleared successfully");
    } catch {
      // Error handling is done in the store
    }
  };

  return (
    <div className="px-[32px] py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink className="font-medium">Wishlist</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-bebas text-3xl">My Wishlist</h1>
          <p className="text-muted-foreground mt-1">
            {totalItems} {totalItems === 1 ? "item" : "items"} saved
          </p>
        </div>
        {isLoading && (
          <div className="text-muted-foreground flex items-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Syncing...
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
        {totalItems > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearWishlist}
            disabled={isLoading}
            className="text-muted-foreground hover:text-destructive"
          >
            Clear Wishlist
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <Card key={item.id} className="group overflow-hidden">
            <div className="relative aspect-square overflow-hidden">
              {item.image ? (
                <Image
                  src={item.image}
                  fill
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="bg-muted flex h-full w-full items-center justify-center">
                  <span className="text-muted-foreground">No Image</span>
                </div>
              )}

              {/* Wishlist button overlay */}
              <div className="absolute top-3 right-3">
                <WishlistButton
                  variant_id={item.variant_id}
                  product={{ name: item.name }}
                  size="sm"
                  variant="ghost"
                  className="!hover:bg-transparent bg-none"
                />
              </div>

              {/* Stock badge */}
              {item.stock !== undefined && (
                <div className="absolute top-3 left-3">
                  <Badge
                    variant={item.stock > 0 ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {item.stock > 0 ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>
              )}
            </div>

            <CardContent className="p-4">
              <Link
                href={`/products/${item.variant_id}`}
                className="group-hover:text-primary block transition-colors"
              >
                <h3 className="mb-2 line-clamp-2 text-lg font-medium">
                  {item.name}
                </h3>
              </Link>

              <div className="mb-3 flex gap-2">
                {item.size && (
                  <Badge variant="outline" className="text-xs">
                    {item.size}
                  </Badge>
                )}
                {item.color && (
                  <Badge variant="outline" className="text-xs">
                    {item.color}
                  </Badge>
                )}
              </div>

              <div className="mb-4 flex items-center justify-between">
                <p className="text-lg font-bold">£{item.price.toFixed(2)}</p>
                {item.stock !== undefined && item.stock > 0 && (
                  <span className="text-muted-foreground text-sm">
                    {item.stock} available
                  </span>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex gap-2 p-4 pt-0">
              <AddToCartButton
                variant_id={item.variant_id}
                product={{
                  id: item.variant_id,
                  name: item.name,
                  price: item.price,
                  image: item.image,
                  size: item.size,
                  color: item.color,
                  stock: item.stock,
                  variant: item,
                }}
                size="sm"
                className="flex-1"
                disabled={item.stock !== undefined && item.stock <= 0}
              />

              <Button
                variant="outline"
                size="sm"
                onClick={() => removeItem(item.id)}
                disabled={isItemLoading(item.variant_id)}
                className="px-3"
              >
                {isItemLoading(item.variant_id) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash className="h-4 w-4" />
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Additional actions */}
      {totalItems > 0 && (
        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/products">
                <Image
                  src="/n-3.png"
                  alt="cart"
                  width={20}
                  height={20}
                  className="invert"
                />
                Continue Shopping
              </Link>
            </Button>
            <Button variant="outline" size="lg" onClick={handleClearWishlist}>
              <Heart className="mr-2 h-4 w-4" />
              Clear All Items
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
