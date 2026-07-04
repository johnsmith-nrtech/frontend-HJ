"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/providers/auth-provider";

export function ReferralTracker() {
  const { session } = useAuth();
  const pathname = usePathname();

  // Detect hard refresh and strip ref immediately, before capture effect runs
  useEffect(() => {
    const navEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    const isReload = navEntries.length > 0 && navEntries[0].type === "reload";

    if (isReload) {
      localStorage.removeItem("incoming_ref_code");
      const url = new URL(window.location.href);
      if (url.searchParams.has("ref")) {
        url.searchParams.delete("ref");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, []); // runs once on mount only

  // Capture ?ref= from URL into localStorage, on ANY page
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) {
      localStorage.setItem("incoming_ref_code", ref);
    }
  }, [pathname]);

  // Auto-append the logged-in user's own referral code to the URL —
  // but back off if a pasted/incoming referral code is already stored,
  // so a pasted code always wins over the user's own until next refresh.
  useEffect(() => {
    if (!session?.access_token) return;

    const existingRef = new URLSearchParams(window.location.search).get("ref");
    if (existingRef) return;

    if (localStorage.getItem("incoming_ref_code")) return;

    const appendOwnRefCode = async () => {
      await new Promise((res) => setTimeout(res, 300));
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/coupons/user/referral-code`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.referral_code) {
          const url = new URL(window.location.href);
          url.searchParams.set("ref", data.referral_code);
          window.history.replaceState({}, "", url.toString());

          document.cookie = "ref_code=; Max-Age=0; path=/;";
        }
      } catch (err) {
        console.error("Failed to fetch own referral code:", err);
      }
    };

    appendOwnRefCode();
  }, [session, pathname]);

  // Only strip ref right after an explicit logout — not for guests
  // who intentionally pasted a referral link.
  useEffect(() => {
    if (sessionStorage.getItem("just_logged_out")) {
      sessionStorage.removeItem("just_logged_out");
      const url = new URL(window.location.href);
      if (url.searchParams.has("ref")) {
        url.searchParams.delete("ref");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, [pathname]);

  // Re-append a pasted/stored ref code across navigation — for guests AND
  // logged-in users, so a pasted code persists on every page until refresh.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has("ref")) return; // already present

    const storedRef = localStorage.getItem("incoming_ref_code");
    if (storedRef) {
      url.searchParams.set("ref", storedRef);
      window.history.replaceState({}, "", url.toString());
    }
  }, [pathname]);

  return null;
}