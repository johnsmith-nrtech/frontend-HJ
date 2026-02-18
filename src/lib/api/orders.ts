import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiService } from "@/lib/api-service";
import {
  Order,
  OrdersListResponse,
  OrdersListParams,
  OrderStatusUpdateInput,
  OrderCancelInput,
  CheckoutInput,
  CheckoutValidationInput,
  CheckoutValidationResponse,
  PaymentFormData,
  PaymentResponse,
  CODOrderResponse,
} from "@/lib/types/orders";

// User Order Functions

/**
 * Get user orders list
 */
export async function getUserOrders(
  params?: OrdersListParams
): Promise<OrdersListResponse> {
  const queryParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
  }

  const response = await ApiService.fetchWithAuth(
    `/orders?${queryParams.toString()}`
  );

  return ApiService.handleResponse(response, "Failed to fetch user orders");
}

/**
 * Get order details by ID
 */
export async function getOrderById(id: string): Promise<Order> {
  const response = await ApiService.fetchWithAuth(`/orders/${id}`);

  return ApiService.handleResponse(response, `Failed to fetch order: ${id}`);
}

/**
 * Cancel user order
 */
export async function cancelOrder(id: string): Promise<Order> {
  const response = await ApiService.fetchWithAuth(`/orders/${id}/cancel`, {
    method: "PUT",
  });

  return ApiService.handleResponse(response, `Failed to cancel order: ${id}`);
}

// Admin Order Functions

/**
 * Get all orders (admin endpoint)
 * Uses the correct /orders/admin endpoint
 */
export async function getAllOrders(
  params?: OrdersListParams
): Promise<OrdersListResponse> {
  const queryParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value.toString());
      }
    });
  }

  // If no valid parameters, make a simple request
  const queryString = queryParams.toString();
  const endpoint = queryString
    ? `/orders/admin?${queryString}`
    : `/orders/admin`;

  const response = await ApiService.fetchWithAuth(endpoint);

  return ApiService.handleResponse(response, "Failed to fetch all orders");
}

/**
 * Update order status (admin endpoint)
 * Uses the correct /orders/admin/{id}/status endpoint
 */
export async function updateOrderStatus(
  id: string,
  data: OrderStatusUpdateInput
): Promise<Order> {
  const response = await ApiService.fetchWithAuth(
    `/orders/admin/${id}/status`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );

  return ApiService.handleResponse(
    response,
    `Failed to update order status: ${id}`
  );
}

/**
 * Cancel order with reason (admin endpoint)
 * Uses the correct /orders/admin/{id}/cancel endpoint
 */
export async function cancelOrderWithReason(
  id: string,
  data: OrderCancelInput
): Promise<Order> {
  const response = await ApiService.fetchWithAuth(
    `/orders/admin/${id}/cancel`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );

  return ApiService.handleResponse(
    response,
    `Failed to cancel order with reason: ${id}`
  );
}

/**
 * Export orders to CSV (admin endpoint)
 * Uses the correct /orders/admin/export endpoint
 */
export async function exportOrdersToCSV(
  params?: OrdersListParams
): Promise<Blob> {
  // Try admin endpoint first, fallback to client-side export
  try {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await ApiService.fetchWithAuth(
      `/orders/admin/export?${queryParams.toString()}`
    );

    if (!response.ok) {
      throw new Error("Admin export not available");
    }

    return response.blob();
  } catch {
    // Fallback: Get orders data and create CSV client-side
    const ordersData = await getAllOrders(params);
    const csvContent = createCSVFromOrders(ordersData.items);
    return new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  }
}

/**
 * Create CSV content from orders data (client-side fallback)
 */
function createCSVFromOrders(orders: Order[]): string {
  const headers = [
    "Order ID",
    "Customer Name",
    "Email",
    "Status",
    "Total Amount",
    "Currency",
    "Items Count",
    "Created At",
    "Updated At",
  ];

  const csvRows = [
    headers.join(","),
    ...orders.map((order) => {
      // Calculate total items count from simple array
      const itemsCount = order.items ? order.items.length : 0;

      return [
        order.id,
        order.shipping_address.recipient_name,
        order.user_id || "Guest",
        order.status,
        order.total_amount,
        order.currency,
        itemsCount,
        order.created_at,
        order.updated_at,
      ]
        .map((field) => `"${field}"`)
        .join(",");
    }),
  ];

  return csvRows.join("\n");
}

// Checkout Functions

/**
 * Process checkout
 */
export async function processCheckout(data: CheckoutInput): Promise<Order> {
  const response = await ApiService.fetchWithAuth("/checkout", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return ApiService.handleResponse(response, "Failed to process checkout");
}

/**
 * Validate checkout data
 */
export async function validateCheckout(
  data: CheckoutValidationInput
): Promise<CheckoutValidationResponse> {
  const response = await ApiService.fetchPublic("/checkout/validate", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return ApiService.handleResponse(response, "Failed to validate checkout");
}

// Payment Gateway Functions

/**
 * Create payment
 */
export async function createPayment(
  data: PaymentFormData
): Promise<PaymentResponse> {
  const response = await ApiService.fetchPublic("/orders/create-payment", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return ApiService.handleResponse(response, "Failed to create payment");
}

/**
 * Create COD order
 */
export async function createCODOrder(
  data: PaymentFormData
): Promise<CODOrderResponse> {
  const response = await ApiService.fetchPublic("/orders/create-cod-order", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return ApiService.handleResponse(response, "Failed to create COD order");
}

// React Query Hooks

/**
 * Hook to get user orders
 */
export function useUserOrders(params?: OrdersListParams) {
  return useQuery({
    queryKey: ["user-orders", params],
    queryFn: () => getUserOrders(params),
    staleTime: 0, // Always consider data stale to fetch fresh data
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes (renamed from cacheTime)
    enabled: typeof window !== "undefined", // Only run in browser
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnReconnect: true, // Refetch when reconnecting
  });
}

/**
 * Hook to get all orders (admin)
 */
export function useAllOrders(params?: OrdersListParams) {
  return useQuery({
    queryKey: ["all-orders", params],
    queryFn: () => getAllOrders(params),
    staleTime: 1000 * 30, // 30 seconds - shorter cache time
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Always refetch on component mount
  });
}

/**
 * Hook to get order by ID
 */
export function useOrder(id: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrderById(id),
    enabled: !!id,
    staleTime: 1000 * 30, // 30 seconds - shorter cache time
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });
}

/**
 * Hook to update order status (admin)
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: OrderStatusUpdateInput }) =>
      updateOrderStatus(id, data),
    onSuccess: () => {
      // Invalidate orders queries to refetch
      queryClient.invalidateQueries({ queryKey: ["all-orders"] });
      queryClient.invalidateQueries({ queryKey: ["user-orders"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
    },
    onError: (error) => {
      console.error("Error updating order status:", error);
    },
  });
}

/**
 * Hook to cancel order with reason (admin)
 */
export function useCancelOrderWithReason() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: OrderCancelInput }) =>
      cancelOrderWithReason(id, data),
    onSuccess: () => {
      // Invalidate orders queries to refetch
      queryClient.invalidateQueries({ queryKey: ["all-orders"] });
      queryClient.invalidateQueries({ queryKey: ["user-orders"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
    },
    onError: (error) => {
      console.error("Error cancelling order:", error);
    },
  });
}

/**
 * Hook to cancel user order
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      // Invalidate orders queries to refetch
      queryClient.invalidateQueries({ queryKey: ["user-orders"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
    },
    onError: (error) => {
      console.error("Error cancelling order:", error);
    },
  });
}

/**
 * Hook to process checkout
 */
export function useProcessCheckout() {
  return useMutation({
    mutationFn: processCheckout,
    onError: (error) => {
      console.error("Error processing checkout:", error);
    },
  });
}

/**
 * Hook to validate checkout
 */
export function useValidateCheckout() {
  return useMutation({
    mutationFn: validateCheckout,
    onError: (error) => {
      console.error("Error validating checkout:", error);
    },
  });
}

/**
 * Hook to create payment
 */
export function useCreatePayment() {
  return useMutation({
    mutationFn: createPayment,
    onError: (error) => {
      console.error("Error creating payment:", error);
    },
  });
}

/**
 * Hook to create COD order
 */
export function useCreateCODOrder() {
  return useMutation({
    mutationFn: createCODOrder,
    onError: (error) => {
      console.error("Error creating COD order:", error);
    },
  });
}

/**
 * Hook to export orders to CSV (admin)
 */
export function useExportOrders() {
  return useMutation({
    mutationFn: (params?: OrdersListParams) => exportOrdersToCSV(params),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `orders-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onError: (error) => {
      console.error("Error exporting orders:", error);
    },
  });
}
