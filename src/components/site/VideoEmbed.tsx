import { SHAPE_ASPECT, resolveVideo, type ProjectVideo } from "@/lib/media";

/** Inline video player that keeps the video's real shape (16:9 film, 9:16 reel or 1:1). */
export default function VideoEmbed({ video, title }: { video: ProjectVideo; title: string }) {
  const source = resolveVideo(video);
  if (!source) return null;
  const label = video.title ? `${title} — ${video.title}` : `${title} — video`;

  return (
    <figure>
      <div className={`relative overflow-hidden rounded-2xl bg-[#000] ${SHAPE_ASPECT[video.shape]}`}>
        {source.kind === "file" ? (
          <video
            src={`${source.src}#t=0.1`}
            controls
            playsInline
            preload="metadata"
            aria-label={label}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <iframe
            src={source.embedUrl}
            title={label}
            loading="lazy"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 h-full w-full"
          />
        )}
      </div>
      {video.title && <figcaption className="mt-3 text-sm text-white/60">{video.title}</figcaption>}
    </figure>
  );
}
