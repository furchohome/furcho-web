"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  ArrowRight,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Wrench,
  Minus,
  Plus,
  Star,
  Info,
  Share2,
} from "lucide-react";
import { Product, ProductReview, SiteSettings } from "@/types/database";
import { buildWhatsAppLink, formatPaiseToINR } from "@/lib/utils";
import { useCart } from "@/components/providers/CartProvider";
import { CountdownTimer } from "./CountdownTimer";
import { ProductCard } from "./ProductCard";
import { trackMetaEvent } from "@/components/tracking/MetaPixel";

function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zM12.05 20.2c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.17 8.17 0 01-1.25-4.39c0-4.51 3.67-8.18 8.19-8.18 2.19 0 4.24.85 5.79 2.4 1.54 1.55 2.4 3.6 2.4 5.79 0 4.52-3.68 8.19-8.2 8.19zm4.49-6.13c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.44 1.03 2.61c.12.17 1.77 2.7 4.28 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.12-.23-.19-.48-.31z" />
    </svg>
  );
}

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
  settings: SiteSettings;
}

export function ProductDetailClient({
  product,
  relatedProducts,
  settings,
}: ProductDetailClientProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const isPremium = product.store_section === "PREMIUM";

  const images =
    product.images.length > 0
      ? product.images
      : [
          {
            id: "default-img",
            product_id: product.id,
            image_url: "/images/products/ironing-table-hero.jpg",
            alt_text: product.name,
            view_label: "Product View",
            is_primary: true,
            display_order: 1,
          },
        ];

  const galleryScrollRef = useRef<HTMLDivElement>(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants[0]?.id || null
  );
  const [quantity, setQuantity] = useState(1);

  // Reviews State
  const [reviewsList, setReviewsList] = useState<ProductReview[]>(product.reviews || []);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) || product.variants[0] || null;
  const effectivePricePaise =
    selectedVariant?.price_override_paise ?? product.selling_price_paise;

  // Original / MRP price: Strictly from database when set higher than selling price (NO fake hardcoded multiplier!)
  const originalPricePaise =
    product.original_price_paise && product.original_price_paise > effectivePricePaise
      ? product.original_price_paise
      : null;

  const discountPercent =
    originalPricePaise && originalPricePaise > effectivePricePaise
      ? Math.round(((originalPricePaise - effectivePricePaise) / originalPricePaise) * 100)
      : 0;

  // Filter out any internal demo label
  const cleanLaunchLabel =
    product.launch_price_label &&
    !product.launch_price_label.toLowerCase().includes("demo") &&
    !product.launch_price_label.toLowerCase().includes("test")
      ? product.launch_price_label
      : null;

  useEffect(() => {
    trackMetaEvent("ViewContent", {
      content_name: product.name,
      content_ids: [product.sku],
      content_type: "product",
      value: Math.round(effectivePricePaise / 100),
      currency: "INR",
    });
  }, [product, effectivePricePaise]);

  const handleThumbnailClick = (idx: number) => {
    setSelectedImageIdx(idx);
    if (galleryScrollRef.current) {
      const container = galleryScrollRef.current;
      container.scrollTo({
        left: idx * container.offsetWidth,
        behavior: "smooth",
      });
    }
  };

  const handleGalleryScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    if (container.offsetWidth > 0) {
      const newIdx = Math.round(container.scrollLeft / container.offsetWidth);
      if (newIdx !== selectedImageIdx && newIdx >= 0 && newIdx < images.length) {
        setSelectedImageIdx(newIdx);
      }
    }
  };

  const handleAddToCart = () => {
    addItem(product, quantity, selectedVariant, { openDrawer: true });
  };

  const handleOrderNow = () => {
    addItem(product, quantity, selectedVariant, { openDrawer: false });
    router.push("/checkout");
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      setReviewError("Please fill in your name and review comments.");
      return;
    }
    setIsSubmittingReview(true);
    setReviewError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          author_name: reviewName.trim(),
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review.");

      setReviewsList((prev) => [data.review, ...prev]);
      setReviewSuccess(true);
      setReviewName("");
      setReviewComment("");
      setIsReviewFormOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit review.";
      setReviewError(msg);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const whatsAppHref = buildWhatsAppLink(
    settings.whatsapp_number,
    `Hi Furcho Team, I would like to enquire about "${product.name}" (SKU: ${product.sku}) priced at ${formatPaiseToINR(effectivePricePaise)}.`
  );

  const handleShare = () => {
    if (typeof window !== "undefined") {
      const shareUrl = window.location.href;
      if (navigator.share) {
        navigator.share({
          title: `${product.name} | FURCHO®`,
          text: `Check out ${product.name} on FURCHO:`,
          url: shareUrl,
        }).catch(() => {});
      } else {
        window.open(
          `https://api.whatsapp.com/send?text=${encodeURIComponent(
            `Check out ${product.name} on FURCHO: ${shareUrl}`
          )}`,
          "_blank"
        );
      }
    }
  };

  return (
    <div
      className={`pb-24 lg:pb-16 ${
        isPremium ? "bg-[#24150E] text-[#FAF5ED]" : "bg-[#FAF5ED] text-[#29221D]"
      }`}
    >
      {/* Breadcrumb & Share */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-2 text-xs flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 opacity-80">
          <Link href={isPremium ? "/premium" : "/"} className="hover:underline">
            {isPremium ? "Premium Living" : "Home"}
          </Link>
          <span>/</span>
          <Link
            href={isPremium ? `/premium` : `/${product.category_slug}`}
            className="hover:underline"
          >
            {product.category_name}
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#C58B45] truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </div>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/70 hover:bg-white border border-[#E5D5C3] px-3 py-1 text-xs font-semibold text-[#633719] transition shadow-2xs cursor-pointer shrink-0"
          title="Share product with family on WhatsApp"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>

      {/* Main Product Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left: Swipable Touch Image Gallery */}
          <div className="lg:col-span-6 space-y-3 sm:space-y-4">
            <div
              className={`relative overflow-hidden rounded-xl sm:rounded-2xl border shadow-soft ${
                isPremium
                  ? "bg-[#1A0F0A] border-[#C58B45]/30"
                  : "bg-[#F7F0E6] border-[#E5D5C3]"
              }`}
            >
              {/* Swipable Carousel Track */}
              <div
                ref={galleryScrollRef}
                onScroll={handleGalleryScroll}
                className="flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
              >
                {images.map((img, idx) => (
                  <div
                    key={img.id || idx}
                    className="snap-center shrink-0 w-full relative aspect-[4/3] sm:aspect-square md:aspect-[4/3] flex items-center justify-center p-3 sm:p-6"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.image_url}
                      alt={img.alt_text || product.name}
                      className="w-full h-full object-contain mx-auto transition-transform duration-300"
                      loading={idx === 0 ? "eager" : "lazy"}
                    />
                  </div>
                ))}
              </div>

              {/* View Label Pill (Bottom Left) */}
              {images[selectedImageIdx]?.view_label && (
                <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-[#3B2418]/85 backdrop-blur-xs px-3 py-1 text-[11px] font-semibold text-[#FAF5ED] shadow-sm">
                  {images[selectedImageIdx].view_label}
                </span>
              )}

              {/* Slide Counter (Bottom Right) */}
              {images.length > 1 && (
                <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/60 backdrop-blur-xs px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
                  {selectedImageIdx + 1} / {images.length}
                </span>
              )}
            </div>

            {/* Thumbnail Strip (Click to select & smooth scroll) */}
            {images.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => handleThumbnailClick(idx)}
                    className={`relative overflow-hidden rounded-lg sm:rounded-xl border-2 w-16 h-14 sm:w-20 sm:h-16 shrink-0 transition-all cursor-pointer ${
                      selectedImageIdx === idx
                        ? "border-[#633719] ring-2 ring-[#C58B45]/50 scale-[1.02] opacity-100"
                        : "border-[#DFCBB3] opacity-65 hover:opacity-100"
                    }`}
                    aria-label={`View image ${idx + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.image_url}
                      alt={img.alt_text || ""}
                      className="h-full w-full object-cover bg-[#EFE3D4]"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info, Pricing, Variants & CTAs */}
          <div className="lg:col-span-6 space-y-5">
            <div className="space-y-2">
              {/* Category & In-Stock Trust Strip */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#633719]/10 border border-[#C58B45]/30 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-[#C58B45]">
                  {product.store_section === "PREMIUM" ? "Premium Living" : "Everyday Living"}
                </span>

                {product.is_bestseller && (
                  <span className="rounded-full bg-[#8D4F23] px-3 py-0.5 text-xs font-bold text-white">
                    ★ Bestseller
                  </span>
                )}

                {/* Clean, Modern Stock Status Indicator */}
                {product.availability_status === "OUT_OF_STOCK" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-0.5 text-xs font-semibold text-red-800">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Currently Sold Out
                  </span>
                ) : product.availability_status === "MADE_TO_ORDER" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-0.5 text-xs font-semibold text-amber-800">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Handcrafted on Order (2–3 Weeks)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-0.5 text-xs font-semibold text-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    In Stock · Ready to Dispatch
                  </span>
                )}
              </div>

              {/* Product Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight">
                {product.name}
              </h1>

              {/* Social Proof Star Rating */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1 text-[#C58B45]">
                  <Star className="w-4 h-4 fill-[#C58B45] text-[#C58B45]" />
                  <span className="font-extrabold text-[#3B2418]">
                    {reviewsList.length > 0
                      ? (reviewsList.reduce((acc, r) => acc + r.rating, 0) / reviewsList.length).toFixed(1)
                      : "5.0"}
                  </span>
                </div>
                <span className="text-[#6E5D52]">·</span>
                <a href="#reviews" className="text-[#633719] font-semibold underline hover:text-[#3B2418]">
                  {reviewsList.length > 0
                    ? `(${reviewsList.length} Customer Reviews)`
                    : "Write a Review"}
                </a>
                <span className="text-[#6E5D52]">·</span>
                <span className="text-[#6E5D52]">SKU: {product.sku}</span>
              </div>
            </div>

            {/* High-Converting Price Block */}
            <div
              className={`rounded-2xl border p-4 sm:p-5 space-y-3.5 ${
                isPremium
                  ? "bg-[#2C1B12] border-[#C58B45]/30"
                  : "bg-[#F7F0E6] border-[#E4D3BE]"
              }`}
            >
              <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-3">
                <span
                  className={`text-3xl sm:text-4xl font-black tracking-tight ${
                    isPremium ? "text-[#C58B45]" : "text-[#4B2913]"
                  }`}
                >
                  {formatPaiseToINR(effectivePricePaise)}
                </span>

                {originalPricePaise && originalPricePaise > effectivePricePaise && (
                  <span className="text-base sm:text-lg text-[#8C7A6B] line-through font-medium">
                    {formatPaiseToINR(originalPricePaise)}
                  </span>
                )}

                {discountPercent > 0 && (
                  <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-xs font-black text-emerald-900 tracking-wide">
                    {discountPercent}% OFF
                  </span>
                )}

                {cleanLaunchLabel && (
                  <span className="rounded-full bg-[#8D4F23] px-3 py-0.5 text-xs font-bold text-white">
                    {cleanLaunchLabel}
                  </span>
                )}
              </div>

              <p className="text-[11px] text-[#6E5D52] font-medium">
                Inclusive of all taxes · 100% Free Doorstep Delivery
              </p>

              {/* Premium Kerala Free Delivery Banner */}
              <div className="rounded-xl bg-[#FAF5ED] border border-[#DECBB5] p-3 text-xs text-[#3B2418] flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#633719]/10 flex items-center justify-center text-[#633719] shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-extrabold text-[#3B2418]">Free Doorstep Delivery Across Kerala</p>
                    <p className="text-[11px] text-[#6E5D52]">Doorstep delivery to all 14 districts in 3–5 days</p>
                  </div>
                </div>
                <span className="text-[11px] font-black text-emerald-800 bg-emerald-100/80 border border-emerald-200 px-2.5 py-1 rounded-md shrink-0">
                  ₹0 Shipping
                </span>
              </div>

              {product.slug === settings.featured_product_slug && (
                <div className="pt-1">
                  <CountdownTimer
                    endDateIso={settings.promo_countdown_end}
                    cycleHours={settings.promo_countdown_hours}
                  />
                </div>
              )}
            </div>

            {/* Short Description */}
            <p className="text-sm leading-relaxed opacity-90">
              {product.description}
            </p>

            {/* Dimensions Chip (Surfaced above fold) */}
            {product.dimensions && (
              <div className="inline-flex items-center gap-2 rounded-xl bg-[#FAF0E4] border border-[#DECBB5] px-3.5 py-2 text-xs text-[#3B2418] shadow-2xs">
                <span className="font-bold text-[#633719]">📐 Dimensions:</span>
                <span className="font-semibold">{product.dimensions}</span>
              </div>
            )}

            {/* Key Features */}
            {product.features && product.features.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.features.map((feat) => (
                  <div
                    key={feat}
                    className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-semibold ${
                      isPremium
                        ? "bg-[#2C1B12] border-[#C58B45]/20 text-[#EFE3D4]"
                        : "bg-white border-[#EFE3D4] text-[#29221D]"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#C58B45] shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Variants Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#C58B45]">
                  Configuration / Finish
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`rounded-xl border px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                        selectedVariant?.id === variant.id
                          ? "bg-[#633719] text-white border-[#633719]"
                          : "bg-white text-[#29221D] border-[#DFCBB3]"
                      }`}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Streamlined Quantity & Order CTAs */}
            {!product.request_quote_only && !isPremium ? (
              <div className="space-y-3 pt-1">
                {/* Primary Row: Compact Quantity + Punchy Order Now Button */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-xl border border-[#D8C7B4] bg-white h-12 shrink-0 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 h-full text-[#29221D] hover:bg-[#FAF5ED] rounded-l-xl transition flex items-center justify-center cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-7 text-center text-sm font-extrabold text-[#29221D]">{quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((q) => Math.min(product.stock_quantity || 25, q + 1))
                      }
                      className="px-3 h-full text-[#29221D] hover:bg-[#FAF5ED] rounded-r-xl transition flex items-center justify-center cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleOrderNow}
                    className="flex-1 h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-[#633719] px-6 text-base font-bold text-white hover:bg-[#3B2418] active:scale-[0.99] transition shadow-card cursor-pointer"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Order Now</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>

                {/* Secondary Row: 50/50 Split Add to Cart & Official WhatsApp */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="h-11 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#633719] bg-white px-4 text-xs sm:text-sm font-bold text-[#633719] hover:bg-[#EFE3D4]/50 active:scale-[0.99] transition cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>

                  <a
                    href={whatsAppHref}
                    target="_blank"
                    rel="noreferrer"
                    className="h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 text-xs sm:text-sm font-bold shadow-soft active:scale-[0.99] transition cursor-pointer"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    <span>Ask on WhatsApp</span>
                  </a>
                </div>

                {/* 3-Point Trust & Guarantee Strip */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#DECBB5]/60 text-center">
                  <div className="p-2 rounded-lg bg-white/70 border border-[#E5D5C3]">
                    <ShieldCheck className="w-4 h-4 text-[#633719] mx-auto mb-1" />
                    <p className="text-[11px] font-bold text-[#3B2418]">Transit Damage</p>
                    <p className="text-[10px] text-[#6E5D52]">Free Replacement</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/70 border border-[#E5D5C3]">
                    <Wrench className="w-4 h-4 text-[#633719] mx-auto mb-1" />
                    <p className="text-[11px] font-bold text-[#3B2418]">Easy Mount</p>
                    <p className="text-[10px] text-[#6E5D52]">Brackets Included</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/70 border border-[#E5D5C3]">
                    <Truck className="w-4 h-4 text-[#633719] mx-auto mb-1" />
                    <p className="text-[11px] font-bold text-[#3B2418]">All 14 Districts</p>
                    <p className="text-[10px] text-[#6E5D52]">Doorstep Delivery</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Premium Living / Custom Quote CTA */
              <div className="space-y-3 pt-2">
                <Link
                  href={`/premium/custom-enquiry?product=${encodeURIComponent(product.name)}&section=${product.store_section}`}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#C58B45] px-6 py-4 text-base font-extrabold text-[#24150E] hover:bg-[#DFA86A] transition shadow-card"
                >
                  <Wrench className="w-5 h-5" />
                  <span>Request a Custom Quote for This Piece</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href={whatsAppHref}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white px-6 py-3.5 text-sm font-bold shadow-soft transition"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>Consult Our Design Team on WhatsApp</span>
                </a>
              </div>
            )}

            {/* Specifications, Dimensions & Material Details */}
            <div
              className={`rounded-2xl border p-4 sm:p-5 space-y-4 ${
                isPremium
                  ? "bg-[#2C1B12] border-[#C58B45]/25"
                  : "bg-white border-[#EFE3D4]"
              }`}
            >
              <h2 className="text-base font-extrabold border-b border-current/10 pb-2.5">
                Specifications &amp; Construction Details
              </h2>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="rounded-xl bg-black/5 p-3">
                  <dt className="font-semibold opacity-70">Dimensions</dt>
                  <dd className="font-bold mt-0.5">
                    {product.dimensions || (
                      <span className="italic opacity-75">
                        Standard Manufacturer Dimensions
                      </span>
                    )}
                  </dd>
                </div>

                <div className="rounded-xl bg-black/5 p-3">
                  <dt className="font-semibold opacity-70">Material &amp; Finish</dt>
                  <dd className="font-bold mt-0.5">
                    {product.material || (
                      <span className="italic opacity-75">
                        Solid Hardwood / Engineered Timber
                      </span>
                    )}
                  </dd>
                </div>

                {Object.entries(product.specifications || {}).map(([key, val]) => (
                  <div key={key} className="rounded-xl bg-black/5 p-3 sm:col-span-2">
                    <dt className="font-semibold opacity-70">{key}</dt>
                    <dd className="font-bold mt-0.5">{val}</dd>
                  </div>
                ))}
              </dl>

              <div className="flex items-start gap-2.5 rounded-xl bg-[#C58B45]/10 border border-[#C58B45]/30 p-3 text-xs">
                <Info className="w-4 h-4 text-[#C58B45] shrink-0 mt-0.5" />
                <div>
                  <strong>Delivery Information:</strong> {product.delivery_info}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section id="reviews" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-current/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-[#3B2418]">Verified Customer Reviews</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1 text-[#C58B45]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#C58B45]" />
                ))}
              </div>
              <span className="text-xs font-bold text-[#6E5D52]">
                {reviewsList.length > 0
                  ? `${(reviewsList.reduce((acc, r) => acc + r.rating, 0) / reviewsList.length).toFixed(1)} out of 5 (${reviewsList.length} verified reviews)`
                  : "No customer reviews yet"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsReviewFormOpen((prev) => !prev);
              setReviewSuccess(false);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#633719] px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#3B2418] transition shadow-soft cursor-pointer self-start sm:self-auto"
          >
            <span>{isReviewFormOpen ? "Cancel Review" : "+ Write a Review"}</span>
          </button>
        </div>

        {/* Success Alert */}
        {reviewSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Thank you! Your review has been submitted and is displayed below.</span>
          </div>
        )}

        {/* Review Submission Form Modal / Collapsible */}
        {isReviewFormOpen && (
          <form
            onSubmit={handleReviewSubmit}
            className="mb-8 p-5 sm:p-6 rounded-2xl bg-white border border-[#E5D5C3] shadow-card space-y-4 max-w-2xl"
          >
            <h3 className="text-base font-bold text-[#3B2418]">Share Your Honest Experience</h3>

            {reviewError && (
              <p className="text-xs text-red-600 font-semibold">{reviewError}</p>
            )}

            <div>
              <label className="block text-xs font-bold text-[#6E5D52] uppercase tracking-wider mb-1.5">
                Your Rating
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 text-[#C58B45] hover:scale-110 transition cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= reviewRating ? "fill-[#C58B45]" : "text-[#D8C7B4]"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-[#633719] ml-2">
                  {reviewRating === 5
                    ? "Excellent (5/5)"
                    : reviewRating === 4
                    ? "Very Good (4/5)"
                    : reviewRating === 3
                    ? "Average (3/5)"
                    : "Needs Improvement"}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6E5D52] uppercase tracking-wider mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                placeholder="e.g. Rahul Menon"
                className="w-full rounded-xl border border-[#D8C7B4] bg-[#FAF5ED] px-3.5 py-2 text-sm text-[#29221D] focus:outline-none focus:ring-2 focus:ring-[#633719]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6E5D52] uppercase tracking-wider mb-1">
                Your Review / Experience *
              </label>
              <textarea
                required
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="How was the build quality, wood finish, packaging, and delivery experience?"
                className="w-full rounded-xl border border-[#D8C7B4] bg-[#FAF5ED] p-3 text-sm text-[#29221D] focus:outline-none focus:ring-2 focus:ring-[#633719]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsReviewFormOpen(false)}
                className="px-4 py-2 text-xs font-bold text-[#6E5D52] hover:bg-[#FAF5ED] rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingReview}
                className="inline-flex items-center gap-2 rounded-xl bg-[#633719] px-5 py-2 text-xs font-bold text-white hover:bg-[#3B2418] transition cursor-pointer disabled:opacity-50"
              >
                {isSubmittingReview ? "Submitting..." : "Post Review"}
              </button>
            </div>
          </form>
        )}

        {/* Reviews Grid */}
        {reviewsList.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-2xl bg-white/60 border border-[#DFCBB3] space-y-2">
            <p className="text-sm font-bold text-[#3B2418]">No customer reviews yet</p>
            <p className="text-xs text-[#6E5D52]">Be the first buyer to review this piece by clicking &quot;+ Write a Review&quot; above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {reviewsList.map((rev) => (
              <div
                key={rev.id}
                className="rounded-2xl bg-white border border-[#EFE3D4] p-5 shadow-soft space-y-2.5 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[#C58B45]">
                      {Array.from({ length: rev.rating }).map((_, idx) => (
                        <Star key={idx} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    {rev.verified_buyer && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-full">
                        ✓ Verified Buyer
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#29221D] leading-relaxed">{rev.comment}</p>
                </div>
                <div className="pt-2 border-t border-[#F0E4D5] flex items-center justify-between text-xs">
                  <span className="font-bold text-[#633719]">{rev.author_name}</span>
                  {rev.district ? (
                    <span className="text-[#8C7A6B]">{rev.district}</span>
                  ) : rev.created_at ? (
                    <span className="text-[#8C7A6B]">
                      {new Date(rev.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-current/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold">You May Also Like</h2>
            <Link
              href={isPremium ? "/premium" : `/${product.category_slug}`}
              className="text-xs sm:text-sm font-bold text-[#C58B45] hover:underline"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 items-stretch">
            {relatedProducts.slice(0, 4).map((rel) => (
              <ProductCard
                key={rel.id}
                product={rel}
                variant={isPremium ? "PREMIUM" : "EVERYDAY"}
              />
            ))}
          </div>
        </section>
      )}

      {/* Sticky Mobile Order Now CTA Bar (Without WhatsApp Icon) */}
      {!product.request_quote_only && !isPremium && (
        <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-[#FAF5ED]/95 backdrop-blur-md border-t border-[#DECAB2] px-4 py-2.5 shadow-elevated flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#6E5D52] truncate max-w-[150px] sm:max-w-[200px]">
              {product.name}
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-[#4B2913]">
                {formatPaiseToINR(effectivePricePaise * quantity)}
              </span>
              {discountPercent > 0 && (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                  {discountPercent}% OFF
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleOrderNow}
            className="h-11 inline-flex items-center gap-2 rounded-xl bg-[#633719] px-6 text-sm font-bold text-white shadow-card active:scale-[0.98] transition cursor-pointer shrink-0"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Order Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
