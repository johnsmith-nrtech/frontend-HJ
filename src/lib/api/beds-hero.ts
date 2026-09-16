import { ApiService } from "@/lib/api-service";

export interface BedsHeroSettings {
  id: string;
  hero_images: string[];
  updated_at: string;
}

export const BedsHeroApi = {
  getSettings: async (): Promise<BedsHeroSettings> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/beds-hero`);
    if (!res.ok) throw new Error("Failed to fetch beds hero settings");
    return res.json();
  },

  uploadHeroImage: async (file: File): Promise<BedsHeroSettings> => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await ApiService.fetchWithAuth("/beds-hero/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Upload failed");
    }
    return res.json();
  },

  deleteHeroImage: async (index: number): Promise<BedsHeroSettings> => {
    const res = await ApiService.fetchWithAuth(`/beds-hero/image/${index}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Delete failed");
    }
    return res.json();
  },
};