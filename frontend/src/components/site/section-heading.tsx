"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLocale } from "@/providers/locale-provider";

export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  align = "left",
  invert = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  align?: "left" | "center";
  invert?: boolean;
}) {
  const { t } = useLocale();

  return (
    <div className={`mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between ${align === "center" ? "sm:flex-col sm:items-center sm:text-center" : ""}`}>
      <div>
        {eyebrow && (
          <p className={`mb-1 text-xs font-bold uppercase tracking-[0.18em] ${invert ? "text-gold-light" : "text-gold"}`}>
            {eyebrow}
          </p>
        )}
        <h2 className={`font-display text-2xl font-bold md:text-3xl ${invert ? "text-white" : "text-burgundy-800"}`}>{title}</h2>
        {description && (
          <p className={`mt-2 max-w-2xl text-sm leading-relaxed ${invert ? "text-white/70" : "text-muted"}`}>{description}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
            invert
              ? "border-white/25 text-white hover:bg-white/10"
              : "border-burgundy/20 text-burgundy hover:bg-burgundy/5"
          }`}
        >
          {t("viewAll")}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
