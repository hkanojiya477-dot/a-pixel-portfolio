import Link from "next/link";
import ProjectRowActions from "@/components/admin/ProjectRowActions";
import { requireAdmin } from "@/lib/auth";
import { mediaUrl } from "@/lib/media";
import { serviceName } from "@/lib/services";
import type { Project } from "@/lib/types";

export default async function AdminProjectsPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });
  const projects = (data ?? []) as Project[];

  const stats = [
    { label: "Total", value: projects.length },
    { label: "Published", value: projects.filter((p) => p.status === "published").length },
    { label: "Drafts", value: projects.filter((p) => p.status === "draft").length },
    { label: "Featured", value: projects.filter((p) => p.featured).length },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-white/50">Add, edit, publish and feature your portfolio work.</p>
        </div>
        <Link href="/admin/projects/new" className="rounded-lg bg-lime px-5 py-2.5 font-medium text-ink">
          + New project
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-white/10 bg-coal p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">{s.label}</p>
            <p className="mt-2 text-3xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-8 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          Could not load projects: {error.message}. Did you run supabase/schema.sql?
        </p>
      )}

      {projects.length === 0 && !error ? (
        <div className="mt-8 rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center">
          <p className="text-lg">No projects yet.</p>
          <p className="mt-2 text-sm text-white/50">Create your first one — it starts as a private draft.</p>
          <Link href="/admin/projects/new" className="mt-6 inline-block rounded-lg bg-lime px-5 py-2.5 font-medium text-ink">
            + New project
          </Link>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10">
          {projects.map((p) => {
            const thumb = mediaUrl(p.cover_image);
            return (
              <li key={p.id} className="flex flex-col gap-4 bg-coal p-4 md:flex-row md:items-center">
                <Link href={`/admin/projects/${p.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-white/5">
                    {thumb && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 truncate font-medium">
                      {p.featured && <span className="text-lime" title="Featured">★</span>}
                      {p.title}
                    </p>
                    <p className="mt-1 truncate text-xs text-white/40">
                      {p.categories.map(serviceName).join(", ") || "No category"} · Updated{" "}
                      {new Date(p.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      p.status === "published" ? "bg-lime/15 text-lime" : "bg-white/10 text-white/60"
                    }`}
                  >
                    {p.status === "published" ? "Published" : "Draft"}
                  </span>
                  <ProjectRowActions id={p.id} title={p.title} slug={p.slug} status={p.status} featured={p.featured} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
