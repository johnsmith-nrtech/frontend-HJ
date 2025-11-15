"use client";

import { ReactNode, useState } from "react";
import AdminSidebar from "@/components/admin/sidebar";
import { useAdminNotifications } from "@/lib/hooks/use-admin-notifications";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Initialize admin notifications for real-time message alerts
  useAdminNotifications();

  // Check if user is admin
  //   useEffect(() => {
  //     if (!isLoading && (!user || user.role !== "admin")) {
  //       router.push("/login");
  //     }
  //   }, [user, isLoading, router]);

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
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
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
