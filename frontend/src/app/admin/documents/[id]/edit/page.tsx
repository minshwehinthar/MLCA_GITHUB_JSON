"use client";

import { useParams } from "next/navigation";
import { DocumentForm } from "@/components/admin/forms/document-form";

export default function EditDocumentPage() {
  const params = useParams<{ id: string }>();
  return <DocumentForm id={Number(params?.id)} />;
}
