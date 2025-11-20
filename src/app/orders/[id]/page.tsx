import React from "react";
import OrderTrackingPage from "./order-tracking";

// Server component
export default async function SingleOrder({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // In Next.js 15, params is a Promise that needs to be awaited
  const resolvedParams = await params;

  // Get the order ID from params
  const orderId = resolvedParams.id;

  // Validate that we have an ID
  if (!orderId) {
    throw new Error("Order ID is required");
  }

  return <OrderTrackingPage orderId={orderId} />;
}
