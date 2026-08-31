"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Edit, Plus, Save, X, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  useBedOptions,
  useCreateBedOption,
  useUpdateBedOption,
  useDeleteBedOption,
  useUploadBedOptionImage,
  useMattressTypes,
  useCreateMattressType,
  useUpdateMattressType,
  useDeleteMattressType,
  useUploadMattressTypeImage,
  useCreateMattress,
  useUpdateMattress,
  useDeleteMattress,
} from "@/hooks/use-bed-options";
import { BedOptionCatalogItem, BedOptionType, MattressType, Mattress } from "@/lib/api/bed-options";
import Image from "next/image";

const TYPE_CONFIG: { type: BedOptionType; label: string; hasHeight?: boolean }[] = [
  { type: "headboard_height", label: "Headboard Height", hasHeight: true },
  { type: "storage", label: "Storage" },
  { type: "wings", label: "Wings" },
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
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editMutation = useUpdateBedOption(editingId || "");
  const deleteMutation = useDeleteBedOption();
  const uploadImageMutation = useUploadBedOptionImage();

  const resetForm = () => {
    setFormLabel("");
    setFormCharge("0");
    setFormHeight("");
    setFormActive(true);
    setEditingId(null);
    setPendingImageFile(null);
    setPendingImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const startEdit = (opt: BedOptionCatalogItem) => {
    setEditingId(opt.id);
    setFormLabel(opt.label);
    setFormCharge(String(opt.charge));
    setFormHeight(opt.height_cm != null ? String(opt.height_cm) : "");
    setFormActive(opt.is_active);
    setPendingImageFile(null);
    setPendingImagePreview(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingImageFile(file);
    setPendingImagePreview(URL.createObjectURL(file));
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

    let savedId = editingId;
    if (editingId) {
      await editMutation.mutateAsync(payload);
    } else {
      const created = await createMutation.mutateAsync(payload);
      savedId = created.id;
    }

    // Image needs the option's id, so it's uploaded as a follow-up step after create/update
    if (pendingImageFile && savedId) {
      await uploadImageMutation.mutateAsync({ id: savedId, file: pendingImageFile });
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
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Image</label>
            <div className="flex items-center gap-2">
              {pendingImagePreview ? (
                <div className="relative h-10 w-10 overflow-hidden rounded-md border">
                  <Image src={pendingImagePreview} alt="preview" fill className="object-cover" />
                </div>
              ) : editingId ? (
                (() => {
                  const current = options.find((o) => o.id === editingId);
                  return current?.image_url ? (
                    <div className="relative h-10 w-10 overflow-hidden rounded-md border">
                      <Image src={current.image_url} alt={current.label} fill className="object-cover" />
                    </div>
                  ) : null;
                })()
              ) : null}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="text-xs" />
            </div>
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
                  {opt.image_url && (
                    <div className="relative h-8 w-8 overflow-hidden rounded-md border">
                      <Image src={opt.image_url} alt={opt.label} fill className="object-cover" />
                    </div>
                  )}
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

function MattressTypeManager() {
  const { data: types = [], isLoading } = useMattressTypes();
  const createTypeMutation = useCreateMattressType();
  const deleteTypeMutation = useDeleteMattressType();
  const uploadImageMutation = useUploadMattressTypeImage();
  const createMattressMutation = useCreateMattress();
  const deleteMattressMutation = useDeleteMattress();

  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [typeName, setTypeName] = useState("");
  const [typeActive, setTypeActive] = useState(true);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editTypeMutation = useUpdateMattressType(editingTypeId || "");

  const [expandedTypeId, setExpandedTypeId] = useState<string | null>(null);
  const [mattressName, setMattressName] = useState("");
  const [mattressSize, setMattressSize] = useState("");
  const [mattressHeight, setMattressHeight] = useState("");
  const [mattressPrice, setMattressPrice] = useState("0");
  const [editingMattressId, setEditingMattressId] = useState<string | null>(null);

  const editMattressMutation = useUpdateMattress(editingMattressId || "");

  const resetTypeForm = () => {
    setTypeName("");
    setTypeActive(true);
    setEditingTypeId(null);
    setPendingImageFile(null);
    setPendingImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startEditType = (type: MattressType) => {
    setEditingTypeId(type.id);
    setTypeName(type.name);
    setTypeActive(type.is_active);
    setPendingImageFile(null);
    setPendingImagePreview(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingImageFile(file);
    setPendingImagePreview(URL.createObjectURL(file));
  };

  const handleSaveType = async () => {
    if (!typeName.trim()) return;

    const payload = { name: typeName.trim(), is_active: typeActive };

    let savedId = editingTypeId;
    if (editingTypeId) {
      await editTypeMutation.mutateAsync(payload);
    } else {
      const created = await createTypeMutation.mutateAsync(payload);
      savedId = created.id;
    }

    if (pendingImageFile && savedId) {
      await uploadImageMutation.mutateAsync({ id: savedId, file: pendingImageFile });
    }

    resetTypeForm();
  };

  const handleDeleteType = async (id: string) => {
    const confirmed = window.confirm(
      "Delete this mattress type? All mattresses under it should be removed first."
    );
    if (!confirmed) return;
    await deleteTypeMutation.mutateAsync(id);
    if (editingTypeId === id) resetTypeForm();
    if (expandedTypeId === id) setExpandedTypeId(null);
  };

  const resetMattressForm = () => {
    setMattressName("");
    setMattressSize("");
    setMattressHeight("");
    setMattressPrice("0");
    setEditingMattressId(null);
  };

  const startEditMattress = (m: Mattress) => {
    setEditingMattressId(m.id);
    setMattressName(m.name);
    setMattressSize(m.size || "");
    setMattressHeight(m.height_cm != null ? String(m.height_cm) : "");
    setMattressPrice(String(m.price));
  };

  const handleSaveMattress = async (typeId: string) => {
    if (!mattressName.trim()) return;

    const payload = {
      mattress_type_id: typeId,
      name: mattressName.trim(),
      size: mattressSize.trim() || undefined,
      height_cm: mattressHeight ? parseFloat(mattressHeight) : undefined,
      price: parseFloat(mattressPrice) || 0,
      is_active: true,
    };

    if (editingMattressId) {
      await editMattressMutation.mutateAsync(payload);
    } else {
      await createMattressMutation.mutateAsync(payload);
    }

    resetMattressForm();
  };

  const handleDeleteMattress = async (id: string) => {
    const confirmed = window.confirm("Delete this mattress?");
    if (!confirmed) return;
    await deleteMattressMutation.mutateAsync(id);
    if (editingMattressId === id) resetMattressForm();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mattresses</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add / Edit mattress type form */}
        <div className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Type Name</label>
            <Input
              placeholder="e.g. Memory Foam"
              value={typeName}
              onChange={(e) => setTypeName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Image</label>
            <div className="flex items-center gap-2">
              {pendingImagePreview ? (
                <div className="relative h-10 w-10 overflow-hidden rounded-md border">
                  <Image src={pendingImagePreview} alt="preview" fill className="object-cover" />
                </div>
              ) : editingTypeId ? (
                (() => {
                  const current = types.find((t) => t.id === editingTypeId);
                  return current?.image_url ? (
                    <div className="relative h-10 w-10 overflow-hidden rounded-md border">
                      <Image src={current.image_url} alt={current.name} fill className="object-cover" />
                    </div>
                  ) : null;
                })()
              ) : null}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="text-xs" />
            </div>
          </div>
          <div className="flex items-center gap-2 pb-2 sm:pb-0">
            <Checkbox checked={typeActive} onCheckedChange={(c) => setTypeActive(!!c)} />
            <span className="text-sm">Active</span>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleSaveType}
              disabled={createTypeMutation.isPending || editTypeMutation.isPending}
            >
              {editingTypeId ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
              {editingTypeId ? "Save" : "Add Type"}
            </Button>
            {editingTypeId && (
              <Button type="button" variant="outline" onClick={resetTypeForm}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Type list, each expandable to show its mattresses */}
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : types.length === 0 ? (
          <p className="text-sm text-muted-foreground">No mattress types yet.</p>
        ) : (
          <div className="space-y-3">
            {types.map((type) => (
              <div key={type.id} className="rounded-md border">
                <div className="flex items-center justify-between gap-2 p-3">
                  <button
                    type="button"
                    className="flex flex-1 items-center gap-2 text-left"
                    onClick={() => setExpandedTypeId(expandedTypeId === type.id ? null : type.id)}
                  >
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                        expandedTypeId === type.id ? "rotate-0" : "-rotate-90"
                      }`}
                    />
                    {type.image_url && (
                      <div className="relative h-8 w-8 overflow-hidden rounded-md border">
                        <Image src={type.image_url} alt={type.name} fill className="object-cover" />
                      </div>
                    )}
                    <span className="text-sm font-medium">{type.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({type.mattresses?.length || 0} mattress{type.mattresses?.length === 1 ? "" : "es"})
                    </span>
                    {!type.is_active && <Badge variant="outline">Inactive</Badge>}
                  </button>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" onClick={() => startEditType(type)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDeleteType(type.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                {expandedTypeId === type.id && (
                  <div className="space-y-3 border-t bg-muted/20 p-3">
                    {/* Add / Edit mattress form */}
                    <div className="flex flex-col gap-2 rounded-md border bg-white p-3 sm:flex-row sm:items-end">
                      <div className="flex-1 space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Mattress Name</label>
                        <Input
                          placeholder="e.g. Deluxe Pocket Sprung"
                          value={mattressName}
                          onChange={(e) => setMattressName(e.target.value)}
                        />
                      </div>
                      <div className="w-full space-y-1 sm:w-32">
                        <label className="text-xs font-medium text-muted-foreground">Size</label>
                        <Input
                          placeholder="e.g. King"
                          value={mattressSize}
                          onChange={(e) => setMattressSize(e.target.value)}
                        />
                      </div>
                      <div className="w-full space-y-1 sm:w-28">
                        <label className="text-xs font-medium text-muted-foreground">Height (cm)</label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={mattressHeight}
                          onChange={(e) => setMattressHeight(e.target.value)}
                        />
                      </div>
                      <div className="w-full space-y-1 sm:w-32">
                        <label className="text-xs font-medium text-muted-foreground">Price (£)</label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={mattressPrice}
                          onChange={(e) => setMattressPrice(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={() => handleSaveMattress(type.id)}
                          disabled={createMattressMutation.isPending || editMattressMutation.isPending}
                        >
                          {editingMattressId ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                          {editingMattressId ? "Save" : "Add"}
                        </Button>
                        {editingMattressId && (
                          <Button type="button" variant="outline" onClick={resetMattressForm}>
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Mattress list */}
                    {!type.mattresses || type.mattresses.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No mattresses under this type yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {type.mattresses.map((m) => (
                          <div
                            key={m.id}
                            className="flex items-center justify-between gap-2 rounded-md border bg-white p-2"
                          >
                            <div className="flex flex-1 items-center gap-2">
                              <span className="text-sm font-medium">{m.name}</span>
                              {m.size && <span className="text-xs text-muted-foreground">({m.size})</span>}
                              {m.height_cm != null && (
                                <span className="text-xs text-muted-foreground">{m.height_cm}cm</span>
                              )}
                              {!m.is_active && <Badge variant="outline">Inactive</Badge>}
                            </div>
                            <span className="text-sm font-semibold">£{m.price.toFixed(2)}</span>
                            <div className="flex gap-1">
                              <Button variant="outline" size="icon" onClick={() => startEditMattress(m)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon" onClick={() => handleDeleteMattress(m.id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
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
  const [activeTab, setActiveTab] = useState<BedOptionType | "mattresses">("headboard_height");

  return (
    <div className="space-y-6 p-6 pt-6">
      <div>
        <h1 className="text-3xl font-bold">Bed Options</h1>
        <p className="text-muted-foreground">
          Manage the reusable headboard height, storage, wings, base, and mattress options available when configuring bed products.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as BedOptionType | "mattresses")}>
        <TabsList className="grid w-full grid-cols-5">
          {TYPE_CONFIG.map(({ type, label }) => (
            <TabsTrigger key={type} value={type}>
              {label}
            </TabsTrigger>
          ))}
          <TabsTrigger value="mattresses">Mattresses</TabsTrigger>
        </TabsList>

        {TYPE_CONFIG.map(({ type, label, hasHeight }) => (
          <TabsContent key={type} value={type} className="mt-6">
            <BedOptionTypeManager type={type} label={label} hasHeight={hasHeight} />
          </TabsContent>
        ))}

        <TabsContent value="mattresses" className="mt-6">
          <MattressTypeManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}