"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  Gem,
  Wrench,
  Maximize2,
  ShoppingCart,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Truck,
} from "lucide-react";
import { Banner, Product, SiteSettings } from "@/types/database";
import { formatPaiseToINR } from "@/lib/utils";
import { CountdownTimer } from "./CountdownTimer";
import { useCart } from "@/components/providers/CartProvider";

interface HeroFeaturedProductProps {
  product: Product;
  allProducts?: Product[];
  settings: SiteSettings;
  heroBanners?: Banner[];
}

const BENEFIT_ICONS = [
  { label: "Space\nSaving", singleLine: "Space Saving", icon: Home },
  { label: "Sturdy &\nDurable", singleLine: "Sturdy & Durable", icon: Gem },
  { label: "Easy\nInstallation", singleLine: "Easy Installation", icon: Wrench },
  { label: "Foldable\nDesign", singleLine: "Foldable Design", icon: Maximize2 },
];

export function HeroFeaturedProduct({
  product,
  allProducts = [],
  settings,
  heroBanners = [],
}: HeroFeaturedProductProps) {
  const router = useRouter();
  const { addItem } = useCart();

  // Combine hero banners or fall back to single default banner
  const activeBanners =
    heroBanners && heroBanners.length > 0
      ? heroBanners.map((b) => {
          const matchedProd =
            (allProducts && (
              allProducts.find((p) => p.id === b.product_id) ||
              allProducts.find((p) => p.slug === b.product_slug)
            )) || product;

          return {
            id: b.id,
            product_id: b.product_id || matchedProd.id,
            product_slug: b.product_slug || matchedProd.slug,
            matchedProduct: matchedProd,
            title: b.title || matchedProd.name,
            subtitle: b.subtitle || matchedProd.short_description,
            badge_text: b.badge_text || "FEATURED PRODUCT",
            price_paise:
              b.price_paise !== undefined && b.price_paise !== null
                ? b.price_paise
                : matchedProd.selling_price_paise,
            launch_price_label: b.launch_price_label || matchedProd.launch_price_label || "Launch Price",
            cta_primary_text: b.cta_primary_text || "Order Now",
            cta_primary_link: b.cta_primary_link || `/products/${matchedProd.slug}`,
            cta_secondary_text: b.cta_secondary_text || "View Product Details",
            cta_secondary_link: b.cta_secondary_link || `/products/${matchedProd.slug}`,
            desktop_img: b.image_url || settings.hero_bg_image || "/images/products/ironing-table-hero-bg.jpg",
            mobile_img: b.mobile_image_url || b.image_url || settings.hero_mobile_image || "/images/products/ironing-table-hero-mobile.jpg",
          };
        })
      : [
          {
            id: "default-hero",
            product_id: product.id,
            product_slug: product.slug,
            matchedProduct: product,
            title: product.name,
            subtitle: product.short_description,
            badge_text: "FEATURED PRODUCT",
            price_paise: product.selling_price_paise,
            launch_price_label: product.launch_price_label || "Launch Price",
            cta_primary_text: "Order Now",
            cta_primary_link: `/products/${product.slug}`,
            cta_secondary_text: "View Product Details",
            cta_secondary_link: `/products/${product.slug}`,
            desktop_img: settings.hero_bg_image || "/images/products/ironing-table-hero-bg.jpg",
            mobile_img: settings.hero_mobile_image || "/images/products/ironing-table-hero-mobile.jpg",
          },
        ];

  const [currentIdx, setCurrentIdx] = useState(0);

  // Auto-slide every 4 seconds
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % activeBanners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  const currentBanner = activeBanners[currentIdx] || activeBanners[0];
  const targetProduct = currentBanner.matchedProduct || product;

  const handleOrderClick = () => {
    addItem(targetProduct, 1, targetProduct.variants[0] || null, { openDrawer: false });
    router.push("/checkout");
  };

  const detailsHref =
    currentBanner.cta_secondary_link && currentBanner.cta_secondary_link !== "/"
      ? currentBanner.cta_secondary_link
      : `/products/${targetProduct.slug}`;

  return (
    <>
      {/* =========================================================================
          1. MOBILE DEDICATED LAYOUT (< md: 768px)
          Matches exact mobile reference:
          1) Title & subtitle on top
          2) Product image with slide dots
          3) Price & launch price badge
          4) Countdown timer below price
          5) Trust / benefit icons: 2 in a row (2x2 grid)
          6) Full width "Order Now" and "View Product Details"
          ========================================================================= */}
      <section className="block md:hidden bg-[#FAF5ED] px-4 pt-4 pb-8 space-y-4 border-b border-[#E4D3BE]">
        {/* Top Product Titles */}
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-[#3B2418] leading-tight">
            {currentBanner.title}
          </h1>

          <p className="text-xs text-[#4E3B30] leading-relaxed">
            {currentBanner.subtitle}
          </p>
        </div>

        {/* Product Image Section with Carousel Dots */}
        <div className="relative w-full rounded-2xl overflow-hidden shadow-soft border border-[#DFCBB3]/60 bg-[#FAF5ED]">
          <div className="relative w-full aspect-[4/3] max-h-[320px] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentBanner.mobile_img || currentBanner.desktop_img}
              alt={currentBanner.title}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Carousel Dots */}
          {activeBanners.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-3 pb-1">
              {activeBanners.map((b, i) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setCurrentIdx(i)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    currentIdx === i ? "w-6 bg-[#633719]" : "w-2 bg-[#D8C7B4]"
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Price + Launch Price + Feature Badge */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {currentBanner.price_paise ? (
            <span className="text-3xl font-black text-[#3B2418] tracking-tight">
              {formatPaiseToINR(currentBanner.price_paise)}
            </span>
          ) : null}

          {currentBanner.launch_price_label && (
            <span className="rounded-full bg-[#633719] px-3 py-1 text-xs font-bold text-white shadow-2xs">
              {currentBanner.launch_price_label}
            </span>
          )}

          {targetProduct.original_price_paise &&
            currentBanner.price_paise &&
            targetProduct.original_price_paise > currentBanner.price_paise && (
              <span className="text-sm text-[#6E5D52] line-through ml-1">
                {formatPaiseToINR(targetProduct.original_price_paise)}
              </span>
            )}
        </div>

        {/* Countdown Timer (Below Price on Mobile) */}
        {settings.promo_countdown_end && (
          <div className="w-full">
            <CountdownTimer
              endDateIso={settings.promo_countdown_end}
              cycleHours={settings.promo_countdown_hours}
            />
          </div>
        )}

        {/* Benefit / Trust Icons (2 Icons in a row - 2x2 Grid) */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {BENEFIT_ICONS.map((benefit) => {
            const IconComp = benefit.icon;
            return (
              <div
                key={benefit.singleLine}
                className="flex items-center gap-2.5 rounded-2xl bg-[#FAF5ED] border border-[#DECBB3] p-2.5 shadow-2xs"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFE2D0] text-[#8A5424]">
                  <IconComp className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#29221D] leading-tight">
                  {benefit.singleLine}
                </span>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={handleOrderClick}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#633719] px-6 py-3.5 text-base font-bold text-white hover:bg-[#3B2418] transition shadow-card cursor-pointer"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>{currentBanner.cta_primary_text || "Order Now"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <Link
            href={detailsHref}
            className="w-full inline-flex items-center justify-center rounded-xl border-2 border-[#633719]/40 bg-white/80 px-6 py-3 text-sm font-bold text-[#3B2418] hover:bg-[#633719] hover:text-white transition"
          >
            {currentBanner.cta_secondary_text || "View Product Details"}
          </Link>

          <p className="text-center text-xs font-bold text-[#2D6A4F] pt-1 flex items-center justify-center gap-1.5 bg-[#EBF5ED] py-1.5 px-3 rounded-xl border border-[#C3E6CB]">
            <Truck className="w-4 h-4 text-[#2D6A4F]" />
            <span>100% FREE Doorstep Delivery Across Kerala</span>
          </p>
        </div>
      </section>

      {/* =========================================================================
          2. DESKTOP LAYOUT (md: & lg: 768px+)
          Preserves current full background image hero layout
          ========================================================================= */}
      <section className="hidden md:flex relative overflow-hidden bg-[#FAF5ED] border-b border-[#E4D3BE] min-h-[580px] lg:min-h-[660px] items-center">
        {/* Full Hero Background covering 100% width and 100% height */}
        <div
          key={`hero-bg-desktop-${currentBanner.id}`}
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-700 pointer-events-none"
          style={{
            backgroundImage: `url('${currentBanner.desktop_img}')`,
            backgroundPosition: "center center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Hero Content & Action Controls */}
            <div className="lg:col-span-7 xl:col-span-6 space-y-5">
              <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#3B2418] leading-[1.14] tracking-tight transition-all duration-300">
                {currentBanner.title}
              </h1>

              <p className="text-base sm:text-lg text-[#4E3B30] max-w-xl leading-relaxed">
                {currentBanner.subtitle}
              </p>

              {/* 4 Product Benefit Pills */}
              <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-md pt-1">
                {BENEFIT_ICONS.map((benefit, index) => {
                  const IconComp = benefit.icon;
                  return (
                    <div
                      key={benefit.label}
                      className={`flex flex-col items-center text-center ${
                        index < 3 ? "border-r border-[#DECAB2]/70 pr-2 sm:pr-4" : ""
                      }`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EFE2D0]/90 backdrop-blur-xs border border-[#DFCBB3] text-[#8A5424] shadow-2xs">
                        <IconComp className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="mt-2 text-[11px] sm:text-xs font-semibold text-[#29221D] whitespace-pre-line leading-tight">
                        {benefit.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Price + Launch Price Badge */}
              {currentBanner.price_paise ? (
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <span className="text-3xl sm:text-4xl font-black text-[#4B2913] tracking-tight">
                    {formatPaiseToINR(currentBanner.price_paise)}
                  </span>
                  {currentBanner.launch_price_label && (
                    <span className="rounded-full bg-[#8D4F23] px-3.5 py-1 text-xs font-bold text-white shadow-2xs">
                      {currentBanner.launch_price_label}
                    </span>
                  )}
                  {targetProduct.original_price_paise &&
                    targetProduct.original_price_paise > currentBanner.price_paise && (
                      <span className="text-base text-[#6E5D52] line-through">
                        {formatPaiseToINR(targetProduct.original_price_paise)}
                      </span>
                    )}
                </div>
              ) : null}

              {/* Optional Promotional Countdown Timer */}
              <div>
                <CountdownTimer
                  endDateIso={settings.promo_countdown_end}
                  cycleHours={settings.promo_countdown_hours}
                />
              </div>

              {/* Dual CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={handleOrderClick}
                  className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#633719] px-7 py-3.5 text-sm sm:text-base font-bold text-white hover:bg-[#3B2418] transition shadow-card cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{currentBanner.cta_primary_text || "Order Now"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <Link
                  href={detailsHref}
                  className="inline-flex items-center justify-center rounded-xl border-2 border-[#633719]/50 bg-[#FAF5ED]/80 backdrop-blur-xs px-7 py-3.5 text-sm sm:text-base font-bold text-[#3B2418] hover:bg-[#633719] hover:text-white hover:border-[#633719] transition"
                >
                  {currentBanner.cta_secondary_text || "View Details"}
                </Link>
              </div>

              {/* Carousel navigation indicators */}
              {activeBanners.length > 1 && (
                <div className="flex items-center gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentIdx((prev) =>
                        prev === 0 ? activeBanners.length - 1 : prev - 1
                      )
                    }
                    className="p-1 rounded-full bg-[#EFE0CC]/90 hover:bg-[#DFCBB3] text-[#633719] cursor-pointer"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    {activeBanners.map((b, i) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setCurrentIdx(i)}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          currentIdx === i ? "w-6 bg-[#633719]" : "w-2 bg-[#D8C7B4]"
                        }`}
                        aria-label={`Slide ${i + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentIdx((prev) => (prev + 1) % activeBanners.length)
                    }
                    className="p-1 rounded-full bg-[#EFE0CC]/90 hover:bg-[#DFCBB3] text-[#633719] cursor-pointer"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
