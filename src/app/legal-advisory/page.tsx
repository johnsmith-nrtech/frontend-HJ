"use client";
import PageContentView from "@/components/page-content-view";

export default function LegalAdvisoryPage() {
  return (
    <div className="mx-auto mt-4 max-w-4xl px-4 py-10 md:px-10 lg:px-24">
      <h1 className="mb-10 text-4xl font-bold text-gray-900">Legal Advisory</h1>
      <PageContentView slug="legal-advisory" />
    </div>
  );
}