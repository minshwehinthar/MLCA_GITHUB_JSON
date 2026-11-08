"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import type { Activity, Category, MediaItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Skeleton } from "@/components/ui/skeleton";
import { Field, FormActions, FormCard, ImageUpload, MediaManager, PageHeader, TranslationTabs } from "@/components/admin/form-parts";

type LocaleKey = "en" | "my" | "mnw";
type TranslationValues = { title: string; slug: string; description: string; content: string };
type Translations = Record<LocaleKey, TranslationValues>;

const empty: Translations = {
  en: { title: "", slug: "", description: "", content: "" },
  my: { title: "", slug: "", description: "", content: "" },
  mnw: { title: "", slug: "", description: "", content: "" },
};

export function ActivityForm({ id }: { id?: number }) {
  const router = useRouter();
  const categories = useApi<Category[]>("/categories");
  const existing = useApi<Activity>(id ? `/admin/activities/${id}` : null);

  const [translations, setTranslations] = useState<Translations>(empty);
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("upcoming");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [cover, setCover] = useState("");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!existing.data) return;
    const activity = existing.data;
    const next: Translations = { ...empty };
    (["en", "my", "mnw"] as LocaleKey[]).forEach((locale) => {
      const item = activity.translations?.[locale];
      next[locale] = {
        title: item?.title ?? (locale === "en" ? activity.title : ""),
        slug: item?.slug ?? (locale === "en" ? activity.slug : ""),
        description: item?.description ?? (locale === "en" ? activity.description ?? "" : ""),
        content: item?.content ?? (locale === "en" ? activity.content ?? "" : ""),
      };
    });
    setTranslations(next);
    setCategoryId(activity.category?.id ? String(activity.category.id) : "");
    setStatus(activity.status);
    setStartDate(activity.start_date ?? "");
    setEndDate(activity.end_date ?? "");
    setStartTime(activity.start_time ?? "");
    setEndTime(activity.end_time ?? "");
    setLocation(activity.location ?? "");
    setIsFeatured(activity.is_featured);
    setCover(activity.cover_path ?? "");
    setMedia(activity.media ?? []);
  }, [existing.data]);

  const update = (locale: LocaleKey, field: keyof TranslationValues, value: string) => {
    setTranslations((current) => ({ ...current, [locale]: { ...current[locale], [field]: value } }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!translations.en.title.trim()) return toast.error("English title is required.");
    if (!startDate) return toast.error("Start date is required.");

    setSaving(true);
    const payload = {
      category_id: categoryId ? Number(categoryId) : null,
      status,
      start_date: startDate,
      end_date: endDate || null,
      start_time: startTime || null,
      end_time: endTime || null,
      location: location || null,
      is_featured: isFeatured,
      cover_image: cover || null,
      translations,
      media: media.map((item) => ({
        id: item.id, file_path: item.file_path, file_name: item.file_name, original_name: item.original_name,
        mime_type: item.mime_type, size: item.size, type: item.type, collection: "attachment",
      })),
    };

    try {
      if (id) await api.put(`/admin/activities/${id}`, payload);
      else await api.post("/admin/activities", payload);
      toast.success(id ? "Activity updated." : "Activity created.");
      router.push("/admin/activities");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Unable to save activity.");
    } finally {
      setSaving(false);
    }
  };

  if (id && existing.loading) return <div className="space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-96 w-full" /></div>;

  const items = (categories.data ?? []).filter((item) => item.type === "activity" || item.type === "event");

  return (
    <form onSubmit={submit} className="space-y-5">
      <PageHeader
        title={id ? "Edit Activity" : "New Activity"}
        description="Programs, cultural projects and community initiatives."
        action={<Button type="button" variant="outline" onClick={() => router.push("/admin/activities")}>Back to activities</Button>}
      />

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <FormCard title="Content">
            <TranslationTabs>
              {(locale) => (
                <>
                  <Field label="Title" required={locale === "en"}>
                    <Input value={translations[locale].title} onChange={(e) => update(locale, "title", e.target.value)} placeholder="Activity title" />
                  </Field>
                  <Field label="Slug" hint="Leave blank to generate automatically.">
                    <Input value={translations[locale].slug} onChange={(e) => update(locale, "slug", e.target.value)} placeholder="activity-slug" />
                  </Field>
                  <Field label="Short description">
                    <textarea
                      value={translations[locale].description}
                      onChange={(e) => update(locale, "description", e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/25"
                      placeholder="Brief summary"
                    />
                  </Field>
                  <Field label="Full content">
                    <RichTextEditor value={translations[locale].content} onChange={(value) => update(locale, "content", value)} />
                  </Field>
                </>
              )}
            </TranslationTabs>
          </FormCard>
        </div>

        <div className="space-y-5">
          <FormCard title="Schedule & Location">
            <div className="space-y-4">
              <Field label="Status">
                <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start date" required><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></Field>
                <Field label="End date"><Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></Field>
                <Field label="Start time"><Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></Field>
                <Field label="End time"><Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></Field>
              </div>
              <Field label="Location"><Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Venue / place" /></Field>
              <Field label="Category">
                <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="">No category</option>
                  {items.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </Select>
              </Field>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4 accent-burgundy" />
                Feature this activity
              </label>
            </div>
          </FormCard>

          <FormCard title="Cover Image">
            <ImageUpload value={cover} onChange={setCover} folder="activities" />
          </FormCard>

          <FormCard title="Gallery / Attachments">
            <MediaManager value={media} onChange={setMedia} folder="activities" />
          </FormCard>
        </div>
      </div>

      <FormActions loading={saving} onCancel={() => router.push("/admin/activities")} submitLabel={id ? "Update Activity" : "Create Activity"} />
    </form>
  );
}
