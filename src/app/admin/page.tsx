"use client";

import { useState } from "react";
import {
  PackageIcon,
  ShoppingCart,
  Users,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardChart from "@/components/admin/dashboard-chart";
import RecentOrdersTable from "@/components/admin/recent-orders-table";
import { useDashboardStats } from "@/lib/api/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getContactMessages } from "@/lib/api/contact-messages";
import { ContactMessage } from "@/lib/types/contact-messages";

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("7d");
  const router = useRouter();

  // Fetch dashboard statistics
  const { data: dashboardData, isLoading } = useDashboardStats(selectedPeriod);

  // Fetch customer messages directly for dashboard
  const { data: messagesData } = useQuery({
    queryKey: ["dashboard-messages"],
    queryFn: () => getContactMessages({ page: 1, limit: 100 }),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Calculate message counts from direct API data
  const messages = messagesData?.items || [];
  const unreadCount = messages.filter(
    (msg: ContactMessage) => msg.status === "new"
  ).length;
  const readRepliedCount = messages.filter(
    (msg: ContactMessage) => msg.status === "read" || msg.status === "replied"
  ).length;
  const totalCount = messages.length;

  // Use real data if available, fallback to loading state
  const stats = dashboardData?.stats;

  return (
    <div className="flex-1 space-y-4 p-6 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Tabs
            defaultValue="7d"
            className="space-y-4"
            onValueChange={setSelectedPeriod}
          >
            <TabsList>
              <TabsTrigger value="1d">Today</TabsTrigger>
              <TabsTrigger value="7d">Weekly</TabsTrigger>
              <TabsTrigger value="30d">Monthly</TabsTrigger>
              <TabsTrigger value="90d">Quarterly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => router.push("/admin/orders")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {stats?.totalOrders || 0}
              </div>
            )}
            <div className="text-muted-foreground text-xs">
              {isLoading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                <span
                  className={`flex items-center ${
                    (stats?.ordersGrowth || 0) >= 0
                      ? "text-emerald-500"
                      : "text-red-500"
                  }`}
                >
                  {(stats?.ordersGrowth || 0) >= 0 ? (
                    <TrendingUp className="mr-1 h-3 w-3" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3" />
                  )}
                  {stats?.ordersGrowth
                    ? `${stats.ordersGrowth > 0 ? "+" : ""}${stats.ordersGrowth.toFixed(1)}%`
                    : "0%"}{" "}
                  from last{" "}
                  {selectedPeriod === "1d"
                    ? "day"
                    : selectedPeriod === "7d"
                      ? "week"
                      : selectedPeriod === "30d"
                        ? "month"
                        : "quarter"}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => router.push("/admin/customers")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {stats?.totalCustomers || 0}
              </div>
            )}
            <div className="text-muted-foreground text-xs">
              {isLoading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                <span
                  className={`flex items-center ${
                    (stats?.customersGrowth || 0) >= 0
                      ? "text-emerald-500"
                      : "text-red-500"
                  }`}
                >
                  {(stats?.customersGrowth || 0) >= 0 ? (
                    <TrendingUp className="mr-1 h-3 w-3" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3" />
                  )}
                  {stats?.customersGrowth
                    ? `${stats.customersGrowth > 0 ? "+" : ""}${stats.customersGrowth.toFixed(1)}%`
                    : "0%"}{" "}
                  from last{" "}
                  {selectedPeriod === "1d"
                    ? "day"
                    : selectedPeriod === "7d"
                      ? "week"
                      : selectedPeriod === "30d"
                        ? "month"
                        : "quarter"}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => router.push("/admin/products")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Products in Stock
            </CardTitle>
            <PackageIcon className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {stats?.productsInStock || 0}
              </div>
            )}
            <div className="text-muted-foreground text-xs">
              {isLoading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                <span
                  className={`flex items-center ${
                    (stats?.productsGrowth || 0) >= 0
                      ? "text-emerald-500"
                      : "text-red-500"
                  }`}
                >
                  {(stats?.productsGrowth || 0) >= 0 ? (
                    <TrendingUp className="mr-1 h-3 w-3" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3" />
                  )}
                  {stats?.productsGrowth
                    ? `${stats.productsGrowth > 0 ? "+" : ""}${stats.productsGrowth.toFixed(1)}%`
                    : "0%"}{" "}
                  from last{" "}
                  {selectedPeriod === "1d"
                    ? "day"
                    : selectedPeriod === "7d"
                      ? "week"
                      : selectedPeriod === "30d"
                        ? "month"
                        : "quarter"}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => router.push("/admin/customers")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Customer Messages
            </CardTitle>
            <MessageSquare className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <div className="text-muted-foreground text-xs">
              <span className="flex items-center text-blue-500">
                <MessageSquare className="mr-1 h-3 w-3" />
                {unreadCount} new, {readRepliedCount} read/replied
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>
              Sales data for{" "}
              {selectedPeriod === "1d"
                ? "today"
                : selectedPeriod === "7d"
                  ? "the past week"
                  : selectedPeriod === "30d"
                    ? "the past month"
                    : "the past quarter"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <DashboardChart
              period={selectedPeriod}
              data={dashboardData?.chartData}
            />
          </CardContent>
          <CardFooter>
            <Link
              href="/admin/orders"
              className="text-primary text-sm hover:underline"
            >
              View all orders
            </Link>
          </CardFooter>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Recent customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentOrdersTable />
          </CardContent>
          <CardFooter>
            <Link
              href="/admin/orders"
              className="text-primary text-sm hover:underline"
            >
              View all orders
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
