"use client";

import React, { useMemo, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

const DEPOSIT_OPTIONS = [10, 20, 30, 40, 50];
const TERM_OPTIONS = [6, 12, 24, 36];

const fmt = (n: number) =>
  n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function FinanceCalculatorContent() {
  const params = useSearchParams();
  const router = useRouter();

  const total = parseFloat(params.get("total") || "0");
  const showInstallments = params.get("show_installments") !== "false";

  const [depositPct, setDepositPct] = useState(10);
  const [term, setTerm] = useState(6);

  const depositAmount = useMemo(() => (total * depositPct) / 100, [total, depositPct]);
  const creditAmount = useMemo(() => total - depositAmount, [total, depositAmount]);
  const monthlyPayment = useMemo(() => (term > 0 ? creditAmount / term : 0), [creditAmount, term]);

  if (!showInstallments) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Finance calculator is not available for this product.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex cursor-pointer items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
          >
            <ChevronLeft size={16} />
            Back
          </button>
          <span className="text-sm text-gray-400">|</span>
          <span className="text-sm font-semibold text-gray-700">
            Finance Calculator
          </span>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 lg:grid-cols-3">

        {/* Left: Calculator */}
        <div className="lg:col-span-2">
          <div className="rounded-xl px-6">
            <h2 className="mb-3 text-2xl font-bold text-gray-900">
              Finance Calculator (0% APR)
            </h2>
            <p className="text-sm leading-relaxed text-gray-600">
              Spread the cost with up to 48 months interest free. Choose your deposit
              and repayment term to see your estimated monthly payments.
            </p>
          </div>

          {/* Deposit Selector */}
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
                    className={`flex flex-col items-center justify-center cursor-pointer border-2 px-2 py-3 text-center transition-all ${
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

          {/* Term Selector */}
          <div className="mt-8 rounded-xl p-6">
            <h2 className="mb-1 text-lg font-bold text-gray-900">
              Over how long would you like to spread the cost?
            </h2>
            <p className="mb-5 text-sm text-gray-500">Choose your preferred repayment term</p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-4">
              {TERM_OPTIONS.map((t) => {
                const monthly = creditAmount / t;
                const active = term === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTerm(t)}
                    className={`flex flex-col items-center justify-center cursor-pointer border-2 px-2 py-3 text-center transition-all ${
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
          </div>
        </div>

        {/* Right: Summary */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="border border-gray-200 bg-white p-6">
            <h2 className="mb-5 text-lg font-bold text-gray-900">Order summary</h2>
            <div className="space-y-3 text-sm">
              <SummaryRow label="Product Total" value={`£${fmt(total)}`} />
              <div className="border-t border-gray-200 pt-3">
                <SummaryRow label="Order total" value={`£${fmt(total)}`} bold />
              </div>
            </div>
            <hr className="my-4 border-gray-100" />
            <div className="space-y-3 text-sm">
              <SummaryRow label="Deposit" value={`£${fmt(depositAmount)}`} />
              <SummaryRow label="Credit Amount" value={`£${fmt(creditAmount)}`} />
              <SummaryRow label="Representative APR" value="0%" />
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

export default function FinanceCalculatorPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <FinanceCalculatorContent />
    </Suspense>
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