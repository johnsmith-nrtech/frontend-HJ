"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useZone, useUpdateZone } from "@/hooks/use-zones";

// ✅ Validation Schema
const formSchema = z.object({
  zone_name: z.string().min(1, "Zone name is required"),
  zip_codes: z
    .array(
      z.object({
        code: z.string().min(1, "Zip code cannot be empty"),
      })
    )
    .min(1, "At least one zip code is required"),
  delivery_charges: z.coerce
    .number()
    .min(0, "Delivery charges must be at least 0"),
});

export default function EditZonePage() {
  const router = useRouter();
  const params = useParams();
  const zoneId = params.id as string;

  // Fetch zone data
  const { data: zone, isLoading, isError, error } = useZone(zoneId);

  // Mutation for update
  const updateZoneMutation = useUpdateZone(zoneId);

  // ✅ Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      zone_name: "",
      zip_codes: [{ code: "" }],
      delivery_charges: 0,
    },
  });

  // ✅ Dynamic array field management
  const { fields, append, remove } = useFieldArray<z.infer<typeof formSchema>>({
    control: form.control,
    name: "zip_codes",
  });

  // Reset form when zone data loads
  useEffect(() => {
    if (zone) {
      form.reset({
        zone_name: zone.zone_name,
        zip_codes: zone.zip_codes.map((code) => ({ code })),
        delivery_charges: zone.delivery_charges,
      });
    }
  }, [zone, form]);

  // ✅ Submit handler
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const filteredValues = {
      zone_name: values.zone_name,
      zip_codes: values.zip_codes
        .map((item) => item.code)
        .filter((code) => code.trim() !== ""),
      delivery_charges: values.delivery_charges,
    };

    updateZoneMutation.mutate(filteredValues, {
      onSuccess: () => {
        router.push("/admin/zones");
        router.refresh();
      },
      onError(error) {
        console.error("Error updating zone:", error);
      },
    });
  };

  // ✅ Add new zip code field
  const addZipCode = () => {
    append({ code: "" });
  };

  // ✅ Remove zip code field
  const removeZipCode = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p>Loading zone data...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <p className="text-red-500">
          Error loading zone:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
        <Button onClick={() => router.push("/admin/zones")}>
          Return to Zones
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/zones">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Zone</h1>
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

              {/* Dynamic Zip Codes */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Zip Codes *</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addZipCode}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Zip Code
                  </Button>
                </div>

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name={`zip_codes.${index}.code`}
                      render={({ field: zipField }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input
                                placeholder={`Zip code ${index + 1}`}
                                {...zipField}
                              />
                            </FormControl>
                            {fields.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => removeZipCode(index)}
                                className="shrink-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>

                <FormDescription>
                  Add zip codes that belong to this zone. Each zip code should
                  be unique.
                </FormDescription>

                {/* Show validation error for the array */}
                {form.formState.errors.zip_codes?.root && (
                  <p className="text-destructive text-sm font-medium">
                    {form.formState.errors.zip_codes.root.message}
                  </p>
                )}
              </div>

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
                <Button type="submit" disabled={updateZoneMutation.isPending}>
                  {updateZoneMutation.isPending ? "Updating..." : "Update Zone"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
