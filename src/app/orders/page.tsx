"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  Loader2,
  ChevronRight,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { useUserOrders } from "@/lib/api/orders";
import { useAuth } from "@/lib/providers/auth-provider";
import { SessionManager } from "@/lib/services/session-manager";
import { OrderCard } from "./_components/order-card";

// Main Orders Page Component
export default function OrdersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { user, session, loading: authLoading } = useAuth();

  const {
    data: ordersData,
    isLoading,
    error,
    refetch,
    isFetching,
    isError,
  } = useUserOrders({
    page: currentPage,
    limit: itemsPerPage,
    sortBy: "created_at",
    sortOrder: "desc",
  });

  // Debug orders data
  useEffect(() => {
    console.log("Orders Query Debug:", {
      ordersData,
      isLoading,
      isFetching,
      isError,
      error: error?.message,
      totalItems: ordersData?.meta?.totalItems,
      itemsLength: ordersData?.items?.length,
    });
  }, [ordersData, isLoading, isFetching, isError, error]);

  const orders = ordersData?.items || [];
  const totalPages = ordersData?.meta.totalPages || 1;
  const totalItems = ordersData?.meta.totalItems || 0;

  // Show auth loading state
  if (authLoading) {
    return (
      <div className="px-[32px] py-12">
        <div className="flex flex-col items-center justify-center px-4 py-12">
          <Loader2 className="mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user || !session) {
    return (
      <div className="px-[32px] py-12">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink className="font-medium">Orders</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="bg-muted/50 flex flex-col items-center justify-center rounded-lg px-4 py-12">
          <div className="relative mb-6">
            <div className="bg-muted flex h-24 w-24 items-center justify-center rounded-full">
              <AlertCircle className="text-muted-foreground h-12 w-12" />
            </div>
          </div>
          <h1 className="mb-4 text-2xl font-bold">Authentication Required</h1>
          <p className="text-muted-foreground mb-8 max-w-md text-center">
            Please sign in to view your orders.
          </p>
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading && orders.length === 0) {
    return (
      <div className="px-[32px] py-12">
        <div className="flex flex-col items-center justify-center px-4 py-12">
          <Loader2 className="mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading your orders...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (totalItems === 0 && !isLoading) {
    return (
      <div className="px-[32px] py-12">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink className="font-medium">Orders</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="bg-muted/50 flex flex-col items-center justify-center rounded-lg px-4 py-12">
          <div className="relative mb-6">
            <div className="bg-muted flex h-24 w-24 items-center justify-center rounded-full">
              <ShoppingBag className="text-muted-foreground h-12 w-12" />
            </div>
          </div>
          <h1 className="mb-4 text-2xl font-bold">No orders yet</h1>
          <p className="text-muted-foreground mb-8 max-w-md text-center">
            You haven&apos;t placed any orders yet. Start shopping to see your
            orders here.
          </p>
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/products">Start Shopping</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-[32px] py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink className="font-medium">Orders</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-bebas text-3xl">My Orders</h1>
          <p className="text-muted-foreground mt-1">
            {totalItems} {totalItems === 1 ? "order" : "orders"} found
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Refresh"
            )}
          </Button>
          {isLoading && (
            <div className="text-muted-foreground flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </div>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>{error.message || "Failed to load orders"}</p>
              <div className="text-xs opacity-75">
                <p>Debug info:</p>
                <p>• User ID: {user?.data?.user?.id || "Not available"}</p>
                <p>
                  • Access Token:{" "}
                  {SessionManager.getAccessToken() ? "Present" : "Missing"}
                </p>
                <p>
                  • Is Authenticated:{" "}
                  {SessionManager.isAuthenticated() ? "Yes" : "No"}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Back to Shopping Button */}
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </Button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                    }
                  }}
                  className={
                    currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) {
                      setCurrentPage(currentPage + 1);
                    }
                  }}
                  className={
                    currentPage >= totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
