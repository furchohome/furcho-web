import React from "react";
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/db";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";

export const metadata: Metadata = {
  title: "Terms & Conditions | FURCHO® Kerala",
  description: "Terms of service for Everyday Living order requests and Premium Living custom commissions at Furcho.",
};

export default async function TermsPage() {
  const settings = await getSiteSettings();
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF5ED]">
      <Header settings={settings} variant="EVERYDAY" />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <div className="rounded-3xl bg-white border border-[#EFE3D4] p-8 sm:p-12 shadow-soft space-y-6 text-sm leading-relaxed text-[#4E3B30]">
          <h1 className="text-3xl font-extrabold text-[#29221D]">Terms &amp; Conditions</h1>
          <p className="text-xs text-[#6E5D52]">Last Updated: November 2026 • FURCHO® Kerala</p>
          <h2 className="text-lg font-bold text-[#29221D]">1. Order Request Checkout Process</h2>
          <p>
            Submitting an Order Request on <strong>furcho.in</strong> creates an order with a{" "}
            <strong>PENDING</strong> status. An order request is only marked{" "}
            <strong>CONFIRMED</strong> after our team verifies stock availability, confirms the
            exact delivery fee for your location, and contacts you directly.
          </p>
          <h2 className="text-lg font-bold text-[#29221D]">2. Pricing &amp; Promotions</h2>
          <p>
            All prices are listed in Indian Rupees (INR). Timed launch offers (such as the Foldable
            Wall-Mounted Ironing Table at ₹2,999) apply during active promotional periods configured
            by Furcho management.
          </p>
          <h2 className="text-lg font-bold text-[#29221D]">3. Custom &amp; Commercial Commissions</h2>
          <p>
            Premium Living and custom-made furniture orders are built to customer-approved dimensions
            and formal written quotations. Production begins upon quotation approval.
          </p>
        </div>
      </main>
      <Footer settings={settings} variant="EVERYDAY" />
    </div>
  );
}
