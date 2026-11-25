"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  MessageCircle,
  CheckCircle2,
  X,
  Loader2,
  FileText,
} from "lucide-react";
import { Enquiry, Quotation } from "@/types/database";
import {
  buildWhatsAppLink,
  formatPaiseToINR,
  rupeesToPaise,
} from "@/lib/utils";
import { AdminShell } from "@/components/admin/AdminShell";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal";
import { useToast } from "@/components/providers/ToastProvider";

export default function AdminQuotationsPage() {
  const router = useRouter();
  const toast = useToast();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState("");
  const [title, setTitle] = useState("");
  const [amountRupees, setAmountRupees] = useState("");
  const [validUntil, setValidUntil] = useState("2026-12-31");
  const [documentUrl, setDocumentUrl] = useState("");
  const [summaryNotes, setSummaryNotes] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Quotation | null>(null);
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
      setQuotations(data.quotations || []);
      setEnquiries(data.enquiries || []);
      if (data.enquiries?.[0]) {
        setSelectedEnquiryId(data.enquiries[0].id);
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amountRupees) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "quotation",
          action: "upsert",
          payload: {
            enquiry_id: selectedEnquiryId,
            title,
            quoted_amount_paise: rupeesToPaise(amountRupees),
            valid_until: validUntil,
            document_url: documentUrl,
            summary_notes: summaryNotes,
            status: "SENT",
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save quotation.");

      toast.success("Quotation Created", `${data.quotation.quotation_number} saved.`);
      setIsModalOpen(false);
      setTitle("");
      setAmountRupees("");
      setSummaryNotes("");
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save quotation.";
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
          entity: "quotation",
          action: "delete",
          payload: { id: deleteTarget.id },
        }),
      });
      if (!res.ok) throw new Error("Failed to delete quotation.");
      toast.success("Quotation Deleted", `${deleteTarget.quotation_number} removed.`);
      setDeleteTarget(null);
      loadData();
    } catch {
      toast.error("Delete Error", "Failed to delete quotation.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminShell
      title="Quotation Management"
      subtitle="Create, upload and track custom furniture & hospitality project quotations"
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#633719] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#3B2418] transition shadow-soft"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Quotation</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            <p className="text-sm text-[#6E5D52]">Loading quotations...</p>
          ) : quotations.length === 0 ? (
            <p className="text-sm text-[#6E5D52]">No quotations created yet.</p>
          ) : (
            quotations.map((qtn) => (
              <div
                key={qtn.id}
                className="rounded-3xl bg-white border border-[#E5D5C3] p-6 shadow-soft flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#3B2418] text-[#C58B45] px-3 py-1 text-xs font-extrabold">
                      {qtn.quotation_number}
                    </span>
                    <span className="rounded-full bg-emerald-100 text-emerald-900 px-3 py-0.5 text-xs font-bold">
                      {qtn.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-[#29221D]">{qtn.title}</h3>
                  <p className="text-xs text-[#6E5D52]">
                    Linked Enquiry: <strong>{qtn.enquiry_number}</strong> • Customer:{" "}
                    <strong>{qtn.customer_name}</strong> (+91 {qtn.customer_phone})
                  </p>
                  <p className="text-2xl font-black text-[#4B2913] pt-1">
                    {formatPaiseToINR(qtn.quoted_amount_paise)}
                  </p>
                  <p className="text-xs text-[#4E3B30] leading-relaxed">{qtn.summary_notes}</p>
                </div>

                <div className="border-t border-[#EFE3D4] pt-4 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-[#6E5D52]">Valid Until: {qtn.valid_until}</span>
                  <div className="flex items-center gap-2">
                    {qtn.document_url && (
                      <a
                        href={qtn.document_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-xl border border-[#D8C7B4] bg-[#FAF5ED] px-3 py-1.5 text-xs font-bold text-[#633719]"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Document
                      </a>
                    )}
                    {qtn.customer_phone && (
                      <a
                        href={buildWhatsAppLink(
                          `91${qtn.customer_phone.replace(/^91/, "")}`,
                          `Hello ${qtn.customer_name}, please find your formal Furcho Quotation *${qtn.quotation_number}* for "${qtn.title}" — Quoted Amount: ${formatPaiseToINR(qtn.quoted_amount_paise)}.`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Send via WhatsApp
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(qtn)}
                      className="rounded-xl border border-red-200 bg-red-50 p-1.5 text-red-700 hover:bg-red-600 hover:text-white transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Quotation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-[#FAF5ED] border border-[#E5D5C3] p-6 sm:p-8 shadow-elevated space-y-5">
            <div className="flex items-center justify-between border-b border-[#E5D5C3] pb-3">
              <h2 className="text-lg font-extrabold">Create Formal Quotation</h2>
              <button type="button" onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuotation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-1">
                  Select Customer Enquiry *
                </label>
                <select
                  value={selectedEnquiryId}
                  onChange={(e) => setSelectedEnquiryId(e.target.value)}
                  className="w-full rounded-xl border border-[#D8C7B4] bg-white px-3.5 py-2 text-sm"
                >
                  {enquiries.map((enq) => (
                    <option key={enq.id} value={enq.id}>
                      {enq.enquiry_number} — {enq.customer_name} ({enq.enquiry_category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">
                  Quotation Title / Scope *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Custom Solid Teak 6-Seater Dining Table & Cane Chairs"
                  className="w-full rounded-xl border border-[#D8C7B4] bg-white px-3.5 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">
                    Quoted Amount (₹ INR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={amountRupees}
                    onChange={(e) => setAmountRupees(e.target.value)}
                    placeholder="e.g. 85000"
                    className="w-full rounded-xl border border-[#D8C7B4] bg-white px-3.5 py-2 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">
                    Valid Until Date
                  </label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full rounded-xl border border-[#D8C7B4] bg-white px-3.5 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">
                  Summary &amp; Terms Notes
                </label>
                <textarea
                  rows={3}
                  value={summaryNotes}
                  onChange={(e) => setSummaryNotes(e.target.value)}
                  placeholder="Timber specification, finish, delivery & installation timeline..."
                  className="w-full rounded-xl border border-[#D8C7B4] bg-white px-3.5 py-2 text-xs"
                />
              </div>

              <ImageUploadField
                label="Upload Quotation Document (PDF or Image)"
                folder="quotations"
                value={documentUrl}
                onChange={(url) => setDocumentUrl(url)}
                acceptPdf
              />

              <div className="flex justify-end gap-2 pt-2">
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
                  <span>Save &amp; Mark Quotation Sent</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Quotation"
        itemName={deleteTarget?.quotation_number || ""}
        isDeleting={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </AdminShell>
  );
}
