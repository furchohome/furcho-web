"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ChevronRight, X, Sparkles, Filter } from "lucide-react";
import { Category, Product } from "@/types/database";
import { ProductCard } from "./ProductCard";
import { ModernSelect } from "@/components/ui/ModernSelect";

interface CategoryListingClientProps {
  category: Category;
  products: Product[];
  initialSubcategory?: string;
  initialSearch?: string;
  isPremium?: boolean;
}

const PRICE_TIERS = [
  { id: "all", label: "All Prices", min: 0, max: Infinity },
  { id: "under-2500", label: "Under ₹2,500", min: 0, max: 2500 },
  { id: "2500-5000", label: "₹2,500 – ₹5,000", min: 2500, max: 5000 },
  { id: "above-5000", label: "Above ₹5,000", min: 5000, max: Infinity },
];

const PRICE_OPTIONS = PRICE_TIERS.map((tier) => ({
  value: tier.id,
  label: tier.label,
}));

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
];

export function CategoryListingClient({
  category,
  products,
  initialSubcategory = "ALL",
  initialSearch = "",
  isPremium = false,
}: CategoryListingClientProps) {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(
    initialSubcategory || "ALL"
  );
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedPriceTier, setSelectedPriceTier] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "newest">(
    "featured"
  );

  const activePriceTier = PRICE_TIERS.find((t) => t.id === selectedPriceTier) || PRICE_TIERS[0];

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Subcategory filter
        if (
          selectedSubcategory !== "ALL" &&
          p.subcategory_name?.toLowerCase() !== selectedSubcategory.toLowerCase()
        ) {
          return false;
        }

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match =
            p.name.toLowerCase().includes(q) ||
            p.short_description.toLowerCase().includes(q) ||
            (p.subcategory_name && p.subcategory_name.toLowerCase().includes(q));
          if (!match) return false;
        }

        // Price tier filter
        const rupees = Math.round(p.selling_price_paise / 100);
        if (rupees < activePriceTier.min || rupees > activePriceTier.max) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.selling_price_paise - b.selling_price_paise;
        if (sortBy === "price-desc") return b.selling_price_paise - a.selling_price_paise;
        if (sortBy === "newest") {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return Number(b.is_featured) - Number(a.is_featured);
      });
  }, [products, selectedSubcategory, searchQuery, activePriceTier, sortBy]);

  const hasActiveFilters =
    selectedSubcategory !== "ALL" || searchQuery.trim() !== "" || selectedPriceTier !== "all";

  const clearAllFilters = () => {
    setSelectedSubcategory("ALL");
    setSearchQuery("");
    setSelectedPriceTier("all");
    setSortBy("featured");
  };

  return (
    <div className={isPremium ? "bg-[#1E110A] text-[#FAF5ED] min-h-screen" : "bg-[#FAF5ED] min-h-screen"}>
      {/* 1. Compact Header Strip (No giant bloated hero banner!) */}
      <section
        className={`border-b ${
          isPremium ? "bg-[#25150D] border-[#C58B45]/25" : "bg-white/80 border-[#EFE3D4]"
        } backdrop-blur-xs`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-1.5 text-xs text-[#8C7A6B] mb-1.5">
            <Link href="/" className="hover:text-[#633719] transition">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-[#A8988B]" />
            <span className={isPremium ? "text-[#E5B869] font-semibold" : "text-[#3B2418] font-semibold"}>
              {category.name}
            </span>
          </nav>

          {/* Title & Product Count */}
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h1
                className={`text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight ${
                  isPremium ? "text-[#FAF5ED]" : "text-[#29221D]"
                }`}
              >
                {category.name} Collection
              </h1>
              {category.description && (
                <p className="text-xs sm:text-sm text-[#6E5D52] mt-0.5 max-w-xl">
                  {category.description}
                </p>
              )}
            </div>

            <div className="text-xs sm:text-sm font-semibold text-[#8C7A6B]">
              Showing <span className="font-extrabold text-[#3B2418]">{filteredProducts.length}</span>{" "}
              {filteredProducts.length === 1 ? "product" : "products"}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Content Container */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-4 sm:space-y-5">
        {/* Subcategory Filter Chips (Horizontal swipe on mobile) */}
        {category.subcategories && category.subcategories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0">
            <button
              type="button"
              onClick={() => setSelectedSubcategory("ALL")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold shrink-0 transition cursor-pointer border ${
                selectedSubcategory === "ALL"
                  ? "bg-[#633719] text-white border-[#633719] shadow-2xs"
                  : isPremium
                  ? "bg-[#2D1B11] text-[#EFE3D4] border-[#C58B45]/30 hover:bg-[#3B2418]"
                  : "bg-white text-[#4B2913] border-[#DECAB2] hover:bg-[#FAF5ED]"
              }`}
            >
              All {category.name}
            </button>

            {category.subcategories.map((sub) => {
              const isActive = selectedSubcategory.toLowerCase() === sub.toLowerCase();
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubcategory(sub)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold shrink-0 transition cursor-pointer border ${
                    isActive
                      ? "bg-[#633719] text-white border-[#633719] shadow-2xs"
                      : isPremium
                      ? "bg-[#2D1B11] text-[#EFE3D4] border-[#C58B45]/30 hover:bg-[#3B2418]"
                      : "bg-white text-[#4B2913] border-[#DECAB2] hover:bg-[#FAF5ED]"
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        )}

        {/* Filter & Sort Toolbar */}
        <div
          className={`rounded-2xl border p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${
            isPremium
              ? "bg-[#25150D] border-[#C58B45]/25"
              : "bg-white border-[#EFE3D4] shadow-2xs"
          }`}
        >
          {/* Left: Quick Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#8C7A6B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${category.name.toLowerCase()}...`}
              className={`w-full rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm border focus:outline-none transition ${
                isPremium
                  ? "bg-[#1E110A] border-[#C58B45]/30 text-[#FAF5ED] placeholder:text-[#A38F80]"
                  : "bg-[#FAF5ED] border-[#DECAB2] text-[#29221D] focus:border-[#633719]"
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C7A6B] hover:text-[#29221D] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right: Quick Price Range + Sort */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Price Filter Dropdown */}
            <ModernSelect
              options={PRICE_OPTIONS}
              value={selectedPriceTier}
              onChange={setSelectedPriceTier}
              labelPrefix="Price: "
              isPremium={isPremium}
            />

            {/* Sort Dropdown */}
            <ModernSelect
              options={SORT_OPTIONS}
              value={sortBy}
              onChange={(val) => setSortBy(val as typeof sortBy)}
              labelPrefix="Sort: "
              isPremium={isPremium}
              menuAlign="right"
            />

            {/* Clear All Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 transition cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. Product Grid (2 columns on mobile, 3 on tablet, 4 on desktop) */}
        {filteredProducts.length === 0 ? (
          <div
            className={`rounded-3xl border p-8 sm:p-14 text-center space-y-3 ${
              isPremium
                ? "bg-[#25150D] border-[#C58B45]/25"
                : "bg-white border-[#EFE3D4] shadow-2xs"
            }`}
          >
            <p className="text-base sm:text-lg font-extrabold text-[#3B2418]">
              No products found matching your selection
            </p>
            <p className="text-xs sm:text-sm text-[#6E5D52] max-w-md mx-auto">
              Try clearing your search query or selecting &quot;All Prices&quot; to view all available products.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={clearAllFilters}
                className="rounded-xl bg-[#633719] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#3B2418] transition cursor-pointer"
              >
                View All {category.name}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 items-stretch">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                variant={isPremium ? "PREMIUM" : "EVERYDAY"}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
