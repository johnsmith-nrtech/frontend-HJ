"use client";
import React, { useState, useRef, useEffect } from "react";
import { WhyChooseUsApi, WhyChooseUsItem } from "@/lib/api/content";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WhyChooseUs = () => {
  const [features, setFeatures] = useState<WhyChooseUsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const desktopScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    WhyChooseUsApi.getAll()
      .then(setFeatures)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Mobile scroll
  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const cardWidth = 260 + 16;
      scrollContainerRef.current.scrollTo({ left: index * cardWidth, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const cardWidth = 260 + 16;
        const newIndex = Math.round(scrollContainerRef.current.scrollLeft / cardWidth);
        setCurrentIndex(Math.min(newIndex, features.length - 1));
      }
    };
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [features.length]);

  // Desktop scroll
  const [desktopIndex, setDesktopIndex] = useState(0);
  const CARDS_PER_VIEW = 3;

  const canGoPrev = desktopIndex > 0;
  const canGoNext = desktopIndex + CARDS_PER_VIEW < features.length;

  const scrollDesktopTo = (index: number) => {
    setDesktopIndex(index);
    if (desktopScrollRef.current) {
      // Each card: flex-1 within a fixed container, so we scroll by container width / 3 * index
      const containerWidth = desktopScrollRef.current.offsetWidth;
      const cardWidth = containerWidth / CARDS_PER_VIEW;
      desktopScrollRef.current.scrollTo({ left: index * cardWidth, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (canGoPrev) scrollDesktopTo(desktopIndex - 1);
  };

  const handleNext = () => {
    if (canGoNext) scrollDesktopTo(desktopIndex + 1);
  };

  if (isLoading) {
    return (
      <div className="py-6 md:py-6 lg:py-6">
        <div className="px-4 sm:px-[32px]">
          <div className="mb-8 text-center md:mb-10">
            <h1 className="text-3xl sm:text-5xl lg:text-[85px]">WHY SOFA DEAL</h1>
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 w-64 shrink-0 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (features.length === 0) return null;

  return (
    <div className="py-6 md:py-6 lg:py-6">
      <div className="px-4 sm:px-[32px]">
        <div className="mb-8 text-center md:mb-10">
          <h1 className="text-3xl sm:text-5xl lg:text-[85px]">WHY SOFA DEAL</h1>
        </div>

        {/* Desktop Layout */}
<div className="hidden lg:block">
  <div className="relative flex items-center">
    {/* Left Arrow */}
    <button
      onClick={handlePrev}
      disabled={!canGoPrev}
      // className={`absolute -left-4 z-10 flex-shrink-0 rounded-full p-2 transition-all duration-200 ${
      className={`absolute -left-4 z-10 top-1/2 -translate-y-1/2 flex-shrink-0 rounded-full p-2 transition-all duration-200 ${
        canGoPrev
          ? "bg-white shadow-md hover:shadow-lg cursor-pointer text-gray-700"
          : "bg-gray-100 text-gray-300 cursor-not-allowed"
      }`}
      aria-label="Previous"
    >
      <ChevronLeft className="h-6 w-6" />
    </button>

    {/* Cards Container */}
    <div
      ref={desktopScrollRef}
      className="flex w-full overflow-hidden gap-6"
      style={{ scrollSnapType: "x mandatory" }}
    >
      {features.map((feature) => (
        <div
          key={feature.id}
          className="rounded-lg bg-white p-6 text-center md:p-4 flex-shrink-0"
          style={{ scrollSnapAlign: "start", width: "calc(100% / 3 - 16px)" }}
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

    {/* Right Arrow */}
    <button
      onClick={handleNext}
      disabled={!canGoNext}
      // className={`absolute -right-4 z-10 flex-shrink-0 rounded-full p-2 transition-all duration-200 ${
      className={`absolute -right-4 z-10 top-1/2 -translate-y-1/2 flex-shrink-0 rounded-full p-2 transition-all duration-200 ${
        canGoNext
          ? "bg-white shadow-md hover:shadow-lg cursor-pointer text-gray-700"
          : "bg-gray-100 text-gray-300 cursor-not-allowed"
      }`}
      aria-label="Next"
    >
      <ChevronRight className="h-6 w-6" />
    </button>
  </div>

  {/* Desktop Dots */}
  {features.length > CARDS_PER_VIEW && (
    <div className="mt-6 flex justify-center space-x-2">
      {features.map((_, index) => (
        <button
          key={index}
          onClick={() => scrollDesktopTo(index)}
          className={`h-2 rounded-full transition-all duration-300 ${
            index === desktopIndex ? "bg-blue w-6" : "bg-gray-300 hover:bg-gray-400 w-2"
          }`}
          aria-label={`Go to feature ${index + 1}`}
        />
      ))}
    </div>
  )}
</div>

        {/* Mobile & Tablet Layout */}
        <div className="lg:hidden">
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            style={{ scrollSnapType: "x mandatory" }}
          >
            <div className="flex gap-4 px-2 pb-4">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className="w-[260px] flex-shrink-0 rounded-lg bg-white p-4 text-center sm:w-[300px]"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <h3 className="font-bebas text-dark-gray mb-3 text-lg uppercase">{feature.title}</h3>
                  <p className="font-open-sans text-gray text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex justify-center space-x-2">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "bg-blue w-6" : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to feature ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyChooseUs;