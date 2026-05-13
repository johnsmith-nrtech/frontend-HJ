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
          {/* <div className="relative z-10 mt-12 flex h-full items-center justify-center md:mt-0">
            <div className="px-6 text-center md:px-12">
              <h1 className="text-3xl lg:text-[85px]">PAY IN SLICES</h1>
              <p className="-mt-4 text-xl border-blue-500 font-semibold text-blue-600">0% APR FINANCE AVAILABLE</p>
              <div className="bg-blue-500 h-1 w-12 rounded-full mt-4"></div>
              <div className="text-center px-14">
                <p>Spread the cost over up to 36 months with flexible monthly payments.</p>
              </div>

              <div className="flex w-full mt-6 justify-center px-4 sm:px-0">
                <Button
                  onClick={navigateToProductsPage}
                  variant="main"
                  size="xl"
                  rounded="full"
                  className="bg-blue relative h-[30px] items-center justify-start sm:h-[57px] sm:w-[174px]"
                  icon={
                    <Image
                      src="/arrow-right.png"
                      alt="arrow-right"
                      width={20}
                      height={20}
                      className="text-blue absolute top-1/2 right-2 h-[30px] w-[30px] -translate-y-1/2 rounded-full bg-[#fff] object-contain p-2 sm:h-[40px] sm:w-[40px]"
                    />
                  }
                >
                  Apply Now
                </Button>
              </div>
            </div>
          </div> */}
          <div className="relative z-10 flex h-full items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="text-left">
                <h1 className="text-3xl lg:text-[85px]">PAY IN SLICES</h1>
                <p className="text-xl font-semibold text-blue-600">0% APR FINANCE AVAILABLE</p>
                <div className="bg-blue-500 h-1 w-12 rounded-full mt-1 mb-4"></div>
                <p className="text-base text-gray-600 whitespace-nowrap">
                  Spread the cost over up to 36 months<br />with flexible monthly payments.
                </p>
                <div className="mt-6 flex items-center justify-between bg-blue rounded-full h-[50px] w-[200px] px-4 cursor-pointer" onClick={navigateToProductsPage}>
                  <span className="text-white font-semibold whitespace-nowrap pl-2">Check Eligibility</span>
                  <div className="flex items-center justify-center h-[40px] w-[40px] rounded-full bg-white shrink-0 ml-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="38" height="22" viewBox="0 0 24 24" fill="none" stroke="#1b6db4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"/>
                      <path d="m12 5 7 7-7 7"/>
                    </svg>
                  </div>
                </div>
                <div className="mt-6 flex items-start justify-evenly gap-6 w-[380px]">
                  {financePerks.map((perk, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`p-2 rounded-full ${perk.bg}`}>
                        {perk.icon}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800">{perk.line1}</span>
                        <span className="text-xs font-bold text-gray-800">{perk.line2}</span>
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