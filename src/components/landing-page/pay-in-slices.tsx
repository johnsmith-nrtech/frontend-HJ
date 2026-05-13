"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/button-custom";
import { useRouter } from "next/navigation";

const PayInSlicesSection = () => {
  const router = useRouter();

  const navigateToProductsPage = () => {
    // Now navigates to Klarna Terms now
    router.push("/klarna-terms");
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
          <div className="relative z-10 mt-12 flex h-full items-center justify-center md:mt-0">
            <div className="px-6 text-center md:px-12">
              <h1 className="text-3xl lg:text-[85px]">PAY IN SLICES</h1>
              {/* <div className="text-bold">
                <p>0% APR</p>
                <p>Get 3 Years Free Credit</p>
                <p>10% Deposit Only. No Interest - At All 0% APR, After Approval</p>
              </div> */}
              <div className="mt-4 mb-6 space-y-1.5">
                <p className="font-open-sans text-sm md:text-base font-semibold text-gray-700 tracking-widest uppercase">
                  0% APR
                </p>
                <p className="font-open-sans text-base md:text-lg font-light text-gray-600">
                  Get 3 Years Free Credit
                </p>
                <p className="font-open-sans text-xs md:text-sm text-gray-500 leading-relaxed">
                  10% Deposit Only &nbsp;·&nbsp; No Interest &nbsp;·&nbsp; 0% APR, After Approval
                </p>
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default PayInSlicesSection;
