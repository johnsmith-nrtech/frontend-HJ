import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFaqs,
  getFaqsAdmin,
  createFaq,
  updateFaq,
  reorderFaqs,
  deleteFaq,
  FaqCreateInput,
  FaqUpdateInput,
} from "@/lib/api/faq";
import { toast } from "sonner";

export function useFaqs() {
  return useQuery({
    queryKey: ["faqs"],
    queryFn: getFaqs,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFaqsAdmin() {
  return useQuery({
    queryKey: ["faqs-admin"],
    queryFn: getFaqsAdmin,
  });
}

export function useCreateFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FaqCreateInput) => createFaq(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs-admin"] });
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      toast.success("FAQ created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create FAQ", { description: error.message });
    },
  });
}

export function useUpdateFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FaqUpdateInput }) =>
      updateFaq(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs-admin"] });
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      toast.success("FAQ updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update FAQ", { description: error.message });
    },
  });
}

export function useReorderFaqs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: { id: string; order: number }[]) => reorderFaqs(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs-admin"] });
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to reorder FAQs", { description: error.message });
    },
  });
}

export function useDeleteFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFaq(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs-admin"] });
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      toast.success("FAQ deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete FAQ", { description: error.message });
    },
  });
}