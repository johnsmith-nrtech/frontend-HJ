"use client";

import { useEffect, useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Eye } from "lucide-react";
import Link from "next/link";
import { useCategories } from "@/hooks/use-categories";
import { useProduct, useUpdateProduct } from "@/hooks/use-products";
import { ProductImageManager } from "@/components/admin/product-image-manager";
import {
  VariantManager,
  ProductVariant as VariantManagerVariant,
} from "@/components/admin/variant-manager";
import { ProductVariant as ApiProductVariant } from "@/lib/api/products";
import { VariantImage } from "@/components/admin/variant-image-manager";
import { toast } from "sonner";

const basicInfoSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  category_id: z.string().optional(),
  base_price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  is_visible: z.boolean().optional(),
  warranty_info: z.string().optional(),
  care_instructions: z.string().optional(),
  assembly_required: z.boolean().optional(),
  assembly_instructions: z.string().optional(),
  delivery_info: z
    .object({
      min_days: z.coerce.number().optional(),
      max_days: z.coerce.number().optional(),
      text: z.string().optional(),
      shipping_method: z.string().optional(),
      free_shipping_threshold: z.coerce.number().optional(),
    })
    .optional(),
});

type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;

// Convert API ProductVariant to VariantManager ProductVariant
const convertApiVariantToManagerVariant = (
  apiVariant: ApiProductVariant,
  productImages: {
    id: string;
    variant_id: string | null;
    url?: string;
    order?: number;
    type?: string;
    product_id?: string;
  }[] = []
): VariantManagerVariant => {
  // Filter images that belong to this specific variant
  const variantImages = productImages.filter(
    (img) => img.variant_id === apiVariant.id
  );

  // Convert ProductImage[] to VariantImage[] format
  const convertedImages: VariantImage[] = variantImages.map((img, index) => ({
    id: img.id,
    url: img.url,
    order: img.order || index,
    isThumbnail: img.type === "main" || index === 0,
    isNew: false,
    type: img.type,
    product_id: img.product_id,
    variant_id: img.variant_id || undefined,
  }));

  return {
    id: apiVariant.id,
    sku: apiVariant.sku,
    price: apiVariant.price,
    compare_price: apiVariant.compare_price,
    color: apiVariant.color,
    size: apiVariant.size,
    stock: apiVariant.stock,
    weight_kg: apiVariant.weight_kg,
    delivery_time_days: apiVariant.delivery_time_days,
    assemble_charges: apiVariant.assemble_charges,
    dimensions: apiVariant.dimensions,
    material: apiVariant.material,
    brand: apiVariant.brand,
    featured: apiVariant.featured,
    tags: apiVariant.tags,
    images: convertedImages,
  };
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [activeTab, setActiveTab] = useState("basic-info");

  // Use React Query hooks
  const {
    data: product,
    isLoading: isProductLoading,
    isError: isProductError,
    error: productError,
    refetch: refetchProduct,
  } = useProduct(productId, {
    includeImages: true,
    includeCategory: true,
    includeVariants: true,
  });

  const { data: categories = [], isLoading: isCategoriesLoading } =
    useCategories(false);

  const updateProductMutation = useUpdateProduct(productId);

  const form = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: "",
      description: "",
      category_id: "",
      base_price: 0,
      is_visible: true,
      warranty_info: "",
      care_instructions: "",
      assembly_required: false,
      assembly_instructions: "",
      delivery_info: {
        min_days: 0,
        max_days: 0,
        text: "",
        shipping_method: "",
        free_shipping_threshold: 0,
      },
    },
  });

  // When product data is loaded, update the form
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description || "",
        category_id: product.category_id || "",
        base_price: product.base_price,
        is_visible: product.is_visible ?? true,
        warranty_info: product.warranty_info || "",
        care_instructions: product.care_instructions || "",
        assembly_required: product.assembly_required || false,
        assembly_instructions: product.assembly_instructions || "",
        delivery_info: product.delivery_info || {
          min_days: 0,
          max_days: 0,
          text: "",
          shipping_method: "",
          free_shipping_threshold: 0,
        },
      });
    }
  }, [product, form]);

  const onSubmitBasicInfo = async (values: BasicInfoFormValues) => {
    try {
      // Format the data for the API
      const productData = {
        name: values.name,
        description: values.description || undefined,
        category_id: values.category_id || undefined,
        base_price: values.base_price,
        is_visible: values.is_visible,
        warranty_info: values.warranty_info || undefined,
        care_instructions: values.care_instructions || undefined,
        assembly_required: values.assembly_required,
        assembly_instructions: values.assembly_instructions || undefined,
        delivery_info: values.delivery_info,
      };

      // Use the mutation
      await updateProductMutation.mutateAsync(productData);

      toast.success("Product updated successfully");

      // Refetch product data to get updated information
      refetchProduct();
    } catch (error) {
      console.error("Error in product update flow:", error);
      toast.error("Failed to update product");
    }
  };

  // Show loading state
  if (isProductLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p>Loading product...</p>
      </div>
    );
  }

  // Show error state
  if (isProductError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <p className="text-red-500">
          Error loading product:{" "}
          {productError instanceof Error
            ? productError.message
            : "Unknown error"}
        </p>
        <Button onClick={() => router.push("/admin/products")}>
          Return to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Product</h1>
            <p className="text-muted-foreground">
              Update product information, images, and variants
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/products/${productId}`}>
            <Button variant="outline" size="sm">
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Button>
          </Link>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
        </TabsList>

        <TabsContent value="basic-info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmitBasicInfo)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter product name"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            A descriptive name for the product.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="base_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Base Price *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              step="0.01"
                              min="0"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            The base price of the product in GBP.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="is_visible"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Product Visibility
                            </FormLabel>
                            <FormDescription>
                              Make this product visible to customers on the
                              website.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {!isCategoriesLoading &&
                                categories.map((category) => (
                                  <SelectItem
                                    key={category.id}
                                    value={category.id}
                                  >
                                    {category.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select the product category.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter product description"
                            className="min-h-32 resize-y"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          A detailed description of the product.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="care_instructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Care Instructions</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="How to care for this product..."
                              className="min-h-24 resize-y"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Instructions for product care and maintenance.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="warranty_info"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Warranty Information</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Warranty details..."
                              className="min-h-24 resize-y"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Warranty terms and conditions.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Delivery Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="delivery_info.min_days"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Min Days</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="3" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="delivery_info.max_days"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Days</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="7" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="delivery_info.text"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Text</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="3 To 4 Days Delivery"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button
                      type="submit"
                      disabled={updateProductMutation.isPending}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {updateProductMutation.isPending
                        ? "Saving..."
                        : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <p className="text-muted-foreground text-sm">
                Manage product images. You can upload new images, change image
                types, and reorder existing images.
              </p>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex items-start gap-2">
                  <div className="mt-1 h-3 w-3 rounded-full bg-green-500"></div>
                  <div>
                    <p className="text-sm font-medium">Gallery</p>
                    <p className="text-muted-foreground text-xs">
                      Standard product photos
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 h-3 w-3 rounded-full bg-blue-500"></div>
                  <div>
                    <p className="text-sm font-medium">Main</p>
                    <p className="text-muted-foreground text-xs">
                      Primary product image
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 h-3 w-3 rounded-full bg-purple-500"></div>
                  <div>
                    <p className="text-sm font-medium">360°</p>
                    <p className="text-muted-foreground text-xs">
                      360-degree view images
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {product && (
                <ProductImageManager
                  productId={productId}
                  existingImages={(product.images || []).map((img) => ({
                    id: img.id,
                    url: img.url,
                    order: img.order,
                    type: (img.type as "gallery" | "main" | "360") || "gallery",
                    isThumbnail: img.type === "main" || img.order === 0,
                  }))}
                  onImagesChange={() => {
                    // Refetch product data when images change
                    refetchProduct();
                  }}
                  allowedTypes={["gallery", "main", "360"]}
                  defaultType="gallery"
                  maxFiles={20}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variants" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Variants</CardTitle>
            </CardHeader>
            <CardContent>
              {product && (
                <VariantManager
                  productId={productId}
                  variants={(product.variants || []).map((variant) =>
                    convertApiVariantToManagerVariant(
                      variant,
                      product.images || []
                    )
                  )}
                  onVariantsChange={() => {
                    // Refetch product data when variants change
                    refetchProduct();
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
