"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  MessageCircle,
  CheckCircle2,
  X,
  Loader2,
  FileText,
  Clock,
} from "lucide-react";
import { Enquiry, EnquiryStatus, StoreSectionCode } from "@/types/database";
import { buildWhatsAppLink } from "@/lib/utils";
import { AdminShell } from "@/components/admin/AdminShell";
import { useToast } from "@/components/providers/ToastProvider";

const ENQUIRY_STATUSES: EnquiryStatus[] = [
  "NEW",
  "CONTACTED",
  "DISCUSSION",
  "QUOTATION_SENT",
  "APPROVED",
  "REJECTED",
  "CLOSED",
];

export default function AdminEnquiriesPage() {
  const router = useRouter();
  const toast = useToast();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StoreSectionCode | "ALL">("ALL");

  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [editStatus, setEditStatus] = useState<EnquiryStatus>("NEW");
  const [assignedStaff, setAssignedStaff] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [followUpNote, setFollowUpNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadEnquiries = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/enquiries");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setEnquiries(data.enquiries || []);
    } catch {
      toast.error("Load Error", "Failed to load enquiries.");
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  useEffect(() => {
    loadEnquiries();
  }, [loadEnquiries]);

  const openEnquiry = (enq: Enquiry) => {
    setSelectedEnquiry(enq);
    setEditStatus(enq.status);
    setAssignedStaff(enq.assigned_staff || "");
    setInternalNotes(enq.internal_notes || "");
    setFollowUpNote("");
  };

  const handleSaveEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enquiryId: selectedEnquiry.id,
          status: editStatus,
          assigned_staff: assignedStaff,
          internal_notes: internalNotes,
          follow_up_note: followUpNote,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed.");

      toast.success(
        "Enquiry Updated",
        `${data.enquiry.enquiry_number} status is now ${data.enquiry.status}.`
      );
      setSelectedEnquiry(data.enquiry);
      setFollowUpNote("");
      loadEnquiries();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update enquiry.";
      toast.error("Update Error", msg);
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = enquiries.filter((e) =>
    activeTab === "ALL" ? true : e.store_section === activeTab
  );

  return (
    <AdminShell
      title="Custom Enquiry Management"
      subtitle="Separate Everyday Living & Premium Living custom design and commercial project enquiries"
    >
      <div className="space-y-6">
        {/* Division Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white border border-[#E5D5C3] p-4 shadow-soft">
          <div className="flex items-center gap-2">
            {(["ALL", "PREMIUM", "EVERYDAY"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-xl px-4 py-2 text-xs font-extrabold transition ${
                  activeTab === tab
                    ? "bg-[#633719] text-white"
                    : "bg-[#FAF5ED] text-[#29221D] border border-[#D8C7B4]"
                }`}
              >
                {tab === "ALL"
                  ? `All Enquiries (${enquiries.length})`
                  : tab === "PREMIUM"
                  ? `Premium Living Enquiries (${enquiries.filter((e) => e.store_section === "PREMIUM").length})`
                  : `Everyday Living Enquiries (${enquiries.filter((e) => e.store_section === "EVERYDAY").length})`}
              </button>
            ))}
          </div>

          <Link
            href="/admin/quotations"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#3B2418] px-4 py-2 text-xs font-bold text-[#C58B45] hover:bg-[#24150E] transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Manage Quotations</span>
          </Link>
        </div>

        {/* Enquiries Table */}
        <div className="overflow-x-auto rounded-3xl bg-white border border-[#E5D5C3] shadow-soft">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EFE3D4] bg-[#FAF5ED] text-[11px] font-extrabold uppercase tracking-wider text-[#6E5D52]">
                <th className="py-3.5 px-4">Enquiry #</th>
                <th className="py-3.5 px-4">Division &amp; Category</th>
                <th className="py-3.5 px-4">Customer &amp; Location</th>
                <th className="py-3.5 px-4">Budget / Specs</th>
                <th className="py-3.5 px-4">Status &amp; Staff</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE3D4] text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#6E5D52]">
                    Loading enquiries...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#6E5D52]">
                    No enquiries found in this division.
                  </td>
                </tr>
              ) : (
                filtered.map((enq) => (
                  <tr key={enq.id} className="hover:bg-[#FAF5ED]/50">
                    <td className="py-4 px-4">
                      <p className="font-extrabold text-[#29221D]">{enq.enquiry_number}</p>
                      <p className="text-[11px] text-[#6E5D52]">
                        {new Date(enq.created_at).toLocaleDateString("en-IN")}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                          enq.store_section === "PREMIUM"
                            ? "bg-[#3B2418] text-[#C58B45]"
                            : "bg-[#EFE0CC] text-[#633719]"
                        }`}
                      >
                        {enq.store_section}
                      </span>
                      <p className="text-xs font-bold mt-1">{enq.enquiry_category}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold">{enq.customer_name}</p>
                      <p className="text-xs text-[#633719]">+91 {enq.mobile_number}</p>
                      <p className="text-xs text-[#6E5D52]">{enq.project_location}</p>
                    </td>
                    <td className="py-4 px-4 text-xs">
                      {enq.budget_range && (
                        <p className="font-bold text-[#4B2913]">Budget: {enq.budget_range}</p>
                      )}
                      {enq.preferred_dimensions && (
                        <p className="text-[#6E5D52]">Dim: {enq.preferred_dimensions}</p>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-block rounded-full bg-amber-100 text-amber-900 px-2.5 py-0.5 text-xs font-bold">
                        {enq.status}
                      </span>
                      <p className="text-[11px] text-[#6E5D52] mt-1">
                        Staff: {enq.assigned_staff || "Unassigned"}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <a
                          href={buildWhatsAppLink(
                            `91${enq.mobile_number.replace(/^91/, "")}`,
                            `Hello ${enq.customer_name}, this is Furcho Custom Projects regarding your enquiry *${enq.enquiry_number}* (${enq.enquiry_category}).`
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition inline-flex items-center gap-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => openEnquiry(enq)}
                          className="rounded-xl bg-[#633719] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#3B2418] transition inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
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

      {/* Enquiry Detail Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#FAF5ED] border border-[#E5D5C3] p-6 sm:p-8 shadow-elevated space-y-6">
            <div className="flex items-center justify-between border-b border-[#E5D5C3] pb-3">
              <div>
                <h2 className="text-xl font-extrabold">
                  {selectedEnquiry.enquiry_number} — {selectedEnquiry.customer_name}
                </h2>
                <p className="text-xs text-[#6E5D52]">
                  {selectedEnquiry.store_section} • {selectedEnquiry.enquiry_category}
                </p>
              </div>
              <button type="button" onClick={() => setSelectedEnquiry(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Requirement Summary & Attachments */}
            <div className="rounded-2xl bg-white border border-[#E5D5C3] p-4 space-y-3 text-xs sm:text-sm">
              <p className="font-bold text-[#633719]">Requirement Description:</p>
              <p className="text-[#29221D] leading-relaxed">
                {selectedEnquiry.requirement_description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                <div className="rounded-xl bg-[#FAF5ED] p-2.5">
                  <span className="text-[#6E5D52] block">Location</span>
                  <strong>{selectedEnquiry.project_location}</strong>
                </div>
                <div className="rounded-xl bg-[#FAF5ED] p-2.5">
                  <span className="text-[#6E5D52] block">Dimensions</span>
                  <strong>{selectedEnquiry.preferred_dimensions || "N/A"}</strong>
                </div>
                <div className="rounded-xl bg-[#FAF5ED] p-2.5">
                  <span className="text-[#6E5D52] block">Material / Finish</span>
                  <strong>{selectedEnquiry.material_finish || "N/A"}</strong>
                </div>
                <div className="rounded-xl bg-[#FAF5ED] p-2.5">
                  <span className="text-[#6E5D52] block">Budget Range</span>
                  <strong>{selectedEnquiry.budget_range || "Not specified"}</strong>
                </div>
              </div>

              {selectedEnquiry.attachments && selectedEnquiry.attachments.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-bold uppercase text-[#633719] mb-2">
                    Reference Image Attachments
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {selectedEnquiry.attachments.map((att) => (
                      <a
                        key={att.id}
                        href={att.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="block h-24 w-32 overflow-hidden rounded-xl border border-[#D8C7B4] bg-[#EFE3D4]"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={att.file_url}
                          alt={att.file_name}
                          className="h-full w-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Staff Assignment, Status & Follow-up Form */}
            <form
              onSubmit={handleSaveEnquiry}
              className="rounded-2xl bg-white border border-[#E5D5C3] p-5 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">
                    Enquiry Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as EnquiryStatus)}
                    className="w-full rounded-xl border border-[#D8C7B4] bg-[#FAF5ED] px-3 py-2 text-sm font-bold"
                  >
                    {ENQUIRY_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1">
                    Assigned Consultant / Staff
                  </label>
                  <input
                    type="text"
                    value={assignedStaff}
                    onChange={(e) => setAssignedStaff(e.target.value)}
                    placeholder="e.g. Vishnu Nair"
                    className="w-full rounded-xl border border-[#D8C7B4] bg-[#FAF5ED] px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">
                  Internal Notes
                </label>
                <textarea
                  rows={2}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  className="w-full rounded-xl border border-[#D8C7B4] bg-[#FAF5ED] px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">
                  Add Follow-Up Log Entry
                </label>
                <input
                  type="text"
                  value={followUpNote}
                  onChange={(e) => setFollowUpNote(e.target.value)}
                  placeholder="e.g. Discussed Nilambur teak polish options with customer..."
                  className="w-full rounded-xl border border-[#D8C7B4] bg-[#FAF5ED] px-3 py-2 text-xs"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <Link
                  href={`/admin/quotations?enquiryId=${selectedEnquiry.id}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#3B2418] px-4 py-2.5 text-xs font-bold text-[#C58B45] hover:bg-[#24150E] transition"
                >
                  <FileText className="w-4 h-4" />
                  <span>Create Quotation for This Enquiry</span>
                </Link>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#633719] px-6 py-2.5 text-xs sm:text-sm font-bold text-white"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Save Enquiry Updates</span>
                </button>
              </div>
            </form>

            {/* Follow-Up History */}
            <div className="rounded-2xl bg-white border border-[#E5D5C3] p-4 space-y-2">
              <h4 className="text-xs font-extrabold uppercase text-[#6E5D52] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Follow-Up History
              </h4>
              {selectedEnquiry.follow_up_history.map((fup) => (
                <div
                  key={fup.id}
                  className="rounded-xl bg-[#FAF5ED] p-2.5 text-xs flex justify-between gap-4"
                >
                  <div>
                    <span className="font-bold text-[#633719]">{fup.author}: </span>
                    <span>{fup.note}</span>
                  </div>
                  <span className="text-[10px] text-[#6E5D52] shrink-0">
                    {new Date(fup.created_at).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
