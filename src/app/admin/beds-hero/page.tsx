"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, Trash2, ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { BedsHeroApi, BedsHeroSettings } from "@/lib/api/beds-hero";

export default function BedsHeroPage() {
  const [settings, setSettings] = useState<BedsHeroSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const data = await BedsHeroApi.getSettings();
      setSettings(data);
    } catch {
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const updated = await BedsHeroApi.uploadHeroImage(file);
      setSettings(updated);
      toast.success("Image added!");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (index: number) => {
    if (!confirm("Remove this image?")) return;
    setDeletingIndex(index);
    try {
      const updated = await BedsHeroApi.deleteHeroImage(index);
      setSettings(updated);
      toast.success("Image removed");
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    } finally {
      setDeletingIndex(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-[30px] font-bold text-gray-900">Beds Page Hero</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload up to 5 images for the beds page hero section. They will cycle every 3 seconds.
        </p>
      </div>

      {/* Slideshow Images */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Slideshow Images</h2>
            <p className="mt-0.5 text-xs text-gray-400">
              {settings?.hero_images?.length ?? 0} / 5 images — cycles every 3 seconds.
              If none uploaded, fallback image is shown.
            </p>
          </div>
          {(settings?.hero_images?.length ?? 0) < 5 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Upload size={14} />
              )}
              {isUploading ? "Uploading..." : "Add Image"}
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
        />

        {(settings?.hero_images?.length ?? 0) === 0 ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 transition-colors"
          >
            <ImageIcon className="h-10 w-10 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">Click to add your first slideshow image</p>
            <p className="mt-1 text-xs text-gray-400">Fallback: /product-img1.png will show until images are added</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {settings!.hero_images.map((url, index) => (
              <div key={url} className="group relative rounded-lg overflow-hidden border border-gray-200">
                <div className="relative aspect-video w-full bg-gray-100">
                  <Image
                    src={url}
                    alt={`Slide ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDelete(index)}
                    disabled={deletingIndex === index}
                    className="rounded-full bg-red-600 p-1.5 text-white hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                  >
                    {deletingIndex === index ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
                <div className="bg-white px-2 py-1">
                  <p className="text-xs text-gray-500">Slide {index + 1}</p>
                </div>
              </div>
            ))}
            {/* Empty slots */}
            {Array.from({ length: 5 - (settings?.hero_images?.length ?? 0) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <Upload size={16} className="text-gray-300" />
                <p className="mt-1 text-xs text-gray-400">Add</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}