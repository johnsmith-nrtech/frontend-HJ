import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Order, OrderStatus } from "@/lib/types/orders";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  CreditCardIcon,
  EyeIcon,
  Loader2Icon,
  MapPinIcon,
  Package2Icon,
  PackageIcon,
  PackageOpenIcon,
  TruckIcon,
  XCircleIcon,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useCancelOrder } from "@/lib/api/orders";
import { toast } from "sonner";
import { AddressCard } from "./address-card";
import { calculateOrderGrandTotal } from "@/lib/utils/order-utils";

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
    icon: ClockIcon,
    color: "text-yellow-600",
  },
  paid: {
    label: "Paid",
    variant: "default",
    icon: CreditCardIcon,
    color: "text-blue-600",
  },
  shipped: {
    label: "Shipped",
    variant: "secondary",
    icon: TruckIcon,
    color: "text-purple-600",
  },
  delivered: {
    label: "Delivered",
    variant: "default",
    icon: CheckCircleIcon,
    color: "text-green-600",
  },
  cancelled: {
    label: "Cancelled",
    variant: "destructive",
    icon: XCircleIcon,
    color: "text-red-600",
  },
};

export function OrderCard({ order }: { order: Order }) {
  const totalAmount = calculateOrderGrandTotal(order);

  return (
    <Card className="overflow-hidden">
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
              <CalendarIcon className="h-3 w-3" />
              {formatDate(order.created_at)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">
              {formatCurrency(totalAmount, order.currency)}
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
                  <div className="relative size-16">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.variant.product.name}
                        fill
                        className="rounded object-cover"
                      />
                    ) : (
                      <div className="bg-muted flex h-full w-full items-center justify-center rounded">
                        <PackageIcon className="text-muted-foreground h-4 w-4" />
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
                    <p className="text-muted-foreground text-xs">
                      {formatCurrency(item.unit_price, order.currency)}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Assembly:{" "}
                      {item.assembly_required
                        ? `${formatCurrency(item.variant.assemble_charges || 0, order.currency)}`
                        : "No"}
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
            <MapPinIcon className="h-3 w-3" />
            <span>
              {order.shipping_address.city}, {order.shipping_address.country}
            </span>
          </div>

          {/* Right Buttons */}
          <div className="ml-auto flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <EyeIcon className="mr-2 h-4 w-4" />
                  View Details
                </Button>
              </DialogTrigger>
              <OrderDetailsModal order={order} />
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button asChild variant="outline" size="sm">
                  <Link
                    href={{
                      pathname: `/orders/${order.id}`,
                    }}
                  >
                    <EyeIcon className="mr-2 h-4 w-4" />
                    Track Order
                  </Link>
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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

  const totalAmount = calculateOrderGrandTotal(order);

  return (
    <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <PackageOpenIcon className="h-5 w-5" />
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
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <XIcon className="mr-2 h-4 w-4" />
              )}
              Cancel Order
            </Button>
          )}
        </div>

        {/* Order Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center">
            <CardTitle className="text-lg">Order Summary</CardTitle>
            <Badge variant="outline" className="ml-auto text-sm">
              {order.id.slice(-8).toUpperCase()}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground">Total Amount:</span>
                  <p className="font-medium">
                    {formatCurrency(totalAmount, order.currency)}
                  </p>
                </div>

                <div className="text-muted-foreground mb-2 text-sm">
                  <span className="">Items Total:</span>
                  <p className="font-medium">
                    {formatCurrency(order.total_amount, order.currency)}
                  </p>
                </div>

                <div className="text-muted-foreground mb-2 text-sm">
                  <span className="text-muted-foreground">Zone Charges:</span>
                  <p className="font-medium">
                    {formatCurrency(
                      order.zone?.delivery_charges || 0,
                      order.currency
                    )}
                  </p>
                </div>

                <div className="text-muted-foreground mb-2 text-sm">
                  <span className="text-muted-foreground">Floor Charges:</span>
                  <p className="font-medium">
                    {formatCurrency(order.floor?.charges || 0, order.currency)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground">Order Date:</span>
                  <p className="font-medium">{formatDate(order.created_at)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Updated:</span>
                  <p className="font-medium">{formatDate(order.updated_at)}</p>
                </div>
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
                          <Package2Icon className="text-muted-foreground h-6 w-6" />
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
                      <p className="text-muted-foreground text-xs">
                        Assembly Required:{" "}
                        {item.assembly_required
                          ? `Yes (${formatCurrency(
                              item.variant.assemble_charges || 0,
                              order.currency
                            )})`
                          : "No"}
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
          <AddressCard
            icon={MapPinIcon}
            title="Shipping Address"
            address={order.shipping_address}
          />

          <AddressCard
            icon={CreditCardIcon}
            title="Billing Address"
            address={order.billing_address}
          />
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
