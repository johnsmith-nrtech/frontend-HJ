import { SummaryLineItem, SummaryTotalLineItem } from "./cart-summary";
import { FormData } from "../cart-page.types";
import { useCart } from "@/lib/store/cart-store";
import { useFloors } from "@/hooks/use-floors";
import { toast } from "sonner";
import { GuestCheckoutOptions } from "./guest-checkout-options";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/button-custom";
import Image from "next/image";
import { OrderItemsList } from "./order-items";
import {
  FormInputWithLabel,
  FormSelectWithLabel,
} from "./checkout-form-inputs";
import React, { useEffect } from "react";
import { useAuth } from "@/lib/providers/auth-provider";
import { useDeliveryChargesByZipCode } from "@/hooks/use-zones";
import { X } from "lucide-react";

interface CheckoutDetailsTabProps {
  onNext: () => void;
  formData: FormData;
  setFormData: (data: FormData) => void;
  isProcessing?: boolean;
  couponProps: {
    couponCode: string;
    setCouponCode: (code: string) => void;
    appliedCoupon: any;
    discountAmount: number;
    isApplyingCoupon: boolean;
    couponError: string;
    applyCoupon: () => Promise<void>;
    removeCoupon: () => void;
  };
}

export const CheckoutDetailsTab = ({
  onNext,
  formData,
  setFormData,
  isProcessing = false,
  couponProps,
}: CheckoutDetailsTabProps) => {
  const { user } = useAuth();
  const {
    assemblyTotal,
    subtotal,
    getCartTotal,
  } = useCart();

  const {
    couponCode,
    setCouponCode,
    appliedCoupon,
    discountAmount,
    isApplyingCoupon,
    couponError,
    applyCoupon,
    removeCoupon,
  } = couponProps;

  const [showGuestOptions, setShowGuestOptions] = React.useState(
    !user && !formData.isGuest
  );

  const [localCouponCode, setLocalCouponCode] = React.useState("");
  const floorsQuery = useFloors();
  const deliveryChargesByZipCode = useDeliveryChargesByZipCode();

  // Update local state when coupon changes
  useEffect(() => {
    if (appliedCoupon) {
      setLocalCouponCode(appliedCoupon.code);
    } else {
      setLocalCouponCode("");
    }
  }, [appliedCoupon]);

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleContinueAsGuest = () => {
    setFormData({ ...formData, isGuest: true });
    setShowGuestOptions(false);
  };

  const handleLoginRedirect = () => {
    const currentPath = window.location.pathname;
    window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
  };

  const handleApplyCoupon = async () => {
    if (!localCouponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    
    setCouponCode(localCouponCode);
    await applyCoupon();
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setLocalCouponCode("");
  };

  const selectedFloor = floorsQuery.data?.find(
    (floor) => floor.id === formData.floorId
  );

  const floorCharge = selectedFloor ? selectedFloor.charges : 0;
  const zonalCharges = deliveryChargesByZipCode[formData.zipCode] || 0;
  
  // Calculate totals with discount
  const cartTotal = getCartTotal();
  const subtotalWithFloorCharges = cartTotal + floorCharge + zonalCharges;
  const grandTotal = Math.max(0, subtotalWithFloorCharges - discountAmount);

  return (
    <div className="px-0.5 md:px-8">
      {/* Guest Checkout Options */}
      {showGuestOptions && (
        <GuestCheckoutOptions
          user={user}
          onContinueAsGuest={handleContinueAsGuest}
          onLoginRedirect={handleLoginRedirect}
        />
      )}

      {(user || formData.isGuest) && (
        <div className="mt-20 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* User Status */}
          <div className="mb-4 lg:col-span-3">
            <div className="rounded-lg border border-[#bee5eb] bg-[#e8f4fd] p-4">
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-[#0c5460]">
                    Logged in as {user.data?.user?.email}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="bg-blue h-2 w-2 rounded-full"></div>
                  <span className="text-sm font-medium text-[#0c5460]">
                    Continuing as guest
                  </span>
                  <button
                    onClick={() => setShowGuestOptions(true)}
                    className="text-blue ml-auto text-xs hover:underline"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Form Section */}
          <div className="space-y-8 px-5 md:px-8 lg:col-span-2">
            {/* Contact Information */}
            <div className="rounded-xl bg-[#ffffff] p-6">
              <h1 className="mb-6 text-3xl text-[#222222] sm:text-[45px]">
                CONTACT INFORMATION
              </h1>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormInputWithLabel
                    label="FIRST NAME"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                  />
                  <FormInputWithLabel
                    label="LAST NAME"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                  />
                </div>

                <FormInputWithLabel
                  label="PHONE NUMBER"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>
            </div>

            {/* Shipping Address */}
            <div className="rounded-xl bg-[#ffffff] p-6">
              <h1 className="mb-6 text-3xl text-[#222222] sm:text-[45px]">
                SHIPPING ADDRESS
              </h1>

              <div className="space-y-4">
                <FormInputWithLabel
                  label="STREET ADDRESS *"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                />

                <FormSelectWithLabel
                  label="FLOOR *"
                  value={formData.floorId}
                  onChange={(e) => handleInputChange("floorId", e.target.value)}
                  options={
                    floorsQuery.data?.map((floor) => ({
                      value: floor.id,
                      label: `${floor.name} (£${floor.charges})`,
                    })) || []
                  }
                />

                <FormSelectWithLabel
                  label="COUNTRY *"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  options={[{ value: "uk", label: "United Kingdom" }]}
                  placeholder="Country"
                />

                <FormInputWithLabel
                  label="TOWN / CITY *"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                />

                <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormInputWithLabel
                    label="STATE / COUNTY"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                  />

                  <FormInputWithLabel
                    label="ZIP CODE"
                    value={formData.zipCode}
<<<<<<< HEAD
                    onChange={(e) =>
                      handleInputChange("zipCode", e.target.value)
                    }
=======
                    onChange={(e) => {
                      let input = e.target.value.toUpperCase();
                      input = input.replace(/[^A-Z0-9]/g, "");
                      const match = input.match(/^([0-9,A-Z]{0,3})([A-Z,0-9]{0,3})$/);
                      const letters = match?.[1] || "";
                      const digits = match?.[2] || "";
                      let formatted = letters.padEnd(3, "_") + "-" + digits.padEnd(3, "_");
                      if (letters.length + digits.length < 6) {
                        formatted = letters + (letters.length < 3 ? "" : "-") + digits;
                      }
                      handleInputChange("zipCode", formatted);
                    }}
>>>>>>> super
                  />
                  
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="billing"
                    checked={formData.differentBilling}
                    onCheckedChange={(checked) =>
                      handleInputChange("differentBilling", checked as boolean)
                    }
                  />
                  <Label htmlFor="billing" className="text-sm text-[#999999]">
                    Use a different billing address (optional)
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex gap-4 text-center">
              <Button
                onClick={onNext}
                disabled={isProcessing}
                variant="primary"
                size="xl"
                rounded="full"
                className="bg-blue hover:bg-blue/90 relative mx-auto flex h-12! w-full items-center justify-center px-8 py-4 font-semibold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing ? "Processing Payment..." : `Place Order`}
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-[413px]">
            <div className="bg-light-blue rounded-lg p-4">
              <h1 className="text-dark-gray mb-6 text-center text-3xl uppercase sm:text-start sm:text-[45px]">
                Order Summary
              </h1>

              <OrderItemsList />

              {/* Coupon Section */}
              <div className="mb-4">
                <div className="flex items-center overflow-hidden rounded-full border border-[#999999]">
                  <div className="flex items-center justify-center px-3 py-2">
                    <Image src="/t-1.png" alt="Coupon" width={20} height={20} />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={localCouponCode}
                    onChange={(e) => setLocalCouponCode(e.target.value)}
                    disabled={isApplyingCoupon || !!appliedCoupon}
                    className="flex-1 px-0 py-3 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  {!appliedCoupon ? (
                    <button
                      onClick={handleApplyCoupon}
                      disabled={!localCouponCode.trim() || isApplyingCoupon}
                      className="bg-blue hover:bg-blue/80 mr-2 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="bg-red-500 hover:bg-red-600 mr-2 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-white"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Error Message */}
                {couponError && (
                  <p className="mt-2 text-sm text-red-500">{couponError}</p>
                )}

                {/* Applied Coupon Display */}
                {appliedCoupon && discountAmount > 0 && (
                  <div className="mt-3 rounded-lg bg-green-50 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-green-700">
                          {appliedCoupon.code}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-green-600">
                        -£{discountAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Shipping & Price Summary */}
              <div className="mt-4 space-y-2">
                <SummaryLineItem label="Products Total" value={subtotal} />
                <SummaryLineItem
                  label="Assembly Charges"
                  value={assemblyTotal}
                />
                <SummaryLineItem label="Subtotal" value={cartTotal} />

                <hr className="my-2 border-t border-gray-300" />

                <SummaryLineItem
                  label="Floor Delivery Charges"
                  value={floorCharge}
                />
                <SummaryLineItem label="Shipping" value={zonalCharges} />

                {/* Discount Line */}
                {appliedCoupon && discountAmount > 0 && (
                  <SummaryLineItem
                    label={`Discount (${appliedCoupon.code})`}
                    value={-discountAmount}
                  />
                )}

                <SummaryTotalLineItem label="Grand Total" value={grandTotal} />

                {/* Savings message */}
                {appliedCoupon && discountAmount > 0 && (
                  <p className="text-right text-xs text-green-600">
                    You save: £{discountAmount.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};