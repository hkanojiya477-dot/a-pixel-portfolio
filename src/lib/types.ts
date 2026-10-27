export type ProjectStatus = "draft" | "published";

export interface Project {
  id: string;
  title: string;
  slug: string;
  client: string | null;
  year: number | null;
  summary: string | null;
  description: string | null;
  categories: string[];
  /** Path inside the "project-media" storage bucket, e.g. "projects/abc.jpg" */
  cover_image: string | null;
  gallery: string[];
  video_url: string | null;
  featured: boolean;
  status: ProjectStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

/** What the admin form sends to the server. Everything is re-checked on the server. */
export interface ProjectInput {
  title: string;
  slug: string;
  client: string;
  year: string;
  summary: string;
  description: string;
  categories: string[];
  cover_image: string | null;
  gallery: string[];
  video_url: string;
  featured: boolean;
  sort_order: string;
}

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  service: string | null;
  budget: string | null;
  message: string;
  created_at: string;
}
