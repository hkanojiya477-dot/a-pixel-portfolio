"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteProject, setProjectFeatured, setProjectStatus } from "@/app/admin/actions";
import type { ActionResult, ProjectStatus } from "@/lib/types";

interface Props {
  id: string;
  title: string;
  slug: string;
  status: ProjectStatus;
  featured: boolean;
}

const btn =
  "rounded-lg border border-white/15 px-3 py-1.5 text-xs transition-colors hover:border-lime hover:text-lime disabled:opacity-50";

export default function ProjectRowActions({ id, title, slug, status, featured }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const run = (action: () => Promise<ActionResult>) =>
    startTransition(async () => {
      const result = await action();
      if (!result.ok) alert(result.error);
      router.refresh();
    });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href={`/admin/projects/${id}`} className={btn}>
        Edit
      </Link>
      {status === "published" && (
        <Link href={`/work/${slug}`} target="_blank" className={btn}>
          View ↗
        </Link>
      )}
      <button
        type="button"
        disabled={pending}
        className={btn}
        onClick={() => run(() => setProjectStatus(id, status === "published" ? "draft" : "published"))}
      >
        {status === "published" ? "Unpublish" : "Publish"}
      </button>
      <button type="button" disabled={pending} className={btn} onClick={() => run(() => setProjectFeatured(id, !featured))}>
        {featured ? "Unfeature" : "Feature"}
      </button>
      <button
        type="button"
        disabled={pending}
        className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10 disabled:opacity-50"
        onClick={() => {
          if (confirm(`Delete "${title}" permanently?\n\nThis also deletes its images and cannot be undone.`)) {
            run(() => deleteProject(id));
          }
        }}
      >
        Delete
      </button>
    </div>
  );
}
