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
import { useAuth } from "@/hooks/useAuth";
import { useCreateZone } from "@/hooks/use-zones"; 

// ✅ Validation Schema
const formSchema = z.object({
  zone_name: z.string().min(1, "Zone name is required"),
  zip_code: z.string().min(1, "Zip code is required"),
  delivery_charges: z.coerce.number().min(0, "Delivery charges must be at least 0"),
});

export default function AddZonePage() {
  // ✅ Auth check
  useAuth({ redirectTo: "/login", requireAuth: true });

  const router = useRouter();
  const createZoneMutation = useCreateZone();

  // ✅ Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      zone_name: "",
      zip_code: "",
      delivery_charges: 0,
    },
  });

  // ✅ Submit handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createZoneMutation.mutateAsync(values);
      router.push("/admin/zones");
      router.refresh();
    } catch (error) {
      console.error("Error creating zone:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/zones">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Add New Zone</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Zone Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Zone Name */}
              <FormField
                control={form.control}
                name="zone_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zone Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. North Zone" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a name for this zone.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Zip Code */}
              <FormField
                control={form.control}
                name="zip_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zip Code *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 12345" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the zip code for this zone.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Delivery Charges */}
              <FormField
                control={form.control}
                name="delivery_charges"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Charges *</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" placeholder="0" {...field} />
                    </FormControl>
                    <FormDescription>
                      Specify the delivery charges for this zone.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Buttons */}
              <div className="flex justify-end gap-4">
                <Link href="/admin/zones">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={createZoneMutation.isPending}
                >
                  {createZoneMutation.isPending ? "Creating..." : "Create Zone"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
