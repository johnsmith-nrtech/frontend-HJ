import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  price: number,
  options: {
    currency?: string;
    notation?: Intl.NumberFormatOptions["notation"];
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
) {
  const {
    currency = "GBP",
    notation = "standard",
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options;

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    notation,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(price);
}
