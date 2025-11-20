import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFloors,
  getFloorById,
  createFloor,
  updateFloor,
  deleteFloor,
  FloorCreateInput,
  FloorUpdateInput,
} from "@/lib/api/floor";
import { toast } from "sonner";

// ✅ Fetch all floors
export function useFloors() {
  return useQuery({
    queryKey: ["floors"],
    queryFn: getFloors,
  });
}

// ✅ Fetch a single floor by ID
export function useFloor(id: string) {
  return useQuery({
    queryKey: ["floors", id],
    queryFn: () => getFloorById(id),
    enabled: !!id,
  });
}

// ✅ Create new floor
export function useCreateFloor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FloorCreateInput) => createFloor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["floors"] });
      toast.success("Floor created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create floor", {
        description: error.message,
      });
    },
  });
}

// ✅ Update a floor
export function useUpdateFloor(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FloorUpdateInput) => updateFloor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["floors"] });
      queryClient.invalidateQueries({ queryKey: ["floors", id] });
      toast.success("Floor updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update floor", {
        description: error.message,
      });
    },
  });
}

// ✅ Delete a floor
export function useDeleteFloor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFloor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["floors"] });
      toast.success("Floor deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete floor", {
        description: error.message,
      });
    },
  });
}
