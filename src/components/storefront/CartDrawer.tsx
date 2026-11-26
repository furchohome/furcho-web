"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { formatPaiseToINR } from "@/lib/utils";

export function CartDrawer() {
  const router = useRouter();
  const {
    items,
    totalItems,
    subtotalPaise,
    isCartDrawerOpen,
    closeCartDrawer,
    updateQuantity,
    removeItem,
  } = useCart();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCartDrawerOpen) {
        closeCartDrawer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartDrawerOpen, closeCartDrawer]);

  // Lock root & body scroll when drawer is open
  useEffect(() => {
    if (!isCartDrawerOpen) return;

    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverscroll = document.documentElement.style.overscrollBehavior;
    const originalBodyOverscroll = document.body.style.overscrollBehavior;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";
    document.body.style.overscrollBehavior = "none";

    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest?.("[data-cart-drawer]")) {
        return;
      }
      e.preventDefault();
    };

    document.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overscrollBehavior = originalHtmlOverscroll;
      document.body.style.overscrollBehavior = originalBodyOverscroll;
      document.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isCartDrawerOpen]);

  if (!isCartDrawerOpen) return null;

  const handleCheckoutClick = () => {
    closeCartDrawer();
    router.push("/checkout");
  };

  const handleViewCartClick = () => {
    closeCartDrawer();
    router.push("/cart");
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* 1. Backdrop Overlay */}
      <div
        onClick={closeCartDrawer}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in cursor-pointer"
        aria-label="Close cart drawer"
      />

      {/* 2. Slide-out Drawer Panel */}
      <div
        data-cart-drawer="true"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart Drawer"
        className="relative z-10 flex h-full w-full max-w-md flex-col bg-[#FAF5ED] shadow-2xl border-l border-[#DECBB3] animate-slide-in-right overscroll-contain touch-pan-y overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E4D3BE] px-5 py-4 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#633719]" />
            <h2 className="text-base sm:text-lg font-extrabold text-[#3B2418]">
              Your Cart
            </h2>
            <span className="rounded-full bg-[#633719] px-2 py-0.5 text-xs font-bold text-white">
              {totalItems}
            </span>
          </div>

          <button
            type="button"
            onClick={closeCartDrawer}
            className="rounded-xl p-2 text-[#6E5D52] hover:bg-[#FAF5ED] hover:text-[#3B2418] transition cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List (Scrollable vertically, no horizontal overflow) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-4 space-y-3 overscroll-contain">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EFE0CC] text-[#633719]">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-extrabold text-[#3B2418]">
                  Your cart is empty
                </p>
                <p className="text-xs text-[#6E5D52] max-w-[240px]">
                  Add items to your bag to enjoy exclusive launch prices and doorstep delivery.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCartDrawer}
                className="rounded-xl bg-[#633719] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#3B2418] transition shadow-2xs cursor-pointer"
              >
                Start Exploring
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.product_id}-${item.variant_id || "std"}`}
                className="flex items-center gap-3 rounded-2xl bg-white border border-[#EFE3D4] p-3 shadow-2xs w-full min-w-0"
              >
                {/* Product Thumbnail (Strict uniform fixed dimensions) */}
                <Link
                  href={`/products/${item.slug}`}
                  onClick={closeCartDrawer}
                  className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 overflow-hidden rounded-xl bg-[#FAF5ED] border border-[#DECBB3]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover object-center"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <Link
                    href={`/products/${item.slug}`}
                    onClick={closeCartDrawer}
                    className="block text-xs sm:text-sm font-bold text-[#29221D] hover:text-[#633719] transition truncate"
                    title={item.name}
                  >
                    {item.name}
                  </Link>
                  {item.variant_name && (
                    <p className="text-[11px] font-medium text-[#6E5D52] truncate">
                      Finish: {item.variant_name}
                    </p>
                  )}
                  <p className="text-xs sm:text-sm font-extrabold text-[#633719]">
                    {formatPaiseToINR(item.unit_price_paise)}
                  </p>
                </div>

                {/* Quantity Controls & Remove */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="flex items-center rounded-lg border border-[#DECBB3] bg-[#FAF5ED]">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.product_id, item.quantity - 1, item.variant_id)
                      }
                      className="p-1.5 text-[#4B2913] hover:bg-[#EFE0CC] rounded-l-lg cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 text-xs font-bold text-[#3B2418]">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.product_id, item.quantity + 1, item.variant_id)
                      }
                      className="p-1.5 text-[#4B2913] hover:bg-[#EFE0CC] rounded-r-lg cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.product_id, item.variant_id)}
                    className="text-[11px] font-semibold text-red-600 hover:text-red-800 transition cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer (Sticky at bottom) */}
        {items.length > 0 && (
          <div className="border-t border-[#E4D3BE] bg-white p-4 sm:p-5 space-y-3.5 shadow-lg shrink-0">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm sm:text-base font-extrabold text-[#29221D]">
                <span>Subtotal</span>
                <span className="text-[#633719]">
                  {formatPaiseToINR(subtotalPaise)}
                </span>
              </div>
              <p className="text-[11px] text-[#6E5D52] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>GST included • 100% Free Doorstep Delivery</span>
              </p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleCheckoutClick}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#633719] px-6 py-3.5 text-sm sm:text-base font-bold text-white hover:bg-[#3B2418] transition shadow-card cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleViewCartClick}
                className="w-full text-center text-xs font-bold text-[#633719] hover:underline py-1 cursor-pointer"
              >
                View Full Cart Details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
