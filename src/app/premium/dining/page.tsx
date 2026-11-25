import React from "react";
import type { Metadata } from "next";
import { getCategoryBySlug, getProducts, getSiteSettings } from "@/lib/db";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { CategoryListingClient } from "@/components/storefront/CategoryListingClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Premium Solid Wood Dining Tables & Rattan Cane Sets | Premium Living",
  description:
    "Commission heirloom solid wood dining tables and handcrafted cane-weave dining sets from Furcho Premium Living across Kerala.",
};

export default async function PremiumDiningPage({
  searchParams,
}: {
  searchParams: Promise<{ sub?: string; q?: string }>;
}) {
  const params = await searchParams;
  const [settings, category, products] = await Promise.all([
    getSiteSettings(),
    getCategoryBySlug("premium-dining"),
    getProducts({ section: "PREMIUM", categorySlug: "premium-dining" }),
  ]);

  const fallbackCategory = category || {
    id: "cat-premium-dining",
    store_section: "PREMIUM" as const,
    parent_id: null,
    name: "Premium Dining",
    slug: "premium-dining",
    description: "Heirloom solid wood dining tables, cane-accent chairs and luxury dining sets.",
    image_url: "/images/banners/premium-dining-hero.jpg",
    banner_url: "/images/banners/premium-dining-hero.jpg",
    display_order: 5,
    is_active: true,
    subcategories: ["Premium dining tables", "Dining sets"],
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
