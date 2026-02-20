"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Search, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Coupon {
  id: string;
  name: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  expires_at: string;
  max_uses: number;
  used_count: number;
  is_active: boolean;
  created_at: string;
  created_by?: string;
}

interface CouponFormData {
  name: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: string;
  expires_at: string;
  max_uses: number;
  is_active: boolean;
}

const initialFormData: CouponFormData = {
  name: "",
  code: "",
  discount_type: "percentage",
  discount_value: "",
  expires_at: "",
  max_uses: 1,
  is_active: true,
};

export default function AdminCouponsPage() {
  const { session } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<CouponFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (session?.access_token) {
      fetchCoupons();
    }
  }, [session]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCoupons(coupons);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = coupons.filter(
        (coupon) =>
          coupon.name.toLowerCase().includes(query) ||
          coupon.code.toLowerCase().includes(query)
      );
      setFilteredCoupons(filtered);
    }
  }, [searchQuery, coupons]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const token = session?.access_token;
      if (!token) throw new Error("No authentication token");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/coupons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error("Failed to fetch coupons");
      
      const data = await response.json();
      setCoupons(data);
      setFilteredCoupons(data);
    } catch (error) {
      console.error("Failed to fetch coupons", error);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'max_uses') {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value) || 1,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedCoupon(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsFormModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      name: coupon.name,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      expires_at: coupon.expires_at.split("T")[0],
      max_uses: coupon.max_uses,
      is_active: coupon.is_active,
    });
    setIsFormModalOpen(true);
  };

  const openDeleteDialog = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Coupon name is required");
      return;
    }
    if (!formData.code.trim()) {
      toast.error("Coupon code is required");
      return;
    }
    if (!formData.discount_value || parseFloat(formData.discount_value) <= 0) {
      toast.error("Discount value must be greater than 0");
      return;
    }
    if (!formData.expires_at) {
      toast.error("Expiry date is required");
      return;
    }
    if (!formData.max_uses || formData.max_uses < 1) {
      toast.error("Max uses must be at least 1");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = session?.access_token;
      if (!token) throw new Error("No authentication token");

      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        expires_at: new Date(formData.expires_at).toISOString(),
        max_uses: formData.max_uses,
        is_active: formData.is_active,
      };

      const url = selectedCoupon
        ? `${process.env.NEXT_PUBLIC_API_URL}/coupons/${selectedCoupon.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/coupons`;
      
      const method = selectedCoupon ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save coupon");
      }

      toast.success(selectedCoupon ? "Coupon updated successfully" : "Coupon created successfully");
      setIsFormModalOpen(false);
      fetchCoupons();
    } catch (error: any) {
      console.error("Error saving coupon", error);
      toast.error(error.message || "Failed to save coupon");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCoupon) return;

    try {
      const token = session?.access_token;
      if (!token) throw new Error("No authentication token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/coupons/${selectedCoupon.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete coupon");
      }

      toast.success("Coupon deleted successfully");
      setIsDeleteDialogOpen(false);
      fetchCoupons();
    } catch (error: any) {
      console.error("Error deleting coupon", error);
      toast.error(error.message || "Failed to delete coupon");
    }
  };

  const getStatusBadge = (isActive: boolean, expiresAt: string, usedCount: number, maxUses: number) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    
    if (!isActive) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    if (expiry < now) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (usedCount >= maxUses) {
      return <Badge variant="secondary">Max Uses</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-6 pt-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-lg">Loading coupons...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-4 sm:p-6 sm:pt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Coupons
        </h2>
        <Button onClick={openCreateModal} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Create Coupon
        </Button>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            placeholder="Search by name or code..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          onClick={fetchCoupons}
          className="w-full sm:w-auto"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {filteredCoupons.length === 0 ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  No coupons found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery
                    ? "Try adjusting your search criteria."
                    : "Get started by creating your first coupon."}
                </p>
                {!searchQuery && (
                  <Button onClick={openCreateModal} className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Coupon
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Name</TableHead>
                    <TableHead className="min-w-[120px]">Code</TableHead>
                    <TableHead className="min-w-[100px]">Discount</TableHead>
                    <TableHead className="min-w-[120px]">Expires</TableHead>
                    <TableHead className="min-w-[100px]">Usage</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[100px] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCoupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell className="font-medium">
                        {coupon.name}
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-gray-100 px-2 py-1 text-sm">
                          {coupon.code}
                        </code>
                      </TableCell>
                      <TableCell>
                        {coupon.discount_type === "percentage"
                          ? `${coupon.discount_value}%`
                          : `£${coupon.discount_value.toFixed(2)}`}
                      </TableCell>
                      <TableCell>
                        {format(new Date(coupon.expires_at), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {coupon.used_count} / {coupon.max_uses}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(
                          coupon.is_active,
                          coupon.expires_at,
                          coupon.used_count,
                          coupon.max_uses
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(coupon)}
                            title="Edit coupon"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(coupon)}
                            title="Delete coupon"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedCoupon ? "Edit Coupon" : "Create New Coupon"}
            </DialogTitle>
            <DialogDescription>
              {selectedCoupon
                ? "Update the coupon details below."
                : "Fill in the details to create a new coupon."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Coupon Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Summer Sale 2024"
                  required
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <Label htmlFor="code">Coupon Code *</Label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="e.g. SUMMER20"
                  maxLength={20}
                  required
                  className="uppercase"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <Label htmlFor="discount_type">Discount Type *</Label>
                <Select
                  value={formData.discount_type}
                  onValueChange={(v) => handleSelectChange("discount_type", v)}
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

              <div className="col-span-2 sm:col-span-1">
                <Label htmlFor="discount_value">Discount Value *</Label>
                <Input
                  id="discount_value"
                  name="discount_value"
                  type="number"
                  step={formData.discount_type === "percentage" ? "1" : "0.01"}
                  min="0"
                  value={formData.discount_value}
                  onChange={handleInputChange}
                  placeholder={formData.discount_type === "percentage" ? "10" : "5.00"}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.discount_type === "percentage"
                    ? "Enter percentage (e.g. 10 for 10%)"
                    : "Enter amount in pounds (£)"}
                </p>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <Label htmlFor="expires_at">Expiry Date *</Label>
                <Input
                  id="expires_at"
                  name="expires_at"
                  type="date"
                  value={formData.expires_at}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <Label htmlFor="max_uses">Max Uses *</Label>
                <Input
                  id="max_uses"
                  name="max_uses"
                  type="number"
                  min="1"
                  value={formData.max_uses}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="col-span-2 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="is_active" className="text-sm font-normal">
                  Coupon is active (can be used)
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : selectedCoupon
                  ? "Update Coupon"
                  : "Create Coupon"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the coupon{" "}
              <span className="font-medium text-gray-900">
                {selectedCoupon?.name} ({selectedCoupon?.code})
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}