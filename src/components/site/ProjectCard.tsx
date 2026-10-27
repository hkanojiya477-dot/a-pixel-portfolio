import Image from "next/image";
import Link from "next/link";
import { mediaUrl } from "@/lib/media";
import { serviceName } from "@/lib/services";
import type { Project } from "@/lib/types";

interface Props {
  project: Project;
  index?: number;
  variant?: "wide" | "default";
  priority?: boolean;
}

export default function ProjectCard({ project, index, variant = "default", priority = false }: Props) {
  const cover = mediaUrl(project.cover_image);
  const aspect = variant === "wide" ? "aspect-[4/5] sm:aspect-[16/10] lg:aspect-[21/9]" : "aspect-[4/5] sm:aspect-[16/11]";

  return (
    <Link href={`/work/${project.slug}`} className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime">
      <div className={`relative overflow-hidden rounded-2xl bg-white/[0.04] ${aspect}`}>
        {cover ? (
          <Image
            src={cover}
            alt={project.title}
            fill
            priority={priority}
            sizes={variant === "wide" ? "100vw" : "(min-width: 640px) 50vw, 100vw"}
            className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.05]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-xs uppercase tracking-[0.3em] text-white/20">
            No cover image
          </div>
        )}

        {/* Cinematic letterbox bars that slide in on hover */}
        <div className="absolute inset-x-0 top-0 h-0 bg-ink transition-all duration-700 ease-out group-hover:h-[7%]" />
        <div className="absolute inset-x-0 bottom-0 h-0 bg-ink transition-all duration-700 ease-out group-hover:h-[7%]" />

        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/10 to-black/20" />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-5 md:p-7">
          <div className="flex flex-wrap gap-2">
            {project.categories.slice(0, 3).map((c) => (
              <span
                key={c}
                className="rounded-full border border-white/20 bg-black/30 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-white/80 backdrop-blur-md"
              >
                {serviceName(c)}
              </span>
            ))}
          </div>
          {project.video_url && (
            <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-lime px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-ink">
              <span aria-hidden>▶</span> Film
            </span>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-5 md:p-8">
          <div className="min-w-0">
            {typeof index === "number" && (
              <p className="mb-2 font-mono text-xs text-lime">{String(index + 1).padStart(2, "0")}</p>
            )}
            <h3
              className={`font-semibold leading-[0.95] tracking-tight ${
                variant === "wide" ? "text-3xl md:text-5xl lg:text-6xl" : "text-2xl md:text-4xl"
              }`}
            >
              {project.title}
            </h3>
            <p className="mt-3 text-sm text-white/60">
              {[project.client, project.year].filter(Boolean).join(" · ")}
            </p>
          </div>
          <span
            aria-hidden
            className="grid h-12 w-12 shrink-0 translate-y-3 place-items-center rounded-full bg-lime text-lg text-ink opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 md:h-14 md:w-14"
          >
            ↗
          </span>
        </div>
      </div>
    </Link>
  );
}
