"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useFeaturedCategories } from "@/hooks/use-categories";

// Mobile Feature Card Component
const MobileFeatureCard: React.FC<{
  title: string;
  image: string;
  href: string;
}> = ({ title, image, href }) => (
  <Link href={href} className="group relative block w-full">
    <div className="relative h-[160px] w-full overflow-hidden rounded-lg transition-transform duration-300 group-hover:scale-105">
      <Image
        src={image}
        alt={title}
        fill
        sizes="(max-width: 768px) 50vw, 33vw"
        className="object-cover transition-transform duration-300 group-hover:scale-110"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-all duration-300 group-hover:from-black/70 group-hover:via-black/30" />
      <div className="absolute right-0 bottom-0 left-0 p-3">
        <h3 className="font-bebas text-lg leading-tight text-white uppercase transition-transform duration-300 group-hover:translate-y-[-2px]">
          {title}
        </h3>
      </div>
    </div>
  </Link>
);

// Desktop Feature Card
const FeatureCard: React.FC<{
  title: string;
  image: string;
  href: string;
}> = ({ title, image, href }) => (
  <Link href={href} className="group relative block w-full cursor-pointer">
    <div className="overflow-hidden rounded-2xl transition-transform duration-300 group-hover:scale-105">
      <div className="relative h-[300px] w-full overflow-hidden">
        <Image
          src={image}
          alt={title}
          width={400}
          height={300}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          priority
        />
      </div>
    </div>
    <div className="mt-4 flex items-center justify-between px-2">
      <h3 className="font-bebas text-dark-gray group-hover:text-blue flex-1 pr-4 text-[30px] uppercase transition-colors duration-300 md:text-[38px] md:leading-[40px]">
        {title}
      </h3>
      <div className="inline-flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full text-white transition-transform duration-300 group-hover:scale-110">
        <Image
          src="/farrow-r.png"
          alt="Arrow Right"
          width={40}
          height={40}
          className="h-10 w-10 transition-transform duration-300 group-hover:translate-x-1"
        />
      </div>
    </div>
  </Link>
);

// Main Component
const FeaturedCategories = () => {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const {
    data: apiCategories,
    isLoading,
    error,
  } = useFeaturedCategories({ limit: 6 });

  const categories = React.useMemo(() => {
    if (!apiCategories?.length) {
      return [
        {
          id: "1",
          title: "Living",
          image: "/f-1.png",
          href: "/products?category=living",
        },
        {
          id: "2",
          title: "Dining",
          image: "/f-2.png",
          href: "/products?category=dining",
        },
        {
          id: "3",
          title: "Outdoor",
          image: "/f-3.png",
          href: "/products?category=outdoor",
        },
        {
          id: "4",
          title: "Bedroom",
          image: "/f-1.png",
          href: "/products?category=bedroom",
        },
        {
          id: "5",
          title: "Office",
          image: "/f-2.png",
          href: "/products?category=office",
        },
        {
          id: "6",
          title: "Kids",
          image: "/f-3.png",
          href: "/products?category=kids",
        },
      ];
    }

    return apiCategories.map((cat) => ({
      id: cat.id,
      title: cat.name,
      image: cat.image_url || "/f-1.png",
      href: `/products?categoryId=${cat.id}`,
    }));
  }, [apiCategories]);

  useEffect(() => {
    if (!api) return;
    setCurrentIndex(api.selectedScrollSnap());
    api.on("select", () => setCurrentIndex(api.selectedScrollSnap()));
  }, [api]);

  if (isLoading) {
    return (
      <div className="py-4 md:py-8">
        <div className="px-[32px]">
          <div className="mx-auto mb-8 md:mb-10">
            <h1 className="mb-8 text-center text-3xl font-bold uppercase sm:text-5xl lg:text-[85px]">
              SHOP OUR FEATURED CATEGORIES
            </h1>
          </div>

          {/* Mobile Loading - 2x2 grid */}
          <div className="grid grid-cols-2 gap-4 md:hidden">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-96 animate-pulse rounded-lg bg-gray-100"
              ></div>
            ))}
          </div>

          {/* Desktop Loading - 3 columns */}
          <div className="hidden grid-cols-3 gap-6 md:grid md:gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-96 animate-pulse rounded-lg bg-gray-100"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.warn("Failed to load categories:", error);
  }

  return (
    <div className="px-4 py-6 md:px-8 lg:px-12">
      <h1 className="mb-8 text-center text-3xl font-bold uppercase sm:text-5xl lg:text-[85px]">
        Shop Our Featured Categories
      </h1>

      <Carousel
        opts={{ loop: true, align: "start" }}
        setApi={setApi}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {categories.map((cat) => (
            <CarouselItem
              key={cat.id}
              className="pl-4 md:basis-1/2 lg:basis-1/3"
            >
              <div className="md:hidden">
                <MobileFeatureCard {...cat} />
              </div>
              <div className="hidden md:block">
                <FeatureCard {...cat} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="left-0 md:-left-10" />
        <CarouselNext className="right-0 md:-right-10" />
      </Carousel>

      {/* Pagination Dots */}
      {categories.length > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {categories.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? "w-6 bg-blue-600" : "w-2 bg-gray-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedCategories;
