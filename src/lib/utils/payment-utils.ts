import {
  CreatePaymentResponse,
  AddressDto,
  CartItemRequest,
  CreatePaymentRequest,
} from "../api/payment";

interface PaymentError {
  status?: number;
  message?: string;
}

/**
 * Auto-submit payment form to redirect customer to NatWest's payment page
 */
export function redirectToPayment(
  paymentResponse: CreatePaymentResponse
): void {
  console.log("🚀 Starting payment redirect...");

  const { payment_url } = paymentResponse;

  if (!payment_url) {
    throw new Error("Invalid payment response: missing payment_url");
  }

  console.log("🔗 Redirecting to Worldpay:", payment_url.substring(0, 60) + "...");

  // Simply redirect — Worldpay hosts the payment page
  window.location.href = payment_url;
}



/**
 * Handle payment errors and provide user-friendly messages
 */
export function getPaymentErrorMessage(error: unknown): string {
  const paymentError = error as PaymentError;
  if (paymentError?.status === 400) {
    return "Please check your information and try again.";
  } else if (paymentError?.status === 404) {
    return "Some items in your cart are no longer available.";
  } else if (paymentError?.status === 409) {
    return "Some items in your cart are out of stock.";
  } else if (paymentError?.status === 500) {
    return "A technical error occurred. Please try again later.";
  } else {
    return "Payment could not be processed. Please try again.";
  }
}

/**
 * Log payment attempt for debugging (without sensitive data)
 */
export function logPaymentAttempt(
  data: CreatePaymentRequest,
  response?: CreatePaymentResponse
): void {
  console.log("Payment initiated:", {
    order_id: response?.order_id,
    amount: response?.total_amount,
    customer_email: data.contact_email,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Store order ID for later reference
 */
export function storeOrderId(orderId: string): void {
  localStorage.setItem("current_order_id", orderId);
}

/**
 * Get stored order ID
 */
export function getStoredOrderId(): string | null {
  return localStorage.getItem("current_order_id");
}

/**
 * Clear stored order ID
 */
export function clearStoredOrderId(): void {
  localStorage.removeItem("current_order_id");
}

/**
 * Convert cart items to payment request format
 */
export function convertCartItemsToPaymentFormat(
  cartItems: any[]
): CartItemRequest[] {
  const result: CartItemRequest[] = [];

  cartItems.forEach((item) => {
    if (item.delivery_time_days === "Bundle" && item.bundleVariants?.length > 0) {
      const pricePerVariant = item.price / item.bundleVariants.length;
      // ✅ Expand bundle into individual variant items for backend
      item.bundleVariants.forEach((variantId: string) => {
        result.push({
          variant_id: variantId,       // ✅ real variant ID
          quantity: item.quantity,
          assembly_required: false,
          unit_price_override: pricePerVariant,
        });
      });
    } else {
      // Normal product
      result.push({
        variant_id: item.variant_id,
        quantity: item.quantity,
        assembly_required: item.assembly_required ?? false,
      });
    }
  });

  return result;
}

/**
 * Format address for payment request
 */
export function formatAddressForPayment(address: AddressDto): AddressDto {
  return {
    street_address: address.street_address,
    address_line_2: address.address_line_2,
    city: address.city,
    state: address.state,
    postal_code: address.postal_code,
    country: address.country,
    country_name: address.country_name || getCountryName(address.country),
    floor_id: address.floor_id,
  };
}

/**
 * Get country name from country code
 */
export function getCountryName(countryCode: string): string {
  const countryMap: Record<string, string> = {
    GB: "United Kingdom",
    US: "United States",
    CA: "Canada",
    AU: "Australia",
    DE: "Germany",
    FR: "France",
    IT: "Italy",
    ES: "Spain",
    NL: "Netherlands",
    BE: "Belgium",
    // Add more countries as needed
  };

  return countryMap[countryCode] || countryCode;
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phone: string): boolean {
  // Basic phone validation - adjust regex as needed
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""));
}

/**
 * Format phone number for payment
 */
export function formatPhoneNumber(phone: string): string {
  // Remove common formatting characters
  return phone.replace(/[\s\-\(\)]/g, "");
}

/**
 * Check if payment is in test mode
 */
export function isTestMode(): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_PAYMENT_MODE === "test"
  );
}

/**
 * Get test card details for development
 */
export function getTestCardDetails() {
  return {
    cardNumber: "4000000000000002",
    expiry: "12/25",
    cvv: "123",
    name: "Test User",
  };
}
