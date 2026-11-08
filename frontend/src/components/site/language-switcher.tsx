"use client";

import { Check, Globe } from "lucide-react";
import { LOCALES } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher({ variant = "light" }: { variant?: "light" | "dark" }) {
  const { locale, setLocale } = useLocale();
  const current = LOCALES.find((l) => l.code === locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
          variant === "dark"
            ? "border-white/25 text-white/90 hover:bg-white/10"
            : "border-burgundy/20 text-burgundy hover:bg-burgundy/5"
        )}
      >
        <Globe className="h-3.5 w-3.5" />
        {current?.short ?? "EN"}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map((item) => (
          <DropdownMenuItem key={item.code} onClick={() => setLocale(item.code)}>
            <span className="flex-1">{item.native}</span>
            {item.code === locale && <Check className="h-4 w-4 text-burgundy" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
