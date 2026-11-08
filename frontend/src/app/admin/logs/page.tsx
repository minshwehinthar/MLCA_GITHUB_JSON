"use client";

import { useMemo, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { buildQuery } from "@/lib/api";
import type { ActivityLogItem } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/admin/form-parts";
import { EmptyRow, ListToolbar, useDebouncedValue } from "@/components/admin/list-helpers";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { ErrorState } from "@/components/site/content-states";

const ACTION_COLORS: Record<string, string> = {
  create: "bg-emerald-100 text-emerald-800 border-emerald-200",
  update: "bg-blue-100 text-blue-800 border-blue-200",
  delete: "bg-red-100 text-red-800 border-red-200",
  login: "bg-gold/20 text-burgundy-800 border-gold/40",
  logout: "bg-stone-200 text-stone-700 border-stone-300",
};

export default function AdminLogsPage() {
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [page, setPage] = useState(1);
  const query = useDebouncedValue(search);

  const path = useMemo(
    () => `/admin/activity-logs${buildQuery({ search: query || undefined, action: action || undefined, page, per_page: 20 })}`,
    [query, action, page]
  );

  const { data, meta, loading, error, refetch } = useApi<ActivityLogItem[]>(path);

  return (
    <div>
      <PageHeader title="Activity Logs" description="Audit trail of administrator actions." />

      <ListToolbar search={search} onSearch={(value) => { setSearch(value); setPage(1); }}>
        <Select value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }} className="w-40">
          <option value="">All actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="login">Login</option>
          <option value="logout">Logout</option>
        </Select>
      </ListToolbar>

      <div className="overflow-hidden rounded-2xl border border-burgundy/10 bg-white shadow-sm">
        {loading ? <TableSkeleton /> : error ? (
          <div className="p-4"><ErrorState message={error} onRetry={refetch} /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>User</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.length ? data.map((log) => (
                <TableRow key={log.id}>
                  <TableCell><Badge className={`capitalize ${ACTION_COLORS[log.action] ?? "bg-stone-200 text-stone-700 border-stone-300"}`}>{log.action}</Badge></TableCell>
                  <TableCell>
                    <p className="max-w-[420px] truncate text-sm text-ink">{log.description ?? "—"}</p>
                    {log.model_type && <p className="text-[11px] text-muted">{log.model_type}{log.model_id ? ` #${log.model_id}` : ""}</p>}
                  </TableCell>
                  <TableCell className="text-xs text-muted">{log.user?.name ?? "System"}</TableCell>
                  <TableCell className="font-mono text-[11px] text-muted">{log.ip_address ?? "—"}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted">{formatDate(log.created_at)}</TableCell>
                </TableRow>
              )) : <EmptyRow colSpan={5} title="No activity logs found" />}
            </TableBody>
          </Table>
        )}
      </div>

      <Pagination meta={meta} onPageChange={setPage} className="mt-5" />
    </div>
  );
}
