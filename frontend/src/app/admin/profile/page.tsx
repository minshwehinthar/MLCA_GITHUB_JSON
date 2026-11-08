"use client";

import { useEffect, useState } from "react";
import { KeyRound, Save } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { Field, FormCard, ImageUpload, PageHeader } from "@/components/admin/form-parts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function AdminProfilePage() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone ?? "");
    setBio(user.bio ?? "");
    setAvatar(user.avatar_path ?? "");
  }, [user]);

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.put("/auth/profile", { name, email, phone: phone || null, bio: bio || null, avatar: avatar || null });
      await refresh();
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== passwordConfirmation) return toast.error("Passwords do not match.");
    setChanging(true);
    try {
      await api.post("/auth/change-password", {
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
      });
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirmation("");
      toast.success("Password changed.");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Unable to change password.");
    } finally {
      setChanging(false);
    }
  };

  return (
    <div>
      <PageHeader title="My Profile" description="Update your account details and password." />

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <FormCard title="Account Details">
          <form onSubmit={saveProfile} className="space-y-4">
            <ImageUpload value={avatar} onChange={setAvatar} folder="avatars" label="Avatar" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name" required><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
              <Field label="Email" required><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
              <Field label="Phone"><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
            </div>
            <Field label="Bio">
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/25" />
            </Field>
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}><Save /> {saving ? "Saving..." : "Save Profile"}</Button>
            </div>
          </form>
        </FormCard>

        <div className="space-y-5">
          <FormCard title="Roles">
            <div className="flex flex-wrap gap-2">
              {(user?.roles ?? []).map((role) => <Badge key={role.id} variant="outline">{role.name}</Badge>)}
            </div>
            <p className="mt-3 text-xs text-muted">{user?.permissions.length ?? 0} permissions granted</p>
          </FormCard>

          <FormCard title="Change Password">
            <form onSubmit={changePassword} className="space-y-4">
              <Field label="Current password" required><Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /></Field>
              <Field label="New password" required hint="At least 8 characters."><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
              <Field label="Confirm new password" required><Input type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} /></Field>
              <div className="flex justify-end">
                <Button type="submit" disabled={changing}><KeyRound /> {changing ? "Updating..." : "Change Password"}</Button>
              </div>
            </form>
          </FormCard>
        </div>
      </div>
    </div>
  );
}
