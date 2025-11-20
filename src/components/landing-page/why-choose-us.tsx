"use client";
import React, { useState, useRef, useEffect } from "react";

const WhyChooseUs = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      id: "f1",
      title: "Free Delivery & Free Assembly",
      description:
        "Enjoy Hassle-Free Shopping, Complimentary Delivery And Expert Assembly At Your Doorstep No Hidden Charges.",
    },
    {
      id: "f2",
      title: "In Stock 1 To 7 Days Delivery",
      description:
        "Quick Delivery On In Stock Items. Get Your Order Within A Week And Start Enjoying It Sooner.",
    },
    {
      id: "f3",
      title: "Pre Order 5 Weeks Delivery",
      description:
        "Pre-Order Now And Receive Your Custom Piece Within 5 Weeks — Made To Order, Just For You.",
    },
    {
      id: "f4",
      title: "Free Returns On Delivery",
      description:
        "Not Satisfied? Return The Product At The Time Of Delivery — Completely Free And Risk-Free.",
    },
    {
      id: "f5",
      title: "Full Refund Guaranteed",
      description:
        "Shop With Confidence. If You're Not Happy, We'll Give You A Full Refund — No Questions Asked.",
    },
  ];

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = 260 + 16; // card width + gap for mobile
      container.scrollTo({
        left: index * cardWidth,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;

    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const cardWidth = 260 + 16; // card width + gap for mobile
        const scrollLeft = container.scrollLeft;
        const newIndex = Math.round(scrollLeft / cardWidth);
        setCurrentIndex(Math.min(newIndex, features.length - 1));
      }
    };

    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [features.length]);

  return (
    <div className="py-6 md:py-6 lg:py-6">
      <div className="px-4 sm:px-[32px]">
        <div className="mb-8 text-center md:mb-10">
          <h1 className="text-3xl sm:text-5xl lg:text-[85px]">WHY SOFA DEAL</h1>
        </div>

        {/* Desktop Layout - Grid */}
        <div className="hidden lg:block">
          <div className="flex items-center justify-center">
            <div className="mb-8 grid grid-cols-1 gap-4 md:mb-10 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
              {features.slice(0, 3).map((feature) => (
                <div
                  key={feature.id}
                  className="rounded-lg bg-white p-6 text-center md:p-4"
                >
                  <h3 className="font-bebas text-dark-gray mb-3 text-lg uppercase md:mb-4 md:text-xl lg:text-[34px] lg:leading-[40px]">
                    {feature.title}
                  </h3>
                  <p className="font-open-sans text-gray text-sm leading-relaxed md:text-base">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
          {/* Second Row - 2 columns centered with white cards */}
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            {features.slice(3, 5).map((feature) => (
              <div
                key={feature.id}
                className="rounded-lg bg-white p-6 text-center md:p-4"
              >
                <h3 className="font-bebas text-dark-gray mb-3 text-lg uppercase md:mb-4 md:text-xl lg:text-[34px] lg:leading-[40px]">
                  {feature.title}
                </h3>
                <p className="font-open-sans text-gray text-sm leading-relaxed md:text-base">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile & Tablet Layout - Horizontal Scroll */}
        <div className="lg:hidden">
          <div
            ref={scrollContainerRef}
            className="scrollbar-hide overflow-x-auto overflow-y-hidden"
            style={{ scrollSnapType: "x mandatory" }}
          >
            <div className="flex gap-4 px-2 pb-4">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className="w-[260px] flex-shrink-0 rounded-lg bg-white p-4 text-center sm:w-[300px]"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <h3 className="font-bebas text-dark-gray mb-3 text-lg uppercase">
                    {feature.title}
                  </h3>
                  <p className="font-open-sans text-gray text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll Indicator Dots */}
          <div className="mt-4 flex justify-center space-x-2">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-blue w-6"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to feature ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none; /* Internet Explorer 10+ */
          scrollbar-width: none; /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none; /* Safari and Chrome */
        }
        .scrollbar-hide {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default WhyChooseUs;
