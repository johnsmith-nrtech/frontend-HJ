"use client";

import { useEffect, useState } from "react";
import { ContentApi, PageContent } from "@/lib/api/content";

interface PageContentViewProps {
  slug: string;
  lastUpdated?: string;
}

export default function PageContentView({ slug, lastUpdated }: PageContentViewProps) {
  const [content, setContent] = useState<PageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ContentApi.getPage(slug)
      .then(setContent)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="h-5 w-48 rounded bg-gray-200 mb-2" />
            <div className="h-4 w-full rounded bg-gray-100 mb-1" />
            <div className="h-4 w-3/4 rounded bg-gray-100" />
          </div>
        ))}
      </div>
    );
  }

  if (!content || content.sections.length === 0) {
    return (
      <p className="text-gray-500 text-sm">No content available yet.</p>
    );
  }

  return (
    <div>
      <div className="space-y-8 text-[17px] leading-relaxed text-gray-800">
        {content.sections.map((section, index) => (
          <section key={index}>
            {section.heading && (
              <h2 className="mb-2 text-xl font-semibold">{section.heading}</h2>
            )}
            {section.paragraph && <p>{section.paragraph}</p>}
          </section>
        ))}
      </div>
    </div>
  );
}