"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Category } from "@/lib/api/categories";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ImagePlus, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  useCategories,
  useCreateCategory,
  useUploadCategoryImage,
} from "@/hooks/use-categories";
import { useAuth } from "@/hooks/useAuth";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  parent_id: z.string().optional().nullable(),
  description: z.string().optional(),
  order: z.coerce.number().int().min(0).optional(),
  featured: z.boolean().optional(),
  is_bed: z.boolean().optional(),
});

export default function AddCategoryPage() {
  useAuth({ redirectTo: "/login", requireAuth: true });

  const router = useRouter();

  const { data: categories = [], isLoading: isLoadingCategories } =
    useCategories(false);
  const createCategoryMutation = useCreateCategory();
  const uploadImageMutation = useUploadCategoryImage();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      parent_id: "none",
      description: "",
      order: 0,
      featured: false,
      is_bed: false,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const categoryData = {
        name: values.name,
        slug: values.slug || undefined,
        parent_id: values.parent_id === "none" ? null : values.parent_id || undefined,
        description: values.description || undefined,
        order: values.order || undefined,
        featured: values.featured || false,
        is_bed: values.is_bed || false,
      };

      const newCategory = await createCategoryMutation.mutateAsync(categoryData);

      // Category needs an id before an image can be attached to it
      if (imageFile) {
        await uploadImageMutation.mutateAsync({
          id: newCategory.id,
          file: imageFile,
        });
      }

      router.push("/admin/categories");
      router.refresh();
    } catch (error) {
      console.error("Error in category creation flow:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/categories">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Add New Category</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Category name" {...field} />
                    </FormControl>
                    <FormDescription>
                      A descriptive name for the category.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="category-slug" {...field} />
                    </FormControl>
                    <FormDescription>
                      URL-friendly identifier (auto-generated if not provided).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parent_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent category (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">
                          None (Top-level category)
                        </SelectItem>
                        {!isLoadingCategories &&
                          categories.map((category: Category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select a parent category to create a hierarchical
                      structure.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter category description"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A brief description of the category.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormDescription>
                      Determines the display order of the category (lower
                      numbers appear first).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Category Image</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-4">
                    {imagePreview ? (
                      <div className="relative h-24 w-24 overflow-hidden rounded-md border">
                        <Image
                          src={imagePreview}
                          alt="Category preview"
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={clearImage}
                          className="absolute right-1 top-1 rounded-full bg-black/60 p-1"
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed text-muted-foreground hover:bg-gray-50">
                        <ImagePlus className="h-5 w-5" />
                        <span className="mt-1 text-xs">Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    )}
                  </div>
                </FormControl>
                <FormDescription>
                  Shown on the category page and, if this category is
                  featured, on the homepage featured categories section.
                </FormDescription>
              </FormItem>

              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Featured</FormLabel>
                      <FormDescription>
                        Show this category in the homepage featured
                        categories carousel.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_bed"
                render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Bed Category</FormLabel>
                    <FormDescription>
                      Show this category on the "Beds & More" page.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Link href="/admin/categories">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={
                    createCategoryMutation.isPending ||
                    uploadImageMutation.isPending
                  }
                >
                  {createCategoryMutation.isPending
                    ? "Creating..."
                    : uploadImageMutation.isPending
                    ? "Uploading image..."
                    : "Create Category"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}