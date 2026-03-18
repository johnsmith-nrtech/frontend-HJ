// import { ApiService } from "@/lib/api-service";

// export interface PageSection {
//   heading: string;
//   paragraph: string;
// }

// export interface PageContent {
//   id: number;
//   page_slug: string;
//   title: string;
//   sections: PageSection[];
//   updated_at: string;
// }

// export const ContentApi = {
//   // Public: get all pages
//   getPages: async (): Promise<PageContent[]> => {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/content`);
//     if (!res.ok) throw new Error("Failed to fetch pages");
//     return res.json();
//   },

//   // Public: get single page by slug
//   getPage: async (slug: string): Promise<PageContent> => {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/content/${slug}`);
//     if (!res.ok) throw new Error("Failed to fetch page content");
//     return res.json();
//   },

//   // Admin: get all pages (authenticated)
//   getAllPages: async (): Promise<PageContent[]> => {
//     const res = await ApiService.fetchWithAuth("/content");
//     if (!res.ok) throw new Error("Failed to fetch pages");
//     return res.json();
//   },

//   // Admin: create new page
//   createPage: async (title: string): Promise<PageContent> => {
//     const res = await ApiService.fetchWithAuth("/content", {
//       method: "POST",
//       body: JSON.stringify({ title }),
//     });
//     if (!res.ok) {
//       const err = await res.json();
//       throw new Error(err.message || "Failed to create page");
//     }
//     return res.json();
//   },

//   // Admin: update page
//   updatePage: async (slug: string, title: string, sections: PageSection[]): Promise<PageContent> => {
//     const res = await ApiService.fetchWithAuth(`/content/${slug}`, {
//       method: "PUT",
//       body: JSON.stringify({ title, sections }),
//     });
//     if (!res.ok) {
//       const err = await res.json();
//       throw new Error(err.message || "Failed to update page");
//     }
//     return res.json();
//   },

//   // Admin: delete page
//   deletePage: async (slug: string): Promise<void> => {
//     const res = await ApiService.fetchWithAuth(`/content/${slug}`, {
//       method: "DELETE",
//     });
//     if (!res.ok) throw new Error("Failed to delete page");
//   },
// };








const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PageSection {
  heading: string;
  paragraph: string;
}

export interface PageContent {
  id: number;
  page_slug: string;
  title: string;
  sections: PageSection[];
  updated_at: string;
}

export interface Testimonial {
  id: string;
  time_ago: string;
  rating: number;
  title: string;
  description: string;
  author: string;
  role: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface WhyChooseUsItem {
  id: string;
  title: string;
  description: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// ─── Pages API ────────────────────────────────────────────────────────────────

export const ContentApi = {
  getPages: async (): Promise<PageContent[]> => {
    const res = await fetch(`${API_URL}/content`);
    if (!res.ok) throw new Error("Failed to fetch pages");
    return res.json();
  },

  getAllPages: async (): Promise<PageContent[]> => {
    const res = await fetch(`${API_URL}/content`);
    if (!res.ok) throw new Error("Failed to fetch pages");
    return res.json();
  },

  getPage: async (slug: string): Promise<PageContent> => {
    const res = await fetch(`${API_URL}/content/${slug}`);
    if (!res.ok) throw new Error(`Failed to fetch page: ${slug}`);
    return res.json();
  },

  createPage: async (title: string, token?: string): Promise<PageContent> => {
    const res = await fetch(`${API_URL}/content`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error("Failed to create page");
    return res.json();
  },

  updatePage: async (
    slug: string,
    title: string,
    sections: PageSection[],
    token?: string
  ): Promise<PageContent> => {
    const res = await fetch(`${API_URL}/content/${slug}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ title, sections }),
    });
    if (!res.ok) throw new Error("Failed to update page");
    return res.json();
  },

  deletePage: async (slug: string, token?: string): Promise<void> => {
    const res = await fetch(`${API_URL}/content/${slug}`, {
      method: "DELETE",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error("Failed to delete page");
  },
};

// ─── Testimonials API ─────────────────────────────────────────────────────────

export const TestimonialsApi = {
  getAll: async (): Promise<Testimonial[]> => {
    const res = await fetch(`${API_URL}/testimonials`);
    if (!res.ok) throw new Error("Failed to fetch testimonials");
    return res.json();
  },

  create: async (
    data: Omit<Testimonial, "id" | "created_at" | "updated_at">,
    token: string
  ): Promise<Testimonial> => {
    const res = await fetch(`${API_URL}/testimonials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create testimonial");
    return res.json();
  },

  update: async (
    id: string,
    data: Partial<Omit<Testimonial, "id" | "created_at" | "updated_at">>,
    token: string
  ): Promise<Testimonial> => {
    const res = await fetch(`${API_URL}/testimonials/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update testimonial");
    return res.json();
  },

  remove: async (id: string, token: string): Promise<void> => {
    const res = await fetch(`${API_URL}/testimonials/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to delete testimonial");
  },
};

// ─── Why Choose Us API ────────────────────────────────────────────────────────

export const WhyChooseUsApi = {
  getAll: async (): Promise<WhyChooseUsItem[]> => {
    const res = await fetch(`${API_URL}/why-choose-us`);
    if (!res.ok) throw new Error("Failed to fetch why choose us items");
    return res.json();
  },

  create: async (
    data: Omit<WhyChooseUsItem, "id" | "created_at" | "updated_at">,
    token: string
  ): Promise<WhyChooseUsItem> => {
    const res = await fetch(`${API_URL}/why-choose-us`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create item");
    return res.json();
  },

  update: async (
    id: string,
    data: Partial<Omit<WhyChooseUsItem, "id" | "created_at" | "updated_at">>,
    token: string
  ): Promise<WhyChooseUsItem> => {
    const res = await fetch(`${API_URL}/why-choose-us/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update item");
    return res.json();
  },

  remove: async (id: string, token: string): Promise<void> => {
    const res = await fetch(`${API_URL}/why-choose-us/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to delete item");
  },
};