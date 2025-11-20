import { useCart } from "@/lib/store/cart-store";
import React from "react";
import { FormData } from "../cart-page.types";
import { toast } from "sonner";
import { GuestCheckoutOptions } from "./guest-checkout-options";
import { FormInputWithLabel } from "./checkout-form-inputs";
import { Button } from "@/components/button-custom";
import { ArrowRightIcon } from "lucide-react";
import { OrderItemsList } from "./order-items";
import Image from "next/image";
import { useAuth } from "@/lib/providers/auth-provider";
import { SummaryLineItem, SummaryTotalLineItem } from "./cart-summary";

export const EmailTab = ({
  onNext,
  formData,
  setFormData,
}: {
  onNext: () => void;
  formData: FormData;
  setFormData: (data: FormData) => void;
}) => {
  const { user } = useAuth();
  const {
    subtotal,
    assemblyTotal,
    discount,
    couponCode,

    setCouponCode,
    setDiscount,

    getCartTotal,
  } = useCart();

  const [showGuestOptions, setShowGuestOptions] = React.useState(
    !user && !formData.isGuest
  );

  const [localCouponCode, setLocalCouponCode] = React.useState(couponCode);
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
    window.location.href = `/auth/login?redirect=${encodeURIComponent(
      currentPath
    )}`;
  };

  const applyDiscount = () => {
    const code = localCouponCode.toLowerCase();
    if (code === "save10") {
      setDiscount((subtotal + assemblyTotal) * 0.1);
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

  const handleNext = () => {
    if (!formData.email) {
      toast.error("Email is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    onNext();
  };

  return (
    <div className="px-0.5 md:px-8">
      {showGuestOptions && (
        <GuestCheckoutOptions
          user={user}
          onContinueAsGuest={handleContinueAsGuest}
          onLoginRedirect={handleLoginRedirect}
        />
      )}

      {(user || formData.isGuest) && (
        <div className="mt-20 grid grid-cols-1 gap-4 lg:grid-cols-3">
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

          <div className="space-y-8 px-5 md:px-8 lg:col-span-2">
            <div className="rounded-xl bg-[#ffffff] p-6">
              <h1 className="mb-6 text-3xl text-[#222222] sm:text-[45px]">
                CONTACT INFORMATION
              </h1>
              <p className="mb-4 text-sm text-[#666]">
                Enter your email address to receive order updates and
                confirmation.
              </p>
              <FormInputWithLabel
                label="EMAIL ADDRESS"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(ev) => handleInputChange("email", ev.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleNext}
                variant="primary"
                size="xl"
                rounded="full"
                className="bg-blue hover:bg-blue/90 relative mx-auto flex !h-12 w-full flex-row items-center justify-center px-8 py-4 font-semibold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                icon={<ArrowRightIcon />}
              >
                Continue
              </Button>
            </div>
          </div>

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
                    placeholder="Coupon Code"
                    value={localCouponCode}
                    onChange={(e) => setLocalCouponCode(e.target.value)}
                    className="flex-1 px-0 py-3 focus:outline-none"
                  />
                  <button
                    onClick={applyDiscount}
                    className="bg-blue hover:bg-blue/80 mr-2 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-white"
                  >
                    <Image
                      src="/arrow-right1.png"
                      alt="Apply"
                      width={20}
                      height={20}
                    />
                  </button>
                </div>
                {discount > 0 && (
                  <div className="mt-2 flex items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/t-2.png"
                        alt="Coupon"
                        width={20}
                        height={20}
                      />
                      <span className="text-sm font-medium text-[#222]">
                        {couponCode}
                      </span>
                    </div>
                    <span className="text-sm text-[#999]">
                      -£{discount.toFixed(2)} [Remove]
                    </span>
                  </div>
                )}
              </div>

              {/* Price Summary */}
              <div className="mt-4 space-y-2">
                <SummaryLineItem label="Products Total" value={subtotal} />

                {assemblyTotal > 0 ? (
                  <SummaryLineItem
                    value={assemblyTotal}
                    label="Assembly Charges"
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
