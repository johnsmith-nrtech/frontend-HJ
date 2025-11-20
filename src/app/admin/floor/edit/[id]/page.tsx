"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useFloor, useUpdateFloor } from "@/hooks/use-floors";

// ✅ Validation schema
const formSchema = z.object({
  name: z.string().min(1, "Floor name is required"),
  charges: z.coerce.number().min(0, "Charges must be at least 0"),
});

export default function EditFloorPage() {
  const router = useRouter();
  const params = useParams();
  const floorId = params.id as string;

  // Fetch floor data
  const { data: floor, isLoading, isError, error } = useFloor(floorId);

  // Mutation for update
  const updateFloorMutation = useUpdateFloor(floorId);

  // React Hook Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", charges: 0 },
  });

  // Reset form when floor data loads
  useEffect(() => {
    if (floor) {
      form.reset({
        name: floor.name,
        charges: floor.charges,
      });
    }
  }, [floor, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updateFloorMutation.mutateAsync(values);
      router.push("/admin/floor");
      router.refresh();
    } catch (err) {
      console.error("Error updating floor:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p>Loading floor data...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <p className="text-red-500">
          Error loading floor:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
        <Button onClick={() => router.push("/admin/floor")}>
          Return to Floors
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/floor">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Floor</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Floor Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Floor Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Floor Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Ground Floor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Charges */}
              <FormField
                control={form.control}
                name="charges"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Charges *</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Link href="/admin/floor">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={updateFloorMutation.isPending}>
                  {updateFloorMutation.isPending ? "Saving..." : "Update Floor"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
