"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, Trash2, Save, ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { DimensionsApi, HeroSettings } from "@/lib/api/dimensions";

const PRESET_DIMENSIONS = [
  { label: "Full HD", width: 1920, height: 1080 },
  { label: "HD", width: 1280, height: 720 },
  { label: "Standard", width: 1200, height: 800 },
  { label: "Square", width: 800, height: 800 },
  { label: "Portrait", width: 800, height: 1200 },
  { label: "Banner", width: 1200, height: 400 },
  { label: "Wide Banner", width: 1920, height: 600 },
  { label: "Mobile", width: 390, height: 844 },
];

export default function DimensionsPage() {
  const [settings, setSettings] = useState<HeroSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Form state
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(800);
  const [label, setLabel] = useState("Hero Image");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const data = await DimensionsApi.getSettings();
      setSettings(data);
      setWidth(data.width);
      setHeight(data.height);
      setLabel(data.label);
      if (data.image_url) setPreviewUrl(data.image_url);
    } catch (err) {
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    setIsUploading(true);
    try {
      const { image_url } = await DimensionsApi.uploadImage(file);
      setPreviewUrl(image_url);
      setSettings((prev: HeroSettings | null) => prev ? { ...prev, image_url } : prev);
      toast.success("Image uploaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
      setPreviewUrl(settings?.image_url || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleSaveDimensions = async () => {
    if (!width || !height) {
      toast.error("Width and height are required");
      return;
    }
    setIsSaving(true);
    try {
      const updated = await DimensionsApi.updateDimensions(width, height, label);
      setSettings(updated);
      toast.success("Dimensions saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete the hero image?")) return;
    setIsDeleting(true);
    try {
      await DimensionsApi.deleteImage();
      setPreviewUrl(null);
      setSettings((prev: HeroSettings | null) => prev ? { ...prev, image_url: null } : prev);
      toast.success("Image deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  const applyPreset = (preset: { width: number; height: number; label: string }) => {
    setWidth(preset.width);
    setHeight(preset.height);
    setLabel(preset.label);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 text-[30px]">Hero Image Dimensions</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload and manage the hero section image and its display dimensions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* LEFT: Upload Section */}
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-800">
              Hero Image
            </h2>

            {/* Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex min-h-[240px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
                dragOver
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
              }`}
            >
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/80">
                  <div className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
                    <p className="mt-2 text-sm text-gray-600">Uploading...</p>
                  </div>
                </div>
              )}

              {previewUrl ? (
                <div className="flex flex-col items-center gap-2">
                  <div
                    style={{
                        width: "100%",
                        aspectRatio: `${width} / ${height}`,
                        position: "relative",
                        overflow: "hidden",
                    }}
                    className="rounded-lg border border-gray-200"
                  >
                    <Image
                        src={previewUrl}
                        alt="Hero preview"
                        fill
                        style={{ objectFit: "contain" }}
                    />
                  </div>
                    <p className="text-xs text-gray-400">
                        Preview at {width} × {height} px
                    </p>
                </div>
              ) : (
                <div className="text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-3 text-sm font-medium text-gray-600">
                    Drop image here or click to upload
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    PNG, JPG, WebP up to 5MB
                  </p>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />

            {/* Upload / Delete buttons */}
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex flex-1 items-center justify-center cursor-pointer gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                <Upload size={16} />
                {isUploading ? "Uploading..." : previewUrl ? "Replace Image" : "Upload Image"}
              </button>

              {previewUrl && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 cursor-pointer rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  Delete
                </button>
              )}
            </div>

            {/* Current image URL */}
            {settings?.image_url && (
              <div className="mt-3 rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-medium text-gray-500">Current URL</p>
                <p className="mt-1 truncate text-xs text-gray-700">
                  {settings.image_url}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Dimensions Section */}
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-800">
              Display Dimensions
            </h2>

            {/* Label */}
            <div className="mb-4">
              <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
                Label
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Hero Image"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>

            {/* Width x Height */}
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
                  Width (px)
                </label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  min={1}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
                  Height (px)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  min={1}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Aspect ratio display */}
            <div className="mb-4 rounded-lg bg-gray-50 px-3 py-2">
              <p className="text-xs text-gray-500">
                Aspect ratio:{" "}
                <span className="font-semibold text-gray-700">
                  {width && height
                    ? `${(width / height).toFixed(2)}:1`
                    : "—"}
                </span>
                <span className="ml-3 text-gray-400">
                  {width} × {height} px
                </span>
              </p>
            </div>

            {/* Save button */}
            <button
              onClick={handleSaveDimensions}
              disabled={isSaving}
              className="flex w-full items-center justify-center cursor-pointer gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {isSaving ? "Saving..." : "Save Dimensions"}
            </button>
          </div>

          {/* Preset Dimensions */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-800">
              Preset Dimensions
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_DIMENSIONS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset)}
                  className={`rounded-lg border cursor-pointer px-3 py-2 text-left text-xs transition hover:border-blue-400 hover:bg-blue-50 ${
                    width === preset.width && height === preset.height
                      ? "border-blue-400 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  <p className="font-semibold">{preset.label}</p>
                  <p className="text-gray-400">
                    {preset.width} × {preset.height}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Last updated */}
          {settings?.updated_at && (
            <p className="text-right text-xs text-gray-400">
              Last updated:{" "}
              {new Date(settings.updated_at).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}