"use client";

// import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useFloors, useDeleteFloor } from "@/hooks/use-floors"; // 🔹 You'll create this hook

// interface Floor {
//   id: string;
//   name: string;
//   charges: number;
// }

export default function FloorsPage() {
  // ✅ Data fetching via React Query
  const { data: floors = [], isLoading, isError, error } = useFloors();

  const deleteMutation = useDeleteFloor();

  const handleDeleteFloor = async (floorId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this floor?"
    );
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(floorId);
    } catch (error) {
      console.error("Error deleting floor:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Floors Management</h1>
        <Link href="/admin/floor/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Floor
          </Button>
        </Link>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <CardTitle>Floors</CardTitle>
          <CardDescription>
            Manage your building floors and their charges.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-6">
              <p>Loading floors...</p>
            </div>
          ) : isError ? (
            <div className="py-4 text-center text-red-500">
              <p>
                Error loading floors:{" "}
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
          ) : floors.length > 0 ? (
            <div className="divide-y">
              {floors.map((floor) => (
                <div
                  key={floor.id}
                  className="flex items-center justify-between rounded-md px-2 py-3 transition hover:bg-gray-50"
                >
                  <div className="flex flex-col">
                    <span className="text-lg font-medium">{floor.name}</span>
                    <span className="text-sm text-gray-500">
                      Charges: £{floor.charges}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/admin/floor/edit/${floor.id}`}>
                      <Button variant="outline" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteFloor(floor.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-muted-foreground">No floors found</p>
              <Link href="/admin/floors/add">
                <Button variant="outline" className="mt-4">
                  <Plus className="mr-2 h-4 w-4" /> Create your first floor
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
