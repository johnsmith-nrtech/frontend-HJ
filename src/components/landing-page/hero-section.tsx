"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { MarqueeStrip } from "../marquee-strip";


const SLIDE_INTERVAL = 3000;
const FALLBACK_IMAGE = '/hero-img1.png';

const HeroSection = () => {
const [heroSettings, setHeroSettings] = useState<{
  hero_images: string[];
  width: number;
  height: number;
} | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [currentSlide, setCurrentSlide] = useState(0);

useEffect(() => {
  fetch(`${process.env.NEXT_PUBLIC_API_URL}/dimensions`)
    .then((r) => r.json())
    .then(setHeroSettings)
    .catch(() => {})
    .finally(() => setIsLoading(false));
}, []);

const slides: string[] = heroSettings?.hero_images?.length
? heroSettings.hero_images
: isLoading
? []
: [FALLBACK_IMAGE];

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [slides.length]);

  const imageSrc = slides[currentSlide];

  // Marquee items data
  const marqueeItems = [
    { text: "Interest-free credit ", 
      // icon: "/sofa-icon.png" 
    },
    { text: "Free delivery offers", 
      // icon: "/sofa-icon.png" 
    },
    { text: "Finance availability", 
      // icon: "/sofa-icon.png" 
    },
    { text: "Referral rewards", 
      // icon: "/sofa-icon.png" 
    },
    { text: "Protection cover offers ", 
      // icon: "/sofa-icon.png" 
    },
    { text: "Discount campaigns", 
      // icon: "/sofa-icon.png" 
    },
  ];


  return (
    <div className="w-full">
      {/* Main Hero Section */}
      <div className="relative">
        {/* Light blue background for right side extending from navbar */}
        <div className="absolute inset-0 hidden w-full overflow-hidden lg:block">
          <div className="relative mx-auto h-full px-4">
            <div className="bg-light-blue absolute right-0 h-full w-[50%] overflow-hidden"></div>
          </div>
        </div>


        {/* <div className="relative mt-0 h-auto lg:min-h-[500px] lg:mb-[-4rem] 
  2xl:min-h-[1000px] overflow-hidden">
                <div
  className="relative w-full flex items-center justify-center
    lg:absolute lg:inset-0 lg:ml-[18px] 2xl:ml-[21px] lg:h-full lg:max-h-[90vh]"
  style={
    heroSettings?.width && heroSettings?.height
      ? { aspectRatio: `${heroSettings.width} / ${heroSettings.height}` }
      : undefined
  }
>
    {slides.length === 0 ? null : heroSettings?.width && heroSettings?.height ? (
      <Image
        src={imageSrc}
        alt="Sofa Deals Hero"
        width={heroSettings.width}
        height={heroSettings.height}
        sizes="100vw"
        className="w-full h-full lg:mx-auto lg:h-full lg:w-auto lg:max-h-full object-contain transition-opacity duration-500"
        priority
      />
              ) : (
                <Image
                  src={imageSrc}
                  alt="Sofa Deals Hero"
                  fill
                  className="object-contain object-center transition-opacity duration-500"
                  priority
                />
              )} */}
              <div className="relative mt-0 h-auto lg:min-h-[500px] lg:mb-[-4rem] 
  2xl:min-h-[1000px]">
  <div className="relative w-full
    lg:absolute lg:inset-0 lg:ml-[18px] 2xl:ml-[21px] lg:flex lg:items-center lg:justify-center lg:h-full lg:max-h-[90vh]">
      {slides.length === 0 ? null : heroSettings?.width && heroSettings?.height ? (
        <Image
          src={imageSrc}
          alt="Sofa Deals Hero"
          width={heroSettings.width}
          height={heroSettings.height}
          sizes="100vw"
          className="w-full h-auto lg:mx-auto lg:h-full lg:w-auto lg:max-h-full object-contain transition-opacity duration-500"
          priority
        />
      ) : (
        <Image
          src={imageSrc}
          alt="Sofa Deals Hero"
          fill
          className="object-contain object-center transition-opacity duration-500"
          priority
        />
      )}

              {/* Slide indicator dots */}
              {slides.length > 1 && (
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === currentSlide
                          ? 'w-6 bg-white'
                          : 'w-2 bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
        </div>
      </div>

      {/* Marquee Strip */}
      <MarqueeStrip
        items={marqueeItems}
        backgroundColor="bg-blue"
        textColor="text-white"
        className="relative z-10 py-3 sm:py-4"
      />
    </div>
  );
};

export default HeroSection;
