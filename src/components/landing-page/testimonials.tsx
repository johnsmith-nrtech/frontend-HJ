"use client";

import React, { useState, useRef, useEffect } from "react";
import { Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface Testimonial {
  id: number;
  timeAgo: string;
  rating: number;
  title: string;
  description: string;
  author: string;
  role: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    timeAgo: "4 days ago",
    rating: 5,
    title: "SOFA SHOPPING MADE SIMPLE",
    description:
      "I never thought buying a sofa online could be this easy. The Sofa Deal not only had amazing prices, but the quality blew me away. It feels like a luxury piece without the luxury price.",
    author: "Sarah M.",
    role: "INTERIOR DESIGNER",
  },
  {
    id: 2,
    timeAgo: "5 days ago",
    rating: 5,
    title: "PAYMENT FLEXIBILITY THAT WORKS",
    description:
      "The Pay in Slices option was a lifesaver. I got the sofa I wanted right away, and the payments were so manageable. Sofa Deal really understands what customers need.",
    author: "James R.",
    role: "FINANCIAL CONSULTANT",
  },
  {
    id: 3,
    timeAgo: "6 days ago",
    rating: 5,
    title: "SEAMLESS SHOPPING EXPERIENCE",
    description:
      "From browsing to delivery, the process was smooth and stress-free. The sofa arrived on time and looked exactly like the photos, maybe even better in person.",
    author: "Olivia K.",
    role: "LIFESTYLE BLOGGER",
  },
  {
    id: 4,
    timeAgo: "1 week ago",
    rating: 5,
    title: "DURABILITY YOU CAN TRUST",
    description:
      "I’ve had my sofa for three months now, and it’s holding up beautifully. Comfortable, stylish, and sturdy, Sofa Deal really delivered on quality.",
    author: "Daniel P.",
    role: "HOMEOWNER",
  },
  {
    id: 5,
    timeAgo: "2 weeks ago",
    rating: 5,
    title: "SERVICE ABOVE EXPECTATIONS",
    description:
      "Customer service was outstanding. They answered all my questions quickly and made sure my order went perfectly. I’ll definitely be shopping here again.",
    author: "Emma L.",
    role: "LOYAL CUSTOMER",
  },

  // {
  //   id: 6,
  //   timeAgo: "1 week ago",
  //   rating: 5,
  //   title: "EXCELLENT VALUE",
  //   description:
  //     "The sofa exceeded my expectations and the whole process was seamless.",
  //   author: "SARAH L.",
  //   role: "SATISFIED CUSTOMER",
  // },
];

// Desktop Testimonial Card
const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({
  testimonial,
}) => {
  return (
    <Card className="h-full rounded-lg border-0 bg-[#ffffff] shadow-lg md:w-[400px] 2xl:w-[500px]">
      <CardContent className="flex h-full flex-col p-6">
        {/* Header with stars and timestamp */}
        <div className="mb-4 flex items-start justify-between">
          {/* Star rating */}
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, index) =>
              index < testimonial.rating ? (
                <Image
                  key={index}
                  src="/star.png"
                  alt="Filled star"
                  width={16}
                  height={16}
                  className="h-4 w-4 object-contain"
                />
              ) : (
                <Star key={index} className="h-4 w-4 text-gray-300" />
              )
            )}
          </div>

          {/* Time stamp */}
          <div className="font-open-sans text-sm text-[#202020]">
            {testimonial.timeAgo}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bebas mb-4 text-[28px] text-black uppercase">
          {testimonial.title}
        </h3>

        {/* Description */}
        <p className="font-open-sans mb-6 flex-grow text-base leading-relaxed text-gray-500">
          {testimonial.description}
        </p>

        {/* Author */}
        <div className="mt-auto">
          <p className="font-bebas text-xl text-black uppercase">
            -{testimonial.author}, {testimonial.role}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Mobile Testimonial Card (Compact)
const MobileTestimonialCard: React.FC<{ testimonial: Testimonial }> = ({
  testimonial,
}) => {
  return (
    <Card className="h-full w-[280px] flex-shrink-0 rounded-lg border-0 bg-[#ffffff] shadow-lg">
      <CardContent className="flex h-full flex-col p-4">
        {/* Header with stars and timestamp */}
        <div className="mb-3 flex items-start justify-between">
          {/* Star rating */}
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, index) =>
              index < testimonial.rating ? (
                <Image
                  key={index}
                  src="/star.png"
                  alt="Filled star"
                  width={14}
                  height={14}
                  className="h-3.5 w-3.5 object-contain"
                />
              ) : (
                <Star key={index} className="h-3.5 w-3.5 text-gray-300" />
              )
            )}
          </div>

          {/* Time stamp */}
          <div className="font-open-sans text-xs text-[#202020]">
            {testimonial.timeAgo}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bebas mb-3 text-lg text-black uppercase">
          {testimonial.title}
        </h3>

        {/* Description */}
        <p className="font-open-sans mb-4 flex-grow text-sm leading-relaxed text-gray-500">
          {testimonial.description}
        </p>

        {/* Author */}
        <div className="mt-auto">
          <p className="font-bebas text-base text-black uppercase">
            - {testimonial.author}, {testimonial.role}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

interface TestimonialsProps {
  showBackground?: boolean;
}

export const Testimonials: React.FC<TestimonialsProps> = ({
  showBackground = true,
}) => {
  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollPrev = () => {
    api?.scrollPrev();
  };

  const scrollNext = () => {
    api?.scrollNext();
  };

  // Handle mobile scroll indicators
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = 280 + 16; // card width + gap
      const scrollLeft = container.scrollLeft;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setCurrentIndex(Math.min(newIndex, testimonials.length - 1));
    }
  };

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = 280 + 16; // card width + gap
      container.scrollTo({
        left: index * cardWidth,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <section className="py-4 md:py-16 lg:py-20">
      <div className={`py-12 ${showBackground ? "bg-light-blue" : ""}`}>
        <div className="px-4 sm:px-[32px]">
          {/* Header */}
          <div className="mb-8 flex items-center justify-center md:mb-12 md:justify-between">
            <div className="md:mb-0">
              <h1 className="text-3xl lg:text-[85px]">WHAT OUR BUYERS SAYS</h1>
            </div>

            {/* Navigation buttons - Desktop only */}
            <div className="hidden items-center gap-4 md:flex">
              <Button
                onClick={scrollPrev}
                className="border-blue text-blue hover:bg-blue flex h-[50px] w-[50px] items-center justify-center rounded-full border-1 bg-transparent p-0 transition-all duration-300 hover:text-white md:h-16 md:w-16"
              >
                <Image
                  src="/arrow-left.png"
                  alt="Previous"
                  width={24}
                  height={24}
                  className="h-8 w-8 object-contain"
                />
              </Button>
              <Button
                onClick={scrollNext}
                className="bg-blue hover:bg-blue/90 flex h-[50px] w-[50px] items-center justify-center rounded-full p-0 text-white transition-all duration-300 md:h-16 md:w-16"
              >
                <Image
                  src="/arrow-right1.png"
                  alt="Next"
                  width={24}
                  height={24}
                  className="h-8 w-8 object-contain"
                />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile: Horizontal Scroll */}
        <div className="px-[16px] md:hidden">
          <div
            ref={scrollContainerRef}
            className="scrollbar-hide overflow-x-auto overflow-y-hidden"
            style={{ scrollSnapType: "x mandatory" }}
          >
            <div className="flex gap-4 pb-4">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} style={{ scrollSnapAlign: "start" }}>
                  <MobileTestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Scroll Indicator Dots */}
          <div className="mt-4 flex justify-center space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-blue w-6"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Desktop: Carousel with overflow on both sides and blur effects */}
        <div className="relative hidden md:block">
          {/* Left fade overlay - covers partial left card */}
          <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-[200px] bg-gradient-to-r from-[#faf9f6] via-[#faf9f6]/60 to-transparent"></div>

          {/* Right fade overlay - covers partial right card */}
          <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-[200px] bg-gradient-to-l from-[#faf9f6] via-[#faf9f6]/60 to-transparent"></div>

          <div className="overflow-hidden">
            <Carousel
              setApi={setApi}
              opts={{
                align: "center",
                loop: true,
              }}
              className="w-full"
            >
              <div className="">
                <CarouselContent className="-ml-2 md:-ml-98">
                  {testimonials.map((testimonial) => (
                    <CarouselItem
                      key={testimonial.id}
                      className="basis-[85%] pl-2 sm:basis-[35%] lg:basis-[420px] lg:pl-4 2xl:basis-[530px]"
                    >
                      <TestimonialCard testimonial={testimonial} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </div>
            </Carousel>
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
    </section>
  );
};

export default Testimonials;
