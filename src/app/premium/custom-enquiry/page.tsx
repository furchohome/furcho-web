"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  Loader2,
  MessageCircle,
  Sparkles,
  Wrench,
  ArrowRight,
} from "lucide-react";
import { customEnquirySchema, CustomEnquiryFormValues } from "@/lib/validations";
import { buildWhatsAppLink } from "@/lib/utils";
import { INITIAL_DB_STATE } from "@/lib/db/initial-data";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { useToast } from "@/components/providers/ToastProvider";
import { Enquiry, StoreSectionCode } from "@/types/database";
import { trackMetaEvent } from "@/components/tracking/MetaPixel";

const EVERYDAY_ENQUIRY_CATEGORIES = [
  "Modified Dimensions",
  "Bulk Orders",
  "Custom Finishes",
  "Special Product Requests",
];

const PREMIUM_ENQUIRY_CATEGORIES = [
  "Custom Furniture",
  "Custom Dimensions",
  "Wood / Material Selection",
  "Bedroom Furniture Projects",
  "Restaurant & Commercial Furniture",
  "Commercial Furniture Projects",
];

function CustomEnquiryFormContent() {
  const searchParams = useSearchParams();
  const initialSection =
    (searchParams.get("section") as StoreSectionCode) === "EVERYDAY"
      ? "EVERYDAY"
      : "PREMIUM";
  const initialProduct = searchParams.get("product") || "";
  const initialCategory = searchParams.get("category") || "";

  const toast = useToast();
  const settings = INITIAL_DB_STATE.site_settings;
  const [referenceImageUrl, setReferenceImageUrl] = useState("");
  const [referenceImageName, setReferenceImageName] = useState("");
  const [submittedEnquiry, setSubmittedEnquiry] = useState<Enquiry | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CustomEnquiryFormValues>({
    resolver: zodResolver(customEnquirySchema),
    defaultValues: {
      customer_name: "",
      mobile_number: "",
      email: "",
      store_section: initialSection,
      enquiry_category:
        initialCategory ||
        (initialSection === "PREMIUM"
          ? PREMIUM_ENQUIRY_CATEGORIES[0]
          : EVERYDAY_ENQUIRY_CATEGORIES[0]),
      product_reference: initialProduct,
      requirement_description: "",
      preferred_dimensions: "",
      material_finish: "",
      budget_range: "",
      project_location: "",
    },
  });

  const activeSection = watch("store_section");
  const isPremium = activeSection === "PREMIUM";
  const categoryOptions = isPremium
    ? PREMIUM_ENQUIRY_CATEGORIES
    : EVERYDAY_ENQUIRY_CATEGORIES;

  const onSubmit = async (values: CustomEnquiryFormValues) => {
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          attachment_urls: referenceImageUrl
            ? [{ url: referenceImageUrl, name: referenceImageName || "reference-image.jpg" }]
            : [],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit custom enquiry.");
      }

      setSubmittedEnquiry(data.enquiry);
      trackMetaEvent("Lead", {
        content_name: `Custom Enquiry (${values.store_section})`,
        content_category: values.enquiry_category,
      });

      toast.success(
        "Custom Enquiry Received!",
        `Reference: ${data.enquiry.enquiry_number}`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not submit enquiry.";
      toast.error("Enquiry Submission Error", msg);
    }
  };

  if (submittedEnquiry) {
    const waLink = buildWhatsAppLink(
      settings.whatsapp_number,
      `Hi Furcho Design Desk! I submitted a Custom Furniture Enquiry.\n\nReference: *${submittedEnquiry.enquiry_number}*\nDivision: ${submittedEnquiry.store_section}\nCategory: ${submittedEnquiry.enquiry_category}\nLocation: ${submittedEnquiry.project_location}\nRequirement: ${submittedEnquiry.requirement_description}`
    );

    return (
      <div className="min-h-screen flex flex-col bg-[#FAF5ED]">
        <Header settings={settings} variant={activeSection} />
        <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-12">
          <div className="rounded-3xl bg-white border border-[#EFE3D4] p-8 shadow-elevated text-center space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <span className="inline-block rounded-full bg-[#EFE0CC] px-3.5 py-1 text-xs font-extrabold text-[#633719]">
              Enquiry Reference: {submittedEnquiry.enquiry_number}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#29221D]">
              We&apos;ve Received Your Custom Requirement!
            </h1>
            <p className="text-sm text-[#6E5D52] leading-relaxed">
              Our {submittedEnquiry.store_section === "PREMIUM" ? "Premium Living" : "Everyday Living"}{" "}
              project consultant will review your specifications, dimensions, and reference attachments
              and contact you on <strong>{submittedEnquiry.mobile_number}</strong> with a formal
              quotation.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3.5 text-sm font-bold text-white hover:bg-emerald-800 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Discuss on WhatsApp</span>
              </a>
              <Link
                href={submittedEnquiry.store_section === "PREMIUM" ? "/premium" : "/"}
                className="inline-flex items-center justify-center rounded-xl border border-[#D8C7B4] bg-[#FAF5ED] px-6 py-3.5 text-sm font-bold text-[#29221D]"
              >
                Return to Storefront
              </Link>
            </div>
          </div>
        </main>
        <Footer settings={settings} variant={activeSection} />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isPremium ? "bg-[#24150E] text-[#FAF5ED]" : "bg-[#FAF5ED] text-[#29221D]"
      }`}
    >
      <Header settings={settings} variant={activeSection} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#C58B45]/20 border border-[#C58B45]/40 px-4 py-1 text-xs font-bold uppercase tracking-widest text-[#C58B45]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>BESPOKE &amp; COMMERCIAL FURNITURE DESK</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold">
            Request a Custom Furniture Quotation
          </h1>
          <p className="text-sm opacity-85 leading-relaxed">
            Whether you need modified dimensions or bulk orders in <strong>Everyday Living</strong>, or
            bespoke solid wood residential, restaurant, café and resort projects in{" "}
            <strong>Premium Living</strong>, tell us what you envision.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-3xl bg-white text-[#29221D] border border-[#EFE3D4] p-6 sm:p-10 shadow-elevated space-y-6"
        >
          {/* Division Switcher */}
          <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-[#FAF5ED] border border-[#EFE3D4]">
            <button
              type="button"
              onClick={() => {
                setValue("store_section", "EVERYDAY");
                setValue("enquiry_category", EVERYDAY_ENQUIRY_CATEGORIES[0]);
              }}
              className={`rounded-xl py-3 text-xs sm:text-sm font-extrabold transition ${
                activeSection === "EVERYDAY"
                  ? "bg-[#633719] text-white shadow-soft"
                  : "text-[#6E5D52] hover:text-[#29221D]"
              }`}
            >
              Everyday Living Enquiry (Modified / Bulk)
            </button>
            <button
              type="button"
              onClick={() => {
                setValue("store_section", "PREMIUM");
                setValue("enquiry_category", PREMIUM_ENQUIRY_CATEGORIES[0]);
              }}
              className={`rounded-xl py-3 text-xs sm:text-sm font-extrabold transition ${
                activeSection === "PREMIUM"
                  ? "bg-[#3B2418] text-[#C58B45] border border-[#C58B45]/50 shadow-soft"
                  : "text-[#6E5D52] hover:text-[#29221D]"
              }`}
            >
              Premium Living Enquiry (Solid Wood / Commercial)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Customer Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#29221D] mb-1.5">
                Customer / Business Name *
              </label>
              <input
                type="text"
                {...register("customer_name")}
                placeholder="Your full name or restaurant/company name"
                className="w-full rounded-xl border border-[#D8C7B4] bg-[#FAF5ED]/60 px-3.5 py-2.5 text-sm focus:border-[#633719] focus:outline-none"
              />
              {errors.customer_name && (
                <p className="text-xs text-red-600 mt-1">{errors.customer_name.message}</p>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#29221D] mb-1.5">
                Mobile Number (WhatsApp) *
              </label>
              <input
                type="tel"
                {...register("mobile_number")}
                placeholder="10-digit mobile number"
                className="w-full rounded-xl border border-[#D8C7B4] bg-[#FAF5ED]/60 px-3.5 py-2.5 text-sm focus:border-[#633719] focus:outline-none"
              />
              {errors.mobile_number && (
                <p className="text-xs text-red-600 mt-1">{errors.mobile_number.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6E5D52] mb-1.5">
                Email Address (Optional)
              </label>
              <input
                type="email"
                {...register("email")}
                placeholder="you@company.com"
                className="w-full rounded-xl border border-[#D8C7B4] bg-[#FAF5ED]/60 px-3.5 py-2.5 text-sm focus:border-[#633719] focus:outline-none"
              />
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Project Location */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#29221D] mb-1.5">
                Project Location (City &amp; District in Kerala) *
              </label>
              <input
                type="text"
                {...register("project_location")}
                placeholder="e.g. Kozhikode, Kochi, Thrissur, Wayanad"
                className="w-full rounded-xl border border-[#D8C7B4] bg-[#FAF5ED]/60 px-3.5 py-2.5 text-sm focus:border-[#633719] focus:outline-none"
              />
              {errors.project_location && (
                <p className="text-xs text-red-600 mt-1">{errors.project_location.message}</p>
              )}
            </div>

            {/* Enquiry Category */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#29221D] mb-1.5">
                Enquiry Category *
              </label>
              <select
                {...register("enquiry_category")}
                className="w-full rounded-xl border border-[#D8C7B4] bg-[#FAF5ED]/60 px-3.5 py-2.5 text-sm focus:border-[#633719] focus:outline-none"
              >
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Reference */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6E5D52] mb-1.5">
                Product Reference (If based on an existing piece)
              </label>
              <input
                type="text"
                {...register("product_reference")}
                placeholder="e.g. Foldable Ironing Table / Malabar Dining Set"
                className="w-full rounded-xl border border-[#D8C7B4] bg-[#FAF5ED]/60 px-3.5 py-2.5 text-sm focus:border-[#633719] focus:outline-none"
              />
            </div>

            {/* Preferred Dimensions */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6E5D52] mb-1.5">
                Preferred Dimensions (L × W × H)
              </label>
              <input
                type="text"
                {...register("preferred_dimensions")}
                placeholder="e.g. 180cm x 90cm or King Size 78x72 inches"
                className="w-full rounded-xl border border-[#D8C7B4] bg-[#FAF5ED]/60 px-3.5 py-2.5 text-sm focus:border-[#633719] focus:outline-none"
              />
            </div>

            {/* Material / Finish */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6E5D52] mb-1.5">
                Preferred Wood / Material &amp; Finish
              </label>
              <input
                type="text"
                {...register("material_finish")}
                placeholder="e.g. Nilambur Teak, Walnut Stain, Rattan Cane, Ivory Matte"
                className="w-full rounded-xl border border-[#D8C7B4] bg-[#FAF5ED]/60 px-3.5 py-2.5 text-sm focus:border-[#633719] focus:outline-none"
              />
            </div>

            {/* Budget Range */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6E5D52] mb-1.5">
                Estimated Budget Range (Optional)
              </label>
              <input
                type="text"
                {...register("budget_range")}
                placeholder="e.g. ₹25,000 - ₹50,000 or ₹3,00,000+ for commercial project"
                className="w-full rounded-xl border border-[#D8C7B4] bg-[#FAF5ED]/60 px-3.5 py-2.5 text-sm focus:border-[#633719] focus:outline-none"
              />
            </div>

            {/* Requirement Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#29221D] mb-1.5">
                Detailed Requirement Description *
              </label>
              <textarea
                rows={4}
                {...register("requirement_description")}
                placeholder="Describe your space, quantity required, design preferences, or timeline..."
                className="w-full rounded-xl border border-[#D8C7B4] bg-[#FAF5ED]/60 px-3.5 py-2.5 text-sm focus:border-[#633719] focus:outline-none"
              />
              {errors.requirement_description && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.requirement_description.message}
                </p>
              )}
            </div>

            {/* Reference Image / Sketch Upload */}
            <div className="sm:col-span-2">
              <ImageUploadField
                label="Reference Image / Floor Plan Upload (Optional)"
                folder="enquiries"
                value={referenceImageUrl}
                onChange={(url, name) => {
                  setReferenceImageUrl(url);
                  setReferenceImageName(name || "");
                }}
                helperText="Upload a sketch, room photo, or inspiration image (JPG, PNG, WebP or PDF)"
                acceptPdf
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#633719] px-6 py-4 text-base font-bold text-white hover:bg-[#3B2418] transition shadow-card disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Submitting Enquiry...</span>
              </>
            ) : (
              <>
                <Wrench className="w-5 h-5" />
                <span>Submit Custom Furniture Enquiry</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </main>

      <Footer settings={settings} variant={activeSection} />
    </div>
  );
}

export default function CustomEnquiryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF5ED]" />}>
      <CustomEnquiryFormContent />
    </Suspense>
  );
}
