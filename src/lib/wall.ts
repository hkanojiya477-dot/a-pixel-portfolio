import type { WallImage, WallItem, WallVideo } from "@/components/site/MediaWall";
import { mediaUrl, projectVideos, resolveVideo, videoThumbnail } from "./media";
import type { Project } from "./types";

/** Every playable video from the given projects, ready for the media wall. */
export function collectVideos(projects: Project[]): WallVideo[] {
  const out: WallVideo[] = [];
  const seen = new Set<string>();
  for (const project of projects) {
    for (const video of projectVideos(project)) {
      if (seen.has(video.src)) continue;
      const source = resolveVideo(video);
      if (!source) continue;
      seen.add(video.src);
      out.push({
        type: "video",
        key: `v:${video.src}`,
        source,
        shape: video.shape,
        thumb: videoThumbnail(source) ?? (source.kind === "file" ? null : mediaUrl(project.cover_image)),
        videoTitle: video.title ?? null,
        slug: project.slug,
        title: project.title,
      });
    }
  }
  return out;
}

/** Cover + gallery images from every project, without duplicates. */
export function collectImages(projects: Project[]): WallImage[] {
  const out: WallImage[] = [];
  const seen = new Set<string>();
  for (const project of projects) {
    for (const path of [project.cover_image, ...project.gallery]) {
      if (!path || seen.has(path)) continue;
      seen.add(path);
      const src = mediaUrl(path);
      if (src) out.push({ type: "image", key: `i:${path}`, src, slug: project.slug, title: project.title });
    }
  }
  return out;
}

/** Images and videos mixed: each project's videos come right after its images. */
export function collectMedia(projects: Project[]): WallItem[] {
  const seen = new Set<string>();
  return projects
    .flatMap((p) => [...collectImages([p]), ...collectVideos([p])])
    .filter((item) => (seen.has(item.key) ? false : (seen.add(item.key), true)));
}
