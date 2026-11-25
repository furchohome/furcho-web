import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Hammer, Compass, MapPin, ArrowRight } from "lucide-react";
import { getSiteSettings } from "@/lib/db";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";

export const metadata: Metadata = {
  title: "About FURCHO® — Thoughtful Furniture & Smart Home Solutions in Kerala",
  description:
    "Learn about FURCHO, a furniture and home-living brand based in Kerala, India offering Everyday Living space-saving essentials and Premium Living bespoke solid wood furniture.",
};

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF5ED]">
      <Header settings={settings} variant="EVERYDAY" />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        <div className="text-center space-y-4">
          <span className="rounded-full bg-[#EFE0CC] border border-[#DEC7AC] px-4 py-1 text-xs font-extrabold uppercase tracking-widest text-[#8A5424]">
            OUR STORY • KERALA, INDIA
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#3B2418] leading-tight">
            FURNITURE FOR A BETTER LIVING
          </h1>
          <p className="text-base sm:text-lg text-[#5A4638] max-w-2xl mx-auto leading-relaxed">
            Based in Kerala, <strong>FURCHO®</strong> was born from a clear vision: thoughtful
            furniture and smart home solutions should be accessible both for compact everyday living
            and for timeless, architectural luxury spaces.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-3xl bg-white border border-[#EFE3D4] p-8 shadow-soft space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#8A5424]">
              01 • EVERYDAY LIVING
            </span>
            <h2 className="text-2xl font-extrabold text-[#29221D]">
              Practical, Space-Saving Home Essentials
            </h2>
            <p className="text-sm text-[#5A4638] leading-relaxed">
              Starting with our flagship <strong>Foldable Wall-Mounted Ironing Table</strong>, our
              Everyday Living division serves young couples, apartments, and families across Kerala
              looking for smart space-saving accessories, kitchen organizers, and budget bedroom
              furniture without compromising durability.
            </p>
            <Link
              href="/products/foldable-wall-mounted-ironing-table"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#633719] hover:underline"
            >
              <span>Explore Everyday Living</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="rounded-3xl bg-[#3B2418] text-[#FAF5ED] border border-[#C58B45]/40 p-8 shadow-card space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#C58B45]">
              02 • PREMIUM LIVING
            </span>
            <h2 className="text-2xl font-extrabold text-white">
              Heirloom Solid Wood &amp; Commercial Hospitality
            </h2>
            <p className="text-sm text-[#EFE3D4] leading-relaxed">
              Our Premium Living studio partners with homeowners, architects, cafés, restaurants,
              hotels, and resorts across Kerala to craft solid wood bedroom suites, cane-weave
              dining tables, and custom commercial installations.
            </p>
            <Link
              href="/premium"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#C58B45] hover:underline"
            >
              <span>Enter Premium Living Showroom</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-[#F4ECE1] border border-[#E4D3BE] p-6 space-y-2">
            <Hammer className="w-6 h-6 text-[#633719]" />
            <h3 className="text-base font-extrabold text-[#29221D]">Kerala Craftsmanship</h3>
            <p className="text-xs text-[#5A4638] leading-relaxed">
              Built by experienced woodworkers and metal fabricators tailored for Kerala&apos;s
              climate and architectural styles.
            </p>
          </div>

          <div className="rounded-2xl bg-[#F4ECE1] border border-[#E4D3BE] p-6 space-y-2">
            <Compass className="w-6 h-6 text-[#633719]" />
            <h3 className="text-base font-extrabold text-[#29221D]">Honest Specifications</h3>
            <p className="text-xs text-[#5A4638] leading-relaxed">
              Transparent pricing, verified order request confirmations, and custom quotation
              support before you commit.
            </p>
          </div>

          <div className="rounded-2xl bg-[#F4ECE1] border border-[#E4D3BE] p-6 space-y-2">
            <MapPin className="w-6 h-6 text-[#633719]" />
            <h3 className="text-base font-extrabold text-[#29221D]">Statewide Delivery</h3>
            <p className="text-xs text-[#5A4638] leading-relaxed">
              Serving all 14 districts from Kasaragod and Kozhikode to Kochi and
              Thiruvananthapuram.
            </p>
          </div>
        </div>
      </main>

      <Footer settings={settings} variant="EVERYDAY" />
    </div>
  );
}
