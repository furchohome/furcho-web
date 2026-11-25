"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, ArrowUpRight, Sparkles } from "lucide-react";
import { Category, Product } from "@/types/database";
import { ProductCard } from "./ProductCard";

interface CategoryListingClientProps {
  category: Category;
  products: Product[];
  initialSubcategory?: string;
  initialSearch?: string;
  isPremium?: boolean;
}

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
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "newest">(
    "featured"
  );
  const [maxPriceRupees, setMaxPriceRupees] = useState<number>(100000);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (
          selectedSubcategory !== "ALL" &&
          p.subcategory_name?.toLowerCase() !== selectedSubcategory.toLowerCase()
        ) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match =
            p.name.toLowerCase().includes(q) ||
            p.short_description.toLowerCase().includes(q) ||
            (p.subcategory_name && p.subcategory_name.toLowerCase().includes(q));
          if (!match) return false;
        }
        const rupees = Math.round(p.selling_price_paise / 100);
        if (rupees > maxPriceRupees) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.selling_price_paise - b.selling_price_paise;
        if (sortBy === "price-desc") return b.selling_price_paise - a.selling_price_paise;
        if (sortBy === "newest")
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        return Number(b.is_featured) - Number(a.is_featured);
      });
  }, [products, selectedSubcategory, searchQuery, sortBy, maxPriceRupees]);

  return (
    <div className={isPremium ? "bg-[#24150E] text-[#FAF5ED] min-h-screen" : "bg-[#FAF5ED] min-h-screen"}>
      {/* Category Banner */}
      <section
        className={`relative overflow-hidden border-b ${
          isPremium
            ? "bg-[#1A0F0A] border-[#C58B45]/25"
            : "bg-gradient-to-r from-[#EFE3D4] to-[#E5D3BD] border-[#DFCBB3]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#633719]/15 border border-[#C58B45]/40 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#C58B45]">
              <Sparkles className="w-3.5 h-3.5" />
              {isPremium ? "Furcho Premium Living" : "Furcho Everyday Living"}
            </div>
            <h1
              className={`text-3xl sm:text-4xl font-extrabold ${
                isPremium ? "text-[#FAF5ED]" : "text-[#3B2418]"
              }`}
            >
              {category.name} Collection
            </h1>
            <p
              className={`text-sm sm:text-base max-w-2xl leading-relaxed ${
                isPremium ? "text-[#E2D1BC]" : "text-[#5A4638]"
              }`}
            >
              {category.description}
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-2xl border border-[#C58B45]/30 shadow-card aspect-[16/9] bg-[#3B2418]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={category.banner_url || category.image_url}
                alt={category.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Subcategory Navigation + Search + Sort + Price Filter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subcategory Pills */}
        {category.subcategories && category.subcategories.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedSubcategory("ALL")}
              className={`rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition ${
                selectedSubcategory === "ALL"
                  ? "bg-[#633719] text-white shadow-2xs"
                  : isPremium
                  ? "bg-[#3B2418] text-[#EFE3D4] hover:bg-[#633719]"
                  : "bg-white text-[#29221D] border border-[#E2D1BC] hover:bg-[#EFE3D4]"
              }`}
            >
              All {category.name}
            </button>
            {category.subcategories.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => setSelectedSubcategory(sub)}
                className={`rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition ${
                  selectedSubcategory.toLowerCase() === sub.toLowerCase()
                    ? "bg-[#633719] text-white shadow-2xs"
                    : isPremium
                    ? "bg-[#3B2418] text-[#EFE3D4] hover:bg-[#633719]"
                    : "bg-white text-[#29221D] border border-[#E2D1BC] hover:bg-[#EFE3D4]"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        {/* Filter Bar */}
        <div
          className={`mb-8 grid grid-cols-1 md:grid-cols-12 gap-4 rounded-2xl border p-4 ${
            isPremium
              ? "bg-[#2C1B12] border-[#C58B45]/25"
              : "bg-white border-[#EFE3D4] shadow-soft"
          }`}
        >
          {/* Search Input */}
          <div className="md:col-span-5 relative flex items-center">
            <Search className="w-4 h-4 text-[#6E5D52] absolute left-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${category.name}...`}
              className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none border ${
                isPremium
                  ? "bg-[#1A0F0A] border-[#C58B45]/30 text-[#FAF5ED] placeholder:text-[#A38F80]"
                  : "bg-[#FAF5ED] border-[#E2D1BC] text-[#29221D]"
              }`}
            />
          </div>

          {/* Price Range Filter */}
          <div className="md:col-span-4 flex flex-col justify-center px-2">
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span className="flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#C58B45]" />
                Max Price Filter
              </span>
              <span className="text-[#C58B45]">
                Up to ₹{maxPriceRupees.toLocaleString("en-IN")}
              </span>
            </div>
            <input
              type="range"
              min={1000}
              max={100000}
              step={500}
              value={maxPriceRupees}
              onChange={(e) => setMaxPriceRupees(Number(e.target.value))}
              className="w-full accent-[#633719] cursor-pointer"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-3 flex items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className={`w-full rounded-xl px-3.5 py-2.5 text-sm font-medium border focus:outline-none ${
                isPremium
                  ? "bg-[#1A0F0A] border-[#C58B45]/30 text-[#FAF5ED]"
                  : "bg-[#FAF5ED] border-[#E2D1BC] text-[#29221D]"
              }`}
            >
              <option value="featured">Sort: Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>

        {/* Demonstration Data Notice Banner */}
        <div
          className={`mb-6 rounded-xl border px-4 py-3 text-xs flex flex-wrap items-center justify-between gap-2 ${
            isPremium
              ? "bg-[#3B2418]/60 border-[#C58B45]/30 text-[#EFE3D4]"
              : "bg-[#F5EBDD] border-[#DECAB2] text-[#4B2913]"
          }`}
        >
          <span>
            <strong>Catalogue Notice:</strong> Our verified flagship launch product is the{" "}
            <Link
              href="/products/foldable-wall-mounted-ironing-table"
              className="underline font-bold"
            >
              Foldable Wall-Mounted Ironing Table (₹2,999)
            </Link>
            . Items labelled <em>Demo Item</em> are demonstration records editable via the{" "}
            <Link href="/admin/products" className="underline font-semibold">
              Admin Product Manager
            </Link>
            .
          </span>
          <Link
            href={`/premium/custom-enquiry?section=${isPremium ? "PREMIUM" : "EVERYDAY"}&category=${encodeURIComponent(category.name)}`}
            className="inline-flex items-center gap-1 font-bold text-[#C58B45] hover:underline"
          >
            Request Custom Furniture
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div
            className={`rounded-3xl border p-12 text-center space-y-4 ${
              isPremium
                ? "bg-[#2C1B12] border-[#C58B45]/25"
                : "bg-white border-[#EFE3D4]"
            }`}
          >
            <p className="text-lg font-bold">No matching products in {category.name}</p>
            <p className="text-sm opacity-80 max-w-md mx-auto">
              We are expanding our {category.name} catalogue. You can reset your filters or send us
              a custom furniture enquiry for bespoke requirements.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedSubcategory("ALL");
                  setSearchQuery("");
                  setMaxPriceRupees(100000);
                }}
                className="rounded-xl bg-[#633719] px-5 py-2.5 text-xs font-bold text-white"
              >
                Reset Filters
              </button>
              <Link
                href={`/premium/custom-enquiry?section=${isPremium ? "PREMIUM" : "EVERYDAY"}`}
                className="rounded-xl border border-[#C58B45] px-5 py-2.5 text-xs font-bold text-[#C58B45]"
              >
                Send Custom Enquiry
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
