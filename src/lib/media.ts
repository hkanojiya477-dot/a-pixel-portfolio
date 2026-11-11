import { supabaseUrl } from "./supabase/env";

export const MEDIA_BUCKET = "project-media";

/** Turns a stored image path ("projects/abc.jpg") into a full public URL. */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path || !supabaseUrl) return null;
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `${supabaseUrl}/storage/v1/object/public/${MEDIA_BUCKET}/${encoded}`;
}

export type VideoSource =
  | { kind: "youtube"; embedUrl: string; id: string; isShort: boolean }
  | { kind: "vimeo"; embedUrl: string }
  | { kind: "instagram"; embedUrl: string; code: string }
  | { kind: "file"; src: string };

/**
 * Accepts YouTube, Vimeo, Instagram (reel / post) or direct .mp4 / .webm links and returns a safe
 * embeddable source. Anything else returns null (and is rejected on save).
 */
export function parseVideoUrl(raw: string | null | undefined): VideoSource | null {
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;

  const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "");
  const idPattern = /^[A-Za-z0-9_-]{6,20}$/;

  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const parts = url.pathname.split("/").filter(Boolean);
    let id: string | null = url.searchParams.get("v");
    if (!id && ["shorts", "embed", "live"].includes(parts[0] ?? "")) id = parts[1] ?? null;
    if (id && idPattern.test(id)) {
      return {
        kind: "youtube",
        id,
        isShort: parts[0] === "shorts",
        embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
      };
    }
    return null;
  }

  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    if (id && idPattern.test(id)) {
      return { kind: "youtube", id, isShort: false, embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0` };
    }
    return null;
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const parts = url.pathname.split("/").filter(Boolean);
    const idIndex = parts.findIndex((p) => /^\d+$/.test(p));
    if (idIndex === -1) return null;
    const id = parts[idIndex];
    const hash = url.searchParams.get("h") ?? parts[idIndex + 1];
    const params = new URLSearchParams({ dnt: "1" });
    if (hash && /^[a-f0-9]+$/i.test(hash)) params.set("h", hash);
    return { kind: "vimeo", embedUrl: `https://player.vimeo.com/video/${id}?${params.toString()}` };
  }

  // Instagram: /reel/CODE, /reels/CODE, /p/CODE, /tv/CODE, or /username/reel/CODE
  if (host === "instagram.com" || host === "instagr.am") {
    const parts = url.pathname.split("/").filter(Boolean);
    const i = parts.findIndex((p) => ["reel", "reels", "p", "tv"].includes(p));
    const code = i === -1 ? null : parts[i + 1];
    if (code && /^[A-Za-z0-9_-]{5,40}$/.test(code)) {
      return { kind: "instagram", code, embedUrl: `https://www.instagram.com/p/${code}/embed/` };
    }
    return null;
  }

  if (/\.(mp4|webm|mov)$/i.test(url.pathname)) {
    return { kind: "file", src: url.toString() };
  }

  return null;
}

// ---------------------------------------------------------------------
// Project videos (uploaded files or YouTube / Vimeo / .mp4 links)
// ---------------------------------------------------------------------

export const VIDEO_SHAPES = ["landscape", "portrait", "square"] as const;
export type VideoShape = (typeof VIDEO_SHAPES)[number];

export interface ProjectVideo {
  /** Either a path inside the media bucket ("projects/abc.mp4") or an https link. */
  src: string;
  shape: VideoShape;
  title?: string | null;
}

/** Uploaded video paths created by this app, e.g. "projects/abc.mp4". */
export const VIDEO_PATH = /^projects\/[A-Za-z0-9-]+\.(mp4|webm|mov|m4v)$/;

export const SHAPE_ASPECT: Record<VideoShape, string> = {
  landscape: "aspect-video",
  portrait: "aspect-[9/16]",
  square: "aspect-square",
};

export const SHAPE_LABEL: Record<VideoShape, string> = {
  landscape: "Film · 16:9",
  portrait: "Reel · 9:16",
  square: "Square · 1:1",
};

/** Works out how to play a stored video. Returns null if it is not playable. */
export function resolveVideo(video: ProjectVideo): VideoSource | null {
  if (!video?.src) return null;
  if (VIDEO_PATH.test(video.src)) {
    const src = mediaUrl(video.src);
    return src ? { kind: "file", src } : null;
  }
  return parseVideoUrl(video.src);
}

/** A still image to show before a video plays (null = show the video's first frame). */
export function videoThumbnail(source: VideoSource): string | null {
  if (source.kind === "youtube") return `https://i.ytimg.com/vi/${source.id}/hqdefault.jpg`;
  return null;
}

/** Same embed, but starts playing straight away (used in the full-screen player). */
export function autoplayUrl(source: VideoSource): string | null {
  if (source.kind === "file") return null;
  if (source.kind === "instagram") return source.embedUrl; // Instagram has no autoplay option
  const url = new URL(source.embedUrl);
  url.searchParams.set("autoplay", "1");
  if (source.kind === "youtube") url.searchParams.set("playsinline", "1");
  return url.toString();
}

/** Every video of a project. Older projects with a single video link still work. */
export function projectVideos(project: { videos?: unknown; video_url?: string | null }): ProjectVideo[] {
  const list = Array.isArray(project.videos) ? (project.videos as ProjectVideo[]) : [];
  const clean = list.filter(
    (v) => v && typeof v.src === "string" && (VIDEO_SHAPES as readonly string[]).includes(v.shape),
  );
  if (clean.length > 0) return clean;
  if (project.video_url) {
    const parsed = parseVideoUrl(project.video_url);
    return [{ src: project.video_url, shape: defaultShape(parsed) }];
  }
  return [];
}

/** Best first guess of a link's shape: Shorts and Instagram are vertical reels, the rest wide films. */
export function defaultShape(source: VideoSource | null): VideoShape {
  if (source?.kind === "instagram") return "portrait";
  if (source?.kind === "youtube" && source.isShort) return "portrait";
  return "landscape";
}
