"use client";

import React from "react";
import Image from "next/image";
import { MarqueeStrip } from "../marquee-strip";
import { Button } from "../button-custom";

const HeroSection = () => {
  // Marquee items data
  const marqueeItems = [
    { text: "10-Years Guarantee", icon: "/sofa-icon.png" },
    { text: "100-Night Trial", icon: "/sofa-icon.png" },
    { text: "Easy Return", icon: "/sofa-icon.png" },
    { text: "Free Delivery", icon: "/sofa-icon.png" },
    { text: "10-Years Guarantee", icon: "/sofa-icon.png" },
  ];

  // Handle custom order button click
  const handleCustomOrderClick = () => {
    // TODO: Replace with actual custom order functionality
    // Options:
    // 1. Navigate to custom order page: router.push('/custom-order')
    // 2. Open a modal/dialog
    // 3. Scroll to contact section
    // For now, we'll show an alert as placeholder
    alert(
      "Custom Order feature coming soon! Please contact us for custom orders."
    );
  };

  return (
    <div className="w-full">
      {/* Main Hero Section */}
      <div className="relative">
        {/* Light blue background for right side extending from navbar */}
        <div className="absolute inset-0 hidden w-full overflow-hidden lg:block">
          <div className="relative mx-auto h-full px-4">
            <div className="bg-light-blue absolute right-0 mt-[-70px] h-full w-[50%]"></div>
          </div>
        </div>

        <div className="relative min-h-[400px] overflow-hidden sm:min-h-[500px] md:min-h-[650px] lg:mb-[-4rem] 2xl:min-h-[1000px]">
          {/* Hero Image - Background for entire section */}
          <div className="absolute inset-0 ml-0 h-full max-h-[90vh] w-full sm:ml-[15px] xl:ml-[18px] 2xl:ml-[21px]">
            <Image
              src="/hero-img1.png"
              alt="Sofa Deals Hero"
              fill
              className="h-[90vh] object-contain object-center"
              priority
            />
          </div>

          {/* Content Overlay with responsive padding */}
          <div className="relative z-10 h-full px-4 sm:px-6 lg:px-9">
            <div className="grid h-full grid-cols-1 lg:grid-cols-2">
              {/* Left Side - Content */}
              <div className="flex flex-col justify-between py-4 sm:py-6 md:py-8 lg:py-2">
                {/* Top Left Text */}
                <div className="max-w-full p-4 sm:max-w-sm lg:max-w-[430px]">
                  <p className="font-open-sans text-gray mt-10 text-sm leading-[26px] md:text-base lg:mt-0 lg:text-base">
                    Do you need a perfect sofa set? Do you want a cosy sofa that
                    feels like it was made just for you? That’s exactly the vibe
                    Sofa Deal brings, offering sofa deals you can’t resist.
                  </p>
                </div>

                {/* Empty space for visual balance on desktop */}
                <div className="hidden lg:block"></div>
              </div>

              {/* Right Side - Desktop Button area */}
              <div className="relative hidden justify-end lg:flex">
                {/* Top Right Button - Desktop only */}
                <div className="absolute top-6 right-0 md:top-8 lg:top-12">
                  <Button
                    onClick={handleCustomOrderClick}
                    variant="main"
                    size="xl"
                    rounded="full"
                    className="bg-blue relative !w-[244px] items-center justify-start"
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
                    Make Custom Order
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Mobile Button - Show only on small screens */}
        <div className="mt-[-3rem] block py-4 sm:mt-[-3rem] sm:py-4 md:mt-[-3rem] lg:hidden">
          <Button
            onClick={handleCustomOrderClick}
            variant="main"
            size="xl"
            rounded="full"
            className="bg-blue relative !w-[220px] items-center justify-start"
            icon={
              <Image
                src="/arrow-right.png"
                alt="arrow-right"
                width={20}
                height={20}
                className="text-blue absolute top-1/2 right-2 h-[30px] w-[30px] -translate-y-1/2 rounded-full bg-[#fff] object-contain p-2 md:h-[40px] md:w-[40px]"
              />
            }
          >
            Make Custom Order
          </Button>
        </div>
      </div>

      {/* Marquee Strip */}
      <MarqueeStrip
        items={marqueeItems}
        backgroundColor="bg-blue"
        textColor="text-white"
        className="py-3 sm:py-4"
      />
    </div>
  );
};

export default HeroSection;
