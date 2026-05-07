// "use client";

// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// import { toast } from "sonner";
// import { ChevronLeft } from "lucide-react";
// import { ApiService } from "@/lib/api-service";

// const fmt = (n: number) =>
//   n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// export default function LoanApprovedPage() {
//   const params = useParams();
//   const orderId = params.orderId as string;

//   const [order, setOrder] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
//   const [paymentFields, setPaymentFields] = useState<Record<string, string> | null>(null);
//   const [depositAmount, setDepositAmount] = useState(0);
//   const [depositPct, setDepositPct] = useState(10);
//   const [installmentTerm, setInstallmentTerm] = useState(6);


// useEffect(() => {
//   const savedUrl = localStorage.getItem("installment_payment_url");
//   if (savedUrl) setPaymentUrl(savedUrl);

//   const fetchOrder = async () => {
//   try {
//     const res = await ApiService.fetchWithAuth(`/orders/${orderId}`);
//     if (res.status === 401 || res.status === 403) {
//       window.location.href = `/login?redirect=/loan-approved/${orderId}`;
//       return;
//     }
//     if (res.ok) {
//       const data = await res.json();

//       if (data.status !== 'loan_approved') {
//         setOrder(null);
//         setLoading(false);
//         return;
//       }

//       setOrder(data);

//         // Calculate total first
//         const calculatedTotal = data.total_amount +
//           (data.floor?.charges || 0) +
//           (data.zone?.delivery_charges || 0) -
//           (data.discount_amount || 0);

//         // Priority: DB values → localStorage → Calculate from percentage
//         if (data.deposit_amount && data.deposit_amount > 0) {
//           setDepositAmount(data.deposit_amount);
//         } else {
//           const savedDeposit = localStorage.getItem("installment_deposit");
//           if (savedDeposit) {
//             setDepositAmount(parseFloat(savedDeposit));
//           } else {
//             // Calculate deposit from percentage (default to 10%)
//             const pctToUse = data.deposit_percentage || 10;
//             const calculatedDeposit = (calculatedTotal * pctToUse) / 100;
//             setDepositAmount(calculatedDeposit);
//           }
//         }

//         const savedUrl = localStorage.getItem("installment_payment_url");
//         const savedFields = localStorage.getItem("installment_payment_fields");
//         if (savedUrl) setPaymentUrl(savedUrl);
//         if (savedFields) {
//           try {
//             setPaymentFields(JSON.parse(savedFields));
//           } catch {}
//         }

//         // Set deposit percentage
//         if (data.admin_deposit_percentage) {
//           setDepositPct(data.admin_deposit_percentage);
//         } else if (data.deposit_percentage) {
//           setDepositPct(data.deposit_percentage);
//         } else {
//             const savedDepositPct = localStorage.getItem("installment_deposit_pct");
//             if (savedDepositPct) {
//             setDepositPct(parseInt(savedDepositPct));
//             } else {
//               setDepositPct(10); // Default to 10%
//           }
//         }

//         // Set installment term
//         if (data.admin_installment_term) {
//           setInstallmentTerm(data.admin_installment_term);
//         } else if (data.installment_term) {
//           setInstallmentTerm(data.installment_term);
//         } else {
//           setInstallmentTerm(6); // Default to 6 months
//         }
//       }
//     } catch (err) {
//       console.error("Failed to fetch order:", err);
//       // Redirect to login with return URL
//       window.location.href = `/login?redirect=/loan-approved/${orderId}`;
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchOrder();
// }, [orderId]);

//     const handlePayDeposit = () => {
//   if (!paymentUrl || !paymentFields) {
//     toast.error("Payment session expired. Please go through checkout again.");
//     return;
//   }

//   // Clear localStorage
//   localStorage.removeItem("installment_payment_url");
//   localStorage.removeItem("installment_payment_fields");
//   localStorage.removeItem("installment_deposit");
//   localStorage.removeItem("installment_deposit_pct");
//   localStorage.removeItem("installment_order_id");

//   // Build hidden form and POST to Cardstream
//   const form = document.createElement("form");
//   form.method = "POST";
//   form.action = paymentUrl;
//   form.style.display = "none";

//   Object.entries(paymentFields).forEach(([key, value]) => {
//     const input = document.createElement("input");
//     input.type = "hidden";
//     input.name = key;
//     input.value = value;
//     form.appendChild(input);
//   });

//   document.body.appendChild(form);
//   form.submit();
// };

//   if (loading) {
//     return (
//         <div className="flex min-h-screen items-center justify-center">
//             <p className="text-gray-500">Loading your order...</p>
//         </div>
//     );
//   }

//   if (!order) {
//     return (
//         <div className="flex min-h-screen items-center justify-center">
//             <div className="text-center p-10 rounded-xl border border-yellow-200 bg-yellow-50 max-w-md">
//                 <h1 className="text-2xl font-bold text-yellow-800 mb-3">Loan Not Approved Yet</h1>
//                 <p className="text-yellow-700 text-sm">Your loan application is still being reviewed. You will receive an email once it is approved.</p>
//                 <a href="/" className="mt-6 inline-block text-blue-600 underline text-sm">Return to Home</a>
//             </div>
//         </div>
//     );
//   }

//   const total = order
//     ? order.total_amount +
//       (order.floor?.charges || 0) +
//       (order.zone?.delivery_charges || 0) -
//       (order.discount_amount || 0)
//     : 0;

//   const creditAmount = total - depositAmount;
//   const term = 12; // default term
//   const monthlyPayment = creditAmount / installmentTerm;

//   return (
//     <div className="min-h-screen bg-white font-sans">
//       <div className="mx-auto max-w-4xl px-4 py-10">
//         {/* Success Banner */}
//         <div className="mb-8 rounded-xl bg-blue-100 border border-blue-200 p-6 text-center">
//           <h1 className="text-2xl font-bold text-blue-800 mb-2">
//             🎉 Your Loan Has Been Approved!
//           </h1>
//           <p className="text-blue-600 text-sm">
//             Order #{orderId.slice(0, 8).toUpperCase()} — Pay your deposit to confirm your order.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
//           {/* Left: Order Details */}
//           {order && (
//             <div className="space-y-4">
//               <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
//               <div className="border border-gray-200 rounded-xl p-5 space-y-3 text-sm">
//                 <SummaryRow label="Products Total" value={`£${fmt(order.total_amount)}`} />
//                 {order.floor?.charges > 0 && (
//                   <SummaryRow label="Floor Delivery" value={`£${fmt(order.floor.charges)}`} />
//                 )}
//                 {order.zone?.delivery_charges > 0 && (
//                   <SummaryRow label="Shipping" value={`£${fmt(order.zone.delivery_charges)}`} />
//                 )}
//                 {order.discount_amount > 0 && (
//                   <SummaryRow label="Discount" value={`-£${fmt(order.discount_amount)}`} className="text-green-600" />
//                 )}
//                 <div className="border-t pt-3">
//                   <SummaryRow label="Order Total" value={`£${fmt(total)}`} bold />
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Right: Installment Summary + Pay Deposit */}
//           <div>
//             <h2 className="text-lg font-bold text-gray-900 mb-4">Installment Summary</h2>
//             <div className="border border-gray-200 rounded-xl p-5 space-y-3 text-sm">
//               <SummaryRow label={`Deposit (${depositPct}%)`} value={`£${fmt(depositAmount)}`} />
//               <SummaryRow label="Credit Amount" value={`£${fmt(creditAmount)}`} />
//               {/* <SummaryRow label="Representative APR" value="0%" /> */}
//               {/* <SummaryRow label="Interest" value="£0.00" /> */}
//               <SummaryRow label="Monthly Payments" value={`£${fmt(monthlyPayment)}`} />
//               <SummaryRow label="Installment Term" value={`${installmentTerm} Months`} />
//               <div className="border-t pt-3">
//                 <SummaryRow label="Total Amount Payable" value={`£${fmt(total)}`} bold />
//               </div>

//               <div className="pt-2">
//                 <button
//                     onClick={handlePayDeposit}
//                     className="w-full cursor-pointer rounded-full bg-blue-600 px-8 py-4 font-semibold text-white shadow-md hover:bg-blue-700 active:scale-[0.98] transition-all"
//                 >
//                     Pay Deposit — £{fmt(depositAmount)}
//                 </button>
//               </div>
//               <p className="text-xs text-center text-gray-400 pt-1">
//                 You will be redirected to our secure payment page.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function SummaryRow({
//   label,
//   value,
//   bold = false,
//   className = "",
// }: {
//   label: string;
//   value: string;
//   bold?: boolean;
//   className?: string;
// }) {
//   return (
//     <div className={`flex items-center justify-between ${bold ? "font-bold text-gray-900" : "text-gray-600"} ${className}`}>
//       <span>{label}</span>
//       <span>{value}</span>
//     </div>
//   );
// }









"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ApiService } from "@/lib/api-service";

const fmt = (n: number) =>
  n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function LoanApprovedPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState(0);
  const [depositPct, setDepositPct] = useState(10);
  const [installmentTerm, setInstallmentTerm] = useState(6);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await ApiService.fetchWithAuth(`/orders/${orderId}`);
        if (res.status === 401 || res.status === 403) {
          window.location.href = `/login?redirect=/loan-approved/${orderId}`;
          return;
        }
        if (res.ok) {
          const data = await res.json();

          if (data.status !== 'loan_approved') {
            setOrder(null);
            setLoading(false);
            return;
          }

          setOrder(data);

          const calculatedTotal =
            data.total_amount +
            (data.floor?.charges || 0) +
            (data.zone?.delivery_charges || 0) -
            (data.discount_amount || 0);

          // ✅ Use admin-set deposit amount from DB
          if (data.deposit_amount && data.deposit_amount > 0) {
            setDepositAmount(data.deposit_amount);
          } else {
            const pctToUse = data.admin_deposit_percentage || data.deposit_percentage || 10;
            setDepositAmount((calculatedTotal * pctToUse) / 100);
          }

          // ✅ Use admin-set deposit percentage
          if (data.admin_deposit_percentage) {
            setDepositPct(data.admin_deposit_percentage);
          } else if (data.deposit_percentage) {
            setDepositPct(data.deposit_percentage);
          }

          // ✅ Use admin-set installment term
          if (data.admin_installment_term) {
            setInstallmentTerm(data.admin_installment_term);
          } else if (data.installment_term) {
            setInstallmentTerm(data.installment_term);
          }
        }
      } catch (err) {
        console.error("Failed to fetch order:", err);
        window.location.href = `/login?redirect=/loan-approved/${orderId}`;
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // ✅ Create fresh deposit payment request each time
  const handlePayDeposit = async () => {
    if (isPaying) return;
    setIsPaying(true);

    try {
      // Create a NEW payment request for deposit amount only
      const res = await ApiService.fetchWithAuth(
        `/orders/${orderId}/deposit-payment`,
        { method: "POST" }
      );

      if (res.status === 401 || res.status === 403) {
        window.location.href = `/login?redirect=/loan-approved/${orderId}`;
        return;
      }

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.message || "Failed to create payment. Please try again.");
        return;
      }

      const paymentResponse = await res.json();

      if (!paymentResponse.payment_url || !paymentResponse.payment_fields) {
        toast.error("Payment configuration error. Please contact support.");
        return;
      }

      // ✅ POST form to Cardstream with deposit amount fields
      const form = document.createElement("form");
      form.method = "POST";
      form.action = paymentResponse.payment_url;
      form.style.display = "none";

      Object.entries(paymentResponse.payment_fields).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      console.error("Payment error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading your order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center p-10 rounded-xl border border-yellow-200 bg-yellow-50 max-w-md">
          <h1 className="text-2xl font-bold text-yellow-800 mb-3">Loan Not Approved Yet</h1>
          <p className="text-yellow-700 text-sm">
            Your loan application is still being reviewed. You will receive an email once it is approved.
          </p>
          <a href="/" className="mt-6 inline-block text-blue-600 underline text-sm">
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  const total =
    order.total_amount +
    (order.floor?.charges || 0) +
    (order.zone?.delivery_charges || 0) -
    (order.discount_amount || 0);

  const creditAmount = total - depositAmount;
  const monthlyPayment = installmentTerm > 0 ? creditAmount / installmentTerm : 0;

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Success Banner */}
        <div className="mb-8 rounded-xl bg-blue-100 border border-blue-200 p-6 text-center">
          <h1 className="text-2xl font-bold text-blue-800 mb-2">
            🎉 Your Loan Has Been Approved!
          </h1>
          <p className="text-blue-600 text-sm">
            Order #{orderId.slice(0, 8).toUpperCase()} — Pay your deposit to confirm your order.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left: Order Summary */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
            <div className="border border-gray-200 rounded-xl p-5 space-y-3 text-sm">
              <SummaryRow label="Products Total" value={`£${fmt(order.total_amount)}`} />
              {order.floor?.charges > 0 && (
                <SummaryRow label="Floor Delivery" value={`£${fmt(order.floor.charges)}`} />
              )}
              {order.zone?.delivery_charges > 0 && (
                <SummaryRow label="Shipping" value={`£${fmt(order.zone.delivery_charges)}`} />
              )}
              {order.discount_amount > 0 && (
                <SummaryRow
                  label="Discount"
                  value={`-£${fmt(order.discount_amount)}`}
                  className="text-green-600"
                />
              )}
              <div className="border-t pt-3">
                <SummaryRow label="Order Total" value={`£${fmt(total)}`} bold />
              </div>
            </div>
          </div>

          {/* Right: Installment Summary + Pay Deposit */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Installment Summary</h2>
            <div className="border border-gray-200 rounded-xl p-5 space-y-3 text-sm">
              <SummaryRow label={`Deposit (${depositPct}%)`} value={`£${fmt(depositAmount)}`} />
              <SummaryRow label="Credit Amount" value={`£${fmt(creditAmount)}`} />
              <SummaryRow label="Monthly Payments" value={`£${fmt(monthlyPayment)}`} />
              <SummaryRow label="Installment Term" value={`${installmentTerm} Months`} />
              <div className="border-t pt-3">
                <SummaryRow label="Total Amount Payable" value={`£${fmt(total)}`} bold />
              </div>

              <div className="pt-2">
                <button
                  onClick={handlePayDeposit}
                  disabled={isPaying}
                  className="w-full cursor-pointer rounded-full bg-blue-600 px-8 py-4 font-semibold text-white shadow-md hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isPaying ? "Preparing payment..." : `Pay Deposit — £${fmt(depositAmount)}`}
                </button>
              </div>
              <p className="text-xs text-center text-gray-400 pt-1">
                You will be redirected to our secure payment page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  bold = false,
  className = "",
}: {
  label: string;
  value: string;
  bold?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between ${
        bold ? "font-bold text-gray-900" : "text-gray-600"
      } ${className}`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}