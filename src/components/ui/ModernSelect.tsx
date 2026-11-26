"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface ModernSelectOption {
  value: string;
  label: string;
}

interface ModernSelectProps {
  options: ModernSelectOption[];
  value: string;
  onChange: (value: string) => void;
  labelPrefix?: string;
  placeholder?: string;
  isPremium?: boolean;
  className?: string;
  menuAlign?: "left" | "right";
}

export function ModernSelect({
  options,
  value,
  onChange,
  labelPrefix = "",
  placeholder = "Select...",
  isPremium = false,
  className = "",
  menuAlign = "left",
}: ModernSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const isFullWidth = className.includes("w-full");

  return (
    <div ref={containerRef} className={`relative ${isFullWidth ? "w-full" : "inline-block"} ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full inline-flex items-center justify-between gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-bold border transition cursor-pointer select-none shadow-2xs ${
          isPremium
            ? isOpen
              ? "bg-[#2A170E] border-[#C58B45] text-[#FAF5ED]"
              : "bg-[#1E110A] border-[#C58B45]/40 text-[#FAF5ED] hover:border-[#C58B45]"
            : isOpen
            ? "bg-[#F3E7D6] border-[#633719] text-[#3B2418]"
            : "bg-[#FAF5ED] border-[#DECAB2] text-[#4B2913] hover:bg-[#F3E7D6] hover:border-[#8D4F23]"
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">
          {labelPrefix}
          <span className={isPremium ? "text-[#E5B869]" : "text-[#3B2418]"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          } ${isPremium ? "text-[#C58B45]" : "text-[#6E5D52]"}`}
        />
      </button>

      {/* Floating Menu Popover */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute z-50 mt-1.5 ${
            isFullWidth ? "w-full min-w-full" : "min-w-[170px] max-w-[calc(100vw-32px)]"
          } max-h-64 overflow-y-auto rounded-2xl p-1.5 shadow-elevated border animate-fade-in ${
            menuAlign === "right" ? "right-0" : "left-0"
          } ${
            isPremium
              ? "bg-[#25150D] border-[#C58B45]/30 text-[#FAF5ED]"
              : "bg-white border-[#EFE3D4] text-[#29221D]"
          }`}
        >
          <div className="space-y-0.5">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs transition cursor-pointer text-left ${
                    isSelected
                      ? isPremium
                        ? "bg-[#3B2418] text-[#E5B869] font-bold"
                        : "bg-[#633719] text-white font-bold shadow-2xs"
                      : isPremium
                      ? "text-[#EFE3D4] hover:bg-[#341F14] hover:text-[#C58B45] font-semibold"
                      : "text-[#4B2913] hover:bg-[#FAF5ED] hover:text-[#633719] font-semibold"
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && (
                    <Check
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isSelected && !isPremium ? "text-white" : "text-[#E5B869]"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
