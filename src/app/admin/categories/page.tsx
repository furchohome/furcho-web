"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, Loader2, CheckCircle2 } from "lucide-react";
import { Category, StoreSectionCode } from "@/types/database";
import { slugify } from "@/lib/utils";
import { AdminShell } from "@/components/admin/AdminShell";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal";
import { useToast } from "@/components/providers/ToastProvider";

export default function AdminCategoriesPage() {
  const router = useRouter();
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingCat, setEditingCat] = useState<Partial<Category> | null>(null);
  const [subcategoriesText, setSubcategoriesText] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/cms");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {
      toast.error("Load Error", "Could not load categories.");
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const openCreate = () => {
    setEditingCat({
      name: "",
      slug: "",
      store_section: "EVERYDAY",
      description: "",
      image_url: "/images/categories/kitchen.jpg",
      display_order: categories.length + 1,
      is_active: true,
    });
    setSubcategoriesText("");
    setIsModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCat({ ...cat });
    setSubcategoriesText((cat.subcategories || []).join("\n"));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat?.name) return;
    setIsSaving(true);
    try {
      const payload = {
        ...editingCat,
        slug: editingCat.slug || slugify(editingCat.name),
        subcategories: subcategoriesText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity: "category", action: "upsert", payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save category.");

      toast.success("Category Saved", `"${data.category.name}" updated.`);
      setIsModalOpen(false);
      loadCategories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save category.";
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
          entity: "category",
          action: "delete",
          payload: { id: deleteTarget.id },
        }),
      });
      if (!res.ok) throw new Error("Failed to delete category.");
      toast.success("Category Deleted", `"${deleteTarget.name}" removed.`);
      setDeleteTarget(null);
      loadCategories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed.";
      toast.error("Delete Error", msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminShell
      title="Category Management"
      subtitle="Manage Everyday Living & Premium Living categories, subcategories, images and display order"
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-[#633719] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#3B2418] transition shadow-soft"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <p className="text-sm text-[#6E5D52]">Loading categories...</p>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.id}
                className="rounded-3xl bg-white border border-[#E5D5C3] overflow-hidden shadow-soft flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-40 w-full bg-[#EFE3D4]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="h-full w-full object-cover"
                    />
                    <span
                      className={`absolute top-3 left-3 rounded-full px-3 py-1 text-[10px] font-extrabold ${
                        cat.store_section === "PREMIUM"
                          ? "bg-[#3B2418] text-[#C58B45]"
                          : "bg-[#FAF5ED] text-[#633719]"
                      }`}
                    >
                      {cat.store_section} • Order #{cat.display_order}
                    </span>
                  </div>
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-extrabold text-[#29221D]">{cat.name}</h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          cat.is_active
                            ? "bg-emerald-100 text-emerald-900"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {cat.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-xs text-[#6E5D52]">{cat.description}</p>
                    {cat.subcategories && cat.subcategories.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        {cat.subcategories.map((sub) => (
                          <span
                            key={sub}
                            className="rounded-lg bg-[#FAF5ED] border border-[#EFE3D4] px-2 py-0.5 text-[10px] font-semibold text-[#633719]"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-[#EFE3D4] px-5 py-3 bg-[#FAF5ED]/60 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(cat)}
                    className="inline-flex items-center gap-1 rounded-xl border border-[#D8C7B4] bg-white px-3 py-1.5 text-xs font-bold text-[#633719] hover:bg-[#633719] hover:text-white transition"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(cat)}
                    className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-600 hover:text-white transition"
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

      {/* Category Modal */}
      {isModalOpen && editingCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-[#FAF5ED] border border-[#E5D5C3] p-6 sm:p-8 shadow-elevated space-y-5">
            <div className="flex items-center justify-between border-b border-[#E5D5C3] pb-3">
              <h2 className="text-lg font-extrabold">
                {editingCat.id ? "Edit Category" : "Create Category"}
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={editingCat.name || ""}
                    onChange={(e) =>
                      setEditingCat({
                        ...editingCat,
                        name: e.target.value,
                        slug: editingCat.id ? editingCat.slug : slugify(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-[#D8C7B4] bg-white px-3.5 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Store Division *</label>
                  <select
                    value={editingCat.store_section || "EVERYDAY"}
                    onChange={(e) =>
                      setEditingCat({
                        ...editingCat,
                        store_section: e.target.value as StoreSectionCode,
                      })
                    }
                    className="w-full rounded-xl border border-[#D8C7B4] bg-white px-3.5 py-2 text-sm"
                  >
                    <option value="EVERYDAY">EVERYDAY LIVING</option>
                    <option value="PREMIUM">PREMIUM LIVING</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">Description</label>
                <input
                  type="text"
                  value={editingCat.description || ""}
                  onChange={(e) =>
                    setEditingCat({ ...editingCat, description: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#D8C7B4] bg-white px-3.5 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">
                  Subcategories (One per line)
                </label>
                <textarea
                  rows={4}
                  value={subcategoriesText}
                  onChange={(e) => setSubcategoriesText(e.target.value)}
                  className="w-full rounded-xl border border-[#D8C7B4] bg-white px-3.5 py-2 text-xs"
                />
              </div>

              <ImageUploadField
                label="Category Image"
                folder="banners"
                value={editingCat.image_url || ""}
                onChange={(url) =>
                  setEditingCat({ ...editingCat, image_url: url, banner_url: url })
                }
              />

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingCat.is_active)}
                    onChange={(e) =>
                      setEditingCat({ ...editingCat, is_active: e.target.checked })
                    }
                    className="accent-[#633719]"
                  />
                  <span>Active on Storefront</span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border border-[#D8C7B4] bg-white px-4 py-2 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#633719] px-5 py-2 text-xs font-bold text-white"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>Save Category</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Category"
        itemName={deleteTarget?.name || ""}
        isDeleting={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </AdminShell>
  );
}
