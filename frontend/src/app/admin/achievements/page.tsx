"use client";

import { useState } from "react";
import { Award, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "@/hooks/use-api";
import { api, ApiError } from "@/lib/api";
import type { Achievement } from "@/lib/types";
import { storageUrl } from "@/lib/utils";
import { Field, FormCard, ImageUpload, PageHeader } from "@/components/admin/form-parts";
import { DeleteButton, EmptyRow } from "@/components/admin/list-helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/site/content-states";

function toStoragePath(url?: string | null): string {
  if (!url) return "";
  const marker = "/storage/";
  const index = url.indexOf(marker);
  return index >= 0 ? url.slice(index + marker.length) : url;
}

type FormState = {
  id?: number;
  title: string;
  description: string;
  year: string;
  icon: string;
  image: string;
  order: string;
  is_published: boolean;
};

const blank: FormState = { title: "", description: "", year: "", icon: "", image: "", order: "0", is_published: true };

export default function AdminAchievementsPage() {
  const { data, loading, error, refetch } = useApi<Achievement[]>("/admin/achievements");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(blank);
  const [saving, setSaving] = useState(false);

  const startCreate = () => {
    setForm(blank);
    setOpen(true);
  };

  const startEdit = (item: Achievement) => {
    setForm({
      id: item.id,
      title: item.title,
      description: item.description ?? "",
      year: item.year ?? "",
      icon: item.icon ?? "",
      image: toStoragePath(item.image),
      order: String(item.order ?? 0),
      is_published: item.is_published,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) return toast.error("Title is required.");
    setSaving(true);
    const payload = {
      title: form.title,
      description: form.description || null,
      year: form.year || null,
      icon: form.icon || null,
      image: form.image || null,
      order: Number(form.order) || 0,
      is_published: form.is_published,
    };
    try {
      if (form.id) await api.put(`/admin/achievements/${form.id}`, payload);
      else await api.post("/admin/achievements", payload);
      toast.success(form.id ? "Achievement updated." : "Achievement created.");
      setOpen(false);
      refetch();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to save achievement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Achievements"
        description="Milestones and awards highlighted across the site."
        action={<Button onClick={startCreate}><Plus /> New Achievement</Button>}
      />

      <div className="overflow-hidden rounded-2xl border border-burgundy/10 bg-white shadow-sm">
        {loading ? <TableSkeleton /> : error ? (
          <div className="p-4"><ErrorState message={error} onRetry={refetch} /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Achievement</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.length ? data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={storageUrl(item.image)} alt={item.title} className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/20 text-burgundy"><Award className="h-5 w-5" /></span>
                      )}
                      <div className="min-w-0">
                        <p className="max-w-[340px] truncate font-semibold text-burgundy-800">{item.title}</p>
                        {item.description && <p className="max-w-[340px] truncate text-[11px] text-muted">{item.description}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted">{item.year ?? "—"}</TableCell>
                  <TableCell className="text-xs text-muted">{item.order}</TableCell>
                  <TableCell><Badge className={item.is_published ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-stone-200 text-stone-700 border-stone-300"}>{item.is_published ? "Published" : "Hidden"}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" title="Edit" onClick={() => startEdit(item)}><Pencil /></Button>
                      <DeleteButton endpoint={`/admin/achievements/${item.id}`} name={`“${item.title}”`} onDeleted={refetch} />
                    </div>
                  </TableCell>
                </TableRow>
              )) : <EmptyRow colSpan={5} title="No achievements found" />}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Achievement" : "New Achievement"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Field label="Title" required><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
            <Field label="Description"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Year"><Input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2025" /></Field>
              <Field label="Icon" hint="Optional icon name, e.g. trophy."><Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></Field>
              <Field label="Display order"><Input type="number" min="0" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></Field>
            </div>
            <FormCard title="Image">
              <ImageUpload value={form.image} onChange={(value) => setForm({ ...form, image: value })} folder="achievements" />
            </FormCard>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="h-4 w-4 accent-burgundy" />
              Published
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Achievement"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
