import type { Metadata } from "next";
import EmptyState from "@/components/site/EmptyState";
import MediaWall from "@/components/site/MediaWall";
import SectionLabel from "@/components/site/SectionLabel";
import { getPublishedProjects } from "@/lib/projects";
import { collectVideos } from "@/lib/wall";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Videos",
  description: "Reels, ad films and motion work — video editing and animation by A PIXEL.",
};

export default async function VideosPage() {
  const projects = await getPublishedProjects();
  const videos = collectVideos(projects);
  const reels = videos.filter((v) => v.shape === "portrait").length;
  const films = videos.filter((v) => v.shape === "landscape").length;

  return (
    <div className="mx-auto max-w-[1600px] px-5 pb-24 pt-32 md:px-10 md:pb-36 md:pt-44">
      <SectionLabel>Videos</SectionLabel>
      <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <h1 className="text-5xl font-semibold uppercase leading-[0.85] tracking-[-0.04em] md:text-[length:clamp(3.5rem,6.3vw,7rem)]">
          In <span className="font-serif font-normal normal-case italic text-lime">motion</span>
        </h1>
        <p className="font-mono text-sm text-white/50">
          {String(videos.length).padStart(2, "0")} {videos.length === 1 ? "video" : "videos"}
          {videos.length > 0 && ` · ${reels} ${reels === 1 ? "reel" : "reels"} · ${films} ${films === 1 ? "film" : "films"}`}
        </p>
      </div>

      <div className="mt-12 md:mt-16">
        {videos.length > 0 ? <MediaWall items={videos} mode="videos" /> : <EmptyState message="Videos are on the way." />}
      </div>
    </div>
  );
}
