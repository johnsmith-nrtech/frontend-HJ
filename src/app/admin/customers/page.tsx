"use client";

import { useState, useEffect } from "react";
import {
  Search,
  MoreHorizontal,
  Eye,
  Mail,
  Clock,
  MessageSquare,
  Trash2,
  Edit,
  Send,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  useContactMessages,
  useUpdateContactMessage,
  useDeleteContactMessage,
} from "@/lib/api/contact-messages";
import {
  ContactMessage,
  ContactMessageStatus,
  ContactMessagesListParams,
} from "@/lib/types/contact-messages";
import { useAdminNotifications } from "@/lib/hooks/use-admin-notifications";
import { toast } from "sonner";

// Get status badge for contact message
const getStatusBadge = (status: ContactMessageStatus) => {
  const statusConfig = {
    new: {
      variant: "default" as const,
      className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    },
    read: { variant: "secondary" as const, className: "" },
    archived: { variant: "outline" as const, className: "" },
    replied: {
      variant: "default" as const,
      className: "bg-green-100 text-green-800 hover:bg-green-100",
    },
  };

  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={config.className}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

// Format date for display
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ContactMessagesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    ContactMessageStatus | "all"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null
  );
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<ContactMessageStatus>("new");
  const [editNotes, setEditNotes] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const limit = 20;

  // Build query parameters
  const queryParams: ContactMessagesListParams = {
    page: currentPage,
    limit,
    ...(searchQuery && { search: searchQuery }),
    ...(statusFilter !== "all" && {
      status: statusFilter as ContactMessageStatus,
    }),
  };

  const { data, isLoading, error } = useContactMessages(queryParams);
  const updateContactMessage = useUpdateContactMessage();
  const deleteContactMessage = useDeleteContactMessage();
  const { markMessagesAsSeen } = useAdminNotifications();

  // Mark messages as seen when data loads
  useEffect(() => {
    if (data?.items) {
      const messageIds = data.items.map((message) => message.id);
      markMessagesAsSeen(messageIds);
    }
  }, [data?.items, markMessagesAsSeen]);

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsViewDialogOpen(true);

    // Mark as read if it's new
    if (message.status === "new") {
      updateContactMessage.mutate({
        id: message.id,
        data: { status: "read" },
      });
    }
  };

  const handleEditMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setEditStatus(message.status);
    setEditNotes(message.admin_notes || "");
    setIsEditDialogOpen(true);
  };

  const handleDeleteMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsDeleteDialogOpen(true);
  };

  const handleSendEmail = (message: ContactMessage) => {
    setSelectedMessage(message);
    setEmailSubject(`Re: Your message to Sofa Deals`);
    setEmailBody(
      `Dear ${message.first_name},\n\nThank you for contacting us. We have received your message:\n\n"${message.message_text}"\n\nBest regards,\nSofa Deals Team`
    );
    setIsEmailDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedMessage) return;

    try {
      await updateContactMessage.mutateAsync({
        id: selectedMessage.id,
        data: {
          status: editStatus,
          admin_notes: editNotes.trim() || undefined,
        },
      });

      setIsEditDialogOpen(false);
      setSelectedMessage(null);
      toast.success("Contact message updated successfully");
    } catch {
      toast.error("Failed to update contact message");
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedMessage) return;

    try {
      await deleteContactMessage.mutateAsync(selectedMessage.id);
      setIsDeleteDialogOpen(false);
      setSelectedMessage(null);
      toast.success("Contact message deleted successfully");
    } catch {
      toast.error("Failed to delete contact message");
    }
  };

  const handleSendEmailSubmit = async () => {
    if (!selectedMessage || !emailSubject.trim() || !emailBody.trim()) {
      toast.error("Please fill in both subject and message");
      return;
    }

    setIsSendingEmail(true);
    try {
      // Create mailto link
      const mailtoLink = `mailto:${selectedMessage.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

      // Open email client
      window.open(mailtoLink, "_blank");

      // Close dialog and reset form
      setIsEmailDialogOpen(false);
      setSelectedMessage(null);
      setEmailSubject("");
      setEmailBody("");

      // Show info message instead of success
      toast.info(
        "Email client opened. Please send the email from your email application and then manually update the message status if needed."
      );
    } catch {
      toast.error("Failed to open email client");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleMarkAsReplied = async (message: ContactMessage) => {
    try {
      await updateContactMessage.mutateAsync({
        id: message.id,
        data: {
          status: "replied",
          admin_notes: `Marked as replied on ${new Date().toLocaleDateString()}`,
        },
      });
      toast.success("Message status updated to 'Replied'");
    } catch {
      toast.error("Failed to update message status");
    }
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-6 pt-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-600">
              Error Loading Messages
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Failed to load contact messages. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-4 sm:p-6 sm:pt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Contact Messages
        </h2>
      </div>

      <div className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            placeholder="Search messages..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value as ContactMessageStatus | "all")
          }
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
            <SelectItem value="replied">Replied</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-lg">Loading contact messages...</div>
            </div>
          ) : !data?.items.length ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  No messages found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "No contact messages have been submitted yet."}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Contact</TableHead>
                    <TableHead className="hidden min-w-[250px] sm:table-cell">
                      Message
                    </TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="hidden min-w-[150px] md:table-cell">
                      Date
                    </TableHead>
                    <TableHead className="min-w-[80px] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {message.first_name} {message.last_name}
                          </span>
                          <div className="text-muted-foreground flex items-center text-sm">
                            <Mail className="mr-1 h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{message.email}</span>
                          </div>
                          {/* Show message on mobile */}
                          <div className="mt-1 sm:hidden">
                            <p className="text-muted-foreground truncate text-xs">
                              {message.message_text}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="max-w-xs">
                          <p className="truncate text-sm">
                            {message.message_text}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          {getStatusBadge(message.status)}
                          {/* Show date on mobile */}
                          <div className="text-muted-foreground mt-1 flex items-center text-xs md:hidden">
                            <Clock className="mr-1 h-3 w-3" />
                            {formatDate(message.created_at)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center text-sm">
                          <Clock className="mr-1 h-3 w-3" />
                          {formatDate(message.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewMessage(message)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleSendEmail(message)}
                            >
                              <Send className="mr-2 h-4 w-4" />
                              Send email
                            </DropdownMenuItem>
                            {message.status !== "replied" && (
                              <DropdownMenuItem
                                onClick={() => handleMarkAsReplied(message)}
                              >
                                <Mail className="mr-2 h-4 w-4" />
                                Mark as replied
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleEditMessage(message)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit status
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteMessage(message)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {data && data.items.length > 0 && (
          <CardFooter className="flex flex-col items-center justify-between gap-4 border-t px-4 py-3 sm:flex-row sm:px-6">
            <div className="text-muted-foreground text-center text-sm sm:text-left">
              Showing <strong>{(currentPage - 1) * limit + 1}</strong> to{" "}
              <strong>{Math.min(currentPage * limit, data.total)}</strong> of{" "}
              <strong>{data.total}</strong> messages
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Next
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* View Message Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contact Message Details</DialogTitle>
            <DialogDescription>
              Message from {selectedMessage?.first_name}{" "}
              {selectedMessage?.last_name}
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-muted-foreground text-sm">
                    {selectedMessage.first_name} {selectedMessage.last_name}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-muted-foreground text-sm">
                    {selectedMessage.email}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedMessage.status)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date</Label>
                  <p className="text-muted-foreground text-sm">
                    {formatDate(selectedMessage.created_at)}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Message</Label>
                <p className="text-muted-foreground mt-1 text-sm whitespace-pre-wrap">
                  {selectedMessage.message_text}
                </p>
              </div>
              {selectedMessage.admin_notes && (
                <div>
                  <Label className="text-sm font-medium">Admin Notes</Label>
                  <p className="text-muted-foreground mt-1 text-sm whitespace-pre-wrap">
                    {selectedMessage.admin_notes}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsViewDialogOpen(false);
                if (selectedMessage) handleSendEmail(selectedMessage);
              }}
            >
              Send Email
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsViewDialogOpen(false);
                if (selectedMessage) handleMarkAsReplied(selectedMessage);
              }}
            >
              Mark as Replied
            </Button>
            <Button
              onClick={() => {
                setIsViewDialogOpen(false);
                if (selectedMessage) handleEditMessage(selectedMessage);
              }}
            >
              Edit Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Message Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contact Message</DialogTitle>
            <DialogDescription>
              Update the status and add admin notes for this message.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={editStatus}
                onValueChange={(value) =>
                  setEditStatus(value as ContactMessageStatus)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Admin Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add notes about this message..."
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={updateContactMessage.isPending}
            >
              {updateContactMessage.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contact Message</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this message from{" "}
              {selectedMessage?.first_name} {selectedMessage?.last_name}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteContactMessage.isPending}
            >
              {deleteContactMessage.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Email Reply</DialogTitle>
            <DialogDescription>
              Send an email reply to {selectedMessage?.first_name}{" "}
              {selectedMessage?.last_name} ({selectedMessage?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Email subject"
              />
            </div>
            <div>
              <Label htmlFor="email-body">Message</Label>
              <Textarea
                id="email-body"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Type your email message here..."
                rows={10}
                className="resize-none"
              />
            </div>
            <div className="rounded-md bg-blue-50 p-3">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Original Message
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p className="whitespace-pre-wrap">
                      {selectedMessage?.message_text}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEmailDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendEmailSubmit}
              disabled={
                isSendingEmail || !emailSubject.trim() || !emailBody.trim()
              }
            >
              {isSendingEmail ? "Processing..." : "Send Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
