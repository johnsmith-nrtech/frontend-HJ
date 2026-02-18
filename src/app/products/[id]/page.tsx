import React from "react";
import ProductDetails from "./product-details";

// Server component
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // In Next.js 15, params is a Promise that needs to be awaited
  const resolvedParams = await params;

  // Get the product ID from params
  const productId = resolvedParams.id;

  // Validate that we have an ID
  if (!productId) {
    throw new Error("Product ID is required");
  }

  return <ProductDetails productId={productId} />;
}
