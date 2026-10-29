import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import VideoEmbed from "@/components/site/VideoEmbed";
import { mediaUrl } from "@/lib/media";
import { getPublishedProjectBySlug, getPublishedProjects } from "@/lib/projects";
import { serviceName } from "@/lib/services";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);
  if (!project) return { title: "Project not found" };

  const cover = mediaUrl(project.cover_image);
  return {
    title: project.title,
    description: project.summary ?? undefined,
    openGraph: {
      title: project.title,
      description: project.summary ?? undefined,
      images: cover ? [{ url: cover }] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);
  if (!project) notFound();

  const all = await getPublishedProjects();
  const index = all.findIndex((p) => p.id === project.id);
  const next = all.length > 1 ? all[(index + 1) % all.length] : null;

  const cover = mediaUrl(project.cover_image);
  const gallery = project.gallery.map((path) => mediaUrl(path)).filter((u): u is string => Boolean(u));

  return (
    <article>
      {/* CINEMATIC HERO */}
      <header className="relative flex min-h-[90svh] items-end overflow-hidden">
        {cover && (
          <Image src={cover} alt={project.title} fill priority sizes="100vw" className="object-cover" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/40 to-ink/30" />
        <div className="relative mx-auto w-full max-w-[1600px] px-5 pb-12 pt-40 md:px-10 md:pb-20">
          <Link href="/work" className="mb-8 inline-flex items-center gap-2 text-sm text-white/60 hover:text-lime">
            <span aria-hidden>←</span> All projects
          </Link>
          <div className="mb-6 flex flex-wrap gap-2">
            {project.categories.map((c) => (
              <Link
                key={c}
                href={`/work?category=${c}`}
                className="rounded-full border border-white/25 bg-black/30 px-3 py-1 text-xs uppercase tracking-[0.15em] text-white/80 backdrop-blur-md hover:border-lime hover:text-lime"
              >
                {serviceName(c)}
              </Link>
            ))}
          </div>
          <h1 className="max-w-6xl text-4xl font-semibold leading-[0.9] tracking-[-0.03em] md:text-6xl lg:text-[5.5rem]">
            {project.title}
          </h1>
        </div>
      </header>

      {/* DETAILS */}
      <section className="mx-auto grid max-w-[1600px] gap-12 px-5 py-20 md:grid-cols-[1fr_2fr] md:px-10 md:py-28">
        <dl className="grid h-fit grid-cols-2 gap-8 border-t border-white/10 pt-8 md:grid-cols-1">
          {project.client && (
            <div>
              <dt className="text-xs uppercase tracking-[0.25em] text-white/40">Client</dt>
              <dd className="mt-2 text-lg">{project.client}</dd>
            </div>
          )}
          {project.year && (
            <div>
              <dt className="text-xs uppercase tracking-[0.25em] text-white/40">Year</dt>
              <dd className="mt-2 text-lg">{project.year}</dd>
            </div>
          )}
          {project.categories.length > 0 && (
            <div className="col-span-2 md:col-span-1">
              <dt className="text-xs uppercase tracking-[0.25em] text-white/40">Services</dt>
              <dd className="mt-2 text-lg">{project.categories.map(serviceName).join(", ")}</dd>
            </div>
          )}
        </dl>

        <div className="border-t border-white/10 pt-8">
          {project.summary && (
            <p className="text-2xl font-medium leading-snug tracking-tight md:text-4xl">{project.summary}</p>
          )}
          {project.description && (
            <div className="mt-10 max-w-3xl whitespace-pre-line text-lg leading-relaxed text-white/70">
              {project.description}
            </div>
          )}
        </div>
      </section>

      {/* VIDEO */}
      {project.video_url && (
        <section className="mx-auto max-w-[1600px] px-5 pb-8 md:px-10">
          <VideoEmbed url={project.video_url} title={project.title} poster={cover} />
        </section>
      )}

      {/* GALLERY */}
      {gallery.length > 0 && (
        <section className="mx-auto grid max-w-[1600px] gap-4 px-5 pb-20 pt-8 sm:grid-cols-2 md:gap-8 md:px-10 md:pb-28">
          {gallery.map((src, i) => (
            <div key={src} className={`flex items-center justify-center overflow-hidden rounded-2xl bg-white/[0.03] ${i % 3 === 0 ? "sm:col-span-2" : ""}`}>
              <Image
                src={src}
                alt={`${project.title} — image ${i + 1}`}
                width={2000}
                height={1250}
                sizes={i % 3 === 0 ? "100vw" : "(min-width: 640px) 50vw, 100vw"}
                className="h-auto max-h-[75svh] w-auto max-w-full object-contain md:max-h-[85svh]"
              />
            </div>
          ))}
        </section>
      )}

      {/* NEXT PROJECT */}
      {next && next.id !== project.id && (
        <section className="border-t border-white/10">
          <Link href={`/work/${next.slug}`} className="group mx-auto block max-w-[1600px] px-5 py-20 md:px-10 md:py-32">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Next project</p>
            <p className="mt-6 flex items-center justify-between gap-6 text-5xl font-semibold leading-[0.9] tracking-tight transition-colors group-hover:text-lime md:text-8xl">
              {next.title}
              <span aria-hidden className="shrink-0 transition-transform duration-500 group-hover:translate-x-3">→</span>
            </p>
          </Link>
        </section>
      )}
    </article>
  );
}
