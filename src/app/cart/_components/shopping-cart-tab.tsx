import { useCart } from "@/lib/store/cart-store";
import React from "react";
import { toast } from "sonner";

import Image from "next/image";
import { Button } from "@/components/button-custom";
import { SummaryLineItem, SummaryTotalLineItem } from "./cart-summary";
import { OrderItem1 } from "./order-items";

export const ShoppingCartTab = ({ onNext }: { onNext: () => void }) => {
  const {
    items,
    subtotal,
    assemblyTotal,
    discount,
    couponCode,
    setDiscount,
    setCouponCode,
    isLoading: cartLoading,

    checkAuthStatus,
    getCartTotal,
  } = useCart();

  const [localCouponCode, setLocalCouponCode] = React.useState(couponCode);

  // Coupon application
  const applyDiscount = () => {
    const code = localCouponCode.toLowerCase();
    if (code === "save10") {
      setDiscount(getCartTotal() * 0.1);
      setCouponCode(localCouponCode);
      toast.success("Coupon applied successfully!");
    } else if (code === "jenkatemw") {
      setDiscount(25);
      setCouponCode(localCouponCode);
      toast.success("Coupon applied successfully!");
    } else {
      toast.error("Invalid coupon code");
    }
  };

  const isAuthenticated = checkAuthStatus();

  console.log(items);

  return (
    <div className="mx-auto px-4 sm:px-8">
      <div className="mt-4 grid grid-cols-1 gap-12 sm:mt-10 lg:grid-cols-3 lg:gap-16">
        {/* LEFT */}
        <div className="lg:col-span-2">
          {items.length === 0 && !cartLoading ? (
            <div className="py-4 text-center text-gray-500">
              <p>No items in your cart</p>
              {isAuthenticated && (
                <p className="mt-2 text-sm">
                  Items from your account are automatically loaded
                </p>
              )}
            </div>
          ) : (
            items.map((item) => <OrderItem1 key={item.id} item={item} />)
          )}

          {/* Coupon */}
          <div className="mt-4 w-full md:w-[500px]">
            <h3 className="mb-2 text-3xl">Have a coupon?</h3>
            <p className="mb-4 text-base text-[#999999]">
              Add your code for an instant cart discount
            </p>
            <div className="flex items-center overflow-hidden rounded-full border border-[#999999]">
              <div className="flex items-center justify-center px-3 py-2">
                <Image src="/t-1.png" alt="Coupon" width={20} height={20} />
              </div>

              <input
                type="text"
                placeholder="Coupon Code"
                value={localCouponCode}
                onChange={(e) => setLocalCouponCode(e.target.value)}
                className="flex-1 px-0 py-3 text-sm focus:outline-none"
              />

              <button
                onClick={applyDiscount}
                className="bg-blue hover:bg-blue/80 mr-2 flex h-10 w-10 items-center justify-center rounded-full text-white"
              >
                <Image
                  src="/arrow-right1.png"
                  alt="Apply"
                  width={20}
                  height={20}
                />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Summary */}
        <div className="lg:col-span-1">
          <div className="bg-light-blue rounded-lg px-2 py-6 shadow-lg sm:p-6">
            <h3 className="mb-6 text-center text-3xl text-gray-800 uppercase sm:text-start sm:text-[34px]">
              Cart Summary
            </h3>

            <div className="space-y-3">
              <SummaryLineItem label="Products Total" value={subtotal} />

              {assemblyTotal ? (
                <SummaryLineItem
                  label="Assembly Charges"
                  value={assemblyTotal}
                />
              ) : null}

              {discount > 0 ? (
                <SummaryLineItem
                  label={`Discount (${couponCode})`}
                  value={-discount}
                />
              ) : null}

              <SummaryTotalLineItem label="Total" value={getCartTotal()} />
            </div>

            <Button
              onClick={onNext}
              variant="primary"
              size="xl"
              rounded="full"
              className="relative mt-8 h-12! w-full items-center text-left! shadow-lg sm:text-xl!"
              icon={
                <Image
                  src="/arrow-right.png"
                  alt="arrow-right"
                  width={24}
                  height={24}
                  className="absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 rounded-full bg-white p-2 sm:h-10 sm:w-10"
                />
              }
            >
              Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
