import Link from "next/link";
import { notFound } from "next/navigation";
import ProjectForm from "@/components/admin/ProjectForm";
import { requireAdmin } from "@/lib/auth";
import type { Project } from "@/lib/types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const { created } = await searchParams;
  if (!UUID.test(id)) notFound();

  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const project = data as Project;

  return (
    <div>
      <Link href="/admin" className="text-sm text-white/50 hover:text-lime">
        ← All projects
      </Link>
      <h1 className="mb-8 mt-3 text-3xl font-semibold tracking-tight">Edit project</h1>
      <ProjectForm project={project} justCreated={created === "1"} />
    </div>
  );
}
