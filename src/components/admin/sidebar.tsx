"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  ShoppingCart,
  FolderTree,
  Building,
  Truck,
  Percent,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/providers/auth-provider";
import { useAdminNotifications } from "@/lib/hooks/use-admin-notifications";
import React from "react";
import Image from "next/image";

export const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: <Home className="mr-3 h-5 w-5" />,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: <Package className="mr-3 h-5 w-5" />,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: <FolderTree className="mr-3 h-5 w-5" />,
  },
  {
    title: "Floors",
    href: "/admin/floor",
    icon: <Building className="mr-3 h-5 w-5" />,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: <ShoppingCart className="mr-3 h-5 w-5" />,
  },
  {
    title: "Zones",
    href: "/admin/zones",
    icon: <Truck className="mr-3 h-5 w-5" />,
  },
  {
    title: "Customers",
    href: "/admin/customers",
    icon: <Users className="mr-3 h-5 w-5" />,
  },
  {
    title: "Coupons",
    href: "/admin/coupons",
    icon: <Percent className="mr-3 h-5 w-5" />,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: <Settings className="mr-3 h-5 w-5" />,
  },
];

export default function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { getUnreadMessagesCount, getNewOrdersCount, isEnabled } =
    useAdminNotifications();

  const unreadMessagesCount = isEnabled ? getUnreadMessagesCount() : 0;
  const newOrdersCount = isEnabled ? getNewOrdersCount() : 0;

  // Helper function to adjust icon classes based on sidebar state
  const getIconClasses = (icon: React.ReactNode) => {
    if (isCollapsed) {
      // Remove margin when collapsed
      return React.cloneElement(
        icon as React.ReactElement<{ className?: string }>,
        {
          className: "h-5 w-5",
        }
      );
    }
    return icon;
  };

  return (
    <div
      className={cn(
        "relative z-10 flex h-screen flex-col border-r bg-white transition-all duration-300",
        isCollapsed ? "w-20" : "w-60"
      )}
    >
      <div className="border-border flex items-center border-b p-4">
        {isCollapsed ? (
          // Collapsed state - center the menu button
          <div className="flex w-full justify-center">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Menu size={20} />
            </button>
          </div>
        ) : (
          // Expanded state - logo on left, close button on right
          <>
            <div className="flex items-center">
              <Image
                src="/favicon.ico"
                alt="Sofa Deal Logo"
                width={40}
                height={40}
                className="mr-2"
              />
              <span className="text-xl font-bold">Sofa Deal</span>
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-muted-foreground hover:text-foreground ml-auto"
            >
              <X size={20} />
            </button>
          </>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {adminNavItems.map((item) => (
              <li key={item.href} className="relative">
                <Link
                  href={item.href}
                  className={cn(
                    "hover:bg-muted hover:text-primary group relative flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-muted text-primary"
                      : "text-muted-foreground",
                    isCollapsed ? "justify-center" : ""
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <div
                    className={cn(
                      "flex items-center",
                      isCollapsed ? "justify-center" : "flex-1"
                    )}
                  >
                    <div className="relative">
                      {getIconClasses(item.icon)}
                      {/* Show notification badge for Customers page if there are unread messages - collapsed state */}
                      {item.href === "/admin/customers" &&
                        unreadMessagesCount > 0 &&
                        isCollapsed && (
                          <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 text-[10px] leading-none font-medium text-white">
                            {unreadMessagesCount > 99
                              ? "99+"
                              : unreadMessagesCount}
                          </span>
                        )}
                      {/* Show notification badge for Orders page if there are new orders - collapsed state */}
                      {item.href === "/admin/orders" &&
                        newOrdersCount > 0 &&
                        isCollapsed && (
                          <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] leading-none font-medium text-white">
                            {newOrdersCount > 99 ? "99+" : newOrdersCount}
                          </span>
                        )}
                    </div>
                    {!isCollapsed && (
                      <>
                        <span className="ml-3 flex-1">{item.title}</span>
                        {/* Show notification badge for Customers page if there are unread messages - expanded state */}
                        {item.href === "/admin/customers" &&
                          unreadMessagesCount > 0 && (
                            <span className="ml-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 text-[10px] leading-none font-medium text-white">
                              {unreadMessagesCount > 99
                                ? "99+"
                                : unreadMessagesCount}
                            </span>
                          )}
                        {/* Show notification badge for Orders page if there are new orders - expanded state */}
                        {item.href === "/admin/orders" &&
                          newOrdersCount > 0 && (
                            <span className="ml-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-blue-500 text-[10px] leading-none font-medium text-white">
                              {newOrdersCount > 99 ? "99+" : newOrdersCount}
                            </span>
                          )}
                      </>
                    )}
                  </div>
                </Link>
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="pointer-events-none absolute top-1/2 left-full z-50 ml-2 -translate-y-1/2 rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {item.title}
                    {item.href === "/admin/customers" &&
                      unreadMessagesCount > 0 && (
                        <span className="ml-1 rounded bg-red-500 px-1">
                          {unreadMessagesCount}
                        </span>
                      )}
                    {item.href === "/admin/orders" && newOrdersCount > 0 && (
                      <span className="ml-1 rounded bg-blue-500 px-1">
                        {newOrdersCount}
                      </span>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-border border-t p-4">
        <button
          onClick={() => signOut()}
          className={cn(
            "text-muted-foreground hover:bg-muted hover:text-foreground flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
            isCollapsed ? "justify-center" : ""
          )}
        >
          <LogOut className={cn("h-5 w-5", isCollapsed ? "" : "mr-3")} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}
