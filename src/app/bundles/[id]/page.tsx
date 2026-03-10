// src/app/bundles/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useBundle } from "@/hooks/use-bundles";
import { BundleProduct } from "@/lib/api/bundles";
import {
  ArrowLeft,
  Package,
  Tag,
  CheckCircle2,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";

function BundleProductCard({ product }: { product: BundleProduct }) {
  const mainImage =
    product.images?.find((img) => img.type === "main")?.url ||
    product.images?.[0]?.url;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50">
        {mainImage ? (
          <Image fill src={mainImage} alt={product.name} className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-8 w-8 text-gray-300" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="truncate font-medium text-gray-900">{product.name}</h4>
        {product.description && (
          <p className="mt-0.5 line-clamp-2 text-sm text-gray-500">
            {product.description}
          </p>
        )}
        <div className="mt-1 flex items-center gap-2">
          <span className="font-semibold text-gray-900">
            {formatPrice(product.base_price)}
          </span>
          {/* {product.discount_offer && product.discount_offer > 0 && (
            <Badge variant="secondary" className="text-xs">
              {product.discount_offer}% off
            </Badge>
          )} */}
        </div>
      </div>
      <Link href={`/products/${product.id}`}>
        <Button className="cursor-pointer" variant="outline" size="sm">
          View
        </Button>
      </Link>
    </div>
  );
}

export default function BundleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bundleId = params.id as string;

  const { data: bundle, isLoading, isError } = useBundle(bundleId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-32 rounded bg-gray-200" />
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="aspect-[4/3] rounded-2xl bg-gray-200" />
              <div className="space-y-4">
                <div className="h-8 w-3/4 rounded bg-gray-200" />
                <div className="h-4 w-full rounded bg-gray-200" />
                <div className="h-4 w-2/3 rounded bg-gray-200" />
                <div className="h-12 w-1/2 rounded bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !bundle) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
        <Package className="h-16 w-16 text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-700">Bundle not found</h2>
        <Button onClick={() => router.push("/bundles")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Bundles
        </Button>
      </div>
    );
  }

  const finalPrice =
    bundle.discount_value > 0
      ? bundle.discount_type === "percentage"
        ? bundle.bundleprice -
          (bundle.bundleprice * bundle.discount_value) / 100
        : bundle.bundleprice - bundle.discount_value
      : bundle.bundleprice;

  const totalProductsValue = bundle.products.reduce(
    (sum, p) => sum + p.base_price,
    0
  );
  const savings = totalProductsValue - finalPrice;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link
          href="/bundles"
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Bundles
        </Link>

        {/* Main layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left - Image */}
          <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-white shadow-sm">
              {bundle.bundleimage ? (
                <Image
                  fill
                  src={bundle.bundleimage}
                  alt={bundle.bundlename}
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gray-50">
                  <Package className="h-20 w-20 text-gray-200" />
                  <p className="text-sm text-gray-400">No image</p>
                </div>
              )}

              {bundle.discount_value > 0 && (
                <div className="absolute left-4 top-4">
                  <span className="rounded-full bg-red-500 px-4 py-1.5 text-sm font-bold text-white shadow">
                    {bundle.discount_type === "percentage"
                      ? `${bundle.discount_value}% OFF`
                      : `£${bundle.discount_value} OFF`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right - Info */}
          <div className="flex flex-col">
            <div className="mb-3 flex items-center gap-2">
              <Badge
                variant={
                  bundle.bundlestatus === "active" ? "default" : "secondary"
                }
              >
                {bundle.bundlestatus}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {bundle.products.length} items included
              </Badge>
            </div>

            <h1 className="mb-3 text-3xl font-bold text-gray-900">
              {bundle.bundlename}
            </h1>

            {bundle.description && (
              <p className="mb-6 text-base text-gray-600 leading-relaxed">
                {bundle.description}
              </p>
            )}

            <Separator className="mb-6" />

            {/* Pricing block */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-gray-900">
                  {formatPrice(finalPrice)}
                </span>
                {bundle.discount_value > 0 && (
                  <span className="text-xl text-gray-400 line-through">
                    {formatPrice(bundle.bundleprice)}
                  </span>
                )}
              </div>

              {savings > 0 && (
                <div className="mb-4 flex items-center gap-2 text-sm font-medium text-green-600">
                  <Tag className="h-4 w-4" />
                  You save {formatPrice(savings)} compared to buying separately
                </div>
              )}

              {totalProductsValue > 0 && (
                <p className="mb-6 text-sm text-gray-500">
                  Individual total:{" "}
                  <span className="font-medium">
                    {formatPrice(totalProductsValue)}
                  </span>
                </p>
              )}

              {/* What's included */}
              <div className="mb-6 space-y-2">
                <p className="text-sm font-semibold text-gray-700">
                  What's included:
                </p>
                {bundle.products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                    {product.name}
                  </div>
                ))}
              </div>

              <Button className="w-full cursor-pointer" size="lg">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add Bundle to Cart
              </Button>
            </div>
          </div>
        </div>

        {/* Products in this bundle */}
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Products in this Bundle
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {bundle.products.map((product) => (
              <BundleProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}