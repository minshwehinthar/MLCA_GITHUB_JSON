"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useLocale } from "@/providers/locale-provider";

interface PageHeroProps {
  title: string;
  description?: string;
  breadcrumb?: { label: string; href?: string }[];
}

export function PageHero({ title, description, breadcrumb }: PageHeroProps) {
  const { t } = useLocale();

  return (
    <section className="hero-pattern relative overflow-hidden bg-burgundy-900 text-white">
      <div className="mon-pattern absolute inset-0 opacity-30" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 md:py-20">
        <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-white/60">
          <Link href="/" className="transition-colors hover:text-gold-light">{t("home")}</Link>
          {breadcrumb?.map((item, index) => (
            <span key={index} className="flex items-center gap-1.5">
              <ChevronRight className="h-3 w-3" />
              {item.href ? (
                <Link href={item.href} className="transition-colors hover:text-gold-light">{item.label}</Link>
              ) : (
                <span className="text-gold-light">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
        <h1 className="font-display text-3xl font-bold md:text-5xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 md:text-base">{description}</p>}
        <div className="mt-6 h-1 w-20 rounded-full bg-gold" />
      </div>
    </section>
  );
}
