"use client";

import { Fragment, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "@/hooks/use-api";
import { api, ApiError } from "@/lib/api";
import type { NavigationItem } from "@/lib/types";
import { Field, PageHeader } from "@/components/admin/form-parts";
import { DeleteButton, EmptyRow } from "@/components/admin/list-helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/site/content-states";

type FormState = {
  id?: number;
  parent_id: string;
  label_en: string;
  label_my: string;
  label_mnw: string;
  url: string;
  location: "header" | "footer";
  target: "_self" | "_blank";
  order: string;
  is_visible: boolean;
};

const blank: FormState = {
  parent_id: "", label_en: "", label_my: "", label_mnw: "", url: "/", location: "header", target: "_self", order: "0", is_visible: true,
};

export default function AdminNavigationPage() {
  const { data, loading, error, refetch } = useApi<NavigationItem[]>("/admin/navigation");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(blank);
  const [saving, setSaving] = useState(false);

  const startCreate = (location: "header" | "footer" = "header") => {
    setForm({ ...blank, location });
    setOpen(true);
  };

  const startEdit = (item: NavigationItem, parentId?: number) => {
    setForm({
      id: item.id,
      parent_id: parentId ? String(parentId) : "",
      label_en: item.label_en,
      label_my: item.label_my ?? "",
      label_mnw: item.label_mnw ?? "",
      url: item.url,
      location: item.location === "footer" ? "footer" : "header",
      target: item.target === "_blank" ? "_blank" : "_self",
      order: String(item.order ?? 0),
      is_visible: item.is_visible,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.label_en.trim()) return toast.error("English label is required.");
    if (!form.url.trim()) return toast.error("URL is required.");
    setSaving(true);
    const payload = {
      parent_id: form.parent_id ? Number(form.parent_id) : null,
      label_en: form.label_en,
      label_my: form.label_my || null,
      label_mnw: form.label_mnw || null,
      url: form.url,
      location: form.location,
      target: form.target,
      order: Number(form.order) || 0,
      is_visible: form.is_visible,
    };
    try {
      if (form.id) await api.put(`/admin/navigation/${form.id}`, payload);
      else await api.post("/admin/navigation", payload);
      toast.success(form.id ? "Navigation item updated." : "Navigation item created.");
      setOpen(false);
      refetch();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to save navigation item.");
    } finally {
      setSaving(false);
    }
  };

  const parents = (data ?? []).filter((item) => item.id !== form.id);

  return (
    <div>
      <PageHeader
        title="Navigation"
        description="Control the header and footer menus shown on the public site."
        action={<Button onClick={() => startCreate("header")}><Plus /> New Menu Item</Button>}
      />

      <div className="overflow-hidden rounded-2xl border border-burgundy/10 bg-white shadow-sm">
        {loading ? <TableSkeleton /> : error ? (
          <div className="p-4"><ErrorState message={error} onRetry={refetch} /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Visible</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.length ? data.map((item) => (
                <Fragment key={item.id}>
                  <TableRow>
                    <TableCell><p className="font-semibold text-burgundy-800">{item.label_en}</p></TableCell>
                    <TableCell className="font-mono text-[11px] text-muted">{item.url}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{item.location}</Badge></TableCell>
                    <TableCell className="text-xs text-muted">{item.target}</TableCell>
                    <TableCell><Badge className={item.is_visible ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-stone-200 text-stone-700 border-stone-300"}>{item.is_visible ? "Visible" : "Hidden"}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" title="Edit" onClick={() => startEdit(item)}><Pencil /></Button>
                        <DeleteButton endpoint={`/admin/navigation/${item.id}`} name={`“${item.label_en}”`} onDeleted={refetch} />
                      </div>
                    </TableCell>
                  </TableRow>
                  {(item.children ?? []).map((child) => (
                    <TableRow key={child.id} className="bg-cream/40">
                      <TableCell><span className="pl-5 text-sm text-ink">↳ {child.label_en}</span></TableCell>
                      <TableCell className="font-mono text-[11px] text-muted">{child.url}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{child.location}</Badge></TableCell>
                      <TableCell className="text-xs text-muted">{child.target}</TableCell>
                      <TableCell><Badge className={child.is_visible ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-stone-200 text-stone-700 border-stone-300"}>{child.is_visible ? "Visible" : "Hidden"}</Badge></TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon-sm" title="Edit" onClick={() => startEdit(child, item.id)}><Pencil /></Button>
                          <DeleteButton endpoint={`/admin/navigation/${child.id}`} name={`“${child.label_en}”`} onDeleted={refetch} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </Fragment>
              )) : <EmptyRow colSpan={6} title="No navigation items found" />}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Menu Item" : "New Menu Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Label (English)" required><Input value={form.label_en} onChange={(e) => setForm({ ...form, label_en: e.target.value })} /></Field>
              <Field label="URL" required><Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="/news" /></Field>
              <Field label="Label (Myanmar)"><Input value={form.label_my} onChange={(e) => setForm({ ...form, label_my: e.target.value })} /></Field>
              <Field label="Label (Mon)"><Input value={form.label_mnw} onChange={(e) => setForm({ ...form, label_mnw: e.target.value })} /></Field>
              <Field label="Location">
                <Select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value as "header" | "footer" })}>
                  <option value="header">Header</option>
                  <option value="footer">Footer</option>
                </Select>
              </Field>
              <Field label="Parent">
                <Select value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })}>
                  <option value="">Top level</option>
                  {parents.map((item) => <option key={item.id} value={item.id}>{item.label_en}</option>)}
                </Select>
              </Field>
              <Field label="Target">
                <Select value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value as "_self" | "_blank" })}>
                  <option value="_self">Same tab</option>
                  <option value="_blank">New tab</option>
                </Select>
              </Field>
              <Field label="Display order"><Input type="number" min="0" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={form.is_visible} onChange={(e) => setForm({ ...form, is_visible: e.target.checked })} className="h-4 w-4 accent-burgundy" />
              Visible in menu
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Item"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
