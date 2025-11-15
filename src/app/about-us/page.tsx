"use client";

import { MarqueeStrip } from "@/components/marquee-strip";
import { Button } from "@/components/button-custom";
import { Testimonials } from "@/components/landing-page/testimonials";
import Image from "next/image";

export default function AboutUsPage() {
  // Marquee items data
  const marqueeItems = [
    { text: "10-YEARS GUARANTEE", icon: "/sofa-icon.png" },
    { text: "100-NIGHT TRIAL", icon: "/sofa-icon.png" },
    { text: "EASY RETURN", icon: "/sofa-icon.png" },
    { text: "FREE DELIVERY", icon: "/sofa-icon.png" },
    { text: "10-YEARS GUARANTEE", icon: "/sofa-icon.png" },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="relative">
        {/* Light blue background for right side extending from navbar */}
        <div className="absolute inset-0 hidden w-full overflow-hidden lg:block">
          <div className="relative mx-auto h-full px-4">
            <div className="bg-light-blue absolute right-0 mt-[-70px] h-full md:w-[50%] 2xl:w-[50%]"></div>
          </div>
        </div>

        <div className="relative min-h-[400px] overflow-hidden sm:min-h-[500px] md:min-h-[640px] 2xl:min-h-[820px]">
          {/* Hero Image - Background for entire section */}
          <div className="absolute inset-0 h-full w-full md:mt-[-80px] md:ml-[46px] 2xl:mt-[0px] 2xl:ml-[68px]">
            <Image
              src="/product-img1.png"
              alt="Sofa Deals About Us"
              fill
              className="object-cover object-center"
              priority
            />
          </div>

          <div className="absolute left-4 mt-10 flex-col justify-center px-2 py-8 sm:px-[32px] sm:py-12 md:bottom-[10px] md:mt-[-60px] md:py-16 lg:py-26 2xl:bottom-[-50px] 2xl:mt-[0px]">
            <div className="max-w-full sm:max-w-md lg:max-w-xl 2xl:max-w-2xl">
              <h1 className="sm:text-[85px]">ABOUT US</h1>
              <p className="font-open-sans text-dark-gray/90 mb-8 text-sm leading-relaxed sm:text-base md:text-[#999]">
                Sofa Deal UK offers stylish, high-quality sofas at unbeatable
                prices. We deliver nationwide with comfort, style, and value
                straight to your door.
              </p>
              <Button
                variant="main"
                size="xl"
                rounded="full"
                className="bg-blue relative w-[170px] items-center justify-start sm:!w-[200px]"
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
                Custom Order
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee Strip */}
      <MarqueeStrip
        items={marqueeItems}
        backgroundColor="bg-blue"
        textColor="text-white"
        className="py-3 sm:py-4 md:mt-[-70px] 2xl:mt-[0px]"
      />

      {/* First Content Section - Clean Lines */}
      <div className="py-8 md:py-16 lg:py-20">
        <div className="h-[550px] px-4 sm:px-[32px] md:h-auto">
          {/* Header with title and description */}
          <div className="mb-2 flex flex-col lg:mb-12 lg:flex-row lg:items-start lg:justify-between">
            <div className="mb-6 lg:mb-0 lg:w-[54%] 2xl:w-[40%]">
              <h2 className="font-bebas text-dark-gray text-3xl tracking-wide uppercase md:text-5xl lg:text-[72px]">
                CLEAN LINES, LOW PROFILE, AND MODULAR DESIGN
              </h2>
            </div>
            <div className="lg:w-[38%]">
              <p className="font-open-sans text-right text-sm leading-relaxed text-[#999] sm:text-base">
                Crafted With Precision And Upholstered In Premium Fabrics, This
                Sofa Combines Timeless Elegance With Everyday Comfort. Its Deep
                Cushions, Solid Wood Frame, And Sleek Profile Make It The
                Perfect Centerpiece For Modern Living Spaces.
              </p>
            </div>
          </div>

          {/* Image with overlay text */}
          <div className="relative h-[220px] sm:h-[300px] md:h-[500px] lg:h-[800px] 2xl:h-[1080px]">
            <Image
              src="/abt-1.png"
              alt="Clean Lines Sofa Design"
              fill
              className="rounded-lg object-contain object-center"
            />
            {/* Overlay text at bottom left */}
            <div className="absolute bottom-[-90px] left-2 max-w-xs sm:bottom-[-60px] sm:left-6 md:bottom-0 lg:bottom-6 lg:max-w-lg">
              <p className="font-open-sans text-sm leading-relaxed text-[#999] sm:text-base">
                This Sofa Blends Effortlessly Into Contemporary Interiors.
                Designed For Simplicity And Comfort, It&apos;s Ideal For Those
                Who Value Form As Much As Function.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Second Content Section - Responsibly Sourced Materials */}
      <div className="bg-light-blue py-12 md:py-16 lg:py-20">
        <div className="px-4 sm:px-[32px]">
          {/* Header with title and description */}
          <div className="mb-8 flex flex-col lg:mb-12 lg:flex-row lg:items-start lg:justify-between">
            <div className="mb-6 lg:mb-0 lg:w-[54%] 2xl:w-[40%]">
              <h2 className="font-bebas text-dark-gray text-3xl tracking-wide uppercase md:text-5xl lg:text-[72px]">
                MADE WITH RESPONSIBLY SOURCED MATERIALS
              </h2>
            </div>
            <div className="lg:w-[38%]">
              <p className="font-open-sans text-gray text-right text-sm leading-relaxed sm:text-base">
                Crafted With Precision And Upholstered In Premium Fabrics, This
                Sofa Combines Timeless Elegance With Everyday Comfort. Its Deep
                Cushions, Solid Wood Frame, And Sleek Profile Make It The
                Perfect Centerpiece For Modern Living Spaces.
              </p>
            </div>
          </div>

          {/* Image */}
          <div className="relative h-[220px] sm:h-[300px] md:h-[500px] lg:h-[800px] 2xl:h-[1080px]">
            <Image
              src="/abt-2.png"
              alt="Responsibly Sourced Materials"
              fill
              className="rounded-lg object-contain object-center"
            />
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <Testimonials showBackground={false} />
    </div>
  );
}
