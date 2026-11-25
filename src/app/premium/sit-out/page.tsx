import React from "react";
import type { Metadata } from "next";
import { getCategoryBySlug, getProducts, getSiteSettings } from "@/lib/db";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { CategoryListingClient } from "@/components/storefront/CategoryListingClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Premium Sit-out, Verandah & Hospitality Furniture | Premium Living",
  description:
    "Explore handcrafted sit-out lounge chairs, verandah seating, and restaurant/resort outdoor furniture from Furcho Premium Living.",
};

export default async function PremiumSitOutPage({
  searchParams,
}: {
  searchParams: Promise<{ sub?: string; q?: string }>;
}) {
  const params = await searchParams;
  const [settings, category, products] = await Promise.all([
    getSiteSettings(),
    getCategoryBySlug("premium-sit-out"),
    getProducts({ section: "PREMIUM", categorySlug: "premium-sit-out" }),
  ]);

  const fallbackCategory = category || {
    id: "cat-premium-sit-out",
    store_section: "PREMIUM" as const,
    parent_id: null,
    name: "Premium Sit-out",
    slug: "premium-sit-out",
    description:
      "Artisanal verandah chairs, resort lounge seating and weather-treated outdoor furniture.",
    image_url: "/images/banners/commercial-restaurant.jpg",
    banner_url: "/images/banners/commercial-restaurant.jpg",
    display_order: 6,
    is_active: true,
    subcategories: ["Premium chairs", "Outdoor furniture"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#24150E]">
      <Header settings={settings} variant="PREMIUM" />
      <main className="flex-1">
        <CategoryListingClient
          category={fallbackCategory}
          products={products}
          initialSubcategory={params.sub || "ALL"}
          initialSearch={params.q || ""}
          isPremium
        />
      </main>
      <Footer settings={settings} variant="PREMIUM" />
    </div>
  );
}
