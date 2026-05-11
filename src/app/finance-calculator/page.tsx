"use client";

import React, { useMemo, useState } from "react";
import { X } from "lucide-react";

const DEPOSIT_OPTIONS = [10, 20, 30, 40, 50];
const TERM_OPTIONS = [6, 12, 24, 36];

const fmt = (n: number) =>
  n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface FinanceCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTotal: number;
  productName?: string;
  showInstallments?: boolean;
}

export default function FinanceCalculatorModal({
  isOpen,
  onClose,
  productTotal,
  productName,
  showInstallments = true,
}: FinanceCalculatorModalProps) {
  const [depositPct, setDepositPct] = useState(10);
  const [term, setTerm] = useState(6);

  const total = productTotal;

  const depositAmount = useMemo(() => (total * depositPct) / 100, [total, depositPct]);
  const creditAmount = useMemo(() => total - depositAmount, [total, depositAmount]);
  const monthlyPayment = useMemo(() => (term > 0 ? creditAmount / term : 0), [creditAmount, term]);

  if (!isOpen) return null;

  if (!showInstallments) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="relative mx-4 w-full max-w-md rounded-xl bg-white p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
          <p className="text-center text-gray-500">Finance calculator is not available for this product.</p>
          <button
            onClick={onClose}
            className="mt-4 w-full rounded-lg bg-[#3d1a6e] py-2 text-white hover:bg-[#2d1452]"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
 <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
  <div className="fixed inset-0 bg-black/50" onClick={onClose} />
  <div className="relative mx-auto max-h-[90vh] w-full max-w-4xl overflow-y-auto bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Finance Calculator (0% APR)</h2>
            {productName && (
              <p className="text-sm text-gray-500">{productName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full cursor-pointer p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-3">
          {/* Left: Calculator */}
          <div className="lg:col-span-2">
            <div className="rounded-xl">
              <p className="text-sm leading-relaxed text-gray-600">
                Spread the cost with up to 48 months interest free. Choose your deposit
                and repayment term to see your estimated monthly payments.
              </p>
            </div>

            {/* Deposit Selector */}
            <div className="mt-6 rounded-xl">
              <h2 className="mb-1 text-lg font-bold text-gray-900">
                Would you like to pay a deposit?
              </h2>
              <p className="mb-5 text-sm text-gray-500">
                Paying a deposit can help reduce your monthly payments.
              </p>
              <h2 className="mb-3 text-base font-semibold text-gray-800">
                How much would you like to pay?
              </h2>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {DEPOSIT_OPTIONS.map((pct) => {
                  const amt = (total * pct) / 100;
                  const active = depositPct === pct;
                  return (
                    <button
                      key={pct}
                      onClick={() => setDepositPct(pct)}
                      className={`flex cursor-pointer flex-col items-center justify-center border-2 px-2 py-3 text-center transition-all ${
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
            <div className="mt-6 rounded-xl">
              <h2 className="mb-1 text-lg font-bold text-gray-900">
                Over how long would you like to spread the cost?
              </h2>
              <p className="mb-5 text-sm text-gray-500">Choose your preferred repayment term</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {TERM_OPTIONS.map((t) => {
                  const monthly = creditAmount / t;
                  const active = term === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setTerm(t)}
                      className={`flex cursor-pointer flex-col items-center justify-center border-2 px-2 py-3 text-center transition-all ${
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
    </div>
  );
}

function SummaryRow({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between ${bold ? "font-bold text-gray-900" : "text-gray-600"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}