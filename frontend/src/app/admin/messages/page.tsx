"use client";

import { useMemo, useState } from "react";
import { Mail, MailOpen } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "@/hooks/use-api";
import { api, ApiError, buildQuery } from "@/lib/api";
import type { ContactMessage } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/admin/form-parts";
import { DeleteButton, EmptyRow, ListToolbar, useDebouncedValue } from "@/components/admin/list-helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { ErrorState } from "@/components/site/content-states";

export default function AdminMessagesPage() {
  const [search, setSearch] = useState("");
  const [read, setRead] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const query = useDebouncedValue(search);

  const path = useMemo(
    () => `/admin/messages${buildQuery({ search: query || undefined, is_read: read || undefined, page, per_page: 15 })}`,
    [query, read, page]
  );

  const { data, meta, loading, error, refetch } = useApi<ContactMessage[]>(path);

  const openMessage = async (message: ContactMessage) => {
    setSelected(message);
    if (!message.is_read) {
      try {
        await api.get(`/admin/messages/${message.id}`);
        refetch();
      } catch {
        // ignore; opening should not block reading
      }
    }
  };

  const toggleRead = async (message: ContactMessage) => {
    try {
      await api.put(`/admin/messages/${message.id}/toggle-read`);
      setSelected((current) => (current && current.id === message.id ? { ...current, is_read: !current.is_read } : current));
      refetch();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to update message.");
    }
  };

  return (
    <div>
      <PageHeader title="Messages" description="Contact form submissions from the public site." />

      <ListToolbar search={search} onSearch={(value) => { setSearch(value); setPage(1); }}>
        <Select value={read} onChange={(e) => { setRead(e.target.value); setPage(1); }} className="w-40">
          <option value="">All messages</option>
          <option value="0">Unread</option>
          <option value="1">Read</option>
        </Select>
      </ListToolbar>

      <div className="overflow-hidden rounded-2xl border border-burgundy/10 bg-white shadow-sm">
        {loading ? <TableSkeleton /> : error ? (
          <div className="p-4"><ErrorState message={error} onRetry={refetch} /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead />
                <TableHead>From</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Received</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.length ? data.map((message) => (
                <TableRow key={message.id} className={message.is_read ? "" : "bg-gold/5"}>
                  <TableCell className="w-10">
                    {message.is_read ? <MailOpen className="h-4 w-4 text-muted" /> : <Mail className="h-4 w-4 text-burgundy" />}
                  </TableCell>
                  <TableCell>
                    <button type="button" onClick={() => openMessage(message)} className="text-left">
                      <p className={`text-sm ${message.is_read ? "text-ink" : "font-semibold text-burgundy-800"}`}>{message.name}</p>
                      <p className="text-[11px] text-muted">{message.email}</p>
                    </button>
                  </TableCell>
                  <TableCell>
                    <button type="button" onClick={() => openMessage(message)} className="max-w-[320px] truncate text-left text-sm text-ink">
                      {message.subject || "(no subject)"}
                    </button>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted">{formatDate(message.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => toggleRead(message)}>
                        {message.is_read ? "Mark unread" : "Mark read"}
                      </Button>
                      <DeleteButton endpoint={`/admin/messages/${message.id}`} name={`message from ${message.name}`} onDeleted={refetch} />
                    </div>
                  </TableCell>
                </TableRow>
              )) : <EmptyRow colSpan={5} title="No messages found" />}
            </TableBody>
          </Table>
        )}
      </div>

      <Pagination meta={meta} onPageChange={setPage} className="mt-5" />

      <Dialog open={Boolean(selected)} onOpenChange={(value) => { if (!value) setSelected(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selected?.subject || "(no subject)"}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
                <Badge variant="outline">{selected.is_read ? "Read" : "Unread"}</Badge>
                <span className="font-semibold text-ink">{selected.name}</span>
                <a href={`mailto:${selected.email}`} className="text-burgundy hover:underline">{selected.email}</a>
                <span>·</span>
                <span>{formatDate(selected.created_at)}</span>
              </div>
              <div className="whitespace-pre-wrap rounded-xl bg-cream/60 p-4 text-sm leading-relaxed text-ink">{selected.message}</div>
            </div>
          )}
          <DialogFooter>
            {selected && (
              <Button variant="outline" onClick={() => toggleRead(selected)}>
                {selected.is_read ? "Mark unread" : "Mark read"}
              </Button>
            )}
            <Button onClick={() => setSelected(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
