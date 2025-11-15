"use client";

import { useSearchInitialization } from "@/hooks/use-search-initialization";

/**
 * Component that initializes search data when the app loads
 * This component doesn't render anything, it just handles initialization
 */
export function SearchInitializer() {
  // Initialize search data automatically
  useSearchInitialization();

  // This component doesn't render anything
  return null;
}
