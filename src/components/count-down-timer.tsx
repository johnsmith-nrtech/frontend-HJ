"use client";

import React, { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate?: Date;
  className?: string;
}

export function CountdownTimer({
  targetDate,
  className = "",
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Use provided targetDate or default to 24 hours from now
    const target = targetDate
      ? targetDate.getTime()
      : new Date().getTime() + 24 * 60 * 60 * 1000;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeRemaining({
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
        return;
      }

      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeRemaining({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const formatNumber = (num: number) => {
    return num.toString().padStart(2, "0");
  };

  const hoursStr = formatNumber(timeRemaining.hours);
  const minutesStr = formatNumber(timeRemaining.minutes);
  const secondsStr = formatNumber(timeRemaining.seconds);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Hours - First Digit */}
      <div className="bg-blue font-open-sans h-auto w-[43px] rounded-lg text-center text-white shadow-md">
        <div className="text-xl md:text-[46px]">{hoursStr.charAt(0)}</div>
      </div>

      {/* Hours - Second Digit */}
      <div className="bg-blue font-open-sans h-auto w-[43px] rounded-lg text-center text-white shadow-md">
        <div className="text-xl md:text-[46px]">{hoursStr.charAt(1)}</div>
      </div>

      {/* Colon */}
      <span className="text-blue mx-1 text-2xl font-bold">:</span>

      {/* Minutes - First Digit */}
      <div className="bg-blue font-open-sans h-auto w-[43px] rounded-lg text-center text-white shadow-md">
        <div className="text-xl md:text-[46px]">{minutesStr.charAt(0)}</div>
      </div>

      {/* Minutes - Second Digit */}
      <div className="bg-blue font-open-sans h-auto w-[43px] rounded-lg text-center text-white shadow-md">
        <div className="text-xl md:text-[46px]">{minutesStr.charAt(1)}</div>
      </div>

      {/* Colon */}
      <span className="text-blue mx-1 text-2xl font-bold">:</span>

      {/* Seconds - First Digit */}
      <div className="bg-blue font-open-sans h-auto w-[43px] rounded-lg text-center text-white shadow-md">
        <div className="text-xl md:text-[46px]">{secondsStr.charAt(0)}</div>
      </div>

      {/* Seconds - Second Digit */}
      <div className="bg-blue font-open-sans h-auto w-[43px] rounded-lg text-center text-white shadow-md">
        <div className="text-xl md:text-[46px]">{secondsStr.charAt(1)}</div>
      </div>
    </div>
  );
}
