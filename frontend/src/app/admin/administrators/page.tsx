"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "@/hooks/use-api";
import { api, ApiError, buildQuery } from "@/lib/api";
import type { AdminUser, Permission, Role } from "@/lib/types";
import { formatDate, storageUrl } from "@/lib/utils";
import { Field, FormCard, ImageUpload, PageHeader } from "@/components/admin/form-parts";
import { DeleteButton, EmptyRow, ListToolbar, Thumb, useDebouncedValue } from "@/components/admin/list-helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { ErrorState } from "@/components/site/content-states";

type RolesResponse = { roles: Role[]; permissions: Permission[] };

type UserForm = {
  id?: number;
  name: string;
  email: string;
  password: string;
  phone: string;
  avatar: string;
  bio: string;
  is_active: boolean;
  roleIds: number[];
};

const blankUser: UserForm = { name: "", email: "", password: "", phone: "", avatar: "", bio: "", is_active: true, roleIds: [] };

export default function AdminAdministratorsPage() {
  const [tab, setTab] = useState("users");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const query = useDebouncedValue(search);

  const path = useMemo(() => `/admin/administrators${buildQuery({ search: query || undefined, page, per_page: 12 })}`, [query, page]);
  const users = useApi<AdminUser[]>(path);
  const roleData = useApi<RolesResponse>("/admin/roles");

  const [userOpen, setUserOpen] = useState(false);
  const [userForm, setUserForm] = useState<UserForm>(blankUser);
  const [savingUser, setSavingUser] = useState(false);

  const [activeRole, setActiveRole] = useState<number | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [savingRole, setSavingRole] = useState(false);

  const roles = useMemo(() => roleData.data?.roles ?? [], [roleData.data]);
  const permissions = roleData.data?.permissions ?? [];

  useEffect(() => {
    if (activeRole === null && roles.length) setActiveRole(roles[0].id);
  }, [roles, activeRole]);

  useEffect(() => {
    const role = roles.find((item) => item.id === activeRole);
    setSelectedPermissions(role ? role.permissions.map((permission) => permission.id) : []);
  }, [activeRole, roles]);

  const openCreate = () => {
    setUserForm(blankUser);
    setUserOpen(true);
  };

  const openEdit = (user: AdminUser) => {
    setUserForm({
      id: user.id,
      name: user.name,
      email: user.email,
      password: "",
      phone: user.phone ?? "",
      avatar: user.avatar_path ?? "",
      bio: user.bio ?? "",
      is_active: user.is_active,
      roleIds: user.roles.map((role) => role.id),
    });
    setUserOpen(true);
  };

  const saveUser = async () => {
    if (!userForm.name.trim() || !userForm.email.trim()) return toast.error("Name and email are required.");
    if (!userForm.id && userForm.password.length < 8) return toast.error("Password must be at least 8 characters.");
    if (!userForm.roleIds.length) return toast.error("Select at least one role.");

    setSavingUser(true);
    const payload = {
      name: userForm.name,
      email: userForm.email,
      password: userForm.password || undefined,
      phone: userForm.phone || null,
      avatar: userForm.avatar || null,
      bio: userForm.bio || null,
      is_active: userForm.is_active,
      roles: userForm.roleIds,
    };
    try {
      if (userForm.id) await api.put(`/admin/administrators/${userForm.id}`, payload);
      else await api.post("/admin/administrators", payload);
      toast.success(userForm.id ? "Administrator updated." : "Administrator created.");
      setUserOpen(false);
      users.refetch();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to save administrator.");
    } finally {
      setSavingUser(false);
    }
  };

  const togglePermission = (id: number) => {
    setSelectedPermissions((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const saveRole = async () => {
    if (activeRole === null) return;
    setSavingRole(true);
    try {
      await api.put(`/admin/roles/${activeRole}/permissions`, { permissions: selectedPermissions });
      toast.success("Role permissions updated.");
      roleData.refetch();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to update permissions.");
    } finally {
      setSavingRole(false);
    }
  };

  const currentRole = roles.find((role) => role.id === activeRole);
  const permissionModules = permissions.reduce<Record<string, Permission[]>>((acc, permission) => {
    const groupKey = permission.module || "general";
    acc[groupKey] = acc[groupKey] ?? [];
    acc[groupKey].push(permission);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Administrators"
        description="Manage admin accounts, roles and permissions."
        action={tab === "users" ? <Button onClick={openCreate}><Plus /> New Administrator</Button> : undefined}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <ListToolbar search={search} onSearch={(value) => { setSearch(value); setPage(1); }} />

          <div className="overflow-hidden rounded-2xl border border-burgundy/10 bg-white shadow-sm">
            {users.loading ? <TableSkeleton /> : users.error ? (
              <div className="p-4"><ErrorState message={users.error} onRetry={users.refetch} /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.data?.length ? users.data.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Thumb src={storageUrl(user.avatar_path)} alt={user.name} className="h-10 w-10 rounded-full" />
                          <div className="min-w-0">
                            <p className="font-semibold text-burgundy-800">{user.name}</p>
                            <p className="text-[11px] text-muted">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => <Badge key={role.id} variant="outline">{role.name}</Badge>)}
                        </div>
                      </TableCell>
                      <TableCell><Badge className={user.is_active ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-stone-200 text-stone-700 border-stone-300"}>{user.is_active ? "Active" : "Disabled"}</Badge></TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted">{user.last_login_at ? formatDate(user.last_login_at) : "Never"}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon-sm" title="Edit" onClick={() => openEdit(user)}><Pencil /></Button>
                          <DeleteButton endpoint={`/admin/administrators/${user.id}`} name={`“${user.name}”`} onDeleted={users.refetch} />
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : <EmptyRow colSpan={5} title="No administrators found" />}
                </TableBody>
              </Table>
            )}
          </div>

          <Pagination meta={users.meta} onPageChange={setPage} />
        </TabsContent>

        <TabsContent value="roles">
          {roleData.loading ? <TableSkeleton /> : roleData.error ? (
            <ErrorState message={roleData.error} onRetry={roleData.refetch} />
          ) : (
            <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
              <div className="space-y-2">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setActiveRole(role.id)}
                    className={`w-full rounded-xl border p-3 text-left transition-colors ${activeRole === role.id ? "border-burgundy bg-burgundy text-white" : "border-burgundy/10 bg-white hover:bg-cream"}`}
                  >
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      <ShieldCheck className="h-4 w-4" /> {role.name}
                    </p>
                    <p className={`mt-0.5 text-[11px] ${activeRole === role.id ? "text-white/70" : "text-muted"}`}>{role.permissions.length} permissions</p>
                  </button>
                ))}
              </div>

              <FormCard
                title={currentRole?.name ?? "Permissions"}
                description={currentRole?.slug === "super-admin" ? "Super Administrator always has full access; permissions cannot be modified." : "Toggle the permissions granted to this role."}
              >
                <div className="space-y-5">
                  {Object.entries(permissionModules).map(([module, list]) => (
                    <div key={module}>
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">{module}</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {list.map((permission) => (
                          <label key={permission.id} className="flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-sm text-ink">
                            <input
                              type="checkbox"
                              className="h-4 w-4 accent-burgundy"
                              checked={selectedPermissions.includes(permission.id)}
                              onChange={() => togglePermission(permission.id)}
                              disabled={currentRole?.slug === "super-admin"}
                            />
                            <span className="truncate">{permission.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex justify-end">
                  <Button onClick={saveRole} disabled={savingRole || currentRole?.slug === "super-admin"}>
                    {savingRole ? "Saving..." : "Save Permissions"}
                  </Button>
                </div>
              </FormCard>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={userOpen} onOpenChange={setUserOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{userForm.id ? "Edit Administrator" : "New Administrator"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name" required><Input value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} /></Field>
              <Field label="Email" required><Input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} /></Field>
              <Field label="Phone"><Input value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} /></Field>
              <Field label={userForm.id ? "New password" : "Password"} required={!userForm.id} hint={userForm.id ? "Leave blank to keep current password." : "At least 8 characters."}>
                <Input type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} />
              </Field>
            </div>
            <Field label="Bio"><textarea value={userForm.bio} onChange={(e) => setUserForm({ ...userForm, bio: e.target.value })} rows={2} className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/25" /></Field>
            <ImageUpload value={userForm.avatar} onChange={(value) => setUserForm({ ...userForm, avatar: value })} folder="avatars" label="Avatar" />
            <div>
              <p className="mb-2 text-sm font-medium text-ink">Roles <span className="text-red-500">*</span></p>
              <div className="grid gap-2 sm:grid-cols-2">
                {roles.map((role) => (
                  <label key={role.id} className="flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-sm text-ink">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-burgundy"
                      checked={userForm.roleIds.includes(role.id)}
                      onChange={() =>
                        setUserForm((current) => ({
                          ...current,
                          roleIds: current.roleIds.includes(role.id)
                            ? current.roleIds.filter((id) => id !== role.id)
                            : [...current.roleIds, role.id],
                        }))
                      }
                    />
                    {role.name}
                  </label>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={userForm.is_active} onChange={(e) => setUserForm({ ...userForm, is_active: e.target.checked })} className="h-4 w-4 accent-burgundy" />
              Active account
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserOpen(false)} disabled={savingUser}>Cancel</Button>
            <Button onClick={saveUser} disabled={savingUser}>{savingUser ? "Saving..." : "Save Administrator"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
