import { parseVideoUrl } from "@/lib/media";

export default function VideoEmbed({ url, title, poster }: { url: string; title: string; poster?: string | null }) {
  const source = parseVideoUrl(url);
  if (!source) return null;

  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
      {source.kind === "file" ? (
        <video
          src={source.src}
          poster={poster ?? undefined}
          controls
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
      ) : (
        <iframe
          src={source.embedUrl}
          title={`${title} — video`}
          loading="lazy"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full"
        />
      )}
    </div>
  );
}
