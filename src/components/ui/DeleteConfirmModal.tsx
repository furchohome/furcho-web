"use client";

import React from "react";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  itemName: string;
  description?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  title,
  itemName,
  description,
  isDeleting = false,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/55 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-[#FAF5ED] border border-[#EFE3D4] p-6 shadow-elevated animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isDeleting}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-[#6E5D52] hover:bg-[#EFE3D4]/60 hover:text-[#29221D] transition"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700 border border-red-200">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[#29221D]">{title}</h3>
            <p className="mt-1.5 text-sm text-[#6E5D52] leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-[#29221D]">&ldquo;{itemName}&rdquo;</span>?
            </p>
            {description && (
              <p className="mt-1.5 text-xs text-red-700/90 bg-red-50 border border-red-200/70 rounded-lg px-3 py-2">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-xl border border-[#D8C7B4] bg-white px-4 py-2.5 text-sm font-medium text-[#29221D] hover:bg-[#EFE3D4]/50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition shadow-xs disabled:opacity-60"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Confirm Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
