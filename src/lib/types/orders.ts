// Orders API Types
// Based on the API specification in orders.md

export type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Address {
  recipient_name: string;
  line1: string;
  line2?: string;
  street_address: string;
  address_line_2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  country_name?: string;
  phone?: string;
}

export interface Product {
  id: string;
  name: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  price: number;
  compare_price?: number;
  size: string;
  color: string;
  discount_percentage?: number;
  material?: string;
  brand?: string;
  product: Product;
  assemble_charges?: number | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
  discount_applied: number;
  assembly_required: boolean;
  created_at: string;
  image_url: string;
  variant: ProductVariant;
}

export interface Order {
  id: string;
  user_id: string | null;
  status: OrderStatus;
  total_amount: number;
  currency: string;
  shipping_address: Address;
  billing_address: Address;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  // Additional fields from actual API response
  contact_first_name: string;
  contact_last_name: string;
  contact_phone?: string;
  contact_email: string;
  use_different_billing_address: boolean;
  order_notes?: string;
  coupon_code?: string;
  discount_amount: number;
  shipping_cost: number;
  tax_amount: number;
  floor: { name: string; charges: number } | null;
  zone: {
    zone_name: string;
    zip_code: string;
    delivery_charges: number;
  } | null;
}

export interface OrdersListResponse {
  items: Order[];
  meta: {
    totalItems: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface OrdersListParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: OrderStatus;
  user_id?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export interface OrderStatusUpdateInput {
  status: OrderStatus;
}

export interface OrderCancelInput {
  reason: string;
}

export interface CheckoutItem {
  variant_id: string;
  quantity: number;
}

export interface CheckoutInput {
  shipping_address: Address;
  billing_address: Address;
  items: CheckoutItem[];
  payment_method_id?: string;
  session_id?: string;
}

export interface CheckoutValidationInput {
  shipping_address?: Address;
  billing_address?: Address;
  items: CheckoutItem[];
  session_id?: string;
}

export interface CheckoutValidationResponse {
  isValid: boolean;
  items?: Array<{
    variant_id: string;
    quantity: number;
    inStock: boolean;
    currentPrice: number;
  }>;
  total?: number;
  currency?: string;
  errors?: Array<{
    variant_id: string;
    message: string;
  }>;
}

// Payment Gateway Types
export interface PaymentFormData {
  contact_first_name: string;
  contact_last_name: string;
  contact_email: string;
  contact_phone?: string;
  shipping_address: {
    street_address: string;
    address_line_2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
    country_name: string;
  };
  billing_address?: {
    street_address: string;
    address_line_2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
    country_name: string;
  };
  use_different_billing_address: boolean;
  cart_items: Array<{
    variant_id: string;
    quantity: number;
  }>;
  order_notes?: string;
}

export interface PaymentResponse {
  success: boolean;
  order_id: string;
  total_amount: number;
  currency: string;
  payment_form?: {
    action_url: string;
    method: string;
    fields: Record<string, string>;
  };
  message?: string;
  error?: string;
}

export interface CODOrderResponse {
  success: boolean;
  order_id: string;
  total_amount: number;
  currency: string;
  message: string;
  error?: string;
}
