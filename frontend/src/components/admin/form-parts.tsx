"use client";

import * as React from "react";
import { ExternalLink, FileText, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { formatBytes, cn, storageUrl } from "@/lib/utils";
import type { MediaItem } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
  className,
}: {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && (
        <Label htmlFor={htmlFor}>
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </Label>
      )}
      {children}
      {hint && !error && <p className="mt-1 text-[11px] text-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-display text-2xl font-bold text-burgundy-800">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function FormCard({ title, description, children, className }: { title?: string; description?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-burgundy/10 bg-white p-5 shadow-sm md:p-6", className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="font-display text-lg font-bold text-burgundy-800">{title}</h3>}
          {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

export function FormActions({ loading, onCancel, submitLabel = "Save" }: { loading?: boolean; onCancel: () => void; submitLabel?: string }) {
  return (
    <div className="sticky bottom-4 z-10 flex items-center justify-end gap-2 rounded-xl border border-burgundy/10 bg-white/95 p-3 shadow-lg backdrop-blur">
      <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="animate-spin" />}
        {loading ? "Saving..." : submitLabel}
      </Button>
    </div>
  );
}

const LOCALE_TABS = [
  { code: "en", label: "English", required: true },
  { code: "my", label: "Myanmar", required: false },
  { code: "mnw", label: "Mon", required: false },
] as const;

export function TranslationTabs({ children, defaultValue = "en" }: { children: (locale: "en" | "my" | "mnw") => React.ReactNode; defaultValue?: string }) {
  return (
    <Tabs defaultValue={defaultValue}>
      <TabsList>
        {LOCALE_TABS.map((tab) => (
          <TabsTrigger key={tab.code} value={tab.code}>
            {tab.label}
            {tab.required && <span className="ml-1 text-red-500">*</span>}
          </TabsTrigger>
        ))}
      </TabsList>
      {LOCALE_TABS.map((tab) => (
        <TabsContent key={tab.code} value={tab.code} className="space-y-4">
          {children(tab.code)}
        </TabsContent>
      ))}
    </Tabs>
  );
}

export interface UploadedFile {
  path: string;
  url: string;
  name: string;
  original_name: string;
  mime_type: string;
  size: number;
  type: string;
}

export async function uploadFile(file: File, folder = "general"): Promise<UploadedFile> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  const response = await api.upload<UploadedFile>("/admin/uploads", formData);
  return response.data;
}

export function ImageUpload({
  label = "Image",
  value,
  onChange,
  folder = "general",
  hint,
  aspect = "aspect-[16/9]",
}: {
  label?: string;
  value?: string | null;
  onChange: (path: string) => void;
  folder?: string;
  hint?: string;
  aspect?: string;
}) {
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await uploadFile(file, folder);
      onChange(uploaded.path);
      toast.success("Image uploaded.");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      {label && <Label>{label}</Label>}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-burgundy/10 bg-cream">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={storageUrl(value)} alt="Preview" className={cn("w-full object-cover", aspect)} />
          <div className="absolute right-2 top-2 flex gap-1.5">
            <Button type="button" size="icon-sm" variant="white" onClick={() => inputRef.current?.click()} disabled={uploading}>
              <Upload />
            </Button>
            <Button type="button" size="icon-sm" variant="destructive" onClick={() => onChange("")} disabled={uploading}>
              <X />
            </Button>
          </div>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Loader2 className="h-6 w-6 animate-spin text-burgundy" />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-burgundy/20 bg-cream/60 px-4 py-8 text-sm text-muted transition-colors hover:border-burgundy/40 hover:text-burgundy",
            aspect
          )}
        >
          {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
          <span>{uploading ? "Uploading..." : "Click to upload image"}</span>
        </button>
      )}
      {hint && <p className="mt-1 text-[11px] text-muted">{hint}</p>}
    </div>
  );
}

function previewKind(path?: string | null, mimeType?: string | null): "image" | "video" | "pdf" | "file" {
  const mime = mimeType ?? "";
  const source = path ?? "";
  if (mime.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg|avif|bmp)$/i.test(source)) return "image";
  if (mime.startsWith("video/") || /\.(mp4|webm|mov|ogv|m4v)$/i.test(source)) return "video";
  if (mime === "application/pdf" || /\.pdf$/i.test(source)) return "pdf";
  return "file";
}

export function FilePreview({
  path,
  url,
  mimeType,
  label,
  className,
}: {
  path?: string | null;
  url?: string | null;
  mimeType?: string | null;
  label?: string;
  className?: string;
}) {
  const source = path ? storageUrl(path) : url || "";
  if (!source) return null;
  const kind = previewKind(path || source, mimeType);

  if (kind === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={source} alt={label ?? "Preview"} className={cn("max-h-64 w-full rounded-lg border border-burgundy/10 bg-cream object-contain", className)} />
    );
  }
  if (kind === "video") {
    return <video src={source} controls className={cn("max-h-72 w-full rounded-lg border border-burgundy/10 bg-black", className)} />;
  }
  if (kind === "pdf") {
    return <iframe src={source} title={label ?? "PDF preview"} className={cn("h-72 w-full rounded-lg border border-burgundy/10 bg-white", className)} />;
  }
  return (
    <a href={source} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg border border-burgundy/10 bg-cream/50 px-3 py-2 text-xs font-semibold text-burgundy hover:bg-cream">
      <FileText className="h-4 w-4" /> Open file <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}

export function MediaManager({
  value,
  onChange,
  folder = "attachments",
  label = "Attachments",
}: {
  value: MediaItem[];
  onChange: (items: MediaItem[]) => void;
  folder?: string;
  label?: string;
}) {
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploaded: MediaItem[] = [];
      for (const file of Array.from(files)) {
        const result = await uploadFile(file, folder);
        uploaded.push({
          file_path: result.path,
          file_name: result.name,
          original_name: result.original_name,
          mime_type: result.mime_type,
          size: result.size,
          type: result.type,
          url: result.url,
        });
      }
      onChange([...value, ...uploaded]);
      toast.success(`${uploaded.length} file(s) uploaded.`);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <Label>{label}</Label>
        <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="animate-spin" /> : <Upload />} Upload
        </Button>
      </div>
      <input ref={inputRef} type="file" multiple className="hidden" onChange={(event) => handleFiles(event.target.files)} />
      {value.length ? (
        <div className="space-y-2">
          {value.map((item, index) => {
            const kind = previewKind(item.file_path, item.mime_type);
            return (
              <div key={item.id ?? item.file_path} className="overflow-hidden rounded-lg border border-burgundy/10 bg-cream/50">
                <div className="flex items-center gap-2 px-3 py-2 text-sm">
                  {kind === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={storageUrl(item.file_path) || item.url} alt="" className="h-8 w-8 rounded object-cover" />
                  ) : kind === "video" ? (
                    <span className="flex h-8 w-8 items-center justify-center rounded bg-black/80 text-white"><FileText className="h-4 w-4" /></span>
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded bg-burgundy/10 text-burgundy"><FileText className="h-4 w-4" /></span>
                  )}
                  <span className="min-w-0 flex-1 truncate">{item.original_name || item.file_name}</span>
                  <span className="text-[11px] text-muted">{formatBytes(item.size)}</span>
                  <button
                    type="button"
                    onClick={() => onChange(value.filter((_, i) => i !== index))}
                    className="rounded p-1 text-red-500 hover:bg-red-50"
                    aria-label="Remove file"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="px-3 pb-3">
                  <FilePreview path={item.file_path} url={item.url} mimeType={item.mime_type} label={item.original_name} className="max-h-48" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-burgundy/15 px-3 py-4 text-center text-xs text-muted">
          No attachments. Upload images, videos or documents.
        </p>
      )}
    </div>
  );
}

export interface EditableImage {
  id?: number;
  image_path: string;
  url?: string;
  caption?: string | null;
}

export function GalleryImagesManager({ value, onChange }: { value: EditableImage[]; onChange: (images: EditableImage[]) => void }) {
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploaded: EditableImage[] = [];
      for (const file of Array.from(files)) {
        const result = await uploadFile(file, "gallery");
        uploaded.push({ image_path: result.path, url: result.url, caption: "" });
      }
      onChange([...value, ...uploaded]);
      toast.success(`${uploaded.length} image(s) uploaded.`);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <Label>Album Images ({value.length})</Label>
        <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="animate-spin" /> : <Upload />} Upload Images
        </Button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(event) => handleFiles(event.target.files)} />
      {value.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {value.map((image, index) => (
            <div key={image.id ?? image.image_path} className="overflow-hidden rounded-xl border border-burgundy/10 bg-cream">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url || storageUrl(image.image_path)} alt="" className="h-32 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                  className="absolute right-1.5 top-1.5 rounded-full bg-red-600 p-1 text-white shadow"
                  aria-label="Remove image"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <Input
                value={image.caption ?? ""}
                onChange={(event) => onChange(value.map((item, i) => (i === index ? { ...item, caption: event.target.value } : item)))}
                placeholder="Caption (optional)"
                className="h-9 rounded-none border-0 border-t border-burgundy/10 text-xs shadow-none"
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-burgundy/15 px-3 py-6 text-center text-xs text-muted">
          No images yet. Upload photos for this album.
        </p>
      )}
    </div>
  );
}

export function FileUpload({
  label = "File",
  value,
  onChange,
  folder = "documents",
  accept,
  hint,
}: {
  label?: string;
  value: string;
  onChange: (path: string) => void;
  folder?: string;
  accept?: string;
  hint?: string;
}) {
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await uploadFile(file, folder);
      onChange(uploaded.path);
      toast.success("File uploaded.");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      {label && <Label>{label}</Label>}
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
      <div className="flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 shadow-sm">
        <span className="min-w-0 flex-1 truncate text-sm text-muted">{value || "No file selected"}</span>
        <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="animate-spin" /> : <Upload />} {value ? "Replace" : "Upload"}
        </Button>
        {value && (
          <Button type="button" size="icon-sm" variant="ghost" className="text-red-500" onClick={() => onChange("")} disabled={uploading}>
            <X />
          </Button>
        )}
      </div>
      {value && (
        <div className="mt-2">
          <FilePreview path={value} label={label} />
        </div>
      )}
      {hint && <p className="mt-1 text-[11px] text-muted">{hint}</p>}
    </div>
  );
}
