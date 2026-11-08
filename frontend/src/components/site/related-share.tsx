"use client";

import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { Facebook, Linkedin, Twitter } from "@/components/site/social-icons";
import { shareLinks } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";

export function ShareButtons({ title }: { title: string }) {
  const { t } = useLocale();
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const links = shareLinks(url, title);
  const items = [
    { href: links.facebook, icon: Facebook, label: "Facebook" },
    { href: links.telegram, icon: Send, label: "Telegram" },
    { href: links.twitter, icon: Twitter, label: "Twitter" },
    { href: links.linkedin, icon: Linkedin, label: "LinkedIn" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-burgundy/10 pt-5">
      <span className="mr-1 text-xs font-bold uppercase tracking-wide text-muted">{t("share")}</span>
      {items.map(({ href, icon: Icon, label }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-burgundy/15 text-burgundy transition-colors hover:border-burgundy hover:bg-burgundy hover:text-white"
        >
          <Icon className="h-3.5 w-3.5" />
        </a>
      ))}
    </div>
  );
}
