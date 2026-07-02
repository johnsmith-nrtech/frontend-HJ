"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { MarqueeStrip } from "../marquee-strip";
import { Button } from "../button-custom";

const SLIDE_INTERVAL = 3000;
const FALLBACK_IMAGE = '/hero-img1.png';

const HeroSection = () => {
const [heroSettings, setHeroSettings] = useState<{
  hero_images: string[];
  width: number;
  height: number;
} | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/dimensions`)
      .then((r) => r.json())
      .then(setHeroSettings)
      .catch(() => {});
  }, []);

  const slides: string[] = heroSettings?.hero_images?.length
  ? heroSettings.hero_images
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
            <div className="bg-light-blue absolute right-0 h-full w-[50%] overflow-hidden"></div>
          </div>
        </div>


        <div className="relative h-[33vh] sm:h-[40vh] md:min-h-[650px] lg:min-h-[500px] lg:mb-[-4rem] 
        2xl:min-h-[1000px]">
          {/* Hero Image - Background for entire section */}
          <div className="absolute inset-0 ml-0 h-full lg:max-h-[90vh] w-full sm:ml-[15px] xl:ml-[18px] 
            2xl:ml-[21px] flex items-center justify-center">
              {heroSettings?.width && heroSettings?.height ? (
                <Image
                  src={imageSrc}
                  alt="Sofa Deals Hero"
                  width={heroSettings.width}
                  height={heroSettings.height}
                  className="mx-auto object-contain transition-opacity duration-500"
                  priority
                />
              ) : (
                <Image
                  src={imageSrc}
                  alt="Sofa Deals Hero"
                  fill
                  className="h-[90vh] object-contain object-center transition-opacity duration-500"
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

          {/* Content Overlay with responsive padding */}
          <div className="relative z-10 h-full px-4 sm:px-6 lg:px-9">
            <div className="grid h-full grid-cols-1 lg:grid-cols-2">
              {/* Left Side - Content */}
              <div className="flex flex-col justify-between py-4 sm:py-3 md:py-8 lg:py-2">
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
        <div className="block py-4 sm:mt-[-3rem] sm:py-4 md:mt-[-3rem] lg:hidden">
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
                className="absolute top-1/2 right-2 h-[30px] w-[30px] -translate-y-1/2 object-contain p-2 sm:h-[40px] sm:w-[40px]"
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
        className="relative z-10 py-3 sm:py-4"
      />
    </div>
  );
};

export default HeroSection;