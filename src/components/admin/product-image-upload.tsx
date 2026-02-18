"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Image from "next/image";

interface ProductImageUploadProps {
  productId: string;
  onSuccess?: (data: {
    id: string;
    url: string;
    type: string;
    order: number;
  }) => void;
  apiUrl?: string;
}

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' text-anchor='middle' dominant-baseline='middle' fill='%23888888'%3EImage not found%3C/text%3E%3C/svg%3E";

export default function ProductImageUpload({
  productId,
  onSuccess,
  apiUrl = "https://sofa-deal.vercel.app/products/admin/products",
}: ProductImageUploadProps) {
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageType, setImageType] = useState<string>("main");
  const [order, setOrder] = useState<string>("1");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);

    // Create preview URL for the selected file
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    } else {
      setPreviewUrl("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate inputs
      if (uploadMethod === "file" && !imageFile) {
        toast.error("Please select an image file");
        return;
      }

      if (uploadMethod === "url" && !imageUrl) {
        toast.error("Please enter an image URL");
        return;
      }

      if (!imageType) {
        toast.error("Please select an image type");
        return;
      }

      const endpoint = `${apiUrl}/${productId}/images`;
      let response;

      if (uploadMethod === "file") {
        // File upload (multipart form)
        const formData = new FormData();
        formData.append("imageFile", imageFile as File);
        formData.append("type", imageType);
        formData.append("order", order);

        response = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });
      } else {
        // URL upload (JSON)
        response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: imageUrl,
            type: imageType,
            order: parseInt(order),
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload image");
      }

      const data = await response.json();
      toast.success("Image uploaded successfully");

      // Reset form
      setImageFile(null);
      setImageUrl("");
      setPreviewUrl("");

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(data);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error uploading image"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">Upload Product Image</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Upload Method Selection */}
        <RadioGroup
          value={uploadMethod}
          onValueChange={(value) => setUploadMethod(value as "file" | "url")}
          className="flex flex-col space-y-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="file" id="file-option" />
            <Label htmlFor="file-option">Upload File</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="url" id="url-option" />
            <Label htmlFor="url-option">Provide URL</Label>
          </div>
        </RadioGroup>

        {/* File Upload Input */}
        {uploadMethod === "file" && (
          <div className="space-y-2">
            <Label htmlFor="image-file">Choose Image File</Label>
            <Input
              id="image-file"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {previewUrl && (
              <div className="mt-2">
                <p className="text-muted-foreground mb-1 text-sm">Preview:</p>

                <Image
                  fill
                  src={previewUrl}
                  alt="Preview"
                  className="h-40 w-40 rounded-md border object-cover"
                />
              </div>
            )}
          </div>
        )}

        {/* URL Input */}
        {uploadMethod === "url" && (
          <div className="space-y-2">
            <Label htmlFor="image-url">Image URL</Label>
            <Input
              id="image-url"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            {imageUrl && (
              <div className="mt-2">
                <p className="text-muted-foreground mb-1 text-sm">Preview:</p>

                <Image
                  fill
                  src={imageUrl}
                  alt="Preview"
                  className="h-40 w-40 rounded-md border object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = PLACEHOLDER_IMAGE;
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Image Type */}
        <div className="space-y-2">
          <Label htmlFor="image-type">Image Type</Label>
          <Select value={imageType} onValueChange={setImageType}>
            <SelectTrigger id="image-type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="main">Main</SelectItem>
              <SelectItem value="gallery">Gallery</SelectItem>
              <SelectItem value="360">360 View</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Order */}
        <div className="space-y-2">
          <Label htmlFor="image-order">Display Order</Label>
          <Input
            id="image-order"
            type="number"
            min="1"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
          />
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Uploading..." : "Upload Image"}
        </Button>
      </form>
    </div>
  );
}
