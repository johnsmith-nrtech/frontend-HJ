import { ApiService } from "@/lib/api-service";

// Category type definitions
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent_id: string | null;
  order: number;
  image_url?: string;
  featured?: boolean;
  created_at: string;
  updated_at: string;
  subcategories?: Category[];
}

export interface CategoryCreateInput {
  name: string;
  slug?: string;
  parent_id?: string | null;
  description?: string;
  order?: number;
  image_url?: string;
  featured?: boolean;
}

export interface CategoryUpdateInput {
  name?: string;
  slug?: string;
  parent_id?: string | null;
  description?: string;
  order?: number;
  image_url?: string;
  featured?: boolean;
}

export interface CategoryImageInput {
  file?: File;
  url?: string;
}


// Get all categories (with optional nesting)
export async function getCategories(nested = false): Promise<Category[]> {
  const response = await ApiService.fetchPublic(
    `/categories${nested ? "?nested=true" : ""}`
  );

  return ApiService.handleResponse<Category[]>(
    response,
    "Failed to fetch categories"
  );
}

// Upload or set category image (multipart/form-data)
export async function uploadCategoryImage(
  id: string,
  input: CategoryImageInput
): Promise<Category> {
  const formData = new FormData();
  if (input.file) formData.append("imageFile", input.file);
  if (input.url) formData.append("url", input.url);

  const response = await ApiService.fetchWithAuth(`/categories/admin/${id}/image`, {
    method: "POST",
    body: formData,
  });

  return ApiService.handleResponse<Category>(
    response,
    `Failed to upload image for category: ${id}`
  );
}

// Remove category image
export async function removeCategoryImage(id: string): Promise<Category> {
  const response = await ApiService.fetchWithAuth(`/categories/admin/${id}/image`, {
    method: "DELETE",
  });

  return ApiService.handleResponse<Category>(
    response,
    `Failed to remove image for category: ${id}`
  );
}

// Get a single category by ID
export async function getCategoryById(id: string): Promise<Category> {
  const response = await ApiService.fetchPublic(`/categories/${id}`);

  return ApiService.handleResponse<Category>(
    response,
    `Failed to fetch category: ${id}`
  );
}

// Create a new category
export async function createCategory(
  data: CategoryCreateInput
): Promise<Category> {
  const response = await ApiService.fetchWithAuth("/categories/admin", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return ApiService.handleResponse<Category>(
    response,
    "Failed to create category"
  );
}

// Update a category
export async function updateCategory(
  id: string,
  data: CategoryUpdateInput
): Promise<Category> {
  const response = await ApiService.fetchWithAuth(`/categories/admin/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  return ApiService.handleResponse<Category>(
    response,
    `Failed to update category: ${id}`
  );
}

// Delete a category
export async function deleteCategory(id: string): Promise<Category> {
  const response = await ApiService.fetchWithAuth(`/categories/admin/${id}`, {
    method: "DELETE",
  });

  return ApiService.handleResponse<Category>(
    response,
    `Failed to delete category: ${id}`
  );
}

// Get subcategories by parent ID
export async function getSubcategories(parentId: string): Promise<Category[]> {
  const response = await ApiService.fetchPublic(
    `/categories/${parentId}/subcategories`
  );

  return ApiService.handleResponse<Category[]>(
    response,
    `Failed to fetch subcategories for parent: ${parentId}`
  );
}

// Get featured categories
export async function getFeaturedCategories(params?: {
  limit?: number;
}): Promise<Category[]> {
  const queryParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
  }

  const response = await ApiService.fetchPublic(
    `/categories/featured?${queryParams.toString()}`
  );

  return ApiService.handleResponse<Category[]>(
    response,
    "Failed to fetch featured categories"
  );
}

// Get popular categories
export async function getPopularCategories(params?: {
  limit?: number;
  includeImages?: boolean;
}): Promise<Category[]> {
  const queryParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
  }

  const response = await ApiService.fetchPublic(
    `/categories/popular?${queryParams.toString()}`
  );

  return ApiService.handleResponse<Category[]>(
    response,
    "Failed to fetch popular categories"
  );
}
