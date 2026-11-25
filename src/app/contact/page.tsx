import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Mail, MapPin, MessageCircle, Clock, Wrench } from "lucide-react";
import { getSiteSettings } from "@/lib/db";
import { buildWhatsAppLink } from "@/lib/utils";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";

export const metadata: Metadata = {
  title: "Contact FURCHO® — Customer Support & Custom Project Desk",
  description:
    "Get in touch with Furcho Kerala for order confirmations, delivery enquiries, custom furniture requests, and restaurant/commercial quotes.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const waLink = buildWhatsAppLink(
    settings.whatsapp_number,
    "Hello Furcho Team! I would like assistance with a furniture enquiry."
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF5ED]">
      <Header settings={settings} variant="EVERYDAY" />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
        <div className="text-center space-y-3">
          <span className="rounded-full bg-[#EFE0CC] border border-[#DEC7AC] px-4 py-1 text-xs font-extrabold uppercase tracking-widest text-[#8A5424]">
            WE&apos;RE HERE TO HELP
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#3B2418]">
            Contact Furcho Kerala
          </h1>
          <p className="text-sm sm:text-base text-[#5A4638] max-w-xl mx-auto">
            Have a question about our Foldable Wall-Mounted Ironing Table, delivery charges in your
            district, or a bespoke commercial furniture project? Reach out directly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-3xl bg-white border border-[#EFE3D4] p-6 shadow-soft space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAF5ED] text-[#633719]">
              <Phone className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-extrabold text-[#29221D]">Phone &amp; WhatsApp</h2>
            <p className="text-xs text-[#6E5D52]">
              Call or message our Kerala customer desk for fast order and delivery support.
            </p>
            <p className="text-base font-black text-[#633719]">{settings.support_phone}</p>
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          </div>

          <div className="rounded-3xl bg-white border border-[#EFE3D4] p-6 shadow-soft space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAF5ED] text-[#633719]">
              <Mail className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-extrabold text-[#29221D]">Email &amp; Quotations</h2>
            <p className="text-xs text-[#6E5D52]">
              Send us architectural drawings, bulk order lists, or support queries.
            </p>
            <p className="text-base font-black text-[#633719]">{settings.support_email}</p>
            <Link
              href="/premium/custom-enquiry"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#633719] px-4 py-2 text-xs font-bold text-white hover:bg-[#3B2418] transition"
            >
              <Wrench className="w-3.5 h-3.5" />
              Submit Online Enquiry
            </Link>
          </div>

          <div className="rounded-3xl bg-white border border-[#EFE3D4] p-6 shadow-soft space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAF5ED] text-[#633719]">
              <MapPin className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-extrabold text-[#29221D]">Studio &amp; Dispatch</h2>
            <p className="text-xs text-[#6E5D52] leading-relaxed">{settings.address_line}</p>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8A5424] pt-1">
              <Clock className="w-4 h-4" />
              <span>Mon – Sat: 9:30 AM – 7:00 PM IST</span>
            </div>
          </div>
        </div>
      </main>

      <Footer settings={settings} variant="EVERYDAY" />
    </div>
  );
}
