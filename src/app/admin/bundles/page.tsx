"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  ImageIcon,
  X,
  Search,
} from "lucide-react";
import { useBundles, useCreateBundle, useUpdateBundle, useDeleteBundle } from "@/hooks/use-bundles";
import { useProducts } from "@/hooks/use-products";
import { useAuth } from "@/hooks/useAuth";
import { Bundle, BundleProduct } from "@/lib/api/bundles";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

// ─── Form State ───────────────────────────────────────────────
interface BundleFormState {
  bundlename: string;
  description: string;
  bundleprice: string;
  discount_type: "percentage" | "fixed";
  discount_value: string;
  bundlestatus: "active" | "inactive";
  productIds: string[];
  imageFile: File | null;
  imagePreview: string | null;
}

const defaultForm: BundleFormState = {
  bundlename: "",
  description: "",
  bundleprice: "",
  discount_type: "percentage",
  discount_value: "0",
  bundlestatus: "active",
  productIds: [],
  imageFile: null,
  imagePreview: null,
};

export default function AdminBundlesPage() {
  const { getToken } = useAuth({ redirectTo: "/login", requireAuth: true });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<BundleFormState>(defaultForm);
  const [productSearch, setProductSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Queries ─────────────────────────────────────────────────
  const { data: bundles = [], isLoading, refetch } = useBundles(false);
  const { data: productsData } = useProducts({
    limit: 200,
    includeImages: true,
    includeVariants: false,
  });
  const allProducts = productsData?.items || [];

  const createMutation = useCreateBundle();
  const updateMutation = useUpdateBundle(editingBundle?.id || "");
  const deleteMutation = useDeleteBundle();

  // ─── Filtered products for search ────────────────────────────
  const filteredProducts = allProducts.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  // ─── Open create dialog ───────────────────────────────────────
  const openCreateDialog = () => {
    setEditingBundle(null);
    setForm(defaultForm);
    setProductSearch("");
    setDialogOpen(true);
  };

  // ─── Open edit dialog ─────────────────────────────────────────
  const openEditDialog = (bundle: Bundle) => {
    setEditingBundle(bundle);
    setForm({
      bundlename: bundle.bundlename,
      description: bundle.description || "",
      bundleprice: String(bundle.bundleprice),
      discount_type: bundle.discount_type,
      discount_value: String(bundle.discount_value),
      bundlestatus: bundle.bundlestatus,
      productIds: bundle.products.map((p) => p.id),
      imageFile: null,
      imagePreview: bundle.bundleimage || null,
    });
    setProductSearch("");
    setDialogOpen(true);
  };

  // ─── Toggle product selection ─────────────────────────────────
  const toggleProduct = (productId: string) => {
    setForm((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter((id) => id !== productId)
        : [...prev.productIds, productId],
    }));
  };

  // ─── Handle image file ────────────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({
      ...prev,
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
    }));
  };

  // ─── Submit form ──────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.bundlename.trim()) {
      toast.error("Bundle name is required");
      return;
    }
    if (!form.bundleprice || isNaN(Number(form.bundleprice))) {
      toast.error("Valid bundle price is required");
      return;
    }
    if (form.productIds.length < 2) {
      toast.error("Select at least 2 products");
      return;
    }

    const token = await getToken();
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    const payload = {
      bundlename: form.bundlename,
      description: form.description || undefined,
      bundleprice: Number(form.bundleprice),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value) || 0,
      bundlestatus: form.bundlestatus,
      productIds: form.productIds,
      ...(form.imageFile && { bundleimage: form.imageFile }),
    };

    try {
      if (editingBundle) {
        await updateMutation.mutateAsync({ payload, token });
      } else {
        await createMutation.mutateAsync({ payload, token });
      }
      setDialogOpen(false);
      setForm(defaultForm);
      refetch();
    } catch {
      // error handled by mutation
    }
  };

  // ─── Delete bundle ────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deletingId) return;
    const token = await getToken();
    if (!token) return;
    await deleteMutation.mutateAsync({ id: deletingId, token });
    setDeleteDialogOpen(false);
    setDeletingId(null);
    refetch();
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  // ─── Calculate final price ────────────────────────────────────
  const calcFinalPrice = (price: number, type: string, value: number) => {
    if (!value) return price;
    if (type === "percentage") return price - (price * value) / 100;
    return price - value;
  };

  return (
    <div className="space-y-6 p-6 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bundles Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Create and manage product bundles
          </p>
        </div>
        <Button className="cursor-pointer" onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" /> Create Bundle
        </Button>
      </div>

      {/* Bundles Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bundles</CardTitle>
          <CardDescription>
            {bundles.length} bundle{bundles.length !== 1 ? "s" : ""} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <p className="text-muted-foreground">Loading bundles...</p>
            </div>
          ) : bundles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="text-lg font-medium">No bundles yet</h3>
              <p className="text-muted-foreground mt-1 mb-4 text-sm">
                Create your first bundle to get started
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" /> Create Bundle
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 pl-8">#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bundles.map((bundle) => {
                    const finalPrice = calcFinalPrice(
                      bundle.bundleprice,
                      bundle.discount_type,
                      bundle.discount_value
                    );
                    return (
                      <TableRow key={bundle.id}>
                        <TableCell>
                          {bundle.bundleimage ? (
                            <div className="relative h-12 w-12 overflow-hidden rounded-md">
                              <Image
                                fill
                                src={bundle.bundleimage}
                                alt={bundle.bundlename}
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gray-100">
                              <ImageIcon className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{bundle.bundlename}</p>
                            {bundle.description && (
                              <p className="text-muted-foreground line-clamp-1 text-xs">
                                {bundle.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {bundle.products.slice(0, 2).map((p) => (
                              <Badge key={p.id} variant="outline" className="text-xs">
                                {p.name}
                              </Badge>
                            ))}
                            {bundle.products.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{bundle.products.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div>
                            <p className="font-medium">
                              {formatPrice(finalPrice)}
                            </p>
                            {bundle.discount_value > 0 && (
                              <p className="text-muted-foreground text-xs line-through">
                                {formatPrice(bundle.bundleprice)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {bundle.discount_value > 0 ? (
                            <Badge variant="secondary">
                              {bundle.discount_type === "percentage"
                                ? `${bundle.discount_value}% off`
                                : `£${bundle.discount_value} off`}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              bundle.bundlestatus === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {bundle.bundlestatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="cursor-pointer"
                              onClick={() => openEditDialog(bundle)}
                            >
                              <Edit className="h-4 w-4"/>
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="cursor-pointer"
                              onClick={() => {
                                setDeletingId(bundle.id);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
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

      {/* ─── Create / Edit Dialog ─────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="cursor-pointer">
              {editingBundle ? "Edit Bundle" : "Create New Bundle"}
            </DialogTitle>
            <DialogDescription>
              {editingBundle
                ? "Update bundle information and products"
                : "Fill in details and select at least 2 products"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Bundle Name *</label>
                <Input
                  placeholder="e.g. Living Room Set"
                  value={form.bundlename}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, bundlename: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Bundle Price (£) *</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={form.bundleprice}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, bundleprice: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Discount Type</label>
                <Select
                  value={form.discount_type}
                  onValueChange={(v: "percentage" | "fixed") =>
                    setForm((prev) => ({ ...prev, discount_type: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Discount Value{" "}
                  {form.discount_type === "percentage" ? "(%)" : "(£)"}
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  min="0"
                  value={form.discount_value}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      discount_value: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={form.bundlestatus}
                  onValueChange={(v: "active" | "inactive") =>
                    setForm((prev) => ({ ...prev, bundlestatus: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Preview */}
              {form.bundleprice && (
                <div className="flex items-end">
                  <div className="rounded-md bg-gray-50 p-3 text-sm w-full">
                    <p className="text-muted-foreground">Final Price:</p>
                    <p className="text-lg font-bold">
                      {formatPrice(
                        calcFinalPrice(
                          Number(form.bundleprice),
                          form.discount_type,
                          Number(form.discount_value)
                        )
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Describe this bundle..."
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                className="resize-none"
                rows={3}
              />
            </div>

            {/* Bundle Image */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Bundle Image</label>
              <div className="flex items-center gap-4">
                {form.imagePreview && (
                  <div className="relative h-20 w-20 overflow-hidden rounded-md border">
                    <Image
                      fill
                      src={form.imagePreview}
                      alt="Bundle preview"
                      className="object-cover"
                    />
                    <button
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          imageFile: null,
                          imagePreview: null,
                        }))
                      }
                      className="absolute cursor-pointer right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  {form.imagePreview ? "Change Image" : "Upload Image"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            {/* Product Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Select Products *{" "}
                  <span className="text-muted-foreground font-normal">
                    (min. 2)
                  </span>
                </label>
                <Badge variant={form.productIds.length >= 2 ? "default" : "secondary"}>
                  {form.productIds.length} selected
                </Badge>
              </div>

              {/* Search products */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Selected products pills */}
              {form.productIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.productIds.map((id) => {
                    const product = allProducts.find((p) => p.id === id);
                    return product ? (
                      <Badge
                        key={id}
                        variant="default"
                        className="flex items-center gap-1 pr-1"
                      >
                        {product.name}
                        <button
                          onClick={() => toggleProduct(id)}
                          className="ml-1 cursor-pointer rounded-full hover:bg-white/20"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}

              {/* Products list */}
              <div className="max-h-56 overflow-y-auto rounded-md border">
                {filteredProducts.length === 0 ? (
                  <div className="py-6 text-center text-sm text-gray-500">
                    No products found
                  </div>
                ) : (
                  filteredProducts.map((product) => {
                    const isSelected = form.productIds.includes(product.id);
                    const mainImage =
                      product.images?.find((img) => img.type === "main")
                        ?.url || product.images?.[0]?.url;

                    return (
                      <div
                        key={product.id}
                        onClick={() => toggleProduct(product.id)}
                        className={`flex cursor-pointer items-center gap-3 border-b p-3 last:border-0 transition-colors hover:bg-gray-50 ${
                          isSelected ? "bg-blue-50" : ""
                        }`}
                      >
                        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                          {mainImage ? (
                            <Image
                              fill
                              src={mainImage}
                              alt={product.name}
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {product.name}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {formatPrice(product.base_price)}
                          </p>
                        </div>
                        <div
                          className={`h-5 w-5 flex-shrink-0 rounded-full border-2 transition-colors ${
                            isSelected
                              ? "border-blue-600 bg-blue-600"
                              : "border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <svg
                              className="h-full w-full p-0.5 text-white"
                              viewBox="0 0 12 12"
                              fill="none"
                            >
                              <path
                                d="M2 6l3 3 5-5"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button className="cursor-pointer" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="cursor-pointer" onClick={handleSubmit} disabled={isPending}>
              {isPending
                ? editingBundle
                  ? "Saving..."
                  : "Creating..."
                : editingBundle
                ? "Save Changes"
                : "Create Bundle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation Dialog ───────────────────────── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Bundle</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this bundle? This action cannot be
              undone.
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
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Bundle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}