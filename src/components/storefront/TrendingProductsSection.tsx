"use client";

import React, { useState } from "react";
import { Product } from "@/types/database";
import { ProductCard } from "./ProductCard";

interface TrendingProductsSectionProps {
  products: Product[];
}

const FILTER_TABS = [
  { label: "All", slug: "ALL" },
  { label: "Kitchen", slug: "kitchen" },
  { label: "Bedroom", slug: "bedroom" },
  { label: "Home Accessories", slug: "home-accessories" },
];

export function TrendingProductsSection({ products }: TrendingProductsSectionProps) {
  const [activeTab, setActiveTab] = useState("ALL");

  const filtered =
    activeTab === "ALL"
      ? products.slice(0, 5)
      : products.filter((p) => p.category_slug === activeTab);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#29221D]">
          Trending Products
        </h2>

        {/* Filter Pills matching reference */}
        <div className="flex flex-wrap items-center gap-2">
          {FILTER_TABS.map((tab) => {
            const isActive = activeTab === tab.slug;
            return (
              <button
                key={tab.slug}
                type="button"
                onClick={() => setActiveTab(tab.slug)}
                className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#633719] text-white shadow-2xs"
                    : "bg-[#EFE3D4]/70 text-[#29221D] hover:bg-[#EFE3D4] border border-[#E2D1BC]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[#EFE3D4] p-8 text-center text-sm text-[#6E5D52]">
          No trending products found in this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 items-stretch">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
