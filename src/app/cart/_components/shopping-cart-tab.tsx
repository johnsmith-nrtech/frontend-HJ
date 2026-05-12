"use client";

import { useCart } from "@/lib/store/cart-store";
import React from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/button-custom";
import { SummaryLineItem, SummaryTotalLineItem } from "./cart-summary";
import { OrderItem1 } from "./order-items";
import { Wallet } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
  const hasInstallments = items.some((item) => item.show_installments === true);

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
        </div>

        {/* RIGHT: Cart Summary */}
        <div className="lg:col-span-1">
          <div className="bg-light-blue rounded-lg px-4 py-8 shadow-lg sm:p-8 text-center">
            {/* Title */}
            <h3 className="mb-4 text-center text-3xl text-gray-800 uppercase sm:text-[34px]">
              Cart Summary
            </h3>

            {/* Products Total line */}
            <div className="mb-2 text-lg text-gray-500">Total Price</div>

            {/* Big Total Price */}
            <div className="mb-1 text-4xl font-extrabold text-gray-900">
              £{finalTotal.toFixed(2)}
            </div>

            {/* Installment line — only if any item has show_installments */}
            {hasInstallments && (
              <div className="mt-2 text-sm text-gray-500">
                or
              </div>
            )}
            {hasInstallments && (
              <div className="mt-1 text-3xl font-extrabold text-gray-800">
                £{((finalTotal * 0.90) / 36).toFixed(2)}{" "}
                <span className="text-base font-normal text-gray-500">a month</span>
              </div>
            )}
            {hasInstallments && (
              <div className="mt-1 text-xs text-gray-400">
                Based on 36 months free credit with 10% deposit required. 0% APR.
              </div>
            )}

            {/* Assembly if any */}
            {assemblyTotal > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                + £{assemblyTotal.toFixed(2)} Assembly
              </div>
            )}

            {/* Coupon discount */}
            {appliedCoupon && discountAmount > 0 && (
              <div className="mt-2 text-sm text-green-600">
                -{appliedCoupon.is_referral ? "Referral" : "Coupon"} ({appliedCoupon.code}): -£{discountAmount.toFixed(2)}
              </div>
            )}

            {/* Referral Credit */}
            {referralCredit > 0 && referralDiscount > 0 && (
              <div className="mt-2 text-sm text-green-600">
                Referral Credit ({referralCredit}% off): -£{referralDiscount.toFixed(2)}
              </div>
            )}

            {/* Wallet discount */}
            {useWallet && walletDiscount > 0 && (
              <div className="mt-2 text-sm text-green-600">
                Wallet Credit: -£{walletDiscount.toFixed(2)}
              </div>
            )}

            {/* Divider */}
            <div className="my-4 border-t border-gray-300" />

              {/* Wallet Checkbox */}
              {walletBalance > 0 && (
                <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-left">
                  <div className="flex items-center cursor-pointer gap-3">
                    <Checkbox
                      id="use-wallet-cart"
                      checked={useWallet}
                      className="cursor-pointer"
                      onCheckedChange={(checked) => setUseWallet(checked as boolean)}
                    />
                    <Label htmlFor="use-wallet-cart" className="flex flex-1 items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wallet size={15} className="text-green-600" />
                        <span className="text-sm font-semibold text-green-800">Use Wallet Credit</span>
                      </div>
                      <span className="text-sm font-semibold text-green-700">
                        £{walletBalance.toFixed(2)}
                      </span>
                    </Label>
                  </div>
                  {useWallet && walletDiscount > 0 && (
                    <p className="mt-2 pl-7 text-xs text-green-600">
                      £{walletDiscount.toFixed(2)} will be deducted from your order
                    </p>
                  )}
                </div>
              )}

              {/* Checkout Button */}
              <Button
                onClick={onNext}
                variant="primary"
                size="md"
                rounded="full"
                disabled={items.length === 0}
                className="relative mt-2 h-12! w-full items-center text-left! shadow-lg text-[18px]"
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
                Continue to Checkout
              </Button>
            </div>
          </div>

      </div>
    </div>
  );
};