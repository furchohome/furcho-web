"use client";

import React from "react";
import Link from "next/link";
import { ShoppingCart, ArrowUpRight } from "lucide-react";
import { Product } from "@/types/database";
import { formatPaiseToINR } from "@/lib/utils";
import { useCart } from "@/components/providers/CartProvider";

interface ProductCardProps {
  product: Product;
  variant?: "EVERYDAY" | "PREMIUM";
}

export function ProductCard({ product, variant = "EVERYDAY" }: ProductCardProps) {
  const { addItem } = useCart();
  const isPremium = variant === "PREMIUM" || product.store_section === "PREMIUM";
  const primaryImage =
    product.images.find((i) => i.is_primary)?.image_url ||
    product.images[0]?.image_url ||
    "/images/products/ironing-table-open.jpg";

  return (
    <div
      className={`group relative flex flex-col rounded-2xl border transition-all duration-300 overflow-hidden ${
        isPremium
          ? "bg-[#2C1B12] border-[#C58B45]/25 hover:border-[#C58B45]/60 shadow-card"
          : "bg-white border-[#EFE3D4] hover:border-[#C58B45]/50 shadow-soft hover:shadow-card"
      }`}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5">
        {product.is_bestseller && (
          <span className="rounded-full bg-[#A86A2B] px-2.5 py-0.5 text-[10px] font-bold text-white shadow-2xs">
            Bestseller
          </span>
        )}
        {product.is_demo_data && !product.is_bestseller && (
          <span className="rounded-full bg-[#EFE3D4]/90 backdrop-blur-xs border border-[#C58B45]/30 px-2.5 py-0.5 text-[10px] font-semibold text-[#633719]">
            Demo Item
          </span>
        )}
      </div>

      {/* Product Image */}
      <Link
        href={`/products/${product.slug}`}
        className={`relative aspect-[4/3] w-full overflow-hidden ${
          isPremium ? "bg-[#1D110B]" : "bg-[#F4ECE1]"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={primaryImage}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover object-center group-hover:scale-103 transition-transform duration-500"
        />
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4">
        <div>
          <Link href={`/products/${product.slug}`}>
            <h3
              className={`text-sm font-bold leading-snug line-clamp-2 transition ${
                isPremium
                  ? "text-[#FAF5ED] group-hover:text-[#C58B45]"
                  : "text-[#29221D] group-hover:text-[#633719]"
              }`}
            >
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 pt-1">
          <div>
            <span
              className={`text-base sm:text-lg font-extrabold ${
                isPremium ? "text-[#C58B45]" : "text-[#633719]"
              }`}
            >
              {formatPaiseToINR(product.selling_price_paise)}
            </span>
            {product.original_price_paise &&
              product.original_price_paise > product.selling_price_paise && (
                <span className="ml-1.5 text-xs text-[#6E5D52] line-through">
                  {formatPaiseToINR(product.original_price_paise)}
                </span>
              )}
          </div>

          {product.request_quote_only || isPremium ? (
            <Link
              href={`/premium/custom-enquiry?product=${encodeURIComponent(product.name)}&section=PREMIUM`}
              className="inline-flex items-center gap-1 rounded-xl bg-[#C58B45] px-3 py-2 text-xs font-bold text-[#24150E] hover:bg-[#DFA86A] transition"
            >
              Quote
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => addItem(product, 1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#B67A39] text-white hover:bg-[#633719] transition shadow-2xs"
              title={`Add ${product.name} to Cart`}
              aria-label={`Add ${product.name} to Cart`}
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
