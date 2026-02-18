"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUserProfile, useUpdateProfile } from "@/lib/api/auth";
import { useCartStore } from "@/lib/store/cart-store";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

export default function ProfilePage() {
  const { data: profile, isLoading, error } = useUserProfile();
  const updateProfileMutation = useUpdateProfile();
  const { items, totalItems, subtotal, assemblyTotal } = useCartStore();

  const [isMounted, setIsMounted] = useState(false);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update form fields when profile data loads
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhoneNumber(profile.phone_number || "");
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfileMutation.mutateAsync({
      name,
      phone_number: phoneNumber,
    });
  };

  // Show loading state only after component has mounted to prevent hydration mismatch
  if (!isMounted || isLoading) {
    return (
      <div className="container mx-auto py-12">
        <div className="flex h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="border-primary mx-auto h-10 w-10 animate-spin rounded-full border-4 border-t-transparent"></div>
            <p className="mt-4">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12">
        <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          <p>Error loading profile. Please try again later.</p>
        </div>
      </div>
    );
  }

  const totalPrice = subtotal + assemblyTotal;

  return (
    <div className="mt-10 px-2 py-12 sm:px-[32px]">
      <h1 className="font-bebas mb-8 text-center text-3xl font-normal sm:text-start">
        My Profile
      </h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-bebas font-normal">
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and how we can reach you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile?.email}
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1234567890"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="mt-6"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending
                    ? "Saving..."
                    : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="font-bebas font-normal">My Cart</CardTitle>
              <CardDescription>
                Items currently in your shopping cart
              </CardDescription>
            </CardHeader>
            <CardContent>
              {totalItems === 0 ? (
                <p className="text-muted-foreground">Your cart is empty</p>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="bg-muted relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border">
                        {item.image ? (
                          <Image
                            fill
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              const parent = target.parentElement;
                              if (parent) {
                                const placeholder =
                                  document.createElement("div");
                                placeholder.className =
                                  "absolute inset-0 flex items-center justify-center";
                                placeholder.innerHTML =
                                  '<span class="text-muted-foreground text-xs">No Image</span>';
                                parent.appendChild(placeholder);
                              }
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-muted-foreground text-xs">
                              No Image
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 justify-between">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-muted-foreground text-sm">
                            {item.quantity} × £{item.price.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-medium">
                          £{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>£{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <a href="/cart">View Cart</a>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
