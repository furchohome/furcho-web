import React from "react";

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading Furcho"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FAF4EC] text-[#3B2418] select-none px-6"
    >
      <div className="flex flex-col items-center max-w-xs text-center animate-brand-fade-in">
        {/* 1. Brand Logo Mark (Clean, unboxed, prominent) */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-4 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="FURCHO Logo"
            className="w-full h-full object-contain"
          />
        </div>

        {/* 2. Brand Wordmark */}
        <div className="flex items-center justify-center mb-1">
          <span className="text-2xl sm:text-[28px] font-black text-[#3B2418] tracking-tight leading-none">
            FURCHO
          </span>
          <span className="text-xs font-bold ml-0.5 -mt-1 text-[#C58B45]">®</span>
        </div>

        {/* 3. Brand Tagline */}
        <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7A6253] mb-6">
          FURNITURE FOR A BETTER LIVING
        </p>

        {/* 4. Thin Elegant Animated Progress Bar */}
        <div className="w-36 sm:w-44 h-[2px] bg-[#E8DDD0] rounded-full overflow-hidden mb-3.5 relative">
          <div className="h-full bg-[#633719] rounded-full animate-luxury-progress" />
        </div>

        {/* 5. Minimal Loading Message */}
        <p className="text-[11px] sm:text-xs font-medium text-[#8C7464] tracking-wide">
          Preparing your space...
        </p>
      </div>
    </div>
  );
}
