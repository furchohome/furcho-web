"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, ArrowUpRight, ChevronDown } from "lucide-react";
import { SiteSettings } from "@/types/database";

export function Footer({
  settings,
  variant = "EVERYDAY",
}: {
  settings: SiteSettings;
  variant?: "EVERYDAY" | "PREMIUM";
}) {
  const isPremium = variant === "PREMIUM";
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <footer
      className={`border-t ${
        isPremium
          ? "bg-[#1A0F0A] text-[#EFE3D4] border-[#C58B45]/20"
          : "bg-[#3B2418] text-[#FAF5ED] border-[#633719]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {/* =========================================================================
            DESKTOP FOOTER (hidden on mobile, visible on md: & lg:)
            ========================================================================= */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#FAF5ED] border border-[#C58B45]/40 p-1 shadow-soft">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="FURCHO Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-2xl font-black tracking-wider text-white">FURCHO®</span>
                <p className="text-[10px] tracking-[0.18em] uppercase text-[#C58B45]">
                  FURNITURE FOR A BETTER LIVING
                </p>
              </div>
            </div>

            <p className="text-sm text-[#E2D1BC] leading-relaxed max-w-sm">
              {settings.footer_tagline}
            </p>

            <div className="space-y-2 text-xs text-[#E2D1BC] pt-1">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C58B45] shrink-0 mt-0.5" />
                <span>{settings.address_line}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C58B45] shrink-0" />
                <span>{settings.support_phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C58B45] shrink-0" />
                <span>{settings.support_email}</span>
              </div>
            </div>
          </div>

          {/* Everyday Living Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#C58B45] mb-4">
              Everyday Living
            </h3>
            <ul className="space-y-2.5 text-sm text-[#EFE3D4]">
              <li>
                <Link
                  href="/products/foldable-wall-mounted-ironing-table"
                  className="hover:text-[#C58B45] transition"
                >
                  Foldable Ironing Table
                </Link>
              </li>
              <li>
                <Link href="/kitchen" className="hover:text-[#C58B45] transition">
                  Kitchen Furniture
                </Link>
              </li>
              <li>
                <Link href="/bedroom" className="hover:text-[#C58B45] transition">
                  Bedroom Essentials
                </Link>
              </li>
              <li>
                <Link href="/home-accessories" className="hover:text-[#C58B45] transition">
                  Home Accessories
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-[#C58B45] transition">
                  Shopping Cart &amp; Checkout
                </Link>
              </li>
            </ul>
          </div>

          {/* Premium Living Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#C58B45] mb-4">
              Premium Living
            </h3>
            <ul className="space-y-2.5 text-sm text-[#EFE3D4]">
              <li>
                <Link
                  href="/premium"
                  className="inline-flex items-center gap-1 hover:text-[#C58B45] transition"
                >
                  Premium Showroom
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#C58B45]" />
                </Link>
              </li>
              <li>
                <Link href="/premium/bedroom" className="hover:text-[#C58B45] transition">
                  Solid Wood Bedroom
                </Link>
              </li>
              <li>
                <Link href="/premium/dining" className="hover:text-[#C58B45] transition">
                  Bespoke Dining Suites
                </Link>
              </li>
              <li>
                <Link href="/premium/sit-out" className="hover:text-[#C58B45] transition">
                  Sit-out &amp; Verandah
                </Link>
              </li>
              <li>
                <Link href="/premium/custom-enquiry" className="hover:text-[#C58B45] transition">
                  Custom Project Enquiry
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Policies */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#C58B45] mb-4">
              Support &amp; Policies
            </h3>
            <ul className="space-y-2.5 text-sm text-[#EFE3D4]">
              <li>
                <Link href="/about" className="hover:text-[#C58B45] transition">
                  About Furcho Kerala
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#C58B45] transition">
                  Contact &amp; Showrooms
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-[#C58B45] transition">
                  Shipping &amp; Delivery Policy
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="hover:text-[#C58B45] transition">
                  Return &amp; Warranty Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-[#C58B45] transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#C58B45] transition">
                  Terms &amp; Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* =========================================================================
            MOBILE FOOTER (Visible on md:hidden) - COLLAPSIBLE ACCORDION DROPDOWNS
            ========================================================================= */}
        <div className="block md:hidden space-y-6">
          {/* Brand Info Block */}
          <div className="space-y-3 pb-2">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#FAF5ED] border border-[#C58B45]/40 p-1 shadow-soft">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="FURCHO Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-2xl font-black tracking-wider text-white">FURCHO®</span>
                <p className="text-[10px] tracking-[0.18em] uppercase text-[#C58B45]">
                  FURNITURE FOR A BETTER LIVING
                </p>
              </div>
            </div>

            <p className="text-xs text-[#E2D1BC] leading-relaxed">
              {settings.footer_tagline}
            </p>

            <div className="space-y-1.5 text-xs text-[#E2D1BC] pt-1">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#C58B45] shrink-0 mt-0.5" />
                <span>{settings.address_line}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#C58B45] shrink-0" />
                <span>{settings.support_phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#C58B45] shrink-0" />
                <span>{settings.support_email}</span>
              </div>
            </div>
          </div>

          {/* Dropdown Accordions */}
          <div className="border-t border-white/15 divide-y divide-white/10">
            {/* 1. Everyday Living Dropdown */}
            <div className="py-2.5">
              <button
                type="button"
                onClick={() => toggleSection("everyday")}
                className="w-full flex items-center justify-between py-2 text-left cursor-pointer"
                aria-expanded={Boolean(openSections.everyday)}
              >
                <span className="text-xs font-bold uppercase tracking-wider text-[#C58B45]">
                  Everyday Living
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#C58B45] transition-transform duration-200 ${
                    openSections.everyday ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openSections.everyday && (
                <ul className="pt-2 pb-3 pl-1 space-y-2.5 text-xs text-[#EFE3D4] animate-in fade-in-50 duration-200">
                  <li>
                    <Link
                      href="/products/foldable-wall-mounted-ironing-table"
                      className="hover:text-[#C58B45] block transition"
                    >
                      Foldable Ironing Table
                    </Link>
                  </li>
                  <li>
                    <Link href="/kitchen" className="hover:text-[#C58B45] block transition">
                      Kitchen Furniture
                    </Link>
                  </li>
                  <li>
                    <Link href="/bedroom" className="hover:text-[#C58B45] block transition">
                      Bedroom Essentials
                    </Link>
                  </li>
                  <li>
                    <Link href="/home-accessories" className="hover:text-[#C58B45] block transition">
                      Home Accessories
                    </Link>
                  </li>
                  <li>
                    <Link href="/cart" className="hover:text-[#C58B45] block transition">
                      Shopping Cart &amp; Checkout
                    </Link>
                  </li>
                </ul>
              )}
            </div>

            {/* 2. Premium Living Dropdown */}
            <div className="py-2.5">
              <button
                type="button"
                onClick={() => toggleSection("premium")}
                className="w-full flex items-center justify-between py-2 text-left cursor-pointer"
                aria-expanded={Boolean(openSections.premium)}
              >
                <span className="text-xs font-bold uppercase tracking-wider text-[#C58B45]">
                  Premium Living
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#C58B45] transition-transform duration-200 ${
                    openSections.premium ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openSections.premium && (
                <ul className="pt-2 pb-3 pl-1 space-y-2.5 text-xs text-[#EFE3D4] animate-in fade-in-50 duration-200">
                  <li>
                    <Link
                      href="/premium"
                      className="inline-flex items-center gap-1 hover:text-[#C58B45] transition"
                    >
                      Premium Showroom
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#C58B45]" />
                    </Link>
                  </li>
                  <li>
                    <Link href="/premium/bedroom" className="hover:text-[#C58B45] block transition">
                      Solid Wood Bedroom
                    </Link>
                  </li>
                  <li>
                    <Link href="/premium/dining" className="hover:text-[#C58B45] block transition">
                      Bespoke Dining Suites
                    </Link>
                  </li>
                  <li>
                    <Link href="/premium/sit-out" className="hover:text-[#C58B45] block transition">
                      Sit-out &amp; Verandah
                    </Link>
                  </li>
                  <li>
                    <Link href="/premium/custom-enquiry" className="hover:text-[#C58B45] block transition">
                      Custom Project Enquiry
                    </Link>
                  </li>
                </ul>
              )}
            </div>

            {/* 3. Support & Policies Dropdown */}
            <div className="py-2.5">
              <button
                type="button"
                onClick={() => toggleSection("support")}
                className="w-full flex items-center justify-between py-2 text-left cursor-pointer"
                aria-expanded={Boolean(openSections.support)}
              >
                <span className="text-xs font-bold uppercase tracking-wider text-[#C58B45]">
                  Support &amp; Policies
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#C58B45] transition-transform duration-200 ${
                    openSections.support ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openSections.support && (
                <ul className="pt-2 pb-3 pl-1 space-y-2.5 text-xs text-[#EFE3D4] animate-in fade-in-50 duration-200">
                  <li>
                    <Link href="/about" className="hover:text-[#C58B45] block transition">
                      About Furcho Kerala
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-[#C58B45] block transition">
                      Contact &amp; Showrooms
                    </Link>
                  </li>
                  <li>
                    <Link href="/shipping-policy" className="hover:text-[#C58B45] block transition">
                      Shipping &amp; Delivery Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/return-policy" className="hover:text-[#C58B45] block transition">
                      Return &amp; Warranty Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy-policy" className="hover:text-[#C58B45] block transition">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:text-[#C58B45] block transition">
                      Terms &amp; Conditions
                    </Link>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-10 lg:mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#E2D1BC]/80 text-center sm:text-left">
          <p>© {new Date().getFullYear()} FURCHO® (furcho.in) — Kerala, India. All rights reserved.</p>
          <p>Crafted for Everyday Living &amp; Bespoke Premium Interiors.</p>
        </div>
      </div>
    </footer>
  );
}
