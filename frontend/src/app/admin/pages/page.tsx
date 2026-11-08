"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "@/hooks/use-api";
import { api, ApiError } from "@/lib/api";
import type { Page } from "@/lib/types";
import { formatShortDate } from "@/lib/utils";
import { Field, PageHeader, TranslationTabs } from "@/components/admin/form-parts";
import { DeleteButton, EmptyRow } from "@/components/admin/list-helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/site/content-states";

type LocaleKey = "en" | "my" | "mnw";
type TranslationValues = {
  title: string;
  excerpt: string;
  content: string;
  history: string;
  vision: string;
  mission: string;
  objectives: string;
  meta_title: string;
  meta_description: string;
};
type Translations = Record<LocaleKey, TranslationValues>;

const blankTranslation: TranslationValues = {
  title: "", excerpt: "", content: "", history: "", vision: "", mission: "", objectives: "", meta_title: "", meta_description: "",
};
const blank: Translations = { en: { ...blankTranslation }, my: { ...blankTranslation }, mnw: { ...blankTranslation } };

export default function AdminPagesPage() {
  const { data, loading, error, refetch } = useApi<Page[]>("/admin/pages");
  const [open, setOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [slug, setSlug] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [translations, setTranslations] = useState<Translations>(blank);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editingSlug) {
      const page = data?.find((item) => item.slug === editingSlug);
      if (page) {
        setTranslations((current) => {
          const next = { ...current };
          (["en", "my", "mnw"] as LocaleKey[]).forEach((locale) => {
            const value = page.translations?.[locale];
            next[locale] = {
              title: value?.title ?? (locale === "en" ? page.title ?? "" : ""),
              excerpt: value?.excerpt ?? (locale === "en" ? page.excerpt ?? "" : ""),
              content: value?.content ?? (locale === "en" ? page.content ?? "" : ""),
              history: value?.history ?? (locale === "en" ? page.history ?? "" : ""),
              vision: value?.vision ?? (locale === "en" ? page.vision ?? "" : ""),
              mission: value?.mission ?? (locale === "en" ? page.mission ?? "" : ""),
              objectives: value?.objectives ?? (locale === "en" ? page.objectives ?? "" : ""),
              meta_title: value?.meta_title ?? (locale === "en" ? page.meta_title ?? "" : ""),
              meta_description: value?.meta_description ?? (locale === "en" ? page.meta_description ?? "" : ""),
            };
          });
          return next;
        });
        setSlug(page.slug);
        setIsPublished(page.is_published);
      }
    } else {
      setTranslations({ en: { ...blankTranslation }, my: { ...blankTranslation }, mnw: { ...blankTranslation } });
      setSlug("");
      setIsPublished(true);
    }
  }, [open, editingSlug, data]);

  const update = (locale: LocaleKey, field: keyof TranslationValues, value: string) => {
    setTranslations((current) => ({ ...current, [locale]: { ...current[locale], [field]: value } }));
  };

  const startCreate = () => {
    setEditingSlug(null);
    setOpen(true);
  };

  const save = async () => {
    if (!editingSlug && !slug.trim()) return toast.error("Slug is required.");
    if (!translations.en.title.trim()) return toast.error("English title is required.");

    setSaving(true);
    const payload = { slug: editingSlug ?? slug, is_published: isPublished, translations };
    try {
      if (editingSlug) await api.put(`/admin/pages/${editingSlug}`, payload);
      else await api.post("/admin/pages", payload);
      toast.success(editingSlug ? "Page updated." : "Page created.");
      setOpen(false);
      refetch();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to save page.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Pages"
        description="Static content such as About, Vision, Mission and Objectives."
        action={<Button onClick={startCreate}><Plus /> New Page</Button>}
      />

      <div className="overflow-hidden rounded-2xl border border-burgundy/10 bg-white shadow-sm">
        {loading ? <TableSkeleton /> : error ? (
          <div className="p-4"><ErrorState message={error} onRetry={refetch} /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.length ? data.map((page) => (
                <TableRow key={page.id}>
                  <TableCell>
                    <p className="font-semibold text-burgundy-800">{page.title ?? "(untitled)"}</p>
                    {page.excerpt && <p className="max-w-[360px] truncate text-[11px] text-muted">{page.excerpt}</p>}
                  </TableCell>
                  <TableCell className="text-xs text-muted">/{page.slug}</TableCell>
                  <TableCell><Badge className={page.is_published ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-stone-200 text-stone-700 border-stone-300"}>{page.is_published ? "Published" : "Draft"}</Badge></TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted">{formatShortDate(page.updated_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" title="Edit" onClick={() => { setEditingSlug(page.slug); setOpen(true); }}><Pencil /></Button>
                      <DeleteButton endpoint={`/admin/pages/${page.slug}`} name={`“${page.title ?? page.slug}”`} onDeleted={refetch} />
                    </div>
                  </TableCell>
                </TableRow>
              )) : <EmptyRow colSpan={5} title="No pages found" />}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingSlug ? "Edit Page" : "New Page"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Field label="Slug" required={!editingSlug} hint={editingSlug ? "Slug cannot be changed after creation." : "e.g. about, vision-mission"}>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} disabled={Boolean(editingSlug)} placeholder="about" />
              </Field>
              <label className="mt-6 flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="h-4 w-4 accent-burgundy" />
                Published
              </label>
            </div>

            <TranslationTabs>
              {(locale) => (
                <>
                  <Field label="Title" required={locale === "en"}>
                    <Input value={translations[locale].title} onChange={(e) => update(locale, "title", e.target.value)} />
                  </Field>
                  <Field label="Excerpt"><Input value={translations[locale].excerpt} onChange={(e) => update(locale, "excerpt", e.target.value)} /></Field>
                  <Field label="Content">
                    <RichTextEditor value={translations[locale].content} onChange={(value) => update(locale, "content", value)} />
                  </Field>
                  <Field label="History">
                    <textarea value={translations[locale].history} onChange={(e) => update(locale, "history", e.target.value)} rows={3} className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/25" />
                  </Field>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Vision"><textarea value={translations[locale].vision} onChange={(e) => update(locale, "vision", e.target.value)} rows={3} className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/25" /></Field>
                    <Field label="Mission"><textarea value={translations[locale].mission} onChange={(e) => update(locale, "mission", e.target.value)} rows={3} className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/25" /></Field>
                  </div>
                  <Field label="Objectives"><textarea value={translations[locale].objectives} onChange={(e) => update(locale, "objectives", e.target.value)} rows={3} className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/25" /></Field>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Meta title"><Input value={translations[locale].meta_title} onChange={(e) => update(locale, "meta_title", e.target.value)} /></Field>
                    <Field label="Meta description"><Input value={translations[locale].meta_description} onChange={(e) => update(locale, "meta_description", e.target.value)} /></Field>
                  </div>
                </>
              )}
            </TranslationTabs>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Page"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
