"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, Loader2, CheckCircle2, Image as ImageIcon, Info } from "lucide-react";
import { Banner, Product, StoreSectionCode } from "@/types/database";
import { formatPaiseToINR, paiseToRupees, rupeesToPaise } from "@/lib/utils";
import { AdminShell } from "@/components/admin/AdminShell";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal";
import { useToast } from "@/components/providers/ToastProvider";
import { useAdminCms } from "@/hooks/useAdminCms";

export default function AdminBannersPage() {
  const router = useRouter();
  const toast = useToast();
  const { banners, products, isLoading, invalidate } = useAdminCms();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null);
  const [priceRupees, setPriceRupees] = useState("");
  const [showMobileSizeInfo, setShowMobileSizeInfo] = useState(false);
  const [showDesktopSizeInfo, setShowDesktopSizeInfo] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openCreate = () => {
    setEditingBanner({
      placement: "HERO",
      store_section: "EVERYDAY",
      product_id: null,
      product_slug: null,
      title: "",
      subtitle: "",
      badge_text: "",
      price_paise: null,
      launch_price_label: "Launch Price",
      cta_primary_text: "Order Now",
      cta_primary_link: "/",
      cta_secondary_text: "View Details",
      cta_secondary_link: "/",
      image_url: "/images/products/ironing-table-hero-bg.jpg",
      mobile_image_url: "/images/products/ironing-table-hero-mobile.jpg",
      display_order: banners.length + 1,
      is_active: true,
    });
    setPriceRupees("");
    setIsModalOpen(true);
  };

  const openEdit = (ban: Banner) => {
    setEditingBanner({ ...ban });
    setPriceRupees(
      ban.price_paise !== null && ban.price_paise !== undefined
        ? String(paiseToRupees(ban.price_paise))
        : ""
    );
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner?.title || !editingBanner?.image_url) return;
    setIsSaving(true);
    try {
      const payload: Partial<Banner> = {
        ...editingBanner,
        price_paise: priceRupees.trim() ? rupeesToPaise(priceRupees) : null,
      };

      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "banner",
          action: "upsert",
          payload,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save banner.");

      toast.success("Banner Saved", `"${data.banner.title}" updated.`);
      setIsModalOpen(false);
      await invalidate();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save banner.";
      toast.error("Save Error", msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "banner",
          action: "delete",
          payload: { id: deleteTarget.id },
        }),
      });
      if (!res.ok) throw new Error("Failed to delete banner.");
      toast.success("Banner Deleted", `"${deleteTarget.title}" removed.`);
      setDeleteTarget(null);
      await invalidate();
    } catch {
      toast.error("Delete Error", "Failed to delete banner.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminShell
      title="Banner & Promotional Visuals"
      subtitle="Edit Headline, Subtitle, Price, Desktop Image & Mobile Image for every banner (Hero auto-slides at 4s)"
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-[#633719] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#3B2418] transition shadow-soft cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Promotional Banner</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center gap-3 bg-white/60 rounded-3xl border border-[#DFCBB3]">
              <Loader2 className="w-7 h-7 animate-spin text-[#633719]" />
              <p className="text-sm font-bold text-[#6E5D52]">Loading banners &amp; visuals...</p>
            </div>
          ) : banners.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white/60 rounded-3xl border border-[#DFCBB3] p-6 space-y-3">
              <p className="text-base font-extrabold text-[#3B2418]">No promotional banners found</p>
              <p className="text-xs text-[#6E5D52]">Click &quot;+ Add Promotional Banner&quot; above to create your first hero or promo banner.</p>
            </div>
          ) : (
            banners.map((ban) => (
              <div
                key={ban.id}
                className="rounded-3xl bg-white border border-[#E5D5C3] overflow-hidden shadow-soft flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 w-full bg-[#EFE3D4]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ban.image_url}
                      alt={ban.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-[#3B2418]/90 text-[#C58B45] px-3 py-1 text-[10px] font-extrabold">
                        {ban.placement} • {ban.store_section}
                      </span>
                      {ban.placement === "HERO" && (
                        <span className="rounded-full bg-emerald-800 text-white px-2.5 py-1 text-[10px] font-bold">
                          Hero Slider (4s Auto)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-extrabold text-[#29221D]">{ban.title}</h3>
                      {ban.price_paise ? (
                        <span className="text-sm font-black text-[#4B2913] shrink-0">
                          {formatPaiseToINR(ban.price_paise)}
                        </span>
                      ) : null}
                    </div>

                    <p className="text-xs text-[#6E5D52]">{ban.subtitle}</p>

                    {ban.product_id ? (
                      <div className="bg-[#FAF5ED] px-3 py-1.5 rounded-xl border border-[#DECBB3] flex items-center justify-between text-xs">
                        <span className="font-bold text-[#633719]">Linked Product:</span>
                        <span className="font-extrabold text-[#3B2418]">
                          {products.find((p) => p.id === ban.product_id)?.name || ban.product_slug}
                        </span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-[#8C7A6B] italic">
                        No specific product linked (uses default hero product)
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="bg-[#FAF5ED] p-2 rounded-lg border border-[#EFE3D4]">
                        <span className="font-bold text-[#633719] block">Desktop BG:</span>
                        <span className="truncate block opacity-80">{ban.image_url}</span>
                      </div>
                      <div className="bg-[#FAF5ED] p-2 rounded-lg border border-[#EFE3D4]">
                        <span className="font-bold text-[#633719] block">Mobile View:</span>
                        <span className="truncate block opacity-80">{ban.mobile_image_url || "Same as desktop"}</span>
                      </div>
                    </div>

                    <p className="text-xs font-bold text-[#633719] pt-1">
                      CTA: {ban.cta_primary_text || "Order Now"} → {ban.cta_primary_link}
                    </p>
                  </div>
                </div>

                <div className="border-t border-[#EFE3D4] px-5 py-3 bg-[#FAF5ED]/60 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(ban)}
                    className="inline-flex items-center gap-1 rounded-xl border border-[#D8C7B4] bg-white px-3.5 py-1.5 text-xs font-bold text-[#633719] hover:bg-[#633719] hover:text-white transition cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(ban)}
                    className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-600 hover:text-white transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Banner Modal */}
      {isModalOpen && editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#FAF5ED] border border-[#E5D5C3] p-6 sm:p-8 shadow-elevated space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5D5C3] pb-3">
              <div>
                <h2 className="text-lg font-extrabold text-[#29221D]">
                  {editingBanner.id ? "Edit Banner & Visuals" : "Add New Banner"}
                </h2>
                <p className="text-xs text-[#6E5D52]">
                  Customize headline, subtitle, price, desktop image &amp; mobile image
                </p>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-[#EFE3D4]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Placement *</label>
                  <select
                    value={editingBanner.placement || "HERO"}
                    onChange={(e) =>
                      setEditingBanner({
                        ...editingBanner,
                        placement: e.target.value as Banner["placement"],
                      })
                    }
                    className="w-full rounded-xl border border-[#D8C7B4] bg-white px-3 py-2 text-sm font-semibold"
                  >
                    <option value="HERO">HERO (Auto-slides at 4s on Homepage)</option>
                    <option value="PREMIUM_PROMO">PREMIUM_PROMO</option>
                    <option value="CUSTOM_PROMO">CUSTOM_PROMO</option>
                    <option value="COMMERCIAL_PROMO">COMMERCIAL_PROMO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Division *</label>
                  <select
                    value={editingBanner.store_section || "EVERYDAY"}
                    onChange={(e) =>
                      setEditingBanner({
                        ...editingBanner,
                        store_section: e.target.value as StoreSectionCode,
                      })
                    }
                    className="w-full rounded-xl border border-[#D8C7B4] bg-white px-3 py-2 text-sm"
                  >
                    <option value="EVERYDAY">EVERYDAY</option>
                    <option value="PREMIUM">PREMIUM</option>
                  </select>
                </div>
              </div>

              {/* Linked Product Selector */}
              <div>
                <label className="block text-xs font-bold uppercase mb-1">
                  Linked Product (Which product is this carousel banner for?)
                </label>
                <select
                  value={editingBanner.product_id || ""}
                  onChange={(e) => {
                    const selId = e.target.value;
                    const prod = products.find((p) => p.id === selId);
                    if (prod) {
                      setEditingBanner({
                        ...editingBanner,
                        product_id: prod.id,
                        product_slug: prod.slug,
                        title: editingBanner.title || prod.name,
                        subtitle: editingBanner.subtitle || prod.short_description,
                        cta_primary_link: `/products/${prod.slug}`,
                        cta_secondary_link: `/products/${prod.slug}`,
                        price_paise: prod.selling_price_paise,
                        launch_price_label: prod.launch_price_label || editingBanner.launch_price_label || "Launch Price",
                      });
                      setPriceRupees(String(paiseToRupees(prod.selling_price_paise)));
                    } else {
                      setEditingBanner({
                        ...editingBanner,
                        product_id: null,
                        product_slug: null,
                      });
                    }
                  }}
                  className="w-full rounded-xl border border-[#D8C7B4] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#29221D]"
                >
                  <option value="">-- No specific linked product (Default Hero Product) --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.store_section}) — ₹{paiseToRupees(p.selling_price_paise)}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#6E5D52] mt-1">
                  When linked, clicking &quot;Order Now&quot; creates an order for this exact product, and &quot;View Details&quot; opens its detail page.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">Banner Headline *</label>
                <input
                  type="text"
                  required
                  value={editingBanner.title || ""}
                  onChange={(e) =>
                    setEditingBanner({ ...editingBanner, title: e.target.value })
                  }
                  placeholder="e.g. Foldable Wall-Mounted Ironing Table"
                  className="w-full rounded-xl border border-[#D8C7B4] bg-white px-3.5 py-2.5 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">Subtitle / Description</label>
                <input
                  type="text"
                  value={editingBanner.subtitle || ""}
                  onChange={(e) =>
                    setEditingBanner({ ...editingBanner, subtitle: e.target.value })
                  }
                  placeholder="A space-saving, durable and stylish solution for everyday ironing."
                  className="w-full rounded-xl border border-[#D8C7B4] bg-white px-3.5 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Price (₹ INR - Optional)</label>
                  <input
                    type="number"
                    value={priceRupees}
                    onChange={(e) => setPriceRupees(e.target.value)}
                    placeholder="e.g. 2999"
                    className="w-full rounded-xl border border-[#D8C7B4] bg-white px-3.5 py-2 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Launch / Price Badge</label>
                  <input
                    type="text"
                    value={editingBanner.launch_price_label || ""}
                    onChange={(e) =>
                      setEditingBanner({
                        ...editingBanner,
                        launch_price_label: e.target.value,
                      })
                    }
                    placeholder="e.g. Launch Price"
                    className="w-full rounded-xl border border-[#D8C7B4] bg-white px-3.5 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={editingBanner.cta_primary_text || ""}
                    onChange={(e) =>
                      setEditingBanner({
                        ...editingBanner,
                        cta_primary_text: e.target.value,
                      })
                    }
                    placeholder="Order Now"
                    className="w-full rounded-xl border border-[#D8C7B4] bg-white px-3.5 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">CTA Primary Link</label>
                  <input
                    type="text"
                    value={editingBanner.cta_primary_link || ""}
                    onChange={(e) =>
                      setEditingBanner({
                        ...editingBanner,
                        cta_primary_link: e.target.value,
                      })
                    }
                    placeholder="/products/foldable-wall-mounted-ironing-table"
                    className="w-full rounded-xl border border-[#D8C7B4] bg-white px-3.5 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Both Desktop & Mobile Images */}
              <div className="space-y-4 rounded-2xl bg-white border border-[#E5D5C3] p-4">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#633719]">
                  Responsive Banner Visuals (Desktop &amp; Mobile)
                </p>

                <div className="space-y-4">
                  {/* Desktop Image */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-[#29221D]">
                        Desktop View Image (Full BG or wide landscape) *
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowDesktopSizeInfo(!showDesktopSizeInfo)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8A5424] hover:text-[#633719] bg-[#FAF5ED] px-2.5 py-0.5 rounded-full border border-[#DECBB3] cursor-pointer"
                        title="Click to view recommended sizes"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>Desktop Size Guide</span>
                      </button>
                    </div>

                    {showDesktopSizeInfo && (
                      <div className="p-3 rounded-xl bg-[#FAF5ED] border border-[#DFCBB3] text-xs text-[#4E3B30] space-y-1">
                        <div className="font-extrabold text-[#633719] flex items-center gap-1.5">
                          <Info className="w-4 h-4 text-[#8A5424]" />
                          <span>Recommended Desktop Banner Size</span>
                        </div>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px] pt-1">
                          <li><strong>Dimensions:</strong> 1920 × 800 px (or 1600 × 700 px)</li>
                          <li><strong>Aspect Ratio:</strong> 16:9 or 21:9 wide landscape</li>
                          <li><strong>Layout:</strong> Place product on center/right side so left side accommodates headline &amp; CTA buttons.</li>
                        </ul>
                      </div>
                    )}

                    <ImageUploadField
                      label=""
                      folder="banners"
                      value={editingBanner.image_url || ""}
                      onChange={(url) =>
                        setEditingBanner({
                          ...editingBanner,
                          image_url: url,
                          mobile_image_url: editingBanner.mobile_image_url || url,
                        })
                      }
                      helperText="Used as seamless right/full background on desktop screens"
                    />
                  </div>

                  {/* Mobile Image */}
                  <div className="space-y-1.5 pt-2 border-t border-[#EFE3D4]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-[#29221D]">
                        Mobile View Image (Dedicated smartphone view)
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowMobileSizeInfo(!showMobileSizeInfo)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#633719] bg-[#F5E5C9] hover:bg-[#EFE0CC] px-2.5 py-0.5 rounded-full border border-[#DDB88C] cursor-pointer shadow-2xs"
                        title="Click to view recommended mobile dimensions"
                      >
                        <Info className="w-3.5 h-3.5 text-[#8A5424]" />
                        <span>Mobile Size Guide (i)</span>
                      </button>
                    </div>

                    {showMobileSizeInfo && (
                      <div className="p-3.5 rounded-xl bg-[#FFF9F2] border border-[#DECBB3] text-xs text-[#4E3B30] space-y-2">
                        <div className="font-extrabold text-[#633719] flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Info className="w-4 h-4 text-[#8A5424]" />
                            <span>Recommended Mobile Banner Size &amp; Specs</span>
                          </span>
                          <span className="text-[10px] bg-[#633719] text-white px-2 py-0.5 rounded-full font-bold">
                            4:3 Ratio
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-0.5">
                          <div className="bg-white p-2.5 rounded-lg border border-[#EFE3D4]">
                            <span className="font-bold text-[#633719] block text-[10px] uppercase">Ideal Resolution</span>
                            <span className="font-black text-sm text-[#29221D]">800 × 600 px</span>
                            <span className="block text-[10px] text-[#6E5D52] mt-0.5">(or 1000 × 750 px Retina)</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-lg border border-[#EFE3D4]">
                            <span className="font-bold text-[#633719] block text-[10px] uppercase">Aspect Ratio</span>
                            <span className="font-black text-sm text-[#29221D]">4 : 3</span>
                            <span className="block text-[10px] text-[#6E5D52] mt-0.5">(or 16:10 wide 800×500)</span>
                          </div>
                        </div>

                        <div className="text-[11px] text-[#6E5D52] space-y-1 bg-white/70 p-2 rounded-lg border border-[#EFE3D4]">
                          <p>
                            🎯 <strong>Why 4:3?</strong> It perfectly matches modern smartphone screens (iPhone, Samsung) so your product image fills the entire card edge-to-edge without any white side margins.
                          </p>
                          <p>
                            📷 <strong>Framing:</strong> Keep your product centered in the photo for the cleanest presentation.
                          </p>
                        </div>
                      </div>
                    )}

                    <ImageUploadField
                      label=""
                      folder="banners"
                      value={editingBanner.mobile_image_url || ""}
                      onChange={(url) => setEditingBanner({ ...editingBanner, mobile_image_url: url })}
                      helperText="Displayed inside the product image card on mobile viewports (< 768px)"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-[#D8C7B4] bg-white px-4 py-2.5 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#633719] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#3B2418] transition shadow-soft cursor-pointer"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Save Banner</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Promotional Banner"
        itemName={deleteTarget?.title || ""}
        isDeleting={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </AdminShell>
  );
}
