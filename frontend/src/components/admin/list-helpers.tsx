"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { SearchField } from "@/components/site/search-field";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";

export function useDebouncedValue<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function ListToolbar({ search, onSearch, children }: { search: string; onSearch: (value: string) => void; children?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-xl border border-burgundy/10 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <SearchField value={search} onChange={onSearch} className="sm:max-w-xs" />
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export function EmptyRow({ colSpan, title = "No records found" }: { colSpan: number; title?: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="p-6">
        <EmptyState title={title} />
      </td>
    </tr>
  );
}

export function Thumb({ src, alt, className }: { src?: string | null; alt?: string; className?: string }) {
  if (!src) {
    return <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg bg-cream-dark text-[10px] font-bold text-muted", className)}>N/A</span>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt ?? ""} className={cn("h-10 w-10 rounded-lg object-cover", className)} />
  );
}

export function DeleteButton({
  endpoint,
  name,
  onDeleted,
  size = "icon-sm",
  label,
}: {
  endpoint: string;
  name: string;
  onDeleted: () => void;
  size?: "icon-sm" | "sm";
  label?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const remove = async () => {
    setLoading(true);
    try {
      await api.delete(endpoint);
      toast.success(`${name} deleted.`);
      setOpen(false);
      onDeleted();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Unable to delete.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button type="button" variant={label ? "destructive" : "ghost"} size={size} onClick={() => setOpen(true)} className={label ? "" : "text-red-500 hover:bg-red-50 hover:text-red-600"} title="Delete">
        <Trash2 />
        {label && "Delete"}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Delete ${name}?`}
        description="This action cannot be undone. Related files may also be permanently removed."
        confirmLabel="Delete"
        onConfirm={remove}
        loading={loading}
      />
    </>
  );
}

export function PermissionGuard({ allowed, children }: { allowed: boolean; children: React.ReactNode }) {
  if (!allowed) return null;
  return <>{children}</>;
}

export function SavingButton({ loading, children = "Save" }: { loading?: boolean; children?: React.ReactNode }) {
  return (
    <Button type="submit" disabled={loading}>
      {loading && <Loader2 className="animate-spin" />}
      {children}
    </Button>
  );
}
