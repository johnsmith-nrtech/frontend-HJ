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
  Image as ImageIcon,
  MoveUp,
  MoveDown,
  Star,
  Eye,
  Replace,
  Trash2,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import {
  useDeleteProductImage,
  useUploadProductImages,
  useUpdateImageDetails,
} from "@/hooks/use-products";
import Image from "next/image";

export interface ExistingImage {
  id: string;
  url: string;
  order: number;
  isThumbnail?: boolean;
  type: "gallery" | "main" | "360";
}

export interface NewImageFile {
  file: File;
  id: string;
  order: number;
  type: "gallery" | "main" | "360";
  isThumbnail?: boolean;
  preview?: string;
  isNew: true;
}

export type ManagedImage = ExistingImage | NewImageFile;

interface ProductImageManagerProps {
  onImagesChange: (images: ManagedImage[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  existingImages?: ManagedImage[];
  disabled?: boolean;
  variantId?: string;
  title?: string;
  productId: string;
  allowedTypes?: ("gallery" | "main" | "360")[];
  defaultType?: "gallery" | "main" | "360";
}

export function ProductImageManager({
  onImagesChange,
  maxFiles = 20,
  acceptedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  existingImages = [],
  disabled = false,
  variantId,
  title = "Product Images",
  productId,
  allowedTypes = ["gallery", "main", "360"],
  defaultType = "gallery",
}: ProductImageManagerProps) {
  const [images, setImages] = useState<ManagedImage[]>(existingImages);
  const [dragActive, setDragActive] = useState(false);
  const [replacingImageId, setReplacingImageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const deleteImageMutation = useDeleteProductImage();
  const uploadImagesMutation = useUploadProductImages();
  const updateImageDetailsMutation = useUpdateImageDetails();

  const generateId = () =>
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const createNewImageFile = useCallback(
    (
      file: File,
      order: number,
      type: "gallery" | "main" | "360" = defaultType
    ): NewImageFile => {
      const preview = URL.createObjectURL(file);
      return {
        file,
        id: generateId(),
        order,
        type,
        isThumbnail: order === 0,
        preview,
        isNew: true,
      };
    },
    [defaultType]
  );

  const updateImagesAndNotify = useCallback(
    async (newImages: ManagedImage[], shouldSaveOrder = false) => {
      setImages(newImages);
      onImagesChange(newImages);

      // Save image order to backend if needed - use individual PUT calls for each image
      if (shouldSaveOrder && productId) {
        const existingImages = newImages.filter(
          (img): img is ExistingImage => !("isNew" in img)
        );
        if (existingImages.length > 0) {
          try {
            // Update each image's order individually using PUT /products/admin/images/{id}
            const updatePromises = existingImages.map((img) =>
              updateImageDetailsMutation.mutateAsync({
                imageId: img.id,
                data: { order: img.order },
              })
            );

            await Promise.all(updatePromises);
            toast.success("Image order updated successfully");
          } catch (error) {
            console.error("Error updating image order:", error);
            toast.error("Failed to update image order");
          }
        }
      }
    },
    [onImagesChange, productId, updateImageDetailsMutation]
  );

  const uploadNewImages = useCallback(
    async (newImages: NewImageFile[]) => {
      if (newImages.length === 0) return;

      // Group images by type for upload
      const imagesByType = newImages.reduce(
        (acc, img) => {
          if (!acc[img.type]) {
            acc[img.type] = [];
          }
          acc[img.type].push(img);
          return acc;
        },
        {} as Record<string, NewImageFile[]>
      );

      try {
        // Upload each type separately
        const uploadPromises = Object.entries(imagesByType).map(
          async ([type, typeImages]) => {
            const files = typeImages.map((img) => img.file);
            const startOrder = typeImages[0]?.order || 0;

            return uploadImagesMutation.mutateAsync({
              productId,
              files: files,
              type: type,
              order: startOrder,
            });
          }
        );

        await Promise.all(uploadPromises);

        // Refresh the parent component to get updated images
        onImagesChange([]);
        toast.success(`${newImages.length} image(s) uploaded successfully`);
      } catch (error) {
        console.error("Error uploading images:", error);
        toast.error(
          `Failed to upload images: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    },
    [productId, uploadImagesMutation, onImagesChange]
  );

  const changeImageType = useCallback(
    async (imageId: string, newType: "gallery" | "main" | "360") => {
      const image = images.find((img) => img.id === imageId);
      if (!image || "isNew" in image) return;

      try {
        await updateImageDetailsMutation.mutateAsync({
          imageId,
          data: { type: newType },
        });

        // Update local state
        const updatedImages = images.map((img) =>
          img.id === imageId ? { ...img, type: newType } : img
        );
        updateImagesAndNotify(updatedImages);
        toast.success(`Image type changed to ${newType}`);
      } catch (error) {
        console.error("Error updating image type:", error);
        toast.error("Failed to update image type");
      }
    },
    [images, updateImageDetailsMutation, updateImagesAndNotify]
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

  const handleFileSelect = useCallback(
    (selectedFiles: File[], isReplacement = false, replaceId?: string) => {
      if (disabled || selectedFiles.length === 0) return;

      if (!isReplacement) {
        const totalFiles = images.length + selectedFiles.length;
        if (totalFiles > maxFiles) {
          toast.error(`Maximum ${maxFiles} images allowed`);
          return;
        }
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

      if (isReplacement && replaceId) {
        // Replace existing image
        const replaceIndex = images.findIndex((img) => img.id === replaceId);
        if (replaceIndex !== -1 && selectedFiles.length === 1) {
          const newImages = [...images];
          const oldImage = newImages[replaceIndex];

          // Clean up old preview if it's a new image
          if ("isNew" in oldImage && oldImage.preview) {
            URL.revokeObjectURL(oldImage.preview);
          }

          const newImageFile = createNewImageFile(
            selectedFiles[0],
            oldImage.order
          );
          newImageFile.isThumbnail = oldImage.isThumbnail;
          newImages[replaceIndex] = newImageFile;

          updateImagesAndNotify(newImages);
          toast.success("Image replaced successfully");
          setReplacingImageId(null);
        }
      } else {
        // Add new images
        const newImageFiles = selectedFiles.map((file, index) =>
          createNewImageFile(file, images.length + index, defaultType)
        );

        const updatedImages = [...images, ...newImageFiles];
        updateImagesAndNotify(updatedImages);

        // Upload the new images to the server
        uploadNewImages(newImageFiles);
      }
    },
    [
      images,
      maxFiles,
      acceptedTypes,
      disabled,
      createNewImageFile,
      updateImagesAndNotify,
      defaultType,
      uploadNewImages,
    ]
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    handleFileSelect(selectedFiles);

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleReplaceInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (replacingImageId) {
      handleFileSelect(selectedFiles, true, replacingImageId);
    }

    // Reset the input
    if (replaceInputRef.current) {
      replaceInputRef.current.value = "";
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

  const removeImage = useCallback(
    async (id: string) => {
      if (disabled) return;

      const imageToRemove = images.find((img) => img.id === id);
      if (!imageToRemove) return;

      // If it's an existing image, delete from backend
      if (!("isNew" in imageToRemove) && productId) {
        try {
          await deleteImageMutation.mutateAsync(id);
        } catch (error) {
          console.error("Error deleting image from backend:", error);
          toast.error("Failed to delete image from server");
          return;
        }
      }

      // Clean up preview if it's a new image
      if ("isNew" in imageToRemove && imageToRemove.preview) {
        URL.revokeObjectURL(imageToRemove.preview);
      }

      const newImages = images.filter((img) => img.id !== id);
      // Reorder remaining images
      const reorderedImages = newImages.map((img, index) => ({
        ...img,
        order: index,
        isThumbnail: index === 0,
      }));

      updateImagesAndNotify(reorderedImages);
      toast.success("Image removed");
    },
    [images, disabled, updateImagesAndNotify, deleteImageMutation, productId]
  );

  const moveImage = useCallback(
    (id: string, direction: "up" | "down") => {
      if (disabled) return;

      const currentIndex = images.findIndex((img) => img.id === id);
      if (currentIndex === -1) return;

      const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= images.length) return;

      const newImages = [...images];
      [newImages[currentIndex], newImages[newIndex]] = [
        newImages[newIndex],
        newImages[currentIndex],
      ];

      // Update order and thumbnail status
      const reorderedImages = newImages.map((img, index) => ({
        ...img,
        order: index,
        isThumbnail: index === 0,
      }));

      updateImagesAndNotify(reorderedImages, true);
      toast.success("Image position updated");
    },
    [images, disabled, updateImagesAndNotify]
  );

  const setAsThumbnail = useCallback(
    (id: string) => {
      if (disabled) return;

      const targetIndex = images.findIndex((img) => img.id === id);
      if (targetIndex === -1 || targetIndex === 0) return;

      const newImages = [...images];
      const targetImage = newImages.splice(targetIndex, 1)[0];
      newImages.unshift(targetImage);

      // Update order and thumbnail status
      const reorderedImages = newImages.map((img, index) => ({
        ...img,
        order: index,
        isThumbnail: index === 0,
      }));

      updateImagesAndNotify(reorderedImages, true);
      toast.success("Thumbnail updated");
    },
    [images, disabled, updateImagesAndNotify]
  );

  const startReplaceImage = useCallback((id: string) => {
    setReplacingImageId(id);
    replaceInputRef.current?.click();
  }, []);

  const handleUploadClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const getImageUrl = (image: ManagedImage): string => {
    if ("isNew" in image && image.preview) {
      return image.preview;
    }
    return (image as ExistingImage).url;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Sort images by order
  const sortedImages = [...images].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(",")}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      <input
        ref={replaceInputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        onChange={handleReplaceInputChange}
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
              Add Images
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
                {sortedImages.map((image, index) => (
                  <Card
                    key={image.id}
                    className="group relative overflow-hidden"
                  >
                    <CardContent className="p-3">
                      <div className="relative mb-2 aspect-square bg-white">
                        <Image
                          fill
                          src={getImageUrl(image)}
                          alt={`Image ${index + 1}`}
                          className="h-full w-full rounded object-contain"
                        />

                        {/* Overlay with controls */}
                        <div className="absolute inset-0 flex items-center justify-center rounded bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                          <div className="flex gap-1">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() =>
                                window.open(getImageUrl(image), "_blank")
                              }
                              title="Preview"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => startReplaceImage(image.id)}
                              disabled={disabled}
                              title="Replace image"
                            >
                              <Replace className="h-4 w-4" />
                            </Button>
                            {!image.isThumbnail && (
                              <Button
                                variant="secondary"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => setAsThumbnail(image.id)}
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
                              onClick={() => removeImage(image.id)}
                              disabled={disabled}
                              title="Remove"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          <div className="flex gap-1">
                            {image.isThumbnail && (
                              <Badge variant="secondary" className="text-xs">
                                <Star className="mr-1 h-3 w-3" />
                                Thumbnail
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              #{index + 1}
                            </Badge>
                            {"isNew" in image && (
                              <Badge variant="default" className="text-xs">
                                New
                              </Badge>
                            )}
                          </div>
                          <Badge
                            className={`text-xs text-white ${getTypeColor(image.type)}`}
                          >
                            <Tag className="mr-1 h-3 w-3" />
                            {getTypeLabel(image.type)}
                          </Badge>
                        </div>

                        {/* Position Controls */}
                        <div className="absolute right-2 bottom-2 flex gap-1">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={() => moveImage(image.id, "up")}
                            disabled={disabled || index === 0}
                            title="Move up"
                          >
                            <MoveUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={() => moveImage(image.id, "down")}
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
                        <div className="flex items-center justify-between">
                          <p className="truncate text-sm font-medium">
                            {"isNew" in image
                              ? image.file.name
                              : `Image ${index + 1}`}
                          </p>
                        </div>
                        {"isNew" in image && (
                          <p className="text-muted-foreground text-xs">
                            {formatFileSize(image.file.size)}
                          </p>
                        )}

                        {/* Image Type Selector - Only for existing images */}
                        {!("isNew" in image) && (
                          <div className="space-y-1">
                            <label className="text-muted-foreground text-xs font-medium">
                              Type:
                            </label>
                            <Select
                              value={image.type}
                              onValueChange={(
                                value: "gallery" | "main" | "360"
                              ) => changeImageType(image.id, value)}
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
                        )}

                        {variantId && (
                          <p className="text-xs text-blue-600">
                            Variant: {variantId}
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
