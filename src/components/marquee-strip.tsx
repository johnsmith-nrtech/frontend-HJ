"use client";

import React from "react";
import Image from "next/image";

interface MarqueeItem {
  text: string;
  icon?: string;
}

interface MarqueeStripProps {
  items: MarqueeItem[];
  className?: string;
  backgroundColor?: string;
  textColor?: string;
}

export function MarqueeStrip({
  items,
  className = "",
  backgroundColor = "bg-blue",
  textColor = "text-white",
}: MarqueeStripProps) {
  const repeatedItems = [...items, ...items]; // Repeat for smooth loop

  return (
    <>
      <div
        className={`w-full overflow-hidden ${backgroundColor} h-12 md:h-20 ${className}`}
      >
        <div className="animate-marquee flex whitespace-nowrap">
          {repeatedItems.map((item, index) => (
            <div
              key={`${item.text}-${index}`}
              className={`flex items-center justify-center gap-2 sm:gap-4 ${textColor} font-bebas flex-shrink-0 px-4 text-[24px] leading-none sm:text-[32px] md:text-[40px]`}
            >
              {item.icon && (
                <div className="relative flex h-6 w-6 flex-shrink-0 items-center justify-center sm:h-8 sm:w-8 md:h-10 md:w-10">
                  <Image
                    src={item.icon}
                    alt=""
                    fill
                    className="object-contain brightness-0 invert filter"
                  />
                </div>
              )}
              <span className="text-center tracking-wider uppercase">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Inline styles for animation */}
      <style jsx global>{`
        @layer utilities {
          @keyframes marquee {
            0% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .animate-marquee {
            animation: marquee 30s linear infinite;
          }
        }
      `}</style>
    </>
  );
}
