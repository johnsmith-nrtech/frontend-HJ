"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/button-custom";
import { PaymentFailureParams } from "@/lib/api/payment";
import {
  getStoredOrderId,
  clearStoredOrderId,
} from "@/lib/utils/payment-utils";

export default function PaymentFailurePage() {
  const [loading, setLoading] = useState(true);
  const [failureReason, setFailureReason] = useState<string>("");
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const handleFailure = async () => {
      try {
        // Wait for client side
        if (typeof window === "undefined") return;

        // Get URL params using native URLSearchParams
        const urlParams = new URLSearchParams(window.location.search);

        // Extract failure parameters from URL
        const failureParams: PaymentFailureParams = {
          fail_reason: urlParams
            ? urlParams.get("fail_reason") || undefined
            : undefined,
          processor_response_code: urlParams
            ? urlParams.get("processor_response_code") || undefined
            : undefined,
        };

        // Get stored order ID
        try {
          const storedOrderId = getStoredOrderId();
          setOrderId(storedOrderId);
        } catch {
          // Ignore error
        }

        // Set failure reason with user-friendly message
        let reason = "Payment could not be processed.";

        if (failureParams.fail_reason) {
          switch (failureParams.fail_reason.toLowerCase()) {
            case "declined":
              reason = "Your payment was declined by your bank.";
              break;
            case "insufficient_funds":
              reason = "Insufficient funds in your account.";
              break;
            case "expired_card":
              reason = "Your card has expired.";
              break;
            case "invalid_card":
              reason = "Invalid card details provided.";
              break;
            case "cancelled":
              reason = "Payment was cancelled.";
              break;
            case "timeout":
              reason = "Payment session timed out.";
              break;
            default:
              reason = failureParams.fail_reason;
          }
        }

        setFailureReason(reason);

        // Clear stored order ID after a delay to allow retry
        setTimeout(() => {
          try {
            clearStoredOrderId();
          } catch {
            // Ignore error
          }
        }, 300000); // Clear after 5 minutes

        setLoading(false);
      } catch {
        // Show failure page even if there are errors
        setFailureReason("Payment could not be processed.");
        setLoading(false);
      }
    };

    handleFailure();
  }, []);

  const handleRetryPayment = () => {
    try {
      window.location.href = "/cart";
    } catch {
      // Ignore error
    }
  };

  const handleContactSupport = () => {
    try {
      window.location.href = "/contact-us";
    } catch {
      // Ignore error
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-lg bg-gray-50 px-4 py-12">
          <div className="mb-4 text-6xl">⏳</div>
          <h1 className="mb-4 text-2xl font-bold">Processing...</h1>
          <p className="text-center text-gray-600">
            Please wait while we check your payment status.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto mt-20 max-w-4xl text-center">
        <div className="mb-8 rounded-2xl bg-[#F4DDDD] p-12">
          {/* Failure Section - Matching success page structure */}
          <div className="mb-8">
            <h2 className="mb-2 text-[28px] font-bold tracking-wide text-[#999]">
              SORRY! 😔
            </h2>
            <h1 className="text-4xl leading-tight tracking-tight text-[#222] sm:text-6xl">
              PAYMENT FAILED
            </h1>
          </div>

          {/* Failure Icon */}
          <div className="mb-12">
            <div className="mb-6 text-6xl sm:text-8xl">❌</div>
            <p className="mb-4 text-lg text-[#666] sm:text-xl">
              {failureReason}
            </p>
            <p className="text-base text-[#999] sm:text-lg">
              Don&apos;t worry, no charges have been made to your account.
            </p>
          </div>

          {/* Failure Details - Matching success page order details */}
          <div className="mx-auto mb-10 max-w-sm rounded-xl p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <p className="text-sm font-semibold text-[#999]">Status:</p>
                <p className="font-semibold text-red-600">Failed</p>
              </div>
              <div className="flex items-start justify-between">
                <p className="text-sm font-semibold text-[#999]">Date:</p>
                <p className="text-[#222]">
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#999]">Reason:</p>
                <p className="text-sm text-[#222]">Payment declined</p>
              </div>
              {orderId && (
                <div className="flex items-start justify-between">
                  <p className="text-sm font-semibold text-[#999]">
                    Order code:
                  </p>
                  <p className="font-mono text-sm text-[#222]">
                    #{orderId.slice(-8).toUpperCase()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons - Matching success page layout */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button
              onClick={handleRetryPayment}
              variant="primary"
              size="xl"
              rounded="full"
              className="hover:bg-blue/90 border-blue text-blue relative mx-auto flex w-full items-center justify-start border !bg-transparent px-6 py-3 text-sm font-semibold shadow-lg sm:w-[80%] sm:px-8 sm:py-4 sm:text-base lg:w-[30%]"
              icon={
                <Image
                  src="/farrow-r.png"
                  alt="Arrow Right"
                  width={40}
                  height={40}
                  className="absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 object-contain sm:right-4 sm:h-12 sm:w-12 sm:p-0"
                  onError={(e) => {
                    try {
                      e.currentTarget.style.display = "none";
                    } catch {
                      // Ignore error
                    }
                  }}
                />
              }
            >
              Try Again
            </Button>
            <Button
              onClick={handleContactSupport}
              variant="primary"
              size="xl"
              rounded="full"
              className="bg-blue hover:bg-blue/90 relative mx-auto flex w-full items-center justify-start px-6 py-3 text-sm font-semibold text-white shadow-lg sm:w-[80%] sm:px-8 sm:py-4 sm:text-base lg:w-[30%]"
              icon={
                <Image
                  src="/arrow-right.png"
                  alt="Arrow Right"
                  width={24}
                  height={24}
                  className="absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 rounded-full bg-white object-contain p-1.5 sm:right-4 sm:h-10 sm:w-10 sm:p-2"
                  onError={(e) => {
                    try {
                      e.currentTarget.style.display = "none";
                    } catch {
                      // Ignore error
                    }
                  }}
                />
              }
            >
              Contact Support
            </Button>
          </div>
        </div>

        {/* Help Information - Styled like success page additional info */}
        <div className="mb-8 rounded-2xl bg-blue-50 p-8">
          <h3 className="font-bebas text-blue mb-4 text-xl">
            What can you do?
          </h3>
          <div className="mx-auto grid w-full grid-cols-1 gap-4 text-left md:grid-cols-2">
            <div className="flex items-start">
              <span className="text-blue mr-3">✓</span>
              <span className="text-blue">
                Check your card details and try again
              </span>
            </div>
            <div className="flex items-start">
              <span className="text-blue mr-3">✓</span>
              <span className="text-blue">Try a different payment method</span>
            </div>
            <div className="flex items-start">
              <span className="text-blue mr-3">✓</span>
              <span className="text-blue">Contact your bank if needed</span>
            </div>
            <div className="flex items-start">
              <span className="text-blue mr-3">✓</span>
              <span className="text-blue">Reach out to our support team</span>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="rounded-xl bg-gray-50 p-8">
          <h3 className="font-bebas mb-4 text-xl text-gray-800">Need Help?</h3>
          <p className="mb-6 text-gray-600">
            If you continue to experience issues, our support team is here to
            help.
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="text-center">
              <div className="mb-2 text-2xl">📧</div>
              <h4 className="font-semibold text-gray-800">Email Support</h4>
              <p className="text-sm text-gray-600">info@sofadeal.co.uk</p>
            </div>

            <div className="text-center">
              <div className="mb-2 text-2xl">📞</div>
              <h4 className="font-semibold text-gray-800">Phone Support</h4>
              <p className="text-sm text-gray-600">+44 20 1234 5678</p>
            </div>

            {/* <div className="text-center">
              <div className="mb-2 text-2xl">💬</div>
              <h4 className="font-semibold text-gray-800">Live Chat</h4>
              <p className="text-sm text-gray-600">Available 9AM-6PM</p>
            </div> */}
          </div>
        </div>

        {/* Additional Info - Matching success page */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Having trouble?{" "}
            <span
              className="text-blue cursor-pointer hover:underline"
              onClick={handleContactSupport}
            >
              Contact Support
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
