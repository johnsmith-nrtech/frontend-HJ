"use client";

import { ReactNode, useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/sidebar";
import { useAdminNotifications } from "@/lib/hooks/use-admin-notifications";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/providers/auth-provider";
import { toast } from "sonner";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  // Initialize admin notifications for real-time message alerts
  useAdminNotifications();

  const router = useRouter();

  const userRole = user?.data?.user?.additionalData.role;

  useEffect(() => {
    if (loading) return;

    if (!userRole) {
      router.push("/login");
      return;
    }

    if (userRole !== "admin") {
      toast.error("Access denied. Admins only.");
      router.push("/");
      return;
    }
  }, [loading, router, userRole]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile sidebar overlay */}
      {isMobileSidebarOpen && (
        <div
          className="bg-opacity-50 fixed inset-0 z-40 bg-black lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:hidden",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <AdminSidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>

        {/* Main content area */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="h-full">{loading ? <AuthLoading /> : children}</div>
        </main>
      </div>
    </div>
  );
}

function AuthLoading() {
  return (
    <div className="flex h-full items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
      <div className="flex flex-col items-center space-y-6">
        {/* Logo/Brand area */}
        <div className="relative">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-r from-blue-500 to-purple-600 shadow-lg">
            <div className="h-8 w-8 animate-pulse rounded-full bg-white/20"></div>
          </div>
          <div className="absolute -inset-2">
            <div className="h-20 w-20 animate-spin rounded-full border-4 border-blue-200 border-t-blue-500"></div>
          </div>
        </div>

        {/* Loading text with animation */}
        <div className="flex flex-col items-center space-y-3">
          <h2 className="text-xl font-semibold text-gray-800">
            Loading Admin Dashboard
          </h2>
          <div className="flex items-center space-x-1">
            <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500"></div>
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>

        {/* Loading status indicators */}
        <div className="flex w-64 flex-col space-y-2">
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <div className="h-4 w-4 animate-pulse rounded-full bg-green-400"></div>
            <span>Authenticating user...</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <div
              className="h-4 w-4 animate-pulse rounded-full bg-yellow-400"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <span>Loading permissions...</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <div
              className="h-4 w-4 animate-pulse rounded-full bg-blue-400"
              style={{ animationDelay: "1s" }}
            ></div>
            <span>Preparing dashboard...</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-64 overflow-hidden rounded-full bg-gray-200">
          <div className="h-full animate-pulse rounded-full bg-linear-to-r from-blue-500 to-purple-600"></div>
        </div>

        {/* Additional decorative elements */}
        <div className="absolute top-20 left-20 h-32 w-32 animate-ping rounded-full bg-blue-100 opacity-20"></div>
        <div
          className="absolute right-20 bottom-20 h-24 w-24 animate-ping rounded-full bg-purple-100 opacity-20"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>
    </div>
  );
}
