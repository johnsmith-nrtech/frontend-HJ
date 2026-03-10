// src/hooks/use-bundles.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchBundles,
  fetchBundle,
  createBundle,
  updateBundle,
  deleteBundle,
  CreateBundlePayload,
  UpdateBundlePayload,
} from "@/lib/api/bundles";
import { toast } from "sonner";

// ─── Query Keys ───────────────────────────────────────────────
export const bundleKeys = {
  all: ["bundles"] as const,
  lists: () => [...bundleKeys.all, "list"] as const,
  list: (onlyActive: boolean) =>
    [...bundleKeys.lists(), { onlyActive }] as const,
  detail: (id: string) => [...bundleKeys.all, "detail", id] as const,
};

// ─── Fetch all bundles ────────────────────────────────────────
export function useBundles(onlyActive = false) {
  return useQuery({
    queryKey: bundleKeys.list(onlyActive),
    queryFn: () => fetchBundles(onlyActive),
  });
}

// ─── Fetch single bundle ──────────────────────────────────────
export function useBundle(id: string) {
  return useQuery({
    queryKey: bundleKeys.detail(id),
    queryFn: () => fetchBundle(id),
    enabled: !!id,
  });
}

// ─── Create bundle ────────────────────────────────────────────
export function useCreateBundle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payload,
      token,
    }: {
      payload: CreateBundlePayload;
      token: string;
    }) => createBundle(payload, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bundleKeys.lists() });
      toast.success("Bundle created successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create bundle: ${error.message}`);
    },
  });
}

// ─── Update bundle ────────────────────────────────────────────
export function useUpdateBundle(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payload,
      token,
    }: {
      payload: UpdateBundlePayload;
      token: string;
    }) => updateBundle(id, payload, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bundleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bundleKeys.detail(id) });
      toast.success("Bundle updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update bundle: ${error.message}`);
    },
  });
}

// ─── Delete bundle ────────────────────────────────────────────
export function useDeleteBundle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, token }: { id: string; token: string }) =>
      deleteBundle(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bundleKeys.lists() });
      toast.success("Bundle deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete bundle: ${error.message}`);
    },
  });
}