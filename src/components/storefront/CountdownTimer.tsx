"use client";

import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  endDateIso: string | null | undefined;
}

export function CountdownTimer({ endDateIso }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    expired: boolean;
  } | null>(null);

  useEffect(() => {
    if (!endDateIso) {
      setTimeLeft(null);
      return;
    }

    const endMs = new Date(endDateIso).getTime();
    if (isNaN(endMs)) {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const nowMs = Date.now();
      const diff = endMs - nowMs;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, expired: true });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      setTimeLeft({ days, hours, minutes, expired: false });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 15000);
    return () => clearInterval(interval);
  }, [endDateIso]);

  // Strictly hide when no active timed promotion exists or when expired
  if (!endDateIso || !timeLeft || timeLeft.expired) {
    return null;
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="inline-flex flex-wrap items-center gap-3 sm:gap-4 rounded-2xl bg-[#F5EBDD] border border-[#E4D3BE] px-4 py-2.5 shadow-2xs">
      <div className="flex items-center gap-2 text-[#4B2913] font-semibold text-xs sm:text-sm pr-1">
        <Clock className="w-4 h-4 text-[#633719]" />
        <span>Offer Ends In</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex flex-col items-center justify-center rounded-xl bg-[#EFE2D0] border border-[#DECAB2] px-3 py-1.5 min-w-[52px]">
          <span className="text-base sm:text-lg font-extrabold text-[#3B2418] leading-none">
            {pad(timeLeft.days)}
          </span>
          <span className="text-[10px] font-medium text-[#6E5D52] mt-0.5">Days</span>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl bg-[#EFE2D0] border border-[#DECAB2] px-3 py-1.5 min-w-[52px]">
          <span className="text-base sm:text-lg font-extrabold text-[#3B2418] leading-none">
            {pad(timeLeft.hours)}
          </span>
          <span className="text-[10px] font-medium text-[#6E5D52] mt-0.5">Hours</span>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl bg-[#EFE2D0] border border-[#DECAB2] px-3 py-1.5 min-w-[52px]">
          <span className="text-base sm:text-lg font-extrabold text-[#3B2418] leading-none">
            {pad(timeLeft.minutes)}
          </span>
          <span className="text-[10px] font-medium text-[#6E5D52] mt-0.5">Minutes</span>
        </div>
      </div>
    </div>
  );
}
