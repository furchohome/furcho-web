import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Crown,
  Truck,
  ShieldCheck,
  Headset,
  Wrench,
  CookingPot,
  BedDouble,
  Home as HomeIcon,
  Store,
} from "lucide-react";
import { getBanners, getCategories, getProducts, getSiteSettings } from "@/lib/db";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { HeroFeaturedProduct } from "@/components/storefront/HeroFeaturedProduct";
import { TrendingProductsSection } from "@/components/storefront/TrendingProductsSection";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, everydayCategories, everydayProducts, allBanners] = await Promise.all([
    getSiteSettings(),
    getCategories("EVERYDAY"),
    getProducts({ section: "EVERYDAY" }),
    getBanners(),
  ]);

  const heroBanners = allBanners.filter((b) => b.placement === "HERO" && b.store_section === "EVERYDAY");

  const featuredProduct =
    everydayProducts.find((p) => p.slug === settings.featured_product_slug) ||
    everydayProducts.find((p) => p.is_featured) ||
    everydayProducts[0];

  const trendingProducts = everydayProducts.filter((p) => p.is_trending);

  const getCategoryIcon = (slug: string) => {
    if (slug.includes("kitchen")) return CookingPot;
    if (slug.includes("bedroom")) return BedDouble;
    return HomeIcon;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF5ED]">
      {/* 1. Announcement Bar & 2. Main Navigation */}
      <Header settings={settings} variant="EVERYDAY" />

      <main className="flex-1">
        {/* 3. Featured Ironing Table Hero Section with Auto-slide Banners */}
        {featuredProduct && (
          <HeroFeaturedProduct
            product={featuredProduct}
            allProducts={everydayProducts}
            settings={settings}
            heroBanners={heroBanners}
          />
        )}

        {/* 4. Shop by Category Section (Exact UI Match) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
          <div className="text-center space-y-1.5 mb-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#6E5D52]">
              SHOP BY CATEGORY
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#29221D]">
              Explore Our <span className="text-[#8A5424]">Everyday Living</span> Collection
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {everydayCategories.map((cat) => {
              const IconComp = getCategoryIcon(cat.slug);
              return (
                <Link
                  key={cat.id}
                  href={`/${cat.slug}`}
                  className="group relative flex flex-col rounded-3xl bg-[#F4ECE1] border border-[#E5D5C3] overflow-hidden shadow-soft hover:shadow-card transition-all duration-300"
                >
                  {/* Category Image */}
                  <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-[#EADBC9]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Overlapping Floating Icon + Bottom Card Body */}
                  <div className="relative flex items-center justify-between gap-3 bg-[#F6EFE6] px-5 py-4">
                    <div className="flex items-start gap-3.5">
                      <div className="-mt-9 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#FAF5ED] border-4 border-[#EFE3D4] text-[#8A5424] shadow-soft">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-[#29221D] group-hover:text-[#633719] transition">
                          {cat.name}
                        </h3>
                        <p className="text-xs text-[#6E5D52] leading-snug mt-0.5 line-clamp-2">
                          {cat.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#8D4F23] text-white group-hover:bg-[#3B2418] transition shadow-2xs">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 5. Premium Living Promotional Banner (Exact Reference UI Match) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="relative overflow-hidden rounded-3xl bg-[#3B2418] border border-[#633719] shadow-elevated">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
              {/* Left Editorial Copy */}
              <div className="lg:col-span-5 p-7 sm:p-10 space-y-4 z-10 bg-gradient-to-r from-[#2D1A10] via-[#3B2418] to-transparent">
                <div className="flex items-center gap-2.5">
                  <Crown className="w-7 h-7 text-[#C58B45]" />
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Premium Living
                  </h2>
                </div>
                <p className="text-sm sm:text-base text-[#EFE3D4] leading-relaxed">
                  Crafted wooden furniture for refined homes, restaurants and commercial spaces.
                </p>
                <div className="pt-2">
                  <Link
                    href="/premium"
                    className="inline-flex items-center gap-2 rounded-full bg-[#FAF5ED] px-6 py-2.5 text-xs sm:text-sm font-extrabold text-[#3B2418] hover:bg-[#C58B45] hover:text-[#24150E] transition shadow-soft"
                  >
                    <span>Explore Premium Collection</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Right Dining Photo */}
              <div className="lg:col-span-7 h-56 sm:h-64 lg:h-72 w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/banners/premium-dining-hero.jpg"
                  alt="Furcho Premium Living Dining Furniture"
                  className="h-full w-full object-cover object-center"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 6. Trending Products Section */}
        <TrendingProductsSection products={trendingProducts} />

        {/* 7. Why Choose Furcho? Trust Bar (Exact Reference UI Match) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 rounded-2xl bg-[#F5EDE2] border border-[#E5D5C3] p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EFE2D0] text-[#633719]">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#29221D]">100% Free Delivery</h3>
                <p className="text-xs text-[#6E5D52]">Across Kerala</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EFE2D0] text-[#633719]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#29221D]">Quality Craftsmanship</h3>
                <p className="text-xs text-[#6E5D52]">Built to Last</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EFE2D0] text-[#633719]">
                <Headset className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#29221D]">Easy Support</h3>
                <p className="text-xs text-[#6E5D52]">We&apos;re Here to Help</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EFE2D0] text-[#633719]">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#29221D]">Custom Furniture</h3>
                <p className="text-xs text-[#6E5D52]">For Your Space</p>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Custom Furniture Enquiry & 9. Restaurant and Commercial Furniture Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 8. Need a Custom Design? */}
            <div className="relative overflow-hidden rounded-3xl bg-[#F3E9DC] border border-[#E4D3BE] shadow-soft flex flex-col sm:flex-row items-center justify-between">
              <div className="p-6 sm:p-8 space-y-3 flex-1">
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#29221D]">
                  Need a Custom Design?
                </h3>
                <p className="text-xs sm:text-sm text-[#5A4638] leading-relaxed">
                  Get furniture built for your space, style and needs.
                </p>
                <div className="pt-2">
                  <Link
                    href="/premium/custom-enquiry?section=EVERYDAY"
                    className="inline-flex items-center gap-2 rounded-full bg-[#8D4F23] px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#633719] transition shadow-2xs"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Send a Custom Enquiry</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
              <div className="w-full sm:w-52 h-44 sm:h-full shrink-0 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/banners/custom-design-bed.jpg"
                  alt="Custom Design Furniture"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* 9. For Restaurants & Commercial Spaces */}
            <div className="relative overflow-hidden rounded-3xl bg-[#F3E9DC] border border-[#E4D3BE] shadow-soft flex flex-col sm:flex-row items-center justify-between">
              <div className="p-6 sm:p-8 space-y-3 flex-1">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFE0CC] text-[#633719] mt-0.5">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-[#29221D]">
                      For Restaurants &amp; Commercial Spaces
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A4638] leading-relaxed mt-1">
                      Premium furniture solutions for cafés, restaurants, offices and more.
                    </p>
                  </div>
                </div>
                <div className="pt-2">
                  <Link
                    href="/premium/custom-enquiry?section=PREMIUM&category=Restaurant+%26+Commercial+Furniture"
                    className="inline-flex items-center gap-2 rounded-full bg-[#633719] px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#3B2418] transition shadow-2xs"
                  >
                    <span>Get a Project Quote</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
              <div className="w-full sm:w-52 h-44 sm:h-full shrink-0 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/banners/commercial-restaurant.jpg"
                  alt="Restaurants & Commercial Spaces Furniture"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 10. Footer */}
      <Footer settings={settings} variant="EVERYDAY" />
    </div>
  );
}
