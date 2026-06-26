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
import { TestimonialsApi, Testimonial } from "@/lib/api/content";

// Desktop Testimonial Card
const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => (
  <Card className="h-full rounded-lg border-0 bg-[#ffffff] shadow-lg md:w-[400px] 2xl:w-[500px]">
    <CardContent className="flex h-full flex-col p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center">
          {Array.from({ length: 5 }).map((_, index) =>
            index < testimonial.rating ? (
              <Image key={index} src="/star.png" alt="Filled star" width={16} height={16} className="h-4 w-4 object-contain" />
            ) : (
              <Star key={index} className="h-4 w-4 text-gray-300" />
            )
          )}
        </div>
        <div className="font-open-sans text-sm text-[#202020]">{testimonial.time_ago}</div>
      </div>
      <h3 className="font-bebas mb-4 text-[28px] text-black uppercase">{testimonial.title}</h3>
      <p className="font-open-sans mb-6 flex-grow text-base leading-relaxed text-gray-500">{testimonial.description}</p>
      <div className="mt-auto">
        {/* Media */}
{(testimonial.image_url || testimonial.video_url) && (
  <div className="mb-4 overflow-hidden rounded-lg">
    {testimonial.video_url ? (
      <video
        src={testimonial.video_url}
        controls
        className="w-full rounded-lg"
      />
    ) : testimonial.image_url ? (
      <img
        src={testimonial.image_url}
        alt="Testimonial"
        className="w-full max-h-48 rounded-lg object-cover"
      />
    ) : null}
  </div>
)}
        <p className="font-bebas text-xl text-black uppercase">-{testimonial.author}, {testimonial.role}</p>
      </div>
    </CardContent>
  </Card>
);

// Mobile Testimonial Card
const MobileTestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => (
  <Card className="h-full w-[280px] flex-shrink-0 rounded-lg border-0 bg-[#ffffff] shadow-lg">
    <CardContent className="flex h-full flex-col p-4">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center">
          {Array.from({ length: 5 }).map((_, index) =>
            index < testimonial.rating ? (
              <Image key={index} src="/star.png" alt="Filled star" width={14} height={14} className="h-3.5 w-3.5 object-contain" />
            ) : (
              <Star key={index} className="h-3.5 w-3.5 text-gray-300" />
            )
          )}
        </div>
        <div className="font-open-sans text-xs text-[#202020]">{testimonial.time_ago}</div>
      </div>
      <h3 className="font-bebas mb-3 text-lg text-black uppercase">{testimonial.title}</h3>
      <p className="font-open-sans mb-4 flex-grow text-sm leading-relaxed text-gray-500">{testimonial.description}</p>
      <div className="mt-auto">
        {/* Media */}
{(testimonial.image_url || testimonial.video_url) && (
  <div className="mb-4 overflow-hidden rounded-lg">
    {testimonial.video_url ? (
      <video
        src={testimonial.video_url}
        controls
        className="w-full rounded-lg"
      />
    ) : testimonial.image_url ? (
      <img
        src={testimonial.image_url}
        alt="Testimonial"
        className="w-full max-h-48 rounded-lg object-cover"
      />
    ) : null}
  </div>
)}
        <p className="font-bebas text-base text-black uppercase">- {testimonial.author}, {testimonial.role}</p>
      </div>
    </CardContent>
  </Card>
);

interface TestimonialsProps {
  showBackground?: boolean;
}

export const Testimonials: React.FC<TestimonialsProps> = ({ showBackground = true }) => {
  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    TestimonialsApi.getAll()
      .then(setTestimonials)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const scrollPrev = () => api?.scrollPrev();
  const scrollNext = () => api?.scrollNext();

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const cardWidth = 280 + 16;
      const newIndex = Math.round(scrollContainerRef.current.scrollLeft / cardWidth);
      setCurrentIndex(Math.min(newIndex, testimonials.length - 1));
    }
  };

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const cardWidth = 280 + 16;
      scrollContainerRef.current.scrollTo({ left: index * cardWidth, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [testimonials.length]);

  if (isLoading) {
    return (
      <section className="py-4 md:py-16 lg:py-20">
        <div className={`py-12 ${showBackground ? "bg-light-blue" : ""}`}>
          <div className="px-4 sm:px-[32px]">
            <h1 className="text-3xl lg:text-[85px]">WHAT OUR BUYERS SAYS</h1>
          </div>
          <div className="mt-8 flex gap-4 overflow-hidden px-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 w-[400px] shrink-0 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  return (
    <section className="py-4 md:py-16 lg:py-20">
      <div className={`py-12 ${showBackground ? "bg-light-blue" : ""}`}>
        <div className="px-4 sm:px-[32px]">
          <div className="mb-8 flex items-center justify-center md:mb-12 md:justify-between">
            <div className="md:mb-0">
              <h1 className="text-3xl lg:text-[85px]">WHAT OUR BUYERS SAYS</h1>
            </div>
            <div className="hidden items-center gap-4 md:flex">
              <Button onClick={scrollPrev} className="border-blue text-blue hover:bg-blue flex h-[50px] w-[50px] items-center justify-center rounded-full border-1 bg-transparent p-0 transition-all duration-300 hover:text-white md:h-16 md:w-16">
                <Image src="/arrow-left.png" alt="Previous" width={24} height={24} className="h-8 w-8 object-contain" />
              </Button>
              <Button onClick={scrollNext} className="bg-blue hover:bg-blue/90 flex h-[50px] w-[50px] items-center justify-center rounded-full p-0 text-white transition-all duration-300 md:h-16 md:w-16">
                <Image src="/arrow-right1.png" alt="Next" width={24} height={24} className="h-8 w-8 object-contain" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="px-[16px] md:hidden">
          <div ref={scrollContainerRef}
            className="overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            style={{ scrollSnapType: "x mandatory" }}>
            <div className="flex gap-4 pb-4">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} style={{ scrollSnapAlign: "start" }}>
                  <MobileTestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex justify-center space-x-2">
            {testimonials.map((_, index) => (
              <button key={index} onClick={() => scrollToIndex(index)}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${index === currentIndex ? "bg-blue w-6" : "bg-gray-300 hover:bg-gray-400"}`}
                aria-label={`Go to testimonial ${index + 1}`} />
            ))}
          </div>
        </div>

        {/* Desktop */}
        <div className="relative hidden md:block">
          <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-[200px] bg-gradient-to-r from-[#faf9f6] via-[#faf9f6]/60 to-transparent"></div>
          <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-[200px] bg-gradient-to-l from-[#faf9f6] via-[#faf9f6]/60 to-transparent"></div>
          <div className="overflow-hidden">
            <Carousel setApi={setApi} opts={{ align: "center", loop: true }} className="w-full">
              <div>
                <CarouselContent className="-ml-2 md:-ml-98">
                  {testimonials.map((testimonial) => (
                    <CarouselItem key={testimonial.id} className="basis-[85%] pl-2 sm:basis-[35%] lg:basis-[420px] lg:pl-4 2xl:basis-[530px]">
                      <TestimonialCard testimonial={testimonial} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </div>
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;