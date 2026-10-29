import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import EmptyState from "@/components/site/EmptyState";
import SectionLabel from "@/components/site/SectionLabel";
import { mediaUrl } from "@/lib/media";
import { getPublishedProjects } from "@/lib/projects";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Gallery",
  description: "Every image from our work, shown in its original shape.",
};

type GalleryImage = { src: string; slug: string; title: string };

export default async function GalleryPage() {
  const projects = await getPublishedProjects();

  // Cover + gallery images from every published project, without duplicates.
  const images: GalleryImage[] = [];
  const seen = new Set<string>();
  for (const project of projects) {
    for (const path of [project.cover_image, ...project.gallery]) {
      if (!path || seen.has(path)) continue;
      seen.add(path);
      const src = mediaUrl(path);
      if (src) images.push({ src, slug: project.slug, title: project.title });
    }
  }

  return (
    <div className="mx-auto max-w-[1600px] px-5 pb-24 pt-32 md:px-10 md:pb-36 md:pt-44">
      <SectionLabel>Gallery</SectionLabel>
      <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <h1 className="text-5xl font-semibold uppercase leading-[0.85] tracking-[-0.04em] md:text-[length:clamp(3.5rem,6.3vw,7rem)]">
          The <span className="font-serif font-normal normal-case italic text-lime">gallery</span>
        </h1>
        <p className="font-mono text-sm text-white/50">
          {String(images.length).padStart(2, "0")} {images.length === 1 ? "image" : "images"}
        </p>
      </div>

      <div className="mt-12 md:mt-16">
        {images.length > 0 ? (
          // Masonry: equal-width columns, every image keeps its original shape.
          <div className="columns-1 gap-4 sm:columns-2 md:gap-6 lg:columns-3">
            {images.map((img, i) => (
              <Link
                key={img.src}
                href={`/work/${img.slug}`}
                className="group relative mb-4 block break-inside-avoid overflow-hidden rounded-2xl bg-white/[0.03] md:mb-6"
              >
                <Image
                  src={img.src}
                  alt={`${img.title} — image ${i + 1}`}
                  width={0}
                  height={0}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-linear-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 md:p-5 md:opacity-0 md:group-hover:opacity-100">
                  <span className="text-sm font-medium">{img.title}</span>
                  <span aria-hidden className="text-lime">↗</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
