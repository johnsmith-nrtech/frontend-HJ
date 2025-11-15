import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getFeaturedCategories,
  getPopularCategories,
  Category,
  CategoryCreateInput,
  CategoryUpdateInput,
} from "@/lib/api/categories";
import { toast } from "sonner";

// Hook for fetching all categories (with optional nesting)
export function useCategories(nested = false) {
  return useQuery({
    queryKey: ["categories", { nested }],
    queryFn: () => getCategories(nested),
  });
}

// Hook for fetching a single category by ID
export function useCategory(id: string) {
  return useQuery({
    queryKey: ["categories", id],
    queryFn: () => getCategoryById(id),
    enabled: !!id, // Only run the query if id is provided
  });
}

// Hook for creating a new category
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CategoryCreateInput) => createCategory(data),
    onSuccess: () => {
      // Invalidate categories queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create category", {
        description: error.message,
      });
    },
  });
}

// Hook for updating a category
export function useUpdateCategory(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CategoryUpdateInput) => updateCategory(id, data),
    onSuccess: () => {
      // Invalidate specific category and all categories queries
      queryClient.invalidateQueries({ queryKey: ["categories", id] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update category", {
        description: error.message,
      });
    },
  });
}

// Hook for deleting a category
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: (_, id) => {
      // Invalidate and remove the deleted category from cache
      queryClient.invalidateQueries({ queryKey: ["categories"] });

      // Optimistic update: remove category from cache
      queryClient.setQueryData(
        ["categories", { nested: true }],
        (oldData: Category[] | undefined) => {
          if (!oldData) return [];
          return removeCategory(oldData, id);
        }
      );

      toast.success("Category deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete category", {
        description: error.message,
      });
    },
  });
}

// Hook for fetching featured categories
export function useFeaturedCategories(params?: { limit?: number }) {
  return useQuery({
    queryKey: ["featuredCategories", params],
    queryFn: () => getFeaturedCategories(params),
  });
}

// Hook for fetching popular categories
export function usePopularCategories(params?: {
  limit?: number;
  includeImages?: boolean;
}) {
  return useQuery({
    queryKey: ["popularCategories", params],
    queryFn: () => getPopularCategories(params),
  });
}

// Helper function to recursively remove a category from the nested categories array
function removeCategory(
  categories: Category[],
  idToRemove: string
): Category[] {
  return categories
    .filter((category) => category.id !== idToRemove)
    .map((category) => {
      if (category.subcategories?.length) {
        return {
          ...category,
          subcategories: removeCategory(category.subcategories, idToRemove),
        };
      }
      return category;
    });
}
