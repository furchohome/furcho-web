"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Tag,
  Headset,
  Mail,
  HelpCircle,
  Search,
  User,
  ShoppingCart,
  ChevronDown,
  ArrowUpRight,
  Menu,
  X,
  Crown,
} from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { SiteSettings } from "@/types/database";

interface HeaderProps {
  settings: SiteSettings;
  variant?: "EVERYDAY" | "PREMIUM";
}

const EVERYDAY_NAV = [
  { label: "Home", href: "/" },
  {
    label: "Kitchen",
    href: "/kitchen",
    subcategories: [
      "Kitchen accessories",
      "Kitchen organizers",
      "Kitchen storage",
      "Small kitchen tables",
      "Wooden kitchen furniture",
    ],
  },
  {
    label: "Bedroom",
    href: "/bedroom",
    subcategories: [
      "Budget bedroom sets",
      "Beds",
      "Wardrobes",
      "Bedside tables",
      "Bedroom accessories",
    ],
  },
  {
    label: "Home Accessories",
    href: "/home-accessories",
    subcategories: [
      "Foldable ironing tables",
      "Space-saving products",
      "Home organizers",
      "Everyday home essentials",
    ],
  },
];

const PREMIUM_NAV = [
  { label: "Premium Home", href: "/premium" },
  { label: "Bedroom", href: "/premium/bedroom" },
  { label: "Dining", href: "/premium/dining" },
  { label: "Sit-out", href: "/premium/sit-out" },
  { label: "Custom Enquiry", href: "/premium/custom-enquiry" },
];

export function Header({ settings, variant = "EVERYDAY" }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, openCartDrawer } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(64);

  const isPremiumMode = variant === "PREMIUM" || pathname.startsWith("/premium");

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };
    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);
    return () => window.removeEventListener("resize", updateHeaderHeight);
  }, [settings.announcement_enabled, searchOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchOpen(false);
    router.push(`/home-accessories?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header ref={headerRef} className="sticky top-0 z-50 w-full">
      {/* 1. Top Announcement Bar (Configurable from Admin Dashboard) */}
      {settings.announcement_enabled && settings.announcement_text && (
        <div className="bg-[#3B2418] text-[#FAF5ED] text-xs py-2 px-4 border-b border-[#633719]/40">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-medium">
              <Tag className="w-3.5 h-3.5 text-[#C58B45] shrink-0" />
              <Link
                href={`/products/${settings.featured_product_slug || "foldable-wall-mounted-ironing-table"}`}
                className="hover:underline"
              >
                {settings.announcement_text}
              </Link>
              {settings.announcement_badge && (
                <>
                  <span className="text-[#C58B45]/60 hidden sm:inline">|</span>
                  <span className="text-[#E2D1BC] hidden sm:inline">
                    {settings.announcement_badge}
                  </span>
                </>
              )}
            </div>

            <div className="hidden md:flex items-center gap-4 text-[11px] text-[#EFE3D4]">
              <Link
                href="/contact"
                className="flex items-center gap-1.5 hover:text-white transition"
              >
                <Headset className="w-3.5 h-3.5 text-[#C58B45]" />
                Free Support
              </Link>
              <span className="text-[#C58B45]/40">|</span>
              <Link
                href="/premium/custom-enquiry"
                className="flex items-center gap-1.5 hover:text-white transition"
              >
                <Mail className="w-3.5 h-3.5 text-[#C58B45]" />
                Custom Enquiry
              </Link>
              <span className="text-[#C58B45]/40">|</span>
              <Link
                href="/about"
                className="flex items-center gap-1.5 hover:text-white transition"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#C58B45]" />
                Help
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Navigation Bar */}
      <div
        className={`transition-colors duration-200 border-b ${
          isPremiumMode
            ? "bg-[#24150E] text-[#FAF5ED] border-[#C58B45]/25"
            : "bg-[#FAF5ED]/95 backdrop-blur-md text-[#29221D] border-[#EFE3D4]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href={isPremiumMode ? "/premium" : "/"} className="flex items-center gap-2.5 group">
            <div
              className={`flex items-center justify-center w-11 h-11 rounded-xl border transition p-1 ${
                isPremiumMode
                  ? "bg-[#3B2418] border-[#C58B45]/50"
                  : "bg-[#EFE3D4]/80 border-[#C58B45]/40"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="FURCHO Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-start">
                <span
                  className={`text-2xl font-black tracking-wider leading-none ${
                    isPremiumMode ? "text-[#FAF5ED]" : "text-[#4B2913]"
                  }`}
                >
                  FURCHO
                </span>
                <span className="text-[10px] font-bold ml-0.5 -mt-0.5 text-[#C58B45]">®</span>
              </div>
              <span
                className={`text-[8.5px] font-semibold tracking-[0.16em] uppercase mt-0.5 ${
                  isPremiumMode ? "text-[#C58B45]" : "text-[#6E5D52]"
                }`}
              >
                FURNITURE FOR A BETTER LIVING
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          {!isPremiumMode ? (
            <nav className="hidden lg:flex items-center gap-7">
              {EVERYDAY_NAV.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <div
                    key={item.href}
                    className="relative"
                    onMouseEnter={() => item.subcategories && setOpenDropdown(item.label)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <Link
                      href={item.href}
                      className={`inline-flex items-center gap-1 py-2 text-sm font-semibold transition ${
                        isActive
                          ? "text-[#633719] underline decoration-[#C58B45] decoration-2 underline-offset-8"
                          : "text-[#29221D] hover:text-[#633719]"
                      }`}
                    >
                      {item.label}
                      {item.subcategories && (
                        <ChevronDown className="w-3.5 h-3.5 text-[#6E5D52] mt-0.5" />
                      )}
                    </Link>

                    {/* Subcategory Dropdown */}
                    {item.subcategories && openDropdown === item.label && (
                      <div className="absolute left-0 top-full pt-1 w-60 z-50">
                        <div className="rounded-2xl bg-white border border-[#EFE3D4] shadow-elevated p-2.5 space-y-1">
                          <Link
                            href={item.href}
                            className="block rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#633719] bg-[#FAF5ED] hover:bg-[#EFE3D4]/60 transition"
                          >
                            All {item.label} Collection →
                          </Link>
                          {item.subcategories.map((sub) => (
                            <Link
                              key={sub}
                              href={`${item.href}?sub=${encodeURIComponent(sub)}`}
                              className="block rounded-xl px-3 py-2 text-sm text-[#29221D] hover:bg-[#FAF5ED] hover:text-[#633719] transition"
                            >
                              {sub}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Visually Distinguishable Premium Living Link */}
              <Link
                href="/premium"
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#633719]/10 to-[#C58B45]/20 border border-[#C58B45]/50 px-4 py-1.5 text-sm font-bold text-[#633719] hover:bg-[#633719] hover:text-white transition shadow-2xs"
              >
                <Crown className="w-3.5 h-3.5 text-[#C58B45]" />
                Premium Living
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </nav>
          ) : (
            <nav className="hidden lg:flex items-center gap-6">
              {PREMIUM_NAV.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm font-semibold transition ${
                      isActive
                        ? "text-[#C58B45] underline decoration-[#C58B45] decoration-2 underline-offset-8"
                        : "text-[#EFE3D4] hover:text-[#C58B45]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#C58B45]/40 bg-[#FAF5ED]/10 px-4 py-1.5 text-xs font-semibold text-[#FAF5ED] hover:bg-[#C58B45] hover:text-[#24150E] transition"
              >
                ← Switch to Everyday Living
              </Link>
            </nav>
          )}

          {/* Right Utility Icons: Search, Account/Admin, Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setSearchOpen((prev) => !prev)}
              className={`p-2 rounded-xl transition ${
                isPremiumMode
                  ? "hover:bg-[#3B2418] text-[#EFE3D4]"
                  : "hover:bg-[#EFE3D4]/70 text-[#29221D]"
              }`}
              aria-label="Search furniture"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link
              href="/admin/dashboard"
              className={`p-2 rounded-xl transition ${
                isPremiumMode
                  ? "hover:bg-[#3B2418] text-[#EFE3D4]"
                  : "hover:bg-[#EFE3D4]/70 text-[#29221D]"
              }`}
              title="Admin & Account Portal"
              aria-label="Admin & Account Portal"
            >
              <User className="w-5 h-5" />
            </Link>

            <button
              type="button"
              onClick={openCartDrawer}
              className={`relative p-2 rounded-xl transition cursor-pointer ${
                isPremiumMode
                  ? "hover:bg-[#3B2418] text-[#EFE3D4]"
                  : "hover:bg-[#EFE3D4]/70 text-[#29221D]"
              }`}
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#633719] px-1 text-[10px] font-bold text-white shadow-xs border border-[#FAF5ED]">
                {totalItems}
              </span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className={`lg:hidden p-2 rounded-xl ${
                isPremiumMode ? "text-[#FAF5ED]" : "text-[#29221D]"
              }`}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Expandable Search Bar */}
        {searchOpen && (
          <div className="border-t border-[#EFE3D4] bg-white px-4 py-3 shadow-soft">
            <form
              onSubmit={handleSearchSubmit}
              className="max-w-3xl mx-auto flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-[#6E5D52]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Foldable Ironing Table, Kitchen Tables, Wardrobes, Bedside Tables..."
                className="flex-1 bg-transparent text-sm text-[#29221D] placeholder:text-[#6E5D52] focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="rounded-xl bg-[#633719] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#3B2418] transition"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          style={{ top: `${headerHeight}px`, height: `calc(100dvh - ${headerHeight}px)` }}
          className="lg:hidden fixed inset-x-0 bottom-0 bg-[#FAF5ED] z-50 flex flex-col justify-between px-5 pt-4 pb-6 overflow-y-auto shadow-elevated"
        >
          {/* Top Links Section */}
          <div className="space-y-4">
            {!isPremiumMode ? (
              // 1. Everyday Living Menu: Everyday links + 1 single Premium Gateway Card
              <>
                <div className="flex flex-col space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#6E5D52] px-2 pt-1">
                    Everyday Living
                  </p>
                  {EVERYDAY_NAV.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                          isActive
                            ? "bg-[#EFE3D4] text-[#3B2418] font-bold"
                            : "text-[#29221D] hover:bg-[#EFE3D4]/60"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>

                {/* Single Premium Living Gateway Card */}
                <div className="pt-3 border-t border-[#EFE3D4]">
                  <Link
                    href="/premium"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#2A1810] to-[#452817] p-4 text-white shadow-soft transition hover:opacity-95"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#E5B869] uppercase tracking-wider">
                        <Crown className="w-3.5 h-3.5" />
                        <span>Furcho Premium Living</span>
                      </div>
                      <p className="text-xs text-[#E8D6C3]">
                        Explore solid wood &amp; bespoke architectural furniture
                      </p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#C58B45]/20 text-[#E5B869] border border-[#C58B45]/40 shrink-0 ml-2">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </Link>
                </div>
              </>
            ) : (
              // 2. Premium Living Menu: ONLY Premium links + 1 single Everyday Gateway Link
              <>
                <div className="flex flex-col space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#C58B45] px-2 pt-1 flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5" />
                    <span>Premium Living Collection</span>
                  </p>
                  {PREMIUM_NAV.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                          isActive
                            ? "bg-[#EFE3D4] text-[#3B2418] font-bold"
                            : "text-[#29221D] hover:bg-[#EFE3D4]/60"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>

                {/* Single Everyday Store Link */}
                <div className="pt-3 border-t border-[#EFE3D4]">
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl bg-white border border-[#DFCBB3] px-4 py-3 text-sm font-bold text-[#633719] hover:bg-[#EFE3D4]/40 shadow-2xs"
                  >
                    <span>← Switch to Everyday Store</span>
                    <ArrowUpRight className="w-4 h-4 text-[#8C6C50]" />
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Bottom Pinned Cart Button */}
          <div className="mt-auto pt-4 border-t border-[#EFE3D4]">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openCartDrawer();
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#633719] px-4 py-3.5 text-center text-sm font-bold text-white hover:bg-[#3B2418] transition shadow-card cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>View Cart ({totalItems})</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
