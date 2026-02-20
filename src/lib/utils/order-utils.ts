// import { Order } from "../types/orders";

// /**
//  * Calculates the grand total for an order including all charges and discounts
//  */
// export function calculateOrderGrandTotal(order: Order): number {
//   return (
//     order.total_amount +
//     (order.zone?.delivery_charges || 0) +
//     (order.floor?.charges || 0) -
//     (order.discount_amount || 0) +
//     (order.shipping_cost || 0) +
//     (order.tax_amount || 0)
//   );
// }




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

/**
 * Calculates the subtotal for an order (items only, no charges or discounts)
 */
export function calculateOrderSubtotal(order: Order): number {
  return order.total_amount || 0;
}

/**
 * Calculates the total discount applied to an order
 */
export function calculateTotalDiscount(order: Order): number {
  return order.discount_amount || 0;
}

/**
 * Checks if a coupon was applied to the order
 */
export function hasCouponApplied(order: Order): boolean {
  return !!(order.coupon_code && order.discount_amount && order.discount_amount > 0);
}

/**
 * Formats the discount display text
 */
export function getDiscountDisplayText(order: Order): string {
  if (!hasCouponApplied(order)) return '';
  return order.coupon_code 
    ? `Discount (${order.coupon_code})` 
    : 'Discount Applied';
}