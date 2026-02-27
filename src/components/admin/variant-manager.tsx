"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Edit, Image as ImageIcon, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { VariantImageManager, VariantImage } from "./variant-image-manager";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateProductVariant,
  useUpdateProductVariant,
  useDeleteProductVariant,
  useUploadVariantImages,
  useUpdateImageDetails,
} from "@/hooks/use-products";
// const isEditingRef = useRef(false);
import Image from "next/image";

export interface ProductVariant {
  id?: string;
  sku: string;
  price: number;
  compare_price?: number;
  color?: string;
  size?: string;
  stock: number;
  weight_kg?: number;
  delivery_time_days?: string;
  assemble_charges?: number;
  dimensions?: {
    width?: { cm: number; inches: number };
    depth?: { cm: number; inches: number };
    height?: { cm: number; inches: number };
    seat_width?: { cm: number; inches: number };
    seat_depth?: { cm: number; inches: number };
    seat_height?: { cm: number; inches: number };
    armrest_height?: { cm: number; inches: number };
  };
  material?: string;
  brand?: string;
  featured?: boolean;
  tags?: string;
  images?: VariantImage[];
}

interface VariantManagerProps {
  productId?: string; // Make productId optional for add page
  variants: ProductVariant[];
  onVariantsChange: () => void;
  disabled?: boolean;
}

export function VariantManager({
  productId,
  variants,
  onVariantsChange,
  disabled = false,
}: VariantManagerProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditingRef = useRef(false);

  // Query client for manual cache invalidation
  const queryClient = useQueryClient();

  // Mutation hooks - only create if productId exists
  const createVariantMutation = useCreateProductVariant(productId || "");
  const updateVariantMutation = useUpdateProductVariant();
  const deleteVariantMutation = useDeleteProductVariant();
  const uploadImagesMutation = useUploadVariantImages();
  const updateImageDetailsMutation = useUpdateImageDetails();
  const [newVariant, setNewVariant] = useState<ProductVariant>({
    sku: "",
    price: 0,
    compare_price: 0,
    color: "",
    size: "",
    stock: 0,
    weight_kg: 0,
    delivery_time_days: "",
    assemble_charges: 0,
    dimensions: {
      width: { cm: 0, inches: 0 },
      depth: { cm: 0, inches: 0 },
      height: { cm: 0, inches: 0 },
      seat_width: { cm: 0, inches: 0 },
      seat_depth: { cm: 0, inches: 0 },
      seat_height: { cm: 0, inches: 0 },
      armrest_height: { cm: 0, inches: 0 },
    },
    material: "",
    brand: "",
    featured: false,
    tags: "",
    images: [],
  });


  const addVariant = async () => {

    if (!productId) {
      toast.error("Product must be created first before adding variants");
      return;
    }

    if (newVariant.price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    if (newVariant.stock < 0) {
      toast.error("Stock cannot be negative");
      return;
    }

    // Check for duplicate SKU
    const isDuplicateSku = variants.some(
      (variant, index) =>
        variant.sku === newVariant.sku && index !== editingIndex
    );

    if (isDuplicateSku) {
      toast.error("SKU already exists");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingIndex !== null) {
        // Update existing variant
        const existingVariant = variants[editingIndex];
        if (!existingVariant.id) {
          toast.error("Cannot update variant without ID");
          return;
        }

        // Prepare update data, excluding zero/empty optional fields
        const updateData: Partial<ProductVariant> = {
          sku: newVariant.sku,
          price: newVariant.price,
          size: newVariant.size,
          color: newVariant.color,
          stock: newVariant.stock,
        };

        // Only include optional fields if they have meaningful values
        if (newVariant.compare_price && newVariant.compare_price > 0) {
          updateData.compare_price = newVariant.compare_price;
        }

        if (newVariant.weight_kg && newVariant.weight_kg > 0) {
          updateData.weight_kg = newVariant.weight_kg;
        }
        if (newVariant.delivery_time_days && newVariant.delivery_time_days.trim() !== "") {
          updateData.delivery_time_days = newVariant.delivery_time_days;
        }

        if (newVariant.assemble_charges && newVariant.assemble_charges > 0) {
          updateData.assemble_charges = newVariant.assemble_charges;
        }
        if (newVariant.material && newVariant.material.trim()) {
          updateData.material = newVariant.material;
        }

        if (newVariant.brand && newVariant.brand.trim()) {
          updateData.brand = newVariant.brand;
        }

        if (newVariant.tags && newVariant.tags.trim()) {
          updateData.tags = newVariant.tags;
        }

        if (newVariant.featured) {
          updateData.featured = newVariant.featured;
        }

        if (newVariant.dimensions) {
          updateData.dimensions = newVariant.dimensions;
        }

        await updateVariantMutation.mutateAsync({
          variantId: existingVariant.id,
          data: updateData,
        });

        // Update image order for existing images if they have been reordered
        console.log("newVariant.images before order check:");
        newVariant.images?.forEach((img, i) =>
          console.log(
            `  [${i}] ID: ${img.id?.slice(-8)}, order: ${img.order}, isNew: ${img.isNew}`
          )
        );

        const existingImages =
          newVariant.images?.filter((img) => !img.isNew && img.id) || [];
        if (existingImages.length > 0) {
          // Get original variant from the variants array to compare against database order
          const originalVariant = variants[editingIndex!];
          const originalImageOrder = new Map(
            originalVariant.images?.map((img) => [img.id, img.order]) || []
          );

          // Check if any image order has changed from the original database order
          const imageOrdersToUpdate = existingImages
            .map((img, index) => {
              const originalOrder = originalImageOrder.get(img.id);
              return {
                imageId: img.id!,
                order: index,
                hasChanged: originalOrder !== index,
                originalOrder,
                newOrder: index,
              };
            })
            .filter((item) => item.hasChanged);

          console.log("Order comparison details:");
          existingImages.forEach((img, index) => {
            const originalOrder = originalImageOrder.get(img.id);
            console.log(
              `  ID: ${img.id?.slice(-8)}, original: ${originalOrder}, new: ${index}, changed: ${originalOrder !== index}`
            );
          });

          console.log("Image order update check:", {
            existingImages: existingImages.map((img) => ({
              id: img.id,
              order: img.order,
            })),
            imageOrdersToUpdate,
          });

          // Update ALL images to ensure correct types (main for first, gallery for others)
          if (existingImages.length > 0) {
            console.log("📋 Current existingImages array before updates:");
            existingImages.forEach((img, index) => {
              console.log(
                `  [${index}] ID: ${img.id?.slice(-8)}, order: ${img.order}, type: ${img.type}, url: ${img.url?.slice(-20)}`
              );
            });

            console.log(
              "📊 Planned updates:",
              existingImages.map((img) => ({
                id: img.id?.slice(-8),
                currentOrder: img.order,
                newOrder: existingImages.indexOf(img),
                currentType: img.type,
                newType: existingImages.indexOf(img) === 0 ? "main" : "gallery",
              }))
            );

            // Update each image's order and type individually
            const updatePromises = existingImages.map(async (img, index) => {
              const imageId = img.id!;
              const order = index;
              const imageType = index === 0 ? "main" : "gallery";

              console.log(
                `Updating image ${imageId.slice(-8)} to order ${order}, type ${imageType}`
              );
              try {
                const result = await updateImageDetailsMutation.mutateAsync({
                  imageId,
                  data: { order, type: imageType },
                });
                console.log(
                  `✅ Successfully updated image ${imageId.slice(-8)} to order ${order}, type ${imageType}:`,
                  result
                );
                return result;
              } catch (error) {
                console.error(
                  `❌ Failed to update image ${imageId.slice(-8)}:`,
                  error
                );
                throw error;
              }
            });

            await Promise.all(updatePromises);
            console.log("🎉 All image order updates completed");


            await queryClient.invalidateQueries({ queryKey: ["products", productId] });

            // Notify parent component to refresh its data
            onVariantsChange();
          }
        }

        // Upload new images if any
        const newImages =
          newVariant.images?.filter((img) => img.isNew && img.file) || [];
        if (newImages.length > 0) {
          const files = newImages.map((img) => img.file!);
          // Determine type based on existing images
          const hasExistingImages = existingImages.length > 0;
          const imageType = hasExistingImages ? "gallery" : "main";

          console.log(
            `Uploading ${files.length} new images as type: ${imageType}`
          );
          await uploadImagesMutation.mutateAsync({
            variantId: existingVariant.id,
            files,
            type: imageType,
          });
        }

        setEditingIndex(null);
      } else {
        const sku = newVariant.sku.trim() || 
  `${productId.slice(-6)}-${newVariant.color || 'VAR'}-${newVariant.size || 'STD'}-${Date.now()}`.toUpperCase();
        // Create new variant - only send required fields for creation
        const createData = {
          sku: sku,
          price: newVariant.price,
          size: newVariant.size,
          color: newVariant.color,
          stock: newVariant.stock,
        };

        const createdVariant =
          await createVariantMutation.mutateAsync(createData);

        // After creation, update with optional fields if they have meaningful values
        if (createdVariant.id) {
          const updateData: Partial<ProductVariant> = {};
          let hasUpdates = false;

          if (newVariant.compare_price && newVariant.compare_price > 0) {
            updateData.compare_price = newVariant.compare_price;
            hasUpdates = true;
          }
          if (newVariant.weight_kg && newVariant.weight_kg > 0) {
            updateData.weight_kg = newVariant.weight_kg;
            hasUpdates = true;
          }
          if (newVariant.delivery_time_days && newVariant.delivery_time_days.trim() !== "") {
            updateData.delivery_time_days = newVariant.delivery_time_days;
            hasUpdates = true;
          }

          if (newVariant.assemble_charges && newVariant.assemble_charges > 0) {
            updateData.assemble_charges = newVariant.assemble_charges;
            hasUpdates = true;
          }
          if (newVariant.material && newVariant.material.trim()) {
            updateData.material = newVariant.material;
            hasUpdates = true;
          }
          if (newVariant.brand && newVariant.brand.trim()) {
            updateData.brand = newVariant.brand;
            hasUpdates = true;
          }
          if (newVariant.tags && newVariant.tags.trim()) {
            updateData.tags = newVariant.tags;
            hasUpdates = true;
          }
          if (newVariant.featured) {
            updateData.featured = newVariant.featured;
            hasUpdates = true;
          }
          if (newVariant.dimensions) {
            updateData.dimensions = newVariant.dimensions;
            hasUpdates = true;
          }

          // Update with optional fields if any exist
          if (hasUpdates) {
            await updateVariantMutation.mutateAsync({
              variantId: createdVariant.id,
              data: updateData,
            });
          }
        }

        // Upload images if any
        const newImages =
          newVariant.images?.filter((img) => img.isNew && img.file) || [];
        if (newImages.length > 0) {
          const files = newImages.map((img) => img.file!);
          // For new variants, first image should be main, others gallery
          const imageType = "main"; // First upload for new variant

          console.log(
            `Uploading ${files.length} images for new variant as type: ${imageType}`
          );
          await uploadImagesMutation.mutateAsync({
            variantId: createdVariant.id,
            files,
            type: imageType,
          });
        }
      }

      // Reset form
      setNewVariant({
        sku: "",
        price: 0,
        compare_price: 0,
        color: "",
        size: "",
        stock: 0,
        weight_kg: 0,
        delivery_time_days: "",
        assemble_charges: 0,
        dimensions: {
          width: { cm: 0, inches: 0 },
          depth: { cm: 0, inches: 0 },
          height: { cm: 0, inches: 0 },
          seat_width: { cm: 0, inches: 0 },
          seat_depth: { cm: 0, inches: 0 },
          seat_height: { cm: 0, inches: 0 },
          armrest_height: { cm: 0, inches: 0 },
        },
        material: "",
        brand: "",
        featured: false,
        tags: "",
        images: [],
      });

      // Refresh the variants list
      onVariantsChange();
    } catch (error) {
      console.error("Error saving variant:", error);
      toast.error("Failed to save variant");
    } finally {
      isEditingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const editVariant = (index: number) => {
    isEditingRef.current = true;
    const variant = variants[index];
    setNewVariant({
      ...variant,
      sku: variant.sku || "",
      price: variant.price || 0,
      compare_price: variant.compare_price || 0,
      color: variant.color || "",
      size: variant.size || "",
      stock: variant.stock || 0,
      weight_kg: variant.weight_kg || 0,
      delivery_time_days: variant.delivery_time_days || "",
      assemble_charges: variant.assemble_charges || 0,
      material: variant.material || "",
      brand: variant.brand || "",
      tags: variant.tags || "",
      featured: variant.featured || false,
      images: variant.images || [],
      dimensions: variant.dimensions || {
        width: { cm: 0, inches: 0 },
        depth: { cm: 0, inches: 0 },
        height: { cm: 0, inches: 0 },
        seat_width: { cm: 0, inches: 0 },
        seat_depth: { cm: 0, inches: 0 },
        seat_height: { cm: 0, inches: 0 },
        armrest_height: { cm: 0, inches: 0 },
      },
    });
    setEditingIndex(index);
  };

  const deleteVariant = async (index: number) => {
    const variant = variants[index];
    if (!variant.id) {
      toast.error("Cannot delete variant without ID");
      return;
    }

    try {
      await deleteVariantMutation.mutateAsync(variant.id);
      onVariantsChange();
    } catch (error) {
      console.error("Error deleting variant:", error);
      toast.error("Failed to delete variant");
    }
  };

  const cancelEdit = () => {
    isEditingRef.current = false;
    setEditingIndex(null);
    setNewVariant({
      sku: "",
      price: 0,
      compare_price: 0,
      color: "",
      size: "",
      stock: 0,
      weight_kg: 0,
      delivery_time_days: "",
      assemble_charges: 0,
      dimensions: {
        width: { cm: 0, inches: 0 },
        depth: { cm: 0, inches: 0 },
        height: { cm: 0, inches: 0 },
        seat_width: { cm: 0, inches: 0 },
        seat_depth: { cm: 0, inches: 0 },
        seat_height: { cm: 0, inches: 0 },
        armrest_height: { cm: 0, inches: 0 },
      },
      material: "",
      brand: "",
      featured: false,
      tags: "",
      images: [],
    });
  };

useEffect(() => {
  if (!isEditingRef.current) {
    cancelEdit();
  }
}, [variants]);


  const calculateDiscount = (price: number, comparePrice: number) => {
    if (!comparePrice || comparePrice <= price) return 0;
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Add/Edit Variant Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {editingIndex !== null ? "Edit Variant" : "Add New Variant"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Variant Details</TabsTrigger>
              <TabsTrigger value="images">
                <ImageIcon className="mr-2 h-4 w-4" />
                Images ({newVariant.images?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="text-sm font-medium">SKU *</label>
                  <Input
                    placeholder="Enter SKU"
                    value={newVariant.sku || ""}
                    onChange={(e) =>
                      setNewVariant({ ...newVariant, sku: e.target.value })
                    }
                    disabled={disabled}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Price *</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={newVariant.price || 0}
                    onChange={(e) =>
                      setNewVariant({
                        ...newVariant,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    disabled={disabled}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Compare Price</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={newVariant.compare_price || 0}
                    onChange={(e) =>
                      setNewVariant({
                        ...newVariant,
                        compare_price: parseFloat(e.target.value) || 0,
                      })
                    }
                    disabled={disabled}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Color</label>
                  <Input
                    placeholder="e.g., Blue, Red"
                    value={newVariant.color || ""}
                    onChange={(e) =>
                      setNewVariant({ ...newVariant, color: e.target.value })
                    }
                    disabled={disabled}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Size</label>
                  <Input
                    placeholder="e.g., Large, 3 Seater"
                    value={newVariant.size || ""}
                    onChange={(e) =>
                      setNewVariant({ ...newVariant, size: e.target.value })
                    }
                    disabled={disabled}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Stock *</label>
                  <Input
                    type="number"
                    placeholder="0"
                    min="0"
                    value={newVariant.stock || 0}
                    onChange={(e) =>
                      setNewVariant({
                        ...newVariant,
                        stock: parseInt(e.target.value) || 0,
                      })
                    }
                    disabled={disabled}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Weight (kg)</label>
                  <Input
                    type="number"
                    placeholder="0.0"
                    step="0.1"
                    min="0"
                    value={newVariant.weight_kg || 0}
                    onChange={(e) =>
                      setNewVariant({
                        ...newVariant,
                        weight_kg: parseFloat(e.target.value) || 0,
                      })
                    }
                    disabled={disabled}
                  />
                </div>       
                {/* Delivery Time (Days) */}
                <div>
                  <label className="text-sm font-medium">Delivery Time</label>
                  <Input
                    type="text"
                    placeholder="e.g. 3–5 days"
                    value={newVariant.delivery_time_days || ""}
                    onChange={(e) =>
                      setNewVariant({
                        ...newVariant,
                        delivery_time_days: e.target.value,
                      })
                    }
                    disabled={disabled}
                  />
                </div>


                {/* Assemble Charges */}
                <div>
                  <label className="text-sm font-medium">Assemble Charges ($)</label>
                  <Input
                    type="number"
                    placeholder="0.0"
                    step="0.1"
                    min="0"
                    value={newVariant.assemble_charges || 0}
                    onChange={(e) =>
                      setNewVariant({
                        ...newVariant,
                        assemble_charges: parseFloat(e.target.value) || 0,
                      })
                    }
                    disabled={disabled}
                  />
                </div>
              </div>

              {/* Dimensions Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Dimensions</h4>
                  <span className="text-muted-foreground text-xs">
                    Enter in cm (inches calculated automatically)
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium">Width (cm)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      min="0"
                      value={newVariant.dimensions?.width?.cm || 0}
                      onChange={(e) => {
                        const cm = parseFloat(e.target.value) || 0;
                        const inches = Math.round((cm / 2.54) * 10) / 10;
                        setNewVariant({
                          ...newVariant,
                          dimensions: {
                            ...newVariant.dimensions,
                            width: { cm, inches },
                          },
                        });
                      }}
                      disabled={disabled}
                    />
                    {newVariant.dimensions?.width?.inches ? (
                      <p className="text-muted-foreground mt-1 text-xs">
                        ≈ {newVariant.dimensions.width.inches}&quot;
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="text-sm font-medium">Depth (cm)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      min="0"
                      value={newVariant.dimensions?.depth?.cm || 0}
                      onChange={(e) => {
                        const cm = parseFloat(e.target.value) || 0;
                        const inches = Math.round((cm / 2.54) * 10) / 10;
                        setNewVariant({
                          ...newVariant,
                          dimensions: {
                            ...newVariant.dimensions,
                            depth: { cm, inches },
                          },
                        });
                      }}
                      disabled={disabled}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Height (cm)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      min="0"
                      value={newVariant.dimensions?.height?.cm || 0}
                      onChange={(e) => {
                        const cm = parseFloat(e.target.value) || 0;
                        const inches = Math.round((cm / 2.54) * 10) / 10;
                        setNewVariant({
                          ...newVariant,
                          dimensions: {
                            ...newVariant.dimensions,
                            height: { cm, inches },
                          },
                        });
                      }}
                      disabled={disabled}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Seat Width (cm)
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      min="0"
                      value={newVariant.dimensions?.seat_width?.cm || 0}
                      onChange={(e) => {
                        const cm = parseFloat(e.target.value) || 0;
                        const inches = Math.round((cm / 2.54) * 10) / 10;
                        setNewVariant({
                          ...newVariant,
                          dimensions: {
                            ...newVariant.dimensions,
                            seat_width: { cm, inches },
                          },
                        });
                      }}
                      disabled={disabled}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Seat Depth (cm)
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      min="0"
                      value={newVariant.dimensions?.seat_depth?.cm || 0}
                      onChange={(e) => {
                        const cm = parseFloat(e.target.value) || 0;
                        const inches = Math.round((cm / 2.54) * 10) / 10;
                        setNewVariant({
                          ...newVariant,
                          dimensions: {
                            ...newVariant.dimensions,
                            seat_depth: { cm, inches },
                          },
                        });
                      }}
                      disabled={disabled}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Seat Height (cm)
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      min="0"
                      value={newVariant.dimensions?.seat_height?.cm || 0}
                      onChange={(e) => {
                        const cm = parseFloat(e.target.value) || 0;
                        const inches = Math.round((cm / 2.54) * 10) / 10;
                        setNewVariant({
                          ...newVariant,
                          dimensions: {
                            ...newVariant.dimensions,
                            seat_height: { cm, inches },
                          },
                        });
                      }}
                      disabled={disabled}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Armrest Height (cm)
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      min="0"
                      value={newVariant.dimensions?.armrest_height?.cm || 0}
                      onChange={(e) => {
                        const cm = parseFloat(e.target.value) || 0;
                        const inches = Math.round((cm / 2.54) * 10) / 10;
                        setNewVariant({
                          ...newVariant,
                          dimensions: {
                            ...newVariant.dimensions,
                            armrest_height: { cm, inches },
                          },
                        });
                      }}
                      disabled={disabled}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Material</label>
                  <Input
                    placeholder="e.g., Premium Fabric"
                    value={newVariant.material || ""}
                    onChange={(e) =>
                      setNewVariant({ ...newVariant, material: e.target.value })
                    }
                    disabled={disabled}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Brand</label>
                  <Input
                    placeholder="e.g., SofaDeal"
                    value={newVariant.brand || ""}
                    onChange={(e) =>
                      setNewVariant({ ...newVariant, brand: e.target.value })
                    }
                    disabled={disabled}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Tags</label>
                <Input
                  placeholder="e.g., modern,comfortable,premium"
                  value={newVariant.tags || ""}
                  onChange={(e) =>
                    setNewVariant({ ...newVariant, tags: e.target.value })
                  }
                  disabled={disabled}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={newVariant.featured}
                  onCheckedChange={(checked) =>
                    setNewVariant({ ...newVariant, featured: !!checked })
                  }
                  disabled={disabled}
                />
                <label className="text-sm font-medium">Featured Variant</label>
              </div>
            </TabsContent>

            <TabsContent value="images" className="space-y-4">
              <VariantImageManager
                variantId={newVariant.id || newVariant.sku}
                existingImages={newVariant.images || []}
                onImagesChange={(images) => {
                  console.log("Images changed in VariantImageManager:");
                  images.forEach((img, i) =>
                    console.log(
                      `  [${i}] ID: ${img.id?.slice(-8)}, order: ${img.order}`
                    )
                  );
                  setNewVariant((prev) => ({ ...prev, images }));
                }}
                maxFiles={5}
                disabled={disabled}
              />
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 border-t pt-4">
            <Button onClick={addVariant} disabled={disabled || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingIndex !== null ? "Updating..." : "Adding..."}
                </>
              ) : (
                <>
                  {editingIndex !== null ? "Update Variant" : "Add Variant"}
                  <Save className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            {editingIndex !== null && (
              <Button
                variant="outline"
                onClick={cancelEdit}
                disabled={disabled || isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Existing Variants */}
      {variants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Product Variants ({variants.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div key={variant.id || variant.sku || index} className="bg-muted/50 rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      {/* Variant Image Preview */}
                      <div className="shrink-0">
                        {variant.images && variant.images.length > 0 ? (
                          <div className="relative h-16 w-16 overflow-hidden rounded-md border bg-white">
                            <Image
                              fill
                              src={
                                variant.images.find(
                                  (img) => img.type === "main"
                                )?.url ||
                                variant.images.find(
                                  (img) => img.type === "main"
                                )?.preview ||
                                variant.images[0]?.url ||
                                variant.images[0]?.preview ||
                                `placeholder.jpg`
                              }
                              alt={`${variant.sku} preview`}
                              className="h-full w-full object-contain"
                            />
                            {variant.images.length > 1 && (
                              <div className="absolute right-0 bottom-0 rounded-tl bg-black/70 px-1 text-xs text-white">
                                +{variant.images.length - 1}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="border-muted-foreground/25 flex h-16 w-16 items-center justify-center rounded-md border border-dashed">
                            <ImageIcon className="text-muted-foreground/50 h-6 w-6" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{variant.sku}</Badge>
                          {variant.featured && (
                            <Badge variant="default">Featured</Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                          <div>
                            <span className="font-medium">Price:</span> £
                            {variant.price}
                            {variant.compare_price &&
                              variant.compare_price > variant.price && (
                                <span className="text-muted-foreground ml-2 line-through">
                                  £{variant.compare_price}
                                </span>
                              )}
                            {variant.compare_price &&
                              variant.compare_price > variant.price && (
                                <Badge variant="destructive" className="ml-2">
                                  {calculateDiscount(
                                    variant.price,
                                    variant.compare_price
                                  )}
                                  % OFF
                                </Badge>
                              )}
                          </div>
                          <div>
                            <span className="font-medium">Stock:</span>{" "}
                            {variant.stock}
                          </div>
                          {variant.color && (
                            <div>
                              <span className="font-medium">Color:</span>{" "}
                              {variant.color}
                            </div>
                          )}
                          {variant.size && (
                            <div>
                              <span className="font-medium">Size:</span>{" "}
                              {variant.size}
                            </div>
                          )}
                          {variant.weight_kg && (
                            <div>
                              <span className="font-medium">Weight:</span>{" "}
                              {variant.weight_kg}kg
                            </div>
                          )}
                          {variant.delivery_time_days && (
                            <div>
                              <span className="font-medium">Delivery:</span>{" "}
                              {variant.delivery_time_days}
                            </div>
                          )}
                          {variant.assemble_charges && (
                            <div>
                              <span className="font-medium">Assemble Charges:</span>{" "}
                              £{variant.assemble_charges}
                            </div>
                          )}
                          {variant.material && (
                            <div>
                              <span className="font-medium">Material:</span>{" "}
                              {variant.material}
                            </div>
                          )}
                          {variant.brand && (
                            <div>
                              <span className="font-medium">Brand:</span>{" "}
                              {variant.brand}
                            </div>
                          )}
                          {variant.tags && (
                            <div className="col-span-2">
                              <span className="font-medium">Tags:</span>{" "}
                              {variant.tags}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editVariant(index)}
                        disabled={disabled}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteVariant(index)}
                        disabled={disabled}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
