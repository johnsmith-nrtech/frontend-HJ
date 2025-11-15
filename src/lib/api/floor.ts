import { ApiService } from "@/lib/api-service";

// Floor type definitions
export interface Floor {
  id: string;
  name: string;
  charges: number;
  created_at: string;
  updated_at: string;
}

export interface FloorCreateInput {
  name: string;
  charges: number;
}

export interface FloorUpdateInput {
  name?: string;
  charges?: number;
}

// Get all floors
export async function getFloors(): Promise<Floor[]> {
  const response = await ApiService.fetchPublic(`/floors`);

  return ApiService.handleResponse<Floor[]>(response, "Failed to fetch floors");
}

// Get a single floor by ID
export async function getFloorById(id: string): Promise<Floor> {
  const response = await ApiService.fetchPublic(`/floors/${id}`);

  return ApiService.handleResponse<Floor>(
    response,
    `Failed to fetch floor: ${id}`
  );
}

// Create a new floor
export async function createFloor(data: FloorCreateInput): Promise<Floor> {
  const response = await ApiService.fetchWithAuth(`/floors/admin`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  return ApiService.handleResponse<Floor>(response, "Failed to create floor");
}

// Update a floor
export async function updateFloor(
  id: string,
  data: FloorUpdateInput
): Promise<Floor> {
  const response = await ApiService.fetchWithAuth(`/floors/admin/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  return ApiService.handleResponse<Floor>(
    response,
    `Failed to update floor: ${id}`
  );
}

// Delete a floor
export async function deleteFloor(id: string): Promise<Floor> {
  const response = await ApiService.fetchWithAuth(`/floors/admin/${id}`, {
    method: "DELETE",
  });

  return ApiService.handleResponse<Floor>(
    response,
    `Failed to delete floor: ${id}`
  );
}
