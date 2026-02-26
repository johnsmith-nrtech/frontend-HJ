"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCategories } from "@/hooks/use-categories";
import { useCreateProduct, useUploadProductImages } from "@/hooks/use-products";
import { createProductVariant } from "@/lib/api/products";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  EnhancedImageUpload,
  ImageFile,
} from "@/components/admin/enhanced-image-upload";
import {
  VariantManager,
  ProductVariant,
} from "@/components/admin/variant-manager";
// import { de } from "zod/v4/locales";

// Enhanced schema with all e-commerce fields
const formSchema = z.object({
  // Basic Product Information
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  category_id: z.string().optional(),
  base_price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  discount_offer: z.coerce.number().min(0, "Discount cannot be negative").optional(),
  is_visible: z.boolean().optional(),

  // Delivery Information
  delivery_min_days: z.coerce
    .number()
    .min(1, "Must be at least 1 day")
    .optional(),
  delivery_max_days: z.coerce
    .number()
    .min(1, "Must be at least 1 day")
    .optional(),
  delivery_text: z.string().optional(),
  shipping_method: z.string().optional(),
  free_shipping_threshold: z.coerce
    .number()
    .min(0, "Must be positive")
    .optional(),

  // Product Care & Assembly
  warranty_info: z.string().optional(),
  care_instructions: z.string().optional(),
  assembly_required: z.boolean().optional(),
  assembly_instructions: z.string().optional(),

  // Default Variant Information
  default_sku: z.string().optional(),
  default_color: z.string().optional(),
  default_size: z.string().optional(),
  initial_stock: z.coerce
    .number()
    .int("Must be whole number")
    .min(0, "Cannot be negative")
    .optional(),
  compare_price: z.coerce.number().min(0, "Must be positive").optional(),
  weight_kg: z.coerce.number().min(0, "Must be positive").optional(),
  delivery_time_days: z.string().optional(),
  assemble_charges: z.coerce.number().min(0, "Must be positive").optional(),

  // Dimensions
  width_cm: z.coerce.number().min(0, "Must be positive").optional(),
  depth_cm: z.coerce.number().min(0, "Must be positive").optional(),
  height_cm: z.coerce.number().min(0, "Must be positive").optional(),
  seat_width_cm: z.coerce.number().min(0, "Must be positive").optional(),
  seat_depth_cm: z.coerce.number().min(0, "Must be positive").optional(),
  seat_height_cm: z.coerce.number().min(0, "Must be positive").optional(),
  bed_width_cm: z.coerce.number().min(0, "Must be positive").optional(),
  bed_length_cm: z.coerce.number().min(0, "Must be positive").optional(),

  // Payment Options
  klarna_enabled: z.boolean().optional(),
  klarna_installments: z.coerce
    .number()
    .min(1, "Must be at least 1")
    .optional(),
  klarna_description: z.string().optional(),

  // Variant Details
  tags: z.string().optional(),
  material: z.string().optional(),
  brand: z.string().optional(),
  featured: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AddProductPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("basic");
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [additionalVariants, setAdditionalVariants] = useState<
    ProductVariant[]
  >([]);

  const {
    isAuthenticated,
    loading: authLoading,
    getToken,
  } = useAuth({
    redirectTo: "/login",
    requireAuth: true,
  });

  const { data: categories = [], isLoading: isLoadingCategories } =
    useCategories(false);
  const createProductMutation = useCreateProduct();
  const uploadImagesMutation = useUploadProductImages();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category_id: "",
      base_price: 0,
      discount_offer: 0,
      is_visible: true,
      delivery_min_days: 3,
      delivery_max_days: 7,
      delivery_text: "",
      shipping_method: "standard",
      free_shipping_threshold: 500,
      warranty_info: "",
      care_instructions: "",
      assembly_required: false,
      assembly_instructions: "",
      default_sku: "",
      default_color: "",
      default_size: "",
      initial_stock: 0,
      compare_price: 0,
      weight_kg: 0,
      delivery_time_days: "",
      assemble_charges: 0,
      width_cm: 0,
      depth_cm: 0,
      height_cm: 0,
      seat_width_cm: 0,
      seat_depth_cm: 0,
      seat_height_cm: 0,
      bed_width_cm: 0,
      bed_length_cm: 0,
      klarna_enabled: false,
      klarna_installments: 3,
      klarna_description: "",
      tags: "",
      material: "",
      brand: "",
      featured: false,
    },
  });

  // Auto-calculate inches from cm
  const calculateInches = (cm: number) => {
    return Math.round((cm / 2.54) * 100) / 100;
  };

  const onSubmit = async (values: FormData) => {
    try {
      if (!isAuthenticated) {
        toast.error("Please log in to create a product");
        router.push("/login");
        return;
      }

      const token = await getToken();
      if (!token) {
        toast.error("Authentication token not available");
        return;
      }

      // Prepare dimensions object
      const dimensions = {
        width: values.width_cm
          ? { cm: values.width_cm, inches: calculateInches(values.width_cm) }
          : undefined,
        depth: values.depth_cm
          ? { cm: values.depth_cm, inches: calculateInches(values.depth_cm) }
          : undefined,
        height: values.height_cm
          ? { cm: values.height_cm, inches: calculateInches(values.height_cm) }
          : undefined,
        seat_width: values.seat_width_cm
          ? {
              cm: values.seat_width_cm,
              inches: calculateInches(values.seat_width_cm),
            }
          : undefined,
        seat_depth: values.seat_depth_cm
          ? {
              cm: values.seat_depth_cm,
              inches: calculateInches(values.seat_depth_cm),
            }
          : undefined,
        seat_height: values.seat_height_cm
          ? {
              cm: values.seat_height_cm,
              inches: calculateInches(values.seat_height_cm),
            }
          : undefined,
        bed_width: values.bed_width_cm
          ? {
              cm: values.bed_width_cm,
              inches: calculateInches(values.bed_width_cm),
            }
          : undefined,
        bed_length: values.bed_length_cm
          ? {
              cm: values.bed_length_cm,
              inches: calculateInches(values.bed_length_cm),
            }
          : undefined,
      };

      // Prepare payment options
      const payment_options = [];
      if (
        values.klarna_enabled &&
        values.klarna_installments &&
        values.base_price
      ) {
        const amount_per_installment =
          values.base_price / values.klarna_installments;
        payment_options.push({
          provider: "klarna",
          type: "installment",
          installments: values.klarna_installments,
          amount_per_installment:
            Math.round(amount_per_installment * 100) / 100,
          total_amount: values.base_price,
          description:
            values.klarna_description ||
            `Make ${values.klarna_installments} Payments Of $${amount_per_installment.toFixed(2)}`,
        });
      }

      // Prepare the product data according to API specification
      const productData = {
        // Basic product information
        name: values.name,
        description: values.description || undefined,
        category_id: values.category_id || undefined,
        base_price: Number(values.base_price),
        discount_offer: Number(values.discount_offer) || 0,
        is_visible: values.is_visible ?? true,

        // Delivery information
        delivery_info:
          values.delivery_min_days ||
          values.delivery_max_days ||
          values.delivery_text
            ? {
                min_days: values.delivery_min_days,
                max_days: values.delivery_max_days,
                text: values.delivery_text,
                shipping_method: values.shipping_method,
                free_shipping_threshold: values.free_shipping_threshold,
              }
            : undefined,

        // Product care & assembly
        warranty_info: values.warranty_info || undefined,
        care_instructions: values.care_instructions || undefined,
        assembly_required: values.assembly_required || false,
        assembly_instructions: values.assembly_instructions || undefined,

        // Default variant fields
        default_color: values.default_color || undefined,
        default_size: values.default_size || undefined,
        initial_stock: Number(values.initial_stock) || 0,
        default_sku: values.default_sku || undefined,
        compare_price: values.compare_price
          ? Number(values.compare_price)
          : undefined,
        weight_kg: values.weight_kg ? Number(values.weight_kg) : undefined,
        delivery_time_days: values.delivery_time_days || undefined,
        assemble_charges: values.assemble_charges,
        dimensions: Object.keys(dimensions).some(
          (key) => dimensions[key as keyof typeof dimensions]
        )
          ? dimensions
          : undefined,
        payment_options: payment_options.length ? payment_options : undefined,
        tags: values.tags || undefined,
        material: values.material || undefined,
        brand: values.brand || undefined,
        featured: Boolean(values.featured),
      };

      // Create the product
      const createdProduct =
        await createProductMutation.mutateAsync(productData);

      // Upload images if any were selected, grouped by type
      if (imageFiles.length > 0) {
        try {
          console.log("Starting image upload for product:", createdProduct.id);
          console.log(
            "Image files to upload:",
            imageFiles.map((img) => ({
              name: img.file.name,
              type: img.type,
              size: img.file.size,
              order: img.order,
            }))
          );

          // Group images by type
          const imagesByType = imageFiles.reduce(
            (acc, img) => {
              if (!acc[img.type]) {
                acc[img.type] = [];
              }
              acc[img.type].push(img);
              return acc;
            },
            {} as Record<string, typeof imageFiles>
          );

          console.log("Images grouped by type:", Object.keys(imagesByType));

          // Upload each type separately with better error handling
          const uploadPromises = Object.entries(imagesByType).map(
            async ([type, images]) => {
              try {
                const files = images.map((img) => img.file);
                const startOrder = images[0]?.order || 0;

                console.log(
                  `Uploading ${files.length} images of type "${type}" with start order ${startOrder}`
                );

                const result = await uploadImagesMutation.mutateAsync({
                  productId: createdProduct.id,
                  files: files,
                  type: type,
                  order: startOrder,
                });

                console.log(`Successfully uploaded ${type} images:`, result);
                return result;
              } catch (error) {
                console.error(`Failed to upload ${type} images:`, error);
                throw new Error(
                  `Failed to upload ${type} images: ${error instanceof Error ? error.message : "Unknown error"}`
                );
              }
            }
          );

          await Promise.all(uploadPromises);
          console.log("All images uploaded successfully");
        } catch (imageError) {
          console.error("Error uploading images:", imageError);
          toast.error(
            `Image upload failed: ${imageError instanceof Error ? imageError.message : "Unknown error"}`
          );
        }
      }

      // Create additional variants if any were added
      if (additionalVariants.length > 0) {
        try {
          const variantPromises = additionalVariants.map((variant) =>
            createProductVariant(createdProduct.id, {
              sku: variant.sku,
              color: variant.color,
              size: variant.size,
              price: variant.price,
              stock: variant.stock,
            })
          );

          await Promise.all(variantPromises);
          toast.success(
            `Product created successfully with ${additionalVariants.length} additional variants!`
          );
        } catch (variantError) {
          console.error("Error creating variants:", variantError);
          toast.success(
            "Product created successfully, but some variants failed to create"
          );
        }
      } else {
        const successMessage =
          imageFiles.length > 0
            ? "Product and images created successfully!"
            : "Product created successfully!";
        toast.success(successMessage);
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Error in product creation flow:", error);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 pt-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Add New Product</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="delivery">Delivery & Care</TabsTrigger>
              <TabsTrigger value="variant">Default Variant</TabsTrigger>
              <TabsTrigger value="dimensions">Dimensions & Payment</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="additional">Additional Variants</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Product Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
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
                      name="discount_offer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Offer (%) *</FormLabel>
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
                            The discount offer percentage for the product.
                          </FormDescription>
                          <FormMessage />
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
                              {!isLoadingCategories &&
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

                    <FormField
                      control={form.control}
                      name="is_visible"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Visible</FormLabel>
                            <FormDescription>
                              Whether this product should be visible to
                              customers.
                            </FormDescription>
                          </div>
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
                </CardContent>
              </Card>
            </TabsContent>

            {/* Delivery & Care Tab */}
            <TabsContent value="delivery" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="delivery_min_days"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Delivery Days</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormDescription>
                            Minimum days for delivery.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="delivery_max_days"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Delivery Days</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormDescription>
                            Maximum days for delivery.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="delivery_text"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Text</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., 3 To 4 Days Delivery"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Display text for delivery timeframe.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shipping_method"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shipping Method</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select shipping method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="express">Express</SelectItem>
                              <SelectItem value="next-day">Next Day</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="free_shipping_threshold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Free Shipping Threshold</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Minimum order value for free shipping.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Product Care & Assembly</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="warranty_info"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Warranty Information</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., 2 year manufacturer warranty included"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Warranty details for the product.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="care_instructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Care Instructions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Clean with damp cloth. Avoid direct sunlight."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Care and maintenance instructions.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="assembly_required"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Assembly Required</FormLabel>
                          <FormDescription>
                            Whether this product requires assembly.
                          </FormDescription>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("assembly_required") && (
                    <FormField
                      control={form.control}
                      name="assembly_instructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assembly Instructions</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Assembly instructions or URL to instructions"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Assembly instructions or link to instructions.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Variant Details Tab */}
            <TabsContent value="variant" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Default Variant Details</CardTitle>
                  <p className="text-muted-foreground text-sm">
                    Every product needs at least one variant. This will be
                    created automatically.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="default_sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU</FormLabel>
                          <FormControl>
                            <Input placeholder="Product SKU" {...field} />
                          </FormControl>
                          <FormDescription>
                            Stock Keeping Unit (will be auto-generated if not
                            provided).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="initial_stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Initial Stock</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              min="0"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Available stock quantity.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="default_color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Blue, Red, Black"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Color of this variant.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="default_size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Size</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., 3 Seater, King, Large"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Size of this variant.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="compare_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Compare Price</FormLabel>
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
                            Original price to show discount (optional).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="weight_kg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (kg)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.0"
                              step="0.1"
                              min="0"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Weight in kilograms for shipping calculations.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Assemble Charges ($) */}
                      <FormField
                        control={form.control}
                        name="assemble_charges"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assemble Charges ($)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0.0"
                                step="0.1"
                                min="0"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Assembly charges in dollars.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Delivery Time */}
                      <FormField
                        control={form.control}
                        name="delivery_time_days"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Time</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="e.g. 3–5 days"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Estimated delivery time for this variant.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />


                    <FormField
                      control={form.control}
                      name="material"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Material</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Premium Fabric, Leather"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Material of this variant.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., SofaDeal" {...field} />
                          </FormControl>
                          <FormDescription>
                            Brand of this variant.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Featured Variant</FormLabel>
                            <FormDescription>
                              Whether this variant should be featured.
                            </FormDescription>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., modern,comfortable,living room"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Comma-separated tags for this variant.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Dimensions & Payment Tab */}
            <TabsContent value="dimensions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Dimensions</CardTitle>
                  <p className="text-muted-foreground text-sm">
                    Enter dimensions in centimeters. Inches will be calculated
                    automatically.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <FormField
                      control={form.control}
                      name="width_cm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Width (cm)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              step="0.1"
                              min="0"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="depth_cm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Depth (cm)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              step="0.1"
                              min="0"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="height_cm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height (cm)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              step="0.1"
                              min="0"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="seat_width_cm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seat Width (cm)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              step="0.1"
                              min="0"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="seat_depth_cm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seat Depth (cm)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              step="0.1"
                              min="0"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="seat_height_cm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seat Height (cm)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              step="0.1"
                              min="0"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bed_width_cm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bed Width (cm)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              step="0.1"
                              min="0"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bed_length_cm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bed Length (cm)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              step="0.1"
                              min="0"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="klarna_enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Enable Klarna Payments</FormLabel>
                          <FormDescription>
                            Allow customers to pay in installments using Klarna.
                          </FormDescription>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("klarna_enabled") && (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="klarna_installments"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Installments</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="3"
                                min="1"
                                max="12"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Number of installment payments (1-12).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="klarna_description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Klarna Description</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Make 3 Payments Of $266.66"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Custom description for Klarna payments (optional).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Images Tab */}
            <TabsContent value="images" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                  <p className="text-muted-foreground text-sm">
                    Upload images for your product. You can specify different
                    types:
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
                  <EnhancedImageUpload
                    onFilesChange={setImageFiles}
                    maxFiles={20}
                    existingImages={imageFiles}
                    disabled={createProductMutation.isPending}
                    title="Product Images"
                    allowedTypes={["gallery", "main", "360"]}
                    defaultType="gallery"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Additional Variants Tab */}
            <TabsContent value="additional" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Additional Variants</CardTitle>
                  <p className="text-muted-foreground text-sm">
                    Add additional variants for this product with different
                    attributes, pricing, or specifications. These will be
                    created after the main product is saved.
                  </p>
                </CardHeader>
                <CardContent>
                  <VariantManager
                    variants={additionalVariants}
                    onVariantsChange={() => {
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4">
            <Link href="/admin/products">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={createProductMutation.isPending}>
              {createProductMutation.isPending
                ? "Creating..."
                : "Create Product"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
