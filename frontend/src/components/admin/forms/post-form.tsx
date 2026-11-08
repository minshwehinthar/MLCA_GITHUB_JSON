"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import type { Category, MediaItem, Post } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Skeleton } from "@/components/ui/skeleton";
import { Field, FormActions, FormCard, ImageUpload, MediaManager, TranslationTabs, PageHeader } from "@/components/admin/form-parts";
import { Link } from "lucide-react";

type LocaleKey = "en" | "my" | "mnw";
type TranslationValues = { title: string; slug: string; excerpt: string; content: string };
type Translations = Record<LocaleKey, TranslationValues>;

const emptyTranslations: Translations = {
  en: { title: "", slug: "", excerpt: "", content: "" },
  my: { title: "", slug: "", excerpt: "", content: "" },
  mnw: { title: "", slug: "", excerpt: "", content: "" },
};

export function PostForm({ id }: { id?: number }) {
  const router = useRouter();
  const categories = useApi<Category[]>("/categories");
  const existing = useApi<Post>(id ? `/admin/posts/${id}` : null);

  const [translations, setTranslations] = useState<Translations>(emptyTranslations);
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("draft");
  const [isFeatured, setIsFeatured] = useState(false);
  const [publishedAt, setPublishedAt] = useState("");
  const [cover, setCover] = useState("");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!existing.data) return;
    const post = existing.data;
    const next: Translations = { ...emptyTranslations };
    (["en", "my", "mnw"] as LocaleKey[]).forEach((locale) => {
      const item = post.translations?.[locale];
      next[locale] = {
        title: item?.title ?? (locale === "en" ? post.title : ""),
        slug: item?.slug ?? (locale === "en" ? post.slug : ""),
        excerpt: item?.excerpt ?? (locale === "en" ? post.excerpt ?? "" : ""),
        content: item?.content ?? (locale === "en" ? post.content ?? "" : ""),
      };
    });
    setTranslations(next);
    setCategoryId(post.category?.id ? String(post.category.id) : "");
    setStatus(post.status);
    setIsFeatured(post.is_featured);
    setPublishedAt(post.published_at ? post.published_at.slice(0, 16) : "");
    setCover(post.cover_path ?? "");
    setMedia(post.media ?? []);
  }, [existing.data]);

  const update = (locale: LocaleKey, field: keyof TranslationValues, value: string) => {
    setTranslations((current) => ({ ...current, [locale]: { ...current[locale], [field]: value } }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!translations.en.title.trim()) {
      toast.error("English title is required.");
      return;
    }

    setSaving(true);
    const payload = {
      category_id: categoryId ? Number(categoryId) : null,
      status,
      is_featured: isFeatured,
      published_at: publishedAt || null,
      cover_image: cover || null,
      translations,
      media: media.map((item) => ({
        id: item.id,
        file_path: item.file_path,
        file_name: item.file_name,
        original_name: item.original_name,
        mime_type: item.mime_type,
        size: item.size,
        type: item.type,
        collection: "attachment",
      })),
    };

    try {
      if (id) await api.put(`/admin/posts/${id}`, payload);
      else await api.post("/admin/posts", payload);
      toast.success(id ? "Post updated." : "Post created.");
      router.push("/admin/posts");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Unable to save post.");
    } finally {
      setSaving(false);
    }
  };

  if (id && existing.loading) {
    return <div className="space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-96 w-full" /></div>;
  }

  const postCategories = (categories.data ?? []).filter((item) => ["post", "announcement"].includes(item.type));

  return (
    <form onSubmit={submit} className="space-y-5">
      <PageHeader
        title={id ? "Edit Post" : "New Post"}
        description={id ? "Update the article and its translations." : "Publish news, announcements and stories."}
        action={<Button type="button" variant="outline" onClick={() => router.push("/admin/posts")}>Back to posts</Button>}
      />

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <FormCard title="Content" description="Write the article in one or more languages.">
            <TranslationTabs>
              {(locale) => (
                <>
                  <Field label="Title" required={locale === "en"}>
                    <Input value={translations[locale].title} onChange={(e) => update(locale, "title", e.target.value)} placeholder="Post title" />
                  </Field>
                  <Field label="Slug" hint="Leave blank to generate automatically.">
                    <Input value={translations[locale].slug} onChange={(e) => update(locale, "slug", e.target.value)} placeholder="post-slug" />
                  </Field>
                  <Field label="Excerpt">
                    <textarea
                      value={translations[locale].excerpt}
                      onChange={(e) => update(locale, "excerpt", e.target.value)}
                      rows={3}
                      placeholder="Short summary shown in listings"
                      className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/25"
                    />
                  </Field>
                  <Field label="Content">
                    <RichTextEditor value={translations[locale].content} onChange={(value) => update(locale, "content", value)} placeholder="Write the post content..." />
                  </Field>
                </>
              )}
            </TranslationTabs>
          </FormCard>
        </div>

        <div className="space-y-5">
          <FormCard title="Publish">
            <div className="space-y-4">
              <Field label="Status">
                <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </Select>
              </Field>
              <Field label="Category">
                <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="">No category</option>
                  {postCategories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Publish date" hint="Leave blank to use the current date when publishing.">
                <Input type="datetime-local" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
              </Field>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4 rounded border-stone-300 accent-burgundy" />
                Feature this post
              </label>
            </div>
          </FormCard>

          <FormCard title="Cover Image">
            <ImageUpload value={cover} onChange={setCover} folder="posts" hint="Recommended 1200×630px. JPG, PNG or WebP." />
          </FormCard>

          <FormCard title="Attachments">
            <MediaManager value={media} onChange={setMedia} folder="posts" />
          </FormCard>
        </div>
      </div>

      <FormActions loading={saving} onCancel={() => router.push("/admin/posts")} submitLabel={id ? "Update Post" : "Create Post"} />
      <p className="flex items-center gap-1.5 text-[11px] text-muted"><Link className="h-3 w-3" /> Translations are optional except English.</p>
    </form>
  );
}
