"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Search, MapPin } from "lucide-react";
import { Customer } from "@/types/database";
import { buildWhatsAppLink } from "@/lib/utils";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminCustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/cms");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setCustomers(data.customers || []);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const filtered = customers.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.full_name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.district.toLowerCase().includes(q)
    );
  });

  return (
    <AdminShell
      title="Customer Directory"
      subtitle="Customers who submitted Order Requests or Custom Furniture Enquiries across Kerala"
    >
      <div className="space-y-6">
        <div className="rounded-2xl bg-white border border-[#E5D5C3] p-4 shadow-soft flex items-center justify-between">
          <div className="relative flex items-center max-w-md w-full">
            <Search className="w-4 h-4 text-[#6E5D52] absolute left-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer name, phone or district..."
              className="w-full rounded-xl border border-[#D8C7B4] bg-[#FAF5ED] pl-10 pr-4 py-2 text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl bg-white border border-[#E5D5C3] shadow-soft">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EFE3D4] bg-[#FAF5ED] text-[11px] font-extrabold uppercase tracking-wider text-[#6E5D52]">
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">District &amp; Address</th>
                <th className="py-3.5 px-4">Activity</th>
                <th className="py-3.5 px-4 text-right">Connect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE3D4] text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[#6E5D52]">
                    Loading customers...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[#6E5D52]">
                    No customers found.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAF5ED]/50">
                    <td className="py-4 px-4 font-extrabold text-[#29221D]">
                      {c.full_name}
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-[#633719]">+91 {c.phone}</p>
                      {c.email && <p className="text-xs text-[#6E5D52]">{c.email}</p>}
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-xs font-bold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#C58B45]" />
                        {c.district} — {c.city}
                      </p>
                      {c.full_address && (
                        <p className="text-xs text-[#6E5D52] truncate max-w-xs">
                          {c.full_address}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-4 text-xs">
                      <span className="rounded-lg bg-[#EFE0CC] px-2.5 py-1 font-bold text-[#633719] mr-2">
                        {c.total_orders} Orders
                      </span>
                      <span className="rounded-lg bg-[#3B2418] px-2.5 py-1 font-bold text-[#C58B45]">
                        {c.total_enquiries} Enquiries
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <a
                        href={buildWhatsAppLink(
                          `91${c.phone.replace(/^91/, "")}`,
                          `Hello ${c.full_name}, greetings from Furcho Furniture Kerala!`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
