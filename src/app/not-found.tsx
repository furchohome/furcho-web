import React from "react";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF5ED] text-[#29221D] px-4 text-center">
      <div className="max-w-md rounded-3xl bg-white border border-[#EFE3D4] p-10 shadow-elevated space-y-5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFE0CC] text-[#633719] font-black text-xl">
          404
        </div>
        <h1 className="text-2xl font-extrabold text-[#29221D]">
          Page or Furniture Piece Not Found
        </h1>
        <p className="text-sm text-[#6E5D52] leading-relaxed">
          The page you are looking for may have moved or been archived. Explore our Everyday
          Living or Premium Living collections below.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-[#633719] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#3B2418] transition"
          >
            <Home className="w-4 h-4" />
            <span>Everyday Living Home</span>
          </Link>
          <Link
            href="/premium"
            className="inline-flex items-center gap-2 rounded-xl border border-[#633719] px-5 py-2.5 text-xs font-bold text-[#633719] hover:bg-[#EFE3D4] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Premium Living</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
