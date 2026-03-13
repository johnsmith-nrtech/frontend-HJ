"use client";

import { useState, useRef, useEffect } from "react";
import { useProducts } from "@/hooks/use-products";
import { X, Search, ChevronDown } from "lucide-react";
import Image from "next/image";

interface RelatedProductsSelectorProps {
  value: string[];
  onChange: (ids: string[]) => void;
  excludeProductId?: string;
}

export function RelatedProductsSelector({
  value,
  onChange,
  excludeProductId,
}: RelatedProductsSelectorProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useProducts({
    search: search.length >= 2 ? search : undefined,
    limit: 20,
    includeImages: true,
    includeVariants: false,
  });

  const allProducts = (data?.items || []).filter(
    (p: any) => p.id !== excludeProductId
  );

  const selectedProducts = allProducts.filter((p: any) =>
    value.includes(p.id)
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleProduct = (productId: string) => {
    if (value.includes(productId)) {
      onChange(value.filter((id) => id !== productId));
    } else {
      onChange([...value, productId]);
    }
  };

  const removeProduct = (productId: string) => {
    onChange(value.filter((id) => id !== productId));
  };

  return (
    <div className="space-y-3" ref={dropdownRef}>
      {/* Selected Products Tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((id) => {
            const product = allProducts.find((p: any) => p.id === id);
            const name = product?.name || id;
            const image = product?.images?.[0]?.url;
            // const image = product?.images?.slice().sort((a: any) => (a.type === "main" ? -1 : 1))?.[0]?.url;
            return (
              <div
                key={id}
                className="flex items-center gap-1 rounded-full border bg-gray-100 px-3 py-1 text-sm"
              >
                {image && (
                  <Image
                    src={image}
                    alt={name}
                    width={20}
                    height={20}
                    className="rounded object-cover"
                  />
                )}
                <span className="max-w-[150px] truncate">{name}</span>
                <button
                  type="button"
                  onClick={() => removeProduct(id)}
                  className="ml-1 text-gray-500 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Dropdown Trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm hover:border-gray-400"
        >
          <span className="text-gray-500">
            {value.length > 0
              ? `${value.length} product(s) selected`
              : "Search and select related products"}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
            {/* Search Input */}
            <div className="flex items-center border-b px-3 py-2">
              <Search className="mr-2 h-4 w-4 text-gray-400" />
              <input
                autoFocus
                type="text"
                placeholder="Search products by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-sm outline-none"
              />
            </div>

            {/* Product List */}
            <div className="max-h-60 overflow-y-auto">
              {isLoading ? (
                <p className="px-3 py-4 text-center text-sm text-gray-500">
                  Loading...
                </p>
              ) : allProducts.length === 0 ? (
                <p className="px-3 py-4 text-center text-sm text-gray-500">
                  {search.length < 2
                    ? "Type at least 2 characters to search"
                    : "No products found"}
                </p>
              ) : (
                allProducts.map((product: any) => {
                  const isSelected = value.includes(product.id);
                  const image = product?.images?.[0]?.url;
                  // const image = product?.images?.slice().sort((a: any) => (a.type === "main" ? -1 : 1))?.[0]?.url;
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => toggleProduct(product.id)}
                      className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                        isSelected ? "bg-blue-50" : ""
                      }`}
                    >
                      {image ? (
                        <Image
                          src={image}
                          alt={product.name}
                          width={32}
                          height={32}
                          className="rounded object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded bg-gray-200" />
                      )}
                      <div className="flex-1 truncate">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-gray-500">
                          £{product.base_price}
                        </p>
                      </div>
                      {isSelected && (
                        <span className="text-xs font-medium text-blue-600">
                          ✓ Selected
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}