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

  // Handle custom order button click
    const handleCustomOrderClick = () => {
      const message = "Hi, I want to place a custom order. What is the procedure ?";
      window.open(
        `https://wa.me/447306127481?text=${encodeURIComponent(message)}`,
        "_blank",
        "noopener,noreferrer"
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


        <div className="relative mt-14 h-[266px] xs:h-[314px] sm:mt-30 sm:h-[340px] md:mt-0 md:min-h-[650px] lg:min-h-[500px] lg:mb-[-4rem] 
          2xl:min-h-[1000px] overflow-hidden">
          {/* Hero Image - Background for entire section */}
          <div className="absolute inset-0 ml-0 h-full lg:max-h-[90vh] w-full sm:ml-[15px] xl:ml-[18px] 
            2xl:ml-[21px] flex items-center justify-center">
              {slides.length === 0 ? null : heroSettings?.width && heroSettings?.height ? (
                <Image
                  src={imageSrc}
                  alt="Sofa Deals Hero"
                  width={heroSettings.width}
                  height={heroSettings.height}
                  className="mx-auto object-contain transition-opacity duration-500 lg:h-full lg:w-auto lg:max-h-full"
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






// "use client";

// import React, { useEffect, useState } from "react";
// import Image from "next/image";
// import { MarqueeStrip } from "../marquee-strip";
// import { Button } from "../button-custom";

// const SLIDE_INTERVAL = 3000;
// const FALLBACK_IMAGE = '/hero-img1.png';

// interface HeroSlideProps {
//   imageSrc: string;
//   slides: string[];
//   currentSlide: number;
//   setCurrentSlide: (i: number) => void;
//   onCustomOrderClick: () => void;
//   heroSettings: { width: number; height: number } | null;
// }

// // ---------- DESKTOP ----------
// const HeroSectionDesktop = ({
//   imageSrc,
//   slides,
//   currentSlide,
//   setCurrentSlide,
//   onCustomOrderClick,
//   heroSettings,
// }: HeroSlideProps) => {
//   return (
//     <div className="relative hidden lg:block">
//       {/* Light blue background for right side */}
//       <div className="absolute inset-0 w-full overflow-hidden">
//         <div className="relative mx-auto h-full px-4">
//           <div className="bg-light-blue absolute right-0 h-full w-[50%] overflow-hidden"></div>
//         </div>
//       </div>

//       <div
//         className="relative w-full overflow-hidden lg:max-h-[500px] 2xl:max-h-[700px]"
//         style={{
//           aspectRatio: heroSettings?.width && heroSettings?.height
//             ? `${heroSettings.width} / ${heroSettings.height}`
//             : "16 / 9",
//         }}
//       >
//         <div className="absolute inset-0 xl:ml-[18px] 2xl:ml-[21px] flex items-center justify-center">
//           {slides.length === 0 ? null : (
//             <Image
//               src={imageSrc}
//               alt="Sofa Deals Hero"
//               fill
//               className="object-contain object-center transition-opacity duration-500"
//               priority
//             />
//           )}

//           {slides.length > 1 && (
//             <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
//               {slides.map((_, i) => (
//                 <button
//                   key={i}
//                   onClick={() => setCurrentSlide(i)}
//                   className={`h-2 rounded-full transition-all duration-300 ${
//                     i === currentSlide ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/75'
//                   }`}
//                 />
//               ))}
//             </div>
//           )}
//         </div>

//         <div className="relative z-10 h-full px-9">
//           <div className="grid h-full grid-cols-2">
//             <div className="flex flex-col justify-between py-2"></div>
//             <div className="relative flex justify-end">
//               <div className="absolute top-12 right-0">
//                 <Button
//                   onClick={onCustomOrderClick}
//                   variant="main"
//                   size="xl"
//                   rounded="full"
//                   className="bg-blue relative !w-[244px] items-center justify-start"
//                   icon={
//                     <Image
//                       src="/arrow-right.png"
//                       alt="arrow-right"
//                       width={20}
//                       height={20}
//                       className="text-blue absolute top-1/2 right-2 h-[30px] w-[30px] -translate-y-1/2 rounded-full bg-[#fff] object-contain p-2 sm:h-[40px] sm:w-[40px]"
//                     />
//                   }
//                 >
//                   Make Custom Order
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ---------- MOBILE ----------
// const HeroSectionMobile = ({
//   imageSrc,
//   slides,
//   currentSlide,
//   setCurrentSlide,
//   onCustomOrderClick,
// }: HeroSlideProps) => {
//   return (
//     <div className="relative flex h-[calc(100svh-56px)] max-h-[460px] min-h-[380px] flex-col justify-between lg:hidden bg-light-blue">
//   <div className="relative w-full flex-1 min-h-0">
//     {slides.length === 0 ? null : (
//       <Image
//         src={imageSrc}
//         alt="Sofa Deals Hero"
//         fill
//         className="object-contain object-center transition-opacity duration-500"
//         priority
//       />
//     )}

//         {slides.length > 1 && (
//           <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-2">
//             {slides.map((_, i) => (
//               <button
//                 key={i}
//                 onClick={() => setCurrentSlide(i)}
//                 className={`h-1.5 rounded-full transition-all duration-300 ${
//                   i === currentSlide ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/75'
//                 }`}
//               />
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Mobile Button */}
//       <div className="shrink-0 py-2">
//         <Button
//           onClick={onCustomOrderClick}
//           variant="main"
//           size="xl"
//           rounded="full"
//           className="bg-blue relative !w-[220px] items-center justify-start"
//           icon={
//             <Image
//               src="/arrow-right.png"
//               alt="arrow-right"
//               width={20}
//               height={20}
//               className="absolute top-1/2 right-2 h-[30px] w-[30px] -translate-y-1/2 object-contain p-2 sm:h-[40px] sm:w-[40px]"
//             />
//           }
//         >
//           Make Custom Order
//         </Button>
//       </div>
//     </div>
//   );
// };

// // ---------- PARENT ----------
// const HeroSection = () => {
//   const [heroSettings, setHeroSettings] = useState<{
//     hero_images: string[];
//     width: number;
//     height: number;
//   } | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [currentSlide, setCurrentSlide] = useState(0);

//   useEffect(() => {
//     fetch(`${process.env.NEXT_PUBLIC_API_URL}/dimensions`)
//       .then((r) => r.json())
//       .then(setHeroSettings)
//       .catch(() => {})
//       .finally(() => setIsLoading(false));
//   }, []);

//   const slides: string[] = heroSettings?.hero_images?.length
//     ? heroSettings.hero_images
//     : isLoading
//     ? []
//     : [FALLBACK_IMAGE];

//   useEffect(() => {
//     if (slides.length <= 1) return;
//     const timer = setInterval(() => {
//       setCurrentSlide((prev) => (prev + 1) % slides.length);
//     }, SLIDE_INTERVAL);
//     return () => clearInterval(timer);
//   }, [slides.length]);

//   const imageSrc = slides[currentSlide];

//   const marqueeItems = [
//     { text: "Interest-free credit " },
//     { text: "Free delivery offers" },
//     { text: "Finance availability" },
//     { text: "Referral rewards" },
//     { text: "Protection cover offers " },
//     { text: "Discount campaigns" },
//   ];

//   const handleCustomOrderClick = () => {
//     alert(
//       "Custom Order feature coming soon! Please contact us for custom orders."
//     );
//   };

//   return (
//     <div className="w-full">
//       <HeroSectionDesktop
//         imageSrc={imageSrc}
//         slides={slides}
//         currentSlide={currentSlide}
//         setCurrentSlide={setCurrentSlide}
//         onCustomOrderClick={handleCustomOrderClick}
//         heroSettings={heroSettings}
//       />
//       <HeroSectionMobile
//         imageSrc={imageSrc}
//         slides={slides}
//         currentSlide={currentSlide}
//         setCurrentSlide={setCurrentSlide}
//         onCustomOrderClick={handleCustomOrderClick}
//         heroSettings={heroSettings}
//       />

//       <MarqueeStrip
//         items={marqueeItems}
//         backgroundColor="bg-blue"
//         textColor="text-white"
//         className="relative z-10 py-3 sm:py-4"
//       />
//     </div>
//   );
// };

// export default HeroSection;