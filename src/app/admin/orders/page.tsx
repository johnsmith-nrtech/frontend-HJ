"use client";

import { useState } from "react";
import {
  Search,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  XCircle,
  TruckIcon,
  Package,
  Download,
  Eye,
  Edit,
  Ban,
  Copy,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  FileText,
  User,
  Calendar,
  DollarSign,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  useAllOrders,
  useUpdateOrderStatus,
  useCancelOrderWithReason,
  useExportOrders,
} from "@/lib/api/orders";
import { Order, OrderStatus, OrdersListParams } from "@/lib/types/orders";
import { toast } from "sonner";
import Image from "next/image";
import { calculateOrderGrandTotal } from "@/lib/utils/order-utils";

// Get status badge for order
const getStatusBadge = (status: OrderStatus) => {
  const statusConfig = {
    delivered: {
      icon: CheckCircle2,
      className: "border-0 bg-green-100 text-green-800 hover:bg-green-100",
      label: "Delivered",
    },
    paid: {
      icon: Clock,
      className: "border-0 bg-blue-100 text-blue-800 hover:bg-blue-100",
      label: "Paid",
    },
    shipped: {
      icon: TruckIcon,
      className: "border-0 bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
      label: "Shipped",
    },
    pending: {
      icon: Package,
      className: "border-0 bg-amber-100 text-amber-800 hover:bg-amber-100",
      label: "Pending",
    },
    cancelled: {
      icon: XCircle,
      className: "border-0 bg-red-100 text-red-800 hover:bg-red-100",
      label: "Cancelled",
    },
  };

  const config = statusConfig[status];
  const IconComponent = config.icon;

  return (
    <Badge className={config.className}>
      <IconComponent className="mr-1 h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
};

// Format currency
const formatCurrency = (amount: number, currency: string = "GBP") => {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

// Copy to clipboard function
const copyToClipboard = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  } catch {
    toast.error("Failed to copy to clipboard");
  }
};

// Get allowed status transitions
const getAllowedStatusTransitions = (
  currentStatus: OrderStatus
): OrderStatus[] => {
  switch (currentStatus) {
    case "pending":
      return ["paid", "shipped", "cancelled"]; // COD orders can go directly to shipped
    case "paid":
      return ["shipped", "cancelled"];
    case "shipped":
      return ["delivered", "cancelled"];
    case "delivered":
      return ["cancelled"];
    case "cancelled":
      return []; // Cannot transition from cancelled
    default:
      return [];
  }
};

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const limit = 10;

  // Build query parameters - start with minimal params to avoid UUID validation issues
  const queryParams: OrdersListParams = {
    ...(searchQuery && { search: searchQuery }),
    ...(statusFilter !== "all" && { status: statusFilter }),
    page: currentPage,
    limit: limit,
    sortBy: "created_at",
    sortOrder: "desc",
  };

  const { data, isLoading, error } = useAllOrders(queryParams);
  const updateOrderStatus = useUpdateOrderStatus();
  const cancelOrderWithReason = useCancelOrderWithReason();
  const exportOrders = useExportOrders();

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    try {
      await updateOrderStatus.mutateAsync({
        id: orderId,
        data: { status: newStatus },
      });
      toast.success(`Order status updated to ${newStatus}`);
    } catch {
      toast.error("Failed to update order status");
    }
  };

  const handleCancelOrder = (order: Order) => {
    setSelectedOrder(order);
    setCancelReason("");
    setIsCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedOrder || !cancelReason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }

    try {
      await cancelOrderWithReason.mutateAsync({
        id: selectedOrder.id,
        data: { reason: cancelReason.trim() },
      });
      setIsCancelDialogOpen(false);
      setSelectedOrder(null);
      setCancelReason("");
      toast.success("Order cancelled successfully");
    } catch {
      toast.error("Failed to cancel order");
    }
  };

  const handleExportOrders = async () => {
    try {
      await exportOrders.mutateAsync({
        ...(statusFilter !== "all" && { status: statusFilter }),
      });
      toast.success("Orders exported successfully");
    } catch {
      toast.error("Failed to export orders");
    }
  };

  const totalPages = data ? Math.ceil(data.meta.totalItems / limit) : 0;

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-6 pt-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-600">
              Error Loading Orders
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Failed to load orders. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-4 sm:p-6 sm:pt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Orders
        </h2>
        <Button
          variant="outline"
          onClick={handleExportOrders}
          disabled={exportOrders.isPending}
          className="w-full sm:w-auto"
        >
          <Download className="mr-2 h-4 w-4" />
          {exportOrders.isPending ? "Exporting..." : "Export"}
        </Button>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            placeholder="Search orders..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as OrderStatus | "all")
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-lg">Loading orders...</div>
            </div>
          ) : !data?.items.length ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  No orders found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "No orders have been placed yet."}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">Order ID</TableHead>
                    <TableHead className="min-w-[150px]">Customer</TableHead>
                    <TableHead className="hidden min-w-[120px] md:table-cell">
                      Date
                    </TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="hidden min-w-[100px] sm:table-cell">
                      Total
                    </TableHead>
                    <TableHead className="min-w-[80px] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((order) => {
                    // const totalAmount = calculateOrderGrandTotal(order);
                    const totalAmount = calculateOrderGrandTotal(order);
const discountedTotal = order.discount_amount 
  ? totalAmount - order.discount_amount 
  : totalAmount;
                    console.log(order);
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="font-mono text-sm">
                              {order.id.slice(0, 8)}...
                            </span>
                            {/* Show date on mobile */}
                            <div className="text-muted-foreground mt-1 text-xs md:hidden">
                              {format(
                                new Date(order.created_at),
                                "MMM d, yyyy"
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {order.shipping_address.recipient_name}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {order.user_id ? "Registered" : "Guest"}
                            </span>
                            {/* Show total on mobile */}
                            <div className="text-muted-foreground mt-1 text-xs sm:hidden">
                              {formatCurrency(totalAmount, order.currency)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex flex-col">
                            <span>
                              {format(
                                new Date(order.created_at),
                                "MMM d, yyyy"
                              )}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {format(new Date(order.created_at), "h:mm a")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {formatCurrency(totalAmount, order.currency)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleViewOrder(order)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {getAllowedStatusTransitions(order.status)
                                .length > 0 && (
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Change status
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuPortal>
                                    <DropdownMenuSubContent>
                                      {getAllowedStatusTransitions(
                                        order.status
                                      ).map((status) => {
                                        const config = {
                                          pending: {
                                            icon: Package,
                                            label: "Pending",
                                          },
                                          paid: { icon: Clock, label: "Paid" },
                                          shipped: {
                                            icon: TruckIcon,
                                            label: "Shipped",
                                          },
                                          delivered: {
                                            icon: CheckCircle2,
                                            label: "Delivered",
                                          },
                                          cancelled: {
                                            icon: XCircle,
                                            label: "Cancelled",
                                          },
                                        }[status];

                                        const IconComponent = config.icon;

                                        if (status === "cancelled") {
                                          return (
                                            <DropdownMenuItem
                                              key={status}
                                              onClick={() =>
                                                handleCancelOrder(order)
                                              }
                                            >
                                              <IconComponent className="mr-2 h-4 w-4" />
                                              {config.label}
                                            </DropdownMenuItem>
                                          );
                                        }

                                        return (
                                          <DropdownMenuItem
                                            key={status}
                                            onClick={() =>
                                              handleStatusChange(
                                                order.id,
                                                status
                                              )
                                            }
                                          >
                                            <IconComponent className="mr-2 h-4 w-4" />
                                            {config.label}
                                          </DropdownMenuItem>
                                        );
                                      })}
                                    </DropdownMenuSubContent>
                                  </DropdownMenuPortal>
                                </DropdownMenuSub>
                              )}
                              {order.status !== "cancelled" && (
                                <DropdownMenuItem
                                  onClick={() => handleCancelOrder(order)}
                                  className="text-red-600"
                                >
                                  <Ban className="mr-2 h-4 w-4" />
                                  Cancel order
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {data && data.items.length > 0 && (
          <CardFooter className="flex flex-col items-center justify-between gap-4 border-t px-4 py-3 sm:flex-row sm:px-6">
            <div className="text-muted-foreground text-center text-sm sm:text-left">
              Showing <strong>{(currentPage - 1) * limit + 1}</strong> to{" "}
              <strong>
                {Math.min(currentPage * limit, data.meta.totalItems)}
              </strong>{" "}
              of <strong>{data.meta.totalItems}</strong> orders
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Next
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Enhanced View Order Dialog with Responsive Tabs */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="m-0 flex h-[100vh] w-full max-w-[100vw] flex-col overflow-hidden p-0 sm:m-auto sm:h-[95vh] sm:max-h-[95vh] sm:max-w-7xl sm:rounded-lg">
          {/* Header - Fixed and Responsive */}
          <DialogHeader className="flex-shrink-0 border-b bg-white p-3 sm:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-0">
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <DialogTitle className="truncate text-lg font-bold sm:text-2xl">
                    Order Details
                  </DialogTitle>
                  {/* Mobile close button */}
                  {/* <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsViewDialogOpen(false)}
                    className="h-8 w-8 p-1 sm:hidden"
                  >
                    <X className="h-4 w-4" />
                  </Button> */}
                </div>
                <DialogDescription className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <p className="flex items-center gap-2">
                    <span className="max-w-[200px] truncate rounded bg-gray-100 px-2 py-1 font-mono text-xs sm:max-w-none sm:text-sm">
                      {selectedOrder?.id}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(selectedOrder?.id || "", "Order ID")
                      }
                      className="h-6 w-6 flex-shrink-0 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </p>
                  <div className="flex items-center gap-2">
                    {selectedOrder && getStatusBadge(selectedOrder.status)}
                  </div>
                </DialogDescription>
              </div>

              {/* Price and Date Info */}
              <div className="mr-4 flex items-center justify-between gap-4 sm:justify-end">
                <div className="text-left sm:text-right">
                  <div className="text-lg font-bold text-green-600 sm:text-2xl">
                    {selectedOrder &&
                      formatCurrency(
                        calculateOrderGrandTotal(selectedOrder),
                        selectedOrder.currency
                      )}
                  </div>
                  <div className="text-xs text-gray-500 sm:text-sm">
                    {selectedOrder &&
                      format(new Date(selectedOrder.created_at), "MMM d, yyyy")}
                  </div>
                </div>
                {/* Desktop close button */}
                {/* <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsViewDialogOpen(false)}
                  className="hidden h-8 w-8 p-2 sm:flex"
                >
                  <X className="h-4 w-4" />
                </Button> */}
              </div>
            </div>
          </DialogHeader>

          {selectedOrder && (
            <div className="flex-1 overflow-hidden">
              <Tabs
                defaultValue="overview"
                className="flex h-full flex-col gap-6 sm:px-8"
              >
                {/* Responsive Tabs */}
                <div className="flex-shrink-0 border-b bg-white">
                  <div className="scrollbar-hide flex overflow-x-auto">
                    <TabsList className="grid h-auto w-full grid-cols-4 bg-transparent p-0">
                      <TabsTrigger
                        value="overview"
                        className="flex items-center gap-1 px-2 py-2 text-xs font-medium whitespace-nowrap data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 sm:gap-2 sm:px-4 sm:py-3 sm:text-sm"
                      >
                        <Eye className="h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Overview</span>
                        <span className="sm:hidden">Over</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="customer"
                        className="flex items-center gap-1 px-2 py-2 text-xs font-medium whitespace-nowrap data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 sm:gap-2 sm:px-4 sm:py-3 sm:text-sm"
                      >
                        <User className="h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Customer</span>
                        <span className="sm:hidden">Cust</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="items"
                        className="flex items-center gap-1 px-2 py-2 text-xs font-medium whitespace-nowrap data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 sm:gap-2 sm:px-4 sm:py-3 sm:text-sm"
                      >
                        <Package className="h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">
                          Items ({selectedOrder.items?.length || 0})
                        </span>
                        <span className="sm:hidden">Items</span>
                        {/* <span className="ml-1 rounded-full bg-gray-200 px-1 py-0 text-xs text-gray-700">
                          {selectedOrder.items?.length || 0}
                        </span> */}
                      </TabsTrigger>
                      <TabsTrigger
                        value="payment"
                        className="flex items-center gap-1 px-2 py-2 text-xs font-medium whitespace-nowrap data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 sm:gap-2 sm:px-4 sm:py-3 sm:text-sm"
                      >
                        <CreditCard className="h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Payment</span>
                        <span className="sm:hidden">Pay</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-3 sm:p-6">
                    {/* Overview Tab */}
                    <TabsContent
                      value="overview"
                      className="mt-0 space-y-4 sm:space-y-6"
                    >
                      {/* Status Cards Grid */}
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                        {/* Order Status Card */}
                        <Card className="col-span-1">
                          <CardContent className="p-3 sm:p-4">
                            <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
                              <div className="rounded-lg bg-blue-100 p-1.5 sm:p-2">
                                <Calendar className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-sm font-semibold sm:text-base">
                                  Order Status
                                </h3>
                                <p className="text-xs text-gray-500 sm:text-sm">
                                  Current state
                                </p>
                              </div>
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs sm:text-sm">
                                  Status:
                                </span>
                                {getStatusBadge(selectedOrder.status)}
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs sm:text-sm">
                                  Created:
                                </span>
                                <div className="text-right">
                                  <div className="text-xs font-medium sm:text-sm">
                                    {format(
                                      new Date(selectedOrder.created_at),
                                      "MMM d, yyyy"
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {format(
                                      new Date(selectedOrder.created_at),
                                      "h:mm a"
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs sm:text-sm">
                                  Updated:
                                </span>
                                <div className="text-right">
                                  <div className="text-xs font-medium sm:text-sm">
                                    {format(
                                      new Date(selectedOrder.updated_at),
                                      "MMM d, yyyy"
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {format(
                                      new Date(selectedOrder.updated_at),
                                      "h:mm a"
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Customer Summary Card */}
                        <Card className="col-span-1">
                          <CardContent className="p-3 sm:p-4">
                            <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
                              <div className="rounded-lg bg-green-100 p-1.5 sm:p-2">
                                <User className="h-4 w-4 text-green-600 sm:h-5 sm:w-5" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-sm font-semibold sm:text-base">
                                  Customer
                                </h3>
                                <p className="text-xs text-gray-500 sm:text-sm">
                                  Contact info
                                </p>
                              </div>
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                              <div>
                                <p className="text-sm font-medium sm:text-base">
                                  {selectedOrder.contact_first_name}{" "}
                                  {selectedOrder.contact_last_name}
                                </p>
                                <p className="truncate text-xs text-gray-500 sm:text-sm">
                                  {selectedOrder.contact_email}
                                </p>
                              </div>
                              {selectedOrder.contact_phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3 w-3 text-gray-400 sm:h-4 sm:w-4" />
                                  <span className="text-xs sm:text-sm">
                                    {selectedOrder.contact_phone}
                                  </span>
                                </div>
                              )}
                              <div className="inline-flex">
                                <Badge
                                  variant={
                                    selectedOrder.user_id
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {selectedOrder.user_id
                                    ? "Registered"
                                    : "Guest"}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Order Summary Card */}
<Card className="col-span-1 sm:col-span-2 lg:col-span-1">
  <CardContent className="p-3 sm:p-4">
    <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
      <div className="rounded-lg bg-purple-100 p-1.5 sm:p-2">
        <DollarSign className="h-4 w-4 text-purple-600 sm:h-5 sm:w-5" />
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold sm:text-base">
          Order Total
        </h3>
        <p className="text-xs text-gray-500 sm:text-sm">
          Pricing breakdown
        </p>
      </div>
    </div>
    <div className="space-y-1 sm:space-y-2">
      <div className="flex justify-between text-xs sm:text-sm">
        <span>Subtotal:</span>
        <span>
          {formatCurrency(
            selectedOrder.total_amount,
            selectedOrder.currency
          )}
        </span>
      </div>
      <div className="flex justify-between text-xs sm:text-sm">
        <span>
          Floor Charges ({selectedOrder.floor?.name || "N/A"}):
        </span>
        <span>
          {formatCurrency(
            selectedOrder.floor?.charges || 0,
            selectedOrder.currency
          )}
        </span>
      </div>
      <div className="flex justify-between text-xs sm:text-sm">
        <span>
          Zone Charges ({selectedOrder.zone?.zip_code || "N/A"}):
        </span>
        <span>
          {formatCurrency(
            selectedOrder.zone?.delivery_charges || 0,
            selectedOrder.currency
          )}
        </span>
      </div>
      
      {/* 🔴 ADD DISCOUNT LINE HERE 🔴 */}
      {selectedOrder.discount_amount > 0 && (
        <div className="flex justify-between text-xs text-green-600 sm:text-sm">
          <span>Discount {selectedOrder.coupon_code ? `(${selectedOrder.coupon_code})` : ''}:</span>
          <span>-{formatCurrency(selectedOrder.discount_amount, selectedOrder.currency)}</span>
        </div>
      )}
      
      {selectedOrder.shipping_cost > 0 && (
        <div className="flex justify-between text-xs sm:text-sm">
          <span>Shipping:</span>
          <span>
            {formatCurrency(
              selectedOrder.shipping_cost,
              selectedOrder.currency
            )}
          </span>
        </div>
      )}
      {selectedOrder.tax_amount > 0 && (
        <div className="flex justify-between text-xs sm:text-sm">
          <span>Tax:</span>
          <span>
            {formatCurrency(
              selectedOrder.tax_amount,
              selectedOrder.currency
            )}
          </span>
        </div>
      )}
      <Separator />
      <div className="flex justify-between text-sm font-semibold sm:text-base">
        <span>Total:</span>
        <span className="text-green-600">
          {formatCurrency(
            calculateOrderGrandTotal(selectedOrder),
            selectedOrder.currency
          )}
        </span>
      </div>
    </div>
  </CardContent>
</Card>
                      </div>

                      {/* Quick Actions */}
                      <Card>
                        <CardContent className="p-3 sm:p-6">
                          <h3 className="mb-3 text-sm font-semibold sm:mb-4 sm:text-base">
                            Quick Actions
                          </h3>
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(
                                  selectedOrder.contact_email,
                                  "Customer email"
                                )
                              }
                              className="flex items-center gap-1 text-xs sm:gap-2 sm:text-sm"
                            >
                              <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="hidden sm:inline">
                                Copy Email
                              </span>
                              <span className="sm:hidden">Email</span>
                            </Button>
                            {selectedOrder.contact_phone && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  copyToClipboard(
                                    selectedOrder.contact_phone!,
                                    "Phone number"
                                  )
                                }
                                className="flex items-center gap-1 text-xs sm:gap-2 sm:text-sm"
                              >
                                <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">
                                  Copy Phone
                                </span>
                                <span className="sm:hidden">Phone</span>
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(
                                  `${selectedOrder.shipping_address.street_address}, ${selectedOrder.shipping_address.city}, ${selectedOrder.shipping_address.state} ${selectedOrder.shipping_address.postal_code}, ${selectedOrder.shipping_address.country}`,
                                  "Shipping address"
                                )
                              }
                              className="flex items-center gap-1 text-xs sm:gap-2 sm:text-sm"
                            >
                              <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="hidden sm:inline">
                                Copy Address
                              </span>
                              <span className="sm:hidden">Address</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                window.open(
                                  `mailto:${selectedOrder.contact_email}?subject=Regarding Order ${selectedOrder.id.slice(0, 8)}`
                                )
                              }
                              className="flex items-center gap-1 text-xs sm:gap-2 sm:text-sm"
                            >
                              <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="hidden sm:inline">
                                Send Email
                              </span>
                              <span className="sm:hidden">Email</span>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Order Notes and Cancellation */}
                      {(selectedOrder.order_notes ||
                        selectedOrder.cancellation_reason) && (
                        <div className="grid grid-cols-1 gap-3 sm:gap-6 lg:grid-cols-2">
                          {selectedOrder.order_notes && (
                            <Card>
                              <CardContent className="p-3 sm:p-6">
                                <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
                                  <div className="rounded-lg bg-blue-100 p-1.5 sm:p-2">
                                    <FileText className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
                                  </div>
                                  <h3 className="text-sm font-semibold sm:text-base">
                                    Order Notes
                                  </h3>
                                </div>
                                <div className="rounded-lg bg-blue-50 p-3 sm:p-4">
                                  <p className="text-xs text-blue-800 sm:text-sm">
                                    {selectedOrder.order_notes}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {selectedOrder.cancellation_reason && (
                            <Card>
                              <CardContent className="p-3 sm:p-6">
                                <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
                                  <div className="rounded-lg bg-red-100 p-1.5 sm:p-2">
                                    <XCircle className="h-4 w-4 text-red-600 sm:h-5 sm:w-5" />
                                  </div>
                                  <h3 className="text-sm font-semibold sm:text-base">
                                    Cancellation Reason
                                  </h3>
                                </div>
                                <div className="rounded-lg bg-red-50 p-3 sm:p-4">
                                  <p className="text-xs text-red-800 sm:text-sm">
                                    {selectedOrder.cancellation_reason}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      )}
                    </TabsContent>

                    {/* Customer Tab */}
                    <TabsContent
                      value="customer"
                      className="mt-0 space-y-4 sm:space-y-6"
                    >
                      <div className="grid grid-cols-1 gap-3 sm:gap-6 lg:grid-cols-2">
                        {/* Contact Information */}
                        <Card>
                          <CardContent className="p-3 sm:p-6">
                            <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
                              <div className="rounded-lg bg-blue-100 p-1.5 sm:p-2">
                                <User className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
                              </div>
                              <h3 className="text-sm font-semibold sm:text-base">
                                Contact Information
                              </h3>
                            </div>
                            <div className="space-y-3 sm:space-y-4">
                              <div>
                                <Label className="text-xs font-medium text-gray-600 sm:text-sm">
                                  Full Name
                                </Label>
                                <div className="mt-1 flex items-center gap-2">
                                  <p className="text-xs font-medium sm:text-sm">
                                    {selectedOrder.contact_first_name}{" "}
                                    {selectedOrder.contact_last_name}
                                  </p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      copyToClipboard(
                                        `${selectedOrder.contact_first_name} ${selectedOrder.contact_last_name}`,
                                        "Customer name"
                                      )
                                    }
                                    className="h-5 w-5 p-0 sm:h-6 sm:w-6"
                                  >
                                    <Copy className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                  </Button>
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs font-medium text-gray-600 sm:text-sm">
                                  Email Address
                                </Label>
                                <div className="mt-1 flex items-center gap-2">
                                  <p className="text-xs break-all text-gray-700 sm:text-sm">
                                    {selectedOrder.contact_email}
                                  </p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      copyToClipboard(
                                        selectedOrder.contact_email,
                                        "Email address"
                                      )
                                    }
                                    className="h-5 w-5 flex-shrink-0 p-0 sm:h-6 sm:w-6"
                                  >
                                    <Copy className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                  </Button>
                                </div>
                              </div>
                              {selectedOrder.contact_phone && (
                                <div>
                                  <Label className="text-xs font-medium text-gray-600 sm:text-sm">
                                    Phone Number
                                  </Label>
                                  <div className="mt-1 flex items-center gap-2">
                                    <p className="text-xs text-gray-700 sm:text-sm">
                                      {selectedOrder.contact_phone}
                                    </p>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        copyToClipboard(
                                          selectedOrder.contact_phone!,
                                          "Phone number"
                                        )
                                      }
                                      className="h-5 w-5 p-0 sm:h-6 sm:w-6"
                                    >
                                      <Copy className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                              <div>
                                <Label className="text-xs font-medium text-gray-600 sm:text-sm">
                                  Customer Type
                                </Label>
                                <div className="mt-1">
                                  <Badge
                                    variant={
                                      selectedOrder.user_id
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {selectedOrder.user_id
                                      ? "Registered User"
                                      : "Guest Customer"}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Shipping Address */}
                        <Card>
                          <CardContent className="p-3 sm:p-6">
                            <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
                              <div className="rounded-lg bg-green-100 p-1.5 sm:p-2">
                                <MapPin className="h-4 w-4 text-green-600 sm:h-5 sm:w-5" />
                              </div>
                              <h3 className="text-sm font-semibold sm:text-base">
                                Shipping Address
                              </h3>
                            </div>
                            <div className="rounded-lg bg-gray-50 p-3 sm:p-4">
                              <div className="space-y-1 text-xs sm:text-sm">
                                <p className="font-medium text-gray-900">
                                  {selectedOrder.contact_first_name}{" "}
                                  {selectedOrder.contact_last_name}
                                </p>
                                <p>
                                  {
                                    selectedOrder.shipping_address
                                      .street_address
                                  }
                                </p>
                                <p>
                                  {selectedOrder.shipping_address.city}
                                  {selectedOrder.shipping_address.state &&
                                    `, ${selectedOrder.shipping_address.state}`}{" "}
                                  {selectedOrder.shipping_address.postal_code}
                                </p>
                                <p>
                                  {selectedOrder.shipping_address
                                    .country_name ||
                                    selectedOrder.shipping_address.country}
                                </p>
                                {selectedOrder.contact_phone && (
                                  <p>Phone: {selectedOrder.contact_phone}</p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Billing Address */}
                      <Card>
                        <CardContent className="p-3 sm:p-6">
                          <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
                            <div className="rounded-lg bg-purple-100 p-1.5 sm:p-2">
                              <CreditCard className="h-4 w-4 text-purple-600 sm:h-5 sm:w-5" />
                            </div>
                            <h3 className="text-sm font-semibold sm:text-base">
                              Billing Address
                            </h3>
                          </div>
                          <div className="rounded-lg bg-gray-50 p-3 sm:p-4">
                            {selectedOrder.use_different_billing_address ? (
                              <div className="space-y-1 text-xs sm:text-sm">
                                <p className="font-medium text-gray-900">
                                  {selectedOrder.contact_first_name}{" "}
                                  {selectedOrder.contact_last_name}
                                </p>
                                <p>
                                  {selectedOrder.billing_address.street_address}
                                </p>
                                <p>
                                  {selectedOrder.billing_address.city}
                                  {selectedOrder.billing_address.state &&
                                    `, ${selectedOrder.billing_address.state}`}{" "}
                                  {selectedOrder.billing_address.postal_code}
                                </p>
                                <p>
                                  {selectedOrder.billing_address.country_name ||
                                    selectedOrder.billing_address.country}
                                </p>
                              </div>
                            ) : (
                              <p className="text-xs text-gray-600 italic sm:text-sm">
                                Same as shipping address
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Items Tab */}
                    <TabsContent
                      value="items"
                      className="mt-0 space-y-4 sm:space-y-6"
                    >
                      {selectedOrder.items && selectedOrder.items.length > 0 ? (
                        <Card>
                          <CardContent className="p-0">
                            {/* Mobile View - Card Layout */}
                            <div className="block sm:hidden">
                              <div className="divide-y divide-gray-200">
                                {selectedOrder.items.map((item) => (
                                  <div key={item.id} className="p-4">
                                    <div className="flex items-start space-x-3">
                                      {/*<Image fill
                                        src={item.image_url}
                                        alt={
                                          item.variant?.product?.name ||
                                          "Product"
                                        }
                                        className="h-16 w-16 flex-shrink-0 rounded-lg border object-cover"
                                      />*/}
                                      {item.image_url && (
                                        <Image
                                          src={item.image_url}
                                          alt={
                                            item.variant?.product?.name ||
                                            "Product"
                                          }
                                          fill
                                          className="h-16 w-16 flex-shrink-0 rounded-lg border object-cover"
                                        />
                                      )}
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">
                                              {item.variant?.product?.name ||
                                                "Unknown Product"}
                                            </p>
                                            {item.variant && (
                                              <div className="mt-1 space-y-1 text-xs text-gray-500">
                                                <p>
                                                  Color: {item.variant.color} •
                                                  Size: {item.variant.size}
                                                </p>
                                                <p>SKU: {item.variant.sku}</p>
                                              </div>
                                            )}
                                          </div>
                                          <div className="ml-2 text-right">
                                            <p className="text-sm font-medium">
                                              Qty: {item.quantity}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                              {formatCurrency(
                                                item.unit_price,
                                                selectedOrder.currency
                                              )}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between">
                                          <div>
                                            {item.discount_applied > 0 ? (
                                              <span className="text-xs text-green-600">
                                                Discount: -
                                                {formatCurrency(
                                                  item.discount_applied,
                                                  selectedOrder.currency
                                                )}
                                              </span>
                                            ) : null}
                                          </div>
                                          <div className="text-sm font-medium">
                                            {formatCurrency(
                                              item.unit_price * item.quantity -
                                                item.discount_applied,
                                              selectedOrder.currency
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Desktop View - Table Layout */}
                            <div className="hidden overflow-x-auto sm:block">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-gray-50">
                                    <TableHead className="font-semibold">
                                      Product
                                    </TableHead>
                                    <TableHead className="text-center font-semibold">
                                      Quantity
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                      Unit Price
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                      Discount
                                    </TableHead>
                                    <TableHead className="text-right font-semibold">
                                      Total
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {selectedOrder.items.map((item) => (
                                    <TableRow key={item.id}>
                                      <TableCell>
                                        <div className="flex items-center space-x-4">
                                          {item.image_url && (
                                            <Image
                                              fill
                                              src={item.image_url}
                                              alt={
                                                item.variant?.product?.name ||
                                                "Product"
                                              }
                                              className="h-16 w-16 rounded-lg border object-cover"
                                            />
                                          )}
                                          <div className="flex-1">
                                            <p className="font-medium text-gray-900">
                                              {item.variant?.product?.name ||
                                                "Unknown Product"}
                                            </p>
                                            {item.variant && (
                                              <div className="space-y-1 text-sm text-gray-500">
                                                <p>
                                                  Color: {item.variant.color} •
                                                  Size: {item.variant.size}
                                                </p>
                                                <p>SKU: {item.variant.sku}</p>
                                                {item.variant.material && (
                                                  <p>
                                                    Material:{" "}
                                                    {item.variant.material}
                                                  </p>
                                                )}
                                                {item.variant.brand && (
                                                  <p>
                                                    Brand: {item.variant.brand}
                                                  </p>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-center font-medium">
                                        {item.quantity}
                                      </TableCell>
                                      <TableCell>
                                        {formatCurrency(
                                          item.unit_price,
                                          selectedOrder.currency
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {item.discount_applied > 0 ? (
                                          <span className="text-green-600">
                                            -
                                            {formatCurrency(
                                              item.discount_applied,
                                              selectedOrder.currency
                                            )}
                                          </span>
                                        ) : (
                                          <span className="text-gray-400">
                                            No discount
                                          </span>
                                        )}
                                      </TableCell>
                                      <TableCell className="text-right font-medium">
                                        {formatCurrency(
                                          item.unit_price * item.quantity -
                                            item.discount_applied,
                                          selectedOrder.currency
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <Card>
                          <CardContent className="p-6 text-center">
                            <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                            <h3 className="mb-2 text-lg font-semibold text-gray-900">
                              No Items Found
                            </h3>
                            <p className="text-gray-500">
                              This order doesn&apos;t have any items.
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>

                    {/* Payment Tab */}
                    <TabsContent
                      value="payment"
                      className="mt-0 space-y-4 sm:space-y-6"
                    >
                      <div className="grid grid-cols-1 gap-3 sm:gap-6 lg:grid-cols-2">
                        {/* Payment Summary */}
                        <Card>
                          <CardContent className="p-3 sm:p-6">
                            <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
                              <div className="rounded-lg bg-green-100 p-1.5 sm:p-2">
                                <DollarSign className="h-4 w-4 text-green-600 sm:h-5 sm:w-5" />
                              </div>
                              <h3 className="text-sm font-semibold sm:text-base">Payment Summary</h3>
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                              <div className="flex justify-between">
                                <span className="text-xs sm:text-sm">Subtotal:</span>
                                <span className="text-xs font-medium sm:text-sm">
                                  {formatCurrency(
                                    selectedOrder.total_amount,
                                    selectedOrder.currency
                                  )}
                                </span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-xs sm:text-sm">
                                  Floor Charges ({selectedOrder.floor?.name || "N/A"}):
                                </span>
                                <span className="text-xs font-medium sm:text-sm">
                                  {formatCurrency(
                                    selectedOrder.floor?.charges || 0,
                                    selectedOrder.currency
                                  )}
                                </span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-xs sm:text-sm">
                                  Zone Charges ({selectedOrder.zone?.zip_code || "N/A"}):
                                </span>
                                <span className="text-xs font-medium sm:text-sm">
                                  {formatCurrency(
                                    selectedOrder.zone?.delivery_charges || 0,
                                    selectedOrder.currency
                                  )}
                                </span>
                              </div>
      
                              {/* 🔴 ADD DISCOUNT LINE HERE 🔴 */}
                              {selectedOrder.discount_amount > 0 && (
                                <div className="flex justify-between text-green-600">
                                  <span className="text-xs sm:text-sm">
                                    Discount {selectedOrder.coupon_code ? `(${selectedOrder.coupon_code})` : ''}:
                                  </span>
                                  <span className="text-xs font-medium sm:text-sm">
                                    -{formatCurrency(selectedOrder.discount_amount, selectedOrder.currency)}
                                  </span>
                                </div>
                              )}
      
                              {selectedOrder.shipping_cost > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-xs sm:text-sm">Shipping:</span>
                                  <span className="text-xs font-medium sm:text-sm">
                                    {formatCurrency(
                                      selectedOrder.shipping_cost,
                                      selectedOrder.currency
                                    )}
                                  </span>
                                </div>
                              )}
                              {selectedOrder.tax_amount > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-xs sm:text-sm">Tax:</span>
                                  <span className="text-xs font-medium sm:text-sm">
                                    {formatCurrency(
                                      selectedOrder.tax_amount,
                                      selectedOrder.currency
                                    )}
                                  </span>
                                </div>
                              )}
                              <Separator />
                              <div className="flex justify-between text-sm font-semibold sm:text-lg">
                                <span>Total:</span>
                                <span className="text-green-600">
                                  {formatCurrency(
                                    calculateOrderGrandTotal(selectedOrder),
                                    selectedOrder.currency
                                  )}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Payment Details */}
                        <Card>
                          <CardContent className="p-3 sm:p-6">
                            <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
                              <div className="rounded-lg bg-blue-100 p-1.5 sm:p-2">
                                <CreditCard className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
                              </div>
                              <h3 className="text-sm font-semibold sm:text-base">
                                Payment Details
                              </h3>
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                              <div className="flex justify-between">
                                <span className="text-xs sm:text-sm">
                                  Currency:
                                </span>
                                <span className="text-xs font-medium sm:text-sm">
                                  {selectedOrder.currency}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs sm:text-sm">
                                  Payment Status:
                                </span>
                                {getStatusBadge(selectedOrder.status)}
                              </div>
                              {selectedOrder.coupon_code && (
                                <div className="flex justify-between">
                                  <span className="text-xs sm:text-sm">
                                    Coupon Applied:
                                  </span>
                                  <span className="text-xs font-medium text-green-600 sm:text-sm">
                                    {selectedOrder.coupon_code}
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-xs sm:text-sm">
                                  Order Date:
                                </span>
                                <span className="text-xs font-medium sm:text-sm">
                                  {format(
                                    new Date(selectedOrder.created_at),
                                    "PPP"
                                  )}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Coupon Information */}
                      {selectedOrder.coupon_code && (
                        <Card>
                          <CardContent className="p-3 sm:p-6">
                            <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
                              <div className="rounded-lg bg-orange-100 p-1.5 sm:p-2">
                                <FileText className="h-4 w-4 text-orange-600 sm:h-5 sm:w-5" />
                              </div>
                              <h3 className="text-sm font-semibold sm:text-base">
                                Coupon Details
                              </h3>
                            </div>
                            <div className="rounded-lg bg-orange-50 p-3 sm:p-4">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <p className="text-sm font-medium text-orange-800">
                                    Coupon Code: {selectedOrder.coupon_code}
                                  </p>
                                  <p className="text-xs text-orange-600 sm:text-sm">
                                    Discount Applied:{" "}
                                    {formatCurrency(
                                      selectedOrder.discount_amount,
                                      selectedOrder.currency
                                    )}
                                  </p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    copyToClipboard(
                                      selectedOrder.coupon_code!,
                                      "Coupon code"
                                    )
                                  }
                                  className="w-full sm:w-auto"
                                >
                                  <Copy className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                  Copy Code
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>
                  </div>
                </div>
              </Tabs>
            </div>
          )}

          {/* Footer - Fixed and Responsive */}
          <DialogFooter className="flex-shrink-0 border-t p-3 pt-3 sm:p-6 sm:pt-4">
            <div className="flex w-full flex-col justify-between gap-3 sm:flex-row sm:gap-0">
              <div className="flex gap-2">
                {selectedOrder &&
                  getAllowedStatusTransitions(selectedOrder.status).length >
                    0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto"
                        >
                          <Edit className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          Change Status
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {getAllowedStatusTransitions(selectedOrder.status).map(
                          (status) => {
                            const config = {
                              pending: { icon: Package, label: "Pending" },
                              paid: { icon: Clock, label: "Paid" },
                              shipped: { icon: TruckIcon, label: "Shipped" },
                              delivered: {
                                icon: CheckCircle2,
                                label: "Delivered",
                              },
                              cancelled: { icon: XCircle, label: "Cancelled" },
                            }[status];

                            const IconComponent = config.icon;

                            if (status === "cancelled") {
                              return (
                                <DropdownMenuItem
                                  key={status}
                                  onClick={() => {
                                    setIsViewDialogOpen(false);
                                    handleCancelOrder(selectedOrder);
                                  }}
                                >
                                  <IconComponent className="mr-2 h-4 w-4" />
                                  {config.label}
                                </DropdownMenuItem>
                              );
                            }

                            return (
                              <DropdownMenuItem
                                key={status}
                                onClick={() =>
                                  handleStatusChange(selectedOrder.id, status)
                                }
                              >
                                <IconComponent className="mr-2 h-4 w-4" />
                                {config.label}
                              </DropdownMenuItem>
                            );
                          }
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
              </div>
              <Button
                variant="outline"
                onClick={() => setIsViewDialogOpen(false)}
                size="sm"
                className="w-full sm:w-auto"
              >
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Cancel Order
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Please provide a reason for cancelling this order. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cancel-reason" className="text-sm sm:text-base">
                Cancellation Reason
              </Label>
              <Textarea
                id="cancel-reason"
                placeholder="Enter the reason for cancelling this order..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
                className="mt-2 text-sm sm:text-base"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
              className="order-2 w-full sm:order-1 sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              disabled={cancelOrderWithReason.isPending || !cancelReason.trim()}
              className="order-1 w-full sm:order-2 sm:w-auto"
            >
              {cancelOrderWithReason.isPending
                ? "Cancelling..."
                : "Cancel Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}










