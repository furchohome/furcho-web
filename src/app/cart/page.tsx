"use client";

import React from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  Truck,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { formatPaiseToINR } from "@/lib/utils";
import { INITIAL_DB_STATE } from "@/lib/db/initial-data";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";

export default function CartPage() {
  const { items, totalItems, subtotalPaise, updateQuantity, removeItem, clearCart } =
    useCart();

  const settings = INITIAL_DB_STATE.site_settings;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF5ED]">
      <Header settings={settings} variant="EVERYDAY" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#29221D]">
              Your Shopping Cart
            </h1>
            <p className="text-xs sm:text-sm text-[#6E5D52] mt-1">
              {totalItems} {totalItems === 1 ? "item" : "items"} ready for Order Request
            </p>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-xs font-semibold text-red-700 hover:underline"
            >
              Clear Cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl bg-white border border-[#EFE3D4] p-12 text-center max-w-xl mx-auto shadow-soft space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FAF5ED] border border-[#EFE3D4] text-[#633719]">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-extrabold text-[#29221D]">Your cart is empty</h2>
              <p className="text-sm text-[#6E5D52]">
                Explore our Everyday Living collection or check out our featured Foldable
                Wall-Mounted Ironing Table at ₹2,999.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link
                href="/products/foldable-wall-mounted-ironing-table"
                className="inline-flex items-center gap-2 rounded-xl bg-[#633719] px-6 py-3 text-sm font-bold text-white hover:bg-[#3B2418] transition"
              >
                <span>View Foldable Ironing Table (₹2,999)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-[#D8C7B4] bg-[#FAF5ED] px-6 py-3 text-sm font-bold text-[#29221D] hover:bg-[#EFE3D4] transition"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.product_id}-${item.variant_id || "std"}`}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl bg-white border border-[#EFE3D4] p-4 sm:p-5 shadow-soft"
                >
                  <Link
                    href={`/products/${item.slug}`}
                    className="h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-[#EFE3D4] border border-[#DFCBB3]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </Link>

                  <div className="flex-1 space-y-1">
                    <Link
                      href={`/products/${item.slug}`}
                      className="text-base font-extrabold text-[#29221D] hover:text-[#633719] transition"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-[#6E5D52]">SKU: {item.sku}</p>
                    {item.variant_name && (
                      <p className="text-xs font-medium text-[#633719]">
                        Finish: {item.variant_name}
                      </p>
                    )}
                    <p className="text-sm font-bold text-[#633719] pt-1">
                      {formatPaiseToINR(item.unit_price_paise)} each
                    </p>
                  </div>

                  {/* Quantity & Line Total */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3">
                    <p className="text-lg font-black text-[#3B2418]">
                      {formatPaiseToINR(item.unit_price_paise * item.quantity)}
                    </p>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center rounded-xl border border-[#D8C7B4] bg-[#FAF5ED]">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.product_id, item.quantity - 1, item.variant_id)
                          }
                          className="p-2 text-[#29221D] hover:bg-[#EFE3D4] rounded-l-xl"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.product_id, item.quantity + 1, item.variant_id)
                          }
                          className="p-2 text-[#29221D] hover:bg-[#EFE3D4] rounded-r-xl"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.product_id, item.variant_id)}
                        className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#633719] hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Continue browsing Everyday Living
                </Link>
              </div>
            </div>

            {/* Order Request Summary Card */}
            <div className="lg:col-span-4 rounded-3xl bg-white border border-[#EFE3D4] p-6 shadow-card space-y-5 sticky top-28">
              <h2 className="text-lg font-extrabold text-[#29221D] border-b border-[#EFE3D4] pb-3">
                Order Request Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#6E5D52]">Items Subtotal ({totalItems})</span>
                  <span className="font-bold text-[#29221D]">
                    {formatPaiseToINR(subtotalPaise)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#6E5D52]">Delivery Charges</span>
                  <span className="text-xs font-black text-[#2D6A4F] bg-[#EBF5ED] px-2.5 py-0.5 rounded-full">
                    FREE (Across Kerala)
                  </span>
                </div>

                <div className="border-t border-[#EFE3D4] pt-3 flex items-center justify-between">
                  <span className="text-base font-extrabold text-[#29221D]">Estimated Total</span>
                  <span className="text-2xl font-black text-[#4B2913]">
                    {formatPaiseToINR(subtotalPaise)}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-[#FAF5ED] border border-[#E4D3BE] p-3 text-xs text-[#4E3B30] space-y-1">
                <p className="font-semibold text-[#633719] flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#2D6A4F]" />
                  <span>Free Doorstep Delivery Across Kerala</span>
                </p>
                <p className="leading-relaxed text-[#6E5D52]">
                  Submit your details and our team will verify your order and confirm dispatch.
                </p>
              </div>

              <Link
                href="/checkout"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#633719] px-6 py-4 text-sm sm:text-base font-bold text-white hover:bg-[#3B2418] transition shadow-card"
              >
                <span>Proceed to Order Request</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#6E5D52]">
                <Truck className="w-3.5 h-3.5 text-[#C58B45]" />
                <span>100% FREE Doorstep Delivery Across Kerala</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer settings={settings} variant="EVERYDAY" />
    </div>
  );
}
