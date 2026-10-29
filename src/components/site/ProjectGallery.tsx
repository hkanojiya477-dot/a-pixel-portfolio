"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Project gallery: masonry grid (original image ratios) + full-screen viewer.
 * Tap an image to open the ORIGINAL uploaded file in high resolution.
 * Close: ✕ button, Esc key, or tap the dark background.
 * Navigate: ← → buttons / arrow keys on desktop, swipe on phones.
 */
export default function ProjectGallery({ images, title }: { images: string[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const touchX = useRef<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLElement | null>(null);

  const count = images.length;
  const isOpen = open !== null;
  const current = open === null ? null : images[open];
  const loaded = current !== null && loadedSrc === current;

  const close = useCallback(() => setOpen(null), []);
  const prev = useCallback(() => setOpen((i) => (i === null ? i : (i - 1 + count) % count)), [count]);
  const next = useCallback(() => setOpen((i) => (i === null ? i : (i + 1) % count)), [count]);

  // Keyboard controls, lock page scroll, focus management.
  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen, close, prev, next]);

  // Preload the next and previous images so swiping feels instant.
  useEffect(() => {
    if (open === null || count < 2) return;
    for (const i of [(open + 1) % count, (open - 1 + count) % count]) {
      const img = new window.Image();
      img.src = images[i];
    }
  }, [open, count, images]);

  return (
    <>
      <section className="mx-auto max-w-[1600px] columns-1 gap-4 px-5 pb-20 pt-8 sm:columns-2 md:gap-6 md:px-10 md:pb-28 lg:columns-3">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={(e) => {
              trigger.current = e.currentTarget;
              setOpen(i);
            }}
            aria-label={`View image ${i + 1} full screen`}
            className="group mb-4 block w-full cursor-zoom-in break-inside-avoid overflow-hidden rounded-2xl bg-white/[0.03] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime md:mb-6"
          >
            <Image
              src={src}
              alt={`${title} — image ${i + 1}`}
              width={0}
              height={0}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          </button>
        ))}
      </section>

      {open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} — image ${open + 1} of ${count}`}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={close}
          onTouchStart={(e) => {
            touchX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 50) (dx > 0 ? prev : next)();
          }}
        >
          {!loaded && (
            <div
              aria-hidden
              className="absolute h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-lime"
            />
          )}

          {/* Plain <img> on purpose: shows the original uploaded file at full resolution. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={images[open]}
            src={images[open]}
            alt={`${title} — image ${open + 1}`}
            ref={(img) => {
              if (img?.complete && img.naturalWidth > 0) setLoadedSrc(img.getAttribute("src"));
            }}
            onLoad={(e) => setLoadedSrc(e.currentTarget.getAttribute("src"))}
            onClick={(e) => e.stopPropagation()}
            className={`max-h-[100svh] max-w-full select-none object-contain transition-opacity duration-300 md:max-h-[90svh] md:max-w-[90vw] ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
          />

          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-4 md:p-6">
            <span className="rounded-full bg-black/50 px-3 py-1 font-mono text-xs text-white/70">
              {String(open + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>
            <button
              ref={closeRef}
              type="button"
              aria-label="Close"
              onClick={(e) => {
                e.stopPropagation();
                close();
              }}
              className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full bg-white/10 text-lg text-white transition-colors hover:bg-lime hover:text-ink"
            >
              ✕
            </button>
          </div>

          {count > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-6 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-xl text-white transition-colors hover:bg-lime hover:text-ink md:grid"
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-6 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-xl text-white transition-colors hover:bg-lime hover:text-ink md:grid"
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
