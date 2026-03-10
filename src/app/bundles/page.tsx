"use client";

import { useState } from "react";
import Image from "next/image";

import { BundleCard } from "@/components/bundle-card";
import { MarqueeStrip } from "@/components/marquee-strip";
import { Button } from "@/components/button-custom";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useBundles } from "@/hooks/use-bundles";
import { Bundle } from "@/lib/api/bundles";
import { cn } from "@/lib/utils";

// ─── Marquee items (same as /products) ───────────────────────
const marqueeItems = [
  { text: "10-YEARS GUARANTEE", icon: "/sofa-icon.png" },
  { text: "100-NIGHT TRIAL", icon: "/sofa-icon.png" },
  { text: "EASY RETURN", icon: "/sofa-icon.png" },
  { text: "FREE DELIVERY", icon: "/sofa-icon.png" },
  { text: "10-YEARS GUARANTEE", icon: "/sofa-icon.png" },
];

export default function BundlesPage() {
  const { data: bundles = [], isLoading, isError } = useBundles(true);

  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [viewMode, setViewMode] = useState("grid");
  const [search, setSearch] = useState("");

  // ─── Compute final price helper ───────────────────────
  const getFinalPrice = (b: Bundle) =>
    b.discount_value > 0
      ? b.discount_type === "percentage"
        ? b.bundleprice - (b.bundleprice * b.discount_value) / 100
        : b.bundleprice - b.discount_value
      : b.bundleprice;

  // ─── Filter + Sort ────────────────────────────────────
  const displayBundles = (() => {
    let result = [...bundles];

    if (priceRange !== "all") {
      result = result.filter((b) => {
        const p = getFinalPrice(b);
        switch (priceRange) {
          case "under-500":  return p < 500;
          case "500-1000":   return p >= 500 && p <= 1000;
          case "1000-2000":  return p >= 1000 && p <= 2000;
          case "over-2000":  return p > 2000;
          default:           return true;
        }
      });
    }

    if (search.trim().length >= 1) {
        result = result.filter((b) =>
            b.bundlename.toLowerCase().includes(search.trim().toLowerCase())
        );
    }

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "price_low_high": return getFinalPrice(a) - getFinalPrice(b);
        case "price_high_low": return getFinalPrice(b) - getFinalPrice(a);
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  })();

  const resetFilters = () => {
    setPriceRange("all");
    setSortBy("created_at");
  };

  return (
    <div className="w-full">

      {/* ─── Hero ──────────────────────────────────────── */}
      <div className="relative h-[220px] w-full overflow-hidden bg-[#e8f0f7] sm:h-[280px] md:h-[320px]">
        <div className="flex h-full flex-col items-start justify-center px-6 sm:px-[32px]">
          <p className="font-open-sans mb-2 text-sm font-medium uppercase tracking-widest text-[#56748e]">
            Curated Collections
          </p>
          <h1 className="font-bebas text-4xl uppercase text-[#222222] sm:text-5xl md:text-6xl">
            All Bundles
          </h1>
          <p className="font-open-sans mt-2 max-w-md text-sm text-gray-500">
            Hand-picked product combinations — save more when you buy together.
          </p>
        </div>
      </div>

      {/* ─── Marquee ───────────────────────────────────── */}
      {/* <MarqueeStrip
        items={marqueeItems}
        backgroundColor="bg-blue"
        textColor="text-white"
        className="py-3 sm:py-4 md:mt-[-70px] 2xl:mt-[0px]"
      /> */}

      {/* ─── Main ──────────────────────────────────────── */}
      <div className="bg-gray-50 py-8 md:py-12">
        <div className="px-4 sm:px-[32px]">

          {/* Filters */}
          <div className="mb-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

              {/* Price filter */}
              <div className="flex justify-between gap-4 sm:flex-row">
                <div className="flex flex-col items-start gap-2">
                  <span className="text-sm font-medium tracking-wide text-gray-400 uppercase">
                    Prices
                  </span>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger className="text-blue border-blue h-16 w-[130px] rounded-full px-4 sm:w-[280px]">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="under-500">Under £500</SelectItem>
                      <SelectItem value="500-1000">£500 - £1000</SelectItem>
                      <SelectItem value="1000-2000">£1000 - £2000</SelectItem>
                      <SelectItem value="over-2000">Over £2000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col items-start gap-2">
  <span className="text-sm font-medium tracking-wide text-gray-400 uppercase">
    Search
  </span>
  <div className="relative">
    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-blue" />
    <input
      type="text"
      placeholder="Search bundles..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="text-blue border-blue h-9 w-[130px] rounded-full border pl-10 pr-4 text-sm bg-white shadow-sm outline-none focus:ring-0 placeholder:text-gray-400 sm:w-[280px]"
    />
  </div>
</div>

              {/* Sort + View mode */}
              <div className="flex items-center gap-6">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="flex h-auto w-auto items-center gap-1 border-0 bg-transparent p-0 shadow-none">
                    <span className="text-sm font-medium text-[#999]">Sort By</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price_low_high">Price: Low to High</SelectItem>
                    <SelectItem value="price_high_low">Price: High to Low</SelectItem>
                    <SelectItem value="created_at">Newest</SelectItem>
                  </SelectContent>
                </Select>

                <div className="hidden items-center lg:flex">
                  {["grid", "grid-small", "list", "list-detailed"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className="border-gray border p-3"
                    >
                      <Image
                        src={
                          viewMode === mode
                            ? `/l-${mode === "grid" ? "11" : mode === "grid-small" ? "22" : mode === "list" ? "33" : "44"}.png`
                            : `/l-${mode === "grid" ? "1" : mode === "grid-small" ? "2" : mode === "list" ? "3" : "4"}.png`
                        }
                        alt={mode}
                        width={20}
                        height={20}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-96 animate-pulse rounded-lg bg-gray-200" />
              ))}
            </div>
          ) : isError ? (
            <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
              <p>Error loading bundles. Please try again later.</p>
            </div>
          ) : displayBundles.length > 0 ? (
            <div
              className={cn("grid gap-6", {
                "grid-cols-2 lg:grid-cols-3":               viewMode === "grid",
                "grid-cols-2 md:grid-cols-3 lg:grid-cols-4": viewMode === "grid-small",
                "grid-cols-2 md:grid-cols-2":               viewMode === "list",
                "grid-cols-1":                              viewMode === "list-detailed",
              })}
            >
              {displayBundles.map((bundle, index) => (
                <BundleCard
                  key={bundle.id}
                  bundle={bundle}
                  variant={index % 2 === 0 ? "layout1" : "layout2"}
                  className={viewMode === "list-detailed" ? "list-detailed-view" : ""}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border bg-white py-12 text-center">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium">No bundles found</h3>
              <p className="mx-auto mt-2 max-w-md text-gray-500">
                Try adjusting your filters or check back soon for new bundles.
              </p>
              <Button variant="primary" size="md" className="mt-4" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}