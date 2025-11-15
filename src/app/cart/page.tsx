"use client";

import { useCart } from "@/lib/store/cart-store";
import { useAuth } from "@/lib/providers/auth-provider";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import SafeImage from "@/components/ui/safe-image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Visa, Mastercard ,Amex,Klarna } from "react-pay-icons";
import { useFloors } from "@/hooks/use-floors";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Minus, Plus, X, Loader2, ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/button-custom";
import {
  PaymentApiService,
  CreatePaymentRequest,
  CreatePaymentResponse,
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
import { cn } from "@/lib/utils";

// Define types for better TypeScript support
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

interface PaymentError {
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

interface ShippingOption {
  method: "free" | "express" | "pickup";
  cost: number;
  label: string;
}

interface FormData {
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
  differentBilling: boolean;
  paymentMethod: "card" | "cod";
  isGuest?: boolean;
  createAccount?: boolean;
}

interface OrderData {
  orderCode: string;
  date: string;
  total: string;
  paymentMethod: string;
  items: CartItem[];
  isGuest?: boolean;
  guestEmail?: string;
  customerName?: string;
}

// Dynamic color mapping - matches product details page
const COLOR_MAP: Record<string, string> = {
  Black: "#000000",
  White: "#FFFFFF",
  Gray: "#808080",
  Grey: "#808080",
  Brown: "#8B4513",
  Beige: "#F5F5DC",
  Navy: "#000080",
  Blue: "#0000FF",
  Green: "#008000",
  Red: "#FF0000",
  Pink: "#FFC0CB",
  Purple: "#800080",
  Orange: "#FFA500",
  Yellow: "#FFFF00",
  Cream: "#FFFDD0",
  Charcoal: "#36454F",
  Emerald: "#50C878",
  Burgundy: "#800020",
  Teal: "#008080",
  Olive: "#808000",
  Maroon: "#800000",
};

// Shipping options
const SHIPPING_OPTIONS: ShippingOption[] = [
  { method: "free", cost: 0, label: "Free shipping" },
];

// Dynamic Color Selection Component
const ColorSelection = ({
  availableColors,
  selectedColor,
  onColorChange,
}: {
  availableColors: string[];
  selectedColor: string;
  onColorChange: (color: string) => void;
}) => {
  // Filter out colors that don't have a valid hex code
  const validColors = availableColors.filter((color) => COLOR_MAP[color]);

  



  if (validColors.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <div
          className="h-6 w-6 rounded-full border-2 border-gray-300"
          style={{ backgroundColor: COLOR_MAP[selectedColor] || "#000000" }}
          title={selectedColor || "Default Color"}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {validColors.map((colorName) => {
        const isSelected = selectedColor === colorName;
        const colorHex = COLOR_MAP[colorName];

        return (
          <button
            key={colorName}
            onClick={() => onColorChange(colorName)}
            className={`relative h-6 w-6 rounded-full border-2 transition-all duration-200 ${
              isSelected
                ? "ring-blue scale-110 shadow-lg ring-1 ring-offset-1"
                : "border-gray-300 hover:border-gray-400"
            }`}
            style={{ backgroundColor: colorHex }}
            title={colorName}
          />
        );
      })}
    </div>
  );
};

// Cart Steps Component
const CartSteps = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    {
      number: 1,
      title: "Shopping cart",
      icon: (
        <svg
          className="h-4 w-4 sm:h-5 sm:w-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
        </svg>
      ),
    },
    {
      number: 2,
      title: "Email",
      icon: (
        <svg
          className="h-4 w-4 sm:h-5 sm:w-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      number: 3,
      title: "Checkout details",
      icon: (
        <svg
          className="h-4 w-4 sm:h-5 sm:w-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      number: 4,
      title: "Order complete",
      icon: (
        <svg
          className="h-4 w-4 sm:h-5 sm:w-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="mb-4 flex w-full items-start justify-center gap-4 sm:mb-4 sm:gap-10 lg:gap-20">
      {steps.map((step) => (
        <div key={step.number}>
          <div
            className={cn(
              "relative flex flex-col",
              currentStep >= step.number && "border-blue-500 pb-4 sm:border-b-2"
            )}
          >
            <div className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ease-in-out sm:h-10 sm:w-10 sm:text-lg ${
                  currentStep >= step.number
                    ? "bg-blue text-white shadow-lg"
                    : "bg-[#999999] text-sm text-white"
                }`}
              >
                {/* Show icon on small screens, number on larger screens */}
                <span className="block sm:hidden">
                  {currentStep > step.number ? (
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    step.icon
                  )}
                </span>
                <span className="hidden sm:block">{step.number}</span>
              </div>
              <span
                className={`ml-2 text-xs whitespace-nowrap transition-colors duration-300 ease-in-out sm:ml-3 sm:text-sm ${
                  currentStep >= step.number
                    ? "text-blue font-medium"
                    : "text-[#999]"
                }`}
              >
                {/* Hide title on small screens, show on larger screens */}
                <span className="hidden text-[18px] sm:inline">
                  {step.title}
                </span>
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

 

// Global object to store assemble selection by item ID
const assembleSelectedGlobal: Record<string, boolean> = {};

// Update a single item's assemble state
const setAssembleSelectedGlobal = (id: string, value: boolean) => {
  assembleSelectedGlobal[id] = value;
};

// Optional: initialize items (all false)
const initializeAssembleGlobal = (itemIds: string[]) => {
  itemIds.forEach(id => {
    if (!(id in assembleSelectedGlobal)) assembleSelectedGlobal[id] = false;
  });
};

// --- ShoppingCartTab ---
const ShoppingCartTab = ({ onNext }: { onNext: () => void }) => {
  const {
    items,
    totalPrice,
    shippingInfo,
    discount,
    couponCode,
    updateQuantity,
    removeItem,
    updateItemColor,
    setShippingInfo,
    setDiscount,
    setCouponCode,
    isLoading: cartLoading,
    isItemLoading,
    checkAuthStatus,
  } = useCart();

  const [localCouponCode, setLocalCouponCode] = useState(couponCode);
  const [, setTick] = useState(0);

  // Initialize assemble state
  useEffect(() => {
    initializeAssembleGlobal(items.map((item) => item.id));
    setTick((t) => t + 1);
  }, [items]);

  const handleQuantityChange = (id: string, newQty: number) => {
    if (newQty < 1) removeItem(id);
    else updateQuantity(id, newQty);
  };

  const handleColorChange = (id: string, color: string) => {
    updateItemColor(id, color);
  };

  const handleShippingChange = (option: ShippingOption) => {
    setShippingInfo(option);
  };

  const handleAssembleChange = (id: string, value: boolean) => {
    setAssembleSelectedGlobal(id, value);
    setTick((t) => t + 1);
  };

  // Coupon application
  const applyDiscount = () => {
    const code = localCouponCode.toLowerCase();
    if (code === "save10") {
      setDiscount(totalPrice * 0.1);
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

  // Calculate totals
  const assembleTotal = items.reduce(
    (sum, item) =>
      sum +
      (assembleSelectedGlobal[item.id] && item.assemble_charges
        ? item.assemble_charges * item.quantity
        : 0),
    0
  );

  const subtotal = totalPrice + assembleTotal;
  const total = subtotal + shippingInfo.cost - discount;

  const isAuthenticated = checkAuthStatus();

  return (
    <div className="mx-auto px-4 sm:px-[32px]">
      {cartLoading && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="flex items-center gap-2">
            <div className="border-blue h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
            <span className="text-blue text-sm">
              {isAuthenticated ? "Syncing cart with server..." : "Updating cart..."}
            </span>
          </div>
        </div>
      )}

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
            items.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center gap-4 border-b border-gray-100 py-4 sm:flex-nowrap"
              >
                {/* Image */}
                <div className="h-20 w-20 flex-shrink-0 rounded bg-white md:h-36 md:w-36">
                  <SafeImage
                    src={
                      item.image ||
                      "https://placehold.co/80x80/e0e0e0/000000?text=No+Image"
                    }
                    alt={item.name}
                    width={80}
                    height={80}
                    className="h-full w-full rounded object-contain"
                  />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-gray-900 uppercase md:text-[27px]">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Color: {item.variant?.color || item.color || "Black"}
                  </p>
                  {item.variant?.size && (
                    <p className="text-xs text-gray-500">Size: {item.variant.size}</p>
                  )}

                  {item.assemble_charges && (
                    <div className="mt-2 flex items-center gap-2">
                      <Checkbox
                        checked={!!assembleSelectedGlobal[item.id]}
                        onCheckedChange={(v) =>
                          handleAssembleChange(item.id, v as boolean)
                        }
                        id={`assemble-${item.id}`}
                      />
                      <label
                        htmlFor={`assemble-${item.id}`}
                        className="text-sm text-gray-700"
                      >
                        Add Assembly (£{item.assemble_charges.toFixed(2)})
                      </label>
                    </div>
                  )}

                  <button
                    onClick={() => removeItem(item.id)}
                    disabled={isItemLoading(item.id)}
                    className="mt-2 flex items-center gap-1 text-sm text-gray-400 hover:text-red-500 disabled:opacity-50"
                  >
                    {isItemLoading(item.id) ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <X className="h-5 w-5" />
                    )}
                    {isItemLoading(item.id) ? "Removing..." : "Remove"}
                  </button>
                </div>

                {/* Quantity / Color / Price */}
                <div className="mt-4 flex w-full items-center justify-between gap-8 sm:mt-0 sm:w-auto sm:justify-start">
                  <div className="flex items-center overflow-hidden rounded-full border border-gray-300">
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity - 1)
                      }
                      className="flex h-8 w-8 items-center justify-center hover:bg-gray-50"
                    >
                      <Minus className="h-4 w-4 text-gray-600" />
                    </button>

                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity + 1)
                      }
                      className="flex h-8 w-8 items-center justify-center hover:bg-gray-50"
                    >
                      <Plus className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>

                  <ColorSelection
                    availableColors={
                      item.variant?.availableColors ||
                      item.availableColors || [item.variant?.color || item.color || "Black"]
                    }
                    selectedColor={item.variant?.color || item.color || "Black"}
                    onColorChange={(color) => handleColorChange(item.id, color)}
                  />

                  <div className="min-w-[80px] text-right">
                    <span className="text-lg font-medium">
                      £{(
                        item.price * item.quantity +
                        (assembleSelectedGlobal[item.id] && item.assemble_charges
                          ? item.assemble_charges * item.quantity
                          : 0)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Coupon */}
          <div className="mt-4 w-full md:w-[500px]">
            <h3 className="mb-2 text-3xl">Have a coupon?</h3>
            <p className="mb-4 text-base text-[#999999]">
              Add your code for an instant cart discount
            </p>
            <div className="flex items-center overflow-hidden rounded-full border border-[#999999]">
              <div className="flex items-center justify-center px-3 py-2">
                <Image src="/t-1.png" alt="Coupon" width={20} height={20} />
              </div>

              <input
                type="text"
                placeholder="Coupon Code"
                value={localCouponCode}
                onChange={(e) => setLocalCouponCode(e.target.value)}
                className="flex-1 px-0 py-3 text-sm focus:outline-none"
              />

              <button
                onClick={applyDiscount}
                className="mr-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue text-white hover:bg-blue/80"
              >
                <Image
                  src="/arrow-right1.png"
                  alt="Apply"
                  width={20}
                  height={20}
                />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Summary */}
        <div className="lg:col-span-1">
          <div className="bg-light-blue rounded-lg px-2 py-6 shadow-lg sm:p-6">
            <h3 className="mb-6 text-center text-3xl text-gray-800 uppercase sm:text-start sm:text-[34px]">
              Cart Summary
            </h3>

            {/* Shipping */}
            <div className="mb-6 space-y-4">
              {SHIPPING_OPTIONS.map((option) => (
                <div
                  key={option.method}
                  className={`flex cursor-pointer items-center gap-3 rounded-3xl p-4 ${
                    shippingInfo.method === option.method
                      ? "border-2 border-black"
                      : "hover:border-black"
                  }`}
                  onClick={() => handleShippingChange(option)}
                >
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                      shippingInfo.method === option.method
                        ? "border-black"
                        : "border-gray-400"
                    }`}
                  >
                    {shippingInfo.method === option.method && (
                      <div className="h-2 w-2 rounded-full bg-black"></div>
                    )}
                  </div>

                  <span className="flex-1 text-base text-gray-700">
                    {option.label}
                  </span>

                  {option.cost > 0 && (
                    <span className="text-sm font-medium text-gray-700">
                      £{option.cost.toFixed(2)}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <hr className="my-6 border-gray-300" />

            <div className="space-y-3">
              <div className="flex justify-between text-base text-gray-700">
                <span>Subtotal</span>
                <span className="font-medium">£{subtotal.toFixed(2)}</span>
              </div>

              {assembleTotal > 0 && (
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Assembly Charges</span>
                  <span className="font-medium">£{assembleTotal.toFixed(2)}</span>
                </div>
              )}

              {shippingInfo.cost > 0 && (
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Shipping</span>
                  <span className="font-medium">£{shippingInfo.cost.toFixed(2)}</span>
                </div>
              )}

              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({couponCode})</span>
                  <span>-£{discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between border-t border-gray-300 pt-2 text-xl font-bold text-gray-800">
                <span>Total</span>
                <span>£{total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              onClick={onNext}
              variant="primary"
              size="xl"
              rounded="full"
              className="relative mt-8 !h-12 w-full items-center !text-left shadow-lg sm:!text-xl"
              icon={
                <Image
                  src="/arrow-right.png"
                  alt="arrow-right"
                  width={24}
                  height={24}
                  className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-white p-2 sm:h-10 sm:w-10"
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


// Guest Checkout Options Component
const GuestCheckoutOptions = ({
  user,
  onContinueAsGuest,
  onLoginRedirect,
}: {
  user: { data?: { user?: { email?: string } } } | null;
  onContinueAsGuest: () => void;
  onLoginRedirect: () => void;
}) => {
  const checkoutOptionsRef = React.useRef<HTMLDivElement>(null);

  // Scroll to checkout options when component mounts
  React.useEffect(() => {
    if (checkoutOptionsRef.current) {
      checkoutOptionsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, []);

  if (user) return null;

  return (
    <div
      ref={checkoutOptionsRef}
      className="mb-8 rounded-xl border border-[#e9ecef] bg-[#f8f9fa] p-6"
    >
      <h2 className="mb-4 text-xl font-semibold text-[#222222]">
        Choose Your Checkout Method
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-[#dee2e6] bg-white p-4">
          <h3 className="mb-2 font-medium text-[#222222]">Continue as Guest</h3>
          <p className="mb-4 text-sm text-[#666666]">
            Quick checkout without creating an account. You can create an
            account after your purchase.
          </p>
          <Button
            onClick={onContinueAsGuest}
            className="bg-blue w-full text-white hover:bg-[#0056b3]"
          >
            Continue as Guest
          </Button>
        </div>
        <div className="rounded-lg border border-[#dee2e6] bg-white p-4">
          <h3 className="mb-2 font-medium text-[#222222]">
            Login to Your Account
          </h3>
          <p className="mb-4 text-sm text-[#666666]">
            Access saved addresses and view your order history. Enjoy a faster
            checkout experience with your saved details.{" "}
          </p>
          <Button
            onClick={onLoginRedirect}
            variant="outline"
            className="border-blue text-blue hover:bg-blue w-full hover:text-white"
          >
            Login / Register
          </Button>
        </div>
      </div>
    </div>
  );
};

// Checkout Details Tab Component
const EmailTab = ({
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
    items,
    totalPrice,
    shippingInfo,
    discount,
    couponCode,
    updateQuantity,
    removeItem,
    setCouponCode,
    setDiscount,
    // getCartTotal,
    isItemLoading,
  } = useCart();

  const [showGuestOptions, setShowGuestOptions] = useState(
    !user && !formData.isGuest
  );

  const [localCouponCode, setLocalCouponCode] = useState(couponCode);
  const [, setTick] = useState(0);

  // Initialize global assemble state
  useEffect(() => {
    initializeAssembleGlobal(items.map((item) => item.id));
    setTick((t) => t + 1);
  }, [items]);

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
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

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleAssembleChange = (id: string, value: boolean) => {
    setAssembleSelectedGlobal(id, value);
    setTick((t) => t + 1);
  };

  const applyDiscount = () => {
    const code = localCouponCode.toLowerCase();
    if (code === "save10") {
      setDiscount(totalPrice * 0.1);
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

  // Calculate assembly charges total
  const assembleTotal = items.reduce(
    (sum, item) =>
      sum +
      (assembleSelectedGlobal[item.id] && item.assemble_charges
        ? item.assemble_charges * item.quantity
        : 0),
    0
  );

  const subtotal = totalPrice + assembleTotal;
  const total = subtotal + shippingInfo.cost - discount;

  return (
    <div className="px-[2px] md:px-[32px]">
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

          <div className="space-y-8 px-[20px] md:px-[32px] lg:col-span-2">
            <div className="rounded-xl bg-[#ffffff] p-6">
              <h1 className="mb-6 text-3xl text-[#222222] sm:text-[45px]">
                CONTACT INFORMATION
              </h1>
              <p className="mb-4 text-sm text-[#666]">
                Enter your email address to receive order updates and confirmation.
              </p>
              <div className="mb-4">
                <Label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-[#999999]"
                >
                  EMAIL ADDRESS <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email Address"
                  className="rounded-full border-[#999]"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
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

              {items.map((item) => (
                <div key={item.id} className="mb-4 border-b border-gray-200 pb-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="relative h-[110px] w-[100px] rounded-2xl bg-white sm:h-[120px] sm:w-[120px]">
                      <SafeImage
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="h-full w-full rounded object-contain"
                      />
                    </div>
                    <div className="flex-1 py-4">
                      <h3 className="text-[#222] uppercase sm:text-[27px]">{item.name}</h3>
                      <p className="text-sm text-[#999] capitalize">
                        Color: {item.color || "Black"}
                      </p>

                      <div className="mt-2 inline-flex items-center gap-1 rounded bg-[#56748e] px-2 py-1 text-xs text-white">
                        {item.variant?.delivery_time_days
                          ? `${item.variant.delivery_time_days}`
                          : "3 To 4 Days Delivery"}
                      </div>

                      {item.assemble_charges && (
                        <div className="mt-2 flex items-center gap-2">
                          <Checkbox
                            checked={!!assembleSelectedGlobal[item.id]}
                            onCheckedChange={(v) =>
                              handleAssembleChange(item.id, v as boolean)
                            }
                            id={`assemble-${item.id}`}
                          />
                          <label
                            htmlFor={`assemble-${item.id}`}
                            className="text-sm text-gray-700"
                          >
                            Assembly charges(£{item.assemble_charges.toFixed(2)})
                          </label>
                        </div>
                      )}

                      <div className="mt-1 flex items-center justify-between">
                        <div className="flex items-center overflow-hidden rounded-full border border-gray-300">
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                            }
                            className="flex h-8 w-8 items-center justify-center transition-colors duration-200 hover:bg-gray-50"
                          >
                            <Minus className="h-4 w-4 text-gray-600" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }
                            className="flex h-8 w-8 items-center justify-center transition-colors duration-200 hover:bg-gray-50"
                          >
                            <Plus className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-[#222]">
                        £{(
                          item.price * item.quantity +
                          (assembleSelectedGlobal[item.id] && item.assemble_charges
                            ? item.assemble_charges * item.quantity
                            : 0)
                        ).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={isItemLoading(item.id)}
                        className="text-xs text-[#999] hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isItemLoading(item.id) ? (
                          <Loader2 className="inline h-5 w-5 animate-spin" />
                        ) : (
                          <X className="inline h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

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
                    className="bg-blue hover:bg-blue/80 mr-2 flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full text-white"
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
                      <Image src="/t-2.png" alt="Coupon" width={20} height={20} />
                      <span className="text-sm font-medium text-[#222]">{couponCode}</span>
                    </div>
                    <span className="text-sm text-[#999]">-£{discount.toFixed(2)} [Remove]</span>
                  </div>
                )}
              </div>

              {/* Shipping Information */}
              <div className="mb-4 text-sm">
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {shippingInfo.cost === 0
                      ? "Free"
                      : `£${shippingInfo.cost.toFixed(2)}`}
                  </span>
                </div>
                <div className="mt-1 text-xs text-gray-500">{shippingInfo.label}</div>
              </div>

              {/* Price Summary */}
              <div className="mt-4 space-y-2">
                {assembleTotal > 0 && (
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Assembly Charges</span>
                    <span className="font-medium">£{assembleTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span className="font-medium">£{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-300 pt-2 text-lg font-bold">
                  <span>Total</span>
                  <span>£{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CheckoutDetailsTab = ({
  onNext,
  formData,
  setFormData,
  isProcessing = false,
}: {
  onNext: () => void;
  formData: FormData;
  setFormData: (data: FormData) => void;
  isProcessing?: boolean;
}) => {
  const { user } = useAuth();
  const {
    items,
    totalPrice,
    shippingInfo,
    discount,
    couponCode,
    updateQuantity,
    removeItem,
    setCouponCode,
    setDiscount,
    // getCartTotal,
    isItemLoading,
  } = useCart();

  const [showGuestOptions, setShowGuestOptions] = useState(
    !user && !formData.isGuest
  );

  const [floorCharge, setFloorCharge] = useState(0);
  const [selectedFloor, setSelectedFloor] = useState<{ name: string; charges: number; id: string } | null>(null);
  const [localCouponCode, setLocalCouponCode] = useState(couponCode);
  const [, setTick] = useState(0); // to trigger re-render on assemble change

  const floorsQuery = useFloors();

  // Initialize global assemble state whenever items change
  useEffect(() => {
    initializeAssembleGlobal(items.map((item) => item.id));
    setTick((t) => t + 1);
  }, [items]);

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
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

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleAssembleChange = (id: string, value: boolean) => {
    setAssembleSelectedGlobal(id, value);
    setTick((t) => t + 1);
  };

  const applyDiscount = () => {
    const code = localCouponCode.toLowerCase();
    if (code === "save10") {
      setDiscount(totalPrice * 0.1);
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

  // Calculate assemble charges total
  const assembleTotal = items.reduce(
    (sum, item) =>
      sum +
      (assembleSelectedGlobal[item.id] && item.assemble_charges
        ? item.assemble_charges * item.quantity
        : 0),
    0
  );

  const subtotal = totalPrice + assembleTotal + floorCharge;
  const grandTotal = subtotal + shippingInfo.cost - discount;

  return (
    <div className="px-[2px] md:px-[32px]">
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
          <div className="space-y-8 px-[20px] md:px-[32px] lg:col-span-2">
            {/* Contact Information */}
            <div className="rounded-xl bg-[#ffffff] p-6">
              <h1 className="mb-6 text-3xl text-[#222222] sm:text-[45px]">
                CONTACT INFORMATION
              </h1>
              <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="firstName" className="mb-2 block text-sm font-medium text-[#999999]">
                    FIRST NAME
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="First name"
                    className="rounded-full border-[#999]"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="mb-2 block text-sm font-medium text-[#999999]">
                    LAST NAME
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Last name"
                    className="rounded-full border-[#999]"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                  />
                </div>
              </div>
              <div className="mb-4">
                <Label htmlFor="phone" className="mb-2 block text-sm font-medium text-[#999999]">
                  PHONE NUMBER
                </Label>
                <Input
                  id="phone"
                  placeholder="Phone number"
                  className="rounded-full border-[#999]"
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

              {/* Street Address */}
              <div className="mb-4">
                <Label htmlFor="address" className="mb-2 block text-sm font-medium text-[#999999]">
                  STREET ADDRESS *
                </Label>
                <Input
                  id="address"
                  placeholder="Street Address"
                  className="rounded-full border-[#999]"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                />
              </div>

              {/* Floor */}
              <div className="mb-4 w-full">
                <Label htmlFor="floor" className="mb-2 block w-full text-sm font-medium text-[#999999]">
                  Floor *
                </Label>
                <Select
                  value={selectedFloor?.id || ""}
                  onValueChange={(value) => {
                    const floor = floorsQuery.data?.find(f => f.id === value);
                    if (floor) {
                      setSelectedFloor(floor);
                      setFloorCharge(floor.charges);
                      handleInputChange("charges", floor.charges.toString());
                    }
                  }}
                >
                  <SelectTrigger className="w-full rounded-full border-[#999]">
                    <SelectValue placeholder="Select Floor" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {floorsQuery.data?.map((floor) => (
                      <SelectItem key={floor.id} value={floor.id}>
                        {floor.name} (£{floor.charges})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Country, City, State, ZIP */}
              <div className="mb-4 w-full">
                <Label htmlFor="country" className="mb-2 block w-full text-sm font-medium text-[#999999]">
                  COUNTRY *
                </Label>
                <Select
                  defaultValue="uk"
                  value={formData.country}
                  onValueChange={(value) => handleInputChange("country", value)}
                >
                  <SelectTrigger className="w-full rounded-full border-[#999]">
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    <SelectItem value="uk">United Kingdom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-4">
                <Label htmlFor="city" className="mb-2 block text-sm font-medium text-[#999999]">
                  TOWN / CITY *
                </Label>
                <Input
                  id="city"
                  placeholder="Town / City"
                  className="rounded-full border-[#999]"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                />
              </div>

              <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="state" className="mb-2 block text-sm font-medium text-[#999999]">
                    STATE
                  </Label>
                  <Input
                    id="state"
                    placeholder="State"
                    className="rounded-full border-[#999]"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="zip" className="mb-2 block text-sm font-medium text-[#999999]">
                    ZIP CODE
                  </Label>
                  <Input
                    id="zip"
                    placeholder="Zip Code"
                    className="rounded-full border-[#999]"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange("zipCode", e.target.value)}
                  />
                </div>
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
            {/* Payment Section */}
            {/* ... Payment UI same as before ... */}

            <div className="flex gap-4 text-center">
              <Button
                onClick={onNext}
                disabled={isProcessing}
                variant="primary"
                size="xl"
                rounded="full"
                className="bg-blue hover:bg-blue/90 relative mx-auto flex !h-12 w-full items-center justify-start px-8 py-4 font-semibold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing ? "Processing Payment..." : "Place Order"}
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-[413px]">
            <div className="bg-light-blue rounded-lg p-4">
              <h1 className="text-dark-gray mb-6 text-center text-3xl uppercase sm:text-start sm:text-[45px]">
                Order Summary
              </h1>

              {items.map((item) => (
                <div key={item.id} className="mb-4 border-b border-gray-200 pb-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="relative h-[110px] w-[100px] rounded-2xl bg-white sm:h-[120px] sm:w-[120px]">
                      <SafeImage
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="h-full w-full rounded object-contain"
                      />
                    </div>
                    <div className="flex-1 py-4">
                      <h3 className="text-[#222] uppercase sm:text-[27px]">{item.name}</h3>
                      <p className="text-sm text-[#999] capitalize">Color: {item.color || "Black"}</p>

                      {item.assemble_charges && (
                        <div className="mt-2 flex items-center gap-2">
                          <Checkbox
                            checked={!!assembleSelectedGlobal[item.id]}
                            onCheckedChange={(v) => handleAssembleChange(item.id, v as boolean)}
                            id={`assemble-${item.id}`}
                          />
                          <label htmlFor={`assemble-${item.id}`} className="text-sm text-gray-700">
                            Assembly charges (£{item.assemble_charges.toFixed(2)})
                          </label>
                        </div>
                      )}

                      {/* Quantity */}
                      <div className="mt-1 flex items-center justify-between">
                        <div className="flex items-center overflow-hidden rounded-full border border-gray-300">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="flex h-8 w-8 items-center justify-center transition-colors duration-200 hover:bg-gray-50"
                          >
                            <Minus className="h-4 w-4 text-gray-600" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-gray-800">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="flex h-8 w-8 items-center justify-center transition-colors duration-200 hover:bg-gray-50"
                          >
                            <Plus className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-semibold text-[#222]">
                        £{(item.price * item.quantity + (assembleSelectedGlobal[item.id] && item.assemble_charges ? item.assemble_charges * item.quantity : 0)).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={isItemLoading(item.id)}
                        className="text-xs text-[#999] hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isItemLoading(item.id) ? (
                          <Loader2 className="inline h-5 w-5 animate-spin" />
                        ) : (
                          <X className="inline h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

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
                    className="bg-blue hover:bg-blue/80 mr-2 flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full text-white"
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
                      <Image src="/t-2.png" alt="Coupon" width={20} height={20} />
                      <span className="text-sm font-medium text-[#222]">{couponCode}</span>
                    </div>
                    <span className="text-sm text-[#999]">-£{discount.toFixed(2)} [Remove]</span>
                  </div>
                )}
              </div>

              {/* Shipping & Price Summary */}
              <div className="mt-4 space-y-2">
                {assembleTotal > 0 && (
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Assembly Charges</span>
                    <span className="font-medium">£{assembleTotal.toFixed(2)}</span>
                  </div>
                )}

                {floorCharge > 0 && selectedFloor && (
                  <div className="flex justify-between text-sm">
                    <span>{selectedFloor.name} Delivery Charges</span>
                    <span className="font-medium">£{floorCharge.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span className="font-medium">£{subtotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Discount ({couponCode})</span>
                    <span className="font-medium">-£{discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{shippingInfo.cost === 0 ? "Free" : `£${shippingInfo.cost.toFixed(2)}`}</span>
                </div>

                <div className="flex justify-between border-t border-gray-300 pt-2 text-lg font-bold">
                  <span>Total</span>
                  <span>£{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// Guest Account Creation Component
// const GuestAccountCreation = ({
//   guestEmail,
//   customerName
// }: {
//   guestEmail: string;
//   customerName: string;
// }) => {
//   const [isCreatingAccount, setIsCreatingAccount] = useState(false);
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [showAccountForm, setShowAccountForm] = useState(false);

//   const handleCreateAccount = async () => {
//     if (password !== confirmPassword) {
//       toast.error("Passwords do not match");
//       return;
//     }
//     if (password.length < 6) {
//       toast.error("Password must be at least 6 characters");
//       return;
//     }

//     setIsCreatingAccount(true);
//     try {
//       // Here you would call your account creation API
//       // For now, we'll just show a success message
//       toast.success("Account created successfully! You can now login with your email.");
//       setShowAccountForm(false);
//     } catch {
//       toast.error("Failed to create account. Please try again.");
//     } finally {
//       setIsCreatingAccount(false);
//     }
//   };

//   if (!showAccountForm) {
//     return (
//       <div className="mt-8 rounded-lg bg-[#f8f9fa] p-6 border border-[#e9ecef]">
//         <h3 className="mb-3 text-lg font-semibold text-[#222222]">
//           Create an Account to Track Your Orders
//         </h3>
//         <p className="mb-4 text-sm text-[#666666]">
//           Save your information for faster checkout next time and easily track all your orders.
//         </p>
//         <div className="flex gap-3">
//           <Button
//             onClick={() => setShowAccountForm(true)}
//             className="bg-[#007bff] hover:bg-[#0056b3] text-white"
//           >
//             Create Account
//           </Button>
//           <Button
//             variant="outline"
//             onClick={() => window.location.href = "/products"}
//             className="border-[#007bff] text-[#007bff] hover:bg-[#007bff] hover:text-white"
//           >
//             Continue Shopping
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="mt-8 rounded-lg bg-white p-6 border border-[#dee2e6]">
//       <h3 className="mb-4 text-lg font-semibold text-[#222222]">
//         Create Your Account
//       </h3>
//       <div className="space-y-4">
//         <div>
//           <Label htmlFor="account-email" className="text-sm font-medium text-[#666666]">
//             Email Address
//           </Label>
//           <Input
//             id="account-email"
//             type="email"
//             value={guestEmail}
//             disabled
//             className="rounded-full border-[#999] bg-gray-50"
//           />
//         </div>
//         <div>
//           <Label htmlFor="account-name" className="text-sm font-medium text-[#666666]">
//             Full Name
//           </Label>
//           <Input
//             id="account-name"
//             value={customerName}
//             disabled
//             className="rounded-full border-[#999] bg-gray-50"
//           />
//         </div>
//         <div>
//           <Label htmlFor="account-password" className="text-sm font-medium text-[#666666]">
//             Password
//           </Label>
//           <Input
//             id="account-password"
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="rounded-full border-[#999]"
//             placeholder="Enter a secure password"
//           />
//         </div>
//         <div>
//           <Label htmlFor="confirm-password" className="text-sm font-medium text-[#666666]">
//             Confirm Password
//           </Label>
//           <Input
//             id="confirm-password"
//             type="password"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//             className="rounded-full border-[#999]"
//             placeholder="Confirm your password"
//           />
//         </div>
//         <div className="flex gap-3 pt-2">
//           <Button
//             onClick={handleCreateAccount}
//             disabled={isCreatingAccount || !password || !confirmPassword}
//             className="bg-[#007bff] hover:bg-[#0056b3] text-white"
//           >
//             {isCreatingAccount ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Creating Account...
//               </>
//             ) : (
//               "Create Account"
//             )}
//           </Button>
//           <Button
//             variant="outline"
//             onClick={() => setShowAccountForm(false)}
//             disabled={isCreatingAccount}
//             className="border-[#6c757d] text-[#6c757d] hover:bg-[#6c757d] hover:text-white"
//           >
//             Maybe Later
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };

// Order Complete Tab Component
const OrderCompleteTab = ({ orderData }: { orderData: OrderData | null }) => {
  const [localOrderData, setLocalOrderData] = useState<OrderData | null>(
    orderData
  );
  const [isLoading, setIsLoading] = useState(!orderData);

  // Try to load order data from localStorage if not provided
  useEffect(() => {
    if (!orderData && isLoading) {
      try {
        const storedOrderData = localStorage.getItem("lastOrderData");
        if (storedOrderData) {
          const parsedOrderData = JSON.parse(storedOrderData) as OrderData;
          setLocalOrderData(parsedOrderData);
          console.log(
            "📦 Loaded order data from localStorage:",
            parsedOrderData
          );
        }
      } catch (error) {
        console.warn("⚠️ Failed to load order data from localStorage:", error);
      } finally {
        setIsLoading(false);
      }
    } else if (orderData) {
      setLocalOrderData(orderData);
      setIsLoading(false);
    }
  }, [orderData, isLoading]);

  // Loading state
  if (isLoading) {
    return (
      <div className="mt-20 px-[2px] text-center sm:px-[32px]">
        <div className="bg-light-blue mb-8 rounded-2xl p-12">
          <div className="mb-8">
            <div className="mb-4 text-6xl">⏳</div>
            <h2 className="text-gray mb-2 text-[28px] font-bold tracking-wide">
              Processing Your Order...
            </h2>
            <p className="text-gray text-[16px] leading-relaxed">
              Please wait while we confirm your order details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No order data state
  if (!localOrderData) {
    return (
      <div className="mt-20 px-[2px] text-center sm:px-[32px]">
        <div className="bg-light-blue mb-8 rounded-2xl p-12">
          <div className="mb-8">
            <div className="mb-4 text-6xl">❓</div>
            <h2 className="text-gray mb-2 text-[28px] font-bold tracking-wide">
              Order Not Found
            </h2>
            <p className="text-gray text-[16px] leading-relaxed">
              We could not find your order details. If you completed a payment,
              please contact support.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Button
                onClick={() => (window.location.href = "/")}
                className="bg-blue hover:bg-blue/90"
              >
                Go Home
              </Button>
              <Button
                onClick={() => (window.location.href = "/contact-us")}
                variant="outline"
              >
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state with order data
  return (
    <div className="mt-20 px-4 text-center sm:px-[32px]">
      <div className="bg-light-blue mb-8 rounded-2xl p-12">
        {/* Thank You Section */}
        {/* <div className="mb-8">
          <h2 className="text-gray mb-2 text-[28px] font-bold tracking-wide">
            THANK YOU! 🎉
          </h2>
          <p className="text-gray text-[16px] leading-relaxed">
            Your order has been successfully placed and is being processed.
            {localOrderData.isGuest && (
              <span className="block mt-2">
                Order confirmation has been sent to {localOrderData.guestEmail}
              </span>
            )}
          </p>
        </div> */}

        <div className="mb-8">
          <h2 className="text-gray mb-2 text-[28px] font-bold tracking-wide">
            THANK YOU! 🎉
          </h2>
          <h1 className="text-dark-gray text-4xl leading-tight tracking-tight md:text-6xl">
            YOUR ORDER HAS BEEN
            <br />
            CONFIRMED
          </h1>
        </div>

        {/* Product Images */}
        <div className="mb-12 flex flex-col items-center justify-center gap-6 sm:flex-row">
          {localOrderData.items.map((item) => (
            <div key={item.id} className="relative">
              <div className="h-32 w-40 rounded-xl bg-white p-2 shadow-sm">
                <SafeImage
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={96}
                  height={96}
                  className="h-full w-full rounded-lg object-cover"
                />
              </div>
              <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                {item.quantity}
              </div>
            </div>
          ))}
        </div>

        {/* Order Details */}
        <div className="mx-auto mb-10 max-w-sm rounded-xl p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold text-[#999]">Order code:</p>
              <p className="text-[#222]">{localOrderData.orderCode}</p>
            </div>
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold text-[#999]">Date:</p>
              <p className="text-[#222]">{localOrderData.date}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#999]">Total:</p>
              <p className="text-[#222]">£{localOrderData.total}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#999]">
                Payment method:
              </p>
              <p className="text-[#222]">{localOrderData.paymentMethod}</p>
            </div>
          </div>
        </div>

        {/* Back to Home Button */}
        <Button
          onClick={() => (window.location.href = "/")}
          variant="primary"
          size="xl"
          rounded="full"
          className="bg-blue hover:bg-blue/90 relative mx-auto flex w-full items-center justify-start px-6 py-3 font-semibold text-white shadow-lg sm:w-[80%] sm:px-8 sm:py-4 lg:w-[70%]"
          icon={
            <Image
              src="/arrow-right.png"
              alt="Arrow Right"
              width={24}
              height={24}
              className="absolute top-1/2 right-3 h-8 w-8 -translate-y-1/2 rounded-full bg-white object-contain p-1.5 sm:right-4 sm:h-10 sm:w-10 sm:p-2"
            />
          }
        >
          Back To Home
        </Button>
      </div>

      {/* Guest Account Creation Section */}
      {/* {localOrderData.isGuest && localOrderData.guestEmail && localOrderData.customerName && (
        <GuestAccountCreation
          guestEmail={localOrderData.guestEmail}
          customerName={localOrderData.customerName}
        />
      )} */}

      {/* Order Tracking Information for Guests */}
      {/* {localOrderData.isGuest && (
        <div className="mt-8 rounded-lg bg-[#fff3cd] p-6 border border-[#ffeaa7]">
          <h3 className="mb-3 text-lg font-semibold text-[#856404]">
            Track Your Order
          </h3>
          <p className="mb-4 text-sm text-[#856404]">
            Since you checked out as a guest, you can track your order using:
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium text-[#856404]">Order Code:</span>
              <span className="font-mono bg-white px-2 py-1 rounded border">
                {localOrderData.orderCode}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-[#856404]">Email:</span>
              <span className="font-mono bg-white px-2 py-1 rounded border">
                {localOrderData.guestEmail}
              </span>
            </div>
          </div>
          <p className="mt-4 text-xs text-[#856404]">
            Save this information to track your order status and delivery updates.
          </p>
        </div>
      )} */}
    </div>
  );
};

export default function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const {
    items,
    totalItems,
    getCartTotal,
    clearCart,
    error: cartError,
    checkAuthStatus,
    syncWithServer,
  } = useCart();

  

  // All useState hooks must be at the top
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [showGuestOptions, setShowGuestOptions] = useState(false);
  const [formData, setFormData] = useState<FormData>({
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
    differentBilling: false,
    paymentMethod: "card",
  });

  // Update email when user data is available
  useEffect(() => {
    if (user?.data?.user?.email && formData.email === "") {
      setFormData((prev) => ({
        ...prev,
        email: user.data.user.email,
      }));
    }
  }, [user, formData.email]);

  // Effect to handle authentication status changes and cart syncing
  useEffect(() => {
    const handleAuthAndCartSync = async () => {
      try {
        // Check authentication status and sync cart accordingly
        await checkAuthStatus();

        // If user is authenticated, ensure we have the latest cart data from server
        if (user && !authLoading) {
          await syncWithServer();
        }
      } catch {
        // Don't show error toast here as it might be too intrusive
        // The cart store will handle error states internally
      }
    };

    // Only run if we're not in the middle of auth loading
    if (!authLoading) {
      handleAuthAndCartSync();
    }
  }, [user, authLoading, checkAuthStatus, syncWithServer, totalItems]);

  const handleNext = () => {
    // If user is not authenticated and trying to go to checkout, show guest options
    if (!user && currentStep === 1) {
      setShowGuestOptions(true);
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  //   const handleBack = () => {
  //     setCurrentStep(currentStep - 1);
  //   };

  // Guest checkout handlers
  const handleContinueAsGuest = () => {
    setFormData((prev) => ({ ...prev, isGuest: true }));
    setShowGuestOptions(false);
    setCurrentStep(2); // Go directly to checkout details
  };

  const handleLoginRedirect = () => {
    // Store current cart state and redirect intent
    localStorage.setItem("redirectAfterLogin", "/cart?step=2");
    localStorage.setItem("loginSource", "cart-checkout");

    // Navigate to login page
    window.location.href = "/login";
  };

  // Check for redirect after login
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const step = urlParams.get("step");
    const loginSource = localStorage.getItem("loginSource");

    // If user just logged in from cart and we have a step parameter
    if (user && step === "2" && loginSource === "cart-checkout") {
      // Clear the redirect data
      localStorage.removeItem("redirectAfterLogin");
      localStorage.removeItem("loginSource");

      // Set to step 2 (checkout details)
      setCurrentStep(2);
      setShowGuestOptions(false);

      // Show success message
      toast.success("Welcome back! Continue with your checkout.");
    }
  }, [user]);

  // Helper function to handle COD order success
  const handleCODSuccess = (codResponse: { order_id: string }) => {
    // Store order data for success page
    const orderDataForSuccess = {
      orderCode: `#${codResponse.order_id.slice(-8).toUpperCase()}`,
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      total: getCartTotal().toFixed(2),
      paymentMethod: "Cash on Delivery",
      items: items,
      isGuest: formData.isGuest,
      guestEmail: formData.isGuest ? formData.email : undefined,
      customerName: `${formData.firstName} ${formData.lastName}`,
    };

    try {
      localStorage.setItem(
        "lastOrderData",
        JSON.stringify(orderDataForSuccess)
      );
    } catch {
      // Silently handle storage errors
    }

    // Set order data for the order complete tab
    setOrderData(orderDataForSuccess);

    // Clear cart items after successful order
    clearCart();

    // Show success feedback and navigate
    setIsProcessingPayment(false);
    toast.dismiss("payment-processing");
    toast.success(
      "🎉 COD order placed successfully! You will pay when delivered.",
      {
        duration: 5000,
      }
    );

    // Navigate to order complete step
    setCurrentStep(3);
  };

  // Helper function to handle card payment success
  const handleCardPaymentSuccess = (paymentResponse: CreatePaymentResponse) => {
    // Store order ID for later reference
    storeOrderId(paymentResponse.order_id);

    // Store order data for success page
    const orderDataForSuccess = {
      orderCode: `#${paymentResponse.order_id.slice(-8).toUpperCase()}`,
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      total: getCartTotal().toFixed(2),
      paymentMethod:
        formData.paymentMethod === "card" ? "Credit Card" : "Cash on Delivery",
      items: items,
      isGuest: formData.isGuest,
      guestEmail: formData.isGuest ? formData.email : undefined,
      customerName: `${formData.firstName} ${formData.lastName}`,
    };

    try {
      localStorage.setItem(
        "lastOrderData",
        JSON.stringify(orderDataForSuccess)
      );
    } catch {
      // Silently handle storage errors
    }

    // Set order data for potential use (though card payments redirect to external gateway)
    setOrderData(orderDataForSuccess);

    // Redirect to payment gateway
    toast.dismiss("payment-processing");
    toast.success("Payment initiated! Redirecting to secure payment page...");
    redirectToPayment(paymentResponse);
  };

  // Show loading state while authentication is being determined
  if (authLoading) {
    return (
      <div className="px-[32px] py-12">
        <div className="flex h-[400px] items-center justify-center">
          <div className="text-center">
            <Image
              src="/favicon.ico"
              alt="Loading"
              width={48}
              height={48}
              className="text-muted-foreground mx-auto mb-4 h-12 w-12 animate-pulse"
            />
            <p className="text-lg font-medium">Loading cart details...</p>
            <p className="text-muted-foreground text-sm">
              Please wait while we fetch your cart information
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if there's a cart error
  if (cartError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-lg bg-red-50 px-4 py-12">
          <div className="mb-4 text-6xl">⚠️</div>
          <h1 className="mb-4 text-2xl font-bold">Error Loading Cart</h1>
          <p className="mb-8 text-center text-gray-600">{cartError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue hover:bg-blue/90 rounded px-4 py-2 text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    try {
      setIsProcessingPayment(true);

      // Validate required fields
      const validationErrors = validateFormData();
      if (validationErrors.length > 0) {
        toast.error(validationErrors[0]);
        setIsProcessingPayment(false);
        return;
      }

      // Show different processing messages for guest vs authenticated users
      if (formData.isGuest) {
        toast.loading("Processing your guest checkout...", {
          id: "payment-processing",
        });
      } else {
        toast.loading("Processing your order...", { id: "payment-processing" });
      }

      // Prepare payment request data
      const paymentData: CreatePaymentRequest = {
        contact_first_name: formData.firstName,
        contact_last_name: formData.lastName,
        contact_email: formData.email,
        contact_phone: formData.phone
          ? formatPhoneNumber(formData.phone)
          : undefined,

        shipping_address: {
          street_address: formData.address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.zipCode,
          country: getCountryCode(formData.country),
          country_name: getCountryName(getCountryCode(formData.country)),
          // charges: formData.charges || undefined,
        },

        use_different_billing_address: formData.differentBilling,
        billing_address: formData.differentBilling
          ? {
              street_address: formData.address, // For now, using same address
              city: formData.city,
              state: formData.state,
              postal_code: formData.zipCode,
              country: getCountryCode(formData.country),
              country_name: getCountryName(getCountryCode(formData.country)),
              // charges: formData.charges || undefined,
            }
          : undefined,

        cart_items: convertCartItemsToPaymentFormat(items),
        order_notes: undefined,
      };

      // Validate payment data
      const errors = PaymentApiService.validatePaymentData(paymentData);
      if (errors.length > 0) {
        toast.error(errors[0]);
        setIsProcessingPayment(false);
        return;
      }

      // Create payment or COD order based on payment method
      const authToken = formData.isGuest
        ? undefined
        : SessionManager.getAccessToken();

      if (formData.paymentMethod === "cod") {
        // COD Order Flow
        const codResponse = await PaymentApiService.createCODOrder(
          paymentData,
          authToken || undefined
        );

        // Handle COD success
        handleCODSuccess(codResponse);
        return;
      } else {
        // Card/PayPal Payment Flow
        const paymentResponse = await PaymentApiService.createPayment(
          paymentData,
          authToken || undefined
        );

        // Handle card payment success
        handleCardPaymentSuccess(paymentResponse);
        return;
      }
    } catch (error: unknown) {
      console.error("❌ Payment creation error:", error);
      // Enhanced error logging for guest checkout debugging
      const errorObj = error as PaymentError & Error;
      console.error("🔍 Payment Error Debug:", {
        isGuest: formData.isGuest,
        hasUser: !!user,
        errorMessage: errorObj?.message,
        errorStatus: errorObj?.status,
        errorDetails: errorObj?.details,
        fullError: error,
      });
      setIsProcessingPayment(false);
      toast.dismiss("payment-processing");

      const errorMessage = getPaymentErrorMessage(error);
      toast.error(errorMessage);

      // Handle specific error types
      const paymentError = error as PaymentError;
      if (paymentError?.status === 400 && paymentError?.details) {
        // Show validation errors
        paymentError.details.forEach((detail) => {
          toast.error(`${detail.field}: ${detail.message}`);
        });
      } else if (paymentError?.status === 409 && paymentError?.stock_issues) {
        // Show stock issues
        paymentError.stock_issues.forEach((issue) => {
          toast.error(
            `${issue.variant_id}: Only ${issue.available} items available, but ${issue.requested} requested`
          );
        });
      } else if (paymentError?.status === 401) {
        console.error(
          "❌ Authentication error for guest checkout - this should not happen!"
        );
        toast.error(
          "Authentication error occurred. Please try refreshing the page."
        );
      } else if (paymentError?.status === 500) {
        console.error("❌ Server error:", paymentError);
        toast.error("Server error occurred. Please try again later.");
      } else {
        console.error("❌ Unknown error type:", paymentError);
      }
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

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push("Please enter a valid email address");
    }

    return errors;
  };

  const getCountryCode = (country: string): string => {
    const countryMap: Record<string, string> = {
      us: "US",
      uk: "GB",
      ca: "CA",
    };
    return countryMap[country] || "GB";
  };

  if (totalItems === 0 && currentStep === 1) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-lg bg-gray-50 px-4 py-12">
          <div className="mb-4 text-6xl">🛒</div>
          <h1 className="font-bebas mb-4 text-2xl">Your cart is empty</h1>
          <p className="mb-8 text-center text-gray-600">
            Looks like you haven&apos;t added any products to your cart yet.
            Start shopping to add products.
          </p>
          <Button
            onClick={() => (window.location.href = "/products")}
            className="bg-blue hover:bg-blue/90"
          >
            Shop Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-[32px] sm:py-8">
      <h1 className="mt-10 mb-4 text-center text-3xl sm:text-6xl">
        {currentStep === 1
          ? "CART"
          : currentStep === 2
            ? "CHECKOUT DETAILS"
            : "ORDER COMPLETE"}
      </h1>

      <CartSteps currentStep={currentStep} />

      {/* Guest Checkout Options - shown when user tries to checkout without being authenticated */}
      {showGuestOptions && (
        <GuestCheckoutOptions
          user={user}
          onContinueAsGuest={handleContinueAsGuest}
          onLoginRedirect={handleLoginRedirect}
        />
      )}

      {currentStep === 1 && <ShoppingCartTab onNext={handleNext} />}

      {currentStep === 2 && (
        <EmailTab
          formData={formData}
          onNext={handleNext}
          setFormData={setFormData}
        />
      )}

      {currentStep === 3 && (
        <CheckoutDetailsTab
          onNext={handlePlaceOrder}
          //   onBack={handleBack}
          formData={formData}
          setFormData={setFormData}
          isProcessing={isProcessingPayment}
        />
      )}

      {currentStep === 4 && <OrderCompleteTab orderData={orderData} />}
    </div>
  );
}
