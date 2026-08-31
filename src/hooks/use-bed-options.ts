import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBedOptions,
  createBedOption,
  updateBedOption,
  deleteBedOption,
  uploadBedOptionImage,
  BedOptionType,
  BedOptionCreateInput,
  BedOptionUpdateInput,
  getMattressTypes,
  getMattressType,
  createMattressType,
  updateMattressType,
  deleteMattressType,
  uploadMattressTypeImage,
  getMattresses,
  createMattress,
  updateMattress,
  deleteMattress,
  MattressTypeInput,
  MattressInput,
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

export function useUploadBedOptionImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => uploadBedOptionImage(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bedOptions"] });
      toast.success("Image uploaded");
    },
    onError: (error: Error) => {
      toast.error("Failed to upload image", { description: error.message });
    },
  });
}

// ── Mattress Types ─────────────────────────────────────────────

export function useMattressTypes(onlyActive = false) {
  return useQuery({
    queryKey: ["mattress-types", onlyActive],
    queryFn: () => getMattressTypes(onlyActive),
  });
}

export function useMattressType(id: string) {
  return useQuery({
    queryKey: ["mattress-types", id],
    queryFn: () => getMattressType(id),
    enabled: !!id,
  });
}

export function useCreateMattressType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MattressTypeInput) => createMattressType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mattress-types"] });
      toast.success("Mattress type created");
    },
    onError: (error: Error) => {
      toast.error("Failed to create mattress type", { description: error.message });
    },
  });
}

export function useUpdateMattressType(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<MattressTypeInput>) => updateMattressType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mattress-types"] });
      toast.success("Mattress type updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to update mattress type", { description: error.message });
    },
  });
}

export function useDeleteMattressType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMattressType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mattress-types"] });
      toast.success("Mattress type deleted");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete mattress type", { description: error.message });
    },
  });
}

export function useUploadMattressTypeImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => uploadMattressTypeImage(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mattress-types"] });
      toast.success("Image uploaded");
    },
    onError: (error: Error) => {
      toast.error("Failed to upload image", { description: error.message });
    },
  });
}

// ── Mattresses ────────────────────────────────────────────────

export function useMattresses(params?: { typeId?: string; onlyActive?: boolean }) {
  return useQuery({
    queryKey: ["mattresses", params],
    queryFn: () => getMattresses(params),
  });
}

export function useCreateMattress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MattressInput) => createMattress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mattresses"] });
      queryClient.invalidateQueries({ queryKey: ["mattress-types"] });
      toast.success("Mattress created");
    },
    onError: (error: Error) => {
      toast.error("Failed to create mattress", { description: error.message });
    },
  });
}

export function useUpdateMattress(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<MattressInput>) => updateMattress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mattresses"] });
      queryClient.invalidateQueries({ queryKey: ["mattress-types"] });
      toast.success("Mattress updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to update mattress", { description: error.message });
    },
  });
}

export function useDeleteMattress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMattress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mattresses"] });
      queryClient.invalidateQueries({ queryKey: ["mattress-types"] });
      toast.success("Mattress deleted");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete mattress", { description: error.message });
    },
  });
}
