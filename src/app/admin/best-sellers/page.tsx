"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Search } from "lucide-react";
import Image from "next/image";
import { useProducts } from "@/hooks/use-products";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/providers/auth-provider";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface BestSellerProduct {
  id: string;
  product_id: string;
  created_at: string;
  product?: {
    id: string;
    name: string;
    base_price: number;
    discount_offer?: number;
    images?: { id: string; url: string; type: string; order: number }[];
    variants?: { id: string; stock: number }[];
  };
}

interface ProductItem {
  id: string;
  name: string;
  base_price: number;
  discount_offer?: number;
  images?: { id: string; url: string; type: string; order: number }[];
  variants?: { id: string; stock: number }[];
}

function useBestSellerProducts() {
  return useQuery<BestSellerProduct[]>({
    queryKey: ["bestSellerProducts"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/best-sellers`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch best sellers");
      return res.json();
    },
  });
}

function useAddBestSeller() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, token }: { productId: string; token: string }) => {
      const res = await fetch(`${API_URL}/best-sellers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId }),
      });
      if (!res.ok) throw new Error("Failed to add best seller");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bestSellerProducts"] });
      toast.success("Product added to best sellers");
    },
    onError: (error: Error) => {
      toast.error("Failed to add product", { description: error.message });
    },
  });
}

function useRemoveBestSeller() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, token }: { id: string; token: string }) => {
      const res = await fetch(`${API_URL}/best-sellers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to remove best seller");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bestSellerProducts"] });
      toast.success("Product removed from best sellers");
    },
    onError: (error: Error) => {
      toast.error("Failed to remove product", { description: error.message });
    },
  });
}

export default function BestSellersPage() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  const { session } = useAuth();

  const { data: bestSellers = [], isLoading } = useBestSellerProducts();

  const { data: allProductsData, isLoading: isProductsLoading } = useProducts({
    search: productSearch || undefined,
    limit: 20,
    includeImages: true,
    includeVariants: true,
  });

  const addMutation = useAddBestSeller();
  const removeMutation = useRemoveBestSeller();

  const allProducts: ProductItem[] = (allProductsData?.items || []) as ProductItem[];
  const bestSellerProductIds = bestSellers.map((bs: BestSellerProduct) => bs.product_id);

  const getToken = (): string | null => {
    const token = session?.access_token;
    if (!token) {
      toast.error("Not authenticated");
      return null;
    }
    return token;
  };

  const handleAdd = async (productId: string) => {
    const token = getToken();
    if (!token) return;
    await addMutation.mutateAsync({ productId, token });
  };

  const handleRemove = async (id: string) => {
    const confirmed = window.confirm("Remove this product from best sellers?");
    if (!confirmed) return;
    const token = getToken();
    if (!token) return;
    await removeMutation.mutateAsync({ id, token });
  };

  const filtered = bestSellers.filter((bs: BestSellerProduct) =>
    bs.product?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Best Sellers Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage products shown under &quot;Shop Our Best Seller&quot; section on the homepage.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Best Seller Product</DialogTitle>
              <DialogDescription>
                Search and select products to add to the &quot;Shop Our Best Seller&quot; section.
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-2">
              <Input
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="flex-1"
              />
              <Search className="text-muted-foreground h-4 w-4" />
            </div>

            <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1">
              {isProductsLoading ? (
                <p className="text-muted-foreground py-4 text-center text-sm">Loading products...</p>
              ) : allProducts.length === 0 ? (
                <p className="text-muted-foreground py-4 text-center text-sm">No products found</p>
              ) : (
                allProducts.map((product: ProductItem) => {
                  const isAdded = bestSellerProductIds.includes(product.id);
                  const mainImage =
                    [...(product.images || [])]
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .find((img) => img.type === "main")?.url ||
                    product.images?.[0]?.url;

                  return (
                    <div key={product.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-gray-100">
                        {mainImage ? (
                          <Image src={mainImage} alt={product.name} fill className="object-contain" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                            No img
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">{product.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {formatPrice(product.base_price)}
                          {product.discount_offer ? ` · ${product.discount_offer}% off` : ""}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant={isAdded ? "outline" : "default"}
                        disabled={isAdded || addMutation.isPending}
                        onClick={() => handleAdd(product.id)}
                      >
                        {isAdded ? "Added" : "Add"}
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Best Seller Products ({bestSellers.length})</CardTitle>
          <CardDescription>
            These products appear in the &quot;Shop Our Best Seller&quot; section on the homepage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Input
              placeholder="Filter products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground mb-4">No best seller products yet.</p>
              <Button variant="outline" onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add your first best seller
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((bs: BestSellerProduct) => {
                    const product = bs.product;
                    const mainImage =
                      [...(product?.images || [])]
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .find((img) => img.type === "main")?.url ||
                      product?.images?.[0]?.url;

                    const totalStock =
                      product?.variants?.reduce(
                        (sum: number, v: { stock: number }) => sum + (v.stock || 0),
                        0
                      ) ?? 0;

                    return (
                      <TableRow key={bs.id}>
                        <TableCell>
                          <div className="relative h-10 w-10 overflow-hidden rounded-md bg-gray-100">
                            {mainImage ? (
                              <Image src={mainImage} alt={product?.name || ""} fill className="object-contain" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                                No img
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{product?.name || "—"}</TableCell>
                        <TableCell>{product ? formatPrice(product.base_price) : "—"}</TableCell>
                        <TableCell>
                          {product?.discount_offer ? `${product.discount_offer}% off` : "—"}
                        </TableCell>
                        <TableCell>{totalStock}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="icon"
                            disabled={removeMutation.isPending}
                            onClick={() => handleRemove(bs.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}