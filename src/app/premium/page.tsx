import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Crown,
  ArrowRight,
  ArrowUpRight,
  Compass,
  Building2,
  Hammer,
  Sparkles,
} from "lucide-react";
import { getBanners, getCategories, getProducts, getSiteSettings } from "@/lib/db";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { ProductCard } from "@/components/storefront/ProductCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Premium Living — Crafted Solid Wood & Bespoke Luxury Furniture",
  description:
    "Furcho Premium Living offers bespoke solid wood bedroom suites, heirloom dining tables, sit-out chairs, and commercial hospitality furniture for restaurants, cafes, hotels and resorts across Kerala.",
};

export default async function PremiumHomePage() {
  const [settings, premiumCategories, premiumProducts, allBanners] = await Promise.all([
    getSiteSettings(),
    getCategories("PREMIUM"),
    getProducts({ section: "PREMIUM" }),
    getBanners(),
  ]);

  const commercialBanner = allBanners.find(
    (b) => (b.placement === "COMMERCIAL_PROMO" || b.id === "ban-commercial-promo") && b.is_active !== false
  );

  const premiumHeroBanner = allBanners.find(
    (b) => (b.placement === "HERO" && b.store_section === "PREMIUM") || b.placement === "PREMIUM_PROMO"
  );

  const signatureProduct =
    premiumProducts.find((p) => p.slug === "malabar-heritage-6-seater-dining-collection") ||
    premiumProducts[0];

  const premiumHeroImage =
    premiumHeroBanner?.image_url ||
    signatureProduct?.images?.[0]?.image_url ||
    "/images/banners/premium-dining-hero.jpg";

  const getPremiumRoute = (slug: string) => {
    if (slug.includes("bedroom")) return "/premium/bedroom";
    if (slug.includes("dining")) return "/premium/dining";
    if (slug.includes("sit-out")) return "/premium/sit-out";
    return "/premium/custom-enquiry";
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#24150E] text-[#FAF5ED]">
      <Header settings={settings} variant="PREMIUM" />

      <main className="flex-1">
        {/* Editorial Hero Section */}
        <section className="relative overflow-hidden border-b border-[#C58B45]/25 bg-gradient-to-br from-[#1A0F0A] via-[#24150E] to-[#3B2418]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#C58B45]/15 border border-[#C58B45]/40 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#C58B45]">
                <Crown className="w-4 h-4" />
                <span>FURCHO PREMIUM LIVING</span>
              </div>

              <h1 className="font-heading text-3xl sm:text-5xl lg:text-[52px] font-bold text-[#FAF5ED] leading-[1.15]">
                Heirloom Solid Wood &amp; Bespoke Architectural Furniture
              </h1>

              <p className="text-base sm:text-lg text-[#E2D1BC] leading-relaxed max-w-xl">
                Handcrafted in Kerala for luxury residences, heritage villas, boutique resorts, fine
                dining restaurants and architectural spaces. Built to custom dimensions and timber
                specifications.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/premium/custom-enquiry?section=PREMIUM"
                  className="inline-flex items-center gap-2.5 rounded-full bg-[#C58B45] px-7 py-4 text-sm sm:text-base font-extrabold text-[#24150E] hover:bg-[#DFA86A] transition shadow-elevated"
                >
                  <span>Commission a Custom Project</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/premium/dining"
                  className="inline-flex items-center gap-2 rounded-full border border-[#C58B45]/50 bg-[#3B2418]/50 px-6 py-4 text-sm sm:text-base font-bold text-[#FAF5ED] hover:bg-[#C58B45]/20 transition"
                >
                  <span>Explore Dining Suites</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative overflow-hidden rounded-3xl border border-[#C58B45]/40 shadow-elevated bg-[#1A0F0A]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={premiumHeroImage}
                  alt={premiumHeroBanner?.title || signatureProduct?.name || "Furcho Premium Solid Wood Dining Collection"}
                  className="w-full h-[340px] sm:h-[420px] object-cover"
                />
                <div className="bg-[#1A0F0A]/90 backdrop-blur-md p-4 sm:p-5 border-t border-[#C58B45]/25 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#C58B45] font-bold">
                      SIGNATURE COMMISSION
                    </p>
                    <p className="text-sm sm:text-base font-bold text-[#FAF5ED]">
                      Malabar Heritage Solid Wood &amp; Rattan Cane Dining Suite
                    </p>
                  </div>
                  <Link
                    href="/products/malabar-heritage-6-seater-dining-collection"
                    className="shrink-0 rounded-full bg-[#C58B45]/20 border border-[#C58B45]/40 px-4 py-2 text-xs font-bold text-[#C58B45] hover:bg-[#C58B45] hover:text-[#24150E] transition"
                  >
                    Request Quote →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Premium Curated Divisions */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#C58B45]">
                CURATED COLLECTIONS
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#FAF5ED] mt-1">
                Explore Premium Living Spaces
              </h2>
            </div>
            <Link
              href="/premium/custom-enquiry?section=PREMIUM"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#C58B45] hover:underline"
            >
              <span>Consult Our Interior &amp; Joinery Architects</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {premiumCategories.map((cat) => (
              <Link
                key={cat.id}
                href={getPremiumRoute(cat.slug)}
                className="group relative flex flex-col overflow-hidden rounded-3xl bg-[#2C1B12] border border-[#C58B45]/30 hover:border-[#C58B45] transition-all duration-300 shadow-card"
              >
                <div className="h-56 w-full overflow-hidden bg-[#1A0F0A]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#C58B45]">
                      PREMIUM {cat.name.toUpperCase()}
                    </span>
                    <h3 className="text-xl font-extrabold text-[#FAF5ED] mt-1 group-hover:text-[#C58B45] transition">
                      {cat.name} Collection
                    </h3>
                    <p className="text-xs sm:text-sm text-[#E2D1BC]/85 mt-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs font-bold text-[#C58B45]">
                    <span>Explore &amp; Request Quote</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Showcase Pieces */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-[#C58B45]/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#C58B45]">
                BESPOKE COMMISSIONS
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#FAF5ED] mt-1">
                Featured Premium Furniture
              </h2>
            </div>
            <span className="text-xs text-[#E2D1BC]/80">
              All Premium Living creations follow a tailored Custom Quotation workflow.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {premiumProducts.map((product) => (
              <ProductCard key={product.id} product={product} variant="PREMIUM" />
            ))}
          </div>
        </section>

        {/* Commercial Hospitality & Custom Architecture Pillars */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="rounded-3xl bg-gradient-to-r from-[#2C1B12] via-[#3B2418] to-[#2C1B12] border border-[#C58B45]/35 p-8 sm:p-12 shadow-elevated">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C58B45]">
                  <Sparkles className="w-4 h-4" />
                  <span>B2B &amp; RESIDENTIAL BESPOKE SOLUTIONS</span>
                </div>
                <h2 className="font-heading text-2xl sm:text-4xl font-bold text-[#FAF5ED]">
                  Built for Luxury Homes, Restaurants, Cafés, Hotels &amp; Resorts
                </h2>
                <p className="text-sm sm:text-base text-[#E2D1BC] leading-relaxed">
                  From single heirloom dining tables to complete 100-seater restaurant and resort
                  furniture rollouts, Furcho provides end-to-end timber selection, CAD dimensions,
                  finish sampling, and formal project quotations.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="rounded-2xl bg-[#1A0F0A]/70 border border-[#C58B45]/25 p-4">
                    <Compass className="w-5 h-5 text-[#C58B45] mb-2" />
                    <h3 className="text-sm font-bold">Custom Dimensions</h3>
                    <p className="text-xs text-[#E2D1BC]/80 mt-1">
                      Built to fit your exact architectural floor plan.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#1A0F0A]/70 border border-[#C58B45]/25 p-4">
                    <Hammer className="w-5 h-5 text-[#C58B45] mb-2" />
                    <h3 className="text-sm font-bold">Timber &amp; Finish Choice</h3>
                    <p className="text-xs text-[#E2D1BC]/80 mt-1">
                      Kiln-dried Teak, Rosewood, Walnut &amp; natural cane.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#1A0F0A]/70 border border-[#C58B45]/25 p-4">
                    <Building2 className="w-5 h-5 text-[#C58B45] mb-2" />
                    <h3 className="text-sm font-bold">Hospitality Projects</h3>
                    <p className="text-xs text-[#E2D1BC]/80 mt-1">
                      Commercial-grade durability for cafés &amp; resorts.
                    </p>
                  </div>
                </div>

                <div className="pt-3">
                  <Link
                    href="/premium/custom-enquiry?section=PREMIUM"
                    className="inline-flex items-center gap-2 rounded-full bg-[#C58B45] px-7 py-3.5 text-sm font-extrabold text-[#24150E] hover:bg-[#DFA86A] transition"
                  >
                    <span>Start Your Custom Enquiry</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="overflow-hidden rounded-2xl border border-[#C58B45]/40 shadow-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={commercialBanner?.image_url || "/images/banners/commercial-restaurant.jpg"}
                    alt={commercialBanner?.title || "Furcho Hospitality & Restaurant Furniture"}
                    className="w-full h-72 object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer settings={settings} variant="PREMIUM" />
    </div>
  );
}
