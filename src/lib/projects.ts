import { cache } from "react";
import { createPublicClient } from "./supabase/public";
import { isSupabaseConfigured } from "./supabase/env";
import type { Project } from "./types";

/** Published projects for the public website. Drafts are never returned. */
export async function getPublishedProjects(
  options: { category?: string; featuredOnly?: boolean; limit?: number } = {},
): Promise<Project[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = createPublicClient();
  let query = supabase
    .from("projects")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false });

  if (options.category) query = query.contains("categories", [options.category]);
  if (options.featuredOnly) query = query.eq("featured", true);
  if (options.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error) {
    console.error("[projects] Could not load projects:", error.message);
    return [];
  }
  return (data ?? []) as Project[];
}

export const getPublishedProjectBySlug = cache(async (slug: string): Promise<Project | null> => {
  if (!isSupabaseConfigured) return null;

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("[projects] Could not load project:", error.message);
    return null;
  }
  return (data as Project | null) ?? null;
});
