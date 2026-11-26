"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

export default function AdminLoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid credentials.");
      }

      toast.success("Welcome back!", `Signed in as ${data.session.email}`);
      router.push("/admin/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed.";
      toast.error("Admin Login Failed", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-[#24150E] via-[#3B2418] to-[#24150E] px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-[#FAF5ED] border border-[#C58B45]/40 p-8 shadow-elevated space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FAF5ED] p-2 border border-[#C58B45]/40 shadow-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="FURCHO Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#29221D]">FURCHO® Admin Portal</h1>
          <p className="text-xs text-[#6E5D52]">
            Protected by Supabase Auth &amp; Server-Side Authorization
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#29221D] mb-1.5">
              Username / Email
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-[#6E5D52] absolute left-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Username"
                autoComplete="username"
                className="w-full rounded-xl border border-[#D8C7B4] bg-white pl-10 pr-4 py-2.5 text-sm text-[#29221D] placeholder:text-[#A8988B] focus:border-[#633719] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#29221D] mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-[#6E5D52] absolute left-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                className="w-full rounded-xl border border-[#D8C7B4] bg-white pl-10 pr-4 py-2.5 text-sm text-[#29221D] placeholder:text-[#A8988B] focus:border-[#633719] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#633719] px-6 py-3.5 text-sm font-bold text-white hover:bg-[#3B2418] transition shadow-card disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <span>Sign In to Admin Dashboard</span>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#633719] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Furcho Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
