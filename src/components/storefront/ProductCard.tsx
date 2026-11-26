"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, ArrowUpRight, Truck, Check } from "lucide-react";
import { Product } from "@/types/database";
import { formatPaiseToINR } from "@/lib/utils";
import { useCart } from "@/components/providers/CartProvider";

interface ProductCardProps {
  product: Product;
  variant?: "EVERYDAY" | "PREMIUM";
}

export function ProductCard({ product, variant = "EVERYDAY" }: ProductCardProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const isPremium = variant === "PREMIUM" || product.store_section === "PREMIUM";
  const primaryImage =
    product.images.find((i) => i.is_primary)?.image_url ||
    product.images[0]?.image_url ||
    "/images/products/ironing-table-open.jpg";

  const discountPercent =
    product.original_price_paise && product.original_price_paise > product.selling_price_paise
      ? Math.round(
          ((product.original_price_paise - product.selling_price_paise) /
            product.original_price_paise) *
            100
        )
      : null;

  const isDemoLabel =
    Boolean(product.launch_price_label) &&
    (product.launch_price_label!.toLowerCase().includes("demo") ||
      product.launch_price_label!.toLowerCase().includes("test"));

  const displayLaunchLabel = !isDemoLabel ? product.launch_price_label : null;

  const handleQuickOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1, product.variants?.[0] || null, { openDrawer: false });
    router.push("/checkout");
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1, product.variants?.[0] || null, { openDrawer: true });
  };

  return (
    <div
      className={`group relative flex flex-col h-full rounded-2xl border transition-all duration-300 overflow-hidden ${
        isPremium
          ? "bg-[#2C1B12] border-[#C58B45]/25 hover:border-[#C58B45]/60 shadow-card"
          : "bg-white border-[#EFE3D4] hover:border-[#C58B45]/50 shadow-soft hover:shadow-card"
      }`}
    >
      {/* Badges */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap gap-1">
        {discountPercent ? (
          <span className="rounded-full bg-emerald-700 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-2xs">
            {discountPercent}% OFF
          </span>
        ) : displayLaunchLabel ? (
          <span className="rounded-full bg-[#8D4F23] px-2 py-0.5 text-[10px] font-extrabold text-white shadow-2xs">
            {displayLaunchLabel}
          </span>
        ) : null}

        {product.is_bestseller && (
          <span className="rounded-full bg-[#3B2418] px-2 py-0.5 text-[10px] font-bold text-[#E5B869] shadow-2xs">
            Bestseller
          </span>
        )}
      </div>

      {/* Product Image */}
      <Link
        href={`/products/${product.slug}`}
        className={`relative aspect-[4/3] w-full overflow-hidden block ${
          isPremium ? "bg-[#1D110B]" : "bg-[#F4ECE1]"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={primaryImage}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover object-center group-hover:scale-104 transition-transform duration-500"
        />
      </Link>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
        <div className="space-y-1">
          {product.subcategory_name ? (
            <p className="text-[10px] sm:text-[11px] font-bold text-[#8C7A6B] uppercase tracking-wider truncate h-4">
              {product.subcategory_name}
            </p>
          ) : (
            <div className="h-4" />
          )}

          <Link href={`/products/${product.slug}`} className="block">
            <h3
              className={`text-xs sm:text-sm font-bold leading-snug line-clamp-2 h-[2.5rem] sm:h-[2.75rem] transition ${
                isPremium
                  ? "text-[#FAF5ED] group-hover:text-[#C58B45]"
                  : "text-[#29221D] group-hover:text-[#633719]"
              }`}
              title={product.name}
            >
              {product.name}
            </h3>
          </Link>

          {/* Pricing Row */}
          <div className="flex flex-wrap items-baseline gap-1.5 pt-1">
            <span
              className={`text-sm sm:text-base font-black ${
                isPremium ? "text-[#C58B45]" : "text-[#4B2913]"
              }`}
            >
              {formatPaiseToINR(product.selling_price_paise)}
            </span>
            {product.original_price_paise &&
              product.original_price_paise > product.selling_price_paise && (
                <span className="text-[11px] sm:text-xs text-[#8C7A6B] line-through">
                  {formatPaiseToINR(product.original_price_paise)}
                </span>
              )}
          </div>

          {/* Delivery perk badge */}
          <div className="h-4.5 pt-0.5">
            {!isPremium && (
              <p className="text-[10px] font-semibold text-emerald-800 flex items-center gap-1">
                <Truck className="w-3 h-3 text-emerald-700 shrink-0" />
                <span>Free Delivery in Kerala</span>
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-3 pt-2 border-t border-[#EFE3D4]/80 flex items-center gap-2">
          {product.request_quote_only || isPremium ? (
            <Link
              href={`/premium/custom-enquiry?product=${encodeURIComponent(product.name)}&section=PREMIUM`}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#C58B45] px-3 py-2 text-xs font-bold text-[#24150E] hover:bg-[#DFA86A] transition cursor-pointer"
            >
              <span>Request Quote</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <button
                type="button"
                onClick={handleQuickOrder}
                className="flex-1 inline-flex items-center justify-center rounded-xl bg-[#633719] px-2.5 py-2 text-xs font-bold text-white hover:bg-[#3B2418] transition shadow-2xs cursor-pointer"
              >
                <span>Order Now</span>
              </button>

              <button
                type="button"
                onClick={handleAddToCart}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FAF5ED] border border-[#DECAB2] text-[#633719] hover:bg-[#EFE3D4] transition shrink-0 cursor-pointer"
                title={`Add ${product.name} to Cart`}
                aria-label={`Add ${product.name} to Cart`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
