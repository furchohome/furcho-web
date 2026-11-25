"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextValue {
  toast: {
    success: (title: string, description?: string) => void;
    error: (title: string, description?: string) => void;
    info: (title: string, description?: string) => void;
  };
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, title: string, description?: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, type, title, description }]);
      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  const value: ToastContextValue = {
    toast: {
      success: (title, description) => addToast("success", title, description),
      error: (title, description) => addToast("error", title, description),
      info: (title, description) => addToast("info", title, description),
    },
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast viewport */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-elevated transition-all duration-300 ${
              item.type === "success"
                ? "bg-[#FAF5ED] border-[#C58B45]/50 text-[#29221D]"
                : item.type === "error"
                ? "bg-red-50 border-red-300 text-red-950"
                : "bg-white border-[#EFE3D4] text-[#29221D]"
            }`}
          >
            {item.type === "success" && (
              <CheckCircle2 className="w-5 h-5 text-[#633719] shrink-0 mt-0.5" />
            )}
            {item.type === "error" && (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            )}
            {item.type === "info" && (
              <Info className="w-5 h-5 text-[#C58B45] shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-sm">
              <p className="font-semibold leading-snug">{item.title}</p>
              {item.description && (
                <p className="text-xs opacity-80 mt-0.5 leading-relaxed">{item.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeToast(item.id)}
              className="text-current opacity-60 hover:opacity-100 p-1 rounded-lg transition"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx.toast;
}
