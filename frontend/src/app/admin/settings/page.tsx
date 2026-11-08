"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "@/hooks/use-api";
import { api, ApiError } from "@/lib/api";
import type { WebsiteSetting } from "@/lib/types";
import { storageUrl } from "@/lib/utils";
import { Field, FileUpload, ImageUpload, PageHeader } from "@/components/admin/form-parts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/site/content-states";

type SettingsResponse = { settings: WebsiteSetting[]; map: Record<string, string | null> };

const GROUP_LABELS: Record<string, string> = {
  general: "General",
  contact: "Contact Information",
  social: "Social Media",
  appearance: "Appearance",
  seo: "SEO",
};

const LONG_KEYS = ["description", "address", "about", "mission", "vision", "objectives", "footer_text", "meta_description"];

function mediaKind(value?: string | null): "image" | "video" | null {
  if (!value) return null;
  if (/\.(png|jpe?g|gif|webp|svg|avif|bmp|ico)(\?.*)?$/i.test(value)) return "image";
  if (/\.(mp4|webm|mov|ogv|m4v)(\?.*)?$/i.test(value)) return "video";
  if (/(youtube\.com|youtu\.be|vimeo\.com)/i.test(value)) return "video";
  return null;
}

function toEmbedUrl(value: string): string {
  try {
    const url = new URL(value);
    if (url.hostname.includes("youtube.com")) {
      const videoId = url.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      if (url.pathname.startsWith("/embed/")) return value;
    }
    if (url.hostname === "youtu.be") {
      const videoId = url.pathname.split("/").filter(Boolean)[0];
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.hostname.includes("vimeo.com")) {
      const videoId = url.pathname.split("/").filter(Boolean)[0];
      if (videoId) return `https://player.vimeo.com/video/${videoId}`;
    }
  } catch {
    // Not a valid absolute URL.
  }
  return value;
}

function MediaThumb({ setting, value }: { setting: WebsiteSetting; value: string }) {
  const kind = mediaKind(value) ?? (setting.type === "image" ? "image" : null);
  if (!kind || !value) return null;
  const src = storageUrl(value);
  return (
    <div className="overflow-hidden rounded-xl border border-burgundy/10 bg-cream">
      <div className="aspect-video w-full bg-cream-dark/60">
        {kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={setting.label ?? setting.key} className="h-full w-full object-contain" />
        ) : /(youtube\.com|youtu\.be|vimeo\.com)/i.test(value) ? (
          <iframe src={toEmbedUrl(value)} title={setting.label ?? setting.key} allowFullScreen className="h-full w-full" />
        ) : (
          <video src={src} controls className="h-full w-full bg-black object-contain" />
        )}
      </div>
      <div className="border-t border-burgundy/10 px-3 py-2">
        <p className="truncate text-xs font-semibold text-burgundy-800">{setting.label ?? setting.key}</p>
        <p className="truncate text-[10px] text-muted">{setting.key}</p>
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const { data, loading, error, refetch } = useApi<SettingsResponse>("/admin/settings");
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!data?.map) return;
    const next: Record<string, string> = {};
    Object.entries(data.map).forEach(([key, value]) => {
      next[key] = value ?? "";
    });
    setValues(next);
  }, [data]);

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/admin/settings", { settings: values });
      toast.success("Settings saved.");
      refetch();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-96 w-full" /></div>;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const groups = (data?.settings ?? []).reduce<Record<string, WebsiteSetting[]>>((acc, setting) => {
    const group = setting.group || "general";
    acc[group] = acc[group] ?? [];
    acc[group].push(setting);
    return acc;
  }, {});

  const mediaSettings = (data?.settings ?? []).filter((setting) => setting.type === "image" || mediaKind(values[setting.key]));

  return (
    <div>
      <PageHeader
        title="Website Settings"
        description="Organization details, contact information and branding shown on the public site."
        action={<Button onClick={save} disabled={saving}><Save /> {saving ? "Saving..." : "Save Changes"}</Button>}
      />

      {mediaSettings.length > 0 && (
        <section className="mb-5 rounded-2xl border border-burgundy/10 bg-white p-5 shadow-sm md:p-6">
          <h3 className="font-display text-lg font-bold text-burgundy-800">Image & Video Previews</h3>
          <p className="mt-1 text-sm text-muted">Live preview of every image and video configured across the website.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {mediaSettings.map((setting) => (
              <MediaThumb key={setting.key} setting={setting} value={values[setting.key] ?? ""} />
            ))}
          </div>
        </section>
      )}

      <div className="space-y-5">
        {Object.entries(groups).map(([group, settings]) => (
          <section key={group} className="rounded-2xl border border-burgundy/10 bg-white p-5 shadow-sm md:p-6">
            <h3 className="mb-4 font-display text-lg font-bold text-burgundy-800">{GROUP_LABELS[group] ?? group}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {settings.map((setting) => {
                const isLong = setting.type === "textarea" || LONG_KEYS.some((key) => setting.key.includes(key));
                return (
                  <Field
                    key={setting.key}
                    label={setting.label ?? setting.key}
                    hint={setting.key}
                    className={isLong ? "sm:col-span-2" : undefined}
                  >
                    {setting.type === "image" ? (
                      <ImageUpload
                        label=""
                        value={values[setting.key] ?? ""}
                        onChange={(value) => setValues((current) => ({ ...current, [setting.key]: value }))}
                        folder="settings"
                        aspect="aspect-[16/7]"
                      />
                    ) : setting.type === "video" ? (
                      <FileUpload
                        label=""
                        value={values[setting.key] ?? ""}
                        onChange={(value) => setValues((current) => ({ ...current, [setting.key]: value }))}
                        folder="settings"
                        accept="video/*"
                        hint="Upload an MP4, WebM or MOV file."
                      />
                    ) : isLong ? (
                      <textarea
                        value={values[setting.key] ?? ""}
                        onChange={(e) => setValues((current) => ({ ...current, [setting.key]: e.target.value }))}
                        rows={3}
                        className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/25"
                      />
                    ) : (
                      <Input
                        type={setting.type === "url" ? "url" : "text"}
                        value={values[setting.key] ?? ""}
                        onChange={(e) => setValues((current) => ({ ...current, [setting.key]: e.target.value }))}
                      />
                    )}
                  </Field>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="sticky bottom-4 mt-5 flex justify-end">
        <Button onClick={save} disabled={saving} size="lg"><Save /> {saving ? "Saving..." : "Save Changes"}</Button>
      </div>
    </div>
  );
}
