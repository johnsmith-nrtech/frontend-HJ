"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/button-custom";
import SafeImage from "@/components/ui/safe-image";
import { clearStoredOrderId } from "@/lib/utils/payment-utils";
import { useCartStore } from "@/lib/store/cart-store";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  color?: string;
  size?: string;
}

interface OrderData {
  orderCode: string;
  date: string;
  total: string;
  paymentMethod: string;
  items: CartItem[];
}

interface PaymentParams {
  approval_code?: string;
  oid?: string;
  refnumber?: string;
  status?: string;
  txndate_processed?: string;
  response_hash?: string;
  fail_reason?: string;
  processor_response_code?: string;
}

interface DebugInfo {
  url: string;
  params: PaymentParams;
  parseErrors: string[];
  timestamp: string;
}

// Enhanced URL parameter parsing with better error handling
function parseURLParameters(): { params: PaymentParams; errors: string[] } {
  const errors: string[] = [];
  const params: PaymentParams = {};

  try {
    // Log everything for debugging
    console.log("🔍 Full URL:", window.location.href);
    console.log("🔍 Search params:", window.location.search);
    console.log("🔍 Pathname:", window.location.pathname);
    console.log("🔍 Hash:", window.location.hash);

    // Check if we have any parameters at all
    if (!window.location.search && !window.location.hash) {
      console.log("⚠️ No URL parameters found");
      return { params, errors: ["No URL parameters found"] };
    }

    // Try multiple parsing methods

    // Method 1: Standard URLSearchParams
    try {
      if (window.location.search) {
        const searchParams = window.location.search;
        console.log("📝 Raw search params:", searchParams);

        // Validate the search string before parsing
        if (searchParams.length > 1) {
          const urlParams = new URLSearchParams(searchParams);

          // Extract known payment parameters
          params.approval_code = urlParams.get("approval_code") || undefined;
          params.oid = urlParams.get("oid") || undefined;
          params.refnumber = urlParams.get("refnumber") || undefined;
          params.status = urlParams.get("status") || undefined;
          params.txndate_processed =
            urlParams.get("txndate_processed") || undefined;
          params.response_hash = urlParams.get("response_hash") || undefined;
          params.fail_reason = urlParams.get("fail_reason") || undefined;
          params.processor_response_code =
            urlParams.get("processor_response_code") || undefined;

          console.log("✅ Parsed with URLSearchParams:", params);
        }
      }
    } catch (urlSearchError) {
      console.warn("⚠️ URLSearchParams failed:", urlSearchError);
      errors.push(
        `URLSearchParams error: ${urlSearchError instanceof Error ? urlSearchError.message : String(urlSearchError)}`
      );
    }

    // Method 2: Manual parsing as fallback
    try {
      if (window.location.search && Object.keys(params).length === 0) {
        console.log("🔄 Attempting manual parsing...");

        const queryString = window.location.search.substring(1);
        const pairs = queryString.split("&");

        pairs.forEach((pair) => {
          const [key, value] = pair.split("=");
          if (key && value) {
            const decodedKey = decodeURIComponent(key);
            const decodedValue = decodeURIComponent(value);

            // Map to our params object
            if (
              [
                "approval_code",
                "oid",
                "refnumber",
                "status",
                "txndate_processed",
                "response_hash",
                "fail_reason",
                "processor_response_code",
              ].includes(decodedKey)
            ) {
              (params as PaymentParams)[decodedKey as keyof PaymentParams] =
                decodedValue;
            }
          }
        });

        console.log("✅ Parsed manually:", params);
      }
    } catch (manualError) {
      console.warn("⚠️ Manual parsing failed:", manualError);
      errors.push(
        `Manual parsing error: ${manualError instanceof Error ? manualError.message : String(manualError)}`
      );
    }

    // Method 3: Try parsing with URL constructor as last resort
    try {
      if (Object.keys(params).length === 0) {
        console.log("🔄 Attempting URL constructor parsing...");

        const url = new URL(window.location.href);
        url.searchParams.forEach((value, key) => {
          if (
            [
              "approval_code",
              "oid",
              "refnumber",
              "status",
              "txndate_processed",
              "response_hash",
              "fail_reason",
              "processor_response_code",
            ].includes(key)
          ) {
            (params as PaymentParams)[key as keyof PaymentParams] = value;
          }
        });

        console.log("✅ Parsed with URL constructor:", params);
      }
    } catch (urlConstructorError) {
      console.warn("⚠️ URL constructor failed:", urlConstructorError);
      errors.push(
        `URL constructor error: ${urlConstructorError instanceof Error ? urlConstructorError.message : String(urlConstructorError)}`
      );
    }
  } catch (generalError) {
    console.error("❌ General parsing error:", generalError);
    errors.push(
      `General error: ${generalError instanceof Error ? generalError.message : String(generalError)}`
    );
  }

  return { params, errors };
}

// Determine if payment was successful based on parameters
function isPaymentSuccessful(params: PaymentParams): boolean {
  // Check various success indicators
  if (params.status) {
    const status = params.status.toUpperCase();
    if (["APPROVED", "SUCCESS", "COMPLETED"].includes(status)) {
      return true;
    }
    if (["DECLINED", "FAILED", "CANCELLED", "ERROR"].includes(status)) {
      return false;
    }
  }

  // Check approval code (usually starts with 'Y' for approved)
  if (params.approval_code) {
    return params.approval_code.toUpperCase().startsWith("Y");
  }

  // If we have an order ID but no explicit failure, assume success
  if (params.oid && !params.fail_reason && !params.processor_response_code) {
    return true;
  }

  // Default to false if we can't determine
  return false;
}

export default function PaymentSuccessPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      // Prevent multiple executions
      if (hasProcessedRef.current) {
        return;
      }
      hasProcessedRef.current = true;

      try {
        // Get current cart state at the time of execution
        const currentItems = useCartStore.getState().items;
        const currentGetCartTotal = useCartStore.getState().getCartTotal;
        const currentClearCart = useCartStore.getState().clearCart;

        // Parse URL parameters with enhanced error handling
        const { params, errors: parseErrors } = parseURLParameters();

        // Store debug info for potential support needs
        setDebugInfo({
          url: window.location.href,
          params,
          parseErrors,
          timestamp: new Date().toISOString(),
        });

        // Check if payment was successful
        const paymentSuccess = isPaymentSuccessful(params);

        // Handle payment failure
        if (Object.keys(params).length > 0 && !paymentSuccess) {
          const failureReason =
            params.fail_reason ||
            params.processor_response_code ||
            `Payment ${params.status || "failed"}`;

          console.error("❌ Payment failed:", failureReason);
          setError(`Payment failed: ${failureReason}`);
          setLoading(false);
          return;
        }

        // Try to get order data from multiple sources
        let currentOrderData: OrderData | null = null;

        // 1. If we have cart items, create order data from current cart (prioritize current cart)
        if (currentItems.length > 0) {
          const orderCode = params.oid
            ? `#${params.oid}`
            : `#${Date.now().toString().slice(-8).toUpperCase()}`;

          currentOrderData = {
            orderCode,
            date: new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            total: currentGetCartTotal().toFixed(2),
            paymentMethod: "Credit Card",
            items: currentItems,
          };

          // Store order data for future reference
          try {
            if (typeof window !== "undefined" && window.localStorage) {
              localStorage.setItem(
                "lastOrderData",
                JSON.stringify(currentOrderData)
              );
              console.log("💾 Stored order data for future reference");
            }
          } catch (storageError) {
            console.warn("⚠️ Could not store order data:", storageError);
          }
        }
        // 2. Fallback: try to get stored order data from localStorage only if no current cart
        else {
          try {
            if (typeof window !== "undefined" && window.localStorage) {
              const storedOrderData = localStorage.getItem("lastOrderData");
              if (storedOrderData) {
                currentOrderData = JSON.parse(storedOrderData);
                console.log(
                  "📦 Found stored order data (fallback):",
                  currentOrderData
                );
              }
            }
          } catch (storageError) {
            console.warn(
              "⚠️ Could not retrieve stored order data:",
              storageError
            );
          }
        }

        // 3. If still no order data but we have payment params, create minimal order
        if (!currentOrderData && Object.keys(params).length > 0) {
          const orderCode = params.oid
            ? `#${params.oid}`
            : `#${params.refnumber || Date.now().toString().slice(-8).toUpperCase()}`;

          currentOrderData = {
            orderCode,
            date: new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            total: "0.00", // Amount not available from payment params
            paymentMethod: "Credit Card",
            items: [], // No items available
          };
        }

        // Set order data if we have it
        if (currentOrderData) {
          setOrderData(currentOrderData);
          console.log("✅ Order data set:", currentOrderData);
        } else {
          console.warn("⚠️ No order data available");

          // Different error messages based on context
          if (parseErrors.length > 0) {
            setError(
              "Unable to process payment confirmation due to URL parsing errors. Please contact support."
            );
          } else if (Object.keys(params).length === 0) {
            setError(
              "No payment information found. If you completed a payment, please contact support with your confirmation details."
            );
          } else {
            setError(
              "Order information is not available. Your payment may have been processed. Please contact support."
            );
          }
        }

        // Clean up after successful payment processing
        try {
          clearStoredOrderId();
          console.log("🧹 Stored order ID cleared");
        } catch (clearError) {
          console.error("❌ Error clearing stored order ID:", clearError);
        }

        // Clear the cart only if we have confirmation this was a successful payment
        if (currentOrderData && (paymentSuccess || params.oid)) {
          try {
            currentClearCart();
            console.log("🛒 Cart cleared successfully after payment");
          } catch (cartError) {
            console.error("❌ Error clearing cart:", cartError);
          }
        }

        setLoading(false);
        console.log("🎯 Payment processing completed");
      } catch (err) {
        console.error("❌ Error processing payment success:", err);
        setError(
          "Failed to process payment confirmation. Please contact support if you completed a payment."
        );
        setLoading(false);
      }
    };

    // Only run if we're in the browser
    if (typeof window !== "undefined") {
      // Small delay to ensure page is fully loaded
      const timer = setTimeout(() => {
        handlePaymentSuccess();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, []); // No dependencies needed since we get state directly from store

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-lg bg-gray-50 px-4 py-12">
          <div className="mb-4 text-6xl">⏳</div>
          <h1 className="mb-4 text-2xl font-bold">Processing...</h1>
          <p className="text-center text-gray-600">
            Please wait while we confirm your payment.
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-lg bg-red-50 px-4 py-12">
          <div className="mb-4 text-6xl">❌</div>
          <h1 className="mb-4 text-2xl font-bold text-red-600">
            Payment Issue
          </h1>
          <p className="mb-4 text-center text-red-600">{error}</p>

          {/* Debug info for support */}
          {debugInfo && process.env.NODE_ENV === "development" && (
            <details className="mb-4 w-full">
              <summary className="cursor-pointer text-sm text-gray-500">
                Debug Info (Dev Only)
              </summary>
              <pre className="mt-2 max-h-40 overflow-auto rounded bg-gray-100 p-2 text-xs">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          )}

          <div className="flex gap-4">
            <Button
              onClick={() => (window.location.href = "/")}
              className="bg-blue hover:bg-blue/90"
            >
              Go Home
            </Button>
            <Button
              onClick={() => (window.location.href = "/support")}
              variant="outline"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No order data state
  if (!orderData) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-lg bg-gray-50 px-4 py-12">
          <div className="mb-4 text-6xl">❓</div>
          <h1 className="mb-4 text-2xl font-bold">Order Not Found</h1>
          <p className="mb-8 text-center text-gray-600">
            We could not find your order details. If you completed a payment,
            please contact support.
          </p>
          <div className="flex gap-4">
            <Button
              onClick={() => (window.location.href = "/")}
              className="bg-blue hover:bg-blue/90"
            >
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto mt-20 max-w-4xl text-center">
        <div className="bg-light-blue mb-8 rounded-2xl p-12">
          {/* Thank You Section */}
          <div className="mb-8">
            <h2 className="text-gray mb-2 text-[28px] font-bold tracking-wide">
              THANK YOU! 🎉
            </h2>
            <h1 className="text-dark-gray text-4xl leading-tight tracking-tight md:text-6xl">
              YOUR ORDER HAS BEEN
              <br />
              CONFIRMED
            </h1>
          </div>

          {/* Product Images - Only show if we have items */}
          {orderData.items.length > 0 && (
            <div className="mb-12 flex flex-col items-center justify-center gap-6 sm:flex-row">
              {orderData.items.map((item, index) => (
                <div key={`${item.id}-${index}`} className="relative">
                  <div className="h-32 w-40 rounded-xl bg-white p-2 shadow-sm">
                    <SafeImage
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={96}
                      height={96}
                      className="h-full w-full rounded-lg object-cover"
                    />
                  </div>
                  <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                    {item.quantity}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Order Details */}
          <div className="mx-auto mb-10 max-w-sm rounded-xl p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <p className="text-sm font-semibold text-[#999]">Order code:</p>
                <p className="text-[#222]">{orderData.orderCode}</p>
              </div>
              <div className="flex items-start justify-between">
                <p className="text-sm font-semibold text-[#999]">Date:</p>
                <p className="text-[#222]">{orderData.date}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#999]">Total:</p>
                <p className="text-[#222]">£{orderData.total}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#999]">
                  Payment method:
                </p>
                <p className="text-[#222]">{orderData.paymentMethod}</p>
              </div>
            </div>
          </div>

          {/* Back to Home Button */}
          <Button
            onClick={() => (window.location.href = "/")}
            variant="primary"
            size="xl"
            rounded="full"
            className="bg-blue hover:bg-blue/90 relative mx-auto flex w-full items-center justify-start px-6 py-3 text-sm font-semibold text-white shadow-lg sm:w-[80%] sm:px-8 sm:py-4 sm:text-base lg:w-[70%]"
            icon={
              <Image
                src="/arrow-right.png"
                alt="Arrow Right"
                width={24}
                height={24}
                className="absolute top-1/2 right-3 h-8 w-8 -translate-y-1/2 rounded-full bg-white object-contain p-1.5 sm:right-4 sm:h-10 sm:w-10 sm:p-2"
              />
            }
          >
            Back To Home
          </Button>
        </div>
      </div>
    </div>
  );
}
