"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
<<<<<<< HEAD
import { useCreateFloor } from "@/hooks/use-floors";
=======
import { useAuth } from "@/hooks/useAuth";
import { useCreateFloor } from "@/hooks/use-floors"; 
>>>>>>> b727c9932512901c4a30e6c6daaa0c00edd6e7ae

// ✅ Validation Schema
const formSchema = z.object({
  name: z.string().min(1, "Floor name is required"),
  charges: z.coerce.number().min(0, "Charges must be at least 0"),
});

export default function AddFloorPage() {
<<<<<<< HEAD
=======
  // ✅ Auth check
  useAuth({ redirectTo: "/login", requireAuth: true });

>>>>>>> b727c9932512901c4a30e6c6daaa0c00edd6e7ae
  const router = useRouter();
  const createFloorMutation = useCreateFloor();

  // ✅ Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      charges: 0,
    },
  });

  // ✅ Submit handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createFloorMutation.mutateAsync(values);
      router.push("/admin/floor");
      router.refresh();
    } catch (error) {
      console.error("Error creating floor:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/floor">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Add New Floor</h1>
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
                    <FormDescription>
<<<<<<< HEAD
                      Enter a name for this floor (e.g. Ground Floor, 1st
                      Floor).
=======
                      Enter a name for this floor (e.g. Ground Floor, 1st Floor).
>>>>>>> b727c9932512901c4a30e6c6daaa0c00edd6e7ae
                    </FormDescription>
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
                      <Input
                        type="number"
                        min="0"
                        placeholder="Enter floor charges"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Specify the charges associated with this floor.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Buttons */}
              <div className="flex justify-end gap-4">
                <Link href="/admin/floor">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
<<<<<<< HEAD
                <Button type="submit" disabled={createFloorMutation.isPending}>
=======
                <Button
                  type="submit"
                  disabled={createFloorMutation.isPending}
                >
>>>>>>> b727c9932512901c4a30e6c6daaa0c00edd6e7ae
                  {createFloorMutation.isPending
                    ? "Creating..."
                    : "Create Floor"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
