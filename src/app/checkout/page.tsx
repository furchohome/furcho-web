"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  MessageCircle,
  Loader2,
  Truck,
  ArrowRight,
} from "lucide-react";
import { checkoutOrderSchema, CheckoutOrderFormValues } from "@/lib/validations";
import { buildWhatsAppLink, formatPaiseToINR } from "@/lib/utils";
import { useCart } from "@/components/providers/CartProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Order } from "@/types/database";
import { INITIAL_DB_STATE } from "@/lib/db/initial-data";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { trackMetaEvent } from "@/components/tracking/MetaPixel";

export default function CheckoutPage() {
  const { items, subtotalPaise, clearCart } = useCart();
  const toast = useToast();
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);
  const settings = INITIAL_DB_STATE.site_settings;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutOrderFormValues>({
    resolver: zodResolver(checkoutOrderSchema),
    defaultValues: {
      customer_name: "",
      customer_phone: "",
      customer_email: "",
      district: "Kerala",
      city_town: "",
      full_address: "",
      pincode: "",
      delivery_instructions: "",
    },
  });

  useEffect(() => {
    if (items.length > 0 && !submittedOrder) {
      trackMetaEvent("InitiateCheckout", {
        num_items: items.length,
        value: Math.round(subtotalPaise / 100),
        currency: "INR",
      });
    }
  }, [items.length, subtotalPaise, submittedOrder]);

  const onSubmit = async (values: CheckoutOrderFormValues) => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          items: items.map((i) => ({
            product_id: i.product_id,
            variant_id: i.variant_id,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not submit order.");
      }

      setSubmittedOrder(data.order);
      clearCart();

      trackMetaEvent("Lead", {
        content_name: "Everyday Living Order Request",
        order_number: data.order.order_number,
        value: Math.round(data.order.subtotal_paise / 100),
        currency: "INR",
      });

      toast.success(
        "Order Received!",
        `Order Reference: ${data.order.order_number}`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit order.";
      toast.error("Order Submission Failed", msg);
    }
  };

  if (submittedOrder) {
    const waMessage = `Hello Furcho Team! I have placed an order.\n\nOrder Reference: *${submittedOrder.order_number}*\nName: ${submittedOrder.customer_name}\nPhone: ${submittedOrder.customer_phone}\nPIN Code: ${submittedOrder.pincode}\nAddress: ${submittedOrder.full_address}\nItems Subtotal: ${formatPaiseToINR(submittedOrder.subtotal_paise)}\nDelivery: FREE (Across Kerala)\n\nPlease verify and share payment details so we can process and dispatch.`;
    const waLink = buildWhatsAppLink(settings.whatsapp_number, waMessage);

    return (
      <div className="min-h-screen flex flex-col bg-[#FAF5ED]">
        <Header settings={settings} variant="EVERYDAY" />
        <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="rounded-2xl bg-white border border-[#EFE3D4] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#29221D]">
                Thank You, {submittedOrder.customer_name}!
              </h1>
              <p className="text-sm text-[#6E5D52] max-w-md leading-relaxed">
                Your order has been received with <strong>100% Free Doorstep Delivery across Kerala</strong>. Our team will contact you shortly to confirm order and payment details before shipping.
              </p>
            </div>

            {/* Order Reference Box */}
            <div className="rounded-xl bg-[#FAF5ED] border border-[#E4D3BE] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6E5D52]">
                  Order Reference
                </p>
                <p className="text-xl font-bold text-[#4B2913] mt-0.5">
                  {submittedOrder.order_number}
                </p>
              </div>
              <div className="text-xs text-[#4E3B30] space-y-0.5 sm:text-right">
                <p className="font-semibold">PIN: {submittedOrder.pincode}</p>
                <p className="max-w-[240px] truncate text-[#6E5D52]">{submittedOrder.full_address}</p>
              </div>
            </div>

            {/* Items Summary */}
            <div className="space-y-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#633719]">
                Ordered Items
              </h2>
              <div className="divide-y divide-[#EFE3D4] rounded-xl border border-[#EFE3D4] overflow-hidden">
                {submittedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 p-3.5 bg-white text-sm"
                  >
                    <div>
                      <p className="font-semibold text-[#29221D]">{item.product_name_snapshot}</p>
                      <p className="text-xs text-[#6E5D52]">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-[#4B2913]">
                      {formatPaiseToINR(item.unit_price_paise * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="space-y-2 rounded-xl bg-[#FAF5ED] p-4 text-sm">
              <div className="flex justify-between text-[#6E5D52]">
                <span>Subtotal</span>
                <span className="font-semibold text-[#29221D]">
                  {formatPaiseToINR(submittedOrder.subtotal_paise)}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#6E5D52]">
                <span>Delivery</span>
                <span className="text-xs font-bold text-[#2D6A4F] bg-[#EBF5ED] px-2 py-0.5 rounded">
                  FREE
                </span>
              </div>
              <div className="border-t border-[#E4D3BE] pt-2 flex justify-between font-bold text-base text-[#29221D]">
                <span>Total</span>
                <span className="text-xl text-[#4B2913]">
                  {formatPaiseToINR(submittedOrder.subtotal_paise)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1EBE5D] transition shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contact on WhatsApp</span>
              </a>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl border border-[#D8C7B4] bg-white px-5 py-3 text-sm font-semibold text-[#633719] hover:bg-[#FAF5ED] transition"
              >
                Return to Store
              </Link>
            </div>
          </div>
        </main>
        <Footer settings={settings} variant="EVERYDAY" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF5ED]">
      <Header settings={settings} variant="EVERYDAY" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Simple Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#29221D]">Checkout</h1>
          <p className="text-sm text-[#6E5D52] mt-0.5">
            100% Free Doorstep Delivery Across Kerala
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl bg-white border border-[#EFE3D4] p-10 text-center max-w-md mx-auto space-y-4">
            <p className="text-base font-medium text-[#29221D]">Your cart is currently empty</p>
            <Link
              href="/products/foldable-wall-mounted-ironing-table"
              className="inline-flex items-center gap-2 rounded-xl bg-[#633719] px-6 py-3 text-sm font-semibold text-white shadow-xs"
            >
              View Featured Product
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
          >
            {/* Left: Clean 4-Field Delivery Form */}
            <div className="lg:col-span-7 rounded-2xl bg-white border border-[#EFE3D4] p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#EFE3D4] pb-3">
                <h2 className="text-base font-bold text-[#29221D]">
                  Delivery Details
                </h2>
                <span className="text-xs font-semibold text-[#2D6A4F] bg-[#EBF5ED] px-2.5 py-0.5 rounded-md">
                  Free Delivery (Kerala)
                </span>
              </div>

              <div className="space-y-3.5">
                {/* 1. Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#29221D] mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    autoComplete="name"
                    {...register("customer_name")}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-[#D8C7B4] bg-[#FAF5ED]/40 px-3.5 py-2.5 text-sm text-[#29221D] placeholder:text-[#A8988B] focus:border-[#633719] focus:bg-white focus:outline-none transition"
                  />
                  {errors.customer_name && (
                    <p className="text-xs text-red-600 mt-1">{errors.customer_name.message}</p>
                  )}
                </div>

                {/* 2. Mobile Number (WhatsApp) */}
                <div>
                  <label className="block text-xs font-semibold text-[#29221D] mb-1">
                    Mobile Number (WhatsApp) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-semibold text-[#633719] bg-[#EFE2D0] px-1.5 py-0.5 rounded">
                      +91
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      autoComplete="tel"
                      {...register("customer_phone")}
                      placeholder="10-digit mobile number"
                      className="w-full rounded-xl border border-[#D8C7B4] bg-[#FAF5ED]/40 pl-14 pr-3.5 py-2.5 text-sm text-[#29221D] placeholder:text-[#A8988B] focus:border-[#633719] focus:bg-white focus:outline-none transition"
                    />
                  </div>
                  {errors.customer_phone && (
                    <p className="text-xs text-red-600 mt-1">{errors.customer_phone.message}</p>
                  )}
                </div>

                {/* 3. Delivery Address */}
                <div>
                  <label className="block text-xs font-semibold text-[#29221D] mb-1">
                    Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    autoComplete="street-address"
                    {...register("full_address")}
                    placeholder="House / Flat No., Building, Road, Area, Town..."
                    className="w-full rounded-xl border border-[#D8C7B4] bg-[#FAF5ED]/40 px-3.5 py-2.5 text-sm text-[#29221D] placeholder:text-[#A8988B] focus:border-[#633719] focus:bg-white focus:outline-none transition"
                  />
                  {errors.full_address && (
                    <p className="text-xs text-red-600 mt-1">{errors.full_address.message}</p>
                  )}
                </div>

                {/* 4. PIN Code */}
                <div>
                  <label className="block text-xs font-semibold text-[#29221D] mb-1">
                    PIN Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="postal-code"
                    {...register("pincode")}
                    placeholder="6-digit PIN code"
                    className="w-full rounded-xl border border-[#D8C7B4] bg-[#FAF5ED]/40 px-3.5 py-2.5 text-sm text-[#29221D] placeholder:text-[#A8988B] focus:border-[#633719] focus:bg-white focus:outline-none transition"
                  />
                  {errors.pincode && (
                    <p className="text-xs text-red-600 mt-1">{errors.pincode.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Order Summary & Simple Button */}
            <div className="lg:col-span-5 rounded-2xl bg-white border border-[#EFE3D4] p-5 sm:p-6 shadow-xs space-y-4 sticky top-24">
              <h2 className="text-base font-bold text-[#29221D] border-b border-[#EFE3D4] pb-3 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs font-normal text-[#6E5D52]">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
              </h2>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={`${item.product_id}-${item.variant_id || "std"}`}
                    className="flex items-center gap-3 rounded-xl bg-[#FAF5ED] p-2.5 border border-[#EFE3D4]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-12 w-14 rounded-lg object-cover bg-[#EFE3D4] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#29221D] truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-[#6E5D52]">
                        Qty: {item.quantity} × {formatPaiseToINR(item.unit_price_paise)}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-[#4B2913] shrink-0">
                      {formatPaiseToINR(item.unit_price_paise * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-[#EFE3D4] pt-3 text-sm">
                <div className="flex justify-between text-[#6E5D52]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#29221D]">{formatPaiseToINR(subtotalPaise)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6E5D52]">Delivery Charges</span>
                  <span className="text-xs font-bold text-[#2D6A4F] bg-[#EBF5ED] px-2.5 py-0.5 rounded-md">
                    FREE
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#EFE3D4] pt-2.5 items-center">
                  <div>
                    <span className="text-base font-bold text-[#29221D] block">Total Amount</span>
                    <span className="text-xs text-[#2D6A4F]">Free Doorstep Delivery Across Kerala</span>
                  </div>
                  <span className="text-xl font-extrabold text-[#4B2913]">
                    {formatPaiseToINR(subtotalPaise)}
                  </span>
                </div>
              </div>

              {/* Delivery Assurance */}
              <div className="rounded-xl bg-[#EBF5ED] border border-[#C3E6CB] p-2.5 text-xs text-[#2D6A4F] flex items-center gap-2">
                <Truck className="w-4 h-4 shrink-0 text-[#2D6A4F]" />
                <span className="font-medium">100% Free Doorstep Delivery Across Kerala</span>
              </div>

              {/* Clean Minimalist Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] hover:bg-[#1E4D38] active:scale-[0.99] px-6 py-3.5 text-sm font-bold text-white transition shadow-sm disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Confirming Order...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>

      <Footer settings={settings} variant="EVERYDAY" />
    </div>
  );
}
