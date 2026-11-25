import React from "react";
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/db";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy | FURCHO® Kerala",
  description: "Delivery timelines and district-wise shipping policy across Kerala for Furcho furniture.",
};

export default async function ShippingPolicyPage() {
  const settings = await getSiteSettings();
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF5ED]">
      <Header settings={settings} variant="EVERYDAY" />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <div className="rounded-3xl bg-white border border-[#EFE3D4] p-8 sm:p-12 shadow-soft space-y-6 text-sm leading-relaxed text-[#4E3B30]">
          <h1 className="text-3xl font-extrabold text-[#29221D]">Shipping &amp; Delivery Policy</h1>
          <h2 className="text-lg font-bold text-[#29221D]">1. Pan-India Delivery Coverage</h2>
          <p>
            We deliver Everyday Living smart home accessories (including our best-selling Foldable
            Wall-Mounted Ironing Table) and Premium Living furniture across all states and union
            territories throughout India.
          </p>
          <h2 className="text-lg font-bold text-[#29221D]">2. 100% Free Shipping Across Kerala</h2>
          <p>
            We offer 100% FREE doorstep delivery on Everyday Living products across Kerala.
            There are no hidden delivery fees or surprise charges added at checkout.
          </p>
          <h2 className="text-lg font-bold text-[#29221D]">3. Dispatch Timelines</h2>
          <p>
            In-stock Everyday Living items typically dispatch within 24–48 hours of order
            confirmation and arrive within 2–6 business days depending on your district. Custom and
            Premium Living pieces follow the timeline specified in your formal quotation.
          </p>
        </div>
      </main>
      <Footer settings={settings} variant="EVERYDAY" />
    </div>
  );
}
