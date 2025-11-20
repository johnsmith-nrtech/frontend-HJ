"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  X,
  Image as ImageIcon,
  MoveUp,
  MoveDown,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { useDeleteProductImage } from "@/hooks/use-products";
import { updateImageDetails } from "@/lib/api/products";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";

export interface VariantImage {
  id?: string;
  url?: string;
  file?: File;
  order: number;
  isThumbnail?: boolean;
  isNew?: boolean;
  preview?: string;
  type?: string;
  product_id?: string;
  variant_id?: string;
}

interface VariantImageManagerProps {
  variantId?: string;
  existingImages?: VariantImage[];
  onImagesChange: (images: VariantImage[]) => void;
  maxFiles?: number;
  disabled?: boolean;
}

export function VariantImageManager({
  existingImages = [],
  onImagesChange,
  maxFiles = 5,
  disabled = false,
}: VariantImageManagerProps) {
  const [images, setImages] = useState<VariantImage[]>(existingImages);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mutation hooks
  const deleteImageMutation = useDeleteProductImage();
  const queryClient = useQueryClient();

  // Custom mutation without automatic toasts
  const updateImageDetailsMutation = useMutation({
    mutationFn: ({
      imageId,
      data,
    }: {
      imageId: string;
      data: { type?: string; order?: number };
    }) => updateImageDetails(imageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  // Sync existingImages prop with local state
  useEffect(() => {
    // Sort images by order first to ensure correct positioning
    const sortedImages = [...existingImages].sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );

    const imagesWithThumbnailStatus = sortedImages.map((img) => ({
      ...img,
      isThumbnail: img.type === "main", // Thumbnail is the image with type "main"
    }));
    console.log(
      "Syncing existing images:",
      imagesWithThumbnailStatus.map((img) => ({
        id: img.id?.slice(-8),
        order: img.order,
        type: img.type,
        isThumbnail: img.isThumbnail,
      }))
    );
    setImages(imagesWithThumbnailStatus);
  }, [existingImages]);

  const generateId = () =>
    `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const updateImages = useCallback(
    (newImages: VariantImage[]) => {
      setImages(newImages);
      onImagesChange(newImages);
    },
    [onImagesChange]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || disabled) return;

      const newImages: VariantImage[] = [];
      const remainingSlots = maxFiles - images.length;

      for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
        const file = files[i];
        if (file.type.startsWith("image/")) {
          const preview = URL.createObjectURL(file);
          const isFirstImage = images.length === 0 && i === 0;
          newImages.push({
            id: generateId(),
            file,
            preview,
            order: images.length + i,
            isThumbnail: isFirstImage,
            type: isFirstImage ? "main" : "gallery", // First image = main, others = gallery
            isNew: true,
          });
        }
      }

      if (newImages.length > 0) {
        const updatedImages = [...images, ...newImages];
        updateImages(updatedImages);
        toast.success(`${newImages.length} image(s) added`);
      }

      if (files.length > remainingSlots) {
        toast.warning(
          `Only ${remainingSlots} images could be added (max ${maxFiles})`
        );
      }
    },
    [images, maxFiles, disabled, updateImages]
  );

  const removeImage = useCallback(
    async (index: number) => {
      if (disabled) return;

      const imageToRemove = images[index];

      // If it's an existing image (not new), delete from backend
      if (!imageToRemove.isNew && imageToRemove.id) {
        try {
          await deleteImageMutation.mutateAsync(imageToRemove.id);
        } catch (error) {
          console.error("Error deleting image from backend:", error);
          toast.error("Failed to delete image from server");
          return;
        }
      }

      // Clean up preview if it's a new image
      if (imageToRemove.preview && imageToRemove.isNew) {
        URL.revokeObjectURL(imageToRemove.preview);
      }

      const newImages = images.filter((_, i) => i !== index);
      // Reorder remaining images
      const reorderedImages = newImages.map((img, i) => ({
        ...img,
        order: i,
        isThumbnail: i === 0,
      }));

      updateImages(reorderedImages);
      toast.success("Image removed");
    },
    [images, disabled, updateImages, deleteImageMutation]
  );

  const moveImage = useCallback(
    (index: number, direction: "up" | "down") => {
      if (disabled) return;

      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= images.length) return;

      const newImages = [...images];
      [newImages[index], newImages[newIndex]] = [
        newImages[newIndex],
        newImages[index],
      ];

      // Update order, thumbnail status, and image types
      const reorderedImages = newImages.map((img, i) => ({
        ...img,
        order: i,
        isThumbnail: i === 0,
        type: i === 0 ? "main" : "gallery", // Thumbnail = main, others = gallery
      }));

      updateImages(reorderedImages);

      // Update image types in the backend for existing images
      const existingImages = reorderedImages.filter(
        (img) => !img.isNew && img.id
      );

      if (existingImages.length > 0) {
        // Update images sequentially to avoid race conditions
        const updateImagesSequentially = async () => {
          try {
            for (let i = 0; i < existingImages.length; i++) {
              const img = existingImages[i];
              if (img.id) {
                const newType = i === 0 ? "main" : "gallery";
                await updateImageDetailsMutation.mutateAsync({
                  imageId: img.id,
                  data: {
                    order: i,
                    type: newType,
                  },
                });
                console.log(
                  `Updated image ${img.id} to type: ${newType}, order: ${i}`
                );
              }
            }
            toast.success("Image position and types updated");
          } catch (error) {
            console.error("Failed to update image details:", error);
            toast.error("Failed to update some image details");
          }
        };

        updateImagesSequentially();
      } else {
        toast.success("Image position updated");
      }
    },
    [images, disabled, updateImages, updateImageDetailsMutation]
  );

  const setAsThumbnail = useCallback(
    (index: number) => {
      if (disabled) return;

      // If clicking on current thumbnail, do nothing
      if (images[index]?.isThumbnail) return;

      console.log("setAsThumbnail called with index:", index);
      console.log("Current images before reorder:");
      images.forEach((img, i) =>
        console.log(`  [${i}] ID: ${img.id?.slice(-8)}, order: ${img.order}`)
      );

      const newImages = [...images];
      const targetImage = newImages.splice(index, 1)[0];
      newImages.unshift(targetImage);

      // Update order, thumbnail status, and image types
      const reorderedImages = newImages.map((img, i) => ({
        ...img,
        order: i,
        isThumbnail: i === 0,
        type: i === 0 ? "main" : "gallery", // Thumbnail = main, others = gallery
      }));

      console.log("Reordered images:");
      reorderedImages.forEach((img, i) =>
        console.log(`  [${i}] ID: ${img.id?.slice(-8)}, order: ${img.order}`)
      );

      updateImages(reorderedImages);

      // Update image types in the backend for existing images
      const existingImages = reorderedImages.filter(
        (img) => !img.isNew && img.id
      );

      if (existingImages.length > 0) {
        // Update images sequentially to avoid race conditions
        const updateImagesSequentially = async () => {
          try {
            for (let i = 0; i < existingImages.length; i++) {
              const img = existingImages[i];
              if (img.id) {
                const newType = i === 0 ? "main" : "gallery";
                await updateImageDetailsMutation.mutateAsync({
                  imageId: img.id,
                  data: {
                    order: i,
                    type: newType,
                  },
                });
                console.log(
                  `Updated image ${img.id} to type: ${newType}, order: ${i}`
                );
              }
            }
            toast.success("Thumbnail and image types updated");
          } catch (error) {
            console.error("Failed to update image details:", error);
            toast.error("Failed to update some image details");
          }
        };

        updateImagesSequentially();
      } else {
        toast.success("Thumbnail updated");
      }
    },
    [images, disabled, updateImages, updateImageDetailsMutation]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleUploadClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const getImageSrc = (image: VariantImage) => {
    if (image.preview) return image.preview;
    if (image.url) return image.url;
    return "";
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {images.length < maxFiles && (
        <div
          className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleUploadClick}
        >
          <Upload className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
          <p className="text-muted-foreground mb-1 text-sm">
            Drop variant images here or click to upload
          </p>
          <p className="text-muted-foreground text-xs">
            {images.length}/{maxFiles} images • PNG, JPG, WebP up to 10MB
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={disabled}
      />

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <Card key={image.id || index} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="group relative aspect-square bg-white">
                  <Image
                    fill
                    src={getImageSrc(image)}
                    alt={`Variant image ${index + 1}`}
                    className="h-full w-full object-contain"
                  />

                  {/* Overlay with controls */}
                  <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    {index > 0 && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => moveImage(index, "up")}
                        disabled={disabled}
                      >
                        <MoveUp className="h-3 w-3" />
                      </Button>
                    )}

                    {index < images.length - 1 && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => moveImage(index, "down")}
                        disabled={disabled}
                      >
                        <MoveDown className="h-3 w-3" />
                      </Button>
                    )}

                    {!image.isThumbnail && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setAsThumbnail(index)}
                        disabled={disabled}
                      >
                        <Star className="h-3 w-3" />
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeImage(index)}
                      disabled={disabled}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    {image.isThumbnail && (
                      <Badge variant="secondary" className="text-xs">
                        Thumbnail
                      </Badge>
                    )}
                    {image.type && (
                      <Badge
                        variant={image.type === "main" ? "default" : "outline"}
                        className="text-xs"
                      >
                        {image.type}
                      </Badge>
                    )}
                    {image.isNew && (
                      <Badge variant="outline" className="text-xs">
                        New
                      </Badge>
                    )}
                  </div>

                  <div className="absolute right-2 bottom-2">
                    <Badge variant="outline" className="text-xs">
                      {index + 1}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="text-muted-foreground py-8 text-center">
          <ImageIcon className="mx-auto mb-2 h-12 w-12" />
          <p className="text-sm">No variant images yet</p>
          <p className="text-xs">Add images to showcase this variant</p>
        </div>
      )}
    </div>
  );
}
