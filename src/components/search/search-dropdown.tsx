"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, X, ShoppingBag, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSearchStore, SearchResult } from "@/lib/store/search-store";
import { formatPrice } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface SearchDropdownProps {
  className?: string;
  placeholder?: string;
  showClearButton?: boolean;
  onResultClick?: () => void;
}

export function SearchDropdown({
  className = "",
  placeholder = "Search products...",
  showClearButton = true,
  onResultClick,
}: SearchDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    searchQuery,
    filteredResults,
    isInitialized,
    setSearchQuery,
    clearSearch,
  } = useSearchStore();

  // Debug logging
  useEffect(() => {
    console.log("🔍 SearchDropdown state:", {
      isOpen,
      searchQuery,
      filteredResultsLength: filteredResults.length,
      isInitialized,
    });
  }, [isOpen, searchQuery, filteredResults.length, isInitialized]);

  // Note: Search data initialization is handled by SearchInitializer in layout
  // No need to initialize here as it's done globally on every page load

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    console.log("🔍 Search input changed:", query);
    setSearchQuery(query);
    const shouldOpen = query.length >= 2;
    console.log("🔍 Should open dropdown:", shouldOpen);
    setIsOpen(shouldOpen);
  };

  // Handle clear search
  const handleClear = () => {
    clearSearch();
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle result click
  const handleResultClick = () => {
    setIsOpen(false);
    onResultClick?.();
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => {
            if (searchQuery.length >= 2) {
              setIsOpen(true);
            }
          }}
          className="bg-muted w-full rounded-full pr-10 pl-10"
        />
        {searchQuery && showClearButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="hover:bg-muted-foreground/20 absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2 transform p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-popover absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-lg border shadow-lg"
          >
            {!isInitialized ? (
              <div className="text-muted-foreground p-4 text-center">
                <Package className="mx-auto mb-2 h-8 w-8 animate-pulse" />
                <p>Loading search data...</p>
              </div>
            ) : filteredResults.length > 0 ? (
              <div className="py-2">
                <div className="text-muted-foreground border-b px-3 py-2 text-xs">
                  {filteredResults.length} results found
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {filteredResults.map((result, index) => (
                    <SearchResultItem
                      key={result.id}
                      result={result}
                      onClick={handleResultClick}
                      isLast={index === filteredResults.length - 1}
                    />
                  ))}
                </div>
                <Separator />
                <div className="p-3">
                  <Link
                    href={`/products?search=${encodeURIComponent(searchQuery)}`}
                    onClick={handleResultClick}
                    className="text-primary flex items-center gap-2 text-sm hover:underline"
                  >
                    <Search className="h-4 w-4" />
                    View all results for &quot;{searchQuery}&quot;
                  </Link>
                </div>
              </div>
            ) : searchQuery.length >= 2 ? (
              <div className="text-muted-foreground p-4 text-center">
                <ShoppingBag className="mx-auto mb-2 h-8 w-8" />
                <p>No products found for &quot;{searchQuery}&quot;</p>
                <p className="mt-1 text-xs">Try different keywords</p>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface SearchResultItemProps {
  result: SearchResult;
  onClick: () => void;
  isLast: boolean;
}

function SearchResultItem({ result, onClick, isLast }: SearchResultItemProps) {
  const imageUrl =
    result.images?.find((img) => img.type === "main")?.url ||
    result.images?.[0]?.url ||
    "/placeholder.svg";

  const lowestPrice = result.variants?.length
    ? Math.min(...result.variants.map((v) => v.price))
    : result.base_price;

  return (
    <Link
      href={`/products/${result.id}`}
      onClick={onClick}
      className="hover:bg-muted/50 block px-3 py-3 transition-colors"
    >
      <div className="flex items-center gap-3">
        {/* Product Image */}
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border">
          <Image
            fill
            src={imageUrl}
            alt={result.name}
            className="h-full w-full bg-white object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
        </div>

        {/* Product Info */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium">{result.name}</h3>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-primary text-lg font-semibold">
              {formatPrice(lowestPrice)}
            </span>
            {result.variants && result.variants.length > 1 && (
              <Badge variant="secondary" className="text-xs">
                {result.variants.length} variants
              </Badge>
            )}
          </div>
          {result.category && (
            <p className="text-muted-foreground mt-1 text-xs">
              in {result.category.name}
            </p>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-col gap-1">
          {result.featured && (
            <Badge variant="default" className="text-xs">
              Featured
            </Badge>
          )}
          {result.variants?.some((v) => v.stock > 0) && (
            <Badge
              variant="secondary"
              className="border-green-200 bg-green-100 text-xs text-green-800"
            >
              In Stock
            </Badge>
          )}
        </div>
      </div>
      {!isLast && <Separator className="mt-3" />}
    </Link>
  );
}
