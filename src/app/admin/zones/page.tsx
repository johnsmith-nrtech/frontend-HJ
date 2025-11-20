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
import { Badge } from "@/components/ui/badge";

export default function ZonesPage() {
  // ✅ Data fetching via React Query
  const { data: zones = [], isLoading, isError, error } = useZones();

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
        <Link href="/admin/zones/add">
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
                  className="flex items-center justify-between rounded-md px-2 py-3 transition hover:bg-gray-50"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-lg font-medium">
                      {zone.zone_name}
                    </span>
                    <span className="grid grid-cols-[auto_1fr] gap-2 text-sm text-gray-500">
                      Zip Codes:
                      <div className="flex gap-1">
                        {zone.zip_codes.map((zip) => (
                          <Badge
                            key={zip}
                            className="px-2 py-1 text-xs"
                            variant="outline"
                          >
                            {zip}
                          </Badge>
                        ))}
                      </div>
                    </span>
                    <span className="text-sm text-gray-500">
                      Delivery Charges:
                      {zone.delivery_charges !== null &&
                      zone.delivery_charges !== undefined
                        ? zone.delivery_charges.toFixed(2)
                        : "0.00"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/admin/zones/edit/${zone.id}`}>
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
              <Link href="/admin/zones/add">
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
