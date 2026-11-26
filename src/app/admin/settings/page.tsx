"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Clock, Megaphone, Share2 } from "lucide-react";
import { Product, SiteSettings } from "@/types/database";
import { paiseToRupees, rupeesToPaise } from "@/lib/utils";
import { AdminShell } from "@/components/admin/AdminShell";
import { ModernSelect } from "@/components/ui/ModernSelect";
import { useToast } from "@/components/providers/ToastProvider";

export default function AdminSettingsPage() {
  const router = useRouter();
  const toast = useToast();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [promoPriceRupees, setPromoPriceRupees] = useState("2999");
  const [isTimerEnabled, setIsTimerEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/cms");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setSettings(data.site_settings);
      setProducts(data.products || []);
      if (data.site_settings) {
        setPromoPriceRupees(String(paiseToRupees(data.site_settings.promo_price_paise)));
        setIsTimerEnabled(Boolean(data.site_settings.promo_countdown_end));
      }
    } catch {
      toast.error("Load Error", "Failed to load site settings.");
    }
  }, [router, toast]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    try {
      const midnightTonight = new Date();
      midnightTonight.setHours(24, 0, 0, 0);

      const payload: Partial<SiteSettings> = {
        ...settings,
        promo_price_paise: rupeesToPaise(promoPriceRupees),
        promo_countdown_end: isTimerEnabled ? midnightTonight.toISOString() : null,
      };

      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "settings",
          action: "upsert",
          payload,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings.");

      setSettings(data.settings);
      toast.success(
        "Settings Saved",
        "Homepage announcement bar, countdown offer, and Meta tracking updated."
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save settings.";
      toast.error("Save Error", msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (!settings) {
    return (
      <AdminShell title="Site & Promotional Settings">
        <p className="text-sm text-[#6E5D52]">Loading configuration...</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Site & Promotional Settings"
      subtitle="Configure the Announcement Bar, Featured Hero Product, Timed Countdown Offer, WhatsApp & Meta Pixel"
    >
      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        {/* 1. Announcement Bar */}
        <div className="rounded-3xl bg-white border border-[#E5D5C3] p-6 sm:p-8 shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-[#EFE3D4] pb-3">
            <Megaphone className="w-5 h-5 text-[#633719]" />
            <h2 className="text-lg font-extrabold text-[#29221D]">
              1. Homepage Announcement Bar
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-8">
              <label className="block text-xs font-bold uppercase mb-1">
                Announcement Promotional Text
              </label>
              <input
                type="text"
                value={settings.announcement_text}
                onChange={(e) =>
                  setSettings({ ...settings, announcement_text: e.target.value })
                }
                className="w-full rounded-xl border border-[#D8C7B4] bg-[#FAF5ED] px-3.5 py-2.5 text-sm font-semibold"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-bold uppercase mb-1">
                Badge Label
              </label>
              <input
                type="text"
                value={settings.announcement_badge}
                onChange={(e) =>
                  setSettings({ ...settings, announcement_badge: e.target.value })
                }
                className="w-full rounded-xl border border-[#D8C7B4] bg-[#FAF5ED] px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-xs font-bold cursor-pointer">
            <input
              type="checkbox"
              checked={settings.announcement_enabled}
              onChange={(e) =>
                setSettings({ ...settings, announcement_enabled: e.target.checked })
              }
              className="accent-[#633719]"
            />
            <span>Display Announcement Bar at Top of Storefront</span>
          </label>
        </div>

        {/* 2. Featured Hero Product & Real Promotional Countdown Timer */}
        <div className="rounded-3xl bg-white border border-[#E5D5C3] p-6 sm:p-8 shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-[#EFE3D4] pb-3">
            <Clock className="w-5 h-5 text-[#633719]" />
            <h2 className="text-lg font-extrabold text-[#29221D]">
              2. Featured Hero Product &amp; Promotional Countdown Timer
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1">
                Featured Hero Product
              </label>
              <ModernSelect
                options={products
                  .filter((p) => p.store_section === "EVERYDAY")
                  .map((p) => ({ value: p.slug, label: `${p.name} (${p.sku})` }))}
                value={settings.featured_product_slug}
                onChange={(val) =>
                  setSettings({ ...settings, featured_product_slug: val })
                }
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">
                Promotional Launch Price (₹ INR)
              </label>
              <input
                type="number"
                value={promoPriceRupees}
                onChange={(e) => setPromoPriceRupees(e.target.value)}
                className="w-full rounded-xl border border-[#D8C7B4] bg-[#FAF5ED] px-3.5 py-2.5 text-sm font-bold"
              />
            </div>

            <div className="sm:col-span-2 pt-3 border-t border-[#DECAB2]/60">
              <label className="flex items-start sm:items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isTimerEnabled}
                  onChange={(e) => setIsTimerEnabled(e.target.checked)}
                  className="w-5 h-5 rounded-md accent-[#633719] cursor-pointer shrink-0 mt-0.5 sm:mt-0"
                />
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-[#3B2418] block">
                    Show Promotional Countdown Timer (Daily Midnight Timer)
                  </span>
                  <span className="text-xs text-[#6E5D52] block">
                    When checked (ON), counts down remaining hours, minutes, and seconds until midnight (12:00 AM) and restarts daily. When unchecked (OFF), completely hidden from storefront.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* 3. Contact, Footer & Meta Pixel Tracking */}
        <div className="rounded-3xl bg-white border border-[#E5D5C3] p-6 sm:p-8 shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-[#EFE3D4] pb-3">
            <Share2 className="w-5 h-5 text-[#633719]" />
            <h2 className="text-lg font-extrabold text-[#29221D]">
              3. WhatsApp, Support Contact, Footer &amp; Meta Ads Pixel
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1">
                WhatsApp Number (with 91 country code)
              </label>
              <input
                type="text"
                value={settings.whatsapp_number}
                onChange={(e) =>
                  setSettings({ ...settings, whatsapp_number: e.target.value })
                }
                className="w-full rounded-xl border border-[#D8C7B4] bg-[#FAF5ED] px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">
                Support Phone Display
              </label>
              <input
                type="text"
                value={settings.support_phone}
                onChange={(e) =>
                  setSettings({ ...settings, support_phone: e.target.value })
                }
                className="w-full rounded-xl border border-[#D8C7B4] bg-[#FAF5ED] px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">
                Support Email
              </label>
              <input
                type="email"
                value={settings.support_email}
                onChange={(e) =>
                  setSettings({ ...settings, support_email: e.target.value })
                }
                className="w-full rounded-xl border border-[#D8C7B4] bg-[#FAF5ED] px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">
                Meta (Facebook / Instagram) Pixel ID
              </label>
              <input
                type="text"
                value={settings.meta_pixel_id}
                onChange={(e) =>
                  setSettings({ ...settings, meta_pixel_id: e.target.value })
                }
                placeholder="e.g. 123456789012345"
                className="w-full rounded-xl border border-[#D8C7B4] bg-[#FAF5ED] px-3.5 py-2.5 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase mb-1">
                Footer Brand Tagline
              </label>
              <input
                type="text"
                value={settings.footer_tagline}
                onChange={(e) =>
                  setSettings({ ...settings, footer_tagline: e.target.value })
                }
                className="w-full rounded-xl border border-[#D8C7B4] bg-[#FAF5ED] px-3.5 py-2.5 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase mb-1">
                Studio / Showroom Address (Kerala)
              </label>
              <input
                type="text"
                value={settings.address_line}
                onChange={(e) =>
                  setSettings({ ...settings, address_line: e.target.value })
                }
                className="w-full rounded-xl border border-[#D8C7B4] bg-[#FAF5ED] px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>
        </div>

        {/* 4. Hero Background Visuals (Desktop Full BG & Mobile Dedicated Image) */}
        <div className="rounded-3xl bg-white border border-[#E5D5C3] p-6 sm:p-8 shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-[#EFE3D4] pb-3">
            <Share2 className="w-5 h-5 text-[#633719]" />
            <h2 className="text-lg font-extrabold text-[#29221D]">
              4. Hero Banner Images (Full Desktop BG &amp; Mobile Image)
            </h2>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-[#6E5D52]">
              Upload separate visual assets for the desktop full-bleed background and the mobile view.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-[#EFE3D4] p-4 bg-[#FAF5ED]/50 space-y-2">
                <span className="text-xs font-extrabold uppercase text-[#633719] block">
                  Desktop Full Background Image
                </span>
                <p className="text-[11px] text-[#6E5D52]">
                  Displays right-aligned across the entire hero banner on desktop viewports.
                </p>
                <div className="mt-2">
                  <input
                    type="text"
                    value={settings.hero_bg_image || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, hero_bg_image: e.target.value })
                    }
                    placeholder="/images/products/ironing-table-hero-bg.jpg or Cloudinary URL"
                    className="w-full rounded-xl border border-[#D8C7B4] bg-white px-3.5 py-2 text-xs text-[#29221D] mb-2"
                  />
                  {settings.hero_bg_image && (
                    <div className="h-32 rounded-xl overflow-hidden border border-[#D8C7B4] bg-[#EFE3D4]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={settings.hero_bg_image}
                        alt="Desktop Hero BG Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-[#EFE3D4] p-4 bg-[#FAF5ED]/50 space-y-2">
                <span className="text-xs font-extrabold uppercase text-[#633719] block">
                  Mobile Dedicated Hero Image
                </span>
                <p className="text-[11px] text-[#6E5D52]">
                  Displays directly below product details on smartphones and tablets (&lt; 1024px).
                </p>
                <div className="mt-2">
                  <input
                    type="text"
                    value={settings.hero_mobile_image || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, hero_mobile_image: e.target.value })
                    }
                    placeholder="/images/products/ironing-table-hero-mobile.jpg or Cloudinary URL"
                    className="w-full rounded-xl border border-[#D8C7B4] bg-white px-3.5 py-2 text-xs text-[#29221D] mb-2"
                  />
                  {settings.hero_mobile_image && (
                    <div className="h-32 rounded-xl overflow-hidden border border-[#D8C7B4] bg-[#EFE3D4]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={settings.hero_mobile_image}
                        alt="Mobile Hero Image Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#633719] px-7 py-3.5 text-sm font-bold text-white hover:bg-[#3B2418] transition shadow-card cursor-pointer"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>Save All Site &amp; Promotional Settings</span>
          </button>
        </div>
      </form>
    </AdminShell>
  );
}
