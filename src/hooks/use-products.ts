import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductVariants,
  createProductVariant,
  getFeaturedProducts,
  getTopSellingProducts,
  getProductsWithLowStock,
  getRelatedProducts,
  uploadProductImages,
  uploadVariantImages,
  updateProductVariant,
  deleteProductVariant,
  updateVariantStock,
  deleteProductImage,
  bulkImportProducts,
  updateImageOrders,
  updateImageDetails,
  ProductCreateInput,
  ProductUpdateInput,
} from "@/lib/api/products";
import { toast } from "sonner";

// Define proper types for variant update data
interface VariantDimensions {
  width?: { cm: number; inches: number };
  depth?: { cm: number; inches: number };
  height?: { cm: number; inches: number };
  seat_width?: { cm: number; inches: number };
  seat_depth?: { cm: number; inches: number };
  seat_height?: { cm: number; inches: number };
  bed_width?: { cm: number; inches: number };
  bed_length?: { cm: number; inches: number };
}

interface PaymentOption {
  provider: string;
  type: string;
  installments?: number;
  amount_per_installment?: number;
  total_amount?: number;
  description?: string;
}

interface BulkImportResult {
  success: boolean;
  successfulImports?: number;
}

// Hook for fetching products with optional filtering
export function useProducts(params?: {
  categoryId?: string;
  size?: string;
  material?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  priceRange?: string;
  sortOrder?: string;
  delivery_time_days?: string;
  assemble_charges?: number;
  includeVariants?: boolean;
  includeImages?: boolean;
  includeCategory?: boolean;
}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => getProducts(params),
  });
}

// Hook for fetching a single product by ID
export function useProduct(
  id: string,
  params?: {
    includeVariants?: boolean;
    includeImages?: boolean;
    includeCategory?: boolean;
  }
) {
  return useQuery({
    queryKey: ["products", id, params],
    queryFn: () => getProductById(id, params),
    enabled: !!id, // Only run the query if id is provided
  });
}

// Hook for creating a new product
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductCreateInput) => createProduct(data),
    onSuccess: () => {
      // Invalidate products queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create product", {
        description: error.message,
      });
    },
  });
}

// Hook for updating a product
export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductUpdateInput) => updateProduct(id, data),
    onSuccess: () => {
      // Invalidate specific product and all products queries
      queryClient.invalidateQueries({ queryKey: ["products", id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update product", {
        description: error.message,
      });
    },
  });
}

// Hook for deleting a product
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      // Invalidate products queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete product", {
        description: error.message,
      });
    },
  });
}

// Hook for fetching product variants
export function useProductVariants(productId: string) {
  return useQuery({
    queryKey: ["products", productId, "variants"],
    queryFn: () => getProductVariants(productId),
    enabled: !!productId, // Only run the query if productId is provided
  });
}

// Hook for creating a product variant
export function useCreateProductVariant(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      sku: string;
      price: number;
      size?: string;
      color?: string;
      stock: number;
    }) => createProductVariant(productId, data),
    onSuccess: () => {
      // Invalidate variants queries to refetch data
      queryClient.invalidateQueries({
        queryKey: ["products", productId, "variants"],
      });
      queryClient.invalidateQueries({ queryKey: ["products", productId] });
      toast.success("Variant created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create variant", {
        description: error.message,
      });
    },
  });
}

// Hook for fetching featured products
export function useFeaturedProducts(params?: {
  limit?: number;
  includeCategory?: boolean;
}) {
  return useQuery({
    queryKey: ["featuredProducts", params],
    queryFn: () => getFeaturedProducts(params),
  });
}

// Hook for fetching top selling products
export function useTopSellingProducts(params?: {
  limit?: number;
  period?: "week" | "month" | "year" | "all";
  includeCategory?: boolean;
}) {
  return useQuery({
    queryKey: ["topSellingProducts", params],
    queryFn: () => getTopSellingProducts(params),
  });
}

// Hook for fetching products with low stock
export function useLowStockProducts(params?: {
  threshold?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["lowStockProducts", params],
    queryFn: () => getProductsWithLowStock(params),
  });
}

// Hook for uploading product images
export function useUploadProductImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      files,
      type,
      order,
    }: {
      productId: string;
      files: File[];
      type?: string;
      order?: number;
    }) => uploadProductImages(productId, files, type, order),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["products", variables.productId],
      });
      toast.success("Images uploaded successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to upload images", {
        description: error.message,
      });
    },
  });
}

// Hook for uploading variant images
export function useUploadVariantImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      variantId,
      files,
      type,
      order,
    }: {
      variantId: string;
      files: File[];
      type?: string;
      order?: number;
    }) => uploadVariantImages(variantId, files, type, order),
    onSuccess: (_, variables) => {
      // Invalidate both variant and product queries to refresh images
      queryClient.invalidateQueries({
        queryKey: ["variants", variables.variantId],
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Variant images uploaded successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to upload variant images", {
        description: error.message,
      });
    },
  });
}

// Hook for updating product variant
export function useUpdateProductVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      variantId,
      data,
    }: {
      variantId: string;
      data: {
        sku?: string;
        price?: number;
        compare_price?: number;
        size?: string;
        color?: string;
        stock?: number;
        weight_kg?: number;
        delivery_time_days?: string;
        assemble_charges?: number;
        dimensions?: VariantDimensions;
        payment_options?: PaymentOption[];
        tags?: string;
        material?: string;
        brand?: string;
        featured?: boolean;
      };
    }) => updateProductVariant(variantId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["variants", variables.variantId],
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Variant updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update variant", {
        description: error.message,
      });
    },
  });
}

// Hook for deleting product variant
export function useDeleteProductVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variantId: string) => deleteProductVariant(variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Variant deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete variant", {
        description: error.message,
      });
    },
  });
}

// Hook for updating variant stock
export function useUpdateVariantStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ variantId, stock }: { variantId: string; stock: number }) =>
      updateVariantStock(variantId, stock),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["variants", variables.variantId],
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Stock updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update stock", {
        description: error.message,
      });
    },
  });
}

// Hook for deleting product image
export function useDeleteProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId: string) => deleteProductImage(imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      // Don't show toast here as it's handled by the component
    },
    onError: (error: Error) => {
      toast.error("Failed to delete image", {
        description: error.message,
      });
    },
  });
}

// Hook for updating image orders
export function useUpdateImageOrders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      imageOrders,
    }: {
      productId: string;
      imageOrders: { imageId: string; order: number }[];
    }) => updateImageOrders(productId, imageOrders),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["products", variables.productId],
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Image order updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update image order", {
        description: error.message,
      });
    },
  });
}

// Hook for updating image details
export function useUpdateImageDetails() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      imageId,
      data,
    }: {
      imageId: string;
      data: { type?: string; order?: number };
    }) => updateImageDetails(imageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Image details updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update image details", {
        description: error.message,
      });
    },
  });
}

// Hook for bulk importing products
export function useBulkImportProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      options,
    }: {
      file: File;
      options?: {
        createCategories?: boolean;
        skipErrors?: boolean;
      };
    }) => bulkImportProducts(file, options),
    onSuccess: (result: BulkImportResult) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      if (result.successfulImports) {
        toast.success(
          `Successfully imported ${result.successfulImports} products`
        );
      } else {
        toast.success("Products imported successfully");
      }
    },
    onError: (error: Error) => {
      toast.error("Failed to import products", {
        description: error.message,
      });
    },
  });
}

// Hook for fetching related products
export function useRelatedProducts(
  productId: string,
  params?: {
    limit?: number;
    includeCategory?: boolean;
  }
) {
  return useQuery({
    queryKey: ["relatedProducts", productId, params],
    queryFn: () => getRelatedProducts(productId, params),
    enabled: !!productId, // Only run the query if productId is provided
  });
}
