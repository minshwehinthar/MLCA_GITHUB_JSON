"use client";

import { useParams } from "next/navigation";
import { MemberForm } from "@/components/admin/forms/member-form";

export default function EditMemberPage() {
  const params = useParams<{ id: string }>();
  return <MemberForm id={Number(params?.id)} />;
}
