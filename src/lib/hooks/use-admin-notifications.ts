"use client";

import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getContactMessages } from "@/lib/api/contact-messages";
import { ContactMessage } from "@/lib/types/contact-messages";
import { getAllOrders } from "@/lib/api/orders";
import { Order } from "@/lib/types/orders";
import { toast } from "sonner";
import { isUserAdmin } from "@/lib/utils/admin-auth";

interface NotificationState {
  lastChecked: number;
  seenMessageIds: Set<string>;
  seenOrderIds: Set<string>;
}

/**
 * Hook to handle real-time notifications for new customer messages in admin
 */
export function useAdminNotifications() {
  const queryClient = useQueryClient();
  const notificationState = useRef<NotificationState>({
    lastChecked: Date.now(),
    seenMessageIds: new Set(),
    seenOrderIds: new Set(),
  });

  // Only run for admin users
  const isAdmin = isUserAdmin();

  // Poll for new messages every 30 seconds
  const { data: messagesData } = useQuery({
    queryKey: ["admin-notifications-messages"],
    queryFn: () =>
      getContactMessages({
        page: 1,
        limit: 10,
      }),
    enabled: isAdmin,
    refetchInterval: 30000, // Poll every 30 seconds
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  // Poll for new orders every 30 seconds
  const { data: ordersData } = useQuery({
    queryKey: ["admin-notifications-orders"],
    queryFn: () =>
      getAllOrders({
        page: 1,
        limit: 10,
        sortBy: "created_at",
        sortOrder: "desc",
      }),
    enabled: isAdmin,
    refetchInterval: 30000, // Poll every 30 seconds
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!isAdmin) return;

    const now = Date.now();
    const newMessages: ContactMessage[] = [];
    const newOrders: Order[] = [];

    // Check for new messages since last check
    if (messagesData?.items) {
      messagesData.items.forEach((message: ContactMessage) => {
        const messageTime = new Date(message.created_at).getTime();
        const isNewMessage =
          messageTime > notificationState.current.lastChecked;
        const isUnseenMessage = !notificationState.current.seenMessageIds.has(
          message.id
        );

        if (isNewMessage && isUnseenMessage && message.status === "new") {
          newMessages.push(message);
          notificationState.current.seenMessageIds.add(message.id);
        }
      });
    }

    // Check for new orders since last check
    if (ordersData?.items) {
      ordersData.items.forEach((order: Order) => {
        const orderTime = new Date(order.created_at).getTime();
        const isNewOrder = orderTime > notificationState.current.lastChecked;
        const isUnseenOrder = !notificationState.current.seenOrderIds.has(
          order.id
        );

        if (
          isNewOrder &&
          isUnseenOrder &&
          (order.status === "pending" || order.status === "paid")
        ) {
          newOrders.push(order);
          notificationState.current.seenOrderIds.add(order.id);
        }
      });
    }

    // Show notifications for new messages
    newMessages.forEach((message) => {
      const fullName = `${message.first_name} ${message.last_name}`;
      toast.info(`New customer message from ${fullName}`, {
        description:
          message.message_text.substring(0, 100) +
          (message.message_text.length > 100 ? "..." : ""),
        duration: 8000,
        action: {
          label: "View",
          onClick: () => {
            // Navigate to customers page and invalidate queries to refresh data
            window.location.href = "/admin/customers";
            queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
          },
        },
      });
    });

    // Show notifications for new orders
    newOrders.forEach((order) => {
      const customerName = `${order.contact_first_name} ${order.contact_last_name}`;
      toast.success(`New order from ${customerName}`, {
        description: `Order #${order.id.slice(-8)} - $${order.total_amount.toFixed(2)} ${order.currency}`,
        duration: 8000,
        action: {
          label: "View",
          onClick: () => {
            // Navigate to orders page and invalidate queries to refresh data
            window.location.href = "/admin/orders";
            queryClient.invalidateQueries({ queryKey: ["all-orders"] });
          },
        },
      });
    });

    // Update last checked time if we processed any notifications
    if (newMessages.length > 0 || newOrders.length > 0) {
      notificationState.current.lastChecked = now;
    }
  }, [messagesData, ordersData, isAdmin, queryClient]);

  // Function to manually mark messages as seen (useful when admin visits the page)
  const markMessagesAsSeen = (messageIds: string[]) => {
    messageIds.forEach((id) => {
      notificationState.current.seenMessageIds.add(id);
    });
  };

  // Function to manually mark orders as seen (useful when admin visits the page)
  const markOrdersAsSeen = (orderIds: string[]) => {
    orderIds.forEach((id) => {
      notificationState.current.seenOrderIds.add(id);
    });
  };

  // Function to get count of unread messages (new status only)
  const getUnreadMessagesCount = (): number => {
    if (!isAdmin || !messagesData?.items) return 0;

    return messagesData.items.filter(
      (message: ContactMessage) =>
        message.status === "new" &&
        !notificationState.current.seenMessageIds.has(message.id)
    ).length;
  };

  // Function to get count of read/replied messages
  const getReadRepliedMessagesCount = (): number => {
    if (!isAdmin || !messagesData?.items) return 0;

    return messagesData.items.filter(
      (message: ContactMessage) =>
        message.status === "read" || message.status === "replied"
    ).length;
  };

  // Function to get total messages count
  const getTotalMessagesCount = (): number => {
    if (!isAdmin || !messagesData?.items) return 0;
    return messagesData.items.length;
  };

  // Function to get count of new orders
  const getNewOrdersCount = (): number => {
    if (!ordersData?.items) return 0;

    return ordersData.items.filter(
      (order: Order) =>
        (order.status === "pending" || order.status === "paid") &&
        !notificationState.current.seenOrderIds.has(order.id)
    ).length;
  };

  // Legacy function for backward compatibility
  const getUnreadCount = (): number => {
    return getUnreadMessagesCount();
  };

  return {
    markMessagesAsSeen,
    markOrdersAsSeen,
    getUnreadCount, // Legacy - messages only
    getUnreadMessagesCount,
    getReadRepliedMessagesCount,
    getTotalMessagesCount,
    getNewOrdersCount,
    isEnabled: isAdmin,
  };
}
