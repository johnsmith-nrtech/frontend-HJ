"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/button-custom";
import { Calendar, Zap, BookMarked } from "lucide-react";
import { useRouter } from "next/navigation";

const PayInSlicesSection = () => {
  const router = useRouter();

  const financePerks = [
    { icon: <BookMarked className="w-5 h-5 text-blue-600" />, line1: "10%", line2: "Deposit", bg: "bg-blue-50" },
    { icon: <Calendar className="w-5 h-5 text-blue-600" />, line1: "Up to", line2: "36 Months", bg: "bg-blue-50" },
    { icon: <Zap className="w-5 h-5 text-blue-600" />, line1: "Instant", line2: "Decision", bg: "bg-white" },
  ];

  const navigateToProductsPage = () => {
    router.push("/eligibility-criteria");
  };
  return (
    <section className="w-full py-4 md:py-8">
      <div className="">
        <div className="bg-light-blue relative min-h-[260px] overflow-hidden md:h-[400px] lg:h-[450px]">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="/footer-img.png"
              alt="Pay in Slices Background"
              fill
              className="object-cover 2xl:object-contain"
              priority
            />
          </div>

          {/* Content Overlay - Centered */}
          <div className="relative z-10 flex h-full items-center justify-center px-4 py-8 md:py-0">
            <div className="flex w-full max-w-[380px] flex-col items-center md:max-w-none">
              <div className="text-center md:text-left">
                <h1 className="text-2xl sm:text-3xl lg:text-[85px]">PAY IN SLICES</h1>
                <p className="text-base sm:text-xl font-semibold text-blue-600">0% APR FINANCE AVAILABLE</p>
                <div className="bg-blue-500 h-1 w-12 rounded-full mt-1 mb-4 mx-auto md:mx-0"></div>
                <p className="text-sm sm:text-base text-gray-600">
                  Spread the cost over up to 36 months<br className="hidden sm:block" /> with flexible monthly payments.
                </p>
                <div className="mt-6 flex items-center justify-between bg-blue rounded-full h-[46px] sm:h-[50px] w-full max-w-[200px] px-4 cursor-pointer mx-auto md:mx-0" onClick={navigateToProductsPage}>
                  <span className="text-white font-semibold whitespace-nowrap pl-2 text-sm sm:text-base">Check Eligibility</span>
                  <div className="flex items-center justify-center h-[36px] w-[36px] sm:h-[40px] sm:w-[40px] rounded-full bg-white shrink-0 ml-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="18" viewBox="0 0 24 24" fill="none" stroke="#1b6db4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"/>
                      <path d="m12 5 7 7-7 7"/>
                    </svg>
                  </div>
                </div>
                <div className="mt-6 flex items-start justify-center gap-4 sm:justify-evenly sm:gap-6 w-full flex-wrap md:justify-evenly">
                  {financePerks.map((perk, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`p-2 rounded-full ${perk.bg}`}>
                        {perk.icon}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs sm:text-sm font-bold text-gray-800">{perk.line1}</span>
                        <span className="text-[10px] sm:text-xs font-bold text-gray-800">{perk.line2}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PayInSlicesSection;