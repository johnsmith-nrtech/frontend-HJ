import { ApiService } from "../api-service";

// Payment request interfaces based on API documentation
export interface AddressDto {
  street_address: string;
  address_line_2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string; // ISO 2-letter code (e.g., "GB", "US")
  country_name: string; // Full name (e.g., "United Kingdom")
  floor_id: string; // Optional floor identifier for delivery
}

export interface CartItemRequest {
  variant_id: string; // UUID of the product variant
  quantity: number; // Must be > 0
  assembly_required: boolean; // Whether assembly is required
}

export interface CreatePaymentRequest {
  // Customer Information
  contact_first_name: string;
  contact_last_name: string;
  contact_email: string;
  contact_phone?: string;

  // Address Information
  shipping_address: AddressDto;
  billing_address?: AddressDto; // Optional, uses shipping if not provided
  use_different_billing_address: boolean;

  // Cart Information
  cart_items: CartItemRequest[];

  // Optional Fields
  order_notes?: string;
}

// Payment response interfaces
export interface PaymentFormFields {
  // Tyl Required Fields
  storename: string;
  txntype: string;
  timezone: string;
  txndatetime: string;
  hash_algorithm: string;
  hashExtended: string;
  chargetotal: string;
  currency: string;
  checkoutoption: string;
  responseSuccessURL: string;
  responseFailURL: string;
  transactionNotificationURL: string;

  // Customer Information
  bname: string;
  email: string;
  phone: string;

  // Billing Address
  baddr1: string;
  baddr2?: string;
  bcity: string;
  bstate?: string;
  bcountry: string;
  bzip: string;

  // Order Information
  oid: string;
}

export interface PaymentForm {
  action_url: string; // NatWest payment URL
  method: "POST";
  fields: PaymentFormFields;
}

export interface CreatePaymentResponse {
  success: true;
  order_id: string;
  total_amount: number;
  currency: string; // "GBP"
  payment_form: PaymentForm;
}

// COD response interface
export interface CreateCODOrderResponse {
  success: true;
  order_id: string;
  total_amount: number;
  currency: string;
  message: string;
}

// Error response interfaces
export interface ValidationError {
  field: string;
  message: string;
}

export interface PaymentValidationErrorResponse {
  success: false;
  error: "Validation failed";
  details: ValidationError[];
}

export interface PaymentNotFoundErrorResponse {
  success: false;
  error: "One or more variant IDs not found";
  invalid_variants: string[];
}

export interface StockIssue {
  variant_id: string;
  requested: number;
  available: number;
}

export interface PaymentStockErrorResponse {
  success: false;
  error: "Insufficient stock";
  stock_issues: StockIssue[];
}

export interface PaymentServerErrorResponse {
  success: false;
  error: "Internal server error occurred";
}

export type PaymentErrorResponse =
  | PaymentValidationErrorResponse
  | PaymentNotFoundErrorResponse
  | PaymentStockErrorResponse
  | PaymentServerErrorResponse;

// Payment success/failure URL parameters
export interface PaymentSuccessParams {
  approval_code?: string; // Transaction approval code (starts with 'Y' for success)
  oid?: string; // Order ID
  refnumber?: string; // Transaction reference number
  status?: string; // Transaction status ('APPROVED', 'DECLINED', 'FAILED')
  txndate_processed?: string; // Processing timestamp
  response_hash?: string; // Security hash for verification
}

export interface PaymentFailureParams {
  fail_reason?: string; // Reason for payment failure
  processor_response_code?: string; // Detailed error code from payment processor
}

/**
 * Payment API service for handling Tyl payment gateway integration
 */
export class PaymentApiService {
  /**
   * Create a payment order and get Tyl payment form data
   * @param data - Payment request data
   * @param authToken - Optional authentication token. If not provided, request is made as guest
   */
  static async createPayment(
    data: CreatePaymentRequest,
    authToken?: string
  ): Promise<CreatePaymentResponse> {
    console.log("🔄 Creating payment with data:", data);
    console.log(
      "🔐 Authentication mode:",
      authToken ? "Authenticated" : "Guest"
    );

    try {
      console.log("📡 Making API request to /orders/create-payment");

      // Use fetchWithAuth for authenticated users, fetchPublic for guests
      const response = authToken
        ? await ApiService.fetchWithAuth("/orders/create-payment", {
            method: "POST",
            body: JSON.stringify(data),
          })
        : await ApiService.fetchPublic("/orders/create-payment", {
            method: "POST",
            body: JSON.stringify(data),
          });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API error response:", errorText);

        try {
          const errorData = JSON.parse(errorText);
          console.error("❌ Parsed error data:", errorData);
          throw { ...errorData, status: response.status };
        } catch (parseError) {
          console.error("❌ Failed to parse error response:", parseError);
          throw new Error(
            `API request failed with status ${response.status}: ${errorText}`
          );
        }
      }

      const result = await response.json();

      // Validate the response structure
      if (!result.payment_form) {
        console.error("❌ API response missing payment_form");
        throw new Error("Invalid API response: missing payment_form");
      }

      if (!result.payment_form.action_url) {
        console.error("❌ API response missing action_url in payment_form");
        throw new Error("Invalid API response: missing action_url");
      }

      return result;
    } catch (error) {
      console.error("❌ Payment creation error:", error);

      // If it's a network error or the backend is not running
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Unable to connect to payment server. Please ensure the backend is running at " +
            (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")
        );
      }

      throw error;
    }
  }

  /**
   * Validate payment data before sending to API
   */
  static validatePaymentData(data: CreatePaymentRequest): string[] {
    const errors: string[] = [];

    // Required fields validation
    if (!data.contact_first_name?.trim()) {
      errors.push("First name is required");
    }
    if (!data.contact_last_name?.trim()) {
      errors.push("Last name is required");
    }
    if (!data.contact_email?.trim()) {
      errors.push("Email is required");
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.contact_email && !emailRegex.test(data.contact_email)) {
      errors.push("Invalid email format");
    }

    // Address validation
    if (!data.shipping_address?.street_address?.trim()) {
      errors.push("Shipping address is required");
    }
    if (!data.shipping_address?.city?.trim()) {
      errors.push("City is required");
    }
    if (!data.shipping_address?.postal_code?.trim()) {
      errors.push("Postal code is required");
    }
    if (!data.shipping_address?.country?.trim()) {
      errors.push("Country is required");
    }
    if (!data.shipping_address?.country_name?.trim()) {
      errors.push("Country name is required");
    }

    // Cart validation
    if (!data.cart_items?.length) {
      errors.push("Cart cannot be empty");
    }

    // Validate cart items
    data.cart_items?.forEach((item, index) => {
      if (!item.variant_id?.trim()) {
        errors.push(`Cart item ${index + 1}: Variant ID is required`);
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Cart item ${index + 1}: Quantity must be greater than 0`);
      }
    });

    return errors;
  }

  /**
   * Create a Cash on Delivery (COD) order
   * @param data - Payment request data (same format as card payment)
   * @param authToken - Optional authentication token for authenticated users
   * @returns Promise<CreateCODOrderResponse>
   */
  static async createCODOrder(
    data: CreatePaymentRequest,
    authToken?: string
  ): Promise<CreateCODOrderResponse> {
    // Validate the data first
    const validationErrors = this.validatePaymentData(data);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
    }

    try {
      // Use authenticated or public API call based on token availability
      const response = authToken
        ? await ApiService.fetchWithAuth("/orders/create-cod-order", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          })
        : await ApiService.fetchPublic("/orders/create-cod-order", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `COD order creation failed: ${errorData.message || response.statusText}`
        );
      }

      const codResponse: CreateCODOrderResponse = await response.json();

      console.log("✅ COD order created successfully:", {
        order_id: codResponse.order_id,
        total_amount: codResponse.total_amount,
        currency: codResponse.currency,
      });

      return codResponse;
    } catch (error) {
      console.error("❌ COD order creation failed:", error);
      throw error;
    }
  }
}
