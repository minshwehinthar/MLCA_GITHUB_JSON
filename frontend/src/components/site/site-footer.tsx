"use client";

import Link from "next/link";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { Facebook, Instagram, Youtube } from "@/components/site/social-icons";
import { storageUrl } from "@/lib/utils";
import { useSite } from "@/providers/site-provider";
import { useLocale } from "@/providers/locale-provider";

export function SiteFooter() {
  const { site, settings } = useSite();
  const { t } = useLocale();
  const year = new Date().getFullYear();

  const links = site?.navigation.footer?.length
    ? site.navigation.footer
    : [
        { id: 1, label: t("about"), url: "/about" },
        { id: 2, label: t("news"), url: "/news" },
        { id: 3, label: t("activities"), url: "/activities" },
        { id: 4, label: t("gallery"), url: "/gallery" },
        { id: 5, label: t("documents"), url: "/documents" },
        { id: 6, label: t("contact"), url: "/contact" },
      ];

  const socials = [
    { href: settings.facebook_url, icon: Facebook, label: "Facebook" },
    { href: settings.youtube_url, icon: Youtube, label: "YouTube" },
    { href: settings.instagram_url, icon: Instagram, label: "Instagram" },
    { href: settings.telegram_url, icon: Send, label: "Telegram" },
  ].filter((item) => Boolean(item.href));

  return (
    <footer className="mt-16 bg-burgundy-900 text-white/75">
      <div className="hero-pattern">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              {settings.footer_logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={storageUrl(settings.footer_logo)} alt={settings.site_short_name ?? "MLCA"} className="h-14 w-auto max-w-[200px] object-contain" />
              ) : (
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold font-display text-xl font-bold text-burgundy-900">
                  {settings.site_short_name ?? "M"}
                </span>
              )}
              <div>
                <p className="font-display text-xl font-bold text-white">
                  {settings.site_name ?? "Mon Literature and Culture Association"}
                </p>
                <p className="text-xs uppercase tracking-widest text-gold">{settings.university_name}</p>
              </div>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed">
              {settings.footer_about ?? settings.site_description}
            </p>
            {socials.length > 0 && (
              <div className="mt-5 flex items-center gap-2">
                {socials.map(({ href, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={href ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-gold hover:bg-gold hover:text-burgundy-900"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-display text-base font-bold text-white">Quick Links</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {links.map((item) => (
                <li key={item.id}>
                  <Link href={item.url} className="transition-colors hover:text-gold-light">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-base font-bold text-white">{t("contact")}</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {settings.address && (
                <li className="flex gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <span>{settings.address}</span>
                </li>
              )}
              {settings.email && (
                <li className="flex gap-2.5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <a href={`mailto:${settings.email}`} className="hover:text-gold-light">{settings.email}</a>
                </li>
              )}
              {settings.phone && (
                <li className="flex gap-2.5">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <span>{settings.phone}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-white/50 sm:flex-row">
          <p>© {year} {settings.copyright ?? "Mon Literature and Culture Association."}</p>
          <p>{settings.site_tagline}</p>
        </div>
      </div>
    </footer>
  );
}
