"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Package, ShoppingBag } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSearchStore } from "@/lib/store/search-store";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";

interface SearchCommandProps {
  className?: string;
}

export function SearchCommand({ className = "" }: SearchCommandProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const {
    searchQuery,
    filteredResults,
    isInitialized,
    setSearchQuery,
    clearSearch,
  } = useSearchStore();

  // Note: Search data initialization is handled by SearchInitializer in layout
  // No need to initialize here as it's done globally on every page load

  // Toggle dialog with Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (productId: string) => {
    setOpen(false);
    clearSearch();
    router.push(`/products/${productId}`);
  };

  const handleViewAll = () => {
    setOpen(false);
    router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    clearSearch();
  };

  return (
    <>
      <Button
        variant="outline"
        className={`bg-muted/50 text-muted-foreground relative h-9 w-full justify-start rounded-full text-sm font-normal shadow-none sm:pr-12 md:w-40 lg:w-64 ${className}`}
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        Search products...
        <kbd className="bg-muted pointer-events-none absolute top-1.5 right-1.5 hidden h-6 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search Products"
        description="Search for furniture and home products"
      >
        <CommandInput
          placeholder="Type to search products..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          {!isInitialized ? (
            <CommandEmpty>
              <div className="flex flex-col items-center gap-2 py-4">
                <Package className="text-muted-foreground h-8 w-8 animate-pulse" />
                <p className="text-muted-foreground text-sm">
                  Loading search data...
                </p>
              </div>
            </CommandEmpty>
          ) : filteredResults.length > 0 ? (
            <>
              <CommandGroup heading="Products">
                {filteredResults.slice(0, 8).map((result) => (
                  <CommandItem
                    key={result.id}
                    value={result.id}
                    onSelect={() => handleSelect(result.id)}
                    className="flex items-center gap-3 p-3"
                  >
                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border">
                      <Image
                        fill
                        src={
                          result.images?.find((img) => img.type === "main")
                            ?.url ||
                          result.images?.[0]?.url ||
                          "/placeholder.svg"
                        }
                        alt={result.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder.svg";
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {result.name}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-primary text-sm font-semibold">
                          {formatPrice(
                            result.variants?.length
                              ? Math.min(...result.variants.map((v) => v.price))
                              : result.base_price
                          )}
                        </span>
                        {result.category && (
                          <Badge variant="secondary" className="text-xs">
                            {result.category.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {result.featured && (
                      <Badge variant="default" className="text-xs">
                        Featured
                      </Badge>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>

              {filteredResults.length > 8 && (
                <CommandGroup>
                  <CommandItem onSelect={handleViewAll} className="text-center">
                    <Search className="mr-2 h-4 w-4" />
                    View all {filteredResults.length} results for &quot;
                    {searchQuery}&quot;
                  </CommandItem>
                </CommandGroup>
              )}
            </>
          ) : searchQuery.length >= 2 ? (
            <CommandEmpty>
              <div className="flex flex-col items-center gap-2 py-6">
                <ShoppingBag className="text-muted-foreground h-8 w-8" />
                <p className="text-muted-foreground text-sm">
                  No products found for &quot;{searchQuery}&quot;
                </p>
                <p className="text-muted-foreground text-xs">
                  Try different keywords or browse all products
                </p>
              </div>
            </CommandEmpty>
          ) : (
            <CommandEmpty>
              <div className="flex flex-col items-center gap-2 py-6">
                <Search className="text-muted-foreground h-8 w-8" />
                <p className="text-muted-foreground text-sm">
                  Start typing to search products...
                </p>
                <p className="text-muted-foreground text-xs">
                  Search by name, category, material, or brand
                </p>
              </div>
            </CommandEmpty>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
