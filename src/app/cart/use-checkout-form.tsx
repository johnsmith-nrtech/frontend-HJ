import React from "react";
import { FormData, OrderData, PaymentError } from "./cart-page.types";
import { useCart } from "@/lib/store/cart-store";
import { toast } from "sonner";
import {
  CreatePaymentRequest,
  CreatePaymentResponse,
  PaymentApiService,
} from "@/lib/api/payment";
import {
  redirectToPayment,
  getPaymentErrorMessage,
  storeOrderId,
  convertCartItemsToPaymentFormat,
  getCountryName,
  formatPhoneNumber,
} from "@/lib/utils/payment-utils";
import { SessionManager } from "@/lib/services/session-manager";
import { useAuth } from "@/lib/providers/auth-provider";

// Type for coupon returned by backend
interface AppliedCoupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
}

export function useCheckoutForm() {
  const { items, getCartTotal, clearCart } = useCart();
  const { user, session } = useAuth();

  const [currentStep, setCurrentStep] = React.useState(1);
  const [isProcessingPayment, setIsProcessingPayment] = React.useState(false);
  const [orderData, setOrderData] = React.useState<OrderData | null>(null);
  const [showGuestOptions, setShowGuestOptions] = React.useState(false);

  const [formData, setFormData] = React.useState<FormData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    country: "",
    city: "",
    state: "",
    charges: "",
    zipCode: "",
    floorId: "",
    differentBilling: false,
    paymentMethod: "card",
  });

  // Coupon state
  const [couponCode, setCouponCode] = React.useState("");
  const [appliedCoupon, setAppliedCoupon] = React.useState<AppliedCoupon | null>(null);
  const [discountAmount, setDiscountAmount] = React.useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = React.useState(false);
  const [couponError, setCouponError] = React.useState("");

  // Compute totals
  const totalPrice = React.useMemo(() => getCartTotal(), [getCartTotal, items]);
  const finalTotal = React.useMemo(
    () => Math.max(0, totalPrice - discountAmount),
    [totalPrice, discountAmount]
  );

  // Recalculate discount when coupon or total changes
  React.useEffect(() => {
    if (appliedCoupon) {
      if (appliedCoupon.discount_type === "percentage") {
        setDiscountAmount((totalPrice * appliedCoupon.discount_value) / 100);
      } else {
        setDiscountAmount(appliedCoupon.discount_value);
      }
    } else {
      setDiscountAmount(0);
    }
  }, [appliedCoupon, totalPrice]);

  React.useEffect(() => {
    if (user?.data?.user?.email && formData.email === "") {
      setFormData((prev) => ({ ...prev, email: user.data.user.email }));
    }
  }, [user, formData.email]);

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const step = urlParams.get("step");
    const loginSource = localStorage.getItem("loginSource");
    if (user && step === "2" && loginSource === "cart-checkout") {
      localStorage.removeItem("redirectAfterLogin");
      localStorage.removeItem("loginSource");
      setCurrentStep(2);
      setShowGuestOptions(false);
      toast.success("Welcome back! Continue with your checkout.");
    }
  }, [user]);

  const handleNext = () => {
    if (!user && currentStep === 1) {
      setShowGuestOptions(true);
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handleContinueAsGuest = () => {
    setFormData((prev) => ({ ...prev, isGuest: true }));
    setShowGuestOptions(false);
    setCurrentStep(2);
  };

  const handleLoginRedirect = () => {
    localStorage.setItem("redirectAfterLogin", "/cart?step=2");
    localStorage.setItem("loginSource", "cart-checkout");
    window.location.href = "/login";
  };

  const getCountryCode = (country: string): string => {
    const countryMap: Record<string, string> = { us: "US", uk: "GB", ca: "CA" };
    return countryMap[country] || "GB";
  };

  const handleCODSuccess = (codResponse: { order_id: string }) => {
    const orderDataForSuccess = {
      orderCode: `#${codResponse.order_id.slice(-8).toUpperCase()}`,
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      total: finalTotal.toFixed(2),
      paymentMethod: "Cash on Delivery",
      items: items,
      isGuest: formData.isGuest,
      guestEmail: formData.isGuest ? formData.email : undefined,
      customerName: `${formData.firstName} ${formData.lastName}`,
    };
    try {
      localStorage.setItem("lastOrderData", JSON.stringify(orderDataForSuccess));
    } catch {}
    setOrderData(orderDataForSuccess);
    clearCart();
    setIsProcessingPayment(false);
    toast.dismiss("payment-processing");
    toast.success("🎉 COD order placed successfully! You will pay when delivered.", {
      duration: 5000,
    });
    setCurrentStep(3);
  };

  const handleCardPaymentSuccess = (paymentResponse: CreatePaymentResponse) => {
    storeOrderId(paymentResponse.order_id);
    const orderDataForSuccess = {
      orderCode: `#${paymentResponse.order_id.slice(-8).toUpperCase()}`,
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      total: finalTotal.toFixed(2),
      paymentMethod: formData.paymentMethod === "card" ? "Credit Card" : "Cash on Delivery",
      items: items,
      isGuest: formData.isGuest,
      guestEmail: formData.isGuest ? formData.email : undefined,
      customerName: `${formData.firstName} ${formData.lastName}`,
    };
    try {
      localStorage.setItem("lastOrderData", JSON.stringify(orderDataForSuccess));
    } catch {}
    setOrderData(orderDataForSuccess);
    toast.dismiss("payment-processing");
    toast.success("Payment initiated! Redirecting to secure payment page...");
    redirectToPayment(paymentResponse);
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    setCouponError("");

    try {
      const token = session?.access_token;
      if (!token) throw new Error("You must be logged in to apply a coupon");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/coupons/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: couponCode.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid or expired coupon");
      }

      setAppliedCoupon({
        id: data.id,
        code: data.code,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
      });
      setCouponError("");
    } catch (err: any) {
      setCouponError(err.message);
      setAppliedCoupon(null);
      setDiscountAmount(0);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setDiscountAmount(0);
    setCouponError("");
  };

  const handlePlaceOrder = async () => {
    try {
      setIsProcessingPayment(true);
      const validationErrors = validateFormData();
      if (validationErrors.length > 0) {
        toast.error(validationErrors[0]);
        setIsProcessingPayment(false);
        return;
      }

      if (formData.isGuest) {
        toast.loading("Processing your guest checkout...", { id: "payment-processing" });
      } else {
        toast.loading("Processing your order...", { id: "payment-processing" });
      }

      const paymentData: CreatePaymentRequest & {
        coupon_id?: string;
        discount_amount?: number;
      } = {
        contact_first_name: formData.firstName,
        contact_last_name: formData.lastName,
        contact_email: formData.email,
        contact_phone: formData.phone ? formatPhoneNumber(formData.phone) : undefined,
        shipping_address: {
          street_address: formData.address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.zipCode,
          country: getCountryCode(formData.country),
          country_name: getCountryName(getCountryCode(formData.country)),
          floor_id: formData.floorId,
        },
        use_different_billing_address: formData.differentBilling,
        billing_address: formData.differentBilling
          ? {
              street_address: formData.address,
              city: formData.city,
              state: formData.state,
              postal_code: formData.zipCode,
              country: getCountryCode(formData.country),
              country_name: getCountryName(getCountryCode(formData.country)),
              floor_id: formData.floorId,
            }
          : undefined,
        cart_items: convertCartItemsToPaymentFormat(items),
        coupon_id: appliedCoupon?.id,
        discount_amount: discountAmount,
      };

      const errors = PaymentApiService.validatePaymentData(paymentData);
      if (errors.length > 0) {
        toast.error(errors[0]);
        setIsProcessingPayment(false);
        return;
      }

      const authToken = formData.isGuest ? undefined : SessionManager.getAccessToken();

      if (formData.paymentMethod === "cod") {
        const codResponse = await PaymentApiService.createCODOrder(
          paymentData,
          authToken || undefined
        );
        handleCODSuccess(codResponse);
      } else {
        const paymentResponse = await PaymentApiService.createPayment(
          paymentData,
          authToken || undefined
        );
        handleCardPaymentSuccess(paymentResponse);
      }
    } catch (error: unknown) {
      console.error("❌ Payment creation error:", error);
      setIsProcessingPayment(false);
      toast.dismiss("payment-processing");
      toast.error(getPaymentErrorMessage(error));
    }
  };

  const validateFormData = (): string[] => {
    const errors: string[] = [];
    if (!formData.firstName.trim()) errors.push("First name is required");
    if (!formData.lastName.trim()) errors.push("Last name is required");
    if (!formData.email.trim()) errors.push("Email is required");
    if (!formData.address.trim()) errors.push("Address is required");
    if (!formData.city.trim()) errors.push("City is required");
    if (!formData.zipCode.trim()) errors.push("Zip code is required");
    if (!formData.country.trim()) errors.push("Country is required");
    if (!formData.floorId.trim()) errors.push("Please select a delivery floor option");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push("Please enter a valid email address");
    }
    return errors;
  };

  return {
    formData,
    setFormData,
    currentStep,
    handleNext,
    handlePlaceOrder,
    showGuestOptions,
    handleContinueAsGuest,
    handleLoginRedirect,
    isProcessingPayment,
    orderData,
    // Coupon exports
    couponCode,
    setCouponCode,
    appliedCoupon,
    discountAmount,
    setDiscountAmount, // ✅ This is now included!
    isApplyingCoupon,
    couponError,
    applyCoupon,
    removeCoupon,
    finalTotal,
  };
}