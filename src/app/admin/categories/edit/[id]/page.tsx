"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  useCategory,
  useCategories,
  useUpdateCategory,
} from "@/hooks/use-categories";
import { useAuth } from "@/hooks/useAuth";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  parent_id: z.string().optional().nullable(),
  description: z.string().optional(),
  order: z.coerce.number().int().min(0).optional(),
});

export default function EditCategoryPage() {
  // Ensure authentication
  useAuth({ redirectTo: "/login", requireAuth: true });

  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;

  // Use React Query hooks
  const {
    data: category,
    isLoading: isCategoryLoading,
    isError: isCategoryError,
    error: categoryError,
  } = useCategory(categoryId);

  const { data: categories = [], isLoading: isCategoriesLoading } =
    useCategories(false);

  const updateCategoryMutation = useUpdateCategory(categoryId);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      parent_id: "none",
      description: "",
      order: 0,
    },
  });

  // When category data is loaded, update the form
  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        slug: category.slug,
        parent_id: category.parent_id || "none",
        description: category.description || "",
        order: category.order,
      });
    }
  }, [category, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Format the data for the API
      const categoryData = {
        name: values.name,
        slug: values.slug || undefined,
        parent_id:
          values.parent_id === "none" ? null : values.parent_id || undefined,
        description: values.description || undefined,
        order: values.order !== undefined ? values.order : undefined,
      };

      // Use the mutation
      await updateCategoryMutation.mutateAsync(categoryData);

      // Redirect to categories list
      router.push("/admin/categories");
      router.refresh();
    } catch (error) {
      // Error is already handled in the mutation hook
      console.error("Error in category update flow:", error);
    }
  };

  // Show loading state
  if (isCategoryLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p>Loading category...</p>
      </div>
    );
  }

  // Show error state
  if (isCategoryError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <p className="text-red-500">
          Error loading category:{" "}
          {categoryError instanceof Error
            ? categoryError.message
            : "Unknown error"}
        </p>
        <Button onClick={() => router.push("/admin/categories")}>
          Return to Categories
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/categories">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Category</h1>
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
                        {!isCategoriesLoading &&
                          categories
                            .filter((cat) => cat.id !== categoryId) // Filter out the current category
                            .map((category) => (
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

              <div className="flex justify-end gap-4">
                <Link href="/admin/categories">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={updateCategoryMutation.isPending}
                >
                  {updateCategoryMutation.isPending
                    ? "Saving..."
                    : "Update Category"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
