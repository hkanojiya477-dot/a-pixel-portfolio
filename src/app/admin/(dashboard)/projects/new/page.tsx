import Link from "next/link";
import ProjectForm from "@/components/admin/ProjectForm";

export default function NewProjectPage() {
  return (
    <div>
      <Link href="/admin" className="text-sm text-white/50 hover:text-lime">
        ← All projects
      </Link>
      <h1 className="mb-8 mt-3 text-3xl font-semibold tracking-tight">New project</h1>
      <ProjectForm />
    </div>
  );
}
