import React from "react";
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/db";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | FURCHO® Kerala",
  description: "Privacy Policy and customer data protection commitments of Furcho (furcho.in).",
};

export default async function PrivacyPolicyPage() {
  const settings = await getSiteSettings();
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF5ED]">
      <Header settings={settings} variant="EVERYDAY" />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <div className="rounded-3xl bg-white border border-[#EFE3D4] p-8 sm:p-12 shadow-soft space-y-6 text-sm leading-relaxed text-[#4E3B30]">
          <h1 className="text-3xl font-extrabold text-[#29221D]">Privacy Policy</h1>
          <p className="text-xs text-[#6E5D52]">Effective Date: November 2026 • furcho.in</p>
          <p>
            At <strong>FURCHO®</strong> (&ldquo;Furniture For A Better Living&rdquo;), we respect your privacy
            and are committed to safeguarding the personal details you share when submitting an
            Order Request or a Custom Furniture Enquiry.
          </p>
          <h2 className="text-lg font-bold text-[#29221D]">1. Information We Collect</h2>
          <p>
            We collect only the information required to process your order request or custom project
            quotation: your name, mobile number, optional email address, delivery address, Kerala
            district, PIN code, and any reference images or specifications you upload.
          </p>
          <h2 className="text-lg font-bold text-[#29221D]">2. How We Use Your Data</h2>
          <p>
            Your contact and address information is used strictly by authorized Furcho staff to
            confirm product availability, calculate accurate delivery charges to your PIN code,
            dispatch your furniture, and send custom quotations via phone or WhatsApp.
          </p>
          <h2 className="text-lg font-bold text-[#29221D]">3. Database &amp; Row Level Security</h2>
          <p>
            All customer order requests and custom enquiry attachments are protected by strict Row
            Level Security (RLS). Public visitors can never access other customers&apos; order
            records or private enquiry attachments.
          </p>
        </div>
      </main>
      <Footer settings={settings} variant="EVERYDAY" />
    </div>
  );
}
