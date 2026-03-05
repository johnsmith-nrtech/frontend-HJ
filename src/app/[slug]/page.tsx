"use client";

import { useParams } from "next/navigation";
import PageContentView from "@/components/page-content-view";

export default function DynamicPage() {
  const params = useParams();
  const slug = params?.slug as string;

  return (
    <div className="mx-auto mt-12 max-w-5xl px-4 py-10 md:px-10 lg:px-24">
      <PageContentView slug={slug} showTitle />
    </div>
  );
}