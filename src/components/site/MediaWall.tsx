"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SHAPE_ASPECT, autoplayUrl, type VideoShape, type VideoSource } from "@/lib/media";

export type WallImage = { type: "image"; key: string; src: string; slug: string; title: string };
export type WallVideo = {
  type: "video";
  key: string;
  source: VideoSource;
  shape: VideoShape;
  /** Still image shown before playing (null = use the video's first frame). */
  thumb: string | null;
  videoTitle: string | null;
  slug: string;
  title: string;
};
export type WallItem = WallImage | WallVideo;

type Mode = "gallery" | "videos";
type Filter = { id: string; label: string; test: (item: WallItem) => boolean };

const FILTERS: Record<Mode, Filter[]> = {
  gallery: [
    { id: "all", label: "All", test: () => true },
    { id: "images", label: "Images", test: (i) => i.type === "image" },
    { id: "videos", label: "Videos", test: (i) => i.type === "video" },
  ],
  videos: [
    { id: "all", label: "All", test: () => true },
    { id: "reels", label: "Reels", test: (i) => i.type === "video" && i.shape === "portrait" },
    { id: "films", label: "Films", test: (i) => i.type === "video" && i.shape === "landscape" },
    { id: "square", label: "Square", test: (i) => i.type === "video" && i.shape === "square" },
  ],
};

/**
 * Masonry wall of images and videos, each in its original shape.
 * Images open their project; videos open a full-screen player
 * (← → / swipe for the next video, Esc to close).
 */
export default function MediaWall({ items, mode }: { items: WallItem[]; mode: Mode }) {
  const filters = FILTERS[mode].filter((f) => f.id === "all" || items.some(f.test));
  const [filterId, setFilterId] = useState("all");
  const filter = filters.find((f) => f.id === filterId) ?? filters[0];
  const visible = useMemo(() => items.filter(filter.test), [items, filter]);
  const videos = useMemo(() => visible.filter((i): i is WallVideo => i.type === "video"), [visible]);

  const [open, setOpen] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const count = videos.length;

  const close = useCallback(() => setOpen(null), []);
  const prev = useCallback(() => setOpen((i) => (i === null ? i : (i - 1 + count) % count)), [count]);
  const next = useCallback(() => setOpen((i) => (i === null ? i : (i + 1) % count)), [count]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      trigger.current?.focus();
    };
  }, [open, close, prev, next]);

  const current = open === null ? null : videos[open];

  return (
    <>
      {filters.length > 2 && (
        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter">
          {filters.map((f) => {
            const n = items.filter(f.test).length;
            const on = f.id === filter.id;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={on}
                onClick={() => setFilterId(f.id)}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  on ? "border-lime bg-lime text-ink" : "border-white/15 text-white/70 hover:border-white/40"
                }`}
              >
                {f.label} <span className="ml-1 font-mono text-xs opacity-60">{n}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="columns-1 gap-4 sm:columns-2 md:gap-6 lg:columns-3">
        {visible.map((item, i) =>
          item.type === "image" ? (
            <Link
              key={item.key}
              href={`/work/${item.slug}`}
              className="group relative mb-4 block break-inside-avoid overflow-hidden rounded-2xl bg-white/[0.03] md:mb-6"
            >
              <Image
                src={item.src}
                alt={`${item.title} — image ${i + 1}`}
                width={0}
                height={0}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-linear-to-t from-[#000]/75 to-transparent p-4 text-[#fff] transition-opacity duration-300 md:p-5 md:opacity-0 md:group-hover:opacity-100">
                <span className="text-sm font-medium">{item.title}</span>
                <span aria-hidden className="text-lime">↗</span>
              </div>
            </Link>
          ) : (
            <VideoTile
              key={item.key}
              item={item}
              onOpen={(el) => {
                trigger.current = el;
                setOpen(videos.indexOf(item));
              }}
            />
          ),
        )}
      </div>

      {current && open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${current.title} — video ${open + 1} of ${count}`}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 text-white backdrop-blur-sm md:p-10"
          onClick={close}
          onTouchStart={(e) => {
            touchX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 60) (dx > 0 ? prev : next)();
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative overflow-hidden rounded-xl bg-[#000] ${SHAPE_ASPECT[current.shape]} ${
              current.shape === "landscape"
                ? "w-full max-w-[min(92vw,calc(78svh*16/9))]"
                : current.shape === "portrait"
                  ? "h-[min(78svh,calc(92vw*16/9))]"
                  : "w-[min(92vw,78svh)]"
            }`}
          >
            {current.source.kind === "file" ? (
              <video
                key={current.key}
                src={current.source.src}
                controls
                autoPlay
                playsInline
                className="absolute inset-0 h-full w-full bg-[#000] object-contain"
              />
            ) : (
              <iframe
                key={current.key}
                src={autoplayUrl(current.source) ?? undefined}
                title={`${current.title} — video`}
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="absolute inset-0 h-full w-full"
              />
            )}
          </div>

          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-4 p-4 md:p-6">
            <span className="rounded-full bg-black/50 px-3 py-1 font-mono text-xs text-white/70">
              {open + 1} / {count}
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Close video"
              className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full bg-white/10 text-lg hover:bg-white/20"
            >
              ✕
            </button>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 p-4 md:p-6">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{current.videoTitle ?? current.title}</p>
              {current.videoTitle && <p className="truncate text-xs text-white/50">{current.title}</p>}
            </div>
            <Link
              href={`/work/${current.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto shrink-0 rounded-full bg-lime px-4 py-2 text-sm font-medium text-ink"
            >
              View project ↗
            </Link>
          </div>

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Previous video"
                className="absolute left-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-xl hover:bg-white/20 md:grid"
              >
                ←
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Next video"
                className="absolute right-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-xl hover:bg-white/20 md:grid"
              >
                →
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}

function VideoTile({ item, onOpen }: { item: WallVideo; onOpen: (el: HTMLElement) => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const isFile = item.source.kind === "file";

  return (
    <button
      type="button"
      onClick={(e) => onOpen(e.currentTarget)}
      onMouseEnter={() => void ref.current?.play().catch(() => {})}
      onMouseLeave={() => {
        if (ref.current) {
          ref.current.pause();
          ref.current.currentTime = 0.1;
        }
      }}
      aria-label={`Play video: ${item.videoTitle ?? item.title}`}
      className={`group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl bg-[#000] text-left text-[#fff] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime md:mb-6 ${SHAPE_ASPECT[item.shape]}`}
    >
      {isFile ? (
        <video
          ref={ref}
          src={`${(item.source as { src: string }).src}#t=0.1`}
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      ) : item.thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.thumb}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      ) : null}

      <div className="absolute inset-0 bg-linear-to-t from-[#000]/75 via-[#000]/0 to-[#000]/25" />

      <span className="absolute left-4 top-4 rounded-full border border-[#fff]/20 bg-[#000]/40 px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] backdrop-blur-md">
        {item.shape === "portrait" ? "Reel" : item.shape === "landscape" ? "Film" : "Video"}
      </span>

      <span
        aria-hidden
        className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-lime pl-1 text-lg text-ink shadow-lg transition-transform duration-300 group-hover:scale-110"
      >
        ▶
      </span>

      <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
        <p className="truncate text-sm font-medium">{item.videoTitle ?? item.title}</p>
        {item.videoTitle && <p className="truncate text-xs text-[#fff]/60">{item.title}</p>}
      </div>
    </button>
  );
}
