interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant_id: string;
  size?: string;
  color?: string;
  assemble_charges?: number;
  availableColors?: string[];
  stock?: number;
}

export interface PaymentError {
  status?: number;
  details?: Array<{
    field: string;
    message: string;
  }>;
  stock_issues?: Array<{
    variant_id: string;
    available: number;
    requested: number;
  }>;
}

export interface ShippingOption {
  method: "free" | "express" | "pickup";
  cost: number;
  label: string;
}

export interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  country: string;
  city: string;
  state: string;
  charges: string;
  zipCode: string;
  floorId: string;
  differentBilling: boolean;
  paymentMethod: "card" | "cod";
  isGuest?: boolean;
  createAccount?: boolean;
  coupon_code?: string;       // ← ADD THIS
  discount_amount?: number;   // ← ADD THIS
}

export interface OrderData {
  orderCode: string;
  date: string;
  total: string;
  paymentMethod: string;
  items: CartItem[];
  isGuest?: boolean;
  guestEmail?: string;
  customerName?: string;
}

// Shipping options
export const SHIPPING_OPTIONS: ShippingOption[] = [
  { method: "free", cost: 0, label: "Free shipping" },
];
