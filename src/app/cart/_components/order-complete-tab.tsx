import { useEffect, useState } from "react";
import { OrderData } from "../cart-page.types";
import { Button } from "@/components/button-custom";
import SafeImage from "@/components/ui/safe-image";
import Image from "next/image";

export const OrderCompleteTab = ({
  orderData,
}: {
  orderData: OrderData | null;
}) => {
  const [localOrderData, setLocalOrderData] = useState<OrderData | null>(
    orderData
  );
  const [isLoading, setIsLoading] = useState(!orderData);

  // Try to load order data from localStorage if not provided
  useEffect(() => {
    if (!orderData && isLoading) {
      try {
        const storedOrderData = localStorage.getItem("lastOrderData");
        if (storedOrderData) {
          const parsedOrderData = JSON.parse(storedOrderData) as OrderData;
          setLocalOrderData(parsedOrderData);
          console.log(
            "📦 Loaded order data from localStorage:",
            parsedOrderData
          );
        }
      } catch (error) {
        console.warn("⚠️ Failed to load order data from localStorage:", error);
      } finally {
        setIsLoading(false);
      }
    } else if (orderData) {
      setLocalOrderData(orderData);
      setIsLoading(false);
    }
  }, [orderData, isLoading]);

  // Loading state
  if (isLoading) {
    return (
      <div className="mt-20 px-0.5 text-center sm:px-8">
        <div className="bg-light-blue mb-8 rounded-2xl p-12">
          <div className="mb-8">
            <div className="mb-4 text-6xl">⏳</div>
            <h2 className="text-gray mb-2 text-[28px] font-bold tracking-wide">
              Processing Your Order...
            </h2>
            <p className="text-gray text-[16px] leading-relaxed">
              Please wait while we confirm your order details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No order data state
  if (!localOrderData) {
    return (
      <div className="mt-20 px-0.5 text-center sm:px-8">
        <div className="bg-light-blue mb-8 rounded-2xl p-12">
          <div className="mb-8">
            <div className="mb-4 text-6xl">❓</div>
            <h2 className="text-gray mb-2 text-[28px] font-bold tracking-wide">
              Order Not Found
            </h2>
            <p className="text-gray text-[16px] leading-relaxed">
              We could not find your order details. If you completed a payment,
              please contact support.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Button
                onClick={() => (window.location.href = "/")}
                className="bg-blue hover:bg-blue/90"
              >
                Go Home
              </Button>
              <Button
                onClick={() => (window.location.href = "/contact-us")}
                variant="outline"
              >
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state with order data
  return (
    <div className="mt-20 px-4 text-center sm:px-8">
      <div className="bg-light-blue mb-8 rounded-2xl p-12">
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

        {/* Product Images */}
        <div className="mb-12 flex flex-col items-center justify-center gap-6 sm:flex-row">
          {localOrderData.items.map((item) => (
            <div key={item.id} className="relative">
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

        {/* Order Details */}
        <div className="mx-auto mb-10 max-w-sm rounded-xl p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold text-[#999]">Order code:</p>
              <p className="text-[#222]">{localOrderData.orderCode}</p>
            </div>
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold text-[#999]">Date:</p>
              <p className="text-[#222]">{localOrderData.date}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#999]">Total:</p>
              <p className="text-[#222]">£{localOrderData.total}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#999]">
                Payment method:
              </p>
              <p className="text-[#222]">{localOrderData.paymentMethod}</p>
            </div>
          </div>
        </div>

        {/* Back to Home Button */}
        <Button
          onClick={() => (window.location.href = "/")}
          variant="primary"
          size="xl"
          rounded="full"
          className="bg-blue hover:bg-blue/90 relative mx-auto flex w-full items-center justify-start px-6 py-3 font-semibold text-white shadow-lg sm:w-[80%] sm:px-8 sm:py-4 lg:w-[70%]"
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
  );
};
