"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, Package, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Image from "next/image";

// Form schema for stock update
const stockFormSchema = z.object({
  action: z.enum(["add", "subtract", "set"], {
    required_error: "Please select an action.",
  }),
  quantity: z.coerce.number().nonnegative({
    message: "Quantity must be a positive number.",
  }),
  note: z.string().optional(),
});

// Demo data for products (same as in products page)
const PRODUCTS_DATA = [
  {
    id: "PROD-001",
    name: "Modern Sectional Sofa",
    category: "Sofas",
    price: 2399.99,
    stock: 12,
    status: "Active",
    image: "https://placehold.co/100x100?text=Sofa",
    description:
      "A luxurious modern sectional sofa perfect for your living room. Features plush cushions and premium upholstery.",
    dimensions: '120" x 80" x 36"',
    material: "Fabric, Wood",
    colors: ["Gray", "Beige", "Navy Blue"],
    createdAt: "2023-01-15",
    sku: "SOF-MS-001",
  },
  {
    id: "PROD-002",
    name: "Leather Recliner",
    category: "Chairs",
    price: 899.99,
    stock: 8,
    status: "Active",
    image: "https://placehold.co/100x100?text=Chair",
    description:
      "A comfortable leather recliner with power controls. Perfect for your living room or entertainment space.",
    dimensions: '36" x 40" x 42"',
    material: "Leather, Wood, Metal",
    colors: ["Brown", "Black", "Tan"],
    createdAt: "2023-02-20",
    sku: "CHR-LR-002",
  },
  {
    id: "PROD-003",
    name: "Modern Coffee Table",
    category: "Tables",
    price: 249.99,
    stock: 15,
    status: "Active",
    image: "https://placehold.co/100x100?text=Table",
    description:
      "A sleek modern coffee table with tempered glass top and wooden base.",
    dimensions: '48" x 24" x 18"',
    material: "Glass, Wood",
    colors: ["Walnut", "Oak", "Black"],
    createdAt: "2023-03-10",
    sku: "TBL-CT-003",
  },
  {
    id: "PROD-004",
    name: "Accent Chair",
    category: "Chairs",
    price: 349.99,
    stock: 6,
    status: "Low Stock",
    image: "https://placehold.co/100x100?text=Chair",
    description:
      "A stylish accent chair with unique design. Perfect addition to any room.",
    dimensions: '28" x 32" x 34"',
    material: "Fabric, Wood",
    colors: ["Teal", "Mustard", "Gray"],
    createdAt: "2023-02-28",
    sku: "CHR-AC-004",
  },
  {
    id: "PROD-005",
    name: "Queen Size Bed Frame",
    category: "Beds",
    price: 1299.99,
    stock: 0,
    status: "Out of Stock",
    image: "https://placehold.co/100x100?text=Bed",
    description:
      "A modern queen size bed frame with headboard and storage drawers.",
    dimensions: '60" x 80" x 45"',
    material: "Wood, Metal",
    colors: ["Walnut", "White", "Gray"],
    createdAt: "2023-01-05",
    sku: "BED-QS-005",
  },
];

// Get status badge for product
const getStatusBadge = (status: string, stock: number) => {
  if (stock === 0 || status === "Out of Stock") {
    return <Badge variant="destructive">Out of Stock</Badge>;
  } else if (stock < 8 || status === "Low Stock") {
    return (
      <Badge
        variant="warning"
        className="border-0 bg-amber-100 text-amber-800 hover:bg-amber-100"
      >
        Low Stock
      </Badge>
    );
  } else {
    return (
      <Badge
        variant="default"
        className="border-0 bg-green-100 text-green-800 hover:bg-green-100"
      >
        In Stock
      </Badge>
    );
  }
};

export default function UpdateStockPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [product, setProduct] = useState<(typeof PRODUCTS_DATA)[0] | null>(
    null
  );
  const [newStockPreview, setNewStockPreview] = useState<number | null>(null);

  // Initialize form with react-hook-form and zod validation
  const form = useForm<z.infer<typeof stockFormSchema>>({
    resolver: zodResolver(stockFormSchema),
    defaultValues: {
      action: "add",
      quantity: 0,
      note: "",
    },
  });

  // Watch for form changes to calculate preview
  const action = form.watch("action");
  const quantity = form.watch("quantity");

  useEffect(() => {
    // Find product with the matching ID
    const foundProduct = PRODUCTS_DATA.find((p) => p.id === id);

    if (foundProduct) {
      setProduct(foundProduct);
      // Initialize the preview with the current stock
      setNewStockPreview(foundProduct.stock);
    } else {
      // If no product is found, redirect back to products list
      toast.error("Product not found");
      router.push("/admin/products");
    }
  }, [id, router]);

  // Update the preview when form values change
  useEffect(() => {
    if (!product || quantity === undefined) return;

    switch (action) {
      case "add":
        setNewStockPreview(product.stock + quantity);
        break;
      case "subtract":
        setNewStockPreview(Math.max(0, product.stock - quantity));
        break;
      case "set":
        setNewStockPreview(quantity);
        break;
      default:
        setNewStockPreview(product.stock);
    }
  }, [action, quantity, product]);

  // Form submission handler
  function onSubmit(values: z.infer<typeof stockFormSchema>) {
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      console.log(values);

      // Calculate the action description for the toast message
      let actionDescription = "";
      switch (values.action) {
        case "add":
          actionDescription = `Added ${values.quantity} units`;
          break;
        case "subtract":
          actionDescription = `Removed ${values.quantity} units`;
          break;
        case "set":
          actionDescription = `Set stock to ${values.quantity} units`;
          break;
      }

      toast.success(`Stock updated successfully! ${actionDescription}`);
      setIsSubmitting(false);
      router.push(`/admin/products/${id}`);
    }, 1000);
  }

  if (!product) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="border-primary h-10 w-10 animate-spin rounded-full border-4 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-6 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push(`/admin/products/${id}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Update Stock</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>Product and current stock details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-md border">
                <Image
                  fill
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-muted-foreground text-sm">
                  {product.id} • {product.sku}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Package className="text-muted-foreground h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">Current Stock</p>
                  <p className="text-2xl font-bold">{product.stock}</p>
                </div>
              </div>
              <div>{getStatusBadge(product.status, product.stock)}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update Stock</CardTitle>
            <CardDescription>Adjust product inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="action"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Action</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-y-0 space-x-3">
                            <FormControl>
                              <RadioGroupItem value="add" />
                            </FormControl>
                            <FormLabel className="flex items-center font-normal">
                              <ArrowUp className="mr-2 h-4 w-4 text-emerald-500" />
                              Add stock
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-y-0 space-x-3">
                            <FormControl>
                              <RadioGroupItem value="subtract" />
                            </FormControl>
                            <FormLabel className="flex items-center font-normal">
                              <ArrowDown className="mr-2 h-4 w-4 text-red-500" />
                              Remove stock
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-y-0 space-x-3">
                            <FormControl>
                              <RadioGroupItem value="set" />
                            </FormControl>
                            <FormLabel className="flex items-center font-normal">
                              <Package className="mr-2 h-4 w-4" />
                              Set exact stock
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Note (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Restocking from supplier"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {newStockPreview !== null && (
                  <div className="bg-muted/50 mt-4 flex items-center justify-between rounded-lg p-3">
                    <span className="text-sm font-medium">
                      New Stock Level:
                    </span>
                    <span className="text-lg font-bold">{newStockPreview}</span>
                  </div>
                )}

                <Button
                  className="w-full"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update Stock
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
