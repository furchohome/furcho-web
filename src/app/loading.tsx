import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF5ED] text-[#633719]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-14 w-14 rounded-2xl bg-white border border-[#C58B45]/40 p-2 flex items-center justify-center animate-pulse shadow-soft">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Loading FURCHO" className="w-full h-full object-contain" />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6E5D52]">
          Loading FURCHO®...
        </p>
      </div>
    </div>
  );
}
