"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ApiService } from "@/lib/api-service";

const fmt = (n: number) =>
  n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function LoanApprovedPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [paymentFields, setPaymentFields] = useState<Record<string, string> | null>(null);
  const [depositAmount, setDepositAmount] = useState(0);
  const [depositPct, setDepositPct] = useState(10);
  const [installmentTerm, setInstallmentTerm] = useState(6);


useEffect(() => {
  const savedUrl = localStorage.getItem("installment_payment_url");
  if (savedUrl) setPaymentUrl(savedUrl);

  const fetchOrder = async () => {
  try {
    const res = await ApiService.fetchWithAuth(`/orders/${orderId}`);
    if (res.ok) {
      const data = await res.json();

      if (data.status !== 'loan_approved') {
        setOrder(null);
        setLoading(false);
        return;
      }

      setOrder(data);

        // Calculate total first
        const calculatedTotal = data.total_amount +
          (data.floor?.charges || 0) +
          (data.zone?.delivery_charges || 0) -
          (data.discount_amount || 0);

        // Priority: DB values → localStorage → Calculate from percentage
        if (data.deposit_amount && data.deposit_amount > 0) {
          setDepositAmount(data.deposit_amount);
        } else {
          const savedDeposit = localStorage.getItem("installment_deposit");
          if (savedDeposit) {
            setDepositAmount(parseFloat(savedDeposit));
          } else {
            // Calculate deposit from percentage (default to 10%)
            const pctToUse = data.deposit_percentage || 10;
            const calculatedDeposit = (calculatedTotal * pctToUse) / 100;
            setDepositAmount(calculatedDeposit);
          }
        }

        // Set deposit percentage
        if (data.deposit_percentage) {
          setDepositPct(data.deposit_percentage);
        } else {
          const savedDepositPct = localStorage.getItem("installment_deposit_pct");
          if (savedDepositPct) {
            setDepositPct(parseInt(savedDepositPct));
          } else {
            setDepositPct(10); // Default to 10%
          }
        }

        // Set installment term
        if (data.installment_term) {
          setInstallmentTerm(data.installment_term);
        } else {
          setInstallmentTerm(6); // Default to 6 months
        }
      }
    } catch (err) {
      console.error("Failed to fetch order:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchOrder();
}, [orderId]);

    const handlePayDeposit = () => {
        if (!paymentUrl) {
            // No payment URL — send back to cart to regenerate
            window.location.href = "https://ideal4finance.com/loan-apply/aleena?r=ob";
            return;
        }
        localStorage.removeItem("installment_payment_url");
        localStorage.removeItem("installment_deposit");
        localStorage.removeItem("installment_deposit_pct");
        window.location.href = paymentUrl;
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
                <p className="text-yellow-700 text-sm">Your loan application is still being reviewed. You will receive an email once it is approved.</p>
                <a href="/" className="mt-6 inline-block text-blue-600 underline text-sm">Return to Home</a>
            </div>
        </div>
    );
  }

  const total = order
    ? order.total_amount +
      (order.floor?.charges || 0) +
      (order.zone?.delivery_charges || 0) -
      (order.discount_amount || 0)
    : 0;

  const creditAmount = total - depositAmount;
  const term = 12; // default term
  const monthlyPayment = creditAmount / installmentTerm;

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Success Banner */}
        <div className="mb-8 rounded-xl bg-green-50 border border-green-200 p-6 text-center">
          <h1 className="text-2xl font-bold text-green-800 mb-2">
            🎉 Your Loan Has Been Approved!
          </h1>
          <p className="text-green-600 text-sm">
            Order #{orderId.slice(0, 8).toUpperCase()} — Pay your deposit to confirm your order.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left: Order Details */}
          {order && (
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
                  <SummaryRow label="Discount" value={`-£${fmt(order.discount_amount)}`} className="text-green-600" />
                )}
                <div className="border-t pt-3">
                  <SummaryRow label="Order Total" value={`£${fmt(total)}`} bold />
                </div>
              </div>
            </div>
          )}

          {/* Right: Installment Summary + Pay Deposit */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Installment Summary</h2>
            <div className="border border-gray-200 rounded-xl p-5 space-y-3 text-sm">
              <SummaryRow label={`Deposit (${depositPct}%)`} value={`£${fmt(depositAmount)}`} />
              <SummaryRow label="Credit Amount" value={`£${fmt(creditAmount)}`} />
              {/* <SummaryRow label="Representative APR" value="0%" /> */}
              {/* <SummaryRow label="Interest" value="£0.00" /> */}
              <SummaryRow label="Monthly Payments" value={`£${fmt(monthlyPayment)}`} />
              <SummaryRow label="Installment Term" value={`${installmentTerm} Months`} />
              <div className="border-t pt-3">
                <SummaryRow label="Total Amount Payable" value={`£${fmt(total)}`} bold />
              </div>

              <div className="pt-2">
                <button
                    onClick={handlePayDeposit}
                    className="w-full cursor-pointer rounded-full bg-green-600 px-8 py-4 font-semibold text-white shadow-md hover:bg-green-700 active:scale-[0.98] transition-all"
                >
                    Pay Deposit — £{fmt(depositAmount)}
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
    <div className={`flex items-center justify-between ${bold ? "font-bold text-gray-900" : "text-gray-600"} ${className}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}