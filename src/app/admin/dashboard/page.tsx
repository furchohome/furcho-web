import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Package,
  Users,
  MessageSquareText,
  FileText,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { getAdminSession } from "@/lib/auth";
import { getFullDbState } from "@/lib/db";
import { formatPaiseToINR } from "@/lib/utils";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const db = await getFullDbState();

  const totalOrders = db.orders.length;
  const newOrders = db.orders.filter((o) => o.status === "PENDING").length;
  const pendingConfirmations = db.orders.filter(
    (o) => o.status === "PENDING" || o.status === "CONTACTED"
  ).length;
  const confirmedOrders = db.orders.filter(
    (o) =>
      o.status === "CONFIRMED" ||
      o.status === "PROCESSING" ||
      o.status === "DISPATCHED" ||
      o.status === "DELIVERED"
  ).length;
  const totalProducts = db.products.length;
  const totalCustomers = db.customers.length;
  const newEnquiries = db.enquiries.filter((e) => e.status === "NEW").length;
  const openQuotations = db.quotations.filter(
    (q) => q.status === "SENT" || q.status === "DRAFT"
  ).length;

  const kpiCards = [
    {
      label: "Total Orders",
      value: totalOrders,
      sub: "All-time order requests",
      href: "/admin/orders",
      icon: ShoppingBag,
      accent: "bg-[#633719] text-white",
    },
    {
      label: "New Orders",
      value: newOrders,
      sub: "Awaiting first contact",
      href: "/admin/orders?status=PENDING",
      icon: Sparkles,
      accent: "bg-amber-600 text-white",
    },
    {
      label: "Pending Confirmations",
      value: pendingConfirmations,
      sub: "Verify stock & delivery fee",
      href: "/admin/orders",
      icon: Clock,
      accent: "bg-[#8D4F23] text-white",
    },
    {
      label: "Confirmed Orders",
      value: confirmedOrders,
      sub: "Confirmed & fulfilling",
      href: "/admin/orders",
      icon: CheckCircle2,
      accent: "bg-emerald-700 text-white",
    },
    {
      label: "Total Products",
      value: totalProducts,
      sub: "Everyday & Premium items",
      href: "/admin/products",
      icon: Package,
      accent: "bg-[#3B2418] text-[#C58B45]",
    },
    {
      label: "Total Customers",
      value: totalCustomers,
      sub: "Across Kerala districts",
      href: "/admin/customers",
      icon: Users,
      accent: "bg-[#633719] text-white",
    },
    {
      label: "New Enquiries",
      value: newEnquiries,
      sub: "Custom & hospitality leads",
      href: "/admin/enquiries",
      icon: MessageSquareText,
      accent: "bg-[#C58B45] text-[#24150E]",
    },
    {
      label: "Open Premium Quotations",
      value: openQuotations,
      sub: "Active sent proposals",
      href: "/admin/quotations",
      icon: FileText,
      accent: "bg-[#24150E] text-[#C58B45]",
    },
  ];

  return (
    <AdminShell
      title="Dashboard Overview"
      subtitle="Real-time metrics for Furcho Everyday Living & Premium Living storefronts"
      adminEmail={session.email}
    >
      <div className="space-y-8">
        {/* 8 Required KPI Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {kpiCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.label}
                href={card.href}
                className="group rounded-2xl bg-white border border-[#E5D5C3] p-5 shadow-soft hover:shadow-card transition flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6E5D52]">
                    {card.label}
                  </span>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.accent}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-black text-[#29221D]">{card.value}</p>
                    <p className="text-xs text-[#6E5D52] mt-0.5">{card.sub}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[#C58B45] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Recent Order Requests & Recent Custom Enquiries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="rounded-3xl bg-white border border-[#E5D5C3] p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-[#EFE3D4] pb-3">
              <div>
                <h2 className="text-base font-extrabold text-[#29221D]">
                  Recent Order Requests
                </h2>
                <p className="text-xs text-[#6E5D52]">
                  Everyday Living customer order submissions
                </p>
              </div>
              <Link
                href="/admin/orders"
                className="text-xs font-bold text-[#633719] hover:underline"
              >
                Manage All →
              </Link>
            </div>

            <div className="space-y-3">
              {db.orders.slice(0, 5).map((ord) => (
                <div
                  key={ord.id}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-[#FAF5ED] border border-[#EFE3D4] p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-[#29221D]">
                        {ord.order_number}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          ord.status === "PENDING"
                            ? "bg-amber-100 text-amber-900"
                            : ord.status === "CONFIRMED"
                            ? "bg-emerald-100 text-emerald-900"
                            : "bg-[#EFE3D4] text-[#633719]"
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#6E5D52] mt-0.5">
                      {ord.customer_name} • {ord.customer_phone} ({ord.district})
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-[#4B2913]">
                      {formatPaiseToINR(ord.total_paise)}
                    </p>
                    <Link
                      href="/admin/orders"
                      className="text-[11px] font-bold text-[#633719] hover:underline"
                    >
                      Verify Order →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Enquiries */}
          <div className="rounded-3xl bg-white border border-[#E5D5C3] p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-[#EFE3D4] pb-3">
              <div>
                <h2 className="text-base font-extrabold text-[#29221D]">
                  Recent Custom &amp; Commercial Enquiries
                </h2>
                <p className="text-xs text-[#6E5D52]">
                  Everyday &amp; Premium Living custom design requests
                </p>
              </div>
              <Link
                href="/admin/enquiries"
                className="text-xs font-bold text-[#633719] hover:underline"
              >
                Manage All →
              </Link>
            </div>

            <div className="space-y-3">
              {db.enquiries.slice(0, 5).map((enq) => (
                <div
                  key={enq.id}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-[#FAF5ED] border border-[#EFE3D4] p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-[#29221D]">
                        {enq.enquiry_number}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          enq.store_section === "PREMIUM"
                            ? "bg-[#3B2418] text-[#C58B45]"
                            : "bg-[#EFE3D4] text-[#633719]"
                        }`}
                      >
                        {enq.store_section}
                      </span>
                      <span className="rounded-full bg-amber-100 text-amber-900 px-2 py-0.5 text-[10px] font-bold">
                        {enq.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#6E5D52] mt-0.5">
                      {enq.customer_name} • {enq.enquiry_category} ({enq.project_location})
                    </p>
                  </div>
                  <Link
                    href="/admin/enquiries"
                    className="shrink-0 rounded-xl bg-[#633719] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#3B2418] transition"
                  >
                    Open
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
