import { useCart } from "@/lib/store/cart-store";
import React, { useEffect } from "react";
import { toast } from "sonner";

import Image from "next/image";
import { Button } from "@/components/button-custom";
import { SummaryLineItem, SummaryTotalLineItem } from "./cart-summary";
import { OrderItem1 } from "./order-items";

<<<<<<< HEAD
export const ShoppingCartTab = ({ onNext }: { onNext: () => void }) => {
=======
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
}

export const ShoppingCartTab = ({ onNext, couponProps }: ShoppingCartTabProps) => {
>>>>>>> super
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

<<<<<<< HEAD
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
=======
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
  
  // Get cart total
  const cartTotal = getCartTotal();
  
  // Calculate final total with discount
  const finalTotal = React.useMemo(() => {
    const total = cartTotal - (discountAmount || 0);
    return Math.max(0, total);
  }, [cartTotal, discountAmount]);

  useEffect(() => {
    if (appliedCoupon) {
      console.log('Coupon applied:', appliedCoupon);
    }
  }, [appliedCoupon]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    
    try {
      await applyCoupon();
    } catch (error) {
      console.error('Coupon application failed:', error);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponCode("");
    toast.success("Coupon removed");
  };

  const handleCouponChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCouponCode(e.target.value);
  };
>>>>>>> super

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

          {/* Coupon Section */}
          <div className="mt-4 w-full md:w-[500px]">
            <h3 className="mb-2 text-3xl">Have a coupon?</h3>
            <p className="mb-4 text-base text-[#999999]">
              Add your code for an instant cart discount
            </p>
            
            {/* Coupon Input */}
            <div className="flex items-center overflow-hidden rounded-full border border-[#999999]">
              <div className="flex items-center justify-center px-3 py-2">
                <Image src="/t-1.png" alt="Coupon" width={20} height={20} />
              </div>

              <input
                type="text"
<<<<<<< HEAD
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
=======
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={handleCouponChange}
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
                    <Image
                      src="/arrow-right1.png"
                      alt="Apply"
                      width={20}
                      height={20}
                    />
                  )}
                </button>
              ) : (
                <button
                  onClick={handleRemoveCoupon}
                  className="bg-red-500 hover:bg-red-600 mr-2 flex h-10 w-10 items-center justify-center rounded-full text-white"
                  title="Remove coupon"
                >
                  <span className="text-lg">×</span>
                </button>
              )}
            </div>

            {/* Error Message */}
            {couponError && (
              <p className="mt-2 text-sm text-red-500">{couponError}</p>
            )}

            {/* Success Message */}
            {appliedCoupon && (
              <p className="mt-2 text-sm text-green-600">
                Coupon {appliedCoupon.code} applied! 
                {appliedCoupon.discount_type === 'percentage' 
                  ? ` ${appliedCoupon.discount_value}% off` 
                  : ` £${appliedCoupon.discount_value} off`}
              </p>
            )}
>>>>>>> super
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

<<<<<<< HEAD
              {assemblyTotal ? (
=======
              {assemblyTotal > 0 && (
                <SummaryLineItem label="Assembly Charges" value={assemblyTotal} />
              )}

              {/* Discount Line - Only show when coupon is applied */}
              {appliedCoupon && discountAmount > 0 && (
>>>>>>> super
                <SummaryLineItem
                  label="Assembly Charges"
                  value={assemblyTotal}
                />
              ) : null}

<<<<<<< HEAD
              {discount > 0 ? (
                <SummaryLineItem
                  label={`Discount (${couponCode})`}
                  value={-discount}
                />
              ) : null}

              <SummaryTotalLineItem label="Total" value={getCartTotal()} />
=======
              {/* Total Line */}
              <SummaryTotalLineItem 
                label="Total" 
                value={finalTotal}
              />
>>>>>>> super
            </div>

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
