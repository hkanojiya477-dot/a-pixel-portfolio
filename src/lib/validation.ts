import { parseVideoUrl } from "./media";
import { SERVICE_SLUGS } from "./services";
import { SLUG_PATTERN, slugify } from "./slug";
import type { ProjectInput } from "./types";

export interface CleanProject {
  title: string;
  slug: string;
  client: string | null;
  year: number | null;
  summary: string | null;
  description: string | null;
  categories: string[];
  cover_image: string | null;
  gallery: string[];
  video_url: string | null;
  featured: boolean;
  sort_order: number;
}

// Only accept image paths that this app itself created in the bucket.
const MEDIA_PATH = /^projects\/[A-Za-z0-9-]+\.[a-z0-9]{1,5}$/;

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

type Result = { ok: true; data: CleanProject } | { ok: false; error: string };

/** Checks everything the admin form sends. Runs on the server, so it can't be bypassed. */
export function validateProject(input: ProjectInput): Result {
  if (!input || typeof input !== "object") return { ok: false, error: "Invalid form data." };

  const title = str(input.title);
  if (!title) return { ok: false, error: "Please add a project title." };
  if (title.length > 150) return { ok: false, error: "Title must be 150 characters or fewer." };

  const slug = slugify(str(input.slug) || title);
  if (!slug || !SLUG_PATTERN.test(slug)) {
    return { ok: false, error: "The URL slug can only use lowercase letters, numbers and dashes." };
  }

  const client = str(input.client);
  if (client.length > 120) return { ok: false, error: "Client name must be 120 characters or fewer." };

  const summary = str(input.summary);
  if (summary.length > 300) return { ok: false, error: "Short summary must be 300 characters or fewer." };

  const description = str(input.description);
  if (description.length > 10000) return { ok: false, error: "Description is too long (max 10,000 characters)." };

  let year: number | null = null;
  const yearText = str(input.year);
  if (yearText) {
    year = Number(yearText);
    if (!Number.isInteger(year) || year < 1990 || year > 2100) {
      return { ok: false, error: "Year must be a number like 2025." };
    }
  }

  let sortOrder = 0;
  const sortText = str(input.sort_order);
  if (sortText) {
    sortOrder = Number(sortText);
    if (!Number.isInteger(sortOrder) || Math.abs(sortOrder) > 100000) {
      return { ok: false, error: "Display order must be a whole number." };
    }
  }

  const categories = Array.isArray(input.categories)
    ? Array.from(new Set(input.categories.filter((c) => typeof c === "string" && SERVICE_SLUGS.includes(c))))
    : [];

  const cover = input.cover_image;
  if (cover !== null && (typeof cover !== "string" || !MEDIA_PATH.test(cover))) {
    return { ok: false, error: "Cover image is invalid. Please upload it again." };
  }

  const gallery = Array.isArray(input.gallery) ? input.gallery : [];
  if (gallery.length > 40) return { ok: false, error: "A project can have up to 40 gallery images." };
  if (!gallery.every((p) => typeof p === "string" && MEDIA_PATH.test(p))) {
    return { ok: false, error: "A gallery image is invalid. Please remove it and upload again." };
  }

  const videoUrl = str(input.video_url);
  if (videoUrl && !parseVideoUrl(videoUrl)) {
    return {
      ok: false,
      error: "Video link must be a YouTube or Vimeo link, or a direct https link to an .mp4/.webm file.",
    };
  }

  return {
    ok: true,
    data: {
      title,
      slug,
      client: client || null,
      year,
      summary: summary || null,
      description: description || null,
      categories,
      cover_image: cover,
      gallery: Array.from(new Set(gallery)),
      video_url: videoUrl || null,
      featured: input.featured === true,
      sort_order: sortOrder,
    },
  };
}
