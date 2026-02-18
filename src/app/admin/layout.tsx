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
          <div className="h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
