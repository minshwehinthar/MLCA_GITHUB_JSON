"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, MapPin, Menu, Phone, X } from "lucide-react";
import { cn, storageUrl } from "@/lib/utils";
import { useSite } from "@/providers/site-provider";
import { useLocale } from "@/providers/locale-provider";
import { LanguageSwitcher } from "./language-switcher";

export function SiteHeader() {
  const pathname = usePathname();
  const { site, settings } = useSite();
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const nav: { id: number; label: string; url: string; target?: string | null }[] = site?.navigation.header?.length
    ? site.navigation.header
    : [
        { id: 1, label: t("home"), url: "/" },
        { id: 2, label: t("about"), url: "/about" },
        { id: 3, label: t("news"), url: "/news" },
        { id: 4, label: t("activities"), url: "/activities" },
        { id: 5, label: t("events"), url: "/events" },
        { id: 6, label: t("gallery"), url: "/gallery" },
        { id: 7, label: t("videos"), url: "/videos" },
        { id: 8, label: t("documents"), url: "/documents" },
        { id: 9, label: t("members"), url: "/members" },
        { id: 10, label: t("contact"), url: "/contact" },
      ];

  const isActive = (url: string) => (url === "/" ? pathname === "/" : pathname.startsWith(url));

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="hidden bg-burgundy-900 text-white/80 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            {settings.email && (
              <a href={`mailto:${settings.email}`} className="inline-flex items-center gap-1.5 hover:text-gold-light">
                <Mail className="h-3.5 w-3.5 text-gold" />
                {settings.email}
              </a>
            )}
            {settings.phone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-gold" />
                {settings.phone}
              </span>
            )}
            {settings.address && (
              <span className="hidden items-center gap-1.5 lg:inline-flex">
                <MapPin className="h-3.5 w-3.5 text-gold" />
                {settings.address}
              </span>
            )}
          </div>
          <LanguageSwitcher variant="dark" />
        </div>
      </div>

      <div className="border-b border-burgundy/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            {settings.site_logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={storageUrl(settings.site_logo)} alt={settings.site_short_name ?? "MLCA"} className="h-12 w-auto max-w-[180px] object-contain sm:h-14" />
            ) : (
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-burgundy font-display text-lg font-bold text-gold">
                {settings.site_short_name ?? "M"}
              </span>
            )}
            <span className="leading-tight">
              <span className="block font-display text-lg font-bold text-burgundy-800 sm:text-xl">
                {settings.site_short_name ?? "MLCA"}
              </span>
              <span className="hidden max-w-[240px] text-[11px] leading-snug text-muted sm:block">
                {settings.site_name ?? "Mon Literature and Culture Association"}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 xl:flex">
            {nav.map((item) => (
              <Link
                key={item.id}
                href={item.url}
                target={item.target ?? undefined}
                className={cn(
                  "rounded-lg px-2.5 py-2 text-[13px] font-semibold transition-colors",
                  isActive(item.url)
                    ? "bg-burgundy/10 text-burgundy"
                    : "text-ink/80 hover:bg-cream-dark hover:text-burgundy"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="md:hidden">
              <LanguageSwitcher />
            </div>
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label="Toggle navigation"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-burgundy/20 text-burgundy xl:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-burgundy/10 bg-white xl:hidden">
            <nav className="mx-auto grid max-w-7xl gap-1 px-4 py-3 sm:grid-cols-2">
              {nav.map((item) => (
                <Link
                  key={item.id}
                  href={item.url}
                  target={item.target ?? undefined}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive(item.url) ? "bg-burgundy text-white" : "text-ink hover:bg-cream-dark"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
