"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MessageCircle,
  CheckCircle2,
  Eye,
  X,
  Loader2,
  Clock,
} from "lucide-react";
import { Order, OrderStatus } from "@/types/database";
import {
  buildWhatsAppLink,
  formatPaiseToINR,
  paiseToRupees,
  rupeesToPaise,
} from "@/lib/utils";
import { AdminShell } from "@/components/admin/AdminShell";
import { useToast } from "@/components/providers/ToastProvider";
import { trackMetaEvent } from "@/components/tracking/MetaPixel";

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONTACTED",
  "CONFIRMED",
  "PROCESSING",
  "DISPATCHED",
  "DELIVERED",
  "CANCELLED",
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const toast = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"ALL" | OrderStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editStatus, setEditStatus] = useState<OrderStatus>("PENDING");
  const [deliveryRupees, setDeliveryRupees] = useState("");
  const [confirmedPayableRupees, setConfirmedPayableRupees] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/orders");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      toast.error("Load Error", "Failed to load orders.");
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const openOrderDetail = (ord: Order) => {
    setSelectedOrder(ord);
    setEditStatus(ord.status);
    setDeliveryRupees(
      ord.delivery_charge_paise !== null
        ? String(paiseToRupees(ord.delivery_charge_paise))
        : ""
    );
    setConfirmedPayableRupees(
      ord.confirmed_payable_paise !== null
        ? String(paiseToRupees(ord.confirmed_payable_paise))
        : String(paiseToRupees(ord.total_paise))
    );
    setInternalNotes(ord.internal_notes || "");
    setStatusNote("");
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsSaving(true);
    try {
      const delivPaise =
        deliveryRupees.trim() !== "" ? rupeesToPaise(deliveryRupees) : null;
      const confirmedPaise =
        confirmedPayableRupees.trim() !== ""
          ? rupeesToPaise(confirmedPayableRupees)
          : null;

      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          status: editStatus,
          delivery_charge_paise: delivPaise,
          confirmed_payable_paise: confirmedPaise,
          internal_notes: internalNotes,
          status_note: statusNote,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed.");

      // Fire Meta Pixel 'Purchase' ONLY when admin confirms an actual order!
      if (
        editStatus === "CONFIRMED" &&
        selectedOrder.status !== "CONFIRMED"
      ) {
        trackMetaEvent("Purchase", {
          order_number: data.order.order_number,
          value: paiseToRupees(
            data.order.confirmed_payable_paise || data.order.total_paise
          ),
          currency: "INR",
        });
      }

      toast.success(
        "Order Updated",
        `Order ${data.order.order_number} is now ${data.order.status}.`
      );
      setSelectedOrder(data.order);
      loadOrders();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update order.";
      toast.error("Update Error", msg);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== "ALL" && o.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.order_number.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.toLowerCase().includes(q) ||
        o.district.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AdminShell
      title="Order Management"
      subtitle="Verify customer order requests, record delivery charges, update statuses & contact via WhatsApp"
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl bg-white border border-[#E5D5C3] p-4 shadow-soft">
          <div className="relative flex items-center max-w-md w-full">
            <Search className="w-4 h-4 text-[#6E5D52] absolute left-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search order #, customer name, phone or district..."
              className="w-full rounded-xl border border-[#D8C7B4] bg-[#FAF5ED] pl-10 pr-4 py-2 text-sm focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                statusFilter === "ALL"
                  ? "bg-[#633719] text-white"
                  : "bg-[#FAF5ED] text-[#29221D] border border-[#D8C7B4]"
              }`}
            >
              All ({orders.length})
            </button>
            {ORDER_STATUSES.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  statusFilter === st
                    ? "bg-[#633719] text-white"
                    : "bg-[#FAF5ED] text-[#29221D] border border-[#D8C7B4]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto rounded-3xl bg-white border border-[#E5D5C3] shadow-soft">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EFE3D4] bg-[#FAF5ED] text-[11px] font-extrabold uppercase tracking-wider text-[#6E5D52]">
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Customer &amp; Phone</th>
                <th className="py-3.5 px-4">Location (Kerala)</th>
                <th className="py-3.5 px-4">Amounts</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE3D4] text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#6E5D52]">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#6E5D52]">
                    No orders match your filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const waLink = buildWhatsAppLink(
                    `91${ord.customer_phone.replace(/^91/, "")}`,
                    `Hello ${ord.customer_name}, this is Furcho Customer Support regarding your Order Request *${ord.order_number}* (${formatPaiseToINR(ord.total_paise)}).`
                  );
                  return (
                    <tr key={ord.id} className="hover:bg-[#FAF5ED]/50 transition">
                      <td className="py-4 px-4">
                        <p className="font-extrabold text-[#29221D]">{ord.order_number}</p>
                        <p className="text-[11px] text-[#6E5D52]">
                          {new Date(ord.created_at).toLocaleDateString("en-IN")}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-bold text-[#29221D]">{ord.customer_name}</p>
                        <p className="text-xs text-[#633719] font-semibold">
                          +91 {ord.customer_phone}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-xs font-bold">{ord.district} District</p>
                        <p className="text-xs text-[#6E5D52]">
                          {ord.city_town} — {ord.pincode}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-black text-[#4B2913]">
                          {formatPaiseToINR(
                            ord.confirmed_payable_paise ?? ord.total_paise
                          )}
                        </p>
                        <p className="text-[11px] text-[#6E5D52]">
                          Delivery:{" "}
                          {ord.delivery_charge_paise !== null
                            ? formatPaiseToINR(ord.delivery_charge_paise)
                            : "Unconfirmed"}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-extrabold ${
                            ord.status === "PENDING"
                              ? "bg-amber-100 text-amber-900"
                              : ord.status === "CONFIRMED" || ord.status === "DELIVERED"
                              ? "bg-emerald-100 text-emerald-900"
                              : ord.status === "CANCELLED"
                              ? "bg-red-100 text-red-800"
                              : "bg-[#EFE3D4] text-[#633719]"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition"
                            title="WhatsApp Customer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => openOrderDetail(ord)}
                            className="inline-flex items-center gap-1 rounded-xl bg-[#633719] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#3B2418] transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Manage</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail & Verification Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#FAF5ED] border border-[#E5D5C3] p-6 sm:p-8 shadow-elevated space-y-6">
            <div className="flex items-center justify-between border-b border-[#E5D5C3] pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#29221D]">
                  Order {selectedOrder.order_number}
                </h2>
                <p className="text-xs text-[#6E5D52]">
                  Submitted on {new Date(selectedOrder.created_at).toLocaleString("en-IN")}
                </p>
              </div>
              <button type="button" onClick={() => setSelectedOrder(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Delivery Address Snapshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-white border border-[#E5D5C3] p-4 text-xs">
              <div className="space-y-1">
                <p className="font-extrabold uppercase text-[#633719]">Customer Details</p>
                <p className="text-sm font-bold">{selectedOrder.customer_name}</p>
                <p>Phone: +91 {selectedOrder.customer_phone}</p>
                {selectedOrder.customer_email && <p>Email: {selectedOrder.customer_email}</p>}
              </div>
              <div className="space-y-1">
                <p className="font-extrabold uppercase text-[#633719]">Delivery Address</p>
                <p className="font-bold">
                  {selectedOrder.city_town}, {selectedOrder.district} — PIN{" "}
                  {selectedOrder.pincode}
                </p>
                <p>{selectedOrder.full_address}</p>
                {selectedOrder.delivery_instructions && (
                  <p className="italic text-[#8A5424]">
                    Note: {selectedOrder.delivery_instructions}
                  </p>
                )}
              </div>
            </div>

            {/* Order Items Snapshot */}
            <div className="rounded-2xl bg-white border border-[#E5D5C3] overflow-hidden">
              <div className="bg-[#F4ECE1] px-4 py-2.5 text-xs font-extrabold uppercase text-[#633719]">
                Order Items Snapshot (Immutable Historical Prices)
              </div>
              <div className="divide-y divide-[#EFE3D4]">
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 text-sm"
                  >
                    <div>
                      <p className="font-bold">{item.product_name_snapshot}</p>
                      <p className="text-xs text-[#6E5D52]">
                        SKU: {item.product_sku_snapshot} • {formatPaiseToINR(item.unit_price_paise)}{" "}
                        × {item.quantity}
                      </p>
                    </div>
                    <p className="font-black text-[#4B2913]">
                      {formatPaiseToINR(item.line_total_paise)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Verification & Status Update Form */}
            <form
              onSubmit={handleUpdateOrder}
              className="rounded-2xl bg-white border border-[#E5D5C3] p-5 space-y-4"
            >
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#633719]">
                Verify Availability, Delivery Charges &amp; Order Status
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">
                    Order Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as OrderStatus)}
                    className="w-full rounded-xl border border-[#D8C7B4] bg-[#FAF5ED] px-3 py-2 text-sm font-bold"
                  >
                    {ORDER_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1">
                    Delivery Charge (₹ INR)
                  </label>
                  <input
                    type="number"
                    value={deliveryRupees}
                    onChange={(e) => {
                      setDeliveryRupees(e.target.value);
                      const deliv = Number(e.target.value) || 0;
                      setConfirmedPayableRupees(
                        String(paiseToRupees(selectedOrder.subtotal_paise) + deliv)
                      );
                    }}
                    placeholder="e.g. 150"
                    className="w-full rounded-xl border border-[#D8C7B4] bg-[#FAF5ED] px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1">
                    Confirmed Payable (₹ INR)
                  </label>
                  <input
                    type="number"
                    value={confirmedPayableRupees}
                    onChange={(e) => setConfirmedPayableRupees(e.target.value)}
                    className="w-full rounded-xl border border-[#D8C7B4] bg-[#FAF5ED] px-3 py-2 text-sm font-extrabold text-[#4B2913]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">
                    Internal Admin Notes
                  </label>
                  <textarea
                    rows={2}
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Courier partner, stock check notes..."
                    className="w-full rounded-xl border border-[#D8C7B4] bg-[#FAF5ED] px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">
                    Status Change History Log Note
                  </label>
                  <textarea
                    rows={2}
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="e.g. Spoke with customer, confirmed ₹150 delivery fee."
                    className="w-full rounded-xl border border-[#D8C7B4] bg-[#FAF5ED] px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#633719] px-6 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#3B2418] transition"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Save Order Verification</span>
                </button>
              </div>
            </form>

            {/* Status History Audit Trail */}
            <div className="rounded-2xl bg-white border border-[#E5D5C3] p-4 space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#6E5D52] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Order Status History
              </h4>
              <div className="space-y-2 text-xs">
                {selectedOrder.status_history.map((hist) => (
                  <div
                    key={hist.id}
                    className="flex items-start justify-between gap-4 rounded-xl bg-[#FAF5ED] p-2.5"
                  >
                    <div>
                      <span className="font-extrabold text-[#633719]">
                        {hist.previous_status ? `${hist.previous_status} → ` : ""}
                        {hist.new_status}
                      </span>
                      <p className="text-[#4E3B30] mt-0.5">{hist.note}</p>
                    </div>
                    <span className="text-[10px] text-[#6E5D52] shrink-0">
                      {new Date(hist.created_at).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
