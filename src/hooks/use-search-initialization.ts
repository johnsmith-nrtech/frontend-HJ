"use client";

import { useEffect } from "react";
import { useSearchStore } from "@/lib/store/search-store";

/**
 * Hook to manage search data initialization
 * Automatically refreshes search data on every screen reload
 * Uses localStorage cache when available to avoid unnecessary API calls
 */
export function useSearchInitialization() {
  const { initializeSearchData, isInitialized, forceRefresh } =
    useSearchStore();

  // Initialize/refresh search data on every screen reload
  useEffect(() => {
    // Always call initializeSearchData on mount
    // The store will handle checking localStorage cache and deciding whether to make API calls
    initializeSearchData();
  }, [initializeSearchData]); // Include initializeSearchData in dependencies

  // Return functions for manual control
  return {
    initializeSearchData,
    forceRefresh,
    isInitialized,
  };
}
