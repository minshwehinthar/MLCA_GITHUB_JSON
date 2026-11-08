import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function storageUrl(path?: string | null): string {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  const base = process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export function currentAcademicYear(date = new Date()): string {
  const year = date.getFullYear();
  const startYear = date.getMonth() >= 10 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}

export function formatDate(value?: string | null, locale = "en"): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const localeMap: Record<string, string> = { en: "en-GB", my: "my-MM", mnw: "en-GB" };
  return date.toLocaleDateString(localeMap[locale] ?? "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatShortDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatTime(value?: string | null): string {
  if (!value) return "—";
  const [h, m] = value.split(":");
  const hour = Number(h);
  if (Number.isNaN(hour)) return value;
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${m ?? "00"} ${suffix}`;
}

export function formatBytes(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function stripHtml(html?: string | null): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function excerpt(value?: string | null, length = 160): string {
  const text = stripHtml(value);
  return text.length > length ? `${text.slice(0, length).trim()}…` : text;
}

export function initials(name?: string | null): string {
  if (!name) return "M";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function shareLinks(url: string, title: string) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };
}

export function statusColor(status?: string): string {
  switch (status) {
    case "completed":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "ongoing":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "upcoming":
      return "bg-sky-100 text-sky-800 border-sky-200";
    case "cancelled":
      return "bg-red-100 text-red-700 border-red-200";
    case "published":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "draft":
      return "bg-stone-200 text-stone-700 border-stone-300";
    default:
      return "bg-stone-100 text-stone-700 border-stone-200";
  }
}
