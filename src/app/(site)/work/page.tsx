import type { Metadata } from "next";
import Link from "next/link";
import EmptyState from "@/components/site/EmptyState";
import ProjectGrid from "@/components/site/ProjectGrid";
import SectionLabel from "@/components/site/SectionLabel";
import { getPublishedProjects } from "@/lib/projects";
import { SERVICES, getService } from "@/lib/services";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected projects in branding, design, motion, video and advertising.",
};

export default async function WorkPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const params = await searchParams;
  const requested = typeof params.category === "string" ? params.category : undefined;
  const active = requested && getService(requested) ? requested : undefined;

  const projects = await getPublishedProjects({ category: active });

  const chip = (selected: boolean) =>
    `whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors ${
      selected ? "border-lime bg-lime text-ink" : "border-white/15 text-white/70 hover:border-white/40 hover:text-white"
    }`;

  return (
    <div className="mx-auto max-w-[1600px] px-5 pb-24 pt-32 md:px-10 md:pb-36 md:pt-44">
      <SectionLabel>Portfolio</SectionLabel>
      <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <h1 className="text-6xl font-semibold uppercase leading-[0.85] tracking-[-0.04em] md:text-[9vw]">
          All <span className="font-serif font-normal normal-case italic text-lime">projects</span>
        </h1>
        <p className="font-mono text-sm text-white/50">
          {String(projects.length).padStart(2, "0")} {projects.length === 1 ? "project" : "projects"}
        </p>
      </div>

      <nav aria-label="Filter by service" className="-mx-5 mt-12 overflow-x-auto px-5 pb-2 md:mx-0 md:px-0">
        <ul className="flex gap-2 md:flex-wrap">
          <li>
            <Link href="/work" className={chip(!active)} scroll={false}>
              All
            </Link>
          </li>
          {SERVICES.map((s) => (
            <li key={s.slug}>
              <Link href={`/work?category=${s.slug}`} className={chip(active === s.slug)} scroll={false}>
                {s.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-12 md:mt-16">
        {projects.length > 0 ? (
          <ProjectGrid projects={projects} />
        ) : (
          <EmptyState message={active ? "No projects in this category yet." : undefined} />
        )}
      </div>
    </div>
  );
}
