import { ApiService } from "@/lib/api-service";

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

export const ContentApi = {
  // Public: get all pages
  getPages: async (): Promise<PageContent[]> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/content`);
    if (!res.ok) throw new Error("Failed to fetch pages");
    return res.json();
  },

  // Public: get single page by slug
  getPage: async (slug: string): Promise<PageContent> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/content/${slug}`);
    if (!res.ok) throw new Error("Failed to fetch page content");
    return res.json();
  },

  // Admin: get all pages (authenticated)
  getAllPages: async (): Promise<PageContent[]> => {
    const res = await ApiService.fetchWithAuth("/content");
    if (!res.ok) throw new Error("Failed to fetch pages");
    return res.json();
  },

  // Admin: create new page
  createPage: async (title: string): Promise<PageContent> => {
    const res = await ApiService.fetchWithAuth("/content", {
      method: "POST",
      body: JSON.stringify({ title }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to create page");
    }
    return res.json();
  },

  // Admin: update page
  updatePage: async (slug: string, title: string, sections: PageSection[]): Promise<PageContent> => {
    const res = await ApiService.fetchWithAuth(`/content/${slug}`, {
      method: "PUT",
      body: JSON.stringify({ title, sections }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to update page");
    }
    return res.json();
  },

  // Admin: delete page
  deletePage: async (slug: string): Promise<void> => {
    const res = await ApiService.fetchWithAuth(`/content/${slug}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete page");
  },
};