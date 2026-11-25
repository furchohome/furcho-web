"use client";

import React, { useEffect, useState } from "react";
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
  MessageCircle,
  Star,
  Info,
} from "lucide-react";
import { Product, SiteSettings } from "@/types/database";
import { buildWhatsAppLink, formatPaiseToINR } from "@/lib/utils";
import { useCart } from "@/components/providers/CartProvider";
import { CountdownTimer } from "./CountdownTimer";
import { ProductCard } from "./ProductCard";
import { trackMetaEvent } from "@/components/tracking/MetaPixel";

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

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants[0]?.id || null
  );
  const [quantity, setQuantity] = useState(1);

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) || product.variants[0] || null;
  const effectivePricePaise =
    selectedVariant?.price_override_paise ?? product.selling_price_paise;

  useEffect(() => {
    trackMetaEvent("ViewContent", {
      content_name: product.name,
      content_ids: [product.sku],
      content_type: "product",
      value: Math.round(effectivePricePaise / 100),
      currency: "INR",
    });
  }, [product, effectivePricePaise]);

  const handleAddToCart = () => {
    addItem(product, quantity, selectedVariant);
  };

  const handleOrderNow = () => {
    addItem(product, quantity, selectedVariant);
    router.push("/checkout");
  };

  const whatsAppHref = buildWhatsAppLink(
    settings.whatsapp_number,
    `Hi Furcho Team, I would like to enquire about "${product.name}" (SKU: ${product.sku}) priced at ${formatPaiseToINR(effectivePricePaise)}.`
  );

  return (
    <div
      className={`pb-24 lg:pb-16 ${
        isPremium ? "bg-[#24150E] text-[#FAF5ED]" : "bg-[#FAF5ED] text-[#29221D]"
      }`}
    >
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-3 text-xs flex flex-wrap items-center gap-2 opacity-80">
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
        <span className="font-semibold text-[#C58B45]">{product.name}</span>
      </div>

      {/* Main Product Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Product Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div
              className={`relative overflow-hidden rounded-3xl border shadow-card ${
                isPremium
                  ? "bg-[#1A0F0A] border-[#C58B45]/30"
                  : "bg-[#EFE3D4] border-[#DFCBB3]"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[selectedImageIdx]?.image_url || images[0].image_url}
                alt={images[selectedImageIdx]?.alt_text || product.name}
                className="w-full h-auto max-h-[500px] object-contain mx-auto"
              />
              {images[selectedImageIdx]?.view_label && (
                <span className="absolute bottom-4 left-4 rounded-full bg-[#3B2418]/85 backdrop-blur-xs px-3.5 py-1 text-xs font-semibold text-[#FAF5ED]">
                  {images[selectedImageIdx].view_label}
                </span>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`relative overflow-hidden rounded-2xl border-2 aspect-[4/3] transition ${
                      selectedImageIdx === idx
                        ? "border-[#633719] ring-2 ring-[#C58B45]/50"
                        : "border-transparent opacity-75 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.image_url}
                      alt={img.alt_text}
                      className="h-full w-full object-cover bg-[#EFE3D4]"
                    />
                    {img.view_label && (
                      <span className="absolute bottom-0 inset-x-0 bg-[#3B2418]/80 text-[9px] text-white py-0.5 truncate px-1">
                        {img.view_label}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info, Pricing, Variants & CTA */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#633719]/15 border border-[#C58B45]/40 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#C58B45]">
                  {product.store_section === "PREMIUM" ? "Premium Living" : "Everyday Living"}
                </span>
                {product.is_bestseller && (
                  <span className="rounded-full bg-[#8D4F23] px-3 py-1 text-xs font-bold text-white">
                    Bestseller
                  </span>
                )}
                {product.is_demo_data && (
                  <span className="rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-semibold text-amber-900">
                    Demonstration Catalogue Record
                  </span>
                )}
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    product.availability_status === "OUT_OF_STOCK"
                      ? "bg-red-100 text-red-800"
                      : "bg-emerald-100 text-emerald-900"
                  }`}
                >
                  {product.availability_status === "IN_STOCK"
                    ? "In Stock — Ready for Order Request"
                    : product.availability_status === "MADE_TO_ORDER"
                    ? "Made to Order (Bespoke)"
                    : product.availability_status}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight">
                {product.name}
              </h1>
              <p className="text-xs opacity-70">SKU: {product.sku}</p>
            </div>

            {/* Price Block */}
            <div
              className={`rounded-2xl border p-5 space-y-3 ${
                isPremium
                  ? "bg-[#2C1B12] border-[#C58B45]/30"
                  : "bg-[#F4ECE1] border-[#E4D3BE]"
              }`}
            >
              <div className="flex flex-wrap items-baseline gap-3">
                <span
                  className={`text-3xl sm:text-4xl font-black ${
                    isPremium ? "text-[#C58B45]" : "text-[#4B2913]"
                  }`}
                >
                  {formatPaiseToINR(effectivePricePaise)}
                </span>
                {product.launch_price_label && (
                  <span className="rounded-full bg-[#8D4F23] px-3 py-1 text-xs font-bold text-white">
                    {product.launch_price_label}
                  </span>
                )}
                {product.original_price_paise &&
                  product.original_price_paise > effectivePricePaise && (
                    <span className="text-base opacity-60 line-through">
                      {formatPaiseToINR(product.original_price_paise)}
                    </span>
                  )}
              </div>

              <div className="rounded-xl bg-[#EBF5ED] border border-[#C3E4CB] p-2.5 text-xs text-[#1F513B] flex items-center gap-2 font-semibold">
                <Truck className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                <span>
                  <strong className="font-extrabold text-[#2D6A4F]">FREE SHIPPING:</strong> 100% Free Doorstep Delivery across Kerala.
                </span>
              </div>

              {product.slug === settings.featured_product_slug && (
                <div className="pt-1">
                  <CountdownTimer endDateIso={settings.promo_countdown_end} />
                </div>
              )}
            </div>

            {/* Short Description */}
            <p className="text-sm sm:text-base leading-relaxed opacity-90">
              {product.description}
            </p>

            {/* Key Features */}
            {product.features && product.features.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {product.features.map((feat) => (
                  <div
                    key={feat}
                    className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm font-semibold ${
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
                      className={`rounded-xl border px-4 py-2 text-xs font-semibold transition ${
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

            {/* Quantity & Order CTAs */}
            {!product.request_quote_only && !isPremium ? (
              <div className="space-y-4 pt-2">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center rounded-xl border border-[#D8C7B4] bg-white">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-3 text-[#29221D] hover:bg-[#FAF5ED] rounded-l-xl transition"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-5 text-sm font-extrabold text-[#29221D]">{quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((q) => Math.min(product.stock_quantity || 25, q + 1))
                      }
                      className="p-3 text-[#29221D] hover:bg-[#FAF5ED] rounded-r-xl transition"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleOrderNow}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#633719] px-6 py-3.5 text-sm sm:text-base font-bold text-white hover:bg-[#3B2418] transition shadow-card cursor-pointer"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Order Now — {formatPaiseToINR(effectivePricePaise * quantity)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#633719] bg-white px-5 py-3 text-sm font-bold text-[#633719] hover:bg-[#EFE3D4]/60 transition cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>

                  <a
                    href={whatsAppHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-700/30 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-900 hover:bg-emerald-100 transition"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-700" />
                    Ask on WhatsApp
                  </a>
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
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#C58B45]/40 bg-[#3B2418] px-6 py-3 text-sm font-semibold text-[#FAF5ED] hover:bg-[#633719] transition"
                >
                  <MessageCircle className="w-4 h-4 text-[#C58B45]" />
                  Consult Our Design Team on WhatsApp
                </a>
              </div>
            )}

            {/* Specifications, Dimensions, Material & Delivery Table */}
            <div
              className={`rounded-2xl border p-5 space-y-4 ${
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
                    {product.dimensions ? (
                      product.dimensions
                    ) : (
                      <span className="italic opacity-75">
                        Confirmed upon enquiry / Updated by Admin
                      </span>
                    )}
                  </dd>
                </div>

                <div className="rounded-xl bg-black/5 p-3">
                  <dt className="font-semibold opacity-70">Material &amp; Finish</dt>
                  <dd className="font-bold mt-0.5">
                    {product.material ? (
                      product.material
                    ) : (
                      <span className="italic opacity-75">
                        Confirmed upon enquiry / Updated by Admin
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

      {/* Genuine Customer Reviews Section (Strictly rendered ONLY when genuine reviews exist) */}
      {product.reviews && product.reviews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="text-2xl font-extrabold mb-6">Verified Customer Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {product.reviews.map((rev) => (
              <div
                key={rev.id}
                className="rounded-2xl bg-white border border-[#EFE3D4] p-5 shadow-soft space-y-2"
              >
                <div className="flex items-center gap-1 text-[#C58B45]">
                  {Array.from({ length: rev.rating }).map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-[#29221D]">{rev.comment}</p>
                <p className="text-xs font-bold text-[#633719]">
                  {rev.author_name} — {rev.district}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
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

      {/* Sticky Mobile Order Now CTA Bar (Specifically required on the Ironing Table & Everyday product pages) */}
      {!product.request_quote_only && !isPremium && (
        <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-[#FAF5ED]/95 backdrop-blur-md border-t border-[#DECAB2] px-4 py-3 shadow-elevated flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-[#6E5D52] truncate max-w-[160px]">
              {product.name}
            </p>
            <p className="text-lg font-black text-[#4B2913]">
              {formatPaiseToINR(effectivePricePaise * quantity)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleOrderNow}
            className="inline-flex items-center gap-2 rounded-xl bg-[#633719] px-5 py-3 text-sm font-bold text-white shadow-card"
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
