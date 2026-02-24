"use client";

import { useState, useEffect } from "react";
import { ApiService } from "@/lib/api-service";
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
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  RefreshCw,
  UserPlus,
  Mail,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

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
  assigned_to_email?: string;
  assigned_to_user_id?: string;
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

const ITEMS_PER_PAGE = 10;

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<CouponFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Assign state
  const [assignEmail, setAssignEmail] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

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
    setCurrentPage(1);
  }, [searchQuery, coupons]);

  const totalPages = Math.ceil(filteredCoupons.length / ITEMS_PER_PAGE);
  const paginatedCoupons = filteredCoupons.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ─── Fetch all coupons ──────────────────────────────────────────────────
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await ApiService.fetchWithAuth("/coupons");
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

  // ─── Form handlers ──────────────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (name === "max_uses") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 1 }));
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

  // ─── Modal openers ──────────────────────────────────────────────────────
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

  const openAssignModal = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setAssignEmail(coupon.assigned_to_email || "");
    setIsAssignModalOpen(true);
  };

  // ─── Create / Update coupon ─────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) return toast.error("Coupon name is required");
    if (!formData.code.trim()) return toast.error("Coupon code is required");
    if (!formData.discount_value || parseFloat(formData.discount_value) <= 0)
      return toast.error("Discount value must be greater than 0");
    if (!formData.expires_at) return toast.error("Expiry date is required");
    if (!formData.max_uses || formData.max_uses < 1)
      return toast.error("Max uses must be at least 1");

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        expires_at: new Date(formData.expires_at).toISOString(),
        max_uses: formData.max_uses,
        is_active: formData.is_active,
      };

      const response = await ApiService.fetchWithAuth(
        selectedCoupon ? `/coupons/${selectedCoupon.id}` : "/coupons",
        {
          method: selectedCoupon ? "PATCH" : "POST",
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save coupon");
      }

      toast.success(
        selectedCoupon
          ? "Coupon updated successfully"
          : "Coupon created successfully"
      );
      setIsFormModalOpen(false);
      fetchCoupons();
    } catch (error: any) {
      toast.error(error.message || "Failed to save coupon");
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleDelete = async () => {
    if (!selectedCoupon) return;

    try {
      const response = await ApiService.fetchWithAuth(
        `/coupons/${selectedCoupon.id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete coupon");
      }

      toast.success("Coupon deleted successfully");
      setIsDeleteDialogOpen(false);
      fetchCoupons();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete coupon");
    }
  };

  // ─── Assign coupon to user ──────────────────────────────────────────────
  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoupon) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!assignEmail.trim() || !emailRegex.test(assignEmail.trim())) {
      return toast.error("Please enter a valid email address");
    }

    setIsAssigning(true);
    try {
      const response = await ApiService.fetchWithAuth(
        `/coupons/${selectedCoupon.id}/assign`,
        {
          method: "POST",
          body: JSON.stringify({ email: assignEmail.trim() }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to assign coupon");
      }

      toast.success(`Coupon assigned and email sent to ${assignEmail.trim()}`);
      setIsAssignModalOpen(false);
      setAssignEmail("");
      fetchCoupons();
    } catch (error: any) {
      toast.error(error.message || "Failed to assign coupon");
    } finally {
      setIsAssigning(false);
    }
  };

  // ─── Status badge ───────────────────────────────────────────────────────
  const getStatusBadge = (
    isActive: boolean,
    expiresAt: string,
    usedCount: number,
    maxUses: number
  ) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    if (!isActive) return <Badge variant="destructive">Inactive</Badge>;
    if (expiry < now) return <Badge variant="destructive">Expired</Badge>;
    if (usedCount >= maxUses)
      return <Badge variant="secondary">Max Uses</Badge>;
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        Active
      </Badge>
    );
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-4 sm:p-6 sm:pt-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Coupons
        </h2>
        <Button onClick={openCreateModal} className="w-full sm:w-auto cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          Create Coupon
        </Button>
      </div>

      {/* Search and Refresh */}
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
          className="w-full sm:w-auto cursor-pointer"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Table Card */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-lg font-medium text-blue-500">
                Loading Coupons...
              </div>
            </div>
          ) : filteredCoupons.length === 0 ? (
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
                    <TableHead className="min-w-[160px]">Assigned To</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[120px] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCoupons.map((coupon) => (
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
                        <span className="text-sm">
                          {coupon.used_count} / {coupon.max_uses}
                        </span>
                      </TableCell>
                      <TableCell>
                        {coupon.assigned_to_email ? (
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3 w-3 text-blue-500 shrink-0" />
                            <span
                              className="text-xs text-blue-700 truncate max-w-[130px]"
                              title={coupon.assigned_to_email}
                            >
                              {coupon.assigned_to_email}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">
                            Unassigned
                          </span>
                        )}
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
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openAssignModal(coupon)}
                            title="Assign to user"
                            className="text-blue-600 hover:text-blue-700 cursor-pointer"
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer"
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
                            className="text-red-600 hover:text-red-700 cursor-pointer"
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

        {/* Pagination */}
        {!loading && filteredCoupons.length > 0 && (
          <CardFooter className="flex flex-col items-center justify-between gap-4 border-t px-4 py-3 sm:flex-row sm:px-6">
            <div className="text-muted-foreground text-center text-sm sm:text-left">
              Showing{" "}
              <strong>{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong> to{" "}
              <strong>
                {Math.min(
                  currentPage * ITEMS_PER_PAGE,
                  filteredCoupons.length
                )}
              </strong>{" "}
              of <strong>{filteredCoupons.length}</strong> coupons
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Next
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Create / Edit Modal */}
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
              <div className="col-span-2 space-y-2">
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

              <div className="col-span-2 sm:col-span-1 space-y-2">
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

              <div className="col-span-2 sm:col-span-1 space-y-2">
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

              <div className="col-span-2 sm:col-span-1 space-y-2">
                <Label htmlFor="discount_value">Discount Value *</Label>
                <Input
                  id="discount_value"
                  name="discount_value"
                  type="number"
                  step={formData.discount_type === "percentage" ? "1" : "0.01"}
                  min="0"
                  value={formData.discount_value}
                  onChange={handleInputChange}
                  placeholder={
                    formData.discount_type === "percentage" ? "10" : "5.00"
                  }
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.discount_type === "percentage"
                    ? "Enter percentage (e.g. 10 for 10%)"
                    : "Enter amount in pounds (£)"}
                </p>
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-2">
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

              <div className="col-span-2 sm:col-span-1 space-y-2">
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
                className="cursor-pointer"
                onClick={() => setIsFormModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
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

      {/* Assign to User Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Assign Coupon to User</DialogTitle>
            <DialogDescription>
              Enter the user's email address. They'll receive an email with the
              coupon code{" "}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-medium">
                {selectedCoupon?.code}
              </code>
              . When someone else uses it, this user earns a{" "}
              <strong className="text-green-700">5% referral credit</strong>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAssign} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assign_email">User Email *</Label>
              <Input
                id="assign_email"
                type="email"
                placeholder="user@example.com"
                value={assignEmail}
                onChange={(e) => setAssignEmail(e.target.value)}
                required
                autoFocus
              />
              {selectedCoupon?.assigned_to_email && (
                <p className="text-xs text-amber-600">
                  ⚠️ Currently assigned to{" "}
                  <strong>{selectedCoupon.assigned_to_email}</strong>. Saving
                  will reassign and resend the email.
                </p>
              )}
            </div>

            <div className="rounded-md bg-blue-50 border border-blue-100 px-4 py-3">
              <p className="text-xs text-blue-700 leading-relaxed">
                <strong>How referral credits work:</strong> This coupon can be
                used by anyone. When a different user uses it at checkout, the
                assigned user automatically receives a 5% credit applied to
                their next order.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => {
                  setIsAssignModalOpen(false);
                  setAssignEmail("");
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isAssigning} className="cursor-pointer">
                {isAssigning ? (
                  "Sending..."
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Assign & Send Email
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
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
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 cursor-pointer"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}