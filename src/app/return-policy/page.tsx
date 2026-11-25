import React from "react";
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/db";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";

export const metadata: Metadata = {
  title: "Return, Replacement & Warranty Policy | FURCHO® Kerala",
  description: "Return, transit damage replacement, and craftsmanship warranty policy for Furcho furniture.",
};

export default async function ReturnPolicyPage() {
  const settings = await getSiteSettings();
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF5ED]">
      <Header settings={settings} variant="EVERYDAY" />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <div className="rounded-3xl bg-white border border-[#EFE3D4] p-8 sm:p-12 shadow-soft space-y-6 text-sm leading-relaxed text-[#4E3B30]">
          <h1 className="text-3xl font-extrabold text-[#29221D]">Return &amp; Replacement Policy</h1>
          <h2 className="text-lg font-bold text-[#29221D]">1. Transit Damage &amp; Manufacturing Defects</h2>
          <p>
            Every Furcho product undergoes a multi-point quality check prior to dispatch. If your
            product arrives with transit damage or a manufacturing defect, please share photos or an
            unboxing video with our support team on WhatsApp ({settings.support_phone}) within 48
            hours of delivery for a prompt replacement.
          </p>
          <h2 className="text-lg font-bold text-[#29221D]">2. Custom-Built &amp; Bespoke Furniture</h2>
          <p>
            Bespoke furniture manufactured to custom dimensions, timber selections, or commercial
            quotations cannot be returned once fabricated according to approved specifications,
            though full workmanship warranty support applies.
          </p>
        </div>
      </main>
      <Footer settings={settings} variant="EVERYDAY" />
    </div>
  );
}
