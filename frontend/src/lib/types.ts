export type Locale = "en" | "my" | "mnw";

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
  errors?: Record<string, string[]>;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface TranslationFields {
  locale?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  description?: string;
  content?: string;
  name?: string;
  position?: string;
  biography?: string;
  history?: string;
  vision?: string;
  mission?: string;
  objectives?: string;
  meta_title?: string;
  meta_description?: string;
}

export type TranslationMap = Record<string, TranslationFields>;

export interface Category {
  id: number;
  name: string;
  name_en: string;
  name_my?: string | null;
  name_mnw?: string | null;
  slug: string;
  type: string;
  description?: string | null;
  is_active: boolean;
  order?: number;
}

export interface MediaItem {
  id?: number;
  collection?: string;
  type: "image" | "video" | "document" | "audio" | string;
  file_path: string;
  file_name: string;
  original_name: string;
  mime_type?: string | null;
  size?: number;
  order?: number;
  url?: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  cover_image?: string | null;
  cover_path?: string | null;
  status: "draft" | "published";
  is_featured: boolean;
  published_at?: string | null;
  views: number;
  category?: Category | null;
  author?: { id?: number; name?: string; avatar?: string | null } | null;
  media: MediaItem[];
  translations: TranslationMap;
  created_at?: string;
  updated_at?: string;
}

export interface Activity {
  id: number;
  number: number;
  title: string;
  slug: string;
  description?: string | null;
  content?: string | null;
  status: "upcoming" | "ongoing" | "completed";
  start_date: string;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
  cover_image?: string | null;
  cover_path?: string | null;
  is_featured: boolean;
  category?: Category | null;
  media: MediaItem[];
  translations: TranslationMap;
  created_at?: string;
}

export interface EventItem {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  content?: string | null;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  start_date: string;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
  cover_image?: string | null;
  cover_path?: string | null;
  registration_info?: string | null;
  is_featured: boolean;
  category?: Category | null;
  media: MediaItem[];
  translations: TranslationMap;
  created_at?: string;
}

export interface GalleryImage {
  id: number;
  image_path: string;
  url: string;
  caption?: string | null;
  order: number;
}

export interface GalleryAlbum {
  id: number;
  title: string;
  title_en: string;
  title_my?: string | null;
  title_mnw?: string | null;
  slug: string;
  description?: string | null;
  cover_image?: string | null;
  cover_path?: string | null;
  is_published: boolean;
  order?: number;
  images_count: number;
  category?: Category | null;
  event?: { id: number; title: string } | null;
  images: GalleryImage[];
  created_at?: string;
}

export interface Video {
  id: number;
  title: string;
  title_en: string;
  title_my?: string | null;
  title_mnw?: string | null;
  slug: string;
  description?: string | null;
  thumbnail?: string | null;
  thumbnail_path?: string | null;
  video_path?: string | null;
  video_url?: string | null;
  external_url?: string | null;
  embed_url?: string | null;
  type: "upload" | "youtube" | "external";
  is_published: boolean;
  published_at?: string | null;
  views: number;
  category?: Category | null;
  created_at?: string;
}

export interface DocumentItem {
  id: number;
  title: string;
  title_en: string;
  title_my?: string | null;
  title_mnw?: string | null;
  description?: string | null;
  file_path: string;
  file_name: string;
  mime_type?: string | null;
  file_size: number;
  downloads: number;
  is_published: boolean;
  url: string;
  extension: string;
  download_url: string;
  category?: Category | null;
  translations?: TranslationMap;
  created_at?: string;
}

export interface Member {
  id: number;
  name: string;
  position?: string | null;
  biography?: string | null;
  photo?: string | null;
  photo_path?: string | null;
  email?: string | null;
  phone?: string | null;
  department?: string | null;
  academic_year?: string | null;
  facebook?: string | null;
  telegram?: string | null;
  is_executive: boolean;
  is_active: boolean;
  order: number;
  translations: TranslationMap;
  created_at?: string;
}

export interface Page {
  id: number;
  slug: string;
  is_published: boolean;
  title?: string;
  excerpt?: string;
  content?: string;
  history?: string;
  vision?: string;
  mission?: string;
  objectives?: string;
  meta_title?: string;
  meta_description?: string;
  translations: TranslationMap;
  updated_at?: string;
}

export interface Achievement {
  id: number;
  title: string;
  description?: string | null;
  year?: string | null;
  icon?: string | null;
  image?: string | null;
  order: number;
  is_published: boolean;
}

export interface NavigationItem {
  id: number;
  label: string;
  label_en: string;
  label_my?: string | null;
  label_mnw?: string | null;
  url: string;
  location: "header" | "footer" | string;
  target: string;
  order: number;
  is_visible: boolean;
  children?: NavigationItem[];
}

export interface SiteSettings {
  [key: string]: string | null | undefined;
}

export interface SiteData {
  settings: SiteSettings;
  navigation: {
    header: NavigationItem[];
    footer: NavigationItem[];
  };
}

export interface HomeData extends SiteData {
  latest_announcements: Post[];
  recent_posts: Post[];
  upcoming_activities: Activity[];
  upcoming_events: EventItem[];
  recent_events: EventItem[];
  gallery: GalleryAlbum[];
  videos: Video[];
  documents: DocumentItem[];
  achievements: Achievement[];
  executives: Member[];
  current_academic_year: string;
  stats: {
    posts: number;
    activities: number;
    events: number;
    members: number;
    gallery_images: number;
    videos: number;
    documents: number;
  };
}

export interface Role {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  permissions: { id: number; slug: string; name: string; module: string }[];
}

export interface Permission {
  id: number;
  slug: string;
  name: string;
  module: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  avatar_path?: string | null;
  bio?: string | null;
  is_active: boolean;
  last_login_at?: string | null;
  roles: { id: number; name: string; slug: string }[];
  permissions: string[];
  is_super_admin: boolean;
  created_at?: string;
}

export interface WebsiteSetting {
  id: number;
  key: string;
  value: string | null;
  group: string;
  type: string;
  label: string | null;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  is_read: boolean;
  created_at?: string;
}

export interface ActivityLogItem {
  id: number;
  action: string;
  model_type?: string | null;
  model_id?: number | null;
  description?: string | null;
  ip_address?: string | null;
  user?: { id?: number; name?: string } | null;
  created_at?: string;
}

export interface DashboardData {
  stats: {
    posts: number;
    published_posts: number;
    draft_posts: number;
    activities: number;
    events: number;
    gallery_images: number;
    gallery_albums: number;
    videos: number;
    documents: number;
    members: number;
    unread_messages: number;
    administrators: number;
  };
  recent_posts: Post[];
  upcoming_events: EventItem[];
  recent_activities: Activity[];
  recent_logs: ActivityLogItem[];
  monthly_posts: { month: string; total: number }[];
}
