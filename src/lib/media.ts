import { supabaseUrl } from "./supabase/env";

export const MEDIA_BUCKET = "project-media";

/** Turns a stored image path ("projects/abc.jpg") into a full public URL. */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path || !supabaseUrl) return null;
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `${supabaseUrl}/storage/v1/object/public/${MEDIA_BUCKET}/${encoded}`;
}

export type VideoSource =
  | { kind: "youtube" | "vimeo"; embedUrl: string }
  | { kind: "file"; src: string };

/**
 * Accepts YouTube, Vimeo or direct .mp4 / .webm links and returns a safe
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
      return { kind: "youtube", embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0` };
    }
    return null;
  }

  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    if (id && idPattern.test(id)) {
      return { kind: "youtube", embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0` };
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

  if (/\.(mp4|webm|mov)$/i.test(url.pathname)) {
    return { kind: "file", src: url.toString() };
  }

  return null;
}
