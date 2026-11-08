"use client";

import { useState } from "react";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { Facebook, Instagram, Youtube } from "@/components/site/social-icons";
import { toast } from "sonner";
import { useApi } from "@/hooks/use-api";
import { api, ApiError, withLocale } from "@/lib/api";
import type { Page } from "@/lib/types";
import { useLocale } from "@/providers/locale-provider";
import { useSite } from "@/providers/site-provider";
import { PageHero } from "@/components/site/page-hero";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PageSpinner } from "@/components/site/content-states";

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const emptyForm: ContactForm = { name: "", email: "", subject: "", message: "" };

export default function ContactPage() {
  const { locale, t } = useLocale();
  const { settings } = useSite();
  const page = useApi<Page>(withLocale("/pages/contact", locale));
  const [form, setForm] = useState<ContactForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const update = (field: keyof ContactForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});

    try {
      const response = await api.post("/contact", form);
      toast.success(response.message || "Your message has been sent successfully.");
      setForm(emptyForm);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
        setErrors(error.errors ?? {});
      } else {
        toast.error("Unable to send your message. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const details = [
    { icon: Mail, label: t("email"), value: settings.email, href: settings.email ? `mailto:${settings.email}` : undefined },
    { icon: Phone, label: "Phone", value: settings.phone, href: settings.phone ? `tel:${settings.phone}` : undefined },
    { icon: MapPin, label: "Address", value: settings.address },
    { icon: Clock, label: "Office Hours", value: settings.office_hours },
  ].filter((item) => Boolean(item.value));

  const socials = [
    { href: settings.facebook_url, icon: Facebook, label: "Facebook" },
    { href: settings.youtube_url, icon: Youtube, label: "YouTube" },
    { href: settings.instagram_url, icon: Instagram, label: "Instagram" },
    { href: settings.telegram_url, icon: Send, label: "Telegram" },
  ].filter((item) => Boolean(item.href));

  return (
    <div>
      <PageHero
        title={page.data?.title ?? t("contact")}
        description={page.data?.excerpt ?? "We would love to hear from you."}
        breadcrumb={[{ label: t("contact") }]}
      />

      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            {page.loading ? (
              <PageSpinner />
            ) : page.data?.content ? (
              <div className="rich-content mb-8" dangerouslySetInnerHTML={{ __html: page.data.content }} />
            ) : null}

            <div className="space-y-4">
              {details.map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex gap-4 rounded-xl border border-burgundy/10 bg-white p-4 shadow-sm">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-burgundy/10 text-burgundy">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-gold">{label}</p>
                    {href ? (
                      <a href={href} className="mt-0.5 block break-words text-sm font-medium text-burgundy-800 hover:text-burgundy">{value}</a>
                    ) : (
                      <p className="mt-0.5 break-words text-sm font-medium text-burgundy-800">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {socials.length > 0 && (
              <div className="mt-6">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Follow us</p>
                <div className="flex gap-2">
                  {socials.map(({ href, icon: Icon, label }) => (
                    <a
                      key={label}
                      href={href ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={label}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-burgundy/15 text-burgundy transition-colors hover:border-burgundy hover:bg-burgundy hover:text-white"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-burgundy/10 bg-white p-6 shadow-sm md:p-8">
            <h2 className="font-display text-2xl font-bold text-burgundy-800">{t("contactTitle")}</h2>
            <p className="mt-1 text-sm text-muted">Fill in the form and our team will get back to you.</p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">{t("name")} *</Label>
                  <Input id="name" value={form.name} onChange={(event) => update("name", event.target.value)} required placeholder="Your full name" />
                  {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name[0]}</p>}
                </div>
                <div>
                  <Label htmlFor="email">{t("email")} *</Label>
                  <Input id="email" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} required placeholder="you@example.com" />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email[0]}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="subject">{t("subject")}</Label>
                <Input id="subject" value={form.subject} onChange={(event) => update("subject", event.target.value)} placeholder="How can we help?" />
              </div>
              <div>
                <Label htmlFor="message">{t("message")} *</Label>
                <Textarea id="message" rows={6} value={form.message} onChange={(event) => update("message", event.target.value)} required placeholder="Write your message..." />
                {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message[0]}</p>}
              </div>
              <Button type="submit" size="lg" disabled={submitting} className="w-full">
                <Send /> {submitting ? t("submitting") : t("sendMessage")}
              </Button>
            </form>
          </div>
        </div>

        {settings.google_map_embed && (
          <div className="mt-12 overflow-hidden rounded-2xl border border-burgundy/10 shadow-sm">
            <iframe src={settings.google_map_embed} title="Map" className="h-[360px] w-full" loading="lazy" />
          </div>
        )}
      </div>
    </div>
  );
}
