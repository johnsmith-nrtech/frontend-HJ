// "use client";

// import React, { useMemo, useState, useEffect } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import { ChevronLeft, Info } from "lucide-react";

// // ─── Constants ────────────────────────────────────────────────────────────────
// const DEPOSIT_OPTIONS = [10, 20, 30, 40, 50]; // percentages
// const TERM_OPTIONS = [6, 12, 24, 36]; // months

// // ─── Helpers ─────────────────────────────────────────────────────────────────
// const fmt = (n: number) =>
//   n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// // ─── Page ─────────────────────────────────────────────────────────────────────
// export default function InstallmentsPage() {
//   const params = useSearchParams();
//   const router = useRouter();

//   const total = parseFloat(params.get("total") || "0");
//   const floor = parseFloat(params.get("floor") || "0");
//   const shipping = parseFloat(params.get("shipping") || "0");
//   const discount = parseFloat(params.get("discount") || "0");
//   const productSubtotal = total - floor - shipping + discount;

//   const [depositPct, setDepositPct] = useState(10);
//   const [term, setTerm] = useState(6);

//   const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
//   const [savedDeposit, setSavedDeposit] = useState(0);

//   useEffect(() => {
//     const url = localStorage.getItem("installment_payment_url");
//     const deposit = localStorage.getItem("installment_deposit");
//     if (url) setPaymentUrl(url);
//     if (deposit) setSavedDeposit(parseFloat(deposit));
//   }, []);

//   const depositAmount = useMemo(() => (total * depositPct) / 100, [total, depositPct]);
//   const creditAmount = useMemo(() => total - depositAmount, [total, depositAmount]);
//   const monthlyPayment = useMemo(() => (term > 0 ? creditAmount / term : 0), [creditAmount, term]);

// const handleProceed = async () => {
//   // Save to localStorage
//   localStorage.setItem("installment_deposit_pct", depositPct.toString());
//   localStorage.setItem("installment_deposit", depositAmount.toFixed(2));

//   // Save to DB so email link works on any device
//   const orderId = localStorage.getItem("installment_order_id");
//   if (orderId) {
//     try {
//       await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/deposit-info`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           deposit_amount: depositAmount,
//           deposit_percentage: depositPct,
//           installment_term: term,
//         }),
//       });
//     } catch (err) {
//       console.error("Failed to save deposit info to DB:", err);
//     }
//   }

//   window.location.href = "https://ideal4finance.com/loan-apply/aleena?r=ob";
// };

//   const handlePayDeposit = () => {
//     if (!paymentUrl) return;
//     localStorage.removeItem("installment_payment_url");
//     localStorage.removeItem("installment_deposit");
//     window.location.href = paymentUrl;
//   };

//   return (
//     <div className="min-h-screen bg-white font-sans">
//       {/* ── Top bar ── */}
//       <div className="px-6 py-4">
//         <div className="mx-auto flex max-w-6xl items-center gap-4">
//           <button
//             onClick={() => router.push("/cart?step=3")}
//             className="flex items-center gap-1 cursor-pointer text-sm text-gray-500 hover:text-gray-800"
//           >
//             <ChevronLeft size={16} />
//             Back
//           </button>
//           <span className="text-sm text-gray-400">|</span>
//           <span className="text-sm font-semibold text-gray-700">
//             Apply for interest free credit
//           </span>
//           <span className="ml-auto text-sm text-gray-400">Step 1 of 6</span>
//         </div>
//       </div>

//       <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 lg:grid-cols-3">

//         {/* ── Left: Main Form ─────────────────────────────────────────────── */}
//         <div className="lg:col-span-2">

//           {/* Intro */}
//           <div className="rounded-xl px-6">
//             <h2 className="mb-3 text-2xl font-bold text-gray-900">
//               Apply for interest free credit (ARP 0%)
//             </h2>
//             <p className="text-sm leading-relaxed text-gray-600">
//               Spread the cost with up to 48 months interest free with no deposit and choose
//               to start paying for your furniture 30 days after delivery or pay nothing for
//               the first year. 0% APR REPRESENTATIVE.
//             </p>
//             <p className="mt-3 text-sm leading-relaxed text-gray-500">
//               Please note if you would like to defer your first payment then call us on{" "}
//               <span className="font-medium text-gray-700">0800 110 5777</span> to complete
//               your order. You may wish to reduce your monthly payments by paying a larger deposit.
//             </p>
//           </div>

//           {/* ── Deposit Selector ── */}
//           <div className="mt-9 rounded-xl px-6">
//             <h2 className="mb-1 text-lg font-bold text-gray-900">
//               Would you like to pay a deposit?
//             </h2>
//             <p className="mb-5 text-sm text-gray-500">
//               Paying a deposit can help reduce your monthly payments.
//             </p>
//             <h2 className="mb-3 text-base font-semibold text-gray-800">
//               How much would you like to pay?
//             </h2>
//             <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 md:grid-cols-6">
//               {DEPOSIT_OPTIONS.map((pct) => {
//                 const amt = (total * pct) / 100;
//                 const active = depositPct === pct;
//                 return (
//                   <button
//                     key={pct}
//                     onClick={() => setDepositPct(pct)}
//                     className={`flex flex-col items-center justify-center border-2 px-2 py-3 text-center transition-all ${
//                       active
//                         ? "border-[#3d1a6e] bg-[#3d1a6e] text-white"
//                         : "border-gray-200 bg-white text-gray-700 hover:border-[#3d1a6e] hover:bg-purple-50"
//                     }`}
//                   >
//                     <span className="text-sm font-bold">£{fmt(amt)}</span>
//                     <span className={`text-xs ${active ? "text-purple-200" : "text-gray-400"}`}>
//                       {pct}% Deposit
//                     </span>
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* ── Term Selector ── */}
//           <div className="mt-8 rounded-xl p-6">
//             <h2 className="mb-1 text-lg font-bold text-gray-900">
//               Over how long would you like to spread the cost?
//             </h2>
//             <p className="mb-5 text-sm text-gray-500">Choose your preferred re-payment term</p>
//             <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-4">
//               {TERM_OPTIONS.map((t) => {
//                 const monthly = creditAmount / t;
//                 const active = term === t;
//                 return (
//                   <button
//                     key={t}
//                     onClick={() => setTerm(t)}
//                     className={`flex flex-col items-center justify-center border-2 px-2 py-3 text-center transition-all ${
//                       active
//                         ? "border-[#3d1a6e] bg-[#3d1a6e] text-white"
//                         : "border-gray-200 bg-white text-gray-700 hover:border-[#3d1a6e] hover:bg-purple-50"
//                     }`}
//                   >
//                     <span className="text-sm font-bold">{t} months</span>
//                     <span className={`text-xs ${active ? "text-purple-200" : "text-gray-400"}`}>
//                       £{fmt(monthly)} p/m
//                     </span>
//                   </button>
//                 );
//               })}
//             </div>
//             <button
//               onClick={handleProceed}
//               className="mt-6 w-full cursor-pointer rounded-full bg-[#3d1a6e] px-8 py-4 font-semibold text-white shadow-md transition-all hover:bg-[#2e1356] active:scale-[0.98]"
//             >
//               Continue with Installments →
//             </button>
//           </div>

//         </div>

//         {/* ── Right: Order Summary ─────────────────────────────────────────── */}
//         <div className="lg:sticky lg:top-6 lg:self-start">
//           <div className="border border-gray-200 border-r-0 bg-white p-6">
//             <h2 className="mb-5 text-lg font-bold text-gray-900">Order summary</h2>

//             <div className="space-y-3 text-sm">
//               <SummaryRow label="Product subtotal" value={`£${fmt(productSubtotal)}`} />
//               {floor > 0 && <SummaryRow label="Floor delivery" value={`£${fmt(floor)}`} />}
//               {shipping > 0 && <SummaryRow label="Shipping" value={`£${fmt(shipping)}`} />}
//               {discount > 0 && (
//                 <SummaryRow label="Discount" value={`-£${fmt(discount)}`} className="text-green-600" />
//               )}
//               <div className="border-t border-gray-200 pt-3">
//                 <SummaryRow label="Order total" value={`£${fmt(total)}`} bold />
//               </div>
//             </div>

//             <hr className="my-4 border-gray-100" />

//             {/* Installment breakdown */}
//             <div className="space-y-3 text-sm">
//               <SummaryRow label="Deposit" value={`£${fmt(depositAmount)}`} />
//               <SummaryRow label="Credit Amount" value={`£${fmt(creditAmount)}`} />
//               <SummaryRow label="Representative APR" value="0%" />
//               <SummaryRow label="Interest" value="£0.00" />
//               <SummaryRow label="Monthly Payments" value={`£${fmt(monthlyPayment)}`} />
//               <SummaryRow label="Loan Term" value={`${term} Months`} />
//               <div className="border-t border-gray-200 pt-3">
//                 <SummaryRow label="Total Amount Payable" value={`£${fmt(total)}`} bold />
//               </div>
//             </div>

//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Small helper ─────────────────────────────────────────────────────────────
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

import React, { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const DEPOSIT_OPTIONS = [10, 20, 30, 40, 50];
const TERM_OPTIONS = [6, 12, 24, 36];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── Inner Component ─────────────────────────────────────────────────────────
function InstallmentsContent() {
  const params = useSearchParams();
  const router = useRouter();

  const total = parseFloat(params.get("total") || "0");
  const floor = parseFloat(params.get("floor") || "0");
  const shipping = parseFloat(params.get("shipping") || "0");
  const discount = parseFloat(params.get("discount") || "0");
  const productSubtotal = total - floor - shipping + discount;

  const [depositPct, setDepositPct] = useState(10);
  const [term, setTerm] = useState(6);

  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [savedDeposit, setSavedDeposit] = useState(0);

  useEffect(() => {
    const url = localStorage.getItem("installment_payment_url");
    const deposit = localStorage.getItem("installment_deposit");
    if (url) setPaymentUrl(url);
    if (deposit) setSavedDeposit(parseFloat(deposit));
  }, []);

  const depositAmount = useMemo(() => (total * depositPct) / 100, [total, depositPct]);
  const creditAmount = useMemo(() => total - depositAmount, [total, depositAmount]);
  const monthlyPayment = useMemo(() => (term > 0 ? creditAmount / term : 0), [creditAmount, term]);

  const handleProceed = async () => {
    localStorage.setItem("installment_deposit_pct", depositPct.toString());
    localStorage.setItem("installment_deposit", depositAmount.toFixed(2));

    const orderId = localStorage.getItem("installment_order_id");
    if (orderId) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/deposit-info`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deposit_amount: depositAmount,
            deposit_percentage: depositPct,
            installment_term: term,
          }),
        });
      } catch (err) {
        console.error("Failed to save deposit info to DB:", err);
      }
    }

    window.location.href = "https://ideal4finance.com/loan-apply/aleena?r=ob";
  };

  const handlePayDeposit = () => {
    if (!paymentUrl) return;
    localStorage.removeItem("installment_payment_url");
    localStorage.removeItem("installment_deposit");
    window.location.href = paymentUrl;
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── Top bar ── */}
      <div className="px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <button
            onClick={() => router.push("/cart?step=3")}
            className="flex items-center gap-1 cursor-pointer text-sm text-gray-500 hover:text-gray-800"
          >
            <ChevronLeft size={16} />
            Back
          </button>
          <span className="text-sm text-gray-400">|</span>
          <span className="text-sm font-semibold text-gray-700">
            Apply for interest free credit
          </span>
          <span className="ml-auto text-sm text-gray-400">Step 1 of 6</span>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 lg:grid-cols-3">

        {/* ── Left: Main Form ─────────────────────────────────────────────── */}
        <div className="lg:col-span-2">

          {/* Intro */}
          <div className="rounded-xl px-6">
            <h2 className="mb-3 text-2xl font-bold text-gray-900">
              Apply for interest free credit (ARP 0%)
            </h2>
            <p className="text-sm leading-relaxed text-gray-600">
              Spread the cost with up to 48 months interest free with no deposit and choose
              to start paying for your furniture 30 days after delivery or pay nothing for
              the first year. 0% APR REPRESENTATIVE.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              Please note if you would like to defer your first payment then call us on{" "}
              <span className="font-medium text-gray-700">0800 110 5777</span> to complete
              your order. You may wish to reduce your monthly payments by paying a larger deposit.
            </p>
          </div>

          {/* ── Deposit Selector ── */}
          <div className="mt-9 rounded-xl px-6">
            <h2 className="mb-1 text-lg font-bold text-gray-900">
              Would you like to pay a deposit?
            </h2>
            <p className="mb-5 text-sm text-gray-500">
              Paying a deposit can help reduce your monthly payments.
            </p>
            <h2 className="mb-3 text-base font-semibold text-gray-800">
              How much would you like to pay?
            </h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 md:grid-cols-6">
              {DEPOSIT_OPTIONS.map((pct) => {
                const amt = (total * pct) / 100;
                const active = depositPct === pct;
                return (
                  <button
                    key={pct}
                    onClick={() => setDepositPct(pct)}
                    className={`flex flex-col items-center justify-center border-2 px-2 py-3 text-center transition-all ${
                      active
                        ? "border-[#3d1a6e] bg-[#3d1a6e] text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:border-[#3d1a6e] hover:bg-purple-50"
                    }`}
                  >
                    <span className="text-sm font-bold">£{fmt(amt)}</span>
                    <span className={`text-xs ${active ? "text-purple-200" : "text-gray-400"}`}>
                      {pct}% Deposit
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Term Selector ── */}
          <div className="mt-8 rounded-xl p-6">
            <h2 className="mb-1 text-lg font-bold text-gray-900">
              Over how long would you like to spread the cost?
            </h2>
            <p className="mb-5 text-sm text-gray-500">Choose your preferred re-payment term</p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-4">
              {TERM_OPTIONS.map((t) => {
                const monthly = creditAmount / t;
                const active = term === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTerm(t)}
                    className={`flex flex-col items-center justify-center border-2 px-2 py-3 text-center transition-all ${
                      active
                        ? "border-[#3d1a6e] bg-[#3d1a6e] text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:border-[#3d1a6e] hover:bg-purple-50"
                    }`}
                  >
                    <span className="text-sm font-bold">{t} months</span>
                    <span className={`text-xs ${active ? "text-purple-200" : "text-gray-400"}`}>
                      £{fmt(monthly)} p/m
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={handleProceed}
              className="mt-6 w-full cursor-pointer rounded-full bg-[#3d1a6e] px-8 py-4 font-semibold text-white shadow-md transition-all hover:bg-[#2e1356] active:scale-[0.98]"
            >
              Continue with Installments →
            </button>
          </div>

        </div>

        {/* ── Right: Order Summary ─────────────────────────────────────────── */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="border border-gray-200 border-r-0 bg-white p-6">
            <h2 className="mb-5 text-lg font-bold text-gray-900">Order summary</h2>

            <div className="space-y-3 text-sm">
              <SummaryRow label="Product subtotal" value={`£${fmt(productSubtotal)}`} />
              {floor > 0 && <SummaryRow label="Floor delivery" value={`£${fmt(floor)}`} />}
              {shipping > 0 && <SummaryRow label="Shipping" value={`£${fmt(shipping)}`} />}
              {discount > 0 && (
                <SummaryRow label="Discount" value={`-£${fmt(discount)}`} className="text-green-600" />
              )}
              <div className="border-t border-gray-200 pt-3">
                <SummaryRow label="Order total" value={`£${fmt(total)}`} bold />
              </div>
            </div>

            <hr className="my-4 border-gray-100" />

            <div className="space-y-3 text-sm">
              <SummaryRow label="Deposit" value={`£${fmt(depositAmount)}`} />
              <SummaryRow label="Credit Amount" value={`£${fmt(creditAmount)}`} />
              <SummaryRow label="Representative APR" value="0%" />
              <SummaryRow label="Interest" value="£0.00" />
              <SummaryRow label="Monthly Payments" value={`£${fmt(monthlyPayment)}`} />
              <SummaryRow label="Loan Term" value={`${term} Months`} />
              <div className="border-t border-gray-200 pt-3">
                <SummaryRow label="Total Amount Payable" value={`£${fmt(total)}`} bold />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page Export ─────────────────────────────────────────────────────────────
export default function InstallmentsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <InstallmentsContent />
    </Suspense>
  );
}

// ─── Small helper ─────────────────────────────────────────────────────────────
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
    <div className={`flex items-center justify-between ${bold ? "font-bold text-gray-900" : "text-gray-600"} ${className}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}