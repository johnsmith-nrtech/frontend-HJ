"use client";

import { useCart } from "@/lib/store/cart-store";
import { useAuth } from "@/lib/providers/auth-provider";
import React, { useState, useEffect } from "react";

import { OrderCompleteTab } from "./_components/order-complete-tab";
import { CheckoutDetailsTab } from "./_components/checkout-details-tab";
import { CartSteps } from "./_components/cart-steps";
import { useCheckoutForm } from "./use-checkout-form";
import {
  AuthLoading,
  CartError,
  EmptyCart,
} from "./_components/cart-page-states";
import { GuestCheckoutOptions } from "./_components/guest-checkout-options";
import { EmailTab } from "./_components/email-tab";
import { ShoppingCartTab } from "./_components/shopping-cart-tab";

export default function CartPage() {
  const [isClient, setIsClient] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const { totalItems, error: cartError } = useCart();

  const {
    currentStep,
    orderData,
    showGuestOptions,
    handleContinueAsGuest,
    handleLoginRedirect,
    handleNext,
    formData,
    setFormData,
    handlePlaceOrder,
    isProcessingPayment,
    couponCode,
    setCouponCode,
    appliedCoupon,
    discountAmount,
    setDiscountAmount,
    isApplyingCoupon,
    couponError,
    applyCoupon,
    removeCoupon,
    referralCredit,
    referralDiscount,
  } = useCheckoutForm();

  // Fix hydration error by waiting for client-side mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading state while authentication is being determined
  if (authLoading || !isClient) {
    return <AuthLoading />;
  }

  // Show error state if there's a cart error
  if (cartError) {
    return <CartError cartError={cartError} />;
  }

  if (totalItems === 0 && currentStep === 1) {
    return <EmptyCart />;
  }

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8">
      <h1 className="mt-10 mb-4 text-center text-3xl sm:text-6xl">
        {currentStep === 1
          ? "CART"
          : currentStep === 2
            ? "CHECKOUT DETAILS"
            : "ORDER COMPLETE"}
      </h1>

      <CartSteps currentStep={currentStep} />

      {showGuestOptions && (
        <GuestCheckoutOptions
          user={user}
          onContinueAsGuest={handleContinueAsGuest}
          onLoginRedirect={handleLoginRedirect}
        />
      )}

      {currentStep === 1 && (
        <ShoppingCartTab
          onNext={handleNext}
          referralCredit={referralCredit}
          referralDiscount={referralDiscount}
          couponProps={{
            couponCode,
            setCouponCode,
            appliedCoupon,
            discountAmount,
            setDiscountAmount,
            isApplyingCoupon,
            couponError,
            applyCoupon,
            removeCoupon,
          }}
        />
      )}

      {currentStep === 2 && (
        <EmailTab
          formData={formData}
          onNext={handleNext}
          setFormData={setFormData}
          couponProps={{
            couponCode,
            setCouponCode,
            appliedCoupon,
            discountAmount,
            isApplyingCoupon,
            couponError,
            applyCoupon,
            removeCoupon,
          }}
        />
      )}

      {currentStep === 3 && (
        <CheckoutDetailsTab
          onNext={handlePlaceOrder}
          formData={formData}
          setFormData={setFormData}
          isProcessing={isProcessingPayment}
          referralCredit={referralCredit}
          referralDiscount={referralDiscount}
          couponProps={{
            couponCode,
            setCouponCode,
            appliedCoupon,
            discountAmount,
            isApplyingCoupon,
            couponError,
            applyCoupon,
            removeCoupon,
          }}
        />
      )}

      {currentStep === 4 && <OrderCompleteTab orderData={orderData} />}
    </div>
  );
}