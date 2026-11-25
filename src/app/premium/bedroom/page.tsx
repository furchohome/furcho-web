import React from "react";
import type { Metadata } from "next";
import { getCategoryBySlug, getProducts, getSiteSettings } from "@/lib/db";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { CategoryListingClient } from "@/components/storefront/CategoryListingClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Premium Solid Wood Bedroom Suites & Bespoke Wardrobes | Premium Living",
  description:
    "Explore handcrafted solid wood beds, luxury upholstered headboards, and bespoke architectural wardrobes from Furcho Premium Living.",
};

export default async function PremiumBedroomPage({
  searchParams,
}: {
  searchParams: Promise<{ sub?: string; q?: string }>;
}) {
  const params = await searchParams;
  const [settings, category, products] = await Promise.all([
    getSiteSettings(),
    getCategoryBySlug("premium-bedroom"),
    getProducts({ section: "PREMIUM", categorySlug: "premium-bedroom" }),
  ]);

  const fallbackCategory = category || {
    id: "cat-premium-bedroom",
    store_section: "PREMIUM" as const,
    parent_id: null,
    name: "Premium Bedroom",
    slug: "premium-bedroom",
    description: "Premium bedroom sets, solid wood beds and bespoke architectural wardrobes.",
    image_url: "/images/categories/bedroom.jpg",
    banner_url: "/images/banners/custom-design-bed.jpg",
    display_order: 4,
    is_active: true,
    subcategories: ["Premium bedroom sets", "Solid wood beds", "Premium wardrobes"],
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
