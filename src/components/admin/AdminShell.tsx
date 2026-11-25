"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  MessageSquareText,
  FileText,
  Image as ImageIcon,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

const ADMIN_LINKS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Enquiries", href: "/admin/enquiries", icon: MessageSquareText },
  { label: "Quotations", href: "/admin/quotations", icon: FileText },
  { label: "Banners", href: "/admin/banners", icon: ImageIcon },
  { label: "Site Settings", href: "/admin/settings", icon: Settings },
];

export function AdminShell({
  children,
  title,
  subtitle,
  adminEmail = "admin@furcho.in",
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  adminEmail?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    toast.info("Signed Out", "You have logged out of the Furcho Admin Portal.");
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex bg-[#F7F1E8] text-[#29221D]">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-[#2C1A11] text-[#FAF5ED] border-r border-[#C58B45]/25 z-40">
        <div className="flex items-center justify-between h-20 px-6 border-b border-white/10">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#FAF5ED] border border-[#C58B45]/40 p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="FURCHO Admin Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="text-lg font-black tracking-wider text-white block leading-none">
                FURCHO
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C58B45]">
                Admin CMS
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {ADMIN_LINKS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#633719] text-white shadow-soft border border-[#C58B45]/40"
                    : "text-[#EFE3D4]/80 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#C58B45]" : ""}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-2 px-2 py-1 text-xs text-[#E2D1BC]">
            <ShieldCheck className="w-4 h-4 text-[#C58B45] shrink-0" />
            <span className="truncate">{adminEmail}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-center gap-1 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20 transition"
            >
              <span>Store</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-1 rounded-xl bg-red-600/20 border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-200 hover:bg-red-600 hover:text-white transition"
            >
              <LogOut className="w-3 h-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-64 max-w-xs bg-[#2C1A11] text-[#FAF5ED] flex flex-col z-10">
            <div className="flex items-center justify-between h-16 px-5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#FAF5ED] p-1 border border-[#C58B45]/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo.png"
                    alt="FURCHO Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-black text-base text-white">FURCHO ADMIN</span>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-1 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {ADMIN_LINKS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold ${
                      isActive ? "bg-[#633719] text-white" : "text-[#EFE3D4]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-[#FAF5ED]/95 backdrop-blur-md border-b border-[#E5D5C3] px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-[#D8C7B4] bg-white text-[#29221D]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#29221D]">{title}</h1>
              {subtitle && <p className="text-xs text-[#6E5D52]">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-[#D8C7B4] bg-white px-3.5 py-2 text-xs font-bold text-[#633719] hover:bg-[#EFE3D4]/60 transition"
            >
              <span>Everyday Store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/premium"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-[#3B2418] px-3.5 py-2 text-xs font-bold text-[#C58B45] hover:bg-[#24150E] transition"
            >
              <span>Premium Store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
