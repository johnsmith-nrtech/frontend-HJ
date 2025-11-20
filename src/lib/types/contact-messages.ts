// Contact Messages API Types
// Based on the API specification in contact-messages.md

export interface ContactMessage {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  message_text: string;
  status: ContactMessageStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export type ContactMessageStatus = "new" | "read" | "archived" | "replied";

export interface ContactMessageCreateInput {
  first_name: string;
  last_name: string;
  email: string;
  message_text: string;
}

export interface ContactMessageUpdateInput {
  status?: ContactMessageStatus;
  admin_notes?: string;
}

export interface ContactMessagesListResponse {
  items: ContactMessage[];
  total: number;
}

export interface ContactMessagesListParams {
  page?: number;
  limit?: number;
  status?: ContactMessageStatus;
  search?: string;
}

export interface ContactMessageDeleteResponse {
  id: string;
}
