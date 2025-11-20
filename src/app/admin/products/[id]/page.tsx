"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, Edit, Trash2, ImageIcon, PackageCheck } from "lucide-react";
import Link from "next/link";
import { useProduct, useDeleteProduct } from "@/hooks/use-products";
import { formatPrice } from "@/lib/utils";
import NextImage from "next/image";

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const [activeTab, setActiveTab] = useState("details");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useProduct(productId, {
    includeVariants: true,
    includeImages: true,
    includeCategory: true,
  });

  const deleteMutation = useDeleteProduct();

  const handleDeleteProduct = async () => {
    try {
      await deleteMutation.mutateAsync(productId);
      router.push("/admin/products");
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p>Loading product details...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <p className="text-red-500">
          Error loading product:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
        <Button onClick={() => router.push("/admin/products")}>
          Return to Products
        </Button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p>Product not found</p>
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
          <h1 className="text-3xl font-bold">{product.name}</h1>
        </div>
        <div className="flex space-x-2">
          <Link href={`/admin/products/edit/${productId}`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
          </Link>
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Are you sure you want to delete this product?
                </DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete the
                  product and all associated variants and images.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteProduct}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="variants">
            Variants ({product.variants?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="images">
            Images ({product.images?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
              <CardDescription>
                Basic details about this product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-muted-foreground mb-1 text-sm font-medium">
                    Product ID
                  </p>
                  <p>{product.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1 text-sm font-medium">
                    Name
                  </p>
                  <p>{product.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1 text-sm font-medium">
                    Price
                  </p>
                  <p>{formatPrice(product.base_price)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1 text-sm font-medium">
                    Category
                  </p>
                  <p>
                    {product.category ? product.category.name : "Uncategorized"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1 text-sm font-medium">
                    Created
                  </p>
                  <p>{new Date(product.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1 text-sm font-medium">
                    Last Updated
                  </p>
                  <p>{new Date(product.updated_at).toLocaleString()}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-muted-foreground mb-2 text-sm font-medium">
                  Description
                </p>
                <div className="prose prose-sm max-w-none">
                  {product.description || (
                    <p className="text-muted-foreground italic">
                      No description provided
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variants" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Variants</CardTitle>
              <CardDescription>
                View product variants, stock and pricing
              </CardDescription>
            </CardHeader>
            <CardContent>
              {product.variants && product.variants.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead>Color</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Material</TableHead>
                        <TableHead>Delivery Time</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-center">Stock</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {product.variants.map((variant) => (
                        <TableRow key={variant.id}>
                          <TableCell className="font-medium">
                            {variant.sku}
                          </TableCell>
                          <TableCell>{variant.color || "-"}</TableCell>
                          <TableCell>{variant.size || "-"}</TableCell>
                          <TableCell>{variant.material || "-"}</TableCell>
                          <TableCell>
                            {variant.delivery_time_days
                              ? `${variant.delivery_time_days} days`
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatPrice(variant.price)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              <Badge
                                variant={
                                  variant.stock > 5
                                    ? "outline"
                                    : variant.stock > 0
                                      ? "warning"
                                      : "destructive"
                                }
                              >
                                {variant.stock}
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-6 text-center">
                  <PackageCheck className="text-muted-foreground mx-auto h-12 w-12" />
                  <h3 className="mt-2 text-lg font-medium">No variants</h3>
                  <p className="text-muted-foreground mt-1 mb-4 text-sm">
                    This product has no variants. Add a variant to manage
                    inventory and pricing.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Use the Edit button above to add variants to this product.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Product Images</CardTitle>
                <CardDescription>
                  View product images and gallery
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {product.images && product.images.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {product.images.map((image) => (
                    <div
                      key={image.id}
                      className="group relative overflow-hidden rounded-md border"
                    >
                      <div className="aspect-square w-full overflow-hidden">
                        <NextImage
                          fill
                          src={image.url}
                          alt={`Product image ${image.id}`}
                          className="h-full w-full object-cover transition-all group-hover:scale-105"
                        />
                      </div>

                      <div className="absolute right-0 bottom-0 left-0 bg-black/60 p-2 text-xs text-white">
                        {image.type === "main" ? (
                          <Badge variant="secondary">Main</Badge>
                        ) : (
                          <span>
                            {image.type} (Order: {image.order})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <ImageIcon className="text-muted-foreground mx-auto h-12 w-12" />
                  <h3 className="mt-2 text-lg font-medium">No images</h3>
                  <p className="text-muted-foreground mt-1 mb-4 text-sm">
                    This product has no images. Add images to showcase your
                    product.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Use the Edit button above to add images to this product.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
