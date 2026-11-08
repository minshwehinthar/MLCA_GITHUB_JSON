"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "@/hooks/use-api";
import { api, ApiError } from "@/lib/api";
import type { Category } from "@/lib/types";
import { Field, PageHeader } from "@/components/admin/form-parts";
import { DeleteButton, EmptyRow, ListToolbar, useDebouncedValue } from "@/components/admin/list-helpers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/site/content-states";

const TYPES = ["post", "announcement", "activity", "event", "gallery", "video", "document"] as const;

type FormState = {
  id?: number;
  name: string;
  name_my: string;
  name_mnw: string;
  slug: string;
  type: string;
  description: string;
  order: string;
  is_active: boolean;
};

const blank: FormState = { name: "", name_my: "", name_mnw: "", slug: "", type: "post", description: "", order: "0", is_active: true };

export default function AdminCategoriesPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(blank);
  const [saving, setSaving] = useState(false);
  const query = useDebouncedValue(search);
  const { data, loading, error, refetch } = useApi<Category[]>(`/admin/categories${query ? `?search=${encodeURIComponent(query)}` : ""}`);

  const startCreate = () => {
    setForm(blank);
    setOpen(true);
  };

  const startEdit = (category: Category) => {
    setForm({
      id: category.id,
      name: category.name,
      name_my: category.name_my ?? "",
      name_mnw: category.name_mnw ?? "",
      slug: category.slug,
      type: category.type,
      description: category.description ?? "",
      order: String(category.order ?? 0),
      is_active: category.is_active,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) return toast.error("Name is required.");
    setSaving(true);
    const payload = {
      name: form.name,
      name_my: form.name_my || null,
      name_mnw: form.name_mnw || null,
      slug: form.slug || null,
      type: form.type,
      description: form.description || null,
      order: Number(form.order) || 0,
      is_active: form.is_active,
    };
    try {
      if (form.id) await api.put(`/admin/categories/${form.id}`, payload);
      else await api.post("/admin/categories", payload);
      toast.success(form.id ? "Category updated." : "Category created.");
      setOpen(false);
      refetch();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to save category.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Used to classify posts, events, media and documents."
        action={<Button onClick={startCreate}><Plus /> New Category</Button>}
      />

      <ListToolbar search={search} onSearch={setSearch} />

      <div className="overflow-hidden rounded-2xl border border-burgundy/10 bg-white shadow-sm">
        {loading ? <TableSkeleton /> : error ? (
          <div className="p-4"><ErrorState message={error} onRetry={refetch} /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.length ? data.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <p className="font-semibold text-burgundy-800">{category.name}</p>
                    {category.name_my && <p className="text-[11px] text-muted">{category.name_my}</p>}
                  </TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{category.type}</Badge></TableCell>
                  <TableCell className="text-xs text-muted">{category.slug}</TableCell>
                  <TableCell><Badge className={category.is_active ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-stone-200 text-stone-700 border-stone-300"}>{category.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" title="Edit" onClick={() => startEdit(category)}><Pencil /></Button>
                      <DeleteButton endpoint={`/admin/categories/${category.id}`} name={`“${category.name}”`} onDeleted={refetch} />
                    </div>
                  </TableCell>
                </TableRow>
              )) : <EmptyRow colSpan={5} title="No categories found" />}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Category" : "New Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name (English)" required><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="Type">
                <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {TYPES.map((type) => <option key={type} value={type} className="capitalize">{type}</option>)}
                </Select>
              </Field>
              <Field label="Name (Myanmar)"><Input value={form.name_my} onChange={(e) => setForm({ ...form, name_my: e.target.value })} /></Field>
              <Field label="Name (Mon)"><Input value={form.name_mnw} onChange={(e) => setForm({ ...form, name_mnw: e.target.value })} /></Field>
            </div>
            <Field label="Slug" hint="Leave blank to generate automatically."><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></Field>
            <Field label="Description"><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
            <Field label="Display order"><Input type="number" min="0" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></Field>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 accent-burgundy" />
              Active
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Category"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
