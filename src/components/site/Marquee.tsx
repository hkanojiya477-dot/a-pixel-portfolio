export default function Marquee({ items }: { items: string[] }) {
  const row = (hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <span key={item} className="flex items-center">
          <span className="px-6 text-5xl font-semibold uppercase tracking-tight text-outline md:px-10 md:text-8xl">
            {item}
          </span>
          <span className="text-3xl text-lime md:text-5xl">✦</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="relative flex overflow-hidden border-y border-white/10 py-8 md:py-12">
      <div className="flex animate-marquee">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
