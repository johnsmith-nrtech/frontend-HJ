"use client";

import { useCart } from "@/lib/store/cart-store";
import React, { useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/button-custom";
import { SummaryLineItem, SummaryTotalLineItem } from "./cart-summary";
import { OrderItem1 } from "./order-items";
import { Wallet } from "lucide-react";

interface ShoppingCartTabProps {
  onNext: () => void;
  couponProps: {
    couponCode: string;
    setCouponCode: (code: string) => void;
    appliedCoupon: any;
    discountAmount: number;
    setDiscountAmount: (amount: number) => void;
    isApplyingCoupon: boolean;
    couponError: string;
    applyCoupon: () => Promise<void>;
    removeCoupon: () => void;
  };
  referralCredit: number;
  referralDiscount: number;
  // Wallet props
  walletBalance: number;
  walletDiscount: number;
  useWallet: boolean;
  setUseWallet: (val: boolean) => void;
}

export const ShoppingCartTab = ({
  onNext,
  couponProps,
  referralCredit,
  referralDiscount,
  walletBalance,
  walletDiscount,
  useWallet,
  setUseWallet,
}: ShoppingCartTabProps) => {
  const {
    items,
    subtotal,
    assemblyTotal,
    isLoading: cartLoading,
    checkAuthStatus,
    getCartTotal,
  } = useCart();

  const {
    couponCode,
    setCouponCode,
    appliedCoupon,
    discountAmount,
    setDiscountAmount,
    isApplyingCoupon,
    couponError,
    applyCoupon,
    removeCoupon,
  } = couponProps;

  const isAuthenticated = checkAuthStatus();
  const cartTotal = getCartTotal();

  const finalTotal = React.useMemo(() => {
    return Math.max(
      0,
      cartTotal - (discountAmount || 0) - (referralDiscount || 0) - (walletDiscount || 0)
    );
  }, [cartTotal, discountAmount, referralDiscount, walletDiscount]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    try {
      await applyCoupon();
    } catch (error) {
      console.error("Coupon application failed:", error);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponCode("");
    toast.success("Coupon removed");
  };

  return (
    <div className="mx-auto px-4 sm:px-8">
      <div className="mt-4 grid grid-cols-1 gap-12 sm:mt-10 lg:grid-cols-3 lg:gap-16">

        {/* LEFT: Cart Items + Coupon */}
        <div className="lg:col-span-2">
          {items.length === 0 && !cartLoading ? (
            <div className="py-4 text-center text-gray-500">
              <p>No items in your cart</p>
              {isAuthenticated && (
                <p className="mt-2 text-sm">Items from your account are automatically loaded</p>
              )}
            </div>
          ) : (
            items.map((item) => <OrderItem1 key={item.id} item={item} />)
          )}

          {/* Coupon Section */}
          <div className="mt-4 w-full md:w-[500px]">
            <h3 className="mb-2 text-3xl">Have a coupon or referral code?</h3>
            <p className="mb-4 text-base text-[#999999]">
              Add your code for an instant cart discount
            </p>

            <div className="flex items-center overflow-hidden rounded-full border border-[#999999]">
              <div className="flex items-center justify-center px-3 py-2">
                <Image src="/t-1.png" alt="Coupon" width={20} height={20} />
              </div>
              <input
                type="text"
                placeholder="Enter coupon or referral code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={isApplyingCoupon || !!appliedCoupon}
                className="flex-1 px-0 py-3 text-sm focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {!appliedCoupon ? (
                <button
                  onClick={handleApplyCoupon}
                  disabled={!couponCode.trim() || isApplyingCoupon}
                  className="bg-blue hover:bg-blue/80 mr-2 flex h-10 w-10 items-center justify-center rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isApplyingCoupon ? (
                    <span className="text-xs">...</span>
                  ) : (
                    <Image src="/arrow-right1.png" alt="Apply" width={20} height={20} />
                  )}
                </button>
              ) : (
                <button
                  onClick={handleRemoveCoupon}
                  className="bg-red-500 hover:bg-red-600 mr-2 flex h-10 w-10 items-center justify-center rounded-full text-white"
                >
                  <span className="text-lg">x</span>
                </button>
              )}
            </div>

            {couponError && (
              <p className="mt-2 text-sm text-red-500">{couponError}</p>
            )}

            {appliedCoupon && (
              <p className="mt-2 text-sm text-green-600">
                {appliedCoupon.is_referral ? "Referral code" : "Coupon"} {appliedCoupon.code} applied!{" "}
                {appliedCoupon.discount_type === "percentage"
                  ? `${appliedCoupon.discount_value}% off`
                  : `£${appliedCoupon.discount_value} off`}
              </p>
            )}
          </div>

          {/* Wallet Balance Toggle */}
          {walletBalance > 0 && (
            <div className="mt-6 w-full md:w-[500px]">
              <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <Wallet size={20} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-green-800">
                        Wallet Balance: £{walletBalance.toFixed(2)}
                      </p>
                      <p className="text-xs text-green-600">
                        {useWallet
                          ? `£${walletDiscount.toFixed(2)} will be deducted from your order`
                          : "Apply your wallet credit to this order"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setUseWallet(!useWallet)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      useWallet
                        ? "bg-red-100 text-red-600 hover:bg-red-200"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {useWallet ? "Remove" : "Apply"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Summary */}
        <div className="lg:col-span-1">
          <div className="bg-light-blue rounded-lg px-2 py-6 shadow-lg sm:p-6">
            <h3 className="mb-6 text-center text-3xl text-gray-800 uppercase sm:text-start sm:text-[34px]">
              Cart Summary
            </h3>

            <div className="space-y-3">
              <SummaryLineItem label="Products Total" value={subtotal} />

              {assemblyTotal > 0 && (
                <SummaryLineItem label="Assembly Charges" value={assemblyTotal} />
              )}

              {/* Coupon/Referral discount */}
              {appliedCoupon && discountAmount > 0 && (
                <SummaryLineItem
                  label={`${appliedCoupon.is_referral ? "Referral" : "Coupon"} (${appliedCoupon.code})`}
                  value={-discountAmount}
                />
              )}

              {/* Old referral credit */}
              {referralCredit > 0 && referralDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-green-700">
                    Referral Credit ({referralCredit}% off)
                  </span>
                  <span className="font-medium text-green-700">
                    -£{referralDiscount.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Wallet discount */}
              {useWallet && walletDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-green-700">
                    Wallet Credit
                  </span>
                  <span className="font-medium text-green-700">
                    -£{walletDiscount.toFixed(2)}
                  </span>
                </div>
              )}

              <SummaryTotalLineItem label="Total" value={finalTotal} />
            </div>

            {/* Wallet balance badge */}
            {walletBalance > 0 && !useWallet && (
              <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                <p className="text-xs text-green-700">
                  You have £{walletBalance.toFixed(2)} wallet credit. Apply it above!
                </p>
              </div>
            )}

            <Button
              onClick={onNext}
              variant="primary"
              size="xl"
              rounded="full"
              disabled={items.length === 0}
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