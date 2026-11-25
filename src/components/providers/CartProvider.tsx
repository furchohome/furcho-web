"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CartItem, Product, ProductVariant } from "@/types/database";
import { useToast } from "./ToastProvider";
import { trackMetaEvent } from "@/components/tracking/MetaPixel";

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  subtotalPaise: number;
  addItem: (product: Product, quantity?: number, variant?: ProductVariant | null) => void;
  removeItem: (productId: string, variantId?: string | null) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string | null) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const CART_STORAGE_KEY = "furcho_shopping_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const toast = useToast();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      // Ignore storage read error
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage write error
    }
  }, [items, hydrated]);

  const addItem = (product: Product, quantity = 1, variant?: ProductVariant | null) => {
    const unitPrice = variant?.price_override_paise ?? product.selling_price_paise;
    const primaryImage =
      product.images.find((img) => img.is_primary)?.image_url ||
      product.images[0]?.image_url ||
      "/images/products/ironing-table-hero.jpg";

    setItems((prev) => {
      const idx = prev.findIndex(
        (i) => i.product_id === product.id && (i.variant_id || null) === (variant?.id || null)
      );
      if (idx >= 0) {
        const updated = [...prev];
        const nextQty = Math.min(product.stock_quantity || 25, updated[idx].quantity + quantity);
        updated[idx] = { ...updated[idx], quantity: nextQty };
        return updated;
      }
      return [
        ...prev,
        {
          product_id: product.id,
          slug: product.slug,
          name: product.name,
          sku: variant?.sku || product.sku,
          image_url: primaryImage,
          unit_price_paise: unitPrice,
          quantity,
          variant_id: variant?.id || null,
          variant_name: variant?.name || null,
          store_section: product.store_section,
          max_stock: product.stock_quantity || 25,
        },
      ];
    });

    trackMetaEvent("AddToCart", {
      content_name: product.name,
      content_ids: [product.sku],
      content_type: "product",
      value: Math.round(unitPrice / 100),
      currency: "INR",
    });

    toast.success("Added to Cart", `${product.name} (${quantity}x) added to your shopping bag.`);
  };

  const removeItem = (productId: string, variantId?: string | null) => {
    setItems((prev) =>
      prev.filter(
        (i) => !(i.product_id === productId && (i.variant_id || null) === (variantId || null))
      )
    );
    toast.info("Removed from Cart", "Item has been removed from your cart.");
  };

  const updateQuantity = (productId: string, quantity: number, variantId?: string | null) => {
    if (quantity <= 0) {
      removeItem(productId, variantId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.product_id === productId && (i.variant_id || null) === (variantId || null)) {
          return { ...i, quantity: Math.min(i.max_stock || 25, quantity) };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotalPaise = items.reduce(
    (acc, item) => acc + item.unit_price_paise * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotalPaise,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
