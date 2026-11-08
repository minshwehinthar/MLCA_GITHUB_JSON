"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import type { Category, Video } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Field, FileUpload, FormActions, FormCard, ImageUpload, PageHeader } from "@/components/admin/form-parts";
import { storageUrl } from "@/lib/utils";

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
    // Not a valid URL yet.
  }
  return value;
}

export function VideoForm({ id }: { id?: number }) {
  const router = useRouter();
  const categories = useApi<Category[]>("/categories?type=video");
  const existing = useApi<Video>(id ? `/admin/videos/${id}` : null);

  const [title, setTitle] = useState("");
  const [titleMy, setTitleMy] = useState("");
  const [titleMnw, setTitleMnw] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"upload" | "youtube" | "external">("youtube");
  const [externalUrl, setExternalUrl] = useState("");
  const [videoPath, setVideoPath] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [categoryId, setCategoryId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!existing.data) return;
    const video = existing.data;
    setTitle(video.title_en ?? video.title);
    setTitleMy(video.title_my ?? "");
    setTitleMnw(video.title_mnw ?? "");
    setSlug(video.slug);
    setDescription(video.description ?? "");
    setType(video.type);
    setExternalUrl(video.external_url ?? "");
    setVideoPath(video.video_path ?? "");
    setThumbnail(video.thumbnail_path ?? "");
    setPublishedAt(video.published_at ? video.published_at.slice(0, 16) : "");
    setIsPublished(video.is_published);
    setCategoryId(video.category?.id ? String(video.category.id) : "");
  }, [existing.data]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return toast.error("Title is required.");
    if (type !== "upload" && !externalUrl.trim()) return toast.error("External URL is required.");
    if (type === "upload" && !videoPath) return toast.error("Please upload a video file.");

    setSaving(true);
    const payload = {
      title,
      title_my: titleMy || null,
      title_mnw: titleMnw || null,
      slug: slug || null,
      description: description || null,
      type,
      external_url: type === "upload" ? null : externalUrl || null,
      video_path: type === "upload" ? videoPath || null : null,
      thumbnail: thumbnail || null,
      published_at: publishedAt || null,
      is_published: isPublished,
      category_id: categoryId ? Number(categoryId) : null,
    };

    try {
      if (id) await api.put(`/admin/videos/${id}`, payload);
      else await api.post("/admin/videos", payload);
      toast.success(id ? "Video updated." : "Video created.");
      router.push("/admin/videos");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Unable to save video.");
    } finally {
      setSaving(false);
    }
  };

  if (id && existing.loading) return <div className="space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-96 w-full" /></div>;

  return (
    <form onSubmit={submit} className="space-y-5">
      <PageHeader
        title={id ? "Edit Video" : "New Video"}
        description="Add YouTube links or upload video files."
        action={<Button type="button" variant="outline" onClick={() => router.push("/admin/videos")}>Back to videos</Button>}
      />

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <FormCard title="Video Details">
            <div className="space-y-4">
              <Field label="Title (English)" required><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Video title" /></Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Title (Myanmar)"><Input value={titleMy} onChange={(e) => setTitleMy(e.target.value)} /></Field>
                <Field label="Title (Mon)"><Input value={titleMnw} onChange={(e) => setTitleMnw(e.target.value)} /></Field>
              </div>
              <Field label="Slug" hint="Leave blank to generate automatically."><Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="video-slug" /></Field>
              <Field label="Description"><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="Describe this video" /></Field>
            </div>
          </FormCard>
        </div>

        <div className="space-y-5">
          <FormCard title="Source">
            <div className="space-y-4">
              <Field label="Video type">
                <Select value={type} onChange={(e) => setType(e.target.value as "upload" | "youtube" | "external")}>
                  <option value="youtube">YouTube / Vimeo link</option>
                  <option value="external">External URL</option>
                  <option value="upload">Uploaded file</option>
                </Select>
              </Field>
              {type === "upload" ? (
                <FileUpload label="Video file" value={videoPath} onChange={setVideoPath} folder="videos" accept="video/*" hint="MP4, WebM or MOV up to 50MB." />
              ) : (
                <Field label="External URL" required hint="Paste a YouTube, Vimeo or other video URL.">
                  <Input value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
                </Field>
              )}
              <Field label="Publish date" hint="Leave blank to publish immediately.">
                <Input type="datetime-local" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
              </Field>
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

          <FormCard title="Live preview">
            {type === "upload" && videoPath ? (
              <video src={storageUrl(videoPath)} controls className="w-full rounded-lg border border-burgundy/10 bg-black" />
            ) : type !== "upload" && externalUrl ? (
              <div className="aspect-video overflow-hidden rounded-lg border border-burgundy/10 bg-black">
                <iframe src={toEmbedUrl(externalUrl)} title="Video preview" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="h-full w-full" />
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-burgundy/15 px-3 py-6 text-center text-xs text-muted">
                Paste a video URL or upload a file to see a live preview.
              </p>
            )}
          </FormCard>

          <FormCard title="Thumbnail">
            <ImageUpload value={thumbnail} onChange={setThumbnail} folder="videos" hint="Recommended 1280×720px." />
          </FormCard>
        </div>
      </div>

      <FormActions loading={saving} onCancel={() => router.push("/admin/videos")} submitLabel={id ? "Update Video" : "Create Video"} />
    </form>
  );
}
