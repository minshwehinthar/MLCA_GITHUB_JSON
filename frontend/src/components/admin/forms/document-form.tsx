"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { formatBytes } from "@/lib/utils";
import { useApi } from "@/hooks/use-api";
import type { Category, DocumentItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Field, FilePreview, FormActions, FormCard, PageHeader, TranslationTabs, uploadFile, type UploadedFile } from "@/components/admin/form-parts";

type LocaleKey = "en" | "my" | "mnw";
type TranslationValues = { title: string; description: string };
type Translations = Record<LocaleKey, TranslationValues>;

const empty: Translations = {
  en: { title: "", description: "" },
  my: { title: "", description: "" },
  mnw: { title: "", description: "" },
};

export function DocumentForm({ id }: { id?: number }) {
  const router = useRouter();
  const categories = useApi<Category[]>("/categories?type=document");
  const existing = useApi<DocumentItem>(id ? `/admin/documents/${id}` : null);

  const [translations, setTranslations] = useState<Translations>(empty);
  const [isPublished, setIsPublished] = useState(true);
  const [categoryId, setCategoryId] = useState("");
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!existing.data) return;
    const document = existing.data;
    setTranslations({
      en: { title: document.title_en ?? document.title, description: document.description ?? "" },
      my: { title: document.title_my ?? "", description: "" },
      mnw: { title: document.title_mnw ?? "", description: "" },
    });
    setIsPublished(document.is_published);
    setCategoryId(document.category?.id ? String(document.category.id) : "");
    setFile(
      document.file_path
        ? {
            path: document.file_path,
            url: document.url,
            name: document.file_name,
            original_name: document.title,
            mime_type: document.mime_type ?? "",
            size: document.file_size,
            type: "document",
          }
        : null
    );
  }, [existing.data]);

  const update = (locale: LocaleKey, field: keyof TranslationValues, value: string) => {
    setTranslations((current) => ({ ...current, [locale]: { ...current[locale], [field]: value } }));
  };

  const handleFile = async (selected?: File) => {
    if (!selected) return;
    setUploading(true);
    try {
      const uploaded = await uploadFile(selected, "documents");
      setFile(uploaded);
      if (!translations.en.title) setTranslations((current) => ({ ...current, en: { ...current.en, title: uploaded.original_name } }));
      toast.success("File uploaded.");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!translations.en.title.trim()) return toast.error("English title is required.");
    if (!file) return toast.error("Please upload a document file.");

    setSaving(true);
    const payload = {
      title: translations.en.title,
      title_my: translations.my.title || null,
      title_mnw: translations.mnw.title || null,
      description: translations.en.description || null,
      is_published: isPublished,
      category_id: categoryId ? Number(categoryId) : null,
      file_path: file.path,
      file_name: file.original_name || file.name,
      mime_type: file.mime_type || null,
      file_size: file.size,
    };

    try {
      if (id) await api.put(`/admin/documents/${id}`, payload);
      else await api.post("/admin/documents", payload);
      toast.success(id ? "Document updated." : "Document created.");
      router.push("/admin/documents");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Unable to save document.");
    } finally {
      setSaving(false);
    }
  };

  if (id && existing.loading) return <div className="space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-96 w-full" /></div>;

  return (
    <form onSubmit={submit} className="space-y-5">
      <PageHeader
        title={id ? "Edit Document" : "New Document"}
        description="Publish downloadable reports, forms and publications."
        action={<Button type="button" variant="outline" onClick={() => router.push("/admin/documents")}>Back to documents</Button>}
      />

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <FormCard title="Content">
            <TranslationTabs>
              {(locale) => (
                <>
                  <Field label="Title" required={locale === "en"}>
                    <Input value={translations[locale].title} onChange={(e) => update(locale, "title", e.target.value)} placeholder="Document title" />
                  </Field>
                  <Field label="Description">
                    <textarea
                      value={translations[locale].description}
                      onChange={(e) => update(locale, "description", e.target.value)}
                      rows={4}
                      className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/25"
                      placeholder="Brief description"
                    />
                  </Field>
                </>
              )}
            </TranslationTabs>
          </FormCard>
        </div>

        <div className="space-y-5">
          <FormCard title="File">
            <div>
              <Label>Document file</Label>
              <input ref={inputRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,application/pdf" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
              <div className="flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 shadow-sm">
                <span className="min-w-0 flex-1 truncate text-sm text-muted">
                  {file ? `${file.original_name || file.name}${file.size ? ` · ${formatBytes(file.size)}` : ""}` : "No file selected"}
                </span>
                <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading}>
                  {uploading ? <Loader2 className="animate-spin" /> : <Upload />} {file ? "Replace" : "Upload"}
                </Button>
                {file && (
                  <Button type="button" size="icon-sm" variant="ghost" className="text-red-500" onClick={() => setFile(null)} disabled={uploading}>
                    <X />
                  </Button>
                )}
              </div>
              {file && (
                <div className="mt-3">
                  <FilePreview path={file.path} url={file.url} mimeType={file.mime_type} label={file.original_name || file.name} />
                </div>
              )}
              <p className="mt-1 text-[11px] text-muted">PDF, Word, Excel or PowerPoint up to 20MB.</p>
            </div>
          </FormCard>

          <FormCard title="Settings">
            <div className="space-y-4">
              <Field label="Category">
                <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="">No category</option>
                  {(categories.data ?? []).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </Select>
              </Field>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="h-4 w-4 accent-burgundy" />
                Published
              </label>
            </div>
          </FormCard>
        </div>
      </div>

      <FormActions loading={saving} onCancel={() => router.push("/admin/documents")} submitLabel={id ? "Update Document" : "Create Document"} />
    </form>
  );
}
