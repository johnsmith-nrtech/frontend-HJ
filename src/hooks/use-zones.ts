import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getZones,
  getZoneById,
  createZone,
  updateZone,
  deleteZone,
  ZoneCreateInput,
  ZoneUpdateInput,
} from "@/lib/api/zone";
import { toast } from "sonner";

// ✅ Fetch all zones
export function useZones() {
  return useQuery({
    queryKey: ["zones"],
    queryFn: getZones,
  });
}

// ✅ Fetch a single zone by ID
export function useZone(id: string) {
  return useQuery({
    queryKey: ["zones", id],
    queryFn: () => getZoneById(id),
    enabled: !!id,
  });
}

// ✅ Create new zone
export function useCreateZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ZoneCreateInput) => createZone(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      toast.success("Zone created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create zone", {
        description: error.message,
      });
    },
  });
}

// ✅ Update a zone
export function useUpdateZone(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ZoneUpdateInput) => updateZone(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      queryClient.invalidateQueries({ queryKey: ["zones", id] });
      toast.success("Zone updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update zone", {
        description: error.message,
      });
    },
  });
}

// ✅ Delete a zone
export function useDeleteZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteZone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      toast.success("Zone deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete zone", {
        description: error.message,
      });
    },
  });
}

export function useDeliveryChargesByZipCode() {
  const zones = useZones();

  return (
    zones.data?.reduce<Record<string, number>>((acc, zone) => {
      zone.zip_codes.forEach((zip) => {
        acc[zip] = zone.delivery_charges;
      });
      return acc;
    }, {}) || {}
  );
}
