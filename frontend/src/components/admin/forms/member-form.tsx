"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import { currentAcademicYear } from "@/lib/utils";
import type { Member } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Field, FormActions, FormCard, ImageUpload, PageHeader, TranslationTabs } from "@/components/admin/form-parts";

type LocaleKey = "en" | "my" | "mnw";
type TranslationValues = { name: string; position: string; biography: string };
type Translations = Record<LocaleKey, TranslationValues>;

const empty: Translations = {
  en: { name: "", position: "", biography: "" },
  my: { name: "", position: "", biography: "" },
  mnw: { name: "", position: "", biography: "" },
};

export function MemberForm({ id }: { id?: number }) {
  const router = useRouter();
  const existing = useApi<Member>(id ? `/admin/members/${id}` : null);

  const [translations, setTranslations] = useState<Translations>(empty);
  const [photo, setPhoto] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [academicYear, setAcademicYear] = useState(currentAcademicYear());
  const [facebook, setFacebook] = useState("");
  const [telegram, setTelegram] = useState("");
  const [isExecutive, setIsExecutive] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState("0");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!existing.data) return;
    const member = existing.data;
    const next: Translations = { ...empty };
    (["en", "my", "mnw"] as LocaleKey[]).forEach((locale) => {
      const item = member.translations?.[locale];
      next[locale] = {
        name: item?.name ?? (locale === "en" ? member.name : ""),
        position: item?.position ?? (locale === "en" ? member.position ?? "" : ""),
        biography: item?.biography ?? (locale === "en" ? member.biography ?? "" : ""),
      };
    });
    setTranslations(next);
    setPhoto(member.photo_path ?? "");
    setEmail(member.email ?? "");
    setPhone(member.phone ?? "");
    setDepartment(member.department ?? "");
    setAcademicYear(member.academic_year ?? "");
    setFacebook(member.facebook ?? "");
    setTelegram(member.telegram ?? "");
    setIsExecutive(member.is_executive);
    setIsActive(member.is_active);
    setOrder(String(member.order ?? 0));
  }, [existing.data]);

  const update = (locale: LocaleKey, field: keyof TranslationValues, value: string) => {
    setTranslations((current) => ({ ...current, [locale]: { ...current[locale], [field]: value } }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!translations.en.name.trim()) return toast.error("English name is required.");

    setSaving(true);
    const payload = {
      photo: photo || null,
      email: email || null,
      phone: phone || null,
      department: department || null,
      academic_year: academicYear || null,
      position: translations.en.position || null,
      facebook: facebook || null,
      telegram: telegram || null,
      is_executive: isExecutive,
      is_active: isActive,
      order: Number(order) || 0,
      translations,
    };

    try {
      if (id) await api.put(`/admin/members/${id}`, payload);
      else await api.post("/admin/members", payload);
      toast.success(id ? "Member updated." : "Member created.");
      router.push("/admin/members");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Unable to save member.");
    } finally {
      setSaving(false);
    }
  };

  if (id && existing.loading) return <div className="space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-96 w-full" /></div>;

  return (
    <form onSubmit={submit} className="space-y-5">
      <PageHeader
        title={id ? "Edit Member" : "New Member"}
        description="Executive committee members and association members."
        action={<Button type="button" variant="outline" onClick={() => router.push("/admin/members")}>Back to members</Button>}
      />

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <FormCard title="Identity">
            <TranslationTabs>
              {(locale) => (
                <>
                  <Field label="Name" required={locale === "en"}>
                    <Input value={translations[locale].name} onChange={(e) => update(locale, "name", e.target.value)} placeholder="Full name" />
                  </Field>
                  <Field label="Position / Role">
                    <Input value={translations[locale].position} onChange={(e) => update(locale, "position", e.target.value)} placeholder="e.g. President" />
                  </Field>
                  <Field label="Biography">
                    <textarea
                      value={translations[locale].biography}
                      onChange={(e) => update(locale, "biography", e.target.value)}
                      rows={4}
                      className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/25"
                      placeholder="Short biography"
                    />
                  </Field>
                </>
              )}
            </TranslationTabs>
          </FormCard>
        </div>

        <div className="space-y-5">
          <FormCard title="Photo">
            <ImageUpload value={photo} onChange={setPhoto} folder="members" hint="Square portrait recommended." />
          </FormCard>

          <FormCard title="Contact & Details">
            <div className="space-y-4">
              <Field label="Email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" /></Field>
              <Field label="Phone"><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09..." /></Field>
              <Field label="Department"><Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Department" /></Field>
              <Field label="Committee term / Year" hint="Used to group current and past committees, e.g. 2025-2026."><Input value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} placeholder="e.g. 2025-2026" /></Field>
              <Field label="Facebook URL"><Input value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="https://facebook.com/..." /></Field>
              <Field label="Telegram URL"><Input value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="https://t.me/..." /></Field>
            </div>
          </FormCard>

          <FormCard title="Settings">
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={isExecutive} onChange={(e) => setIsExecutive(e.target.checked)} className="h-4 w-4 accent-burgundy" />
                Executive committee member
              </label>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 accent-burgundy" />
                Active
              </label>
              <Field label="Display order"><Input type="number" min="0" value={order} onChange={(e) => setOrder(e.target.value)} /></Field>
            </div>
          </FormCard>
        </div>
      </div>

      <FormActions loading={saving} onCancel={() => router.push("/admin/members")} submitLabel={id ? "Update Member" : "Create Member"} />
    </form>
  );
}
