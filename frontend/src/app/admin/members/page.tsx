"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { buildQuery } from "@/lib/api";
import type { Member } from "@/lib/types";
import { storageUrl } from "@/lib/utils";
import { PageHeader } from "@/components/admin/form-parts";
import { DeleteButton, EmptyRow, ListToolbar, Thumb, useDebouncedValue } from "@/components/admin/list-helpers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { ErrorState } from "@/components/site/content-states";

export default function AdminMembersPage() {
  const [search, setSearch] = useState("");
  const [executive, setExecutive] = useState("");
  const [page, setPage] = useState(1);
  const query = useDebouncedValue(search);

  const path = useMemo(
    () => `/admin/members${buildQuery({ search: query || undefined, executive: executive || undefined, page, per_page: 12 })}`,
    [query, executive, page]
  );

  const { data, meta, loading, error, refetch } = useApi<Member[]>(path);

  return (
    <div>
      <PageHeader
        title="Members"
        description="Manage executive committee and association members."
        action={<Button asChild><Link href="/admin/members/new"><Plus /> New Member</Link></Button>}
      />

      <ListToolbar search={search} onSearch={(value) => { setSearch(value); setPage(1); }}>
        <Select value={executive} onChange={(e) => { setExecutive(e.target.value); setPage(1); }} className="w-40">
          <option value="">All members</option>
          <option value="1">Executive only</option>
        </Select>
      </ListToolbar>

      <div className="overflow-hidden rounded-2xl border border-burgundy/10 bg-white shadow-sm">
        {loading ? <TableSkeleton /> : error ? (
          <div className="p-4"><ErrorState message={error} onRetry={refetch} /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.length ? data.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Thumb src={storageUrl(member.photo_path)} alt={member.name} className="h-10 w-10 rounded-full" />
                      <div className="min-w-0">
                        <p className="max-w-[260px] truncate font-semibold text-burgundy-800">{member.name}</p>
                        <p className="text-[11px] text-muted">{member.email ?? member.academic_year ?? "—"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted">{member.position ?? "—"}</TableCell>
                  <TableCell className="text-xs text-muted">{member.department ?? "—"}</TableCell>
                  <TableCell><Badge variant={member.is_executive ? "default" : "outline"}>{member.is_executive ? "Executive" : "Member"}</Badge></TableCell>
                  <TableCell><Badge className={member.is_active ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-stone-200 text-stone-700 border-stone-300"}>{member.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="icon-sm" title="Edit"><Link href={`/admin/members/${member.id}/edit`}><Pencil /></Link></Button>
                      <DeleteButton endpoint={`/admin/members/${member.id}`} name={`“${member.name}”`} onDeleted={refetch} />
                    </div>
                  </TableCell>
                </TableRow>
              )) : <EmptyRow colSpan={6} title="No members found" />}
            </TableBody>
          </Table>
        )}
      </div>

      <Pagination meta={meta} onPageChange={setPage} className="mt-5" />
    </div>
  );
}
