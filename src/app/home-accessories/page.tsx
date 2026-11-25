import React from "react";
import type { Metadata } from "next";
import { getCategoryBySlug, getProducts, getSiteSettings } from "@/lib/db";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { CategoryListingClient } from "@/components/storefront/CategoryListingClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Home Accessories & Foldable Ironing Tables | Everyday Living",
  description:
    "Discover space-saving home accessories including the Furcho Foldable Wall-Mounted Ironing Table at ₹2,999, compact shoe racks, and wall shelves.",
};

export default async function HomeAccessoriesCategoryPage({
  searchParams,
}: {
  searchParams: Promise<{ sub?: string; q?: string }>;
}) {
  const params = await searchParams;
  const [settings, category, categoryProducts, allEveryday] = await Promise.all([
    getSiteSettings(),
    getCategoryBySlug("home-accessories"),
    getProducts({ section: "EVERYDAY", categorySlug: "home-accessories" }),
    getProducts({ section: "EVERYDAY" }),
  ]);

  // If user came from global search query (?q=...), search across all Everyday products
  const displayProducts = params.q ? allEveryday : categoryProducts;

  const fallbackCategory = category || {
    id: "cat-home-accessories",
    store_section: "EVERYDAY" as const,
    parent_id: null,
    name: "Home Accessories",
    slug: "home-accessories",
    description: "Space-saving and everyday home essentials.",
    image_url: "/images/categories/home-accessories.jpg",
    banner_url: "/images/categories/home-accessories.jpg",
    display_order: 3,
    is_active: true,
    subcategories: [
      "Foldable ironing tables",
      "Space-saving products",
      "Home organizers",
      "Everyday home essentials",
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF5ED]">
      <Header settings={settings} variant="EVERYDAY" />
      <main className="flex-1">
        <CategoryListingClient
          category={fallbackCategory}
          products={displayProducts}
          initialSubcategory={params.sub || "ALL"}
          initialSearch={params.q || ""}
        />
      </main>
      <Footer settings={settings} variant="EVERYDAY" />
    </div>
  );
}
