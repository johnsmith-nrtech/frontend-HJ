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
  console.log("Payment response:", JSON.stringify(paymentResponse, null, 2));

  const { payment_form } = paymentResponse;

  if (!payment_form) {
    console.error("❌ No payment_form in response");
    console.error("Available keys in response:", Object.keys(paymentResponse));
    throw new Error("Invalid payment response: missing payment_form");
  }

  console.log("Payment form:", JSON.stringify(payment_form, null, 2));

  if (!payment_form.action_url) {
    console.error("❌ No action_url in payment_form");
    console.error("Available keys in payment_form:", Object.keys(payment_form));
    console.error("payment_form.action_url value:", payment_form.action_url);
    throw new Error("Invalid payment response: missing action_url");
  }

  console.log("📝 Creating form with action:", payment_form.action_url);

  // Validate action URL before creating form
  if (
    !payment_form.action_url ||
    payment_form.action_url === "null" ||
    payment_form.action_url === null
  ) {
    console.error("❌ Invalid action URL:", payment_form.action_url);
    throw new Error(`Invalid action URL: ${payment_form.action_url}`);
  }

  // Create a form element
  const form = document.createElement("form");
  form.method = payment_form.method;
  form.action = payment_form.action_url;
  form.style.display = "none";

  console.log("🔧 Adding form fields...");

  // Add all the fields as hidden inputs
  Object.entries(payment_form.fields).forEach(([name, value]) => {
    if (value !== undefined && value !== null && value !== "null") {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = String(value);
      form.appendChild(input);
      console.log(`  ✅ Added field: ${name} = ${value}`);
    } else {
      console.log(`  ⚠️ Skipped field: ${name} (value: ${value})`);
    }
  });

  console.log("📤 Submitting form to:", form.action);
  console.log("📋 Form method:", form.method);
  console.log("🏷️ Form fields count:", form.children.length);

  // Log the complete form HTML (truncated for readability)
  const formHTML = form.outerHTML;
  console.log(
    "📄 Form HTML preview:",
    formHTML.substring(0, 500) + (formHTML.length > 500 ? "..." : "")
  );

  // Append form to body and submit
  document.body.appendChild(form);
  console.log("📎 Form appended to body");

  // Auto-submit after delay
  setTimeout(() => {
    try {
      console.log("🚀 Attempting form submission...");
      console.log("🔍 Final form action before submit:", form.action);
      console.log("🔍 Final form method before submit:", form.method);

      form.submit();
      console.log("✅ Form submitted successfully");
    } catch (error) {
      console.error("❌ Form submission failed:", error);
      console.error("❌ Form details at time of error:", {
        action: form.action,
        method: form.method,
        fieldsCount: form.children.length,
      });
      throw error;
    }
  }, 100);
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
  cartItems: CartItemRequest[]
): CartItemRequest[] {
  return cartItems.map((item) => ({
    variant_id: item.variant_id,
    quantity: item.quantity,
  }));
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
