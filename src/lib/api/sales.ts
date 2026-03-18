const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface SaleProduct {
  id: string;
  product_id: string;
  order: number;
  created_at: string;
  product?: {
    id: string;
    name: string;
    base_price: number;
    discount_offer?: number;
    images?: { id: string; url: string; type: string; order: number }[];
    variants?: {
      id: string;
      price: number;
      color?: string;
      size?: string;
      stock: number;
      delivery_time_days?: string;
      assemble_charges?: number;
      featured?: boolean;
    }[];
  };
}

// Get all sale products
export async function getSaleProducts(): Promise<SaleProduct[]> {
  const res = await fetch(`${API_URL}/sales`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch sale products");
  return res.json();
}

// Add a product to sales
export async function addSaleProduct(
  productId: string,
  order: number = 0,
  token: string
): Promise<SaleProduct> {
  const res = await fetch(`${API_URL}/sales`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ product_id: productId, order }),
  });
  if (!res.ok) throw new Error("Failed to add sale product");
  return res.json();
}

// Remove a product from sales
export async function removeSaleProduct(
  id: string,
  token: string
): Promise<void> {
  const res = await fetch(`${API_URL}/sales/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to remove sale product");
}

// Update sale product order
export async function updateSaleProductOrder(
  id: string,
  order: number,
  token: string
): Promise<SaleProduct> {
  const res = await fetch(`${API_URL}/sales/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ order }),
  });
  if (!res.ok) throw new Error("Failed to update sale product order");
  return res.json();
}