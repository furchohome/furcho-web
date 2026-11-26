"use client";

import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  endDateIso: string | null | undefined;
  cycleHours?: number | null;
}

export function CountdownTimer({ endDateIso, cycleHours }: CountdownTimerProps) {
  // If endDateIso is null or empty, admin has disabled/hidden the timer
  if (!endDateIso) {
    return null;
  }

  // Default to 24 hours (Daily Midnight Timer that resets every midnight)
  const activeCycleHours = cycleHours && cycleHours > 0 ? cycleHours : 24;

  const calculateTime = () => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
    const msSinceMidnight = now.getTime() - startOfToday;
    const cycleMs = activeCycleHours * 60 * 60 * 1000;
    const remainingMs = cycleMs - (msSinceMidnight % cycleMs);

    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs / (1000 * 60)) % 60);
    const seconds = Math.floor((remainingMs / 1000) % 60);

    return { hours, minutes, seconds };
  };

  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    if (!endDateIso) {
      setTimeLeft(null);
      return;
    }

    // Immediately calculate time
    setTimeLeft(calculateTime());

    // Update every second (1000ms) for real-time live ticking
    const interval = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [endDateIso, activeCycleHours]);

  if (!timeLeft) {
    return null;
  }

  // Guaranteed safe two-digit zero-padded number, impossible to return "undefined"
  const pad = (n: number | undefined | null) =>
    String(Math.max(0, Math.floor(Number(n) || 0))).padStart(2, "0");

  return (
    <div className="inline-flex flex-wrap items-center gap-3 sm:gap-4 rounded-2xl bg-[#F5EBDD] border border-[#E4D3BE] px-4 py-2.5 shadow-2xs">
      <div className="flex items-center gap-2 text-[#4B2913] font-semibold text-xs sm:text-sm pr-1">
        <Clock className="w-4 h-4 text-[#633719]" />
        <span>Offer Ends In</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex flex-col items-center justify-center rounded-xl bg-[#EFE2D0] border border-[#DECAB2] px-3 py-1.5 min-w-[52px]">
          <span className="text-base sm:text-lg font-extrabold text-[#3B2418] leading-none tabular-nums">
            {pad(timeLeft.hours)}
          </span>
          <span className="text-[10px] font-medium text-[#6E5D52] mt-0.5">Hours</span>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl bg-[#EFE2D0] border border-[#DECAB2] px-3 py-1.5 min-w-[52px]">
          <span className="text-base sm:text-lg font-extrabold text-[#3B2418] leading-none tabular-nums">
            {pad(timeLeft.minutes)}
          </span>
          <span className="text-[10px] font-medium text-[#6E5D52] mt-0.5">Minutes</span>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl bg-[#EFE2D0] border border-[#DECAB2] px-3 py-1.5 min-w-[52px]">
          <span className="text-base sm:text-lg font-extrabold text-[#3B2418] leading-none tabular-nums">
            {pad(timeLeft.seconds)}
          </span>
          <span className="text-[10px] font-medium text-[#6E5D52] mt-0.5">Seconds</span>
        </div>
      </div>
    </div>
  );
}
