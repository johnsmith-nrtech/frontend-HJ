import { ApiService } from "@/lib/api-service";

// Zone type definitions
export type Zone = {
  id: string;
  zone_name: string;
  zip_codes: string[];
  delivery_charges: number;
  created_at: string;
  updated_at: string;
};

export type ZoneCreateInput = {
  zone_name: string;
  zip_codes: string[];
  delivery_charges: number;
};

export type ZoneUpdateInput = ZoneCreateInput;
// --------------------
// Get all zones
// --------------------
export async function getZones(): Promise<Zone[]> {
  const response = await ApiService.fetchPublic(`/zones`);
  return ApiService.handleResponse<Zone[]>(response, "Failed to fetch zones");
}

// --------------------
// Get a single zone by ID
// --------------------
export async function getZoneById(id: string): Promise<Zone> {
  const response = await ApiService.fetchPublic(`/zones/${id}`);
  return ApiService.handleResponse<Zone>(
    response,
    `Failed to fetch zone: ${id}`
  );
}

// --------------------
// Create new zone(s)
// --------------------
export async function createZone(data: ZoneCreateInput): Promise<Zone[]> {
  const response = await ApiService.fetchWithAuth(`/zones/admin`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  return ApiService.handleResponse<Zone[]>(
    response,
    "Failed to create zone(s)"
  );
}

// --------------------
// Update a zone
// --------------------
export async function updateZone(
  id: string,
  data: ZoneUpdateInput
): Promise<Zone> {
  const response = await ApiService.fetchWithAuth(`/zones/admin/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  return ApiService.handleResponse<Zone>(
    response,
    `Failed to update zone: ${id}`
  );
}

// --------------------
// Delete a zone
// --------------------
export async function deleteZone(id: string): Promise<Zone> {
  const response = await ApiService.fetchWithAuth(`/zones/admin/${id}`, {
    method: "DELETE",
  });

  return ApiService.handleResponse<Zone>(
    response,
    `Failed to delete zone: ${id}`
  );
}
