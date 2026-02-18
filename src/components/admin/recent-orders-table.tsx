"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MoreHorizontal,
  CheckCircle2,
  Clock,
  XCircle,
  TruckIcon,
  Package,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAllOrders } from "@/lib/api/orders";
import { Order } from "@/lib/types/orders";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { calculateOrderGrandTotal } from "@/lib/utils/order-utils";

// Helper function to format currency
const formatCurrency = (amount: number, currency: string = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

// Helper function to get the first product name from order items
const getFirstProductName = (order: Order): string => {
  if (order.items && order.items.length > 0) {
    const firstItem = order.items[0];
    const productName = firstItem.variant?.product?.name || "Unknown Product";
    const variantInfo =
      `${firstItem.variant?.color || ""} ${firstItem.variant?.size || ""}`.trim();
    return variantInfo ? `${productName} (${variantInfo})` : productName;
  }
  return "No items";
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "delivered":
      return (
        <Badge className="border-0 bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
          Delivered
        </Badge>
      );
    case "processing":
      return (
        <Badge className="border-0 bg-blue-100 text-blue-800 hover:bg-blue-100">
          <Clock className="mr-1 h-3.5 w-3.5" />
          Processing
        </Badge>
      );
    case "shipped":
      return (
        <Badge className="border-0 bg-indigo-100 text-indigo-800 hover:bg-indigo-100">
          <TruckIcon className="mr-1 h-3.5 w-3.5" />
          Shipped
        </Badge>
      );
    case "pending":
      return (
        <Badge className="border-0 bg-amber-100 text-amber-800 hover:bg-amber-100">
          <Package className="mr-1 h-3.5 w-3.5" />
          Pending
        </Badge>
      );
    case "cancelled":
      return (
        <Badge className="border-0 bg-red-100 text-red-800 hover:bg-red-100">
          <XCircle className="mr-1 h-3.5 w-3.5" />
          Cancelled
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function RecentOrdersTable() {
  // Fetch recent orders from API
  const {
    data: ordersData,
    isLoading,
    error,
  } = useAllOrders({
    page: 1,
    limit: 5,
    sortBy: "created_at",
    sortOrder: "desc",
  });

  const orders = ordersData?.items || [];

  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="flex flex-col space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-8 w-8 rounded-md" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (error) {
    return (
      <div className="text-muted-foreground flex items-center justify-center p-4">
        Failed to load recent orders
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Total</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={5}
              className="text-muted-foreground text-center"
            >
              No recent orders found
            </TableCell>
          </TableRow>
        ) : (
          orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span className="font-medium">#{order.id.slice(-8)}</span>
                  <span className="text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(order.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{`${order.contact_first_name} ${order.contact_last_name}`}</span>
                  <span className="text-muted-foreground max-w-[150px] truncate text-xs">
                    {getFirstProductName(order)}
                  </span>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
              <TableCell>
                {formatCurrency(
                  calculateOrderGrandTotal(order),
                  order.currency
                )}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hover:bg-muted flex h-8 w-8 items-center justify-center rounded-md p-0">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/orders`}>View details</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Update status</DropdownMenuItem>
                    <DropdownMenuItem>Contact customer</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
