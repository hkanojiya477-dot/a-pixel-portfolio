"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { deleteProject, saveProject } from "@/app/admin/actions";
import {
  MEDIA_BUCKET,
  SHAPE_ASPECT,
  SHAPE_LABEL,
  VIDEO_SHAPES,
  mediaUrl,
  parseVideoUrl,
  projectVideos,
  resolveVideo,
  type ProjectVideo,
  type VideoShape,
} from "@/lib/media";
import { SERVICES } from "@/lib/services";
import { slugify } from "@/lib/slug";
import { createClient } from "@/lib/supabase/client";
import type { Project, ProjectInput, ProjectStatus } from "@/lib/types";

const MAX_IMAGE_MB = 10;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const MAX_VIDEO_MB = 50; // Supabase free plan limit per file
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/x-m4v"];

/** Reads a video file's width/height in the browser to guess reel vs. film. */
function detectShape(file: File): Promise<VideoShape> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.muted = true;
    const done = (shape: VideoShape) => {
      URL.revokeObjectURL(url);
      resolve(shape);
    };
    v.onloadedmetadata = () => {
      const r = v.videoWidth / (v.videoHeight || 1);
      done(r < 0.9 ? "portrait" : r > 1.1 ? "landscape" : "square");
    };
    v.onerror = () => done("landscape");
    v.src = url;
  });
}

const input =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder:text-white/30 focus:border-lime focus:outline-none";
const labelText = "mb-2 block text-sm text-white/60";
const card = "rounded-2xl border border-white/10 bg-coal p-5 md:p-6";

interface Props {
  project?: Project;
  justCreated?: boolean;
}

export default function ProjectForm({ project, justCreated = false }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState(project?.title ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(project));
  const [client, setClient] = useState(project?.client ?? "");
  const [year, setYear] = useState(project?.year?.toString() ?? String(new Date().getFullYear()));
  const [summary, setSummary] = useState(project?.summary ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [categories, setCategories] = useState<string[]>(project?.categories ?? []);
  const [cover, setCover] = useState<string | null>(project?.cover_image ?? null);
  const [gallery, setGallery] = useState<string[]>(project?.gallery ?? []);
  const [videos, setVideos] = useState<ProjectVideo[]>(() => (project ? projectVideos(project) : []));
  const [videoLink, setVideoLink] = useState("");
  const [featured, setFeatured] = useState(project?.featured ?? false);
  const [sortOrder, setSortOrder] = useState(String(project?.sort_order ?? 0));
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? "draft");

  const [uploading, setUploading] = useState<null | "cover" | "gallery" | "video">(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(justCreated ? "Project created and saved." : null);

  const effectiveSlug = slugEdited ? slug : slugify(title);
  const linkParsed = videoLink.trim() ? parseVideoUrl(videoLink) : null;
  const linkOk = !videoLink.trim() || linkParsed !== null;
  const busy = pending || uploading !== null;

  async function uploadImages(files: File[]): Promise<string[]> {
    const paths: string[] = [];
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error(`"${file.name}" isn't a supported image. Use JPG, PNG, WebP, GIF or AVIF.`);
      }
      if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
        throw new Error(`"${file.name}" is larger than ${MAX_IMAGE_MB} MB. Please compress it first.`);
      }
      const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "jpg";
      const path = `projects/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(path, file, { cacheControl: "31536000", contentType: file.type, upsert: false });
      if (uploadError) throw new Error(`Upload failed for "${file.name}": ${uploadError.message}`);
      paths.push(path);
    }
    return paths;
  }

  async function handleUpload(kind: "cover" | "gallery", fileList: FileList | null) {
    const files = Array.from(fileList ?? []);
    if (files.length === 0) return;
    setError(null);
    setUploading(kind);
    try {
      if (kind === "cover") {
        const [path] = await uploadImages(files.slice(0, 1));
        setCover(path);
      } else {
        const paths = await uploadImages(files);
        setGallery((g) => [...g, ...paths]);
      }
      setNotice("Image uploaded — remember to save the project.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(null);
    }
  }

  async function handleVideoUpload(fileList: FileList | null) {
    const files = Array.from(fileList ?? []);
    if (files.length === 0) return;
    setError(null);
    setUploading("video");
    try {
      for (const file of files) {
        if (!VIDEO_TYPES.includes(file.type)) {
          throw new Error(`"${file.name}" isn't a supported video. Use MP4, WebM or MOV.`);
        }
        if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
          throw new Error(
            `"${file.name}" is larger than ${MAX_VIDEO_MB} MB. Export a smaller file (e.g. H.264, 1080p, ~8 Mbps) or upload it to YouTube/Vimeo and paste the link.`,
          );
        }
        const shape = await detectShape(file);
        const ext = (file.name.split(".").pop() ?? "mp4").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 4) || "mp4";
        const safeExt = ["mp4", "webm", "mov", "m4v"].includes(ext) ? ext : "mp4";
        const path = `projects/${crypto.randomUUID()}.${safeExt}`;
        const { error: uploadError } = await supabase.storage
          .from(MEDIA_BUCKET)
          .upload(path, file, { cacheControl: "31536000", contentType: file.type, upsert: false });
        if (uploadError) {
          const hint = /mime|size|exceed/i.test(uploadError.message)
            ? " (Has supabase/videos.sql been run in Supabase?)"
            : "";
          throw new Error(`Upload failed for "${file.name}": ${uploadError.message}${hint}`);
        }
        setVideos((v) => [...v, { src: path, shape, title: null }]);
      }
      setNotice("Video uploaded — remember to save the project.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(null);
    }
  }

  function addVideoLink() {
    const link = videoLink.trim();
    if (!link || !linkParsed) return;
    if (videos.some((v) => v.src === link)) {
      setVideoLink("");
      return;
    }
    const shape: VideoShape = linkParsed.kind === "youtube" && linkParsed.isShort ? "portrait" : "landscape";
    setVideos((v) => [...v, { src: link, shape, title: null }]);
    setVideoLink("");
  }

  function updateVideo(index: number, patch: Partial<ProjectVideo>) {
    setVideos((list) => list.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function moveVideo(index: number, direction: -1 | 1) {
    setVideos((list) => {
      const next = [...list];
      const target = index + direction;
      if (target < 0 || target >= next.length) return list;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function moveImage(index: number, direction: -1 | 1) {
    setGallery((g) => {
      const next = [...g];
      const target = index + direction;
      if (target < 0 || target >= next.length) return g;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function toggleCategory(slugValue: string) {
    setCategories((c) => (c.includes(slugValue) ? c.filter((x) => x !== slugValue) : [...c, slugValue]));
  }

  function save(nextStatus: ProjectStatus) {
    setError(null);
    setNotice(null);
    const payload: ProjectInput = {
      title,
      slug: effectiveSlug,
      client,
      year,
      summary,
      description,
      categories,
      cover_image: cover,
      gallery,
      videos,
      featured,
      sort_order: sortOrder,
    };

    startTransition(async () => {
      const result = await saveProject(project?.id ?? null, payload, nextStatus);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setStatus(nextStatus);
      setSlug(effectiveSlug);
      setSlugEdited(true);
      if (!project && result.id) {
        router.replace(`/admin/projects/${result.id}?created=1`);
        return;
      }
      setNotice(nextStatus === "published" ? "Saved and live on your website." : "Saved as draft (not visible to visitors).");
      router.refresh();
    });
  }

  function handleDelete() {
    if (!project) return;
    if (!confirm(`Delete "${project.title}" permanently?\n\nThis also deletes its images and uploaded videos and cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteProject(project.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/admin");
      router.refresh();
    });
  }

  const coverUrl = mediaUrl(cover);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save(status);
      }}
      className="grid gap-6 lg:grid-cols-[1fr_360px]"
    >
      {/* MAIN COLUMN */}
      <div className="space-y-6">
        <section className={`${card} space-y-5`}>
          <label className="block">
            <span className={labelText}>Project title *</span>
            <input
              className={input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={150}
              required
              placeholder="e.g. Nova Coffee Rebrand"
            />
          </label>

          <label className="block">
            <span className={labelText}>Page URL</span>
            <div className="flex items-center overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] focus-within:border-lime">
              <span className="pl-4 text-sm text-white/30">/work/</span>
              <input
                className="w-full bg-transparent px-1 py-3 text-white focus:outline-none"
                value={effectiveSlug}
                onChange={(e) => {
                  setSlugEdited(true);
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
                }}
                onBlur={() => setSlug(slugify(effectiveSlug))}
                maxLength={100}
                placeholder="nova-coffee-rebrand"
              />
            </div>
            <span className="mt-1 block text-xs text-white/40">Created automatically from the title. Lowercase letters, numbers and dashes.</span>
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className={labelText}>Client</span>
              <input className={input} value={client} onChange={(e) => setClient(e.target.value)} maxLength={120} placeholder="Client name" />
            </label>
            <label className="block">
              <span className={labelText}>Year</span>
              <input className={input} value={year} onChange={(e) => setYear(e.target.value)} inputMode="numeric" maxLength={4} placeholder="2025" />
            </label>
          </div>

          <label className="block">
            <span className={labelText}>Short summary <span className="text-white/30">({summary.length}/300)</span></span>
            <textarea
              className={input}
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              maxLength={300}
              placeholder="One or two sentences shown at the top of the project page."
            />
          </label>

          <label className="block">
            <span className={labelText}>Full description</span>
            <textarea
              className={input}
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={10000}
              placeholder="The challenge, the idea, the result… Leave a blank line between paragraphs."
            />
          </label>
        </section>

        {/* GALLERY */}
        <section className={card}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-medium">Gallery images</h2>
              <p className="text-xs text-white/40">JPG, PNG, WebP, GIF or AVIF · up to {MAX_IMAGE_MB} MB each · select several at once</p>
            </div>
            <label className={`cursor-pointer rounded-lg border border-white/15 px-4 py-2 text-sm hover:border-lime hover:text-lime ${busy ? "pointer-events-none opacity-50" : ""}`}>
              {uploading === "gallery" ? "Uploading…" : "+ Add images"}
              <input
                type="file"
                accept={ALLOWED_TYPES.join(",")}
                multiple
                className="sr-only"
                disabled={busy}
                onChange={(e) => {
                  void handleUpload("gallery", e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          </div>

          {gallery.length === 0 ? (
            <p className="rounded-lg border border-dashed border-white/10 py-10 text-center text-sm text-white/40">No gallery images yet.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {gallery.map((path, i) => (
                <li key={path} className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mediaUrl(path) ?? ""} alt="" className="aspect-[4/3] w-full object-cover" />
                  <div className="flex items-center justify-between gap-1 p-2 text-xs">
                    <div className="flex gap-1">
                      <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} className="rounded bg-white/10 px-2 py-1 disabled:opacity-30" aria-label="Move left">←</button>
                      <button type="button" onClick={() => moveImage(i, 1)} disabled={i === gallery.length - 1} className="rounded bg-white/10 px-2 py-1 disabled:opacity-30" aria-label="Move right">→</button>
                    </div>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => setCover(path)} className="rounded bg-white/10 px-2 py-1 hover:text-lime" title="Use as cover">Cover</button>
                      <button type="button" onClick={() => setGallery((g) => g.filter((p) => p !== path))} className="rounded bg-red-500/20 px-2 py-1 text-red-300" aria-label="Remove image">✕</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* VIDEOS */}
        <section className={card}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-medium">Videos</h2>
              <p className="text-xs text-white/40">
                Upload MP4 / WebM / MOV (up to {MAX_VIDEO_MB} MB each) or paste a YouTube / Vimeo link. Reels and films are shown in their real shape.
              </p>
            </div>
            <label className={`cursor-pointer rounded-lg border border-white/15 px-4 py-2 text-sm hover:border-lime hover:text-lime ${busy ? "pointer-events-none opacity-50" : ""}`}>
              {uploading === "video" ? "Uploading… (large files take a minute)" : "+ Upload videos"}
              <input
                type="file"
                accept={VIDEO_TYPES.join(",")}
                multiple
                className="sr-only"
                disabled={busy}
                onChange={(e) => {
                  void handleVideoUpload(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          </div>

          <div className="flex gap-2">
            <input
              className={`${input} ${linkOk ? "" : "border-red-500/60"}`}
              value={videoLink}
              onChange={(e) => setVideoLink(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addVideoLink();
                }
              }}
              placeholder="Paste a link: https://youtu.be/…  ·  youtube.com/shorts/…  ·  vimeo.com/…"
            />
            <button
              type="button"
              onClick={addVideoLink}
              disabled={!videoLink.trim() || !linkOk}
              className="shrink-0 rounded-lg border border-white/15 px-4 text-sm hover:border-lime hover:text-lime disabled:opacity-40"
            >
              Add link
            </button>
          </div>
          {!linkOk && (
            <p className="mt-1 text-xs text-red-300">This link isn&apos;t recognised as YouTube, Vimeo or an .mp4/.webm file.</p>
          )}

          {videos.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-white/10 py-10 text-center text-sm text-white/40">No videos yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {videos.map((video, i) => {
                const source = resolveVideo(video);
                return (
                  <li key={video.src} className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
                    <div className={`w-20 shrink-0 self-start overflow-hidden rounded-md bg-black sm:w-24 ${SHAPE_ASPECT[video.shape]}`}>
                      {source?.kind === "file" ? (
                        <video src={`${source.src}#t=0.1`} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                      ) : source?.kind === "youtube" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={`https://i.ytimg.com/vi/${source.id}/hqdefault.jpg`} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full place-items-center text-[10px] uppercase text-[#fff]/60">Vimeo</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <input
                        className={`${input} py-2 text-sm`}
                        value={video.title ?? ""}
                        onChange={(e) => updateVideo(i, { title: e.target.value })}
                        maxLength={120}
                        placeholder="Video title (optional), e.g. Diwali Reel"
                      />
                      <p className="truncate text-xs text-white/40" title={video.src}>
                        {source?.kind === "file" && !/^https?:/.test(video.src) ? "Uploaded file" : video.src}
                      </p>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex flex-wrap gap-1">
                          {VIDEO_SHAPES.map((shape) => (
                            <button
                              key={shape}
                              type="button"
                              aria-pressed={video.shape === shape}
                              onClick={() => updateVideo(i, { shape })}
                              className={`rounded-full border px-2.5 py-1 ${video.shape === shape ? "border-lime bg-lime text-ink" : "border-white/15 text-white/60 hover:border-white/40"}`}
                            >
                              {SHAPE_LABEL[shape]}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => moveVideo(i, -1)} disabled={i === 0} className="rounded bg-white/10 px-2 py-1 disabled:opacity-30" aria-label="Move up">↑</button>
                          <button type="button" onClick={() => moveVideo(i, 1)} disabled={i === videos.length - 1} className="rounded bg-white/10 px-2 py-1 disabled:opacity-30" aria-label="Move down">↓</button>
                          <button type="button" onClick={() => setVideos((v) => v.filter((_, j) => j !== i))} className="rounded bg-red-500/20 px-2 py-1 text-red-300" aria-label="Remove video">✕</button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* SIDEBAR */}
      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <section className={`${card} space-y-4`}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Status</span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${status === "published" ? "bg-lime/15 text-lime" : "bg-white/10 text-white/60"}`}>
              {status === "published" ? "Published" : "Draft"}
            </span>
          </div>

          {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
          {notice && !error && <p role="status" className="rounded-lg border border-lime/30 bg-lime/10 px-3 py-2 text-sm text-lime">{notice}</p>}

          {status === "draft" ? (
            <div className="grid gap-2">
              <button type="button" disabled={busy} onClick={() => save("published")} className="rounded-lg bg-lime py-3 font-medium text-ink disabled:opacity-50">
                {pending ? "Saving…" : "Publish"}
              </button>
              <button type="button" disabled={busy} onClick={() => save("draft")} className="rounded-lg border border-white/15 py-3 hover:border-white/40 disabled:opacity-50">
                Save draft
              </button>
            </div>
          ) : (
            <div className="grid gap-2">
              <button type="button" disabled={busy} onClick={() => save("published")} className="rounded-lg bg-lime py-3 font-medium text-ink disabled:opacity-50">
                {pending ? "Saving…" : "Save changes"}
              </button>
              <button type="button" disabled={busy} onClick={() => save("draft")} className="rounded-lg border border-white/15 py-3 hover:border-white/40 disabled:opacity-50">
                Unpublish (move to drafts)
              </button>
              {project && (
                <Link href={`/work/${project.slug}`} target="_blank" className="text-center text-sm text-white/50 hover:text-lime">
                  View live page ↗
                </Link>
              )}
            </div>
          )}
          <p className="text-xs leading-relaxed text-white/40">Drafts are private. Only published projects appear on your website.</p>
        </section>

        {/* COVER */}
        <section className={card}>
          <h2 className="mb-1 font-medium">Cover image *</h2>
          <p className="mb-4 text-xs text-white/40">Shown on project cards and at the top of the page. Wide (16:9) images look best.</p>
          <div className="relative aspect-video overflow-hidden rounded-lg border border-white/10 bg-white/5">
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverUrl} alt="Cover preview" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center text-xs text-white/30">No cover yet</div>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            <label className={`flex-1 cursor-pointer rounded-lg border border-white/15 py-2 text-center text-sm hover:border-lime hover:text-lime ${busy ? "pointer-events-none opacity-50" : ""}`}>
              {uploading === "cover" ? "Uploading…" : cover ? "Replace" : "Upload cover"}
              <input
                type="file"
                accept={ALLOWED_TYPES.join(",")}
                className="sr-only"
                disabled={busy}
                onChange={(e) => {
                  void handleUpload("cover", e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
            {cover && (
              <button type="button" onClick={() => setCover(null)} className="rounded-lg border border-red-500/30 px-3 text-sm text-red-300">
                Remove
              </button>
            )}
          </div>
        </section>

        {/* CATEGORIES */}
        <section className={card}>
          <h2 className="mb-4 font-medium">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {SERVICES.map((s) => {
              const on = categories.includes(s.slug);
              return (
                <button
                  key={s.slug}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleCategory(s.slug)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${on ? "border-lime bg-lime text-ink" : "border-white/15 text-white/70 hover:border-white/40"}`}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        </section>

        {/* OPTIONS */}
        <section className={`${card} space-y-5`}>
          <label className="flex cursor-pointer items-center justify-between gap-4">
            <span>
              <span className="block font-medium">Featured</span>
              <span className="text-xs text-white/40">Show on the home page</span>
            </span>
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-5 w-5 accent-lime" />
          </label>
          <label className="block">
            <span className={labelText}>Display order</span>
            <input className={input} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} inputMode="numeric" />
            <span className="mt-1 block text-xs text-white/40">Lower numbers appear first. Leave 0 to sort newest first.</span>
          </label>
        </section>

        {project && (
          <button type="button" disabled={busy} onClick={handleDelete} className="w-full rounded-lg border border-red-500/30 py-3 text-sm text-red-300 hover:bg-red-500/10 disabled:opacity-50">
            Delete project
          </button>
        )}
      </aside>
    </form>
  );
}
