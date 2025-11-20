import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiService } from "@/lib/api-service";
import {
  ContactMessage,
  ContactMessageCreateInput,
  ContactMessageUpdateInput,
  ContactMessagesListResponse,
  ContactMessagesListParams,
  ContactMessageDeleteResponse,
} from "@/lib/types/contact-messages";

// Public API Functions

/**
 * Submit a contact message (public endpoint)
 */
export async function submitContactMessage(
  data: ContactMessageCreateInput
): Promise<ContactMessage> {
  const response = await ApiService.fetchPublic("/contact-messages", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return ApiService.handleResponse(
    response,
    "Failed to submit contact message"
  );
}

// Admin API Functions

/**
 * Get contact messages list (admin only)
 */
export async function getContactMessages(
  params?: ContactMessagesListParams
): Promise<ContactMessagesListResponse> {
  const queryParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
  }

  const response = await ApiService.fetchWithAuth(
    `/admin/contact-messages?${queryParams.toString()}`
  );

  return ApiService.handleResponse(
    response,
    "Failed to fetch contact messages"
  );
}

/**
 * Update a contact message (admin only)
 */
export async function updateContactMessage(
  id: string,
  data: ContactMessageUpdateInput
): Promise<ContactMessage> {
  const response = await ApiService.fetchWithAuth(
    `/admin/contact-messages/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );

  return ApiService.handleResponse(
    response,
    `Failed to update contact message: ${id}`
  );
}

/**
 * Delete a contact message (admin only)
 */
export async function deleteContactMessage(
  id: string
): Promise<ContactMessageDeleteResponse> {
  const response = await ApiService.fetchWithAuth(
    `/admin/contact-messages/${id}`,
    {
      method: "DELETE",
    }
  );

  return ApiService.handleResponse(
    response,
    `Failed to delete contact message: ${id}`
  );
}

// React Query Hooks

/**
 * Hook to submit contact message
 */
export function useSubmitContactMessage() {
  return useMutation({
    mutationFn: submitContactMessage,
    onError: (error) => {
      console.error("Error submitting contact message:", error);
    },
  });
}

/**
 * Hook to get contact messages list (admin)
 */
export function useContactMessages(params?: ContactMessagesListParams) {
  return useQuery({
    queryKey: ["contact-messages", params],
    queryFn: () => getContactMessages(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to update contact message (admin)
 */
export function useUpdateContactMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: ContactMessageUpdateInput;
    }) => updateContactMessage(id, data),
    onSuccess: () => {
      // Invalidate contact messages queries to refetch
      queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
    },
    onError: (error) => {
      console.error("Error updating contact message:", error);
    },
  });
}

/**
 * Hook to delete contact message (admin)
 */
export function useDeleteContactMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteContactMessage,
    onSuccess: () => {
      // Invalidate contact messages queries to refetch
      queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
    },
    onError: (error) => {
      console.error("Error deleting contact message:", error);
    },
  });
}
