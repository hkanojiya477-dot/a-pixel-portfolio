"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { MEDIA_BUCKET } from "@/lib/media";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult, ProjectInput, ProjectStatus } from "@/lib/types";
import { validateProject } from "@/lib/validation";

// Every action below starts with requireAdmin(). On top of that, the database
// rules in supabase/schema.sql reject any change not made by an admin.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function refreshWebsite() {
  // Makes the public site show your changes straight away.
  revalidatePath("/", "layout");
}

function friendlyError(error: { code?: string; message: string }): string {
  if (error.code === "23505") return "Another project already uses this URL slug. Please choose a different one.";
  if (error.code === "42501") return "You don't have permission to do that.";
  return `Something went wrong: ${error.message}`;
}

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

async function removeFiles(supabase: SupabaseServer, paths: string[]) {
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove(paths);
  if (error) console.error("[admin] Could not delete old images:", error.message);
}

export async function saveProject(
  id: string | null,
  input: ProjectInput,
  status: ProjectStatus,
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  if (id !== null && !UUID.test(id)) return { ok: false, error: "Invalid project." };
  if (status !== "draft" && status !== "published") return { ok: false, error: "Invalid status." };

  const parsed = validateProject(input);
  if (!parsed.ok) return parsed;
  const row = { ...parsed.data, status };

  if (status === "published" && !row.cover_image) {
    return { ok: false, error: "Add a cover image before publishing." };
  }

  if (id === null) {
    const { data, error } = await supabase.from("projects").insert(row).select("id").single();
    if (error) return { ok: false, error: friendlyError(error) };
    refreshWebsite();
    return { ok: true, id: data.id as string };
  }

  const { data: existing, error: loadError } = await supabase
    .from("projects")
    .select("cover_image, gallery")
    .eq("id", id)
    .maybeSingle();
  if (loadError || !existing) return { ok: false, error: "Project not found." };

  const { error } = await supabase.from("projects").update(row).eq("id", id);
  if (error) return { ok: false, error: friendlyError(error) };

  // Delete images that were removed from this project.
  const keep = new Set([row.cover_image, ...row.gallery].filter(Boolean));
  const previous = [existing.cover_image, ...((existing.gallery as string[] | null) ?? [])];
  await removeFiles(
    supabase,
    previous.filter((p): p is string => typeof p === "string" && !keep.has(p)),
  );

  refreshWebsite();
  return { ok: true, id };
}

export async function setProjectStatus(id: string, status: ProjectStatus): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!UUID.test(id) || (status !== "draft" && status !== "published")) {
    return { ok: false, error: "Invalid request." };
  }

  if (status === "published") {
    const { data } = await supabase.from("projects").select("cover_image").eq("id", id).maybeSingle();
    if (!data?.cover_image) return { ok: false, error: "Add a cover image before publishing." };
  }

  const { error } = await supabase.from("projects").update({ status }).eq("id", id);
  if (error) return { ok: false, error: friendlyError(error) };
  refreshWebsite();
  return { ok: true, id };
}

export async function setProjectFeatured(id: string, featured: boolean): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!UUID.test(id)) return { ok: false, error: "Invalid request." };

  const { error } = await supabase.from("projects").update({ featured: featured === true }).eq("id", id);
  if (error) return { ok: false, error: friendlyError(error) };
  refreshWebsite();
  return { ok: true, id };
}

export async function deleteProject(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!UUID.test(id)) return { ok: false, error: "Invalid request." };

  const { data: existing } = await supabase
    .from("projects")
    .select("cover_image, gallery")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return { ok: false, error: "Project not found." };

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) return { ok: false, error: friendlyError(error) };

  await removeFiles(
    supabase,
    [existing.cover_image, ...((existing.gallery as string[] | null) ?? [])].filter(
      (p): p is string => typeof p === "string",
    ),
  );

  refreshWebsite();
  return { ok: true };
}

export async function deleteMessage(id: string): Promise<void> {
  const { supabase } = await requireAdmin();
  if (!UUID.test(id)) return;
  await supabase.from("contact_messages").delete().eq("id", id);
  revalidatePath("/admin/messages");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
