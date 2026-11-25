import React from "react";
import type { Metadata } from "next";
import { getCategoryBySlug, getProducts, getSiteSettings } from "@/lib/db";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { CategoryListingClient } from "@/components/storefront/CategoryListingClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kitchen Furniture & Smart Organizers | Everyday Living",
  description:
    "Explore Furcho Everyday Living kitchen accessories, kitchen organizers, storage racks, small kitchen tables, and wooden kitchen furniture across Kerala.",
};

export default async function KitchenCategoryPage({
  searchParams,
}: {
  searchParams: Promise<{ sub?: string; q?: string }>;
}) {
  const params = await searchParams;
  const [settings, category, products] = await Promise.all([
    getSiteSettings(),
    getCategoryBySlug("kitchen"),
    getProducts({ section: "EVERYDAY", categorySlug: "kitchen" }),
  ]);

  const fallbackCategory = category || {
    id: "cat-kitchen",
    store_section: "EVERYDAY" as const,
    parent_id: null,
    name: "Kitchen",
    slug: "kitchen",
    description: "Smart kitchen essentials and compact furniture.",
    image_url: "/images/categories/kitchen.jpg",
    banner_url: "/images/categories/kitchen.jpg",
    display_order: 1,
    is_active: true,
    subcategories: [
      "Kitchen accessories",
      "Kitchen organizers",
      "Kitchen storage",
      "Small kitchen tables",
      "Wooden kitchen furniture",
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
          products={products}
          initialSubcategory={params.sub || "ALL"}
          initialSearch={params.q || ""}
        />
      </main>
      <Footer settings={settings} variant="EVERYDAY" />
    </div>
  );
}
