"use client";

import { useState } from "react";
import {
  useFaqsAdmin,
  useCreateFaq,
  useUpdateFaq,
  useReorderFaqs,
  useDeleteFaq,
} from "@/hooks/use-faq";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowUp, ArrowDown, Trash2, Plus, Loader2 } from "lucide-react";
import { Faq } from "@/lib/api/faq";

export default function AdminFaqsPage() {
  const { data: faqs = [], isLoading } = useFaqsAdmin();
  const createFaq = useCreateFaq();
  const updateFaq = useUpdateFaq();
  const reorderFaqs = useReorderFaqs();
  const deleteFaq = useDeleteFaq();

  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  const sorted = [...faqs].sort((a, b) => a.order - b.order);

  const handleCreate = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    createFaq.mutate(
      { question: newQuestion.trim(), answer: newAnswer.trim() },
      {
        onSuccess: () => {
          setNewQuestion("");
          setNewAnswer("");
        },
      }
    );
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const reordered = [...sorted];
    [reordered[index], reordered[targetIndex]] = [
      reordered[targetIndex],
      reordered[index],
    ];

    const items = reordered.map((faq, i) => ({ id: faq.id, order: i }));
    reorderFaqs.mutate(items);
  };

  const handleToggleActive = (faq: Faq) => {
    updateFaq.mutate({ id: faq.id, data: { is_active: !faq.is_active } });
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this FAQ?")) {
      deleteFaq.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Manage FAQs</h1>

      {/* Add new FAQ */}
      {sorted.length >= 4 ? (
        <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            Maximum of 4 FAQs reached. Delete an existing FAQ to add a new one.
          </p>
        </div>
      ) : (
        <div className="mb-8 space-y-3 rounded-lg border border-gray-200 p-4">
          <h2 className="font-semibold">Add New FAQ ({sorted.length}/4)</h2>
          <Input
            placeholder="Question"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
          />
          <Textarea
            placeholder="Answer"
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            rows={3}
          />
          <Button
            onClick={handleCreate}
            disabled={createFaq.isPending}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {createFaq.isPending ? "Adding..." : "Add FAQ"}
          </Button>
        </div>
      )}

      {/* FAQ list */}
      <div className="space-y-3">
        {sorted.length === 0 ? (
          <p className="text-sm text-gray-500">No FAQs yet. Add one above.</p>
        ) : (
          sorted.map((faq, index) => (
            <div
              key={faq.id}
              className={`rounded-lg border p-4 ${
                faq.is_active ? "border-gray-200" : "border-gray-100 bg-gray-50 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium">{faq.question}</p>
                  <p className="mt-1 text-sm text-gray-500">{faq.answer}</p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleMove(index, "up")}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleMove(index, "down")}
                    disabled={index === sorted.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Switch
                    checked={faq.is_active}
                    onCheckedChange={() => handleToggleActive(faq)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => handleDelete(faq.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}