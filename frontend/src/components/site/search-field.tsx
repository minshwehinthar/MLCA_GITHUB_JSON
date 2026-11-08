"use client";

import { Search, X } from "lucide-react";
import { useLocale } from "@/providers/locale-provider";

export function SearchField({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const { t } = useLocale();

  return (
    <div className={`relative ${className ?? ""}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t("searchPlaceholder")}
        className="h-10 w-full rounded-lg border border-stone-300 bg-white pl-9 pr-9 text-sm shadow-sm outline-none transition-colors placeholder:text-stone-400 focus:border-burgundy focus:ring-2 focus:ring-burgundy/25"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-stone-400 hover:text-burgundy"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
