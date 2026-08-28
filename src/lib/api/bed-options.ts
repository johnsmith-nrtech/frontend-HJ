import { ApiService } from "@/lib/api-service";

export type BedOptionType = "headboard_height" | "storage" | "wings" | "mattress" | "base";

export interface BedOptionCatalogItem {
  id: string;
  type: BedOptionType;
  label: string;
  charge: number;
  height_cm?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BedOptionCreateInput {
  type: BedOptionType;
  label: string;
  charge: number;
  height_cm?: number;
  is_active?: boolean;
}

export interface BedOptionUpdateInput {
  type?: BedOptionType;
  label?: string;
  charge?: number;
  height_cm?: number;
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