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
import { Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  assigned_to: string;
  assigned_user_email?: string;
  expires_at: string;
  max_uses: number;
  used_count: number;
  is_active: boolean;
  created_at: string;
}

interface User {
  id: string;
  email: string;
  name?: string;
}

export default function AdminCouponsPage() {
  // 👇 Get session or user from auth provider – adjust based on your actual return
  const { session, user } = useAuth(); 
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: "",
    assigned_to: "",
    expires_at: "",
    max_uses: "1",
    is_active: true,
  });

  useEffect(() => {
    if (session?.access_token) { // 👈 wait for token to be ready
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = session?.access_token; // 👈 get token from session
      if (!token) throw new Error("No authentication token");

      const headers = { Authorization: `Bearer ${token}` };

      const couponsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/coupons`, { headers });
      const couponsData = await couponsRes.json();

      const usersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, { headers });
      const usersData = await usersRes.json();
      const usersList = usersData.items || [];

      const enrichedCoupons = couponsData.map((coupon: Coupon) => ({
        ...coupon,
        assigned_user_email: usersList.find((u: User) => u.id === coupon.assigned_to)?.email,
      }));

      setCoupons(enrichedCoupons);
      setUsers(usersList);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = session?.access_token;
      console.log("Token being sent:", token ? "Present (first 10 chars: " + token.substring(0, 10) + "...)" : "No token");
      if (!token) throw new Error("No token");

      const payload = {
        ...formData,
        discount_value: parseFloat(formData.discount_value),
        max_uses: parseInt(formData.max_uses),
        expires_at: new Date(formData.expires_at).toISOString(),
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/coupons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create coupon");
      fetchData();
      setShowForm(false);
      setFormData({
        code: "",
        discount_type: "percentage",
        discount_value: "",
        assigned_to: "",
        expires_at: "",
        max_uses: "1",
        is_active: true,
      });
    } catch (error) {
      console.error("Error creating coupon", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const token = session?.access_token;
      if (!token) throw new Error("No token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/coupons/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (error) {
      console.error("Error deleting coupon", error);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" /> New Coupon
        </Button>
      </div>

      {showForm && (
  <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-4 bg-gray-50">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="code">Coupon Code</Label>
        <Input
          id="code"
          name="code"
          value={formData.code}
          onChange={handleInputChange}
          required
          maxLength={7}
          placeholder="e.g. SAVE20"
        />
      </div>
      <div>
        <Label htmlFor="discount_type">Discount Type</Label>
        <Select
          value={formData.discount_type}
          onValueChange={(v) => handleSelectChange("discount_type", v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">Percentage (%)</SelectItem>
            <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="discount_value">Discount Value</Label>
        <Input
          id="discount_value"
          name="discount_value"
          type="number"
          step="0.01"
          min="0"
          value={formData.discount_value}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="assigned_to">Assign to User</Label>
        <Select
          value={formData.assigned_to}
          onValueChange={(v) => handleSelectChange("assigned_to", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a user" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.email} {user.name ? `(${user.name})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="expires_at">Expiry Date</Label>
        <Input
          id="expires_at"
          name="expires_at"
          type="date"
          value={formData.expires_at}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="max_uses">Max Uses</Label>
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
    </div>
    <div className="flex justify-end space-x-2">
      <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
        Cancel
      </Button>
      <Button type="submit">Create Coupon</Button>
    </div>
  </form>
)}


      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Assigned User</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Uses</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell className="font-mono">{coupon.code}</TableCell>
                <TableCell>
                  {coupon.discount_type === "percentage"
                    ? `${coupon.discount_value}%`
                    : `$${coupon.discount_value}`}
                </TableCell>
                <TableCell>{coupon.assigned_user_email || coupon.assigned_to}</TableCell>
                <TableCell>
                  {coupon.expires_at ? format(new Date(coupon.expires_at), "PPP") : "Never"}
                </TableCell>
                <TableCell>
                  {coupon.used_count} / {coupon.max_uses}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      coupon.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {coupon.is_active ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}