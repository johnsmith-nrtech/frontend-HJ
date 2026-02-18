"use client";

import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, LoadScript } from "@react-google-maps/api";
import { useAuth } from "@/hooks/useAuth";
import { useAllOrders } from "@/lib/api/orders";

export default function OrderTrackingPage() {
  const { user } = useAuth();
  // ✅ Correct user ID
  const userId = user?.data?.user?.id;

  // ✅ Only call useAllOrders when userId exists
 const { data, isLoading, error } = useAllOrders({
  user_id: userId ?? "", // fallback to empty string
});
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!data?.items?.[0]) return;

    const shippingAddress = data.items[0].shipping_address;
    const fullAddress = `${shippingAddress.street_address}, ${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.country_name}, ${shippingAddress.postal_code}`;

    const fetchCoordinates = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          fullAddress
        )}&key=${apiKey}`
      );
      const result = await response.json();
      if (result.results?.[0]) {
        const location = result.results[0].geometry.location;
        setCoordinates({ lat: location.lat, lng: location.lng });
      } else {
        setCoordinates({ lat: 31.5204, lng: 74.3587 }); // fallback
      }
    };

    fetchCoordinates();
  }, [data]);

  if (!user) return <div className="p-10 text-center">Please login to track your orders.</div>;
  if (isLoading) return <div className="p-10 text-center">Loading your orders...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error loading orders.</div>;

  const order = data?.items?.[0];
  if (!order) return <div className="p-10 text-center">No orders found.</div>;

  const steps = ["Package Confirmed", "Delivery in Progress", "Delivered"];
  const currentStep =
    order.status === "pending"
      ? 0
      : order.status === "paid"
      ? 1
      : order.status === "shipped"
      ? 2
      : 0;

  const shippingAddress = order.shipping_address;
  const mapContainerStyle = { width: "100%", height: "300px", borderRadius: "16px" };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h1 className="text-center text-7xl font-bold mb-2">Track Your Order</h1>
      <p className="text-center text-gray-500 mb-10">Track Your Order</p>

      <div className="max-w-4xl mx-auto bg-white p-6 rounded-3xl shadow-lg">
        {coordinates && (
          <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <GoogleMap mapContainerStyle={mapContainerStyle} center={coordinates} zoom={15}>
              <Marker position={coordinates} />
            </GoogleMap>
          </LoadScript>
        )}

        <div className="mt-6">
          <h2 className="text-3xl font-bold mb-4">Order Status</h2>
          {steps.map((label, index) => (
            <div key={index} className="relative flex items-start gap-3 pb-6">
              {index < steps.length - 1 && (
                <div className="absolute left-1.5 top-3 w-0.5 h-12 bg-gray-300 z-0"></div>
              )}
              <div
                className={`w-4 h-4 rounded-full mt-1 z-10 ${
                  index <= currentStep ? "bg-blue-600" : "bg-gray-400"
                }`}
              ></div>
              <div className="flex-1">
                <div className="text-[14px] font-semibold text-gray-800">{label}</div>
                {index === 2 && (
                  <div className="mt-1 text-[13px] text-gray-600">
                    {shippingAddress.street_address}, {shippingAddress.city}
                    {shippingAddress.state}, {shippingAddress.country_name},{" "}
                    {shippingAddress.postal_code}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
