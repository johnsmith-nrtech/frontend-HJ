// src/lib/api/bundles.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface BundleProduct {
  id: string;
  name: string;
  description?: string;
  base_price: number;
  discount_offer?: number;
  images?: { id: string; url: string; type: string; order: number }[];
  variants?: {
    id: string;
    price: number;
    stock: number;
    assemble_charges: number;
    delivery_time_days?: string;
  }[];
}

export interface Bundle {
  id: string;
  bundlename: string;
  description?: string;
  bundleprice: number;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  bundlestatus: "active" | "inactive";
  bundleimage?: string;
  created_at: string;
  updated_at: string;
  products: BundleProduct[];
}

export interface CreateBundlePayload {
  bundlename: string;
  description?: string;
  bundleprice: number;
  discount_type?: "percentage" | "fixed";
  discount_value?: number;
  bundlestatus?: "active" | "inactive";
  productIds: string[];
  bundleimage?: File;
}

export interface UpdateBundlePayload extends Partial<CreateBundlePayload> {}

// ─── Fetch all bundles (public) ───────────────────────────────
export async function fetchBundles(onlyActive = false): Promise<Bundle[]> {
  const url = `${API_URL}/bundles${onlyActive ? "?onlyActive=true" : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch bundles");
  return res.json();
}

// ─── Fetch single bundle (public) ─────────────────────────────
export async function fetchBundle(id: string): Promise<Bundle> {
  const res = await fetch(`${API_URL}/bundles/${id}`);
  if (!res.ok) throw new Error("Bundle not found");
  return res.json();
}

// ─── Create bundle (admin) ────────────────────────────────────
export async function createBundle(
  payload: CreateBundlePayload,
  token: string
): Promise<Bundle> {
  const formData = new FormData();
  formData.append("bundlename", payload.bundlename);
  formData.append("bundleprice", String(payload.bundleprice));
  formData.append("productIds", JSON.stringify(payload.productIds));

  if (payload.description) formData.append("description", payload.description);
  if (payload.discount_type)
    formData.append("discount_type", payload.discount_type);
  if (payload.discount_value !== undefined)
    formData.append("discount_value", String(payload.discount_value));
  if (payload.bundlestatus)
    formData.append("bundlestatus", payload.bundlestatus);
  if (payload.bundleimage)
    formData.append("bundleimage", payload.bundleimage);

  const res = await fetch(`${API_URL}/bundles/admin/bundles`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create bundle");
  }
  return res.json();
}

// ─── Update bundle (admin) ────────────────────────────────────
export async function updateBundle(
  id: string,
  payload: UpdateBundlePayload,
  token: string
): Promise<Bundle> {
  const formData = new FormData();

  if (payload.bundlename) formData.append("bundlename", payload.bundlename);
  if (payload.bundleprice !== undefined)
    formData.append("bundleprice", String(payload.bundleprice));
  if (payload.productIds)
    formData.append("productIds", JSON.stringify(payload.productIds));
  if (payload.description !== undefined)
    formData.append("description", payload.description);
  if (payload.discount_type)
    formData.append("discount_type", payload.discount_type);
  if (payload.discount_value !== undefined)
    formData.append("discount_value", String(payload.discount_value));
  if (payload.bundlestatus)
    formData.append("bundlestatus", payload.bundlestatus);
  if (payload.bundleimage)
    formData.append("bundleimage", payload.bundleimage);

  const res = await fetch(`${API_URL}/bundles/admin/bundles/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update bundle");
  }
  return res.json();
}

// ─── Delete bundle (admin) ────────────────────────────────────
export async function deleteBundle(
  id: string,
  token: string
): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/bundles/admin/bundles/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to delete bundle");
  return res.json();
}