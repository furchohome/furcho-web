"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, Loader2, Trash2, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

interface ImageUploadFieldProps {
  label: string;
  folder?: "products" | "enquiries" | "banners" | "quotations";
  value?: string;
  onChange: (url: string, fileName?: string) => void;
  helperText?: string;
  acceptPdf?: boolean;
}

export function ImageUploadField({
  label,
  folder = "products",
  value,
  onChange,
  helperText = "Upload JPG, PNG, or WebP image (Max 8 MB)",
  acceptPdf = false,
}: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const toast = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload file.");
      }

      onChange(data.url, data.name);
      toast.success(
        "File Uploaded Successfully",
        `Saved to ${data.provider === "CLOUDINARY" ? "Cloudinary" : "local dev storage (configure Cloudinary)"}`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error("Upload Error", msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-[#633719]">
        {label}
      </label>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border border-[#DFCWB8] bg-white p-3.5">
        {value ? (
          <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-[#EFE3D4] bg-[#FAF5ED]">
            {value.endsWith(".pdf") ? (
              <div className="flex h-full w-full flex-col items-center justify-center text-xs font-semibold text-[#633719]">
                PDF Document
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={value}
                alt="Uploaded preview"
                className="h-full w-full object-cover"
              />
            )}
          </div>
        ) : (
          <div className="flex h-20 w-28 shrink-0 flex-col items-center justify-center rounded-lg border border-dashed border-[#C58B45]/50 bg-[#FAF5ED] text-[#6E5D52]">
            <ImageIcon className="h-6 w-6 opacity-60" />
            <span className="mt-1 text-[10px]">No image</span>
          </div>
        )}

        <div className="flex-1 space-y-2 w-full">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptPdf ? "image/*,application/pdf" : "image/*"}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#633719] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#3B2418] transition disabled:opacity-60"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud className="h-3.5 w-3.5" />
                  {value ? "Replace Image" : "Upload Image"}
                </>
              )}
            </button>

            {value && (
              <button
                type="button"
                onClick={() => onChange("", "")}
                className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-2 text-xs font-medium text-red-700 hover:bg-red-100 transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            )}
          </div>

          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Or paste image path / URL..."
            className="w-full rounded-lg border border-[#E2D1BC] bg-[#FAF5ED]/60 px-3 py-1.5 text-xs text-[#29221D] focus:border-[#633719] focus:outline-none"
          />
          <p className="text-[11px] text-[#6E5D52] flex items-center gap-1">
            {value && <CheckCircle2 className="h-3 w-3 text-emerald-700 inline" />}
            {helperText}
          </p>
        </div>
      </div>
    </div>
  );
}
