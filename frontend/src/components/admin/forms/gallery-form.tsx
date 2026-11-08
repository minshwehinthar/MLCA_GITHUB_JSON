"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import type { Category, EventItem, GalleryAlbum } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Field, FormActions, FormCard, GalleryImagesManager, ImageUpload, PageHeader, type EditableImage } from "@/components/admin/form-parts";

export function GalleryForm({ id }: { id?: number }) {
  const router = useRouter();
  const categories = useApi<Category[]>("/categories?type=gallery");
  const events = useApi<EventItem[]>("/events?per_page=100");
  const existing = useApi<GalleryAlbum>(id ? `/admin/gallery/albums/${id}` : null);

  const [title, setTitle] = useState("");
  const [titleMy, setTitleMy] = useState("");
  const [titleMnw, setTitleMnw] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [eventId, setEventId] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [order, setOrder] = useState("0");
  const [cover, setCover] = useState("");
  const [images, setImages] = useState<EditableImage[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!existing.data) return;
    const album = existing.data;
    setTitle(album.title_en ?? album.title);
    setTitleMy(album.title_my ?? "");
    setTitleMnw(album.title_mnw ?? "");
    setSlug(album.slug);
    setDescription(album.description ?? "");
    setCategoryId(album.category?.id ? String(album.category.id) : "");
    setEventId(album.event?.id ? String(album.event.id) : "");
    setIsPublished(album.is_published);
    setOrder(String(album.order ?? 0));
    setCover(album.cover_path ?? "");
    setImages((album.images ?? []).map((image) => ({ id: image.id, image_path: image.image_path, url: image.url, caption: image.caption ?? "" })));
  }, [existing.data]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return toast.error("Album title is required.");

    setSaving(true);
    const payload = {
      title,
      title_my: titleMy || null,
      title_mnw: titleMnw || null,
      slug: slug || null,
      description: description || null,
      category_id: categoryId ? Number(categoryId) : null,
      event_id: eventId ? Number(eventId) : null,
      is_published: isPublished,
      order: Number(order) || 0,
      cover_image: cover || null,
      images: images.map((image) => ({
        id: image.id,
        image_path: image.image_path,
        caption: image.caption || null,
      })),
    };

    try {
      if (id) await api.put(`/admin/gallery/albums/${id}`, payload);
      else await api.post("/admin/gallery/albums", payload);
      toast.success(id ? "Album updated." : "Album created.");
      router.push("/admin/gallery");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Unable to save album.");
    } finally {
      setSaving(false);
    }
  };

  if (id && existing.loading) return <div className="space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-96 w-full" /></div>;

  return (
    <form onSubmit={submit} className="space-y-5">
      <PageHeader
        title={id ? "Edit Album" : "New Album"}
        description="Organize photos into albums for the public gallery."
        action={<Button type="button" variant="outline" onClick={() => router.push("/admin/gallery")}>Back to gallery</Button>}
      />

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <FormCard title="Album Details">
            <div className="space-y-4">
              <Field label="Title (English)" required><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Album title" /></Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Title (Myanmar)"><Input value={titleMy} onChange={(e) => setTitleMy(e.target.value)} placeholder="မြန်မာခေါင်းစဉ်" /></Field>
                <Field label="Title (Mon)"><Input value={titleMnw} onChange={(e) => setTitleMnw(e.target.value)} placeholder="က္ဍိုပ်လိက်မန်" /></Field>
              </div>
              <Field label="Slug" hint="Leave blank to generate automatically."><Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="album-slug" /></Field>
              <Field label="Description"><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe this album" /></Field>
            </div>
          </FormCard>

          <FormCard title="Photos">
            <GalleryImagesManager value={images} onChange={setImages} />
          </FormCard>
        </div>

        <div className="space-y-5">
          <FormCard title="Settings">
            <div className="space-y-4">
              <Field label="Category">
                <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="">No category</option>
                  {(categories.data ?? []).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </Select>
              </Field>
              <Field label="Related event">
                <Select value={eventId} onChange={(e) => setEventId(e.target.value)}>
                  <option value="">None</option>
                  {(events.data ?? []).map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}
                </Select>
              </Field>
              <Field label="Display order"><Input type="number" min="0" value={order} onChange={(e) => setOrder(e.target.value)} /></Field>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="h-4 w-4 accent-burgundy" />
                Published
              </label>
            </div>
          </FormCard>

          <FormCard title="Cover Image" description="Defaults to the first photo if not set.">
            <ImageUpload value={cover} onChange={setCover} folder="gallery" />
          </FormCard>
        </div>
      </div>

      <FormActions loading={saving} onCancel={() => router.push("/admin/gallery")} submitLabel={id ? "Update Album" : "Create Album"} />
    </form>
  );
}
