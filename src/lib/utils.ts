import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats integer paise into Indian Rupees (e.g., 299900 -> "₹2,999")
 * Strictly uses integer arithmetic — no floating point drift.
 */
export function formatPaiseToINR(paise: number | null | undefined): string {
  if (paise === null || paise === undefined) return "To be confirmed";
  const rupees = Math.round(paise / 100);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}

export function rupeesToPaise(rupees: number | string): number {
  const numeric = typeof rupees === "string" ? parseFloat(rupees.replace(/[^0-9.]/g, "")) : rupees;
  if (isNaN(numeric) || numeric < 0) return 0;
  return Math.round(numeric * 100);
}

export function paiseToRupees(paise: number | null | undefined): number {
  if (!paise) return 0;
  return Math.round(paise / 100);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export const KERALA_DISTRICTS = [
  "Thiruvananthapuram",
  "Kollam",
  "Pathanamthitta",
  "Alappuzha",
  "Kottayam",
  "Idukki",
  "Ernakulam",
  "Thrissur",
  "Palakkad",
  "Malappuram",
  "Kozhikode",
  "Wayanad",
  "Kannur",
  "Kasaragod",
] as const;

export function buildWhatsAppLink(phone: string, message: string): string {
  const cleanedPhone = phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(message)}`;
}
