import { ApiService } from "@/lib/api-service";

// Delivery Zone type definitions
export interface DeliveryZone {
  id: string;
  zoneName: string;
  charges: number;
  zipCodes: string[];
  created_at: string;
  updated_at: string;
}

export interface DeliveryZoneCreateInput {
  zoneName: string;
  charges: number;
  zipCodes: string[];
}

export interface DeliveryZoneUpdateInput {
  zoneName?: string;
  charges?: number;
  zipCodes?: string[];
}

// Get all delivery zones
export async function getDeliveryZones(): Promise<DeliveryZone[]> {
  const response = await ApiService.fetchPublic(`/delivery-zones`);
  return ApiService.handleResponse<DeliveryZone[]>(
    response,
    "Failed to fetch delivery zones"
  );
}

// Get a single delivery zone by ID
export async function getDeliveryZoneById(id: string): Promise<DeliveryZone> {
  const response = await ApiService.fetchPublic(`/delivery-zones/${id}`);
  return ApiService.handleResponse<DeliveryZone>(
    response,
    `Failed to fetch delivery zone: ${id}`
  );
}

// Create a new delivery zone
export async function createDeliveryZone(
  data: DeliveryZoneCreateInput
): Promise<DeliveryZone> {
  const response = await ApiService.fetchWithAuth(`/delivery-zones/admin`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return ApiService.handleResponse<DeliveryZone>(
    response,
    "Failed to create delivery zone"
  );
}

// Update a delivery zone
export async function updateDeliveryZone(
  id: string,
  data: DeliveryZoneUpdateInput
): Promise<DeliveryZone> {
  const response = await ApiService.fetchWithAuth(
    `/delivery-zones/admin/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
  return ApiService.handleResponse<DeliveryZone>(
    response,
    `Failed to update delivery zone: ${id}`
  );
}

// Delete a delivery zone
export async function deleteDeliveryZone(id: string): Promise<DeliveryZone> {
  const response = await ApiService.fetchWithAuth(
    `/delivery-zones/admin/${id}`,
    {
      method: "DELETE",
    }
  );
  return ApiService.handleResponse<DeliveryZone>(
    response,
    `Failed to delete delivery zone: ${id}`
  );
}
