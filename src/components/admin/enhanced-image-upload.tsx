"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  X,
  Image as ImageIcon,
  MoveUp,
  MoveDown,
  Star,
  Eye,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export interface ImageFile {
  file: File;
  id: string;
  order: number;
  type: "gallery" | "main" | "360";
  isThumbnail?: boolean;
  variantId?: string;
  preview?: string;
}

interface EnhancedImageUploadProps {
  onFilesChange: (files: ImageFile[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  existingImages?: ImageFile[];
  disabled?: boolean;
  variantId?: string;
  showVariantSelector?: boolean;
  title?: string;
  allowedTypes?: ("gallery" | "main" | "360")[];
  defaultType?: "gallery" | "main" | "360";
}

export function EnhancedImageUpload({
  onFilesChange,
  maxFiles = 10,
  acceptedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  existingImages = [],
  disabled = false,
  variantId,
  title = "Product Images",
  allowedTypes = ["gallery", "main", "360"],
  defaultType = "gallery",
}: EnhancedImageUploadProps) {
  const [files, setFiles] = useState<ImageFile[]>(existingImages);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateId = () =>
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const createImageFile = useCallback(
    (
      file: File,
      order: number,
      type: "gallery" | "main" | "360" = defaultType
    ): ImageFile => {
      const preview = URL.createObjectURL(file);
      return {
        file,
        id: generateId(),
        order,
        type,
        isThumbnail: order === 0,
        variantId,
        preview,
      };
    },
    [variantId, defaultType]
  );

  const handleFileSelect = useCallback(
    (selectedFiles: File[]) => {
      if (disabled || selectedFiles.length === 0) return;

      const totalFiles = files.length + selectedFiles.length;
      if (totalFiles > maxFiles) {
        toast.error(`Maximum ${maxFiles} images allowed`);
        return;
      }

      // Validate file types
      const invalidFiles = selectedFiles.filter(
        (file) => !acceptedTypes.includes(file.type)
      );

      if (invalidFiles.length > 0) {
        toast.error("Please upload only image files (JPEG, PNG, WebP)");
        return;
      }

      // Validate file sizes (max 5MB per file)
      const oversizedFiles = selectedFiles.filter(
        (file) => file.size > 5 * 1024 * 1024
      );

      if (oversizedFiles.length > 0) {
        toast.error("Each image must be less than 5MB");
        return;
      }

      const newImageFiles = selectedFiles.map((file, index) =>
        createImageFile(file, files.length + index)
      );

      const updatedFiles = [...files, ...newImageFiles];
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);
      toast.success(`${selectedFiles.length} image(s) added`);
    },
    [files, maxFiles, acceptedTypes, disabled, createImageFile, onFilesChange]
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    handleFileSelect(selectedFiles);

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrag = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;

      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    },
    [disabled]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (disabled) return;

      const droppedFiles = Array.from(e.dataTransfer.files);
      handleFileSelect(droppedFiles);
    },
    [handleFileSelect, disabled]
  );

  const removeFile = useCallback(
    (id: string) => {
      if (disabled) return;

      const fileToRemove = files.find((f) => f.id === id);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }

      const newFiles = files.filter((img) => img.id !== id);
      // Reorder remaining images
      const reorderedFiles = newFiles.map((img, index) => ({
        ...img,
        order: index,
        isThumbnail: index === 0,
      }));

      setFiles(reorderedFiles);
      onFilesChange(reorderedFiles);
      toast.success("Image removed");
    },
    [files, disabled, onFilesChange]
  );

  const moveImage = useCallback(
    (id: string, direction: "up" | "down") => {
      if (disabled) return;

      const currentIndex = files.findIndex((img) => img.id === id);
      if (currentIndex === -1) return;

      const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= files.length) return;

      const newFiles = [...files];
      [newFiles[currentIndex], newFiles[newIndex]] = [
        newFiles[newIndex],
        newFiles[currentIndex],
      ];

      // Update order and thumbnail status
      const reorderedFiles = newFiles.map((img, index) => ({
        ...img,
        order: index,
        isThumbnail: index === 0,
      }));

      setFiles(reorderedFiles);
      onFilesChange(reorderedFiles);
      toast.success("Image position updated");
    },
    [files, disabled, onFilesChange]
  );

  const setAsThumbnail = useCallback(
    (id: string) => {
      if (disabled) return;

      const targetIndex = files.findIndex((img) => img.id === id);
      if (targetIndex === -1 || targetIndex === 0) return;

      const newFiles = [...files];
      const targetImage = newFiles.splice(targetIndex, 1)[0];
      newFiles.unshift(targetImage);

      // Update order and thumbnail status
      const reorderedFiles = newFiles.map((img, index) => ({
        ...img,
        order: index,
        isThumbnail: index === 0,
      }));

      setFiles(reorderedFiles);
      onFilesChange(reorderedFiles);
      toast.success("Thumbnail updated");
    },
    [files, disabled, onFilesChange]
  );

  const changeImageType = useCallback(
    (id: string, newType: "gallery" | "main" | "360") => {
      if (disabled) return;

      const updatedFiles = files.map((img) =>
        img.id === id ? { ...img, type: newType } : img
      );

      setFiles(updatedFiles);
      onFilesChange(updatedFiles);
      toast.success(`Image type changed to ${newType}`);
    },
    [files, disabled, onFilesChange]
  );

  const getTypeColor = (type: "gallery" | "main" | "360") => {
    switch (type) {
      case "main":
        return "bg-blue-500";
      case "360":
        return "bg-purple-500";
      case "gallery":
      default:
        return "bg-green-500";
    }
  };

  const getTypeLabel = (type: "gallery" | "main" | "360") => {
    switch (type) {
      case "main":
        return "Main";
      case "360":
        return "360°";
      case "gallery":
      default:
        return "Gallery";
    }
  };

  const handleUploadClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Sort images by order
  const sortedImages = [...files].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(",")}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="p-6">
          <div
            onClick={handleUploadClick}
            className="flex flex-col items-center gap-4 text-center"
          >
            <div className="bg-muted rounded-full p-4">
              <Upload className="text-muted-foreground h-8 w-8" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium">
                Drop images here or click to browse
              </p>
              <p className="text-muted-foreground text-sm">
                Upload up to {maxFiles} images (JPEG, PNG, WebP, max 5MB each)
              </p>
              <p className="text-muted-foreground text-xs">
                Supported types:{" "}
                {allowedTypes.map((type) => getTypeLabel(type)).join(", ")}
              </p>
              {variantId && (
                <p className="text-xs text-blue-600">
                  Images for variant: {variantId}
                </p>
              )}
            </div>
            <Button type="button" variant="outline" disabled={disabled}>
              <Upload className="mr-2 h-4 w-4" />
              Select Images
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Image Previews */}
      {sortedImages.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{title}</h4>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{sortedImages.length} files</Badge>
                  <p className="text-muted-foreground text-xs">
                    First image is thumbnail
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sortedImages.map((imageFile, index) => (
                  <Card
                    key={imageFile.id}
                    className="group relative overflow-hidden"
                  >
                    <CardContent className="p-3">
                      <div className="relative mb-2 aspect-square">
                        <Image
                          fill
                          src={imageFile.preview || `/placeholder.jpg`}
                          alt={`Preview ${index + 1}`}
                          className="h-full w-full rounded object-cover"
                        />

                        {/* Overlay with controls */}
                        <div className="absolute inset-0 flex items-center justify-center rounded bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                          <div className="flex gap-1">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() =>
                                window.open(imageFile.preview, "_blank")
                              }
                              title="Preview"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {!imageFile.isThumbnail && (
                              <Button
                                variant="secondary"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => setAsThumbnail(imageFile.id)}
                                disabled={disabled}
                                title="Set as thumbnail"
                              >
                                <Star className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => removeFile(imageFile.id)}
                              disabled={disabled}
                              title="Remove"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          <div className="flex gap-1">
                            {imageFile.isThumbnail && (
                              <Badge variant="secondary" className="text-xs">
                                <Star className="mr-1 h-3 w-3" />
                                Thumbnail
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              #{index + 1}
                            </Badge>
                          </div>
                          <Badge
                            className={`text-xs text-white ${getTypeColor(imageFile.type)}`}
                          >
                            <Tag className="mr-1 h-3 w-3" />
                            {getTypeLabel(imageFile.type)}
                          </Badge>
                        </div>

                        {/* Position Controls */}
                        <div className="absolute right-2 bottom-2 flex gap-1">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={() => moveImage(imageFile.id, "up")}
                            disabled={disabled || index === 0}
                            title="Move up"
                          >
                            <MoveUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={() => moveImage(imageFile.id, "down")}
                            disabled={
                              disabled || index === sortedImages.length - 1
                            }
                            title="Move down"
                          >
                            <MoveDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p
                          className="truncate text-sm font-medium"
                          title={imageFile.file.name}
                        >
                          {imageFile.file.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {formatFileSize(imageFile.file.size)}
                        </p>

                        {/* Image Type Selector */}
                        <div className="space-y-1">
                          <label className="text-muted-foreground text-xs font-medium">
                            Type:
                          </label>
                          <Select
                            value={imageFile.type}
                            onValueChange={(
                              value: "gallery" | "main" | "360"
                            ) => changeImageType(imageFile.id, value)}
                            disabled={disabled}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {allowedTypes.map((type) => (
                                <SelectItem
                                  key={type}
                                  value={type}
                                  className="text-xs"
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`h-2 w-2 rounded-full ${getTypeColor(type)}`}
                                    />
                                    {getTypeLabel(type)}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {imageFile.variantId && (
                          <p className="text-xs text-blue-600">
                            Variant: {imageFile.variantId}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {sortedImages.length === 0 && (
        <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
          <div className="text-center">
            <ImageIcon className="text-muted-foreground mx-auto h-8 w-8" />
            <p className="text-muted-foreground mt-2 text-sm">
              No images selected
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
