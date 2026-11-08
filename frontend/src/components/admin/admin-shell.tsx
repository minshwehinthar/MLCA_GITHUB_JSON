"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  Award,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ExternalLink,
  FileText,
  Gauge,
  Images,
  LayoutDashboard,
  ListTree,
  LogOut,
  Mail,
  Menu,
  Newspaper,
  Play,
  Settings,
  ShieldCheck,
  Tags,
  User,
  Users,
  X,
} from "lucide-react";
import { cn, initials, storageUrl } from "@/lib/utils";
import { useApi } from "@/hooks/use-api";
import type { SiteData } from "@/lib/types";
import { useAuth } from "@/providers/auth-provider";
import { useLocale } from "@/providers/locale-provider";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }>; permission?: string };

const groups: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard.view" },
      { href: "/admin/messages", label: "Messages", icon: Mail, permission: "messages.view" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/posts", label: "Posts & News", icon: Newspaper, permission: "posts.view" },
      { href: "/admin/activities", label: "Activities", icon: Activity, permission: "activities.view" },
      { href: "/admin/events", label: "Events", icon: CalendarDays, permission: "events.view" },
      { href: "/admin/gallery", label: "Gallery", icon: Images, permission: "gallery.view" },
      { href: "/admin/videos", label: "Videos", icon: Play, permission: "videos.view" },
      { href: "/admin/documents", label: "Documents", icon: FileText, permission: "documents.view" },
      { href: "/admin/members", label: "Members", icon: Users, permission: "members.view" },
      { href: "/admin/categories", label: "Categories", icon: Tags, permission: "categories.view" },
    ],
  },
  {
    label: "Website",
    items: [
      { href: "/admin/pages", label: "Pages", icon: BookOpen, permission: "pages.view" },
      { href: "/admin/achievements", label: "Achievements", icon: Award, permission: "achievements.view" },
      { href: "/admin/navigation", label: "Navigation", icon: ListTree, permission: "navigation.manage" },
      { href: "/admin/settings", label: "Settings", icon: Settings, permission: "settings.manage" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/administrators", label: "Administrators", icon: ShieldCheck, permission: "admins.manage" },
      { href: "/admin/logs", label: "Activity Logs", icon: Gauge, permission: "logs.view" },
    ],
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout, hasPermission } = useAuth();
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const isLogin = pathname === "/admin/login";
  const { data: site } = useApi<SiteData>(isLogin ? null : "/site");
  const siteLogo = storageUrl(site?.settings?.site_logo);
  const siteShortName = site?.settings?.site_short_name ?? "MLCA";
  const canManageSettings = hasPermission("settings.manage");

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isLogin && !loading && !user) router.replace("/admin/login");
  }, [isLogin, loading, user, router]);

  const visibleGroups = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => !item.permission || hasPermission(item.permission)),
        }))
        .filter((group) => group.items.length > 0),
    [hasPermission]
  );

  if (isLogin) return <>{children}</>;

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-3">
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-burgundy/20 border-t-burgundy" />
          <p className="text-sm text-muted">{t("loading")}</p>
        </div>
      </div>
    );
  }

  const currentLabel = groups.flatMap((g) => g.items).find((item) => item.href !== "/admin" && pathname.startsWith(item.href))?.label ?? "Dashboard";

  const sidebar = (
    <div className="flex h-full flex-col bg-burgundy-900 text-white">
      <Link href={canManageSettings ? "/admin/settings" : "/admin"} title={canManageSettings ? "Change website logo in Settings" : siteShortName} className="flex items-center gap-2.5 px-5 py-5 transition-colors hover:bg-white/5">
        {siteLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={siteLogo} alt={siteShortName} className="h-10 w-auto max-w-[130px] rounded-lg bg-white/95 object-contain p-1" />
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold font-display text-lg font-bold text-burgundy-900">{siteShortName.slice(0, 1)}</span>
        )}
        <div>
          <p className="font-display text-base font-bold leading-tight">{siteShortName} Admin</p>
          <p className="text-[10px] uppercase tracking-widest text-gold">{canManageSettings ? "Change logo in Settings" : "UCS Hpa-An"}</p>
        </div>
      </Link>
      <nav className="no-scrollbar flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {visibleGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
                      active ? "bg-gold text-burgundy-900 shadow-sm" : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3">
        <Link href="/" target="_blank" className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white">
          <ExternalLink className="h-3.5 w-3.5" /> View website
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-burgundy-900/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72">
            <button type="button" onClick={() => setOpen(false)} className="absolute right-3 top-3 z-10 rounded-full bg-white/10 p-1.5 text-white">
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-burgundy/10 bg-white/95 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setOpen(true)} className="rounded-lg border border-burgundy/15 p-2 text-burgundy lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gold">Administration</p>
              <h1 className="font-display text-lg font-bold text-burgundy-800">{currentLabel}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-burgundy/15 py-1 pl-1 pr-2.5 text-left transition-colors hover:bg-cream">
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-burgundy text-xs font-bold text-white">
                    {initials(user.name)}
                  </span>
                )}
                <span className="hidden sm:block">
                  <span className="block max-w-[140px] truncate text-xs font-semibold text-burgundy-800">{user.name}</span>
                  <span className="block text-[10px] capitalize text-muted">{user.roles?.[0]?.name ?? "Administrator"}</span>
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile"><User className="h-4 w-4" /> My Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/" target="_blank"><ExternalLink className="h-4 w-4" /> View Website</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await logout();
                    router.replace("/admin/login");
                  }}
                  className="text-red-600 focus:text-red-700"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
