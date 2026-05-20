// "use client";

// import React, { useEffect, useState } from "react";
// import { GoogleMap, Marker, LoadScript } from "@react-google-maps/api";

// export default function OrderTrackingPage({ orderId }: { orderId: string }) {
//   const [order, setOrder] = useState<any>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(false);
//   const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
//   const [mapLoading, setMapLoading] = useState(true);


//   useEffect(() => {
//     const fetchOrder = async () => {
//       try {
//         const response = await fetch(
//           `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}`
//         );
//         if (!response.ok) throw new Error("Failed to fetch order");
//         const data = await response.json();
//         setOrder(data);
//       } catch {
//         setError(true);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchOrder();
//   }, [orderId]);

//   useEffect(() => {
//     if (!order) return;

//     const shippingAddress = order.shipping_address;
//     const fullAddress = `${shippingAddress.street_address}, ${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.country_name}, ${shippingAddress.postal_code}`;

//     const fetchCoordinates = async () => {
//   try {
//     const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
//     const response = await fetch(
//       `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`
//     );
//     const result = await response.json();
//     if (result.results?.[0]) {
//       const location = result.results[0].geometry.location;
//       setCoordinates({ lat: location.lat, lng: location.lng });
//     } else {
//       setCoordinates({ lat: 31.5204, lng: 74.3587 });
//     }
//   } catch {
//     setCoordinates({ lat: 31.5204, lng: 74.3587 });
//   } finally {
//     setMapLoading(false); // ← add this
//   }
// };

//     fetchCoordinates();
//   }, [order]);

//   if (isLoading) return <div className="p-10 text-center">Loading your orders...</div>;
//   if (error) return <div className="p-10 text-center text-red-500">Error loading orders.</div>;
//   if (!order) return <div className="p-10 text-center">No orders found.</div>;

//   const steps = ["Package Confirmed", "Delivery in Progress", "Delivered"];
//   const currentStep =
//     order.status === "pending" ? 0
//     : order.status === "paid" ? 1
//     : order.status === "shipped" ? 2
//     : order.status === "delivered" ? 3
//     : 0;

//   const shippingAddress = order.shipping_address;
//   const mapContainerStyle = { width: "100%", height: "300px", borderRadius: "16px" };

//   return (
//     <div className="min-h-screen bg-gray-50 px-6 py-10">
//       <h1 className="mb-2 text-center text-7xl font-bold">Track Your Order</h1>
//       <p className="mb-10 text-center text-gray-500">Track Your Order</p>

//       <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-lg">
//         {coordinates && (
//           <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
//             <GoogleMap mapContainerStyle={mapContainerStyle} center={coordinates} zoom={15}>
//               <Marker position={coordinates} />
//             </GoogleMap>
//           </LoadScript>
//         )}

//         <div className="mt-6">
//           <h2 className="mb-4 text-3xl font-bold">Order Status</h2>
//           {steps.map((label, index) => (
//             <div key={index} className="relative flex items-start gap-3 pb-6">
//               {index < steps.length - 1 && (
//                 <div className="absolute top-3 left-1.5 z-0 h-12 w-0.5 bg-gray-300"></div>
//               )}
//               <div className={`z-10 mt-1 h-4 w-4 rounded-full ${index <= currentStep ? "bg-blue-600" : "bg-gray-400"}`}></div>
//               <div className="flex-1">
//                 <div className="text-[14px] font-semibold text-gray-800">{label}</div>
//                 {index === 2 && (
//                   <div className="mt-1 text-[13px] text-gray-600">
//                     {shippingAddress.street_address}, {shippingAddress.city}
//                     {shippingAddress.state}, {shippingAddress.country_name},{" "}
//                     {shippingAddress.postal_code}
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }









// "use client";

// import React, { useEffect, useState } from "react";
// import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

// export default function OrderTrackingPage({ orderId }: { orderId: string }) {
//   const [order, setOrder] = useState<any>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(false);
//   const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
//   const [showMap, setShowMap] = useState(false);


//   const { isLoaded: mapLoaded } = useJsApiLoader({
//     googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
//   });

//   useEffect(() => {
//     if (mapLoaded && coordinates) {
//       const timer = setTimeout(() => {
//         setShowMap(true);
//       }, 2000);
//       return () => clearTimeout(timer);
//     }
//   }, [mapLoaded, coordinates]);

  
//   useEffect(() => {
//     const fetchOrder = async () => {
//       try {
//         const response = await fetch(
//           `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}`
//         );
//         if (!response.ok) throw new Error("Failed to fetch order");
//         const data = await response.json();
//         setOrder(data);
//       } catch {
//         setError(true);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchOrder();
//   }, [orderId]);

//   useEffect(() => {
//     if (!order) return;

//     const shippingAddress = order.shipping_address;
//     const fullAddress = `${shippingAddress.street_address}, ${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.country_name}, ${shippingAddress.postal_code}`;

//     const fetchCoordinates = async () => {
//       try {
//         const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
//         const response = await fetch(
//           `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`
//         );
//         const result = await response.json();
//         if (result.results?.[0]) {
//           const location = result.results[0].geometry.location;
//           setCoordinates({ lat: location.lat, lng: location.lng });
//         } else {
//           setCoordinates({ lat: 31.5204, lng: 74.3587 });
//         }
//       } catch {
//         setCoordinates({ lat: 31.5204, lng: 74.3587 });
//       }
//     };

//     fetchCoordinates();
//   }, [order]);

//   if (isLoading) return <div className="p-10 text-center">Loading your order...</div>;
//   if (error) return <div className="p-10 text-center text-red-500">Error loading order.</div>;
//   if (!order) return <div className="p-10 text-center">No order found.</div>;

//   const steps = ["Package Confirmed", "Delivery in Progress", "Delivered"];
//   const currentStep =
//     order.status === "pending" ? 0
//     : order.status === "paid" ? 1
//     : order.status === "shipped" ? 2
//     : order.status === "delivered" ? 3
//     : 0;

//   const shippingAddress = order.shipping_address;
//   const mapContainerStyle = { width: "100%", height: "300px", borderRadius: "16px" };

//   return (
//     <div className="min-h-screen bg-gray-50 px-6 py-10">
//       <h1 className="mb-2 text-center text-7xl font-bold">Track Your Order</h1>
//       <p className="mb-10 text-center text-gray-500">Track Your Order</p>

//       <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-lg">

//         {!mapLoaded ? (
//           <p className="text-sm text-gray-400 mb-4">Loading map...</p>
//         ) : coordinates ? (
//           <GoogleMap
//             mapContainerStyle={mapContainerStyle}
//             center={coordinates}
//             zoom={15}
//           >
//             <Marker position={coordinates} />
//           </GoogleMap>
//         ) : null}

//         <div className="mt-6">
//           <h2 className="mb-4 text-3xl font-bold">Order Status</h2>
//           {steps.map((label, index) => (
//             <div key={index} className="relative flex items-start gap-3 pb-6">
//               {index < steps.length - 1 && (
//                 <div className="absolute top-3 left-1.5 z-0 h-12 w-0.5 bg-gray-300"></div>
//               )}
//               <div
//                 className={`z-10 mt-1 h-4 w-4 rounded-full ${
//                   index <= currentStep ? "bg-blue-600" : "bg-gray-400"
//                 }`}
//               ></div>
//               <div className="flex-1">
//                 <div className="text-[14px] font-semibold text-gray-800">{label}</div>
//                 {index === 2 && (
//                   <div className="mt-1 text-[13px] text-gray-600">
//                     {shippingAddress.street_address}, {shippingAddress.city},{" "}
//                     {shippingAddress.state}, {shippingAddress.country_name},{" "}
//                     {shippingAddress.postal_code}
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }









"use client";

import React, { useEffect, useState } from "react";

export default function OrderTrackingPage({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}`
        );
        if (!response.ok) throw new Error("Failed to fetch order");
        const data = await response.json();
        setOrder(data);
      } catch {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (isLoading) return <div className="p-10 text-center">Loading your order...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error loading order.</div>;
  if (!order) return <div className="p-10 text-center">No order found.</div>;

  const steps = ["Package Confirmed", "Delivery in Progress", "Delivered"];
  const currentStep =
    order.status === "pending" ? 0
    : order.status === "paid" ? 1
    : order.status === "shipped" ? 2
    : order.status === "delivered" ? 3
    : 0;

  const shippingAddress = order.shipping_address;

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <h1 className="mb-2 text-center text-7xl font-bold">Track Your Order</h1>
      <p className="mb-10 text-center text-gray-500">Track Your Order</p>

      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-lg">
        <div className="mt-6">
          <h2 className="mb-4 text-3xl font-bold">Order Status</h2>
          {steps.map((label, index) => (
            <div key={index} className="relative flex items-start gap-3 pb-6">
              {index < steps.length - 1 && (
                <div className="absolute top-3 left-1.5 z-0 h-12 w-0.5 bg-gray-300"></div>
              )}
              <div className={`z-10 mt-1 h-4 w-4 rounded-full ${index <= currentStep ? "bg-blue-600" : "bg-gray-400"}`}></div>
              <div className="flex-1">
                <div className="text-[14px] font-semibold text-gray-800">{label}</div>
                {index === 2 && (
                  <div className="mt-1 text-[13px] text-gray-600">
                    {shippingAddress.street_address}, {shippingAddress.city},{" "}
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