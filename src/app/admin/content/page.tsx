"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Save, Loader2, GripVertical, ChevronDown, ChevronUp, FilePlus, X } from "lucide-react";
import { ContentApi, PageContent, PageSection } from "@/lib/api/content";

export default function ContentPage() {
  const [pages, setPages] = useState<PageContent[]>([]);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");

  // Edit state
  const [title, setTitle] = useState("");
  const [sections, setSections] = useState<PageSection[]>([]);

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    const page = pages.find((p) => p.page_slug === activeSlug);
    if (page) {
      setTitle(page.title);
      setSections(page.sections || []);
    }
  }, [activeSlug, pages]);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const all = await ContentApi.getAllPages();
      setPages(all);
      if (all.length > 0 && !activeSlug) setActiveSlug(all[0].page_slug);
    } catch {
      toast.error("Failed to load pages");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newPageTitle.trim()) { toast.error("Title is required"); return; }
    setIsCreating(true);
    try {
      const created = await ContentApi.createPage(newPageTitle);
      setPages((prev) => [...prev, created]);
      setActiveSlug(created.page_slug);
      setShowCreateModal(false);
      setNewPageTitle("");
      toast.success("Page created!");
    } catch (err: any) {
      toast.error(err.message || "Failed to create");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSave = async () => {
    if (!activeSlug) return;
    setIsSaving(true);
    try {
      const updated = await ContentApi.updatePage(activeSlug, title, sections);
      setPages((prev) => prev.map((p) => p.page_slug === activeSlug ? updated : p));
      toast.success("Page saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!activeSlug) return;
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    setIsDeleting(true);
    try {
      await ContentApi.deletePage(activeSlug);
      const remaining = pages.filter((p) => p.page_slug !== activeSlug);
      setPages(remaining);
      setActiveSlug(remaining.length > 0 ? remaining[0].page_slug : null);
      toast.success("Page deleted!");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  const addSection = () => setSections((prev) => [...prev, { heading: "", paragraph: "" }]);

  const removeSection = (index: number) => setSections((prev) => prev.filter((_, i) => i !== index));

  const updateSection = (index: number, field: keyof PageSection, value: string) =>
    setSections((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));

  const moveSection = (index: number, direction: "up" | "down") => {
    const newSections = [...sections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    setSections(newSections);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Page Content</h1>
          <p className="mt-1 text-sm text-gray-500">Manage content for all policy and legal pages.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <FilePlus size={16} />
            New Page
          </button>
          {activeSlug && (
            <>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Delete Page
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex cursor-pointer items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isSaving ? "Saving..." : "Save Page"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Page Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        {pages.map((page) => (
          <button
            key={page.page_slug}
            onClick={() => setActiveSlug(page.page_slug)}
            className={`rounded-lg cursor-pointer px-4 py-2 text-sm font-medium transition ${
              activeSlug === page.page_slug
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {page.title}
          </button>
        ))}
      </div>

      {pages.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
          <p className="text-sm text-gray-400">No pages yet. Click "New Page" to create one.</p>
        </div>
      )}

      {activeSlug && (
        <>
          {/* Page Title */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Page Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Terms and Conditions"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            <p className="mt-2 text-xs text-gray-400">
              URL: <span className="font-mono text-gray-600">/{activeSlug}</span>
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">Sections ({sections.length})</h2>
              <button
                onClick={addSection}
                className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Plus size={16} />
                Add Section
              </button>
            </div>

            {sections.length === 0 && (
              <div className="rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
                <p className="text-sm text-gray-400">No sections yet. Click "Add Section" to start.</p>
              </div>
            )}

            {sections.map((section, index) => (
              <div key={index} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical size={16} className="text-gray-300" />
                    <span className="text-xs font-semibold uppercase text-gray-400">Section {index + 1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => moveSection(index, "up")} disabled={index === 0} className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30">
                      <ChevronUp size={16} />
                    </button>
                    <button onClick={() => moveSection(index, "down")} disabled={index === sections.length - 1} className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30">
                      <ChevronDown size={16} />
                    </button>
                    <button onClick={() => removeSection(index)} className="rounded p-1 text-red-400 hover:bg-red-50">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Heading</label>
                  <input
                    type="text"
                    value={section.heading}
                    onChange={(e) => updateSection(index, "heading", e.target.value)}
                    placeholder="e.g. 1. Overview"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Paragraph</label>
                  <textarea
                    value={section.paragraph}
                    onChange={(e) => updateSection(index, "paragraph", e.target.value)}
                    placeholder="Enter paragraph text..."
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                </div>
                {index === sections.length - 1 && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex cursor-pointer items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      {isSaving ? "Saving..." : "Save Page"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Create Page Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Create New Page</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Page Title</label>
            <input
              type="text"
              value={newPageTitle}
              onChange={(e) => setNewPageTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="e.g. Shipping Policy"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              autoFocus
            />
            {newPageTitle && (
              <p className="mt-1 text-xs text-gray-400">
                URL: <span className="font-mono text-gray-600">/{newPageTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}</span>
              </p>
            )}
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setShowCreateModal(false)} className="rounded-lg cursor-pointer border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={isCreating}
                className="flex items-center gap-2 rounded-lg cursor-pointer bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isCreating ? <Loader2 size={14} className="animate-spin" /> : <FilePlus size={14} />}
                Create Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}