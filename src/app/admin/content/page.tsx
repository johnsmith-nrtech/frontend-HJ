"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Plus, Trash2, Save, Loader2, GripVertical,
  ChevronDown, ChevronUp, FilePlus, X, Star,
  ArrowUp, ArrowDown,
} from "lucide-react";
import {
  ContentApi, PageContent, PageSection,
  TestimonialsApi, Testimonial,
  WhyChooseUsApi, WhyChooseUsItem,
} from "@/lib/api/content";
import { useAuth } from "@/lib/providers/auth-provider";

// ─── Pages Tab ────────────────────────────────────────────────────────────────

function PagesTab() {
  const { session } = useAuth();
  const token = session?.access_token || "";

  const [pages, setPages] = useState<PageContent[]>([]);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [title, setTitle] = useState("");
  const [sections, setSections] = useState<PageSection[]>([]);

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    const page = pages.find((p) => p.page_slug === activeSlug);
    if (page) { setTitle(page.title); setSections(page.sections || []); }
  }, [activeSlug, pages]);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const all = await ContentApi.getAllPages();
      setPages(all);
      if (all.length > 0) setActiveSlug(all[0].page_slug);
    } catch { toast.error("Failed to load pages"); }
    finally { setIsLoading(false); }
  };

  const handleCreate = async () => {
    if (!newPageTitle.trim()) { toast.error("Title is required"); return; }
    setIsCreating(true);
    try {
      const created = await ContentApi.createPage(newPageTitle, token);
      setPages((prev) => [...prev, created]);
      setActiveSlug(created.page_slug);
      setShowCreateModal(false);
      setNewPageTitle("");
      toast.success("Page created!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create");
    } finally { setIsCreating(false); }
  };

  const handleSave = async () => {
    if (!activeSlug) return;
    setIsSaving(true);
    try {
      const updated = await ContentApi.updatePage(activeSlug, title, sections, token);
      setPages((prev) => prev.map((p) => p.page_slug === activeSlug ? updated : p));
      toast.success("Page saved!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (!activeSlug) return;
    if (!confirm(`Delete "${title}"?`)) return;
    setIsDeleting(true);
    try {
      await ContentApi.deletePage(activeSlug, token);
      const remaining = pages.filter((p) => p.page_slug !== activeSlug);
      setPages(remaining);
      setActiveSlug(remaining.length > 0 ? remaining[0].page_slug : null);
      toast.success("Page deleted!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally { setIsDeleting(false); }
  };

  const addSection = () => setSections((prev) => [...prev, { heading: "", paragraph: "" }]);
  const removeSection = (i: number) => setSections((prev) => prev.filter((_, idx) => idx !== i));
  const updateSection = (i: number, field: keyof PageSection, value: string) =>
    setSections((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  const moveSection = (i: number, dir: "up" | "down") => {
    const arr = [...sections];
    const target = dir === "up" ? i - 1 : i + 1;
    if (target < 0 || target >= arr.length) return;
    [arr[i], arr[target]] = [arr[target], arr[i]];
    setSections(arr);
  };

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Manage policy and legal pages shown in the footer.</p>
        <div className="flex gap-3">
          <button onClick={() => setShowCreateModal(true)} className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            <FilePlus size={16} /> New Page
          </button>
          {activeSlug && (
            <>
              <button onClick={handleDelete} disabled={isDeleting} className="flex cursor-pointer items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50">
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Delete
              </button>
              <button onClick={handleSave} disabled={isSaving} className="flex cursor-pointer items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50">
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {isSaving ? "Saving..." : "Save"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        {pages.map((page) => (
          <button key={page.page_slug} onClick={() => setActiveSlug(page.page_slug)}
            className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition ${activeSlug === page.page_slug ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {page.title}
          </button>
        ))}
      </div>

      {pages.length === 0 && <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center"><p className="text-sm text-gray-400">No pages yet.</p></div>}

      {activeSlug && (
        <>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Page Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none" />
            <p className="mt-2 text-xs text-gray-400">URL: <span className="font-mono text-gray-600">/{activeSlug}</span></p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">Sections ({sections.length})</h2>
              <button onClick={addSection} className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                <Plus size={16} /> Add Section
              </button>
            </div>

            {sections.length === 0 && <div className="rounded-xl border-2 border-dashed border-gray-200 py-12 text-center"><p className="text-sm text-gray-400">No sections yet.</p></div>}

            {sections.map((section, index) => (
              <div key={index} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical size={16} className="text-gray-300" />
                    <span className="text-xs font-semibold uppercase text-gray-400">Section {index + 1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => moveSection(index, "up")} disabled={index === 0} className="cursor-pointer rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronUp size={16} /></button>
                    <button onClick={() => moveSection(index, "down")} disabled={index === sections.length - 1} className="cursor-pointer rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronDown size={16} /></button>
                    <button onClick={() => removeSection(index)} className="cursor-pointer rounded p-1 text-red-400 hover:bg-red-50"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Heading</label>
                  <input type="text" value={section.heading} onChange={(e) => updateSection(index, "heading", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Paragraph</label>
                  <textarea value={section.paragraph} onChange={(e) => updateSection(index, "paragraph", e.target.value)}
                    rows={4} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none" />
                </div>
              </div>
            ))}
            {sections.length > 0 && (
              <div className="flex justify-end">
                <button onClick={handleSave} disabled={isSaving} className="flex cursor-pointer items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50">
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {isSaving ? "Saving..." : "Save Page"}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Create New Page</h2>
              <button onClick={() => setShowCreateModal(false)} className="cursor-pointer text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Page Title</label>
            <input type="text" value={newPageTitle} onChange={(e) => setNewPageTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="e.g. Shipping Policy" autoFocus
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none" />
            {newPageTitle && (
              <p className="mt-1 text-xs text-gray-400">URL: <span className="font-mono text-gray-600">/{newPageTitle.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}</span></p>
            )}
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setShowCreateModal(false)} className="cursor-pointer rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleCreate} disabled={isCreating} className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                {isCreating ? <Loader2 size={14} className="animate-spin" /> : <FilePlus size={14} />} Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Testimonials Tab ─────────────────────────────────────────────────────────

function TestimonialsTab() {
  const { session } = useAuth();
  const token = session?.access_token || "";

  const [items, setItems] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Testimonial | null>(null);
  const [form, setForm] = useState({
    time_ago: "", rating: 5, title: "", description: "", author: "", role: "", order_index: 0,
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    try { setItems(await TestimonialsApi.getAll()); }
    catch { toast.error("Failed to load testimonials"); }
    finally { setIsLoading(false); }
  };

  const openCreate = () => {
    setEditItem(null);
    setForm({ time_ago: "1 day ago", rating: 5, title: "", description: "", author: "", role: "", order_index: items.length });
    setShowModal(true);
  };

  const openEdit = (item: Testimonial) => {
    setEditItem(item);
    setForm({ time_ago: item.time_ago, rating: item.rating, title: item.title, description: item.description, author: item.author, role: item.role, order_index: item.order_index });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.description || !form.author || !form.role) { toast.error("All fields are required"); return; }
    setIsSaving("modal");
    try {
      if (editItem) {
        const updated = await TestimonialsApi.update(editItem.id, form, token);
        setItems((prev) => prev.map((i) => i.id === editItem.id ? updated : i));
        toast.success("Testimonial updated!");
      } else {
        const created = await TestimonialsApi.create(form, token);
        setItems((prev) => [...prev, created]);
        toast.success("Testimonial created!");
      }
      setShowModal(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally { setIsSaving(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    setIsSaving(id);
    try {
      await TestimonialsApi.remove(id, token);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Deleted!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally { setIsSaving(null); }
  };

  // Move item up/down and persist new order_index to backend
  const moveItem = async (index: number, dir: "up" | "down") => {
    const arr = [...items];
    const target = dir === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    // Reassign order_index based on new positions
    const updated = arr.map((item, i) => ({ ...item, order_index: i }));
    setItems(updated);
    // Persist both swapped items
    try {
      await Promise.all([
        TestimonialsApi.update(updated[index].id, { order_index: updated[index].order_index }, token),
        TestimonialsApi.update(updated[target].id, { order_index: updated[target].order_index }, token),
      ]);
    } catch {
      toast.error("Failed to update order");
      fetchAll(); // revert on error
    }
  };

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Manage testimonials shown in the &quot;What Our Buyers Say&quot; section.</p>
        <button onClick={openCreate} className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
          <Plus size={16} /> Add Testimonial
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
          <p className="text-sm text-gray-400">No testimonials yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                {/* Up/Down arrows */}
                <div className="flex flex-col gap-1 pt-1">
                  <button onClick={() => moveItem(index, "up")} disabled={index === 0}
                    className="cursor-pointer rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed" title="Move up">
                    <ArrowUp size={16} />
                  </button>
                  <button onClick={() => moveItem(index, "down")} disabled={index === items.length - 1}
                    className="cursor-pointer rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed" title="Move down">
                    <ArrowDown size={16} />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < item.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                    ))}
                    <span className="text-xs text-gray-400">{item.time_ago}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">{item.description}</p>
                  <p className="mt-2 text-xs font-medium text-gray-700">— {item.author}, {item.role}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button onClick={() => openEdit(item)} className="cursor-pointer rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">Edit</button>
                  <button onClick={() => handleDelete(item.id)} disabled={isSaving === item.id}
                    className="cursor-pointer rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-600 hover:bg-red-100 disabled:opacity-50">
                    {isSaving === item.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{editItem ? "Edit Testimonial" : "Add Testimonial"}</h2>
              <button onClick={() => setShowModal(false)} className="cursor-pointer text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Time Ago</label>
                  <input type="text" value={form.time_ago} onChange={(e) => setForm({ ...form, time_ago: e.target.value })}
                    placeholder="e.g. 4 days ago" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Rating (1-5)</label>
                  <input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. SOFA SHOPPING MADE SIMPLE" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4} placeholder="Testimonial text..." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Author</label>
                  <input type="text" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })}
                    placeholder="e.g. Sarah M." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Role</label>
                  <input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                    placeholder="e.g. INTERIOR DESIGNER" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="cursor-pointer rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={isSaving === "modal"} className="flex cursor-pointer items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50">
                {isSaving === "modal" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {editItem ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Why Choose Us Tab ────────────────────────────────────────────────────────

const MAX_WHY_CHOOSE_US = 5;

function WhyChooseUsTab() {
  const { session } = useAuth();
  const token = session?.access_token || "";

  const [items, setItems] = useState<WhyChooseUsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<WhyChooseUsItem | null>(null);
  const [form, setForm] = useState({ title: "", description: "", order_index: 0 });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    try { setItems(await WhyChooseUsApi.getAll()); }
    catch { toast.error("Failed to load items"); }
    finally { setIsLoading(false); }
  };

  const openCreate = () => {
    if (items.length >= MAX_WHY_CHOOSE_US) {
      toast.error(`Maximum ${MAX_WHY_CHOOSE_US} features allowed`);
      return;
    }
    setEditItem(null);
    setForm({ title: "", description: "", order_index: items.length });
    setShowModal(true);
  };

  const openEdit = (item: WhyChooseUsItem) => {
    setEditItem(item);
    setForm({ title: item.title, description: item.description, order_index: item.order_index });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.description) { toast.error("Title and description are required"); return; }
    if (!editItem && items.length >= MAX_WHY_CHOOSE_US) {
      toast.error(`Maximum ${MAX_WHY_CHOOSE_US} features allowed`);
      return;
    }
    setIsSaving("modal");
    try {
      if (editItem) {
        const updated = await WhyChooseUsApi.update(editItem.id, form, token);
        setItems((prev) => prev.map((i) => i.id === editItem.id ? updated : i));
        toast.success("Updated!");
      } else {
        const created = await WhyChooseUsApi.create(form, token);
        setItems((prev) => [...prev, created]);
        toast.success("Created!");
      }
      setShowModal(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally { setIsSaving(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this feature?")) return;
    setIsSaving(id);
    try {
      await WhyChooseUsApi.remove(id, token);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Deleted!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally { setIsSaving(null); }
  };

  // Move item up/down and persist new order_index to backend
  const moveItem = async (index: number, dir: "up" | "down") => {
    const arr = [...items];
    const target = dir === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    const updated = arr.map((item, i) => ({ ...item, order_index: i }));
    setItems(updated);
    try {
      await Promise.all([
        WhyChooseUsApi.update(updated[index].id, { order_index: updated[index].order_index }, token),
        WhyChooseUsApi.update(updated[target].id, { order_index: updated[target].order_index }, token),
      ]);
    } catch {
      toast.error("Failed to update order");
      fetchAll();
    }
  };

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Manage features shown in the &quot;Why Sofa Deal&quot; section.</p>
          <p className="text-xs text-gray-400 mt-1">{items.length} / {MAX_WHY_CHOOSE_US} features used</p>
        </div>
        <button
          onClick={openCreate}
          disabled={items.length >= MAX_WHY_CHOOSE_US}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} /> Add Feature
        </button>
      </div>

      {items.length >= MAX_WHY_CHOOSE_US && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Maximum of {MAX_WHY_CHOOSE_US} features reached. Delete one to add another.
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
          <p className="text-sm text-gray-400">No features yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                {/* Up/Down arrows */}
                <div className="flex flex-col gap-1 pt-1">
                  <button onClick={() => moveItem(index, "up")} disabled={index === 0}
                    className="cursor-pointer rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed" title="Move up">
                    <ArrowUp size={16} />
                  </button>
                  <button onClick={() => moveItem(index, "down")} disabled={index === items.length - 1}
                    className="cursor-pointer rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed" title="Move down">
                    <ArrowDown size={16} />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button onClick={() => openEdit(item)} className="cursor-pointer rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">Edit</button>
                  <button onClick={() => handleDelete(item.id)} disabled={isSaving === item.id}
                    className="cursor-pointer rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-600 hover:bg-red-100 disabled:opacity-50">
                    {isSaving === item.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{editItem ? "Edit Feature" : "Add Feature"}</h2>
              <button onClick={() => setShowModal(false)} className="cursor-pointer text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Free Delivery & Free Assembly" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4} placeholder="Feature description..." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="cursor-pointer rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={isSaving === "modal"} className="flex cursor-pointer items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50">
                {isSaving === "modal" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {editItem ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Content Page ────────────────────────────────────────────────────────

type Tab = "pages" | "testimonials" | "why-choose-us";

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState<Tab>("pages");

  const tabs: { id: Tab; label: string }[] = [
    { id: "pages", label: "Pages" },
    { id: "testimonials", label: "Testimonials" },
    { id: "why-choose-us", label: "Why Sofa Deal" },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Content Management</h1>
        <p className="mt-1 text-sm text-gray-500">Manage all dynamic content across your website.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`cursor-pointer rounded-t-lg px-6 py-3 text-sm font-semibold transition border-b-2 ${
              activeTab === tab.id
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "pages" && <PagesTab />}
        {activeTab === "testimonials" && <TestimonialsTab />}
        {activeTab === "why-choose-us" && <WhyChooseUsTab />}
      </div>
    </div>
  );
}