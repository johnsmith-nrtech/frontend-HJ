"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, ChevronRight, ChevronDown, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCategories, useDeleteCategory } from "@/hooks/use-categories";
import { Category } from "@/lib/api/categories";
import { useAuth } from "@/hooks/useAuth";

export default function CategoriesPage() {
  // Ensure authentication
  useAuth({ redirectTo: "/login", requireAuth: true });

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  // Use the React Query hooks
  const {
    data: categories = [],
    isLoading,
    isError,
    error,
  } = useCategories(true); // Fetch with nested=true

  const deleteMutation = useDeleteCategory();

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleDeleteCategory = async (categoryId: string) => {
    // Confirm deletion
    const confirmed = window.confirm(
      "Are you sure you want to delete this category? This will also delete all subcategories."
    );

    if (!confirmed) return;

    try {
      // Use the React Query mutation
      await deleteMutation.mutateAsync(categoryId);
    } catch (error) {
      // Error is already handled in the mutation hook
      console.error("Error in deletion flow:", error);
    }
  };

  // Recursive component to render category tree
  const CategoryItem = ({
    category,
    level = 0,
  }: {
    category: Category;
    level?: number;
  }) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasSubcategories =
      category.subcategories && category.subcategories.length > 0;

    return (
      <div className="category-item">
        <div
          className={`flex items-center p-2 ${
            level > 0 ? "ml-6" : ""
          } rounded-md hover:bg-gray-50`}
        >
          <div className="flex flex-1 items-center">
            {hasSubcategories ? (
              <button
                onClick={() => toggleCategory(category.id)}
                className="mr-2 focus:outline-none"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
              </button>
            ) : (
              <div className="mr-2 w-4"></div>
            )}
            <span className="font-medium">{category.name}</span>
            {category.order !== undefined && (
              <span className="ml-2 text-xs text-gray-500">
                Order: {category.order}
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <Link href={`/admin/categories/edit/${category.id}`}>
              <Button variant="outline" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="icon"
              disabled={deleteMutation.isPending}
              onClick={() => handleDeleteCategory(category.id)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
        {isExpanded && hasSubcategories && (
          <div className="ml-6">
            {category.subcategories?.map((subcategory) => (
              <CategoryItem
                key={subcategory.id}
                category={subcategory}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categories Management</h1>
        <Link href="/admin/categories/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            Manage your product categories and their hierarchies.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center">
              <p>Loading categories...</p>
            </div>
          ) : isError ? (
            <div className="py-4 text-center text-red-500">
              <p>
                Error loading categories:{" "}
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => window.location.reload()}
              >
                Try again
              </Button>
            </div>
          ) : categories.length > 0 ? (
            <div className="space-y-2">
              {categories.map((category) => (
                <CategoryItem key={category.id} category={category} />
              ))}
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-muted-foreground">No categories found</p>
              <Link href="/admin/categories/add">
                <Button variant="outline" className="mt-4">
                  <Plus className="mr-2 h-4 w-4" /> Create your first category
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
