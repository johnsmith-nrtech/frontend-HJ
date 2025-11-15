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
import { useZones, useDeleteZone } from "@/hooks/use-zones"; // Make sure your hook returns delivery_charges too
import { useAuth } from "@/hooks/useAuth";

// interface Zone {
//   id: string;
//   zone_name: string;
//   zip_code: string;
//   delivery_charges: number; // ✅ Added delivery charges
// }

export default function ZonesPage() {
  // ✅ Authentication check
  useAuth({ redirectTo: "/login", requireAuth: true });

  // ✅ Data fetching via React Query
  const {
    data: zones = [],
    isLoading,
    isError,
    error,
  } = useZones();

  const deleteMutation = useDeleteZone();

  const handleDeleteZone = async (zoneId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this zone?"
    );
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(zoneId);
    } catch (error) {
      console.error("Error deleting zone:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Zones Management</h1>
        <Link href="/admin/delivery-charges/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Zone
          </Button>
        </Link>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <CardTitle>Zones</CardTitle>
          <CardDescription>
            Manage your delivery zones, zip codes, and charges.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-6">
              <p>Loading zones...</p>
            </div>
          ) : isError ? (
            <div className="py-4 text-center text-red-500">
              <p>
                Error loading zones:{" "}
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
          ) : zones.length > 0 ? (
            <div className="divide-y">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className="flex items-center justify-between py-3 px-2 rounded-md hover:bg-gray-50 transition"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-lg">{zone.zone_name}</span>
                    <span className="text-sm text-gray-500">
                      ZIP Code: {zone.zip_code}
                    </span>
                    <span className="text-sm text-gray-500">
                      Delivery Charges: 
                      {zone.delivery_charges !== null && zone.delivery_charges !== undefined
                        ? zone.delivery_charges.toFixed(2)
                        : "0.00"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/admin/delivery-charges/edit/${zone.id}`}>
                      <Button variant="outline" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteZone(zone.id)}
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
              <p className="text-muted-foreground">No zones found</p>
              <Link href="/admin/delivery-charges/add">
                <Button variant="outline" className="mt-4">
                  <Plus className="mr-2 h-4 w-4" /> Create your first zone
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
