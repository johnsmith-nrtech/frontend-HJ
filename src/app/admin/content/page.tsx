"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Save, Loader2, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import { ContentApi, PageContent, PageSection } from "@/lib/api/content";

const PAGE_TABS = [
  { slug: "terms", label: "Terms & Conditions" },
  { slug: "privacy", label: "Privacy Policy" },
  { slug: "returns", label: "Returns & Refund" },
  { slug: "cookies", label: "Cookie Policy" },
  { slug: "legal-advisory", label: "Legal Advisory" },
  { slug: "user-data-protection", label: "User Data Protection" },
];

export default function ContentPage() {
  const [activeSlug, setActiveSlug] = useState("terms");
  const [pages, setPages] = useState<Record<string, PageContent>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Local edit state for active page
  const [title, setTitle] = useState("");
  const [sections, setSections] = useState<PageSection[]>([]);

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (pages[activeSlug]) {
      setTitle(pages[activeSlug].title);
      setSections(pages[activeSlug].sections || []);
    }
  }, [activeSlug, pages]);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const all = await ContentApi.getAllPages();
      const map: Record<string, PageContent> = {};
      all.forEach((p) => (map[p.page_slug] = p));
      setPages(map);
      // Set initial active page
      const first = all.find((p) => p.page_slug === "terms");
      if (first) {
        setTitle(first.title);
        setSections(first.sections || []);
      }
    } catch (err) {
      toast.error("Failed to load pages");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await ContentApi.updatePage(activeSlug, title, sections);
      setPages((prev) => ({ ...prev, [activeSlug]: updated }));
      toast.success("Page saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const addSection = () => {
    setSections((prev) => [...prev, { heading: "", paragraph: "" }]);
  };

  const removeSection = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSection = (index: number, field: keyof PageSection, value: string) => {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

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
          <p className="mt-1 text-sm text-gray-500">
            Manage content for all policy and legal pages.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center cursor-pointer gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isSaving ? "Saving..." : "Save Page"}
        </button>
      </div>

      {/* Page Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        {PAGE_TABS.map((tab) => (
          <button
            key={tab.slug}
            onClick={() => setActiveSlug(tab.slug)}
            className={`rounded-lg cursor-pointer px-4 py-2 text-sm font-medium transition ${
              activeSlug === tab.slug
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Page Title */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
          Page Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Terms and Conditions"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>

      {/* Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">
            Sections ({sections.length})
          </h2>
          <button
            onClick={addSection}
            className="flex items-center gap-2 cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
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
          <div
            key={index}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            {/* Section header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical size={16} className="text-gray-300" />
                <span className="text-xs font-semibold uppercase text-gray-400">
                  Section {index + 1}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => moveSection(index, "up")}
                  disabled={index === 0}
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  onClick={() => moveSection(index, "down")}
                  disabled={index === sections.length - 1}
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
                >
                  <ChevronDown size={16} />
                </button>
                <button
                  onClick={() => removeSection(index)}
                  className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-3">
              <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
                Heading
              </label>
              <input
                type="text"
                value={section.heading}
                onChange={(e) => updateSection(index, "heading", e.target.value)}
                placeholder="e.g. 1. Overview"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>

            {/* Paragraph */}
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
                Paragraph
              </label>
              <textarea
                value={section.paragraph}
                onChange={(e) => updateSection(index, "paragraph", e.target.value)}
                placeholder="Enter paragraph text..."
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Save */}
      {sections.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 cursor-pointer rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isSaving ? "Saving..." : "Save Page"}
          </button>
        </div>
      )}
    </div>
  );
}