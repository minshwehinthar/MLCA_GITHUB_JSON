"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { buildQuery } from "@/lib/api";
import type { Post } from "@/lib/types";
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

export default function AdminPostsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const query = useDebouncedValue(search);

  const path = useMemo(
    () => `/admin/posts${buildQuery({ search: query || undefined, status: status || undefined, page, per_page: 12 })}`,
    [query, status, page]
  );

  const { data, meta, loading, error, refetch } = useApi<Post[]>(path);

  return (
    <div>
      <PageHeader
        title="Posts & News"
        description="Manage articles, news and announcements."
        action={<Button asChild><Link href="/admin/posts/new"><Plus /> New Post</Link></Button>}
      />

      <ListToolbar search={search} onSearch={(value) => { setSearch(value); setPage(1); }}>
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-40">
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </Select>
      </ListToolbar>

      <div className="overflow-hidden rounded-2xl border border-burgundy/10 bg-white shadow-sm">
        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <div className="p-4"><ErrorState message={error} onRetry={refetch} /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Post</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.length ? (
                data.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Thumb src={storageUrl(post.cover_image || post.cover_path)} alt={post.title} className="h-11 w-14" />
                        <div className="min-w-0">
                          <p className="max-w-[320px] truncate font-semibold text-burgundy-800">{post.title}</p>
                          <p className="text-[11px] text-muted">{post.is_featured ? "Featured" : post.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted">{post.category?.name ?? "—"}</TableCell>
                    <TableCell><Badge className={`capitalize ${statusColor(post.status)}`}>{post.status}</Badge></TableCell>
                    <TableCell className="text-xs text-muted">{post.views}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted">{formatShortDate(post.published_at ?? post.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="icon-sm" title="Edit"><Link href={`/admin/posts/${post.id}/edit`}><Pencil /></Link></Button>
                        <DeleteButton endpoint={`/admin/posts/${post.id}`} name={`“${post.title}”`} onDeleted={refetch} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <EmptyRow colSpan={6} title="No posts found" />
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <Pagination meta={meta} onPageChange={setPage} className="mt-5" />
    </div>
  );
}
