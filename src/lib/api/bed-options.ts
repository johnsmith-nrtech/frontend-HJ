import { ApiService } from "@/lib/api-service";

export type BedOptionType = "headboard_height" | "storage" | "wings" | "mattress" | "base" | "mattress_section";

export interface BedOptionCatalogItem {
  id: string;
  type: BedOptionType;
  label: string;
  charge: number;
  height_cm?: number | null;
  image_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BedOptionCreateInput {
  type: BedOptionType;
  label: string;
  charge: number;
  height_cm?: number;
  image_url?: string;
  is_active?: boolean;
}

export interface BedOptionUpdateInput {
  type?: BedOptionType;
  label?: string;
  charge?: number;
  height_cm?: number;
  image_url?: string;
  is_active?: boolean;
}

export async function getBedOptions(params?: {
  type?: BedOptionType;
  onlyActive?: boolean;
}): Promise<BedOptionCatalogItem[]> {
  const queryParams = new URLSearchParams();
  if (params?.type) queryParams.append("type", params.type);
  if (params?.onlyActive !== undefined) queryParams.append("onlyActive", String(params.onlyActive));

  const response = await ApiService.fetchPublic(`/bed-options?${queryParams.toString()}`);
  return ApiService.handleResponse(response, "Failed to fetch bed options");
}

export async function createBedOption(data: BedOptionCreateInput): Promise<BedOptionCatalogItem> {
  const response = await ApiService.fetchWithAuth("/bed-options/admin", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return ApiService.handleResponse(response, "Failed to create bed option");
}

export async function updateBedOption(
  id: string,
  data: BedOptionUpdateInput
): Promise<BedOptionCatalogItem> {
  const response = await ApiService.fetchWithAuth(`/bed-options/admin/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return ApiService.handleResponse(response, `Failed to update bed option: ${id}`);
}

export async function deleteBedOption(id: string): Promise<BedOptionCatalogItem> {
  const response = await ApiService.fetchWithAuth(`/bed-options/admin/${id}`, {
    method: "DELETE",
  });
  return ApiService.handleResponse(response, `Failed to delete bed option: ${id}`);
}

export async function uploadBedOptionImage(id: string, file: File): Promise<BedOptionCatalogItem> {
  const formData = new FormData();
  formData.append("imageFile", file);

  const response = await ApiService.fetchWithAuth(`/bed-options/admin/${id}/image`, {
    method: "POST",
    body: formData,
  });
  return ApiService.handleResponse(response, `Failed to upload image for bed option: ${id}`);
}


// ── Mattresses (separate module: mattress types + nested mattresses) ──

export interface Mattress {
  id: string;
  mattress_type_id: string;
  name: string;
  height_cm?: number | null;
  size?: string | null;
  price: number;
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MattressType {
  id: string;
  name: string;
  image_url?: string | null;
  height_cm?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  mattresses?: Mattress[];
}

export interface MattressTypeInput {
  name: string;
  image_url?: string;
  height_cm?: number;
  is_active?: boolean;
}

export interface MattressInput {
  mattress_type_id: string;
  name: string;
  height_cm?: number;
  size?: string;
  price: number;
  stock: number;
  is_active?: boolean;
}

// ── Mattress Types ─────────────────────────────────────────────

export async function getMattressTypes(onlyActive = false): Promise<MattressType[]> {
  const response = await ApiService.fetchPublic(
    `/mattresses/types?onlyActive=${onlyActive}`
  );
  return ApiService.handleResponse(response, "Failed to fetch mattress types");
}

export async function getMattressType(id: string): Promise<MattressType> {
  const response = await ApiService.fetchPublic(`/mattresses/types/${id}`);
  return ApiService.handleResponse(response, `Failed to fetch mattress type: ${id}`);
}

export async function createMattressType(data: MattressTypeInput): Promise<MattressType> {
  const response = await ApiService.fetchWithAuth("/mattresses/types/admin", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return ApiService.handleResponse(response, "Failed to create mattress type");
}

export async function updateMattressType(
  id: string,
  data: Partial<MattressTypeInput>
): Promise<MattressType> {
  const response = await ApiService.fetchWithAuth(`/mattresses/types/admin/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return ApiService.handleResponse(response, `Failed to update mattress type: ${id}`);
}

export async function deleteMattressType(id: string): Promise<MattressType> {
  const response = await ApiService.fetchWithAuth(`/mattresses/types/admin/${id}`, {
    method: "DELETE",
  });
  return ApiService.handleResponse(response, `Failed to delete mattress type: ${id}`);
}

export async function uploadMattressTypeImage(id: string, file: File): Promise<MattressType> {
  const formData = new FormData();
  formData.append("imageFile", file);

  const response = await ApiService.fetchWithAuth(`/mattresses/types/admin/${id}/image`, {
    method: "POST",
    body: formData,
  });
  return ApiService.handleResponse(response, `Failed to upload image for mattress type: ${id}`);
}

// ── Mattresses ────────────────────────────────────────────────

export async function getMattresses(params?: {
  typeId?: string;
  onlyActive?: boolean;
}): Promise<Mattress[]> {
  const queryParams = new URLSearchParams();
  if (params?.typeId) queryParams.set("typeId", params.typeId);
  if (params?.onlyActive !== undefined) queryParams.set("onlyActive", String(params.onlyActive));

  const response = await ApiService.fetchPublic(`/mattresses?${queryParams.toString()}`);
  return ApiService.handleResponse(response, "Failed to fetch mattresses");
}

export async function getMattress(id: string): Promise<Mattress> {
  const response = await ApiService.fetchPublic(`/mattresses/${id}`);
  return ApiService.handleResponse(response, `Failed to fetch mattress: ${id}`);
}

export async function createMattress(data: MattressInput): Promise<Mattress> {
  const response = await ApiService.fetchWithAuth("/mattresses/admin", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return ApiService.handleResponse(response, "Failed to create mattress");
}

export async function updateMattress(
  id: string,
  data: Partial<MattressInput>
): Promise<Mattress> {
  const response = await ApiService.fetchWithAuth(`/mattresses/admin/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return ApiService.handleResponse(response, `Failed to update mattress: ${id}`);
}

export async function deleteMattress(id: string): Promise<Mattress> {
  const response = await ApiService.fetchWithAuth(`/mattresses/admin/${id}`, {
    method: "DELETE",
  });
  return ApiService.handleResponse(response, `Failed to delete mattress: ${id}`);
}