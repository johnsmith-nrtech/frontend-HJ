import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBedOptions,
  createBedOption,
  updateBedOption,
  deleteBedOption,
  BedOptionType,
  BedOptionCreateInput,
  BedOptionUpdateInput,
} from "@/lib/api/bed-options";
import { toast } from "sonner";

export function useBedOptions(params?: { type?: BedOptionType; onlyActive?: boolean }) {
  return useQuery({
    queryKey: ["bedOptions", params],
    queryFn: () => getBedOptions(params),
  });
}

export function useCreateBedOption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BedOptionCreateInput) => createBedOption(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bedOptions"] });
      toast.success("Bed option created");
    },
    onError: (error: Error) => {
      toast.error("Failed to create bed option", { description: error.message });
    },
  });
}

export function useUpdateBedOption(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BedOptionUpdateInput) => updateBedOption(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bedOptions"] });
      toast.success("Bed option updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to update bed option", { description: error.message });
    },
  });
}

export function useDeleteBedOption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBedOption(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bedOptions"] });
      toast.success("Bed option deleted");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete bed option", { description: error.message });
    },
  });
}