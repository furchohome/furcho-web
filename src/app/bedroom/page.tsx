import React from "react";
import type { Metadata } from "next";
import { getCategoryBySlug, getProducts, getSiteSettings } from "@/lib/db";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { CategoryListingClient } from "@/components/storefront/CategoryListingClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Bedroom Furniture, Beds, Wardrobes & Bedside Tables | Everyday Living",
  description:
    "Shop affordable budget bedroom sets, beds, wardrobes, bedside tables and bedroom accessories from Furcho Everyday Living in Kerala.",
};

export default async function BedroomCategoryPage({
  searchParams,
}: {
  searchParams: Promise<{ sub?: string; q?: string }>;
}) {
  const params = await searchParams;
  const [settings, category, products] = await Promise.all([
    getSiteSettings(),
    getCategoryBySlug("bedroom"),
    getProducts({ section: "EVERYDAY", categorySlug: "bedroom" }),
  ]);

  const fallbackCategory = category || {
    id: "cat-bedroom",
    store_section: "EVERYDAY" as const,
    parent_id: null,
    name: "Bedroom",
    slug: "bedroom",
    description: "Beds, wardrobes and smart bedroom setups.",
    image_url: "/images/categories/bedroom.jpg",
    banner_url: "/images/categories/bedroom.jpg",
    display_order: 2,
    is_active: true,
    subcategories: [
      "Budget bedroom sets",
      "Beds",
      "Wardrobes",
      "Bedside tables",
      "Bedroom accessories",
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
