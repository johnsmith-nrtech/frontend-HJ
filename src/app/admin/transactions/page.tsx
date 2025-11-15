"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Download,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle,
  AlertCircle,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";

// Demo data for transactions
const TRANSACTIONS_DATA = [
  {
    id: "TRX-001",
    customer: {
      name: "John Smith",
      id: "CUST-001",
      avatar: "https://placehold.co/100x100?text=JS",
    },
    amount: 1299.99,
    status: "Completed",
    type: "Purchase",
    date: "2023-09-15T10:30:00",
    orderId: "ORD-0089",
    paymentMethod: "Credit Card",
  },
  {
    id: "TRX-002",
    customer: {
      name: "Emma Johnson",
      id: "CUST-002",
      avatar: "https://placehold.co/100x100?text=EJ",
    },
    amount: 749.5,
    status: "Pending",
    type: "Purchase",
    date: "2023-09-14T14:45:00",
    orderId: "ORD-0088",
    paymentMethod: "PayPal",
  },
  {
    id: "TRX-003",
    customer: {
      name: "Michael Brown",
      id: "CUST-003",
      avatar: "https://placehold.co/100x100?text=MB",
    },
    amount: 249.99,
    status: "Completed",
    type: "Purchase",
    date: "2023-09-12T09:15:00",
    orderId: "ORD-0087",
    paymentMethod: "Credit Card",
  },
  {
    id: "TRX-004",
    customer: {
      name: "Sophia Williams",
      id: "CUST-004",
      avatar: "https://placehold.co/100x100?text=SW",
    },
    amount: 199.99,
    status: "Failed",
    type: "Purchase",
    date: "2023-09-11T17:20:00",
    orderId: "ORD-0086",
    paymentMethod: "Debit Card",
  },
  {
    id: "TRX-005",
    customer: {
      name: "John Smith",
      id: "CUST-001",
      avatar: "https://placehold.co/100x100?text=JS",
    },
    amount: 89.99,
    status: "Refunded",
    type: "Refund",
    date: "2023-09-10T11:05:00",
    orderId: "ORD-0085",
    paymentMethod: "Credit Card",
  },
  {
    id: "TRX-006",
    customer: {
      name: "Olivia Miller",
      id: "CUST-006",
      avatar: "https://placehold.co/100x100?text=OM",
    },
    amount: 599.99,
    status: "Completed",
    type: "Purchase",
    date: "2023-09-09T13:30:00",
    orderId: "ORD-0084",
    paymentMethod: "PayPal",
  },
  {
    id: "TRX-007",
    customer: {
      name: "William Wilson",
      id: "CUST-007",
      avatar: "https://placehold.co/100x100?text=WW",
    },
    amount: 129.5,
    status: "Pending",
    type: "Purchase",
    date: "2023-09-08T16:45:00",
    orderId: "ORD-0083",
    paymentMethod: "Debit Card",
  },
  {
    id: "TRX-008",
    customer: {
      name: "Emma Johnson",
      id: "CUST-002",
      avatar: "https://placehold.co/100x100?text=EJ",
    },
    amount: 159.99,
    status: "Refunded",
    type: "Refund",
    date: "2023-09-07T10:20:00",
    orderId: "ORD-0082",
    paymentMethod: "Credit Card",
  },
];

// Get status badge for transaction
const getStatusBadge = (status: string) => {
  switch (status) {
    case "Completed":
      return (
        <Badge
          variant="default"
          className="flex items-center border-0 bg-green-100 text-green-800 hover:bg-green-100"
        >
          <CheckCircle className="mr-1 h-3 w-3" />
          Completed
        </Badge>
      );
    case "Pending":
      return (
        <Badge
          variant="warning"
          className="flex items-center border-0 bg-amber-100 text-amber-800 hover:bg-amber-100"
        >
          <Clock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      );
    case "Failed":
      return (
        <Badge variant="destructive" className="flex items-center">
          <AlertCircle className="mr-1 h-3 w-3" />
          Failed
        </Badge>
      );
    case "Refunded":
      return (
        <Badge variant="secondary" className="flex items-center">
          <ArrowDown className="mr-1 h-3 w-3" />
          Refunded
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

// Get transaction type badge
const getTypeBadge = (type: string) => {
  switch (type) {
    case "Purchase":
      return (
        <Badge
          variant="outline"
          className="flex items-center border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50"
        >
          <ArrowUp className="mr-1 h-3 w-3" />
          Purchase
        </Badge>
      );
    case "Refund":
      return (
        <Badge
          variant="outline"
          className="flex items-center border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-50"
        >
          <ArrowDown className="mr-1 h-3 w-3" />
          Refund
        </Badge>
      );
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
};

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter transactions based on search query
  const filteredTransactions = TRANSACTIONS_DATA.filter(
    (transaction) =>
      transaction.customer.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-4 p-6 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            placeholder="Search transactions..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <span className="font-medium">{transaction.id}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Image
                        fill
                        src={transaction.customer.avatar}
                        alt={transaction.customer.name}
                        className="h-8 w-8 rounded-full border object-cover"
                      />
                      <div className="flex flex-col">
                        <span>{transaction.customer.name}</span>
                        <span className="text-muted-foreground text-xs">
                          {transaction.customer.id}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-medium ${
                        transaction.type === "Refund" ? "text-red-600" : ""
                      }`}
                    >
                      {transaction.type === "Refund" ? "-" : ""}$
                      {transaction.amount.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                  <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/orders/${transaction.orderId}`}
                      className="text-primary hover:underline"
                    >
                      {transaction.orderId}
                    </Link>
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
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download receipt
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t px-6 py-3">
          <div className="text-muted-foreground text-sm">
            Showing <strong>{filteredTransactions.length}</strong> of{" "}
            <strong>{TRANSACTIONS_DATA.length}</strong> transactions
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
