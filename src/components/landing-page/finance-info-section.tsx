"use client";

import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

const paymentMethods = [
  { name: "Visa", icon: "/visa-card.png" },
  { name: "Mastercard", icon: "/mastercard.png" },
  { name: "Ideal for finance", icon: "/ideal.jpg" },
  { name: "American Express", icon: "/amex_card.png" },
  { name: "Union Pay", icon: "/unionpay.png" },
  // { name: "Barclays", icon: "/barclays.png" },
  // { name: "Klarna", icon: "/klarna.png" },
    // { name: "PayPal", icon: "/paypal.png" },
];

const financeExamples = [
  { total: 999, deposit: 99.9, months: 36, monthly: 25.03 },
  { total: 1499, deposit: 149.9, months: 36, monthly: 37.53 },
  { total: 2499, deposit: 249.9, months: 36, monthly: 62.53 },
];

const financePerks = [
  "0% APR — no hidden interest, ever",
  "No credit impact to check your eligibility",
  "Instant online decision in minutes",
  "Spread the cost over up to 36 months",
];

const FinanceInfoSection = () => {
  return (
    <section className="py-10 md:py-6">
      <div className="px-4 sm:px-[32px]">
        {/* Payment Methods */}
        <div className="mb-12 text-center">
          <p className="mb-6 text-sm text-black tracking-wide uppercase">
            We Accept
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {paymentMethods.map((method) => (
              <div
                key={method.name}
                className="flex h-16 w-24 items-center justify-center rounded-lg px-3 sm:h-14 sm:w-24"
              >
                <Image
                  src={method.icon}
                  alt={method.name}
                  width={60}
                  height={30}
                  className="h-auto max-h-8 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Interest Free Credit Presentation */}
        <div className="bg-light-blue rounded-3xl p-6 sm:p-10 lg:p-14">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Left: Messaging */}
            <div>
              <h2 className="text-3xl uppercase sm:text-4xl lg:text-[56px]">
                3 Years Interest Free Credit
              </h2>
              <p className="font-open-sans mt-3 text-sm text-gray-600 sm:text-base">
                Spread the cost of your new furniture with genuine 0% APR
                finance — no interest, no catches, and no impact on your
                credit score to check if you&apos;re eligible.
              </p>

              <ul className="mt-6 space-y-3">
                {financePerks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                    <span className="font-open-sans text-sm text-gray-700 sm:text-base">
                      {perk}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Example Breakdowns */}
            <div>
              <p className="font-open-sans mb-4 text-sm font-semibold text-gray-500 uppercase">
                Example Monthly Payments
              </p>
              <div className="space-y-3">
                {financeExamples.map((ex) => (
                  <div
                    key={ex.total}
                    className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm sm:p-5"
                  >
                    <div>
                      <p className="font-bebas text-xl text-dark-gray sm:text-2xl">
                        £{ex.total.toFixed(2)}
                      </p>
                      <p className="font-open-sans text-xs text-gray-400 sm:text-sm">
                        £{ex.deposit.toFixed(2)} deposit · {ex.months} months
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bebas text-xl text-blue-600 sm:text-2xl">
                        £{ex.monthly.toFixed(2)}
                      </p>
                      <p className="font-open-sans text-xs text-gray-400 sm:text-sm">
                        per month
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="font-open-sans mt-4 text-xs text-gray-400">
                Representative examples based on 10% deposit over 36 months at
                0% APR. Final terms confirmed during application.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinanceInfoSection;