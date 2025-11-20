import { Order } from "../types/orders";

/**
 * Calculates the grand total for an order including all charges and discounts
 */
export function calculateOrderGrandTotal(order: Order): number {
  return (
    order.total_amount +
    (order.zone?.delivery_charges || 0) +
    (order.floor?.charges || 0) -
    (order.discount_amount || 0) +
    (order.shipping_cost || 0) +
    (order.tax_amount || 0)
  );
}
