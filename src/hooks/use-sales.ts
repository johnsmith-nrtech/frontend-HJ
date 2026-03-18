import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface SaleProductVariant {
  id: string;
  price: number;
  color?: string;
  size?: string;
  stock: number;
  delivery_time_days?: string;
  assemble_charges?: number;
  featured?: boolean;
}

export interface SaleProductImage {
  id: string;
  url: string;
  type: string;
  order: number;
}

export interface SaleProductData {
  id: string;
  name: string;
  base_price: number;
  discount_offer?: number;
  images?: SaleProductImage[];
  variants?: SaleProductVariant[];
}

export interface SaleProduct {
  id: string;
  product_id: string;
  created_at: string;
  product?: SaleProductData;
}

async function getSaleProducts(): Promise<SaleProduct[]> {
  const res = await fetch(`${API_URL}/sales`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch sale products");
  return res.json();
}

async function addSaleProduct(
  productId: string,
  token: string
): Promise<SaleProduct> {
  const res = await fetch(`${API_URL}/sales`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ product_id: productId }),
  });
  if (!res.ok) throw new Error("Failed to add sale product");
  return res.json();
}

async function removeSaleProduct(id: string, token: string): Promise<void> {
  const res = await fetch(`${API_URL}/sales/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to remove sale product");
}

export function useSaleProducts() {
  return useQuery<SaleProduct[]>({
    queryKey: ["saleProducts"],
    queryFn: getSaleProducts,
  });
}

export function useAddSaleProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, token }: { productId: string; token: string }) =>
      addSaleProduct(productId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saleProducts"] });
      toast.success("Product added to sales");
    },
    onError: (error: Error) => {
      toast.error("Failed to add product to sales", {
        description: error.message,
      });
    },
  });
}

export function useRemoveSaleProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, token }: { id: string; token: string }) =>
      removeSaleProduct(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saleProducts"] });
      toast.success("Product removed from sales");
    },
    onError: (error: Error) => {
      toast.error("Failed to remove product from sales", {
        description: error.message,
      });
    },
  });
}