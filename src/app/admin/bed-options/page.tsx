"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Edit, Plus, Save, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  useBedOptions,
  useCreateBedOption,
  useUpdateBedOption,
  useDeleteBedOption,
} from "@/hooks/use-bed-options";
import { BedOptionCatalogItem, BedOptionType } from "@/lib/api/bed-options";

const TYPE_CONFIG: { type: BedOptionType; label: string; hasHeight?: boolean }[] = [
  { type: "headboard_height", label: "Headboard Height", hasHeight: true },
  { type: "storage", label: "Storage" },
  { type: "wings", label: "Wings" },
  { type: "mattress", label: "Mattress" },
  { type: "base", label: "Base" },
];

function BedOptionTypeManager({ type, label, hasHeight }: { type: BedOptionType; label: string; hasHeight?: boolean }) {
  const { data: options = [], isLoading } = useBedOptions({ type });
  const createMutation = useCreateBedOption();
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formLabel, setFormLabel] = useState("");
  const [formCharge, setFormCharge] = useState("0");
  const [formHeight, setFormHeight] = useState("");
  const [formActive, setFormActive] = useState(true);

  const editMutation = useUpdateBedOption(editingId || "");
  const deleteMutation = useDeleteBedOption();

  const resetForm = () => {
    setFormLabel("");
    setFormCharge("0");
    setFormHeight("");
    setFormActive(true);
    setEditingId(null);
  };

  const startEdit = (opt: BedOptionCatalogItem) => {
    setEditingId(opt.id);
    setFormLabel(opt.label);
    setFormCharge(String(opt.charge));
    setFormHeight(opt.height_cm != null ? String(opt.height_cm) : "");
    setFormActive(opt.is_active);
  };

  const handleSave = async () => {
    if (!formLabel.trim()) return;
    if (hasHeight && !formHeight.trim()) return;

    const payload = {
      type,
      label: formLabel.trim(),
      charge: parseFloat(formCharge) || 0,
      ...(hasHeight ? { height_cm: parseFloat(formHeight) || 0 } : {}),
      is_active: formActive,
    };

    if (editingId) {
      await editMutation.mutateAsync(payload);
    } else {
      await createMutation.mutateAsync(payload);
    }
    resetForm();
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this option? Products already using it will keep it in their saved configuration.");
    if (!confirmed) return;
    await deleteMutation.mutateAsync(id);
    if (editingId === id) resetForm();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add / Edit form */}
        <div className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Label</label>
            <Input
              placeholder={`e.g. Ottoman ${label}`}
              value={formLabel}
              onChange={(e) => setFormLabel(e.target.value)}
            />
          </div>
          {hasHeight && (
            <div className="w-full space-y-1 sm:w-32">
              <label className="text-xs font-medium text-muted-foreground">Height (cm)</label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={formHeight}
                onChange={(e) => setFormHeight(e.target.value)}
              />
            </div>
          )}
          <div className="w-full space-y-1 sm:w-32">
            <label className="text-xs font-medium text-muted-foreground">Charge (£)</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formCharge}
              onChange={(e) => setFormCharge(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 pb-2 sm:pb-0">
            <Checkbox checked={formActive} onCheckedChange={(c) => setFormActive(!!c)} />
            <span className="text-sm">Active</span>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleSave}
              disabled={createMutation.isPending || editMutation.isPending}
            >
              {editingId ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
              {editingId ? "Save" : "Add"}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : options.length === 0 ? (
          <p className="text-sm text-muted-foreground">No {label.toLowerCase()} options yet.</p>
        ) : (
          <div className="space-y-2">
            {options.map((opt) => (
              <div
                key={opt.id}
                className="flex items-center justify-between gap-2 rounded-md border p-2"
              >
                <div className="flex flex-1 items-center gap-2">
                  <span className="text-sm font-medium">{opt.label}</span>
                  {hasHeight && opt.height_cm != null && (
                    <span className="text-xs text-muted-foreground">({opt.height_cm}cm)</span>
                  )}
                  {!opt.is_active && <Badge variant="outline">Inactive</Badge>}
                </div>
                <span className="text-sm font-semibold">
                  {opt.charge > 0 ? `+£${opt.charge.toFixed(2)}` : "Free"}
                </span>
                <div className="flex gap-1">
                  <Button variant="outline" size="icon" onClick={() => startEdit(opt)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleDelete(opt.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function BedOptionsPage() {
  useAuth({ redirectTo: "/login", requireAuth: true });
  const [activeTab, setActiveTab] = useState<BedOptionType>("headboard_height");

  return (
    <div className="space-y-6 p-6 pt-6">
      <div>
        <h1 className="text-3xl font-bold">Bed Options</h1>
        <p className="text-muted-foreground">
          Manage the reusable headboard height, storage, wings, mattress and base options available when configuring bed products.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as BedOptionType)}>
        <TabsList className="grid w-full grid-cols-5">
          {TYPE_CONFIG.map(({ type, label }) => (
            <TabsTrigger key={type} value={type}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TYPE_CONFIG.map(({ type, label, hasHeight }) => (
          <TabsContent key={type} value={type} className="mt-6">
            <BedOptionTypeManager type={type} label={label} hasHeight={hasHeight} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}