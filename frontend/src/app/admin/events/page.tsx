"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { buildQuery } from "@/lib/api";
import type { EventItem } from "@/lib/types";
import { formatShortDate, statusColor, storageUrl } from "@/lib/utils";
import { PageHeader } from "@/components/admin/form-parts";
import { DeleteButton, EmptyRow, ListToolbar, Thumb, useDebouncedValue } from "@/components/admin/list-helpers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { ErrorState } from "@/components/site/content-states";

export default function AdminEventsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const query = useDebouncedValue(search);

  const path = useMemo(
    () => `/admin/events${buildQuery({ search: query || undefined, status: status || undefined, page, per_page: 12 })}`,
    [query, status, page]
  );

  const { data, meta, loading, error, refetch } = useApi<EventItem[]>(path);

  return (
    <div>
      <PageHeader
        title="Events"
        description="Manage festivals, ceremonies and special events."
        action={<Button asChild><Link href="/admin/events/new"><Plus /> New Event</Link></Button>}
      />

      <ListToolbar search={search} onSearch={(value) => { setSearch(value); setPage(1); }}>
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-40">
          <option value="">All statuses</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </ListToolbar>

      <div className="overflow-hidden rounded-2xl border border-burgundy/10 bg-white shadow-sm">
        {loading ? <TableSkeleton /> : error ? (
          <div className="p-4"><ErrorState message={error} onRetry={refetch} /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.length ? data.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Thumb src={storageUrl(event.cover_image || event.cover_path)} alt={event.title} className="h-11 w-14" />
                      <div className="min-w-0">
                        <p className="max-w-[320px] truncate font-semibold text-burgundy-800">{event.title}</p>
                        <p className="text-[11px] text-muted">{event.category?.name ?? event.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge className={`capitalize ${statusColor(event.status)}`}>{event.status}</Badge></TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted">{formatShortDate(event.start_date)}</TableCell>
                  <TableCell className="max-w-[180px] truncate text-xs text-muted">{event.location ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="icon-sm" title="Edit"><Link href={`/admin/events/${event.id}/edit`}><Pencil /></Link></Button>
                      <DeleteButton endpoint={`/admin/events/${event.id}`} name={`“${event.title}”`} onDeleted={refetch} />
                    </div>
                  </TableCell>
                </TableRow>
              )) : <EmptyRow colSpan={5} title="No events found" />}
            </TableBody>
          </Table>
        )}
      </div>

      <Pagination meta={meta} onPageChange={setPage} className="mt-5" />
    </div>
  );
}
