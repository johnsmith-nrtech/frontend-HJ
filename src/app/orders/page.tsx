"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Package,
  Loader2,
  ChevronRight,
  AlertCircle,
  Eye,
  X,
  Calendar,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";
import { useUserOrders, useCancelOrder } from "@/lib/api/orders";
import { Order, OrderStatus } from "@/lib/types/orders";
import { useAuth } from "@/lib/providers/auth-provider";
import { SessionManager } from "@/lib/services/session-manager";
import { toast } from "sonner";

// Order status configuration
const orderStatusConfig: Record<
  OrderStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline" | "warning";
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }
> = {
  pending: {
    label: "Pending",
    variant: "warning",
    icon: Clock,
    color: "text-yellow-600",
  },
  paid: {
    label: "Paid",
    variant: "default",
    icon: CreditCard,
    color: "text-blue-600",
  },
  shipped: {
    label: "Shipped",
    variant: "secondary",
    icon: Truck,
    color: "text-purple-600",
  },
  delivered: {
    label: "Delivered",
    variant: "default",
    icon: CheckCircle,
    color: "text-green-600",
  },
  cancelled: {
    label: "Cancelled",
    variant: "destructive",
    icon: XCircle,
    color: "text-red-600",
  },
};

// Format date helper
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format currency helper
const formatCurrency = (amount: number, currency: string = "GBP") => {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

// Order Status Badge Component
const OrderStatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const config = orderStatusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

// Order Details Modal Component
const OrderDetailsModal: React.FC<{ order: Order }> = ({ order }) => {
  const cancelOrderMutation = useCancelOrder();

  const handleCancelOrder = async () => {
    if (order.status !== "pending" && order.status !== "paid") {
      toast.error("This order cannot be cancelled");
      return;
    }

    try {
      await cancelOrderMutation.mutateAsync(order.id);
      toast.success("Order cancelled successfully");
    } catch {
      toast.error("Failed to cancel order");
    }
  };

  const canCancel = order.status === "pending" || order.status === "paid";

  return (
    <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Order #{order.id.slice(-8).toUpperCase()}
        </DialogTitle>
        <DialogDescription>
          Placed on {formatDate(order.created_at)}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Order Status and Actions */}
        <div className="flex items-center justify-between">
          <OrderStatusBadge status={order.status} />
          {canCancel && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleCancelOrder}
              disabled={cancelOrderMutation.isPending}
            >
              {cancelOrderMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <X className="mr-2 h-4 w-4" />
              )}
              Cancel Order
            </Button>
          )}
        </div>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Order ID:</span>
                <p className="font-medium">
                  #{order.id.slice(-8).toUpperCase()}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Total Amount:</span>
                <p className="font-medium">
                  {formatCurrency(order.total_amount, order.currency)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Order Date:</span>
                <p className="font-medium">{formatDate(order.created_at)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Last Updated:</span>
                <p className="font-medium">{formatDate(order.updated_at)}</p>
              </div>
            </div>

            {order.cancellation_reason && (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-800">
                  <strong>Cancellation Reason:</strong>{" "}
                  {order.cancellation_reason}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Items */}
        {order.items && order.items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-lg border p-4"
                  >
                    <div className="relative h-16 w-16 flex-shrink-0">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.variant.product.name}
                          fill
                          className="rounded-md object-cover"
                        />
                      ) : (
                        <div className="bg-muted flex h-full w-full items-center justify-center rounded-md">
                          <Package className="text-muted-foreground h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate font-medium">
                        {item.variant.product.name}
                      </h4>
                      <div className="mt-1 flex gap-2">
                        {item.variant.size && (
                          <Badge variant="outline" className="text-xs">
                            {item.variant.size}
                          </Badge>
                        )}
                        {item.variant.color && (
                          <Badge variant="outline" className="text-xs">
                            {item.variant.color}
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mt-1 text-sm">
                        SKU: {item.variant.sku}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(item.unit_price, order.currency)}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Qty: {item.quantity}
                      </p>
                      {item.discount_applied > 0 && (
                        <p className="text-sm text-green-600">
                          -
                          {formatCurrency(
                            item.discount_applied,
                            order.currency
                          )}{" "}
                          discount
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Shipping & Billing Information */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-4 w-4" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <p className="font-medium">
                  {order.shipping_address.recipient_name}
                </p>
                <p>{order.shipping_address.line1}</p>
                {order.shipping_address.line2 && (
                  <p>{order.shipping_address.line2}</p>
                )}
                <p>
                  {order.shipping_address.city},{" "}
                  {order.shipping_address.postal_code}
                </p>
                <p>{order.shipping_address.country}</p>
                {order.shipping_address.phone && (
                  <p className="text-muted-foreground">
                    Phone: {order.shipping_address.phone}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-4 w-4" />
                Billing Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <p className="font-medium">
                  {order.billing_address.recipient_name}
                </p>
                <p>{order.billing_address.line1}</p>
                {order.billing_address.line2 && (
                  <p>{order.billing_address.line2}</p>
                )}
                <p>
                  {order.billing_address.city},{" "}
                  {order.billing_address.postal_code}
                </p>
                <p>{order.billing_address.country}</p>
                {order.billing_address.phone && (
                  <p className="text-muted-foreground">
                    Phone: {order.billing_address.phone}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Notes */}
        {order.order_notes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{order.order_notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DialogContent>
  );
};

// Main Orders Page Component
export default function OrdersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { user, session, loading: authLoading } = useAuth();

  // Debug authentication state
  useEffect(() => {
    console.log("Orders Page Debug:", {
      user,
      session,
      authLoading,
      isAuthenticated: SessionManager.isAuthenticated(),
      accessToken: SessionManager.getAccessToken(),
    });
  }, [user, session, authLoading]);

  const {
    data: ordersData,
    isLoading,
    error,
    refetch,
    isFetching,
    isError,
  } = useUserOrders({
    page: currentPage,
    limit: itemsPerPage,
    sortBy: "created_at",
    sortOrder: "desc",
  });

  // Debug orders data
  useEffect(() => {
    console.log("Orders Query Debug:", {
      ordersData,
      isLoading,
      isFetching,
      isError,
      error: error?.message,
      totalItems: ordersData?.meta?.totalItems,
      itemsLength: ordersData?.items?.length,
    });
  }, [ordersData, isLoading, isFetching, isError, error]);

  const orders = ordersData?.items || [];
  const totalPages = ordersData?.meta.totalPages || 1;
  const totalItems = ordersData?.meta.totalItems || 0;

  // Show auth loading state
  if (authLoading) {
    return (
      <div className="px-[32px] py-12">
        <div className="flex flex-col items-center justify-center px-4 py-12">
          <Loader2 className="mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user || !session) {
    return (
      <div className="px-[32px] py-12">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink className="font-medium">Orders</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="bg-muted/50 flex flex-col items-center justify-center rounded-lg px-4 py-12">
          <div className="relative mb-6">
            <div className="bg-muted flex h-24 w-24 items-center justify-center rounded-full">
              <AlertCircle className="text-muted-foreground h-12 w-12" />
            </div>
          </div>
          <h1 className="mb-4 text-2xl font-bold">Authentication Required</h1>
          <p className="text-muted-foreground mb-8 max-w-md text-center">
            Please sign in to view your orders.
          </p>
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading && orders.length === 0) {
    return (
      <div className="px-[32px] py-12">
        <div className="flex flex-col items-center justify-center px-4 py-12">
          <Loader2 className="mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading your orders...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (totalItems === 0 && !isLoading) {
    return (
      <div className="px-[32px] py-12">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink className="font-medium">Orders</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="bg-muted/50 flex flex-col items-center justify-center rounded-lg px-4 py-12">
          <div className="relative mb-6">
            <div className="bg-muted flex h-24 w-24 items-center justify-center rounded-full">
              <ShoppingBag className="text-muted-foreground h-12 w-12" />
            </div>
          </div>
          <h1 className="mb-4 text-2xl font-bold">No orders yet</h1>
          <p className="text-muted-foreground mb-8 max-w-md text-center">
            You haven&apos;t placed any orders yet. Start shopping to see your
            orders here.
          </p>
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/products">Start Shopping</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-[32px] py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink className="font-medium">Orders</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-bebas text-3xl">My Orders</h1>
          <p className="text-muted-foreground mt-1">
            {totalItems} {totalItems === 1 ? "order" : "orders"} found
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Refresh"
            )}
          </Button>
          {isLoading && (
            <div className="text-muted-foreground flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </div>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>{error.message || "Failed to load orders"}</p>
              <div className="text-xs opacity-75">
                <p>Debug info:</p>
                <p>• User ID: {user?.data?.user?.id || "Not available"}</p>
                <p>
                  • Access Token:{" "}
                  {SessionManager.getAccessToken() ? "Present" : "Missing"}
                </p>
                <p>
                  • Is Authenticated:{" "}
                  {SessionManager.isAuthenticated() ? "Yes" : "No"}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Back to Shopping Button */}
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </Button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">
                      Order #{order.id.slice(-8).toUpperCase()}
                    </h3>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="text-muted-foreground flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3" />
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">
                    {formatCurrency(order.total_amount, order.currency)}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {order.items?.length || 0}{" "}
                    {order.items?.length === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Order Items Preview */}
              {order.items && order.items.length > 0 && (
                <div className="mb-4">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {order.items.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="flex min-w-0 flex-shrink-0 items-center gap-2"
                      >
                        <div className="relative h-10 w-10">
                          {item.image_url ? (
                            <Image
                              src={item.image_url}
                              alt={item.variant.product.name}
                              fill
                              className="rounded object-cover"
                            />
                          ) : (
                            <div className="bg-muted flex h-full w-full items-center justify-center rounded">
                              <Package className="text-muted-foreground h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-[200px] truncate text-sm font-medium">
                            {item.variant.product.name}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="text-muted-foreground flex items-center text-sm">
                        +{order.items.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
            <div className="flex items-center justify-between">
              {/* Left Side */}
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <MapPin className="h-3 w-3" />
                <span>
                  {order.shipping_address.city}, {order.shipping_address.country}
                </span>
              </div>

              {/* Right Buttons */}
              <div className="flex items-center gap-2 ml-auto">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <OrderDetailsModal order={order} />
                </Dialog>

                <Dialog>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => window.location.replace("/map")}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Track Order
                  </Button>
                </DialogTrigger>
              </Dialog>

              </div>
            </div>

            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                    }
                  }}
                  className={
                    currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) {
                      setCurrentPage(currentPage + 1);
                    }
                  }}
                  className={
                    currentPage >= totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
