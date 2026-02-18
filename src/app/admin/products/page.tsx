"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Plus, Edit, Trash2, Search, FolderSymlink } from "lucide-react";
import Link from "next/link";
import { useProducts, useDeleteProduct } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<string>("asc");

  const { data: categoriesData } = useCategories();

  // Use the React Query hooks for fetching products with all options
  const { data, isLoading, isError, error, refetch } = useProducts({
    page,
    limit,
    search: search || undefined,
    categoryId: categoryId || undefined,
    sortBy,
    sortOrder,
    includeImages: true,
    includeCategory: true,
  });

  const deleteMutation = useDeleteProduct();

  const handleSearch = () => {
    refetch();
  };

  const handleDeleteProduct = async (productId: string) => {
    // Confirm deletion
    const confirmed = window.confirm(
      "Are you sure you want to delete this product? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      // Use the React Query mutation
      await deleteMutation.mutateAsync(productId);
    } catch (error) {
      // Error is already handled in the mutation hook
      console.error("Error in deletion flow:", error);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const products = data?.items || [];
  const totalPages = data?.meta?.totalPages || 0;

  return (
    <div className="space-y-6 p-6 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products Management</h1>
        <div className="flex space-x-2">
          <Link href="/admin/products/bulk-actions">
            <Button variant="outline">
              <FolderSymlink className="mr-2 h-4 w-4" /> Bulk Actions
            </Button>
          </Link>
          <Link href="/admin/products/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>Manage your products inventory.</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1 space-y-2">
              <label htmlFor="search" className="text-sm font-medium">
                Search Products
              </label>
              <div className="flex w-full items-center space-x-2">
                <Input
                  id="search"
                  placeholder="Search by name or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button type="button" onClick={handleSearch} variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="w-full space-y-2 md:w-64">
              <label htmlFor="category" className="text-sm font-medium">
                Filter by Category
              </label>
              <Select
                value={categoryId || "all"}
                onValueChange={(value) =>
                  setCategoryId(value === "all" ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoriesData?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full space-y-2 md:w-48">
              <label htmlFor="sortBy" className="text-sm font-medium">
                Sort By
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sortBy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="base_price">Price</SelectItem>
                  <SelectItem value="created_at">Date Added</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full space-y-2 md:w-40">
              <label htmlFor="sortOrder" className="text-sm font-medium">
                Order
              </label>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger id="sortOrder">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <p>Loading products...</p>
            </div>
          ) : isError ? (
            <div className="py-6 text-center text-red-500">
              <p>
                Error loading products:{" "}
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => refetch()}
              >
                Try again
              </Button>
            </div>
          ) : products.length > 0 ? (
            <div className="mt-6 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        {product.images && product.images.length > 0 ? (
                          <div className="relative h-10 w-10 overflow-hidden rounded-md bg-white">
                            <Image
                              fill
                              src={product.images[0].url}
                              alt={product.name}
                              className="h-full w-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-200 text-xs text-gray-500">
                            No img
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {product.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {product.category ? product.category.name : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPrice(product.base_price)}
                      </TableCell>
                      <TableCell>
                        {new Date(product.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Link href={`/admin/products/edit/${product.id}`}>
                            <Button
                              variant="outline"
                              size="icon"
                              title="Edit Product"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="icon"
                            disabled={deleteMutation.isPending}
                            onClick={() => handleDeleteProduct(product.id)}
                            title="Delete Product"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-muted-foreground mb-4">No products found</p>
              {search || categoryId ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setCategoryId(undefined);
                    refetch();
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                <Link href="/admin/products/add">
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" /> Add your first product
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>

        {products.length > 0 && totalPages > 1 && (
          <CardFooter>
            <Pagination className="w-full justify-center">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) handlePageChange(page - 1);
                    }}
                    className={
                      page === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(index + 1);
                      }}
                      isActive={page === index + 1}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages) handlePageChange(page + 1);
                    }}
                    className={
                      page === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
