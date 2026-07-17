import { ApiService } from "@/lib/api-service";

export interface Faq {
  id: string;
  question: string;
  answer: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FaqCreateInput {
  question: string;
  answer: string;
  order?: number;
  is_active?: boolean;
}

export interface FaqUpdateInput {
  question?: string;
  answer?: string;
  order?: number;
  is_active?: boolean;
}

// Public: get active FAQs
export async function getFaqs(): Promise<Faq[]> {
  const response = await ApiService.fetchPublic("/faqs");
  return ApiService.handleResponse(response, "Failed to fetch FAQs");
}

// Admin: get all FAQs (active + inactive)
export async function getFaqsAdmin(): Promise<Faq[]> {
  const response = await ApiService.fetchWithAuth("/faqs/admin");
  return ApiService.handleResponse(response, "Failed to fetch FAQs");
}

// Admin: create FAQ
export async function createFaq(data: FaqCreateInput): Promise<Faq> {
  const response = await ApiService.fetchWithAuth("/faqs/admin", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return ApiService.handleResponse(response, "Failed to create FAQ");
}

// Admin: update FAQ
export async function updateFaq(id: string, data: FaqUpdateInput): Promise<Faq> {
  const response = await ApiService.fetchWithAuth(`/faqs/admin/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return ApiService.handleResponse(response, `Failed to update FAQ: ${id}`);
}

// Admin: reorder FAQs
export async function reorderFaqs(
  items: { id: string; order: number }[]
): Promise<{ message: string }> {
  const response = await ApiService.fetchWithAuth("/faqs/admin/reorder", {
    method: "PATCH",
    body: JSON.stringify({ items }),
  });
  return ApiService.handleResponse(response, "Failed to reorder FAQs");
}

// Admin: delete FAQ
export async function deleteFaq(id: string): Promise<{ message: string }> {
  const response = await ApiService.fetchWithAuth(`/faqs/admin/${id}`, {
    method: "DELETE",
  });
  return ApiService.handleResponse(response, `Failed to delete FAQ: ${id}`);
}