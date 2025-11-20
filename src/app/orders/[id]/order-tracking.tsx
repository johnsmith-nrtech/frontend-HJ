"use client";

import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, LoadScript } from "@react-google-maps/api";
import { useOrder } from "@/lib/api/orders";
import { cn } from "@/lib/utils";

export default function OrderTrackingPage({ orderId }: { orderId: string }) {
  const { data: order, isLoading, error } = useOrder(orderId);
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    if (!order) return;

    const shippingAddress = order.shipping_address;
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
  }, [order]);

  if (isLoading)
    return <div className="p-10 text-center">Loading your orders...</div>;
  if (error)
    return (
      <div className="p-10 text-center text-red-500">Error loading orders.</div>
    );

  if (!order) return <div className="p-10 text-center">No orders found.</div>;

  const STATUS_STEP_MAP: { [key: string]: number } = {
    pending: 0,
    paid: 1,
    shipped: 2,
    delivered: 3,
  };

  const steps = [
    { label: "Order Placed", status: "pending" },
    { label: "Package Confirmed", status: "paid" },
    { label: "Delivery in Progress", status: "shipped" },
    { label: "Delivered", status: "delivered" },
  ];

  const shippingAddress = order.shipping_address;
  const mapContainerStyle = {
    width: "100%",
    height: "300px",
    borderRadius: "16px",
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <h1 className="mb-2 text-center text-7xl font-bold">Track Your Order</h1>
      <p className="mb-10 text-center text-gray-500">Track Your Order</p>

      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-lg">
        {coordinates && (
          <LoadScript
            googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
          >
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={coordinates}
              zoom={15}
            >
              <Marker position={coordinates} />
            </GoogleMap>
          </LoadScript>
        )}

        <div className="mt-6">
          <h2 className="mb-4 text-3xl font-bold">
            Order Status
            <span className="ml-2 text-sm font-normal text-gray-500">
              (Order ID: {order.id})
            </span>
          </h2>
          {steps.map((step, index) => (
            <div key={index} className="relative flex items-start gap-3 pb-6">
              {index < steps.length - 1 && (
                <div className="absolute top-3 left-1.5 z-0 h-12 w-0.5 bg-gray-300"></div>
              )}

              <div
                className={cn("z-10 mt-1 h-4 w-4 rounded-full", {
                  "bg-blue-600": STATUS_STEP_MAP[order.status] >= index,
                  "bg-gray-400": STATUS_STEP_MAP[order.status] < index,
                })}
              />
              <div className="flex-1">
                <div className="text-[14px] font-semibold text-gray-800">
                  {step.label}
                </div>
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
