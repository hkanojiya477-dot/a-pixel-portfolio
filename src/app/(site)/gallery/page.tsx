import type { Metadata } from "next";
import EmptyState from "@/components/site/EmptyState";
import MediaWall from "@/components/site/MediaWall";
import SectionLabel from "@/components/site/SectionLabel";
import { getPublishedProjects } from "@/lib/projects";
import { collectMedia } from "@/lib/wall";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Gallery",
  description: "Every image and video from our work, shown in its original shape.",
};

export default async function GalleryPage() {
  const projects = await getPublishedProjects();
  const items = collectMedia(projects);
  const images = items.filter((i) => i.type === "image").length;
  const videos = items.length - images;

  return (
    <div className="mx-auto max-w-[1600px] px-5 pb-24 pt-32 md:px-10 md:pb-36 md:pt-44">
      <SectionLabel>Gallery</SectionLabel>
      <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <h1 className="text-5xl font-semibold uppercase leading-[0.85] tracking-[-0.04em] md:text-[length:clamp(3.5rem,6.3vw,7rem)]">
          The <span className="font-serif font-normal normal-case italic text-lime">gallery</span>
        </h1>
        <p className="font-mono text-sm text-white/50">
          {String(images).padStart(2, "0")} {images === 1 ? "image" : "images"}
          {videos > 0 && (
            <>
              {" · "}
              {String(videos).padStart(2, "0")} {videos === 1 ? "video" : "videos"}
            </>
          )}
        </p>
      </div>

      <div className="mt-12 md:mt-16">
        {items.length > 0 ? <MediaWall items={items} mode="gallery" /> : <EmptyState />}
      </div>
    </div>
  );
}
