"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Star,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react";
import { Category, Product, ProductImage, StoreSectionCode } from "@/types/database";
import { formatPaiseToINR, paiseToRupees, rupeesToPaise, slugify } from "@/lib/utils";
import { AdminShell } from "@/components/admin/AdminShell";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal";
import { useToast } from "@/components/providers/ToastProvider";

export default function AdminProductsPage() {
  const router = useRouter();
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sectionFilter, setSectionFilter] = useState<"ALL" | StoreSectionCode>("ALL");

  // Modal state for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [priceRupees, setPriceRupees] = useState("2999");
  const [origPriceRupees, setOrigPriceRupees] = useState("");
  const [featuresText, setFeaturesText] = useState("");
  const [specsText, setSpecsText] = useState("");
  const [imageUrls, setImageUrls] = useState<{ url: string; label: string }[]>([
    { url: "/images/products/ironing-table-hero.jpg", label: "Primary View" },
  ]);

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/cms");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setProducts(data.products || []);
      setCategories(data.categories || []);
    } catch {
      toast.error("Load Failed", "Could not load products from server.");
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateModal = () => {
    const defaultCat = categories[0];
    setEditingProduct({
      name: "",
      slug: "",
      sku: `FRC-EW-${Math.floor(100 + Math.random() * 900)}`,
      store_section: "EVERYDAY",
      category_id: defaultCat?.id || "cat-home-accessories",
      category_slug: defaultCat?.slug || "home-accessories",
      subcategory_name: defaultCat?.subcategories?.[0] || "",
      short_description: "",
      description: "",
      launch_price_label: "Launch Price",
      dimensions: "",
      material: "",
      delivery_info:
        "Delivery charges confirmed based on customer location across Kerala.",
      stock_quantity: 15,
      availability_status: "IN_STOCK",
      is_featured: false,
      is_trending: true,
      is_bestseller: false,
      is_demo_data: false,
      is_active: true,
      request_quote_only: false,
    });
    setPriceRupees("2999");
    setOrigPriceRupees("");
    setFeaturesText("Space Saving\nSturdy & Durable\nEasy Installation");
    setSpecsText("Mounting: Wall-Mounted\nFinish: Natural Ivory/Wood");
    setImageUrls([{ url: "", label: "Primary View" }]);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct({ ...product });
    setPriceRupees(String(paiseToRupees(product.selling_price_paise)));
    setOrigPriceRupees(
      product.original_price_paise
        ? String(paiseToRupees(product.original_price_paise))
        : ""
    );
    setFeaturesText((product.features || []).join("\n"));
    setSpecsText(
      Object.entries(product.specifications || {})
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n")
    );
    setImageUrls(
      product.images.length > 0
        ? product.images.map((i) => ({ url: i.image_url, label: i.view_label || i.alt_text }))
        : [{ url: "", label: "Primary View" }]
    );
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name) {
      toast.error("Validation Error", "Product name is required.");
      return;
    }

    setIsSaving(true);
    try {
      const slug = editingProduct.slug?.trim() || slugify(editingProduct.name);
      const specsObj: Record<string, string> = {};
      specsText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .forEach((line) => {
          const [k, ...rest] = line.split(":");
          if (k && rest.length > 0) {
            specsObj[k.trim()] = rest.join(":").trim();
          }
        });

      const validImages: ProductImage[] = imageUrls
        .filter((img) => img.url.trim().length > 0)
        .map((img, idx) => ({
          id: `img-${Date.now()}-${idx}`,
          product_id: editingProduct.id || "new",
          image_url: img.url.trim(),
          alt_text: editingProduct.name || "Furcho Product",
          view_label: img.label || `View ${idx + 1}`,
          is_primary: idx === 0,
          display_order: idx + 1,
        }));

      const payload = {
        ...editingProduct,
        slug,
        selling_price_paise: rupeesToPaise(priceRupees),
        original_price_paise: origPriceRupees ? rupeesToPaise(origPriceRupees) : null,
        features: featuresText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        specifications: specsObj,
        images: validImages,
      };

      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "product",
          action: "upsert",
          payload,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save product.");

      toast.success("Product Saved", `"${data.product.name}" has been updated in the catalogue.`);
      setIsModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save product.";
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
          entity: "product",
          action: "delete",
          payload: { id: deleteTarget.id },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed.");

      toast.success("Product Deleted", `"${deleteTarget.name}" was removed from the database.`);
      setDeleteTarget(null);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed.";
      toast.error("Delete Error", msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (sectionFilter !== "ALL" && p.store_section !== sectionFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AdminShell
      title="Product Management"
      subtitle="Manage Everyday Living & Premium Living catalogue, multiple images, pricing and stock"
    >
      <div className="space-y-6">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white border border-[#E5D5C3] p-4 shadow-soft">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex items-center flex-1 max-w-sm">
              <Search className="w-4 h-4 text-[#6E5D52] absolute left-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by product name, SKU or category..."
                className="w-full rounded-xl border border-[#D8C7B4] bg-[#FAF5ED] pl-10 pr-4 py-2 text-sm focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {(["ALL", "EVERYDAY", "PREMIUM"] as const).map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setSectionFilter(sec)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    sectionFilter === sec
                      ? "bg-[#633719] text-white"
                      : "bg-[#FAF5ED] text-[#29221D] border border-[#D8C7B4]"
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#633719] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#3B2418] transition shadow-soft cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto rounded-3xl bg-white border border-[#E5D5C3] shadow-soft">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EFE3D4] bg-[#FAF5ED] text-[11px] font-extrabold uppercase tracking-wider text-[#6E5D52]">
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Division &amp; Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock &amp; Status</th>
                <th className="py-3.5 px-4">Flags</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE3D4] text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#6E5D52]">
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#6E5D52]">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-[#FAF5ED]/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            product.images[0]?.image_url ||
                            "/images/products/ironing-table-hero.jpg"
                          }
                          alt={product.name}
                          className="h-12 w-14 rounded-xl object-cover bg-[#EFE3D4] border border-[#DFCBB3]"
                        />
                        <div>
                          <p className="font-extrabold text-[#29221D]">{product.name}</p>
                          <p className="text-xs text-[#6E5D52]">SKU: {product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          product.store_section === "PREMIUM"
                            ? "bg-[#3B2418] text-[#C58B45]"
                            : "bg-[#EFE0CC] text-[#633719]"
                        }`}
                      >
                        {product.store_section}
                      </span>
                      <p className="text-xs font-semibold text-[#29221D] mt-1">
                        {product.category_name}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-black text-[#4B2913]">
                        {formatPaiseToINR(product.selling_price_paise)}
                      </p>
                      {product.launch_price_label && (
                        <span className="text-[10px] font-bold text-[#8A5424]">
                          {product.launch_price_label}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-xs font-bold">{product.stock_quantity} units</p>
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold mt-0.5 ${
                          product.is_active
                            ? "bg-emerald-100 text-emerald-900"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {product.is_active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {product.is_featured && (
                          <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                            <Star className="w-3 h-3 fill-current" /> Featured Hero
                          </span>
                        )}
                        {product.is_trending && (
                          <span className="rounded-md bg-[#EFE3D4] px-2 py-0.5 text-[10px] font-bold text-[#633719]">
                            Trending
                          </span>
                        )}
                        {product.request_quote_only && (
                          <span className="rounded-md bg-[#3B2418] px-2 py-0.5 text-[10px] font-bold text-[#C58B45]">
                            Quote Only
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(product)}
                          className="rounded-xl border border-[#D8C7B4] bg-[#FAF5ED] p-2 text-[#633719] hover:bg-[#633719] hover:text-white transition"
                          title="Edit Product"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(product)}
                          className="rounded-xl border border-red-200 bg-red-50 p-2 text-red-700 hover:bg-red-600 hover:text-white transition"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Product Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#FAF5ED] border border-[#E5D5C3] p-6 sm:p-8 shadow-elevated">
            <div className="flex items-center justify-between border-b border-[#E5D5C3] pb-4 mb-6">
              <h2 className="text-xl font-extrabold text-[#29221D]">
                {editingProduct.id ? `Edit Product: ${editingProduct.name}` : "Create New Product"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-1.5 hover:bg-[#EFE3D4]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        name: e.target.value,
                        slug: editingProduct.id
                          ? editingProduct.slug
                          : slugify(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-[#D8C7B4] bg-white px-3.5 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.slug || ""}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, slug: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#D8C7B4] bg-white px-3.5 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                    SKU *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.sku || ""}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, sku: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#D8C7B4] bg-white px-3.5 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                    Store Section *
                  </label>
                  <select
                    value={editingProduct.store_section || "EVERYDAY"}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        store_section: e.target.value as StoreSectionCode,
                      })
                    }
                    className="w-full rounded-xl border border-[#D8C7B4] bg-white px-3.5 py-2 text-sm"
                  >
                    <option value="EVERYDAY">EVERYDAY (Order Request Checkout)</option>
                    <option value="PREMIUM">PREMIUM (Custom Enquiry / Quote)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={editingProduct.category_id || ""}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, category_id: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#D8C7B4] bg-white px-3.5 py-2 text-sm"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        [{cat.store_section}] {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                    Subcategory
                  </label>
                  <input
                    type="text"
                    value={editingProduct.subcategory_name || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        subcategory_name: e.target.value,
                      })
                    }
                    placeholder="e.g. Foldable ironing tables"
                    className="w-full rounded-xl border border-[#D8C7B4] bg-white px-3.5 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                    Selling Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={priceRupees}
                    onChange={(e) => setPriceRupees(e.target.value)}
                    className="w-full rounded-xl border border-[#D8C7B4] bg-white px-3.5 py-2 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                    Original Price (₹ INR - Optional)
                  </label>
                  <input
                    type="number"
                    value={origPriceRupees}
                    onChange={(e) => setOrigPriceRupees(e.target.value)}
                    placeholder="Leave blank if no strikethrough price"
                    className="w-full rounded-xl border border-[#D8C7B4] bg-white px-3.5 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                    Launch Price Badge Label
                  </label>
                  <input
                    type="text"
                    value={editingProduct.launch_price_label || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        launch_price_label: e.target.value,
                      })
                    }
                    placeholder="e.g. Launch Price"
                    className="w-full rounded-xl border border-[#D8C7B4] bg-white px-3.5 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={editingProduct.stock_quantity ?? 10}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        stock_quantity: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-[#D8C7B4] bg-white px-3.5 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                    Dimensions (Leave blank until verified)
                  </label>
                  <input
                    type="text"
                    value={editingProduct.dimensions || ""}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, dimensions: e.target.value })
                    }
                    placeholder="e.g. 90cm x 45cm"
                    className="w-full rounded-xl border border-[#D8C7B4] bg-white px-3.5 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                    Material (Leave blank until verified)
                  </label>
                  <input
                    type="text"
                    value={editingProduct.material || ""}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, material: e.target.value })
                    }
                    placeholder="e.g. Padded Ivory Board & Powder-Coated Steel"
                    className="w-full rounded-xl border border-[#D8C7B4] bg-white px-3.5 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                  Short Description *
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.short_description || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      short_description: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-[#D8C7B4] bg-white px-3.5 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                  Full Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingProduct.description || ""}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#D8C7B4] bg-white px-3.5 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                    Features (One per line)
                  </label>
                  <textarea
                    rows={3}
                    value={featuresText}
                    onChange={(e) => setFeaturesText(e.target.value)}
                    className="w-full rounded-xl border border-[#D8C7B4] bg-white px-3.5 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                    Specifications (Key: Value per line)
                  </label>
                  <textarea
                    rows={3}
                    value={specsText}
                    onChange={(e) => setSpecsText(e.target.value)}
                    className="w-full rounded-xl border border-[#D8C7B4] bg-white px-3.5 py-2 text-xs"
                  />
                </div>
              </div>

              {/* Multiple Product Image Upload */}
              <div className="space-y-3 rounded-2xl bg-[#F4ECE1] border border-[#E4D3BE] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#633719]">
                    Product Gallery Images ({imageUrls.length})
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setImageUrls([
                        ...imageUrls,
                        { url: "", label: `Angle View ${imageUrls.length + 1}` },
                      ])
                    }
                    className="rounded-lg bg-[#633719] px-3 py-1 text-xs font-bold text-white"
                  >
                    + Add Image Slot
                  </button>
                </div>

                {imageUrls.map((img, idx) => (
                  <div key={idx} className="space-y-2 border-t border-[#E4D3BE] pt-3">
                    <ImageUploadField
                      label={`Image #${idx + 1} (${img.label || "Product View"})`}
                      folder="products"
                      value={img.url}
                      onChange={(newUrl) => {
                        const next = [...imageUrls];
                        next[idx] = { ...next[idx], url: newUrl };
                        setImageUrls(next);
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Boolean Toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-2xl bg-white border border-[#E5D5C3] p-4 text-xs font-bold">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct.is_featured)}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, is_featured: e.target.checked })
                    }
                    className="accent-[#633719]"
                  />
                  <span>Set as Featured Hero</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct.is_trending)}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, is_trending: e.target.checked })
                    }
                    className="accent-[#633719]"
                  />
                  <span>Show in Trending</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct.is_bestseller)}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        is_bestseller: e.target.checked,
                      })
                    }
                    className="accent-[#633719]"
                  />
                  <span>Bestseller Badge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct.request_quote_only)}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        request_quote_only: e.target.checked,
                      })
                    }
                    className="accent-[#633719]"
                  />
                  <span>Request a Quote Only</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct.is_demo_data)}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        is_demo_data: e.target.checked,
                      })
                    }
                    className="accent-[#633719]"
                  />
                  <span>Demo Item Badge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct.is_active)}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, is_active: e.target.checked })
                    }
                    className="accent-[#633719]"
                  />
                  <span>Published / Active</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-[#D8C7B4] bg-white px-5 py-2.5 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#633719] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#3B2418] transition"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save Product</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Product"
        itemName={deleteTarget?.name || ""}
        description="Deleting this product will remove it from the storefront catalogue immediately."
        isDeleting={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </AdminShell>
  );
}
